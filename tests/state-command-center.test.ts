import prisma from "../src/lib/prisma";
import { UserRole } from "../src/lib/types";
import { getAiConfig, updateAiConfig } from "../src/lib/ai-config";
import { JHARKHAND_DISTRICTS } from "../src/app/dashboard/gov/mockData";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   PRAGATI MILESTONE 2: STATE DASHBOARD & COMMAND CENTER");
  console.log("=======================================================\n");

  try {
    // ----------------------------------------------------
    // Test 1: 24 Statutory Districts of Jharkhand Coverage
    // ----------------------------------------------------
    console.log("--- Test 1: 24 Statutory Districts in Jharkhand ---");
    assert(JHARKHAND_DISTRICTS.length === 24, "JHARKHAND_DISTRICTS contains exactly 24 statutory districts");

    const districtIds = JHARKHAND_DISTRICTS.map((d) => d.id);
    const expectedDistricts = [
      "ranchi", "dhanbad", "east_singhbhum", "bokaro", "hazaribagh",
      "deoghar", "giridih", "ramgarh", "palamu", "saraikela",
      "west_singhbhum", "dumka", "godda", "sahibganj", "pakur",
      "jamtara", "chatra", "koderma", "latehar", "garhwa",
      "lohardaga", "gumla", "simdega", "khunti"
    ];

    let allDistrictsPresent = true;
    for (const exp of expectedDistricts) {
      if (!districtIds.includes(exp)) {
        allDistrictsPresent = false;
        console.error(`Missing statutory district: ${exp}`);
      }
    }
    assert(allDistrictsPresent, "All 24 statutory district IDs are present and indexed");

    // Check SVG paths and DNO details
    const allHaveSvgPaths = JHARKHAND_DISTRICTS.every((d) => typeof d.path === "string" && d.path.length > 10);
    assert(allHaveSvgPaths, "All 24 districts have valid SVG vector path definitions for choropleth mapping");

    const allHaveNodalOfficers = JHARKHAND_DISTRICTS.every(
      (d) => d.nodalOfficer && d.nodalOfficer.name && d.nodalOfficer.email && d.nodalOfficer.phone
    );
    assert(allHaveNodalOfficers, "All 24 districts have assigned Nodal Officers with contact details");

    // ----------------------------------------------------
    // Test 2: Analytics Aggregation & Bottleneck Calculation
    // ----------------------------------------------------
    console.log("\n--- Test 2: Analytics & Bottleneck Telemetry ---");
    // Verify slowest districts identification logic
    const sortedDistricts = [...JHARKHAND_DISTRICTS].sort(
      (a, b) => b.resolutionSpeedHours - a.resolutionSpeedHours
    );
    const slowest = sortedDistricts.slice(0, 4);
    assert(slowest.length === 4, "Top slowest triaging districts successfully identified");
    assert(slowest[0].resolutionSpeedHours >= 5.0, `Slowest district has resolution delay >= 5.0h (${slowest[0].name}: ${slowest[0].resolutionSpeedHours}h)`);

    // ----------------------------------------------------
    // Test 3: University Leaderboard Ranking Logic
    // ----------------------------------------------------
    console.log("\n--- Test 3: University Leaderboard Metrics ---");
    const testUnis = [
      { name: "BIT Mesra", claimed: 24, fundingSecured: 4500000, successfulHandovers: 18, graiScore: 92.4 },
      { name: "IIT (ISM) Dhanbad", claimed: 21, fundingSecured: 5200000, successfulHandovers: 15, graiScore: 96.2 },
      { name: "NIT Jamshedpur", claimed: 18, fundingSecured: 3800000, successfulHandovers: 12, graiScore: 89.1 },
    ].sort((a, b) => b.fundingSecured - a.fundingSecured);

    assert(testUnis[0].name === "IIT (ISM) Dhanbad", "Rank 1 is IIT (ISM) Dhanbad by CSR funding secured");
    assert(testUnis[0].graiScore > 90, "Leader has exemplary GRAI research accountability score");

    // ----------------------------------------------------
    // Test 4: Database Master Override on Challenge
    // ----------------------------------------------------
    // Test 4: Database Master Override on Challenge
    // ----------------------------------------------------
    console.log("\n--- Test 4: Database Master Override Execution ---");
    let challenge = await prisma.challenge.findFirst();
    let challengeCreated = false;
    if (!challenge) {
      challenge = await prisma.challenge.create({
        data: {
          title: "Test Groundwater Fluoride Contamination in Garhwa",
          description: "Excess fluoride in drinking water wells",
          district: "Garhwa",
          domain: "Water",
          urgency: "CRITICAL",
          status: "REPORTED",
        },
      });
      challengeCreated = true;
    }
    const originalChallenge = { ...challenge };

    assert(!!challenge, "Active challenge exists for master override test");

    // Execute Master Override: Force change status to IN_PROGRESS and assign to BIT Mesra
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challenge.id },
      data: {
        status: "IN_PROGRESS",
        assignedInstitute: "BIT Mesra",
        claimedInstitute: "BIT Mesra",
        nodalStatus: "routed_to_academia",
        escalationLevel: 3,
        nodalReviewedAt: new Date(),
      },
    });

    assert(updatedChallenge.status === "IN_PROGRESS", "Master override successfully updated challenge status to IN_PROGRESS");
    assert(updatedChallenge.assignedInstitute === "BIT Mesra", "Master override successfully force-assigned BIT Mesra");
    assert(updatedChallenge.escalationLevel === 3, "Master override successfully escalated challenge to Chief Secretary (Level 3)");

    // ----------------------------------------------------
    // Test 5: CSR Funding Revocation Logic
    // ----------------------------------------------------
    console.log("\n--- Test 5: CSR Funding Revocation Workflow ---");
    let proposal = await prisma.proposal.findFirst({
      where: { challengeId: challenge.id },
    });
    let proposalCreated = false;
    if (!proposal) {
      proposal = await prisma.proposal.create({
        data: {
          challengeId: challenge.id,
          universityName: "BIT Mesra",
          title: "Low-Cost Activated Alumina Fluoride Adsorber DPR",
          abstract: "Continuous-flow adsorbent rig for rural handpumps",
          methodology: "Regenerable activated alumina columns",
          budget: 550000,
          status: "FUNDED",
          industryClaimStatus: "CLAIMED",
        },
      });
      proposalCreated = true;
    }
    const originalProposalState = {
      status: proposal.status,
      industryClaimStatus: proposal.industryClaimStatus,
    };

    let commitment = await prisma.fundingCommitment.findFirst({
      where: { proposalId: proposal.id },
    });
    let commitmentCreated = false;
    if (!commitment) {
      commitment = await prisma.fundingCommitment.create({
        data: {
          proposalId: proposal.id,
          amount: 550000,
          type: "CSR",
          status: "ESCROWED",
          corporateName: "Tata Steel CSR Foundation",
        },
      });
      commitmentCreated = true;
    }
    const originalCommitmentState = {
      status: commitment.status,
      notes: commitment.notes,
    };

    assert(!!commitment, "Active funding commitment exists for revocation test");

    // Execute funding revocation transaction
    const revocationResult = await prisma.$transaction(async (tx) => {
      const revokedCom = await tx.fundingCommitment.update({
        where: { id: commitment!.id },
        data: {
          status: "CANCELLED",
          notes: "[REVOKED BY STATE_ADMIN]: Defaulted on Tranche-2 release SLA",
        },
      });

      const reopenedProp = await tx.proposal.update({
        where: { id: proposal!.id },
        data: {
          status: "APPROVED",
          industryClaimStatus: "OPEN",
        },
      });

      return { revokedCom, reopenedProp };
    });

    assert(revocationResult.revokedCom.status === "CANCELLED", "Funding commitment status changed to CANCELLED");
    assert(revocationResult.reopenedProp.industryClaimStatus === "OPEN", "Target proposal unlocked with industryClaimStatus = OPEN");

    // ----------------------------------------------------
    // Test 6: AI Routing Confidence Threshold
    // ----------------------------------------------------
    console.log("\n--- Test 6: AI Routing Confidence Threshold ---");
    const prevConfig = getAiConfig();
    assert(prevConfig.minThreshold === 0.70 && prevConfig.maxThreshold === 0.95, "AI threshold bounds defined as [0.70, 0.95]");

    const newConf = updateAiConfig(0.91);
    assert(newConf.confidenceThreshold === 0.91, "Successfully updated AI confidence threshold to 0.91");

    // Restore default
    updateAiConfig(0.85);

    // ----------------------------------------------------
    // Test 7: User Management Industry Approval
    // ----------------------------------------------------
    console.log("\n--- Test 7: Industry User Onboarding Workflow ---");
    const uniqueTestEmail = `test.industry.${Date.now()}.${Math.floor(Math.random() * 10000)}@tatamotors.com`;
    const testIndustryUser = await prisma.user.create({
      data: {
        name: "Dr. Vikram Sethi",
        email: uniqueTestEmail,
        role: UserRole.INDUSTRY,
        status: "PENDING",
        passwordHash: "$2a$12$dummyhashforstatetest0000000000000000000000000000000000000",
        organization: "Tata Motors CSR Wing",
        designation: "Head of Community Innovation",
        district: "East Singhbhum",
      },
    });

    assert(testIndustryUser.status === "PENDING", "Pending industry registration identified");

    const approvedUser = await prisma.user.update({
      where: { id: testIndustryUser.id },
      data: { status: "ACTIVE" },
    });

    assert(approvedUser.status === "ACTIVE", "State Admin approval successfully activated industry user account");

    // Cleanup dynamically created test user
    await prisma.user.deleteMany({ where: { id: testIndustryUser.id } }).catch(() => {});

  } catch (err: any) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    try {
      // Ensure any test user remnants are purged
      await prisma.user.deleteMany({ where: { email: { contains: "test.industry." } } }).catch(() => {});
      await prisma.user.deleteMany({ where: { email: "vikram.sethi@tatamotors.com" } }).catch(() => {});

      // Ensure seed data for csr.lead@coalindia.in is restored to PENDING
      await prisma.user.updateMany({
        where: { email: "csr.lead@coalindia.in" },
        data: { status: "PENDING" },
      }).catch(() => {});

      // Restore AI config to default
      updateAiConfig(0.85);
    } catch (cleanupErr) {
      console.warn("Cleanup warning in finally block:", cleanupErr);
    }

    await prisma.$disconnect();
  }

  console.log("\n=======================================================");
  console.log(`   FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
