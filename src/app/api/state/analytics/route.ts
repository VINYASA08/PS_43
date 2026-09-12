import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import { JHARKHAND_DISTRICTS } from "@/app/dashboard/gov/mockData";
import { getAiConfig } from "@/lib/ai-config";

export async function GET(req: NextRequest) {
  try {
    // Enforce authentication & role authorization
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account not active" }, { status: 403 });
    }
    if (![UserRole.STATE_ADMIN, UserRole.GOV].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized access to state analytics" }, { status: 403 });
    }

    // 1. Fetch live database records in parallel
    const [
      dbChallenges,
      dbProposals,
      dbCommitments,
      dbUniversityUsers,
      dbPendingIndustryCount,
    ] = await Promise.all([
      prisma.challenge.findMany({
        select: {
          id: true,
          title: true,
          domain: true,
          district: true,
          urgency: true,
          status: true,
          nodalStatus: true,
          claimedInstitute: true,
          assignedInstitute: true,
          triageConfidence: true,
          aiConfidence: true,
          createdAt: true,
          slaDeadline: true,
        },
      }),
      prisma.proposal.findMany({
        select: {
          id: true,
          universityName: true,
          status: true,
          budget: true,
          challengeId: true,
        },
      }),
      prisma.fundingCommitment.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
          type: true,
          corporateName: true,
          proposalId: true,
          proposal: {
            select: {
              universityName: true,
              challenge: {
                select: {
                  domain: true,
                  district: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({
        where: { role: UserRole.UNIVERSITY },
      }),
      prisma.user.count({
        where: { role: UserRole.INDUSTRY, status: "PENDING" },
      }),
    ]);

    // 2. Map database challenge distribution
    const dbDistrictCounts: Record<string, number> = {};
    const dbDistrictSlowCounts: Record<string, number> = {};
    const dbDomainCounts: Record<string, number> = {};
    const dbUniversityClaims: Record<string, { count: number; funding: number; handovers: number }> = {};

    let totalConfidenceSum = 0;
    let confidenceCount = 0;
    let misclassifiedCount = 0;

    for (const ch of dbChallenges) {
      const dName = (ch.district || "").trim().toLowerCase();
      dbDistrictCounts[dName] = (dbDistrictCounts[dName] || 0) + 1;

      const domain = ch.domain || "General Infrastructure";
      dbDomainCounts[domain] = (dbDomainCounts[domain] || 0) + 1;

      const conf = ch.triageConfidence || ch.aiConfidence;
      if (conf && typeof conf === "number") {
        totalConfidenceSum += conf > 1 ? conf / 100 : conf;
        confidenceCount++;
        if (conf < 0.80) {
          misclassifiedCount++;
        }
      }

      if (ch.urgency === "CRITICAL" || ch.nodalStatus === "pending") {
        dbDistrictSlowCounts[dName] = (dbDistrictSlowCounts[dName] || 0) + 1;
      }

      const institute = ch.claimedInstitute || ch.assignedInstitute;
      if (institute) {
        if (!dbUniversityClaims[institute]) {
          dbUniversityClaims[institute] = { count: 0, funding: 0, handovers: 0 };
        }
        dbUniversityClaims[institute].count++;
        if (ch.status === "RESOLVED" || ch.status === "CLOSED") {
          dbUniversityClaims[institute].handovers++;
        }
      }
    }

    // 3. Process University Stats from proposals and commitments
    for (const prop of dbProposals) {
      const inst = prop.universityName || "Empanelled Institute";
      if (!dbUniversityClaims[inst]) {
        dbUniversityClaims[inst] = { count: 0, funding: 0, handovers: 0 };
      }
      dbUniversityClaims[inst].count++;
      if (prop.status === "FUNDED" || prop.status === "APPROVED") {
        dbUniversityClaims[inst].funding += prop.budget || 0;
      }
    }

    for (const com of dbCommitments) {
      const inst = com.proposal?.universityName;
      if (inst && dbUniversityClaims[inst]) {
        dbUniversityClaims[inst].funding += com.amount || 0;
      }
    }

    // 4. Synthesize 24-District GIS Heatmap
    const districtHeatmap = JHARKHAND_DISTRICTS.map((district) => {
      const normalizedName = district.name.toLowerCase();
      const matchedDbCount =
        dbDistrictCounts[normalizedName] ||
        dbDistrictCounts[district.id] ||
        0;

      const combinedChallenges = district.complaintsLogged + matchedDbCount;
      const triageHours = Number(district.resolutionSpeedHours.toFixed(1));
      const avgResolutionDays = Number((triageHours * 1.6).toFixed(1));

      let density: "critical" | "high" | "medium" | "low" = "low";
      if (combinedChallenges >= 350) density = "critical";
      else if (combinedChallenges >= 250) density = "high";
      else if (combinedChallenges >= 150) density = "medium";

      return {
        id: district.id,
        name: district.name,
        division: district.division,
        challenges: combinedChallenges,
        density,
        avgResolutionDays,
        triageHours,
        activeBuilds: district.activeBuilds,
        csrDeployedCr: district.csrDeployedCr,
        civicBacklogCount: district.civicBacklogCount,
        complaintsLogged: combinedChallenges,
        complaintsResolved: district.complaintsResolved,
        center: district.center,
        path: district.path,
        nodalOfficer: district.nodalOfficer,
      };
    });

    // 5. Compute Bottlenecks (Districts & Domains)
    // Identify slowest districts based on triage speed
    const sortedBySpeed = [...districtHeatmap].sort((a, b) => b.triageHours - a.triageHours);
    const avgStateTriage =
      districtHeatmap.reduce((acc, d) => acc + d.triageHours, 0) / districtHeatmap.length;

    const slowestDistricts = sortedBySpeed.slice(0, 8);
    const bottlenecks = slowestDistricts.map((d, index) => {
      const domainMap = [
        "Water Supply & Fluoride",
        "Sanitation & Drainage",
        "Rural Road Connectivity",
        "Mining Effluent Treatment",
        "Primary Healthcare Telemetry",
        "Solar Microgrid Dispatch",
        "Agricultural Cold Chain",
        "Urban Municipal Waste",
      ];
      return {
        district: d.name,
        domain: domainMap[index % domainMap.length],
        avgResolutionDays: d.avgResolutionDays,
        triageHours: d.triageHours,
        isSlow: d.triageHours >= avgStateTriage,
        slaStatus: d.triageHours >= 4.0 ? ("BREACHED" as const) : ("WARNING" as const),
      };
    });

    const domainBottlenecks = [
      { domain: "Water Management", avgResolutionDays: 14.8, triageHours: 4.2, challengeCount: 412 },
      { domain: "Agriculture & Cold Chain", avgResolutionDays: 12.4, triageHours: 3.9, challengeCount: 298 },
      { domain: "Healthcare Delivery", avgResolutionDays: 9.6, triageHours: 3.4, challengeCount: 210 },
      { domain: "Renewable Energy", avgResolutionDays: 8.2, triageHours: 3.1, challengeCount: 185 },
      { domain: "Urban Infrastructure", avgResolutionDays: 6.8, triageHours: 2.8, challengeCount: 143 },
    ];

    // 6. University Leaderboard
    const canonicalUniversities = [
      { name: "BIT Mesra", baseClaimed: 24, baseFunding: 4500000, baseHandovers: 18 },
      { name: "IIT (ISM) Dhanbad", baseClaimed: 21, baseFunding: 5200000, baseHandovers: 15 },
      { name: "NIT Jamshedpur", baseClaimed: 18, baseFunding: 3800000, baseHandovers: 12 },
      { name: "Birsa Agricultural University", baseClaimed: 16, baseFunding: 3100000, baseHandovers: 11 },
      { name: "Central University of Jharkhand", baseClaimed: 12, baseFunding: 2400000, baseHandovers: 8 },
      { name: "RIMS Ranchi", baseClaimed: 9, baseFunding: 1900000, baseHandovers: 6 },
    ];

    const universityLeaderboard = canonicalUniversities.map((uni, idx) => {
      const live = dbUniversityClaims[uni.name] || { count: 0, funding: 0, handovers: 0 };
      const claimed = uni.baseClaimed + live.count;
      const fundingSecured = uni.baseFunding + live.funding;
      const successfulHandovers = uni.baseHandovers + live.handovers;
      const graiScore = Number(
        Math.min(99.4, 85 + (claimed * 0.3) + (successfulHandovers * 0.4)).toFixed(1)
      );

      return {
        rank: idx + 1,
        name: uni.name,
        claimed,
        fundingSecured,
        successfulHandovers,
        graiScore,
      };
    }).sort((a, b) => b.fundingSecured - a.fundingSecured).map((u, i) => ({ ...u, rank: i + 1 }));

    // 7. Financial Escrow across Domains
    let livePledged = 0;
    let liveDisbursed = 0;
    for (const c of dbCommitments) {
      livePledged += c.amount || 0;
      if (c.status === "DISBURSED") {
        liveDisbursed += c.amount || 0;
      }
    }

    const financialEscrow = [
      { domain: "Healthcare", pledged: 6000000 + Math.round(livePledged * 0.3), escrowed: 3500000, disbursed: 2500000 + Math.round(liveDisbursed * 0.3) },
      { domain: "Education", pledged: 4500000 + Math.round(livePledged * 0.2), escrowed: 2200000, disbursed: 2300000 + Math.round(liveDisbursed * 0.2) },
      { domain: "Sanitation", pledged: 3800000 + Math.round(livePledged * 0.2), escrowed: 1800000, disbursed: 2000000 + Math.round(liveDisbursed * 0.2) },
      { domain: "Roads & Infra", pledged: 4200000 + Math.round(livePledged * 0.3), escrowed: 1800000, disbursed: 2400000 + Math.round(liveDisbursed * 0.3) },
    ];

    const totalCsrPledged = financialEscrow.reduce((acc, f) => acc + f.pledged, 0);
    const totalCsrDisbursed = financialEscrow.reduce((acc, f) => acc + f.disbursed, 0);
    const escrowBalance = totalCsrPledged - totalCsrDisbursed;

    // 8. AI Oversight
    const aiConfig = getAiConfig();
    const calculatedAccuracy = confidenceCount > 0
      ? Number(((totalConfidenceSum / confidenceCount) * 100).toFixed(1))
      : 94.6;

    const totalClassified = Math.max(1280, dbChallenges.length * 5);
    const misclassified = Math.max(69, misclassifiedCount);

    const aiOversight = {
      accuracy: calculatedAccuracy,
      threshold: aiConfig.confidenceThreshold,
      totalClassified,
      misclassified,
      providerBreakdown: {
        gemini: Math.round(totalClassified * 0.62),
        openai: Math.round(totalClassified * 0.26),
        heuristic: Math.round(totalClassified * 0.12),
      },
    };

    // 9. Master Summary Metrics
    const totalChallengesCount = districtHeatmap.reduce((acc, d) => acc + d.challenges, 0);

    const summary = {
      totalChallenges: totalChallengesCount,
      activeBottlenecks: bottlenecks.filter((b) => b.isSlow).length,
      totalCsrPledged,
      totalCsrDisbursed,
      escrowBalance,
      activeUniversities: Math.max(14, dbUniversityUsers || canonicalUniversities.length),
      aiRoutingAccuracy: calculatedAccuracy,
      districtsMonitored: 24,
      pendingIndustryApprovals: dbPendingIndustryCount,
    };

    const financialTrend = [
      { month: "Apr 2026", pledged: 3.5, disbursed: 1.8 },
      { month: "May 2026", pledged: 6.8, disbursed: 3.2 },
      { month: "Jun 2026", pledged: 11.4, disbursed: 5.6 },
      { month: "Jul 2026", pledged: 15.2, disbursed: 7.4 },
      { month: "Aug 2026", pledged: 18.5, disbursed: 9.2 },
    ];

    return NextResponse.json({
      success: true,
      summary,
      districtHeatmap,
      bottlenecks,
      universityLeaderboard,
      financialEscrow,
      aiOversight,
      // Convenience aliases
      statewideKpis: summary,
      districtBottlenecks: bottlenecks,
      domainBottlenecks,
      financialTrend,
    });
  } catch (error) {
    console.error("[State Analytics Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate state analytics." },
      { status: 500 }
    );
  }
}
