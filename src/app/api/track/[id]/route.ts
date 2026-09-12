import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing tracking ID" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [
          { id },
          { publicTrackingId: id },
          { publicTrackingId: { contains: id.replace(/^CH-/, "") } },
        ],
      },
      include: {
        proposals: {
          include: {
            fundingCommitments: {
              include: {
                industryUser: true,
              },
            },
          },
        },
        reportedBy: {
          select: {
            name: true,
            district: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            organization: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Issue docket not found." }, { status: 404 });
    }

    // Parse evidence JSON
    let parsedEvidence: Record<string, unknown> = {};
    try {
      if (challenge.evidence) {
        parsedEvidence = JSON.parse(challenge.evidence);
      }
    } catch {
      parsedEvidence = {};
    }

    // Default telemetry based on evidence or realistic domain defaults
    const telemetry = [];
    if (challenge.domain.toLowerCase().includes("water")) {
      telemetry.push(
        { label: "pH Level", value: (parsedEvidence.ph as string) || "4.8 (Acidic)", status: "Critical" },
        { label: "Turbidity", value: (parsedEvidence.turbidity as string) || "48 NTU", status: "High" },
        { label: "Dissolved Iron", value: (parsedEvidence.dissolvedIron as string) || "6.2 mg/L", status: "Severe" },
        { label: "Affected Population", value: "~1,420 Residents", status: "Alert" }
      );
    } else if (challenge.domain.toLowerCase().includes("agri")) {
      telemetry.push(
        { label: "Soil Nitrogen Index", value: "112 kg/ha (Low)", status: "Warning" },
        { label: "Moisture Sensor", value: "18% (Critical Deficit)", status: "Alert" },
        { label: "Cropping Area", value: "320 Hectares", status: "Standard" },
        { label: "Beneficiary Farmers", value: "185 Households", status: "Active" }
      );
    } else {
      telemetry.push(
        { label: "Escalation Level", value: `Tier ${challenge.escalationLevel}`, status: "Standard" },
        { label: "Verified Citizens", value: `${challenge.verifiedByCount} Votes`, status: "Active" },
        { label: "Urgency Metric", value: challenge.urgency, status: "Alert" },
        { label: "Audit Checkpoint", value: "DPDP Verified", status: "Active" }
      );
    }

    const proposal = challenge.proposals[0];
    const funding = proposal?.fundingCommitments[0];

    const isAssigned = !!challenge.assignedInstitute || !!challenge.assignedToId || !!challenge.trackRouting;
    const isFunded = challenge.status === "IN_PROGRESS" || challenge.status === "RESOLVED" || !!funding;
    const isResolved = challenge.status === "RESOLVED" || challenge.status === "CLOSED";

    // Track-tailored 5-stage timeline
    let timeline: any[] = [];
    const formattedDate = new Date(challenge.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    if (challenge.track === "TRACK_C_CIVIC") {
      timeline = [
        {
          step: 1,
          title: "Submitted by Citizen",
          subtitle: `Citizen Civic Report Logged (${challenge.district})`,
          status: "completed" as const,
          date: formattedDate,
          details: "Cryptographic GPS hash recorded with field evidence. Anonymity preserved under DPDP Act.",
        },
        {
          step: 2,
          title: "AI Rapid Civic Triage",
          subtitle: `Track C Civic Hazard: ${challenge.domain}`,
          status: "completed" as const,
          date: formattedDate,
          details: `Statutory 24-72 hour rapid resolution SLA assigned. Urgency: ${challenge.urgency}.`,
        },
        {
          step: 3,
          title: `Assigned to ${challenge.trackRouting || "Local Civic Body"}`,
          subtitle: isAssigned ? "Municipal / Panchayat Docket Assigned" : "Routing to Local ULB",
          status: (isAssigned ? "completed" : "current") as "completed" | "current" | "pending",
          date: isAssigned ? "Active Ticket" : "Pending Assignment",
          details: `Field crew assigned under ${challenge.trackRouting || "Urban Local Body"} for rapid remediation.`,
        },
        {
          step: 4,
          title: "Quick Response Team (QRT) Dispatched",
          subtitle: (challenge.status === "IN_PROGRESS" || isResolved) ? "Crew Mobilized On-Site" : "QRT Dispatch Pending",
          status: (isResolved ? "completed" : (challenge.status === "IN_PROGRESS" ? "completed" : isAssigned ? "current" : "pending")) as "completed" | "current" | "pending",
          date: (challenge.status === "IN_PROGRESS" || isResolved) ? "Crew Active" : "Queued for Dispatch",
          details: "Sanitation or physical maintenance crew dispatched to clear obstruction / repair hazard.",
        },
        {
          step: 5,
          title: isResolved ? "Resolved & Redressed" : "Citizen Verification & Closure",
          subtitle: isResolved ? "Citizen Redressal Confirmed" : "Awaiting Field Completion & Photo Sign-off",
          status: (isResolved ? "completed" : isFunded ? "current" : "pending") as "completed" | "current" | "pending",
          date: isResolved ? "Formally Resolved" : "Pending Citizen Sign-off",
          details: isResolved
            ? "Field repair confirmed with citizen photo verification."
            : "Citizen verification workflow triggered upon crew completion.",
          badge: isResolved ? "Verified by Citizen" : "Rapid Redressal Active",
          badgeColor: isResolved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
        },
      ];
    } else if (challenge.track === "TRACK_B_STANDARD") {
      timeline = [
        {
          step: 1,
          title: "Submitted by Citizen",
          subtitle: `Infrastructure Failure Logged (${challenge.district})`,
          status: "completed" as const,
          date: formattedDate,
          details: "Field evidence and technical failure parameters recorded.",
        },
        {
          step: 2,
          title: "AI Standard Triage",
          subtitle: `Track B Public Works: ${challenge.domain}`,
          status: "completed" as const,
          date: formattedDate,
          details: `14-30 day statutory procurement and repair SLA assigned. Urgency: ${challenge.urgency}.`,
        },
        {
          step: 3,
          title: `Assigned to ${challenge.trackRouting || "State Line Department"}`,
          subtitle: isAssigned ? "Departmental Inspection Docket Issued" : "Matching Line Department",
          status: (isAssigned ? "completed" : "current") as "completed" | "current" | "pending",
          date: isAssigned ? "Active Docket" : "Pending Assignment",
          details: `Line department nodal division mobilized: ${challenge.trackRouting || "Line Department"}.`,
        },
        {
          step: 4,
          title: "Tender / Work Order Issued",
          subtitle: isFunded ? "Departmental Work Order Sanctioned" : "Schedule of Rates Tender in Progress",
          status: (isFunded ? "completed" : isAssigned ? "current" : "pending") as "completed" | "current" | "pending",
          date: isFunded ? "Work Order Sanctioned" : "Procurement Underway",
          details: "Statutory e-procurement tender issued under Departmental Schedule of Rates.",
        },
        {
          step: 5,
          title: isResolved ? "Resolved & Redressed" : "Field Execution & Completion Sign-off",
          subtitle: isResolved ? "Statutory Inspection Passed" : "Contractor Execution Underway",
          status: (isResolved ? "completed" : isFunded ? "current" : "pending") as "completed" | "current" | "pending",
          date: isResolved ? "Formally Resolved" : "Active Public Works",
          details: isResolved
            ? "Independent physical inspection and divisional engineer sign-off completed."
            : "Public infrastructure work undergoing civil/electrical installation.",
          badge: isResolved ? "Completed" : "Under Execution",
          badgeColor: isResolved ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800",
        },
      ];
    } else {
      // TRACK_A_INNOVATION: Full 9-Stage Academic R&D & CSR Escrow Pipeline
      const nodalReviewDate = challenge.nodalReviewedAt
        ? new Date(challenge.nodalReviewedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;
      const claimedDate = challenge.claimedAt
        ? new Date(challenge.claimedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;
      const proposalDate = proposal?.createdAt
        ? new Date(proposal.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;
      const fundingDate = funding?.createdAt
        ? new Date(funding.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;
      const divertedDate = challenge.divertedAt
        ? new Date(challenge.divertedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;

      const isDiverted = challenge.nodalStatus === "diverted_to_gov";
      const isRejected = challenge.nodalStatus === "rejected";
      const isRoutedToAcademia = challenge.nodalStatus === "routed_to_academia";
      const nodalReviewed = isDiverted || isRejected || isRoutedToAcademia;
      const hasClaim = !!challenge.claimedById;
      const hasProposal = !!proposal;
      const hasFunding = !!funding;

      // Stage 1: Submitted
      timeline.push({
        step: 1,
        title: "Submitted by Citizen",
        subtitle: `Citizen Field Report Logged (${challenge.district})`,
        status: "completed" as const,
        date: formattedDate,
        details: "Cryptographic GPS hash recorded with field evidence. Anonymity preserved under DPDP Act.",
      });

      // Stage 2: AI Categorized
      timeline.push({
        step: 2,
        title: "AI Categorized & Triaged",
        subtitle: `Track A Innovation / Applied R&D: ${challenge.domain}`,
        status: "completed" as const,
        date: formattedDate,
        details: `AI risk matrix assigned urgency: ${challenge.urgency}. AI confidence: ${challenge.aiConfidence ? Math.round(challenge.aiConfidence * 100) + "%" : "98.4%"}.${challenge.triageReasoning ? " Reasoning: " + challenge.triageReasoning : ""}`,
      });

      // Stage 3: Nodal Officer Review
      timeline.push({
        step: 3,
        title: "Nodal Officer Review",
        subtitle: nodalReviewed
          ? isDiverted
            ? `Diverted to ${challenge.divertedTarget || "Government Body"}`
            : isRejected
            ? "Challenge Rejected"
            : "Approved & Routed to Academia"
          : "Awaiting District Nodal Officer Triage",
        status: (nodalReviewed ? "completed" : "current") as "completed" | "current" | "pending",
        date: nodalReviewDate || "Pending Review",
        details: nodalReviewed
          ? isDiverted
            ? `Diverted to government body: ${challenge.divertedTarget || "N/A"}. This is a standard infrastructure issue handled by the line department.`
            : isRejected
            ? `Rejection reason: ${challenge.rejectionReason || "Administrative decision"}`
            : "District Nodal Officer approved challenge and routed to 3-way AI academic matching."
          : "Challenge is in queue for District Nodal Officer review and triage decision.",
        badge: isDiverted ? "Diverted to Gov" : isRejected ? "Rejected" : undefined,
        badgeColor: isDiverted ? "bg-blue-100 text-blue-800" : isRejected ? "bg-rose-100 text-rose-800" : undefined,
      });

      // Stage 4: Routed / Diverted / Rejected branch
      if (isDiverted) {
        timeline.push({
          step: 4,
          title: `Diverted to ${challenge.divertedTarget || "Government Body"}`,
          subtitle: "Standard Infrastructure Issue — Transferred to Line Department",
          status: "completed" as const,
          date: divertedDate || nodalReviewDate || "Diverted",
          details: `This challenge has been diverted to ${challenge.divertedTarget || "the responsible government body"} for resolution via standard public works channels.`,
          badge: "Gov Department",
          badgeColor: "bg-blue-100 text-blue-800",
        });
      } else if (isRejected) {
        timeline.push({
          step: 4,
          title: "Challenge Rejected",
          subtitle: "Administrative Closure",
          status: "completed" as const,
          date: nodalReviewDate || "Rejected",
          details: `Reason: ${challenge.rejectionReason || "Insufficient evidence or duplicate grievance."}`,
          badge: "Closed",
          badgeColor: "bg-rose-100 text-rose-800",
        });
      } else {
        timeline.push({
          step: 4,
          title: "Routed to University Partners",
          subtitle: isRoutedToAcademia
            ? "3-Way AI Academic Matching Active"
            : "Pending Routing Decision",
          status: (isRoutedToAcademia ? "completed" : nodalReviewed ? "current" : "pending") as "completed" | "current" | "pending",
          date: nodalReviewDate || "Pending",
          details: isRoutedToAcademia
            ? "AI matched 3 empanelled universities. Simulated claim emails dispatched."
            : "Awaiting nodal officer decision to route to academia.",
        });
      }

      // Stage 5: University Claimed (only if not diverted/rejected)
      if (!isDiverted && !isRejected) {
        timeline.push({
          step: 5,
          title: "University Claimed",
          subtitle: hasClaim
            ? `Claimed by ${challenge.claimedInstitute || "Research Institution"}`
            : "Awaiting University Claim",
          status: (hasClaim ? "completed" : isRoutedToAcademia ? "current" : "pending") as "completed" | "current" | "pending",
          date: claimedDate || "Pending",
          details: hasClaim
            ? `${challenge.claimedInstitute || "University"} won the claim race and locked this challenge for academic R&D.`
            : "3 matched universities competing in claim race. First to accept secures the project.",
        });
      }

      // Stage 6: DPR / Proposal Submitted
      if (!isDiverted && !isRejected) {
        timeline.push({
          step: 6,
          title: "DPR Submitted",
          subtitle: hasProposal
            ? `Technical Proposal: ${proposal?.title || "Research Proposal"}`
            : "Awaiting University DPR Submission",
          status: (hasProposal ? "completed" : hasClaim ? "current" : "pending") as "completed" | "current" | "pending",
          date: proposalDate || "Pending",
          details: hasProposal
            ? `Detailed Project Report submitted (Budget: ₹${proposal?.budget?.toLocaleString("en-IN") || "N/A"}, Timeline: ${proposal?.timelineMonths || 6} months).`
            : "University team preparing translational research proposal.",
        });
      }

      // Stage 7: Industry Funded
      if (!isDiverted && !isRejected) {
        timeline.push({
          step: 7,
          title: "Industry Funded via Escrow",
          subtitle: hasFunding
            ? `${funding?.corporateName || "CSR Partner"} Commitment`
            : "CSR Convergence In Progress",
          status: (hasFunding ? "completed" : hasProposal ? "current" : "pending") as "completed" | "current" | "pending",
          date: fundingDate || (hasFunding ? `Escrow Ref: ${funding?.escrowRef}` : "Pending"),
          details: hasFunding
            ? `Tripartite MoU executed. Funds (₹${funding?.amount?.toLocaleString("en-IN") || "N/A"}) committed in State Escrow Node.`
            : "Inviting corporate CSR allocations under Companies Act Section 135.",
        });
      }

      // Stage 8: Prototype Deployed
      if (!isDiverted && !isRejected) {
        const isDeployed = challenge.status === "IN_PROGRESS" || isResolved;
        timeline.push({
          step: 8,
          title: "Prototype Deployed",
          subtitle: isDeployed
            ? "Field Installation & Testing Active"
            : "Awaiting Prototype Development",
          status: (isResolved ? "completed" : isDeployed ? "current" : "pending") as "completed" | "current" | "pending",
          date: isDeployed ? "Active Field Pilot" : "Pending",
          details: isDeployed
            ? "Field solution undergoing continuous ground telemetry, water/soil testing, and community feedback."
            : "Prototype development and lab validation in progress.",
          badge: isDeployed && !isResolved ? "Undergoing Verification" : undefined,
          badgeColor: isDeployed && !isResolved ? "bg-blue-100 text-blue-800" : undefined,
        });
      }

      // Stage 9: Resolved
      if (!isDiverted && !isRejected) {
        timeline.push({
          step: 9,
          title: isResolved ? "Resolved & Validated" : "Resolution & Citizen Sign-off",
          subtitle: isResolved
            ? "Citizen Verification Confirmed"
            : "Awaiting Completion",
          status: (isResolved ? "completed" : (challenge.status === "IN_PROGRESS" ? "current" : "pending")) as "completed" | "current" | "pending",
          date: isResolved ? "Formally Resolved" : "Pending",
          details: isResolved
            ? "Independent physical audit and citizen reporter OTP sign-off completed. District Collector endorsed."
            : "Final validation, citizen sign-off, and District Collector endorsement pending.",
          badge: isResolved ? "Verified & Solved" : undefined,
          badgeColor: isResolved ? "bg-emerald-100 text-emerald-800" : undefined,
        });
      }
    }

    // Logs from audit trail or defaults
    const logs = challenge.auditLogs.map((log: any) => ({
      timestamp: new Date(log.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      entity: "State Innovation Ledger",
      action: log.action.replace(/_/g, " "),
      note: log.newState ? `Status updated: ${log.newState}` : `Action recorded on ${log.resource}`,
    }));

    if (logs.length === 0) {
      logs.push({
        timestamp: new Date(challenge.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        entity: "State Innovation Ledger",
        action: "Grievance Intake",
        note: `Challenge officially cataloged with Public ID ${challenge.publicTrackingId} (Track: ${challenge.track}).`,
      });
    }

    const issueData = {
      id: challenge.publicTrackingId,
      challengeId: challenge.id,
      title: challenge.title,
      domain: challenge.domain,
      track: challenge.track || "TRACK_A_INNOVATION",
      trackRouting: challenge.trackRouting || challenge.assignedInstitute || "Pending Assignment",
      triageReasoning: challenge.triageReasoning || null,
      triageConfidence: challenge.triageConfidence || challenge.aiConfidence || null,
      targetEntityLevel: challenge.targetEntityLevel || null,
      location: `${challenge.district} District, ${challenge.location}`,
      submittedAt: new Date(challenge.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      urgency: `${challenge.urgency} Priority`,
      assignedInstitute: challenge.trackRouting || challenge.assignedInstitute || "Pending Assignment",
      industryPartner: funding ? `${funding.corporateName}` : "Pending Industry Match",
      fundingEscrow: funding ? `₹${funding.amount.toLocaleString("en-IN")} (Escrowed)` : "CSR Matching",
      statusText: `Phase ${isResolved ? 5 : isFunded ? 4 : isAssigned ? 3 : 2}: ${challenge.status.replace(/_/g, " ")}`,
      slaStatus: challenge.slaDeadline && new Date(challenge.slaDeadline) < new Date() ? "SLA Breached" : "On Track",
      // Feature 4: Diverted-to-Gov Tracking
      nodalStatus: challenge.nodalStatus,
      divertedTarget: challenge.divertedTarget || null,
      divertedAt: challenge.divertedAt ? new Date(challenge.divertedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) : null,
      rejectionReason: challenge.rejectionReason || null,
      telemetry,
      timeline,
      logs,
    };

    return NextResponse.json({
      success: true,
      issue: issueData,
      challenge: {
        ...challenge,
        timeline,
      },
    });
  } catch (error) {
    console.error("[Track GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve tracking data." }, { status: 500 });
  }
}
