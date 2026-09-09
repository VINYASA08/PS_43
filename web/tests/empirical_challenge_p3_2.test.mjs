import assert from "node:assert/strict";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const BASE_URL = "http://127.0.0.1:3005";
const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode("jharkhand-societal-innovation-portal-secure-jwt-key-2026-production-grade");
const CSRF_SECRET = "jharkhand-portal-csrf-secret-token-key-2026-secure-production-grade";

function generateCsrfToken() {
  const rawId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", CSRF_SECRET).update(`${rawId}.${timestamp}`).digest("hex");
  return `${rawId}.${timestamp}.${signature}`;
}

async function createSessionToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

let passed = 0;
let failed = 0;
const results = [];

async function runTest(name, fn) {
  try {
    console.log(`\n▶ RUNNING: ${name}`);
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
    results.push({ name, status: "PASS" });
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error:`, err);
    failed++;
    results.push({ name, status: "FAIL", error: err.message });
  }
}

async function main() {
  console.log("===============================================================================");
  console.log("EMPIRICAL TEST SUITE: DATABASE, API ENDPOINTS & EDGE CASES");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log("===============================================================================");

  // Fetch test users from DB
  const govUser = await prisma.user.findFirst({ where: { role: "GOV" } });
  const uniUser = await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
  const indUser = await prisma.user.findFirst({ where: { role: "INDUSTRY", status: "ACTIVE" } });
  let citizenUser = await prisma.user.findFirst({ where: { role: "CITIZEN" } });

  if (!citizenUser) {
    citizenUser = await prisma.user.create({
      data: {
        name: "Test Citizen Empirical",
        phone: "+919999888877",
        role: "CITIZEN",
        status: "ACTIVE",
        passwordHash: "N/A",
      },
    });
  }

  assert.ok(govUser, "Gov user must exist in database");
  assert.ok(uniUser, "University user must exist in database");
  assert.ok(indUser, "Industry user must exist in database");

  const govToken = await createSessionToken({
    userId: govUser.id,
    email: govUser.email,
    name: govUser.name,
    role: govUser.role,
    status: govUser.status,
    organization: govUser.organization,
    district: govUser.district,
  });

  const uniToken = await createSessionToken({
    userId: uniUser.id,
    email: uniUser.email,
    name: uniUser.name,
    role: uniUser.role,
    status: uniUser.status,
    organization: uniUser.organization,
    district: uniUser.district,
  });

  const indToken = await createSessionToken({
    userId: indUser.id,
    email: indUser.email,
    name: indUser.name,
    role: indUser.role,
    status: indUser.status,
    organization: indUser.organization,
    district: indUser.district,
  });

  const citizenToken = await createSessionToken({
    userId: citizenUser.id,
    phone: citizenUser.phone,
    name: citizenUser.name,
    role: citizenUser.role,
    status: citizenUser.status,
  });

  // ---------------------------------------------------------------------------
  // TASK 1: TEST SOFT DELETION
  // ---------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log("TASK 1: SOFT DELETION VERIFICATION");
  console.log("===============================================================================");

  let softDeleteChallengeId = null;
  let softDeleteTrackingId = null;

  await runTest("1.1 Create Challenge to Test Soft Deletion", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "cookie": `sih_session=${citizenToken}; sih_csrf=${csrf}`,
      },
      body: JSON.stringify({
        title: "Temporary Challenge For Soft Delete Testing",
        description: "This challenge is created specifically to verify soft deletion mechanism and DB filter.",
        domain: "Water Management",
        district: "Dhanbad",
        location: "Ward 12, Katras Bazar",
        urgency: "HIGH",
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.ok(data.challenge?.id, "Challenge ID must be returned");
    assert.ok(data.trackingId, "Tracking ID must be returned");

    softDeleteChallengeId = data.challenge.id;
    softDeleteTrackingId = data.trackingId;

    // Verify in database that deletedAt is initially null
    const inDb = await prisma.challenge.findUnique({ where: { id: softDeleteChallengeId } });
    assert.ok(inDb, "Challenge must exist in database");
    assert.equal(inDb.deletedAt, null, "deletedAt must initially be null");
  });

  await runTest("1.2 Soft Delete Challenge via DELETE /api/challenges/[id]", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/challenges/${softDeleteChallengeId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": csrf,
        "cookie": `sih_session=${govToken}; sih_csrf=${csrf}`,
      },
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(data)}`);
    assert.equal(data.success, true, "Response must indicate success");
  });

  await runTest("1.3 Verify deletedAt timestamp is set in SQLite database", async () => {
    // Query directly via raw SQL or un-extended client to inspect the raw database row
    const rawRows = await prisma.$queryRawUnsafe(
      `SELECT id, publicTrackingId, deletedAt FROM Challenge WHERE id = ?`,
      softDeleteChallengeId
    );

    assert.equal(rawRows.length, 1, "Record must still exist physically in the database");
    assert.ok(rawRows[0].deletedAt, "deletedAt timestamp MUST be set in the database");
    console.log(`    Confirmed DB deletedAt timestamp: ${rawRows[0].deletedAt}`);
  });

  await runTest("1.4 Verify querying /api/challenges does NOT return the deleted record", async () => {
    const res = await fetch(`${BASE_URL}/api/challenges?limit=100`);
    const data = await res.json();
    assert.equal(res.status, 200, "Expected status 200 from challenges list");

    const found = data.challenges.find((c) => c.id === softDeleteChallengeId || c.publicTrackingId === softDeleteTrackingId);
    assert.equal(found, undefined, "Soft-deleted challenge must NOT be present in GET /api/challenges response");
  });

  await runTest("1.5 Verify AuditLog entry recorded for CHALLENGE_SOFT_DELETED", async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        resourceId: softDeleteChallengeId,
        action: "CHALLENGE_SOFT_DELETED",
      },
    });

    assert.ok(auditLogs.length >= 1, "AuditLog entry for CHALLENGE_SOFT_DELETED must exist");
    assert.equal(auditLogs[0].userId, govUser.id, "Audit log must record actor user ID");
    console.log(`    Confirmed AuditLog ID: ${auditLogs[0].id} (Action: ${auditLogs[0].action})`);
  });

  // ---------------------------------------------------------------------------
  // TASK 2: TEST END-TO-END PROBLEM-TO-FUNDING LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log("TASK 2: END-TO-END PROBLEM-TO-FUNDING LIFECYCLE");
  console.log("===============================================================================");

  let lifecycleChallengeId = null;
  let lifecycleTrackingId = null;
  let lifecycleProposalId = null;
  let lifecycleProposalRef = null;
  let lifecycleEscrowRef = null;

  await runTest("2.1 Citizen Submits Challenge (POST /api/challenges)", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "cookie": `sih_session=${citizenToken}; sih_csrf=${csrf}`,
      },
      body: JSON.stringify({
        title: "Empirical E2E Arsenic & Fluoride Water Contamination",
        description: "Contaminated ground water reported in rural community affecting 1,200 households with severe fluoride staining.",
        domain: "Water Management",
        district: "Gumla",
        location: "Chainpur Block, Sub-center 4",
        urgency: "CRITICAL",
        evidence: JSON.stringify({ ph: "5.1", fluoride: "3.8 mg/L", arsenic: "0.08 mg/L" }),
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.ok(data.trackingId, "Expected trackingId");
    assert.match(data.trackingId, /^IN-GR-2026-\d{4}$/, "Tracking ID must match IN-GR-2026-XXXX");

    lifecycleChallengeId = data.challenge.id;
    lifecycleTrackingId = data.trackingId;

    // Verify DB state
    const challengeInDb = await prisma.challenge.findUnique({ where: { id: lifecycleChallengeId } });
    assert.equal(challengeInDb.status, "REPORTED");
    assert.equal(challengeInDb.reportedById, citizenUser.id);

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: { challengeId: lifecycleChallengeId, action: "CHALLENGE_CREATED" },
    });
    assert.ok(audit, "AuditLog for CHALLENGE_CREATED must exist");
    console.log(`    Generated Tracking ID: ${lifecycleTrackingId}, Audit Log: ${audit.id}`);
  });

  await runTest("2.2 University Submits Translational Research Proposal (POST /api/proposals)", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "cookie": `sih_session=${uniToken}; sih_csrf=${csrf}`,
      },
      body: JSON.stringify({
        challengeId: lifecycleChallengeId,
        universityName: "IIT (ISM) Dhanbad",
        title: "Nano-adsorptive Graphene Filter Pilot for Fluoride & Arsenic",
        abstract: "Deployment of low-cost regenerated activated alumina and graphene composite columns with solar backwash.",
        methodology: "Phase 1: Lab titration. Phase 2: Community column installation. Phase 3: Telemetric IoT sensor loop.",
        budget: 480000,
        timelineMonths: 8,
        stage: "Prototype Ready",
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.ok(data.proposal?.id, "Proposal ID must be returned");
    assert.match(data.proposal.proposalRef, /^PR-\d{3,4}$/, "Proposal reference must match PR-XXX");

    lifecycleProposalId = data.proposal.id;
    lifecycleProposalRef = data.proposal.proposalRef;

    // Verify DB state
    const proposalInDb = await prisma.proposal.findUnique({ where: { id: lifecycleProposalId } });
    assert.equal(proposalInDb.status, "SUBMITTED");
    assert.equal(proposalInDb.budget, 480000);

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: { resourceId: lifecycleProposalId, action: "PROPOSAL_SUBMITTED" },
    });
    assert.ok(audit, "AuditLog for PROPOSAL_SUBMITTED must exist");
    console.log(`    Generated Proposal Ref: ${lifecycleProposalRef}, Audit Log: ${audit.id}`);
  });

  await runTest("2.3 Gov Reviews and Approves Proposal Status (PUT /api/proposals/[id])", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/proposals/${lifecycleProposalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "cookie": `sih_session=${govToken}; sih_csrf=${csrf}`,
      },
      body: JSON.stringify({
        status: "APPROVED",
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(data)}`);
    assert.equal(data.proposal.status, "APPROVED");

    // Verify DB state
    const proposalInDb = await prisma.proposal.findUnique({ where: { id: lifecycleProposalId } });
    assert.equal(proposalInDb.status, "APPROVED");

    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: { resourceId: lifecycleProposalId, action: "PROPOSAL_UPDATED" },
    });
    assert.ok(audit, "AuditLog for PROPOSAL_UPDATED must exist");
    console.log(`    Confirmed Proposal Approved. Audit Log: ${audit.id}`);
  });

  await runTest("2.4 Industry Commits CSR Escrow Funding (POST /api/funds)", async () => {
    const csrf = generateCsrfToken();
    const res = await fetch(`${BASE_URL}/api/funds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
        "cookie": `sih_session=${indToken}; sih_csrf=${csrf}`,
      },
      body: JSON.stringify({
        proposalId: lifecycleProposalId,
        amount: 480000,
        type: "CSR",
        corporateName: "Tata Steel CSR Division",
        panNumber: "AAACT1234F",
        csrRegistrationNo: "CSR0001842",
        notes: "Section 135 CSR allocation committed in State Escrow Node with 30-40-30 tranches.",
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.ok(data.commitment?.id, "FundingCommitment ID must be returned");
    assert.match(data.commitment.escrowRef, /^JH-ESCROW-2026-CSR-\d{4}$/, "Escrow Ref must match pattern");

    lifecycleEscrowRef = data.commitment.escrowRef;

    // Verify in DB that FundingCommitment is ESCROWED
    const commitmentInDb = await prisma.fundingCommitment.findUnique({ where: { id: data.commitment.id } });
    assert.equal(commitmentInDb.status, "ESCROWED");
    assert.equal(commitmentInDb.amount, 480000);

    // Verify Proposal status transitioned to FUNDED
    const proposalInDb = await prisma.proposal.findUnique({ where: { id: lifecycleProposalId } });
    assert.equal(proposalInDb.status, "FUNDED");

    // Verify Challenge status transitioned to IN_PROGRESS
    const challengeInDb = await prisma.challenge.findUnique({ where: { id: lifecycleChallengeId } });
    assert.equal(challengeInDb.status, "IN_PROGRESS");

    // Verify AuditLog for ESCROW_COMMITTED
    const audit = await prisma.auditLog.findFirst({
      where: { resourceId: data.commitment.id, action: "ESCROW_COMMITTED" },
    });
    assert.ok(audit, "AuditLog for ESCROW_COMMITTED must exist");
    console.log(`    Committed Escrow: ${lifecycleEscrowRef}, Challenge Status: ${challengeInDb.status}, Audit Log: ${audit.id}`);
  });

  // ---------------------------------------------------------------------------
  // TASK 3: TEST PUBLIC TRACKING ENDPOINT
  // ---------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log("TASK 3: PUBLIC TRACKING ENDPOINT VERIFICATION (/api/track/[id])");
  console.log("===============================================================================");

  await runTest("3.1 Query Seeded Tracking ID (IN-GR-2026-9842)", async () => {
    const res = await fetch(`${BASE_URL}/api/track/IN-GR-2026-9842`);
    const data = await res.json();

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(data.success, true);
    assert.ok(data.issue, "Response must include issue docket");
    assert.equal(data.issue.id, "IN-GR-2026-9842");

    // Verify SLA Timeline stages
    assert.ok(Array.isArray(data.issue.timeline), "Timeline must be an array");
    assert.equal(data.issue.timeline.length, 5, "Timeline must contain 5 workflow stages");
    assert.equal(data.issue.timeline[0].step, 1);
    assert.equal(data.issue.timeline[0].title, "Submitted by Citizen");
    assert.equal(data.issue.timeline[0].status, "completed");

    // Verify Telemetry
    assert.ok(Array.isArray(data.issue.telemetry), "Telemetry must be an array");
    assert.ok(data.issue.telemetry.length >= 3, "Expected at least 3 telemetry metrics");
    const phMetric = data.issue.telemetry.find((t) => t.label === "pH Level");
    assert.ok(phMetric, "pH metric must exist for water challenge");
    console.log(`    Seeded issue telemetry: ${data.issue.telemetry.map(t => `${t.label}: ${t.value}`).join(", ")}`);

    // Verify Audit Logs
    assert.ok(Array.isArray(data.issue.logs), "Logs must be an array");
    assert.ok(data.issue.logs.length >= 1, "Must contain at least 1 audit history item");
  });

  await runTest("3.2 Query Newly Created E2E Lifecycle Tracking ID", async () => {
    assert.ok(lifecycleTrackingId, "Tracking ID from Task 2 must exist");
    const res = await fetch(`${BASE_URL}/api/track/${lifecycleTrackingId}`);
    const data = await res.json();

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(data.success, true);
    assert.equal(data.issue.id, lifecycleTrackingId);
    assert.equal(data.issue.fundingEscrow, "₹4,80,000 (Escrowed)");
    assert.equal(data.issue.slaStatus, "On Track");

    // Verify Timeline step 4 is completed because funds are committed
    assert.equal(data.issue.timeline[3].step, 4);
    assert.equal(data.issue.timeline[3].status, "completed");
    assert.match(data.issue.timeline[3].date, /JH-ESCROW-2026-CSR-/);

    // Verify Audit Logs contain all lifecycle events
    const logActions = data.issue.logs.map(l => l.action.toLowerCase());
    console.log(`    Public track logs for ${lifecycleTrackingId}:`, logActions);
    assert.ok(data.issue.logs.length >= 3, "Must reflect all lifecycle actions in public ledger");
  });

  await runTest("3.3 Query Non-Existent Tracking ID Returns 404", async () => {
    const res = await fetch(`${BASE_URL}/api/track/IN-INVALID-9999`);
    const data = await res.json();
    assert.equal(res.status, 404, "Expected 404 for non-existent tracking ID");
    assert.equal(data.error, "Issue docket not found.");
  });

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`FINAL EMPIRICAL VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(async (err) => {
  console.error("Fatal test execution error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
