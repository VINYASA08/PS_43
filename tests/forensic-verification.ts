import prisma from "../src/lib/prisma";
import { UserRole, UserStatus } from "../src/lib/types";
import { signSessionToken } from "../src/lib/auth";
import { NextRequest } from "next/server";
import { GET as getAnalytics } from "../src/app/api/state/analytics/route";
import { POST as overrideChallenge } from "../src/app/api/state/override/challenge/route";
import { POST as revokeFunding } from "../src/app/api/state/override/revoke-funding/route";
import { GET as getAiConfigRoute, POST as postAiConfigRoute } from "../src/app/api/state/ai-config/route";
import { GET as getPendingUsers } from "../src/app/api/admin/pending-users/route";
import { POST as approveUser } from "../src/app/api/admin/approve-user/route";

import { generateCsrfToken, CSRF_HEADER_NAME, CSRF_COOKIE_NAME } from "../src/lib/csrf";

async function main() {
  console.log("===============================================================");
  console.log("   FORENSIC INTEGRITY AUDIT EMPIRICAL VERIFICATION SUITE");
  console.log("===============================================================\n");

  let checksPassed = 0;
  let checksFailed = 0;

  function verify(cond: boolean, desc: string, details?: any) {
    if (cond) {
      console.log(`[PASS] ${desc}`);
      checksPassed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      if (details) console.error("   Details:", details);
      checksFailed++;
    }
  }

  // 1. Ensure a genuine STATE_ADMIN user exists in database for foreign key & audit log integrity
  let stateAdmin = await prisma.user.findFirst({
    where: { role: "STATE_ADMIN" },
  });

  if (!stateAdmin) {
    console.log("Creating genuine STATE_ADMIN user in DB for audit...");
    stateAdmin = await prisma.user.create({
      data: {
        email: "chief.secretary.forensic@jharkhand.gov.in",
        name: "Shri L. K. Verma, IAS",
        role: "STATE_ADMIN",
        tier: "STATE",
        status: "ACTIVE",
        passwordHash: "$2a$12$dummyhashforstatetest0000000000000000000000000000000000000",
        organization: "Cabinet Secretariat, Govt. of Jharkhand",
        designation: "Chief Secretary & State Command Director",
        district: "Ranchi",
      },
    });
  }

  verify(!!stateAdmin && stateAdmin.role === "STATE_ADMIN" && stateAdmin.tier === "STATE",
    "Prisma database contains genuine STATE_ADMIN user with tier='STATE'");

  // Generate valid CSRF token
  const csrfToken = generateCsrfToken();

  // Create JWT token with genuine state admin ID
  const stateToken = await signSessionToken({
    userId: stateAdmin.id,
    email: stateAdmin.email!,
    name: stateAdmin.name,
    role: UserRole.STATE_ADMIN,
    tier: "STATE",
    status: UserStatus.ACTIVE,
  });
  const stateHeaders = {
    cookie: `sih_session=${stateToken}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    [CSRF_HEADER_NAME]: csrfToken,
    "Content-Type": "application/json",
  };

  // Create Citizen JWT token for RBAC enforcement checks
  const citizenToken = await signSessionToken({
    userId: "citizen-probe-id",
    email: "citizen.probe@gmail.com",
    name: "Citizen Probe",
    role: UserRole.CITIZEN,
    tier: "DISTRICT",
    status: UserStatus.ACTIVE,
  });
  const citizenHeaders = {
    cookie: `sih_session=${citizenToken}`,
    "Content-Type": "application/json",
  };

  // ---------------------------------------------------------------------------
  // CHECK A: Master Challenge Override Execution & Database State Mutation
  // ---------------------------------------------------------------------------
  console.log("\n--- Checking Master Challenge Override & Database Mutation ---");
  const testChallenge = await prisma.challenge.create({
    data: {
      publicTrackingId: `JH-SAH-2026-${Date.now()}`,
      title: "Forensic Audit Challenge - Arsenic Filtration in Sahebganj",
      description: "Critical ground contamination requiring sovereign override",
      district: "Sahibganj",
      domain: "Water",
      location: "Sahebganj Sadar Block, Ward 4",
      urgency: "HIGH",
      status: "REPORTED",
      nodalStatus: "pending",
      escalationLevel: 1,
      reportedById: stateAdmin.id,
    },
  });

  verify(testChallenge.status === "REPORTED", "Initial challenge status is 'REPORTED'");

  // Invoke POST /api/state/override/challenge
  const overrideReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({
      challengeId: testChallenge.id,
      newStatus: "IN_PROGRESS",
      action: "FORCE_ASSIGN",
      assignedInstitute: "IIT (ISM) Dhanbad",
      targetUniversity: "IIT (ISM) Dhanbad",
      overrideReason: "Chief Secretary sovereign mandate for immediate lab mobilization",
      escalationLevel: 3,
    }),
  });

  const overrideRes = await overrideChallenge(overrideReq);
  const overrideData = await overrideRes.json();

  verify(overrideRes.status === 200, "POST /api/state/override/challenge returns HTTP 200");
  verify(overrideData.success === true, "Override response indicates success: true");

  // Query database directly to verify genuine mutation
  const mutatedChallenge = await prisma.challenge.findUnique({
    where: { id: testChallenge.id },
  });

  verify(mutatedChallenge?.status === "IN_PROGRESS",
    "Database Challenge status genuinely mutated to 'IN_PROGRESS'");
  verify(mutatedChallenge?.assignedInstitute === "IIT (ISM) Dhanbad",
    "Database Challenge assignedInstitute genuinely updated to 'IIT (ISM) Dhanbad'");
  verify(mutatedChallenge?.nodalStatus === "routed_to_academia",
    "Database Challenge nodalStatus genuinely updated to 'routed_to_academia'");
  verify(mutatedChallenge?.escalationLevel === 3,
    "Database Challenge escalationLevel genuinely escalated to 3");

  // Verify AuditLog entry creation
  const challengeAuditLog = await prisma.auditLog.findFirst({
    where: {
      action: "STATE_ADMIN_MASTER_OVERRIDE",
      resourceId: testChallenge.id,
    },
    orderBy: { createdAt: "desc" },
  });

  verify(!!challengeAuditLog, "AuditLog table contains verified entry for STATE_ADMIN_MASTER_OVERRIDE");
  verify(challengeAuditLog?.userId === stateAdmin.id, "AuditLog links to genuine STATE_ADMIN user ID");

  // ---------------------------------------------------------------------------
  // CHECK B: Funding Revocation Workflow & Transaction Integrity
  // ---------------------------------------------------------------------------
  console.log("\n--- Checking Funding Revocation & Transaction Integrity ---");
  const testProposal = await prisma.proposal.create({
    data: {
      proposalRef: `PR-AUDIT-${Date.now()}`,
      challengeId: testChallenge.id,
      submittedById: stateAdmin.id,
      universityName: "IIT (ISM) Dhanbad",
      title: "Electrochemical Arsenic Remediation Rig",
      abstract: "Full technical methodology for arsenic sequestration",
      methodology: "Zero-valent iron electrochemical aeration",
      budget: 850000,
      status: "FUNDED",
      industryClaimStatus: "CLAIMED",
      claimedIndustryName: "Coal India Limited",
    },
  });

  const testCommitment = await prisma.fundingCommitment.create({
    data: {
      escrowRef: `ESC-AUDIT-${Date.now()}`,
      proposalId: testProposal.id,
      industryUserId: stateAdmin.id,
      corporateName: "Coal India Limited CSR",
      amount: 850000,
      type: "CSR",
      status: "ESCROWED",
      notes: "Tranche 1 locked in escrow",
    },
  });

  verify(testCommitment.status === "ESCROWED" && testProposal.industryClaimStatus === "CLAIMED",
    "Initial proposal is FUNDED/CLAIMED and commitment is ESCROWED");

  // Invoke POST /api/state/override/revoke-funding
  const revokeReq = new NextRequest("http://localhost:3000/api/state/override/revoke-funding", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({
      fundingId: testCommitment.id,
      proposalId: testProposal.id,
      reason: "Statutory default under Jharkhand CSR Innovation Act section 19",
      reopenProposal: true,
    }),
  });

  const revokeRes = await revokeFunding(revokeReq);
  const revokeData = await revokeRes.json();

  verify(revokeRes.status === 200, "POST /api/state/override/revoke-funding returns HTTP 200");
  verify(revokeData.success === true, "Revocation response indicates success: true");

  // Verify database state mutation
  const mutatedCommitment = await prisma.fundingCommitment.findUnique({
    where: { id: testCommitment.id },
  });
  const mutatedProposal = await prisma.proposal.findUnique({
    where: { id: testProposal.id },
  });

  verify(mutatedCommitment?.status === "CANCELLED",
    "Database FundingCommitment genuinely mutated to 'CANCELLED'");
  verify(mutatedCommitment?.notes?.includes("Statutory default"),
    "Database FundingCommitment notes contain revocation reason");
  verify(mutatedProposal?.industryClaimStatus === "OPEN",
    "Database Proposal genuinely unlocked with industryClaimStatus='OPEN'");
  verify(mutatedProposal?.status === "APPROVED",
    "Database Proposal status genuinely reset to 'APPROVED'");

  // Verify AuditLog entry for funding revocation
  const fundingAuditLog = await prisma.auditLog.findFirst({
    where: {
      action: "STATE_ADMIN_REVOKE_FUNDING",
      resourceId: testCommitment.id,
    },
    orderBy: { createdAt: "desc" },
  });

  verify(!!fundingAuditLog, "AuditLog table contains verified entry for STATE_ADMIN_REVOKE_FUNDING");
  verify(fundingAuditLog?.userId === stateAdmin.id, "Funding AuditLog links to genuine STATE_ADMIN user ID");

  // ---------------------------------------------------------------------------
  // CHECK C: AI Threshold Configuration Validation & Persistence
  // ---------------------------------------------------------------------------
  console.log("\n--- Checking AI Routing Confidence Threshold Validation & Persistence ---");
  // Test valid update
  const aiValidReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({ confidenceThreshold: 0.93 }),
  });
  const aiValidRes = await postAiConfigRoute(aiValidReq);
  const aiValidData = await aiValidRes.json();

  verify(aiValidRes.status === 200, "POST /api/state/ai-config (0.93) returns HTTP 200");
  verify(aiValidData.confidenceThreshold === 0.93, "AI confidence threshold successfully updated to 0.93");

  // Test persistence on GET
  const aiGetReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    headers: stateHeaders,
  });
  const aiGetRes = await getAiConfigRoute(aiGetReq);
  const aiGetData = await aiGetRes.json();

  verify(aiGetData.confidenceThreshold === 0.93, "GET /api/state/ai-config persists and returns 0.93");

  // Test invalid threshold rejection (< 0.70)
  const aiLowReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({ confidenceThreshold: 0.55 }),
  });
  const aiLowRes = await postAiConfigRoute(aiLowReq);
  verify(aiLowRes.status === 400, "POST /api/state/ai-config rejects threshold < 0.70 with HTTP 400");

  // Test invalid threshold rejection (> 0.95)
  const aiHighReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({ confidenceThreshold: 0.99 }),
  });
  const aiHighRes = await postAiConfigRoute(aiHighReq);
  verify(aiHighRes.status === 400, "POST /api/state/ai-config rejects threshold > 0.95 with HTTP 400");

  // Test non-numeric rejection
  const aiNaNReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({ confidenceThreshold: "invalid" }),
  });
  const aiNaNRes = await postAiConfigRoute(aiNaNReq);
  verify(aiNaNRes.status === 400, "POST /api/state/ai-config rejects non-numeric input with HTTP 400");

  // Restore default threshold
  const aiResetReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({ confidenceThreshold: 0.85 }),
  });
  await postAiConfigRoute(aiResetReq);

  // ---------------------------------------------------------------------------
  // CHECK D: Industry User Management & Approval Workflow
  // ---------------------------------------------------------------------------
  console.log("\n--- Checking Industry User Approval Workflow ---");
  const uniqueEmail = `industry.forensic.${Date.now()}@tatasteel.com`;
  const pendingUser = await prisma.user.create({
    data: {
      email: uniqueEmail,
      name: "Dr. Ananya Sen",
      role: UserRole.INDUSTRY,
      status: "PENDING",
      passwordHash: "$2a$12$dummyhashforstatetest0000000000000000000000000000000000000",
      organization: "Tata Steel CSR Research Foundation",
      designation: "Vice President - Grassroots Technology",
      district: "East Singhbhum",
    },
  });

  verify(pendingUser.status === "PENDING", "Created pending industry user with status 'PENDING'");

  // Approve pending user via POST /api/admin/approve-user
  const approveReq = new NextRequest("http://localhost:3000/api/admin/approve-user", {
    method: "POST",
    headers: stateHeaders,
    body: JSON.stringify({
      userId: pendingUser.id,
      action: "approve",
      reason: "Verified statutory CSR empanelment credentials",
    }),
  });

  const approveRes = await approveUser(approveReq);
  const approveData = await approveRes.json();

  verify(approveRes.status === 200, "POST /api/admin/approve-user returns HTTP 200");
  verify(approveData.success === true, "Approval response indicates success: true");

  const approvedUserDb = await prisma.user.findUnique({
    where: { id: pendingUser.id },
  });

  verify(approvedUserDb?.status === "ACTIVE",
    "Database User status genuinely mutated to 'ACTIVE'");

  // Verify AuditLog entry for approval
  const userAuditLog = await prisma.auditLog.findFirst({
    where: {
      action: "APPROVE_INDUSTRY_USER",
      resourceId: pendingUser.id,
    },
    orderBy: { createdAt: "desc" },
  });

  verify(!!userAuditLog, "AuditLog contains verified entry for APPROVE_INDUSTRY_USER");

  // ---------------------------------------------------------------------------
  // CHECK E: RBAC Enforcement on Sovereign State Endpoints
  // ---------------------------------------------------------------------------
  console.log("\n--- Checking RBAC Security Enforcement ---");
  // 1. CITIZEN cannot override challenge
  const citizenOverrideReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
    method: "POST",
    headers: citizenHeaders,
    body: JSON.stringify({ challengeId: testChallenge.id, newStatus: "RESOLVED" }),
  });
  const citizenOverrideRes = await overrideChallenge(citizenOverrideReq);
  verify(citizenOverrideRes.status === 403, "CITIZEN token blocked with HTTP 403 on challenge override");

  // 2. CITIZEN cannot revoke funding
  const citizenRevokeReq = new NextRequest("http://localhost:3000/api/state/override/revoke-funding", {
    method: "POST",
    headers: citizenHeaders,
    body: JSON.stringify({ fundingId: testCommitment.id }),
  });
  const citizenRevokeRes = await revokeFunding(citizenRevokeReq);
  verify(citizenRevokeRes.status === 403, "CITIZEN token blocked with HTTP 403 on funding revocation");

  // 3. CITIZEN cannot configure AI thresholds
  const citizenAiReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
    method: "POST",
    headers: citizenHeaders,
    body: JSON.stringify({ confidenceThreshold: 0.75 }),
  });
  const citizenAiRes = await postAiConfigRoute(citizenAiReq);
  verify(citizenAiRes.status === 403, "CITIZEN token blocked with HTTP 403 on AI configuration");

  // 4. Unauthenticated request blocked
  const unauthReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId: testChallenge.id }),
  });
  const unauthRes = await overrideChallenge(unauthReq);
  verify(unauthRes.status === 401, "Unauthenticated request blocked with HTTP 401");

  // ---------------------------------------------------------------------------
  // CLEANUP TEST RECORDS
  // ---------------------------------------------------------------------------
  await prisma.auditLog.deleteMany({
    where: { resourceId: { in: [testChallenge.id, testCommitment.id, pendingUser.id] } },
  });
  await prisma.fundingCommitment.deleteMany({ where: { id: testCommitment.id } });
  await prisma.proposal.deleteMany({ where: { id: testProposal.id } });
  await prisma.challenge.deleteMany({ where: { id: testChallenge.id } });
  await prisma.user.deleteMany({ where: { id: pendingUser.id } });

  console.log("\n===============================================================");
  console.log(`   AUDIT RESULTS: ${checksPassed} PASSED, ${checksFailed} FAILED`);
  console.log("===============================================================\n");

  await prisma.$disconnect();
  if (checksFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(async (e) => {
  console.error("Forensic verification failed with exception:", e);
  await prisma.$disconnect();
  process.exit(1);
});
