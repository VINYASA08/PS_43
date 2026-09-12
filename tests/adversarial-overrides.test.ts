/**
 * PRAGATI Round 11: Adversarial Test Harness for State-Level Master Overrides
 * 
 * Scope:
 * 1. Master Challenge Override across all lifecycle states (SUBMITTED, TRIAGED, ASSIGNED, IN_PROGRESS, RESOLVED, UNDER_REVIEW)
 *    and unconditional overriding of District Nodal Officer (DNO) decisions (rejected, diverted, pending).
 * 2. CSR Funding Revocation: cancellation of commitments, unlocking of proposals, escrow auditing, and non-compliance audit trails.
 * 3. AI Routing Confidence Threshold: boundary enforcement [0.70, 0.95], rejection of out-of-bounds inputs, persistence, and audit logging.
 * 4. Industry User Approval & Onboarding: approval/rejection workflows, and adversarial role-guard stress testing.
 */

import prisma from "../src/lib/prisma";
import { UserRole, UserStatus, ChallengeStatus } from "../src/lib/types";
import { signSessionToken } from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { NextRequest } from "next/server";

// Route Handlers Under Test
import { POST as overrideChallenge } from "../src/app/api/state/override/challenge/route";
import { POST as revokeFunding } from "../src/app/api/state/override/revoke-funding/route";
import { GET as getAiConfigRoute, POST as postAiConfigRoute } from "../src/app/api/state/ai-config/route";
import { GET as getPendingUsers } from "../src/app/api/admin/pending-users/route";
import { POST as approveUser } from "../src/app/api/admin/approve-user/route";
import { GET as getAnalytics } from "../src/app/api/state/analytics/route";

let passed = 0;
let failed = 0;
const testRunId = `adv_${Date.now()}`;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}

// Helper to create NextRequest with auth and CSRF headers
function createTestRequest(
  url: string,
  options: {
    method?: string;
    token?: string | null;
    body?: any;
    csrfToken?: string | null;
    omitCsrf?: boolean;
  } = {}
): NextRequest {
  const method = options.method || (options.body ? "POST" : "GET");
  const headers = new Headers();

  const cookies: string[] = [];
  if (options.token) {
    cookies.push(`sih_session=${options.token}`);
  }

  // Handle CSRF
  if (!options.omitCsrf) {
    const csrf = options.csrfToken !== undefined ? options.csrfToken : generateCsrfToken();
    if (csrf) {
      headers.set("x-csrf-token", csrf);
      cookies.push(`sih_csrf=${csrf}`);
    }
  }

  if (cookies.length > 0) {
    headers.set("cookie", cookies.join("; "));
  }

  if (options.body) {
    headers.set("content-type", "application/json");
  }

  const reqInit: any = {
    method,
    headers,
  };

  if (options.body) {
    reqInit.body = JSON.stringify(options.body);
  }

  return new NextRequest(url, reqInit);
}

async function runAdversarialOverridesSuite() {
  console.log("\n" + "=".repeat(75));
  console.log("   PRAGATI R11: EMPIRICAL ADVERSARIAL MASTER OVERRIDES HARNESS");
  console.log("=".repeat(75) + "\n");

  let stateAdminUser: any;
  let citizenUser: any;
  let universityUser: any;
  let industryUser: any;

  let stateAdminToken: string;
  let citizenToken: string;
  let universityToken: string;
  let industryToken: string;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Provision & Authenticate Real Personas for Foreign Key Integrity
    // -------------------------------------------------------------------------
    console.log(">>> [SETUP] Provisioning Test Personas with Database FK Integrity...");

    // 1. State Admin
    stateAdminUser = await prisma.user.findFirst({
      where: { role: UserRole.STATE_ADMIN, status: UserStatus.ACTIVE },
    });
    if (!stateAdminUser) {
      stateAdminUser = await prisma.user.create({
        data: {
          email: `chief.sec.${testRunId}@jharkhand.gov.in`,
          name: "Chief Secretary (Adversarial)",
          role: UserRole.STATE_ADMIN,
          tier: "STATE",
          status: UserStatus.ACTIVE,
          passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
          organization: "Cabinet Secretariat",
          designation: "Chief Secretary",
          district: "Ranchi",
        },
      });
    }

    // 2. Citizen
    citizenUser = await prisma.user.create({
      data: {
        email: `citizen.${testRunId}@jharkhand.org`,
        name: "Mukesh Mahto",
        role: UserRole.CITIZEN,
        status: UserStatus.ACTIVE,
        passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
        district: "Ranchi",
      },
    });

    // 3. University PI
    universityUser = await prisma.user.create({
      data: {
        email: `prof.roy.${testRunId}@bitmesra.ac.in`,
        name: "Prof. S. Roy",
        role: UserRole.UNIVERSITY,
        status: UserStatus.ACTIVE,
        passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
        organization: "BIT Mesra",
        district: "Ranchi",
      },
    });

    // 4. Industry Partner
    industryUser = await prisma.user.create({
      data: {
        email: `csr.head.${testRunId}@tatasteel.com`,
        name: "Ananya Gupta",
        role: UserRole.INDUSTRY,
        status: UserStatus.ACTIVE,
        passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
        organization: "Tata Steel CSR",
        district: "East Singhbhum",
      },
    });

    stateAdminToken = await signSessionToken({
      userId: stateAdminUser.id,
      name: stateAdminUser.name,
      email: stateAdminUser.email,
      role: UserRole.STATE_ADMIN,
      tier: "STATE",
      status: UserStatus.ACTIVE,
    });

    citizenToken = await signSessionToken({
      userId: citizenUser.id,
      name: citizenUser.name,
      email: citizenUser.email,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
    });

    universityToken = await signSessionToken({
      userId: universityUser.id,
      name: universityUser.name,
      email: universityUser.email,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
    });

    industryToken = await signSessionToken({
      userId: industryUser.id,
      name: industryUser.name,
      email: industryUser.email,
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
    });

    assert(!!stateAdminToken && !!citizenToken, "Successfully generated authenticated JWT session tokens for test personas");

    // =========================================================================
    // SUITE 1: MASTER CHALLENGE OVERRIDES ACROSS ALL LIFECYCLE STATES & DNO BYPASS
    // =========================================================================
    console.log("\n>>> [SUITE 1] Master Challenge Overrides Across Lifecycle States & DNO Decisions...");

    const lifecycleStatesToTest = [
      {
        initialState: "REPORTED", // Equivalent to SUBMITTED
        testLabel: "SUBMITTED / REPORTED",
        nodalInitial: "pending",
        rejectionReason: null,
        overridePayload: {
          newStatus: "ASSIGNED",
          assignedInstitute: "BIT Mesra",
          overrideReason: "State expedited allocation order for grassroots drinking water",
          escalationLevel: 3,
        },
        expectedStatus: "ASSIGNED",
        expectedInstitute: "BIT Mesra",
        expectedNodal: "routed_to_academia",
      },
      {
        initialState: "UNDER_REVIEW",
        testLabel: "TRIAGED (DNO REJECTED -> UNCONDITIONAL OVERRIDE)",
        nodalInitial: "rejected",
        rejectionReason: "DNO determined issue lacks statewide innovation merit",
        overridePayload: {
          newStatus: "OPEN_FOR_PROPOSALS",
          action: "RE_ROUTE_ACADEMIA",
          overrideReason: "Overruling District Nodal Officer rejection: acute public health priority",
          forceReroute: true,
          escalationLevel: 3,
        },
        expectedStatus: "OPEN_FOR_PROPOSALS",
        expectedNodal: "routed_to_academia",
        clearedRejection: true,
      },
      {
        initialState: "OPEN_FOR_PROPOSALS",
        testLabel: "ASSIGNED (DNO DIVERTED TO GOV -> FORCE RE-ROUTE TO ACADEMIA)",
        nodalInitial: "diverted_to_gov",
        divertedTarget: "Ranchi PWD Division",
        overridePayload: {
          newStatus: "IN_PROGRESS",
          assignedInstitute: "IIT (ISM) Dhanbad",
          action: "FORCE_ASSIGN",
          overrideReason: "Overriding line department diversion: academic R&D breakthrough required",
        },
        expectedStatus: "IN_PROGRESS",
        expectedInstitute: "IIT (ISM) Dhanbad",
        expectedNodal: "routed_to_academia",
      },
      {
        initialState: "IN_PROGRESS",
        testLabel: "IN_PROGRESS (FORCE REASSIGNMENT FROM ONE UNI TO ANOTHER)",
        nodalInitial: "routed_to_academia",
        claimedInstitute: "Central University of Jharkhand",
        overridePayload: {
          newStatus: "IN_PROGRESS",
          assignedInstitute: "NIT Jamshedpur",
          overrideReason: "Reassigning to NIT Jamshedpur due to high-precision telemetry lab requirement",
          escalationLevel: 3,
        },
        expectedStatus: "IN_PROGRESS",
        expectedInstitute: "NIT Jamshedpur",
        expectedNodal: "routed_to_academia",
      },
      {
        initialState: "RESOLVED",
        testLabel: "RESOLVED (FIELD AUDIT REJECTION -> REOPENING TO UNDER_REVIEW)",
        nodalInitial: "routed_to_academia",
        claimedInstitute: "Birsa Agricultural University",
        overridePayload: {
          newStatus: "UNDER_REVIEW",
          assignedInstitute: "Birsa Agricultural University",
          overrideReason: "Field verification audit failed water purity criteria; reopening for corrective pilot",
        },
        expectedStatus: "UNDER_REVIEW",
        expectedInstitute: "Birsa Agricultural University",
        expectedNodal: "routed_to_academia",
      },
      {
        initialState: "UNDER_REVIEW",
        testLabel: "UNDER_REVIEW (DIRECT APEX RESOLUTION ORDER)",
        nodalInitial: "pending",
        overridePayload: {
          newStatus: "RESOLVED",
          overrideReason: "Validated by State Technical Evaluation Board and Chief Secretary directive",
          escalationLevel: 3,
        },
        expectedStatus: "RESOLVED",
        expectedNodal: "pending", // retained if not assigned
      },
    ];

    for (let i = 0; i < lifecycleStatesToTest.length; i++) {
      const tc = lifecycleStatesToTest[i];
      console.log(`\n  * Testing Lifecycle State [${tc.testLabel}]`);

      // Create challenge in initial state
      const ch = await prisma.challenge.create({
        data: {
          publicTrackingId: `TEST-CH-${testRunId}-${i}`,
          title: `Adversarial Challenge #${i} - ${tc.testLabel}`,
          description: "Adversarial stress testing of master state override capabilities",
          domain: "Water Management",
          district: "Garhwa",
          location: "Block B, Village 4",
          status: tc.initialState,
          nodalStatus: tc.nodalInitial,
          rejectionReason: tc.rejectionReason,
          divertedTarget: (tc as any).divertedTarget || null,
          claimedInstitute: (tc as any).claimedInstitute || null,
          reportedById: citizenUser.id,
        },
      });

      // Execute State Admin Master Override via NextRequest
      const req = createTestRequest("http://localhost:3000/api/state/override/challenge", {
        token: stateAdminToken,
        body: {
          challengeId: ch.id,
          ...tc.overridePayload,
        },
      });

      const res = await overrideChallenge(req);
      const resJson = await res.json();

      assert(res.status === 200, `State Admin override on [${tc.testLabel}] returns HTTP 200`);
      assert(resJson.success === true, `Response indicates success = true on [${tc.testLabel}]`);

      // Query database to verify unconditional state mutation
      const updatedCh = await prisma.challenge.findUnique({ where: { id: ch.id } });
      assert(
        updatedCh?.status === tc.expectedStatus,
        `Database status mutated from '${tc.initialState}' to '${tc.expectedStatus}'`
      );

      if (tc.expectedInstitute) {
        assert(
          updatedCh?.assignedInstitute === tc.expectedInstitute,
          `Assigned institute updated to '${tc.expectedInstitute}'`
        );
      }

      if (tc.expectedNodal) {
        assert(
          updatedCh?.nodalStatus === tc.expectedNodal,
          `Nodal routing status updated to '${tc.expectedNodal}'`
        );
      }

      if (tc.clearedRejection) {
        assert(
          updatedCh?.rejectionReason === null,
          `DNO rejection reason was unconditionally cleared (null) by State Admin override`
        );
      }

      // Verify Audit Trail is written to database with FK integrity
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          resource: "Challenge",
          resourceId: ch.id,
          action: "STATE_ADMIN_MASTER_OVERRIDE",
        },
        orderBy: { createdAt: "desc" },
      });

      assert(!!auditLog, `AuditLog entry created for challenge ${ch.id}`);
      assert(auditLog?.userId === stateAdminUser.id, `AuditLog correctly attributes actor to State Admin (${stateAdminUser.id})`);
      if (auditLog?.newState) {
        const newStateObj = JSON.parse(auditLog.newState);
        assert(
          newStateObj.newStatus === tc.expectedStatus,
          `AuditLog newState records newStatus '${tc.expectedStatus}' and override reason`
        );
      }
    }

    // Adversarial Role Guards & Malicious Payloads on Challenge Override
    console.log("\n  * Testing Adversarial Attacks on Challenge Override...");

    // Attack 1: Non-Admin attempts override (CITIZEN, UNIVERSITY, INDUSTRY)
    const citizenReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: citizenToken,
      body: { challengeId: "non-existent-id", newStatus: "RESOLVED" },
    });
    const citizenRes = await overrideChallenge(citizenReq);
    assert(citizenRes.status === 403, "Citizen attempting master override is rejected with HTTP 403 Forbidden");

    const uniReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: universityToken,
      body: { challengeId: "non-existent-id", newStatus: "RESOLVED" },
    });
    const uniRes = await overrideChallenge(uniReq);
    assert(uniRes.status === 403, "University PI attempting master override is rejected with HTTP 403 Forbidden");

    const indReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: industryToken,
      body: { challengeId: "non-existent-id", newStatus: "RESOLVED" },
    });
    const indRes = await overrideChallenge(indReq);
    assert(indRes.status === 403, "Industry user attempting master override is rejected with HTTP 403 Forbidden");

    // Attack 2: Unauthenticated caller
    const unauthReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: null,
      body: { challengeId: "some-id", newStatus: "RESOLVED" },
    });
    const unauthRes = await overrideChallenge(unauthReq);
    assert(unauthRes.status === 401, "Unauthenticated master override attempt is rejected with HTTP 401 Unauthorized");

    // Attack 3: Missing challengeId
    const missingIdReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: stateAdminToken,
      body: { newStatus: "RESOLVED" },
    });
    const missingIdRes = await overrideChallenge(missingIdReq);
    assert(missingIdRes.status === 400, "Missing challengeId returns HTTP 400 Bad Request");

    // Attack 4: Non-existent challengeId
    const fakeIdReq = createTestRequest("http://localhost:3000/api/state/override/challenge", {
      token: stateAdminToken,
      body: { challengeId: "clx_fake_id_does_not_exist_9999", newStatus: "RESOLVED" },
    });
    const fakeIdRes = await overrideChallenge(fakeIdReq);
    assert(fakeIdRes.status === 404, "Non-existent challengeId returns HTTP 404 Not Found");


    // =========================================================================
    // SUITE 2: CSR FUNDING REVOCATION & ESCROW ACCOUNTING INTEGRITY
    // =========================================================================
    console.log("\n>>> [SUITE 2] CSR Funding Revocation & Escrow Accounting Integrity...");

    // Create active challenge, proposal, and funding commitment
    const fundingChallenge = await prisma.challenge.create({
      data: {
        publicTrackingId: `TEST-CSR-CH-${testRunId}`,
        title: "Fluoride Filtration Prototype for Garhwa",
        description: "Adsorbent resin based community filtration unit",
        domain: "Water Management",
        district: "Garhwa",
        location: "Kandi Block",
        status: "IN_PROGRESS",
        reportedById: citizenUser.id,
      },
    });

    const fundedProposal = await prisma.proposal.create({
      data: {
        proposalRef: `PR-ADV-${testRunId}`,
        challengeId: fundingChallenge.id,
        submittedById: universityUser.id,
        universityName: "BIT Mesra",
        title: "Advanced Dual-Stage Activated Alumina Adsorber",
        abstract: "Removes fluoride from groundwater to < 1.0 ppm",
        methodology: "Regenerable column adsorption",
        budget: 750000,
        status: "FUNDED",
        industryClaimStatus: "CLAIMED",
        claimedIndustryId: industryUser.id,
        claimedIndustryName: "Tata Steel CSR",
      },
    });

    const testCommitment = await prisma.fundingCommitment.create({
      data: {
        escrowRef: `ESCROW-ADV-${testRunId}`,
        proposalId: fundedProposal.id,
        industryUserId: industryUser.id,
        corporateName: "Tata Steel CSR Division",
        amount: 750000,
        type: "CSR",
        status: "ESCROWED",
        notes: "Tranche 1 (30%) disbursed upon DPR sign-off",
      },
    });

    assert(!!testCommitment, "Provisioned active ESCROWED CSR funding commitment (₹7,50,000)");

    // Test 2.1: Revoke by fundingId
    const breachReason = "Statutory CSR compliance breach under Section 135: Defaulted on Tranche-2 utilization certificate";
    const revokeReq = createTestRequest("http://localhost:3000/api/state/override/revoke-funding", {
      token: stateAdminToken,
      body: {
        fundingId: testCommitment.id,
        reason: breachReason,
        reopenProposal: true,
      },
    });

    const revokeRes = await revokeFunding(revokeReq);
    const revokeJson = await revokeRes.json();

    assert(revokeRes.status === 200, "POST /api/state/override/revoke-funding returns HTTP 200 OK");
    assert(revokeJson.success === true, "Revocation response indicates success: true");
    assert(revokeJson.message.includes("revoked and returned to escrow"), "Response message confirms escrow repatriation");

    // Database verification: commitment status and notes
    const revokedCommitment = await prisma.fundingCommitment.findUnique({
      where: { id: testCommitment.id },
    });
    assert(revokedCommitment?.status === "CANCELLED", "Funding commitment status is mutated to CANCELLED in database");
    assert(
      revokedCommitment?.notes?.includes("[REVOKED BY STATE_ADMIN]") &&
      revokedCommitment?.notes?.includes(breachReason),
      "Funding commitment notes records verbatim revocation reason & authority tag"
    );

    // Database verification: Proposal unlocked for re-funding
    const updatedProposal = await prisma.proposal.findUnique({
      where: { id: fundedProposal.id },
    });
    assert(updatedProposal?.status === "APPROVED", "Proposal status reverted from FUNDED to APPROVED");
    assert(updatedProposal?.industryClaimStatus === "OPEN", "Proposal industryClaimStatus reopened to OPEN");
    assert(updatedProposal?.claimedIndustryId === null, "Proposal claimedIndustryId reset to null");
    assert(updatedProposal?.claimedIndustryName === null, "Proposal claimedIndustryName reset to null");

    // Database verification: Audit Log
    const revokeAudit = await prisma.auditLog.findFirst({
      where: {
        resource: "FundingCommitment",
        resourceId: testCommitment.id,
        action: "STATE_ADMIN_REVOKE_FUNDING",
      },
      orderBy: { createdAt: "desc" },
    });

    assert(!!revokeAudit, "AuditLog entry created for statutory funding revocation");
    assert(revokeAudit?.userId === stateAdminUser.id, `AuditLog actor correctly matches State Admin (${stateAdminUser.id})`);
    if (revokeAudit?.newState) {
      const parsedAudit = JSON.parse(revokeAudit.newState);
      assert(parsedAudit.newStatus === "CANCELLED", "AuditLog newState records CANCELLED status");
      assert(parsedAudit.reason === breachReason, "AuditLog newState records statutory breach reason");
    }

    // Test 2.2: Revoke by proposalId fallback
    const proposal2 = await prisma.proposal.create({
      data: {
        proposalRef: `PR-ADV-2-${testRunId}`,
        challengeId: fundingChallenge.id,
        submittedById: universityUser.id,
        universityName: "BIT Mesra",
        title: "Secondary Solar Powered Filter DPR",
        abstract: "Solar pumping with adsorption",
        methodology: "PV powered pump",
        budget: 400000,
        status: "FUNDED",
        industryClaimStatus: "CLAIMED",
      },
    });

    const commitment2 = await prisma.fundingCommitment.create({
      data: {
        escrowRef: `ESCROW-ADV-2-${testRunId}`,
        proposalId: proposal2.id,
        industryUserId: industryUser.id,
        corporateName: "Tata Steel CSR Division",
        amount: 400000,
        status: "PLEDGED",
      },
    });

    const revokeByProposalReq = createTestRequest("http://localhost:3000/api/state/override/revoke-funding", {
      token: stateAdminToken,
      body: {
        proposalId: proposal2.id,
        reason: "Compliance default on MOU execution deadline",
      },
    });
    const revokeByPropRes = await revokeFunding(revokeByProposalReq);
    assert(revokeByPropRes.status === 200, "Revocation by proposalId resolves commitment and returns HTTP 200");

    const com2Db = await prisma.fundingCommitment.findUnique({ where: { id: commitment2.id } });
    assert(com2Db?.status === "CANCELLED", "Commitment resolved via proposalId successfully transitioned to CANCELLED");

    // Test 2.3: Verify Escrow Accounting Analytics
    const analyticsReq = createTestRequest("http://localhost:3000/api/state/analytics", {
      token: stateAdminToken,
    });
    const analyticsRes = await getAnalytics(analyticsReq);
    const analyticsJson = await analyticsRes.json();
    assert(analyticsRes.status === 200, "GET /api/state/analytics returns HTTP 200 with updated escrow figures");
    assert(typeof analyticsJson.summary?.escrowBalance === "number", "Analytics summary has valid numeric escrowBalance");
    assert(analyticsJson.summary?.escrowBalance >= 0, "Escrow balance remains mathematically sound (non-negative)");

    // Adversarial Role Guards on Funding Revocation
    console.log("\n  * Testing Adversarial Attacks on Funding Revocation...");
    const citizenRevokeReq = createTestRequest("http://localhost:3000/api/state/override/revoke-funding", {
      token: citizenToken,
      body: { fundingId: testCommitment.id, reason: "Unauthorized attempt" },
    });
    const citizenRevokeRes = await revokeFunding(citizenRevokeReq);
    assert(citizenRevokeRes.status === 403, "Citizen attempting CSR revocation is rejected with HTTP 403");

    const unauthRevokeReq = createTestRequest("http://localhost:3000/api/state/override/revoke-funding", {
      token: null,
      body: { fundingId: testCommitment.id },
    });
    const unauthRevokeRes = await revokeFunding(unauthRevokeReq);
    assert(unauthRevokeRes.status === 401, "Unauthenticated CSR revocation attempt is rejected with HTTP 401");

    const emptyRevokeReq = createTestRequest("http://localhost:3000/api/state/override/revoke-funding", {
      token: stateAdminToken,
      body: {},
    });
    const emptyRevokeRes = await revokeFunding(emptyRevokeReq);
    assert(emptyRevokeRes.status === 400, "Revocation request missing both fundingId and proposalId returns HTTP 400");


    // =========================================================================
    // SUITE 3: AI ROUTING CONFIDENCE THRESHOLD BOUNDS, REJECTION & PERSISTENCE
    // =========================================================================
    console.log("\n>>> [SUITE 3] AI Routing Confidence Threshold Adjustment & Boundary Defense...");

    // Test 3.1: GET current AI configuration
    const getAiReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
    });
    const getAiRes = await getAiConfigRoute(getAiReq);
    const initialAiConfig = await getAiRes.json();

    assert(getAiRes.status === 200, "GET /api/state/ai-config returns HTTP 200 OK");
    assert(initialAiConfig.minThreshold === 0.70, "Min threshold defined strictly as 0.70");
    assert(initialAiConfig.maxThreshold === 0.95, "Max threshold defined strictly as 0.95");

    // Test 3.2: Valid Lower Bound (0.70)
    const lowerBoundReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
      body: { confidenceThreshold: 0.70 },
    });
    const lowerBoundRes = await postAiConfigRoute(lowerBoundReq);
    const lowerBoundJson = await lowerBoundRes.json();
    assert(lowerBoundRes.status === 200, "Setting threshold to exact lower bound (0.70) returns HTTP 200 OK");
    assert(lowerBoundJson.confidenceThreshold === 0.70, "Confidence threshold updated to exactly 0.70");

    // Test 3.3: Valid Upper Bound (0.95)
    const upperBoundReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
      body: { confidenceThreshold: 0.95 },
    });
    const upperBoundRes = await postAiConfigRoute(upperBoundReq);
    const upperBoundJson = await upperBoundRes.json();
    assert(upperBoundRes.status === 200, "Setting threshold to exact upper bound (0.95) returns HTTP 200 OK");
    assert(upperBoundJson.confidenceThreshold === 0.95, "Confidence threshold updated to exactly 0.95");

    // Test 3.4: Valid Mid-range (0.88)
    const midReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
      body: { confidenceThreshold: 0.88 },
    });
    const midRes = await postAiConfigRoute(midReq);
    const midJson = await midRes.json();
    assert(midRes.status === 200, "Setting threshold to mid-range (0.88) returns HTTP 200 OK");
    assert(midJson.confidenceThreshold === 0.88, "Confidence threshold updated to 0.88");

    // Test 3.5: Invalid Out-of-Bounds Rejection (Stress Testing)
    console.log("\n  * Testing Adversarial Out-of-Bounds & Malicious Inputs to AI Threshold...");

    const invalidThresholdTests = [
      { val: 0.69, label: "Boundary underflow (0.69)" },
      { val: 0.50, label: "Severe underflow (0.50)" },
      { val: 0.0, label: "Zero threshold (0.0)" },
      { val: -0.25, label: "Negative threshold (-0.25)" },
      { val: 0.96, label: "Boundary overflow (0.96)" },
      { val: 1.0, label: "Full 100% threshold (1.00)" },
      { val: 2.5, label: "Extreme overflow (2.50)" },
      { val: "high", label: "Non-numeric string ('high')" },
      { val: NaN, label: "NaN input" },
      { val: null, label: "Null input" },
    ];

    for (const item of invalidThresholdTests) {
      const invReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
        token: stateAdminToken,
        body: { confidenceThreshold: item.val },
      });
      const invRes = await postAiConfigRoute(invReq);
      assert(
        invRes.status === 400,
        `Out-of-bounds rejection: [${item.label}] rejected with HTTP 400 Bad Request`
      );
    }

    // Test 3.6: Persistence Verification
    console.log("\n  * Testing Threshold Persistence across endpoints...");
    const targetPersistThreshold = 0.92;
    const persistSetReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
      body: { confidenceThreshold: targetPersistThreshold },
    });
    await postAiConfigRoute(persistSetReq);

    // Read back from GET /api/state/ai-config
    const verifyGetReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: stateAdminToken,
    });
    const verifyGetRes = await getAiConfigRoute(verifyGetReq);
    const verifyGetJson = await verifyGetRes.json();
    assert(
      verifyGetJson.confidenceThreshold === targetPersistThreshold,
      `GET /api/state/ai-config persists updated threshold (${targetPersistThreshold})`
    );

    // Read back from GET /api/state/analytics
    const verifyAnalyticsReq = createTestRequest("http://localhost:3000/api/state/analytics", {
      token: stateAdminToken,
    });
    const verifyAnalyticsRes = await getAnalytics(verifyAnalyticsReq);
    const verifyAnalyticsJson = await verifyAnalyticsRes.json();
    assert(
      verifyAnalyticsJson.aiOversight?.threshold === targetPersistThreshold,
      `GET /api/state/analytics telemetry reflects persistent threshold (${targetPersistThreshold})`
    );

    // Audit trail verification
    const aiAudit = await prisma.auditLog.findFirst({
      where: {
        resource: "SystemConfig",
        resourceId: "ai_confidence_threshold",
        action: "UPDATE_AI_CONFIDENCE_THRESHOLD",
      },
      orderBy: { createdAt: "desc" },
    });
    assert(!!aiAudit, "AuditLog entry logged for AI confidence threshold update");
    assert(aiAudit?.userId === stateAdminUser.id, `AuditLog actor matches State Admin (${stateAdminUser.id})`);

    // Test 3.7: Role Guards on AI config
    const citizenAiReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: citizenToken,
      body: { confidenceThreshold: 0.85 },
    });
    const citizenAiRes = await postAiConfigRoute(citizenAiReq);
    assert(citizenAiRes.status === 403, "Citizen attempting to alter AI threshold is rejected with HTTP 403");

    const unauthAiReq = createTestRequest("http://localhost:3000/api/state/ai-config", {
      token: null,
      body: { confidenceThreshold: 0.85 },
    });
    const unauthAiRes = await postAiConfigRoute(unauthAiReq);
    assert(unauthAiRes.status === 401, "Unauthenticated AI threshold modification is rejected with HTTP 401");


    // =========================================================================
    // SUITE 4: INDUSTRY USER APPROVAL, REJECTION & SECURITY ROLE GUARDS
    // =========================================================================
    console.log("\n>>> [SUITE 4] Industry User Approval, Rejection & Role Guard Hardening...");

    // Create 2 fresh pending industry users with unique emails
    const pendingIndustryUser1 = await prisma.user.create({
      data: {
        email: `pending.ind.1.${testRunId}@tatasteel.com`,
        name: "Dr. Vikram Sethi (Pending)",
        role: UserRole.INDUSTRY,
        status: UserStatus.PENDING,
        passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
        organization: "Tata Motors CSR Foundation",
        designation: "Head of Social R&D",
        district: "East Singhbhum",
      },
    });

    const pendingIndustryUser2 = await prisma.user.create({
      data: {
        email: `pending.ind.2.${testRunId}@shellcorp.invalid`,
        name: "Bogus Corporate Rep",
        role: UserRole.INDUSTRY,
        status: UserStatus.PENDING,
        passwordHash: "$2a$12$dummyhashtestforadversarialharness000000000000000000000",
        organization: "Shell Corp India",
        district: "Ranchi",
      },
    });

    assert(!!pendingIndustryUser1 && !!pendingIndustryUser2, "Provisioned 2 pending industry accounts in database");

    // Test 4.1: List pending users via GET /api/admin/pending-users as STATE_ADMIN
    const listPendingReq = createTestRequest("http://localhost:3000/api/admin/pending-users", {
      token: stateAdminToken,
    });
    const listPendingRes = await getPendingUsers(listPendingReq);
    const listPendingJson = await listPendingRes.json();

    assert(listPendingRes.status === 200, "GET /api/admin/pending-users authorized for STATE_ADMIN (returns 200)");
    const foundUser1 = listPendingJson.pendingUsers?.some((u: any) => u.id === pendingIndustryUser1.id);
    assert(foundUser1, "Pending list includes provisioned industry user #1");

    // Test 4.2: Approve Pending Industry User #1
    const approveReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: {
        userId: pendingIndustryUser1.id,
        action: "approve",
      },
    });

    const approveRes = await approveUser(approveReq);
    const approveJson = await approveRes.json();

    assert(approveRes.status === 200, "POST /api/admin/approve-user (action: approve) returns HTTP 200 OK");
    assert(approveJson.success === true && approveJson.newStatus === "ACTIVE", "Response confirms status = ACTIVE");

    const approvedUserDb = await prisma.user.findUnique({ where: { id: pendingIndustryUser1.id } });
    assert(approvedUserDb?.status === "ACTIVE", "Database record updated to ACTIVE status");

    const approveAudit = await prisma.auditLog.findFirst({
      where: {
        resource: "User",
        resourceId: pendingIndustryUser1.id,
        action: "APPROVE_INDUSTRY_USER",
      },
      orderBy: { createdAt: "desc" },
    });
    assert(!!approveAudit, "AuditLog recorded for APPROVE_INDUSTRY_USER");
    assert(approveAudit?.userId === stateAdminUser.id, `AuditLog actor correctly matches State Admin (${stateAdminUser.id})`);

    // Test 4.3: Reject Pending Industry User #2
    const rejectReason = "Failed MCA-21 CIN validation and CSR registration compliance check";
    const rejectReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: {
        userId: pendingIndustryUser2.id,
        action: "reject",
        reason: rejectReason,
      },
    });

    const rejectRes = await approveUser(rejectReq);
    const rejectJson = await rejectRes.json();

    assert(rejectRes.status === 200, "POST /api/admin/approve-user (action: reject) returns HTTP 200 OK");
    assert(rejectJson.success === true && rejectJson.newStatus === "SUSPENDED", "Response confirms status = SUSPENDED");

    const rejectedUserDb = await prisma.user.findUnique({ where: { id: pendingIndustryUser2.id } });
    assert(rejectedUserDb?.status === "SUSPENDED", "Database record updated to SUSPENDED status");

    const rejectAudit = await prisma.auditLog.findFirst({
      where: {
        resource: "User",
        resourceId: pendingIndustryUser2.id,
        action: "REJECT_INDUSTRY_USER",
      },
      orderBy: { createdAt: "desc" },
    });
    assert(!!rejectAudit, "AuditLog recorded for REJECT_INDUSTRY_USER");
    if (rejectAudit?.newState) {
      const parsedAudit = JSON.parse(rejectAudit.newState);
      assert(parsedAudit.reason === rejectReason, "AuditLog records non-compliance rejection reason");
    }

    // Verify neither user is in pending list anymore
    const listAgainReq = createTestRequest("http://localhost:3000/api/admin/pending-users", {
      token: stateAdminToken,
    });
    const listAgainRes = await getPendingUsers(listAgainReq);
    const listAgainJson = await listAgainRes.json();
    const stillPending = listAgainJson.pendingUsers?.some(
      (u: any) => u.id === pendingIndustryUser1.id || u.id === pendingIndustryUser2.id
    );
    assert(!stillPending, "Approved and Rejected users removed from pending registration queue");

    // Test 4.4: Adversarial Security & Role Guard Attacks on User Management
    console.log("\n  * Testing Adversarial Attacks on User Approval & Management...");

    // Attack 1: Citizen attempts to approve user
    const citizenApproveReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: citizenToken,
      body: { userId: pendingIndustryUser1.id, action: "approve" },
    });
    const citizenApproveRes = await approveUser(citizenApproveReq);
    assert(citizenApproveRes.status === 403, "Citizen attempting user approval is rejected with HTTP 403 Forbidden");

    // Attack 2: University PI attempts to approve user
    const uniApproveReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: universityToken,
      body: { userId: pendingIndustryUser1.id, action: "approve" },
    });
    const uniApproveRes = await approveUser(uniApproveReq);
    assert(uniApproveRes.status === 403, "University PI attempting user approval is rejected with HTTP 403 Forbidden");

    // Attack 3: Industry user attempts to approve themselves
    const indSelfApproveReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: industryToken,
      body: { userId: industryUser.id, action: "approve" },
    });
    const indSelfApproveRes = await approveUser(indSelfApproveReq);
    assert(indSelfApproveRes.status === 403, "Industry user attempting self-approval is rejected with HTTP 403 Forbidden");

    // Attack 4: Unauthenticated approval attempt
    const unauthApproveReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: null,
      body: { userId: pendingIndustryUser1.id, action: "approve" },
    });
    const unauthApproveRes = await approveUser(unauthApproveReq);
    assert(unauthApproveRes.status === 401, "Unauthenticated user approval attempt is rejected with HTTP 401 Unauthorized");

    // Attack 5: Missing CSRF token header
    const noCsrfReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: { userId: pendingIndustryUser1.id, action: "approve" },
      omitCsrf: true,
    });
    const noCsrfRes = await approveUser(noCsrfReq);
    assert(noCsrfRes.status === 403, "Request without X-CSRF-Token is rejected with HTTP 403 Forbidden");

    // Attack 6: Invalid / Forged CSRF token
    const forgedCsrfReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: { userId: pendingIndustryUser1.id, action: "approve" },
      csrfToken: "forged.tampered.csrf.signature",
    });
    const forgedCsrfRes = await approveUser(forgedCsrfReq);
    assert(forgedCsrfRes.status === 403, "Request with forged CSRF token is rejected with HTTP 403 Forbidden");

    // Attack 7: Invalid Action (e.g. action: "grant_superadmin")
    const invalidActionReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: { userId: pendingIndustryUser1.id, action: "grant_superadmin" },
    });
    const invalidActionRes = await approveUser(invalidActionReq);
    assert(invalidActionRes.status === 400, "Invalid action ('grant_superadmin') is rejected with HTTP 400 Bad Request");

    // Attack 8: Non-existent userId
    const nonExistentUserReq = createTestRequest("http://localhost:3000/api/admin/approve-user", {
      token: stateAdminToken,
      body: { userId: "fake_cuid_that_does_not_exist_999", action: "approve" },
    });
    const nonExistentUserRes = await approveUser(nonExistentUserReq);
    assert(nonExistentUserRes.status === 404, "Non-existent userId returns HTTP 404 Not Found");

    // Attack 9: Unauthorized access to pending users list
    const unauthPendingReq = createTestRequest("http://localhost:3000/api/admin/pending-users", {
      token: citizenToken,
    });
    const unauthPendingRes = await getPendingUsers(unauthPendingReq);
    assert(unauthPendingRes.status === 403, "Citizen attempting to read pending user roster is rejected with HTTP 403");

  } catch (error: any) {
    console.error("\n💥 UNHANDLED EXCEPTION IN ADVERSARIAL TEST HARNESS:", error);
    failed++;
  } finally {
    // Teardown / Cleanup of temporary adversarial test records
    console.log("\n>>> [CLEANUP] Cleaning up transient adversarial test fixtures...");
    try {
      await prisma.auditLog.deleteMany({
        where: {
          resourceId: { contains: testRunId },
        },
      });
      await prisma.fundingCommitment.deleteMany({
        where: { escrowRef: { contains: testRunId } },
      });
      await prisma.proposal.deleteMany({
        where: { proposalRef: { contains: testRunId } },
      });
      await prisma.challenge.deleteMany({
        where: { publicTrackingId: { contains: testRunId } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: testRunId } },
      });
      console.log("  ✅ Cleanup complete.");
    } catch (cleanupErr) {
      console.warn("  ⚠️ Non-critical cleanup warning:", cleanupErr);
    }

    await prisma.$disconnect();
  }

  console.log("\n" + "=".repeat(75));
  console.log(`   ADVERSARIAL HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=".repeat(75) + "\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdversarialOverridesSuite();
