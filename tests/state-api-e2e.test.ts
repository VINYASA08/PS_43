import prisma from "../src/lib/prisma";
import { UserRole, UserStatus } from "../src/lib/types";
import { signSessionToken } from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { getAiConfig, updateAiConfig } from "../src/lib/ai-config";
import { NextRequest } from "next/server";
import { GET as getAnalytics } from "../src/app/api/state/analytics/route";
import { POST as overrideChallenge } from "../src/app/api/state/override/challenge/route";
import { POST as revokeFunding } from "../src/app/api/state/override/revoke-funding/route";
import { GET as getAiConfigRoute, POST as postAiConfigRoute } from "../src/app/api/state/ai-config/route";
import { GET as getPendingUsers } from "../src/app/api/admin/pending-users/route";
import { POST as approveUser } from "../src/app/api/admin/approve-user/route";

async function runE2eTests() {
  console.log("=== RUNNING STATE API E2E HANDLER TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // Look up existing state admin or use fallback
  const dbStateAdmin = await prisma.user.findFirst({
    where: { role: UserRole.STATE_ADMIN, status: "ACTIVE" },
  });

  const stateAdminSession = {
    userId: dbStateAdmin ? dbStateAdmin.id : "state-admin-e2e",
    name: dbStateAdmin ? dbStateAdmin.name : "Chief Secretary",
    email: dbStateAdmin ? dbStateAdmin.email : "chief.secretary@jharkhand.gov.in",
    role: UserRole.STATE_ADMIN,
    tier: "STATE",
    status: UserStatus.ACTIVE,
  };
  const token = await signSessionToken(stateAdminSession);
  const csrfToken = generateCsrfToken();
  const cookieHeader = `sih_session=${token}; sih_csrf=${csrfToken}`;

  const initialAiThreshold = getAiConfig().confidenceThreshold;

  // Track original entities to restore
  let testChallenge: any = null;
  let originalChallengeState: any = null;
  let testCommitment: any = null;
  let originalCommitmentState: any = null;
  let associatedProposal: any = null;
  let originalProposalState: any = null;

  try {
    // 1. Test GET /api/state/analytics
    const analyticsReq = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: cookieHeader },
    });
    const analyticsRes = await getAnalytics(analyticsReq);
    const analyticsData = await analyticsRes.json();

    assert(analyticsRes.status === 200, "GET /api/state/analytics returns 200 OK");
    assert(analyticsData.summary !== undefined, "Analytics returns summary metrics");
    assert(analyticsData.summary.districtsMonitored === 24, "Summary monitors all 24 districts");
    assert(Array.isArray(analyticsData.districtHeatmap) && analyticsData.districtHeatmap.length === 24, "districtHeatmap contains all 24 districts");
    assert(Array.isArray(analyticsData.bottlenecks) && analyticsData.bottlenecks.length > 0, "bottlenecks array populated");
    assert(Array.isArray(analyticsData.universityLeaderboard) && analyticsData.universityLeaderboard.length > 0, "universityLeaderboard populated");
    assert(Array.isArray(analyticsData.financialEscrow) && analyticsData.financialEscrow.length > 0, "financialEscrow domain breakdown populated");
    assert(analyticsData.aiOversight && typeof analyticsData.aiOversight.threshold === "number", "aiOversight contains threshold");

    // 2. Test GET and POST /api/state/ai-config
    const aiGetReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
      headers: { cookie: cookieHeader },
    });
    const aiGetRes = await getAiConfigRoute(aiGetReq);
    const aiGetData = await aiGetRes.json();
    assert(aiGetRes.status === 200, "GET /api/state/ai-config returns 200 OK");
    assert(typeof aiGetData.confidenceThreshold === "number", "AI config has numeric confidenceThreshold");

    const aiPostReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        "x-csrf-token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confidenceThreshold: 0.90 }),
    });
    const aiPostRes = await postAiConfigRoute(aiPostReq);
    const aiPostData = await aiPostRes.json();
    assert(aiPostRes.status === 200, "POST /api/state/ai-config returns 200 OK");
    assert(aiPostData.confidenceThreshold === 0.90, "AI confidenceThreshold successfully updated to 0.90");

    // 3. Test Master Challenge Override POST /api/state/override/challenge
    testChallenge = await prisma.challenge.findFirst({
      where: { deletedAt: null },
    });

    if (testChallenge) {
      originalChallengeState = {
        status: testChallenge.status,
        assignedInstitute: testChallenge.assignedInstitute,
        claimedInstitute: testChallenge.claimedInstitute,
        nodalStatus: testChallenge.nodalStatus,
        rejectionReason: testChallenge.rejectionReason,
        escalationLevel: testChallenge.escalationLevel,
      };

      const overrideReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
        method: "POST",
        headers: {
          cookie: cookieHeader,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: testChallenge.id,
          newStatus: "OPEN_FOR_PROPOSALS",
          assignedInstitute: "BIT Mesra",
          overrideReason: "State-level expedited resolution order for societal innovation",
          forceReroute: true,
        }),
      });
      const overrideRes = await overrideChallenge(overrideReq);
      const overrideData = await overrideRes.json();
      assert(overrideRes.status === 200, "POST /api/state/override/challenge returns 200 OK");
      assert(overrideData.success === true, "Master override reports success: true");
      assert(overrideData.challenge.assignedInstitute === "BIT Mesra", "Challenge assignedInstitute force-assigned to BIT Mesra");
      assert(overrideData.challenge.nodalStatus === "routed_to_academia", "Challenge nodalStatus updated to routed_to_academia");
    }

    // 4. Test Funding Revocation POST /api/state/override/revoke-funding
    testCommitment = await prisma.fundingCommitment.findFirst({
      where: { deletedAt: null },
      include: { proposal: true },
    });
    if (testCommitment) {
      originalCommitmentState = {
        status: testCommitment.status,
        notes: testCommitment.notes,
      };
      if (testCommitment.proposal) {
        associatedProposal = testCommitment.proposal;
        originalProposalState = {
          status: testCommitment.proposal.status,
          industryClaimStatus: testCommitment.proposal.industryClaimStatus,
          claimedIndustryId: testCommitment.proposal.claimedIndustryId,
          claimedIndustryName: testCommitment.proposal.claimedIndustryName,
        };
      }

      const revokeReq = new NextRequest("http://localhost:3000/api/state/override/revoke-funding", {
        method: "POST",
        headers: {
          cookie: cookieHeader,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fundingId: testCommitment.id,
          reason: "Compliance breach under section 14.B - statutory CSR milestone default",
          reopenProposal: true,
        }),
      });
      const revokeRes = await revokeFunding(revokeReq);
      const revokeData = await revokeRes.json();
      assert(revokeRes.status === 200, "POST /api/state/override/revoke-funding returns 200 OK");
      assert(revokeData.success === true, "Funding revocation reports success: true");
      assert(revokeData.commitment.status === "CANCELLED", "FundingCommitment status updated to CANCELLED");
    }

    // 5. Test Pending Users GET /api/admin/pending-users with STATE_ADMIN
    const pendingUsersReq = new NextRequest("http://localhost:3000/api/admin/pending-users", {
      headers: { cookie: cookieHeader },
    });
    const pendingUsersRes = await getPendingUsers(pendingUsersReq);
    const pendingUsersData = await pendingUsersRes.json();
    assert(pendingUsersRes.status === 200, "GET /api/admin/pending-users authorized for STATE_ADMIN (returns 200)");
    assert(Array.isArray(pendingUsersData.pendingUsers), "pendingUsers is an array");

  } catch (err) {
    console.error("E2E Test step execution error:", err);
    failed++;
  } finally {
    // Restore modified records
    try {
      if (testChallenge && originalChallengeState) {
        await prisma.challenge.update({
          where: { id: testChallenge.id },
          data: originalChallengeState,
        }).catch(() => {});
      }

      if (testCommitment && originalCommitmentState) {
        await prisma.fundingCommitment.update({
          where: { id: testCommitment.id },
          data: originalCommitmentState,
        }).catch(() => {});
      }

      if (associatedProposal && originalProposalState) {
        await prisma.proposal.update({
          where: { id: associatedProposal.id },
          data: originalProposalState,
        }).catch(() => {});
      }

      // Restore AI config
      updateAiConfig(initialAiThreshold);

      // Ensure csr.lead@coalindia.in is restored to PENDING
      await prisma.user.updateMany({
        where: { email: "csr.lead@coalindia.in" },
        data: { status: "PENDING" },
      }).catch(() => {});
    } catch (cleanupErr) {
      console.warn("Cleanup warning in finally:", cleanupErr);
    }

    console.log(`\n=== E2E RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runE2eTests().catch(async (e) => {
  console.error("E2E Test execution failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
