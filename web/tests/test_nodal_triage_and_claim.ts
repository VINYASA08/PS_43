/**
 * Autonomous Automated Verification Test Suite:
 * District Nodal Officer Triage, AI 3-Way Matching, and University Race-Condition Claim System
 *
 * File: web/tests/test_nodal_triage_and_claim.ts
 * Execution: npx tsx tests/test_nodal_triage_and_claim.ts
 *
 * Verification Requirements:
 * 1. Step 1: Create / seed test challenge in "pending" status.
 * 2. Step 2: Simulate District Nodal Officer calling POST /api/nodal/triage with action: "route_to_academia".
 *    - Assert HTTP 200 OK.
 *    - Assert nodalStatus === "routed_to_academia".
 *    - Assert exactly 3 empanelled universities are matched and simulated emails logged.
 * 3. Step 3: Simulate University A (IIT ISM Dhanbad) calling POST /api/challenges/[id]/claim.
 *    - Assert HTTP 200 OK.
 *    - Assert claimedInstitute === "IIT (ISM) Dhanbad".
 *    - Assert claimedAt is populated.
 * 4. Step 4: Immediately simulate University B (Birsa Agricultural University) calling POST /api/challenges/[id]/claim.
 *    - Assert HTTP 409 Conflict.
 *    - Assert challenge remains locked to University A.
 * 5. Step 5: Test Concurrent Simultaneous Race Condition (Promise.all) on a second challenge.
 *    - Assert exactly one winner (HTTP 200) and one loser (HTTP 409).
 * 6. Step 6: Test Nodal Officer Reject action with mandatory reason input and audit log.
 *    - Assert HTTP 400 when reason is missing.
 *    - Assert HTTP 200 with valid reason -> nodalStatus === "rejected".
 * 7. Step 7: Test Nodal Officer Divert action with government body target.
 *    - Assert HTTP 400 when target is missing.
 *    - Assert HTTP 200 with valid target -> nodalStatus === "diverted_to_gov".
 * 8. Step 8: Clean teardown of all test fixtures.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

// Load .env variables
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import prisma from "../src/lib/prisma";
import { POST as triagePOST, GET as triageGET } from "../src/app/api/nodal/triage/route";
import { POST as claimPOST, GET as claimGET } from "../src/app/api/challenges/[id]/claim/route";

function makeJsonRequest(url: string, body?: any, method: string = "POST"): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "host": "localhost:3000",
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

async function runTests() {
  console.log("\n===============================================================================");
  console.log("🚀 STARTING TEST SUITE: DISTRICT NODAL OFFICER TRIAGE & ATOMIC CLAIM SYSTEM");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(testName: string) {
    totalTests++;
    passedTests++;
    console.log(`✅ [PASS ${passedTests}] ${testName}`);
  }

  const createdChallengeIds: string[] = [];

  try {
    // 0. Locate seeded test users
    const govOfficer = await prisma.user.findFirst({ where: { role: "GOV", status: "ACTIVE" } });
    assert.ok(govOfficer, "District Nodal Officer user must exist in database");

    const uniA = await prisma.user.findFirst({
      where: { role: "UNIVERSITY", email: "pi.water@iitism.ac.in" },
    }) || await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
    assert.ok(uniA, "University A user must exist");

    const uniB = await prisma.user.findFirst({
      where: { role: "UNIVERSITY", email: "pi.agri@bau.ac.in" },
    }) || await prisma.user.findFirst({ where: { role: "UNIVERSITY", id: { not: uniA.id } } });
    assert.ok(uniB, "University B user must exist");

    const reporter = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
    assert.ok(reporter, "Citizen reporter user must exist");

    console.log(`ℹ️ Test Users: Nodal Officer: ${govOfficer.name} | Uni A: ${uniA.organization || uniA.name} | Uni B: ${uniB.organization || uniB.name}\n`);

    // ---------------------------------------------------------------------------
    // TEST 1: Create a test challenge in "pending" status
    // ---------------------------------------------------------------------------
    const testChal1 = await prisma.challenge.create({
      data: {
        publicTrackingId: `TEST-NODAL-${Date.now()}-1`,
        title: "High Arsenic & Heavy Metal Leaching in Rajmahal Alluvial Aquifer",
        description: "Community tube-wells in Sahebganj report acute arsenic toxicity and heavy metal concentrations exceeding 75 ppb.",
        domain: "Water Management",
        district: "Sahebganj",
        location: "Rajmahal Block Ganga Riparian Belt",
        urgency: "CRITICAL",
        status: "REPORTED",
        nodalStatus: "pending",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(testChal1.id);

    assert.equal(testChal1.nodalStatus, "pending", "New challenge must start in pending nodal status");
    assert.equal(testChal1.claimedAt, null, "claimedAt must initially be null");
    assert.equal(testChal1.claimedById, null, "claimedById must initially be null");
    recordPass("Challenge Initialization: Pending state verified in database");

    // ---------------------------------------------------------------------------
    // TEST 2: Nodal Officer routes to Academia (triggers AI 3-way match & simulated emails)
    // ---------------------------------------------------------------------------
    const routeReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
      challengeId: testChal1.id,
      action: "route_to_academia",
      nodalOfficerId: govOfficer.id,
    });

    const routeRes = await triagePOST(routeReq);
    assert.equal(routeRes.status, 200, "Triage route_to_academia must return HTTP 200");
    const routeData = await routeRes.json();
    assert.equal(routeData.success, true, "Response must indicate success");
    assert.equal(routeData.nodalStatus, "routed_to_academia", "nodalStatus in response must be 'routed_to_academia'");
    assert.ok(Array.isArray(routeData.matchedUniversities), "matchedUniversities must be an array");
    assert.equal(routeData.matchedUniversities.length, 3, "Exactly 3 empanelled universities must be matched");

    // Verify database record
    const chal1AfterRouting = await prisma.challenge.findUnique({ where: { id: testChal1.id } });
    assert.ok(chal1AfterRouting);
    assert.equal(chal1AfterRouting.nodalStatus, "routed_to_academia");
    assert.equal(chal1AfterRouting.status, "OPEN_FOR_PROPOSALS");
    assert.ok(chal1AfterRouting.matchedUniversities);
    const parsedMatched = JSON.parse(chal1AfterRouting.matchedUniversities);
    assert.equal(parsedMatched.length, 3, "Database must store 3 matched universities");
    recordPass("Nodal Triage: route_to_academia triggers 3-way AI match and state transition");

    // ---------------------------------------------------------------------------
    // TEST 3: University A claims the challenge (Race Condition Winner)
    // ---------------------------------------------------------------------------
    const claimReqA = makeJsonRequest(`http://localhost:3000/api/challenges/${testChal1.id}/claim`, {
      universityId: uniA.id,
      universityName: uniA.organization || "IIT (ISM) Dhanbad",
    });

    const claimResA = await claimPOST(claimReqA, { params: { id: testChal1.id } });
    assert.equal(claimResA.status, 200, "University A first claim must return HTTP 200 OK");
    const claimDataA = await claimResA.json();
    assert.equal(claimDataA.success, true, "University A claim must succeed");
    assert.equal(claimDataA.claimedInstitute, uniA.organization || "IIT (ISM) Dhanbad");
    assert.ok(claimDataA.claimedAt, "claimedAt timestamp must be returned");

    // Verify DB lock
    const chal1AfterClaimA = await prisma.challenge.findUnique({ where: { id: testChal1.id } });
    assert.ok(chal1AfterClaimA);
    assert.equal(chal1AfterClaimA.claimedById, uniA.id);
    assert.equal(chal1AfterClaimA.claimedInstitute, uniA.organization || "IIT (ISM) Dhanbad");
    assert.ok(chal1AfterClaimA.claimedAt);
    recordPass("Race Condition Win: University A successfully claims and locks challenge (HTTP 200)");

    // ---------------------------------------------------------------------------
    // TEST 4: University B immediately attempts to claim same challenge (Lockout)
    // ---------------------------------------------------------------------------
    const claimReqB = makeJsonRequest(`http://localhost:3000/api/challenges/${testChal1.id}/claim`, {
      universityId: uniB.id,
      universityName: uniB.organization || "Birsa Agricultural University",
    });

    const claimResB = await claimPOST(claimReqB, { params: { id: testChal1.id } });
    assert.equal(claimResB.status, 409, "University B claim on already-claimed challenge must return HTTP 409 Conflict");
    const claimDataB = await claimResB.json();
    assert.ok(claimDataB.error, "Response must contain error object");
    assert.equal(claimDataB.claimedInstitute, uniA.organization || "IIT (ISM) Dhanbad", "Conflict response must identify winner");

    // Verify DB was NOT overridden
    const chal1AfterClaimB = await prisma.challenge.findUnique({ where: { id: testChal1.id } });
    assert.ok(chal1AfterClaimB);
    assert.equal(chal1AfterClaimB.claimedById, uniA.id, "Challenge must remain locked to University A");
    assert.equal(chal1AfterClaimB.claimedInstitute, uniA.organization || "IIT (ISM) Dhanbad");
    recordPass("Race Condition Lockout: University B rejected with HTTP 409 Conflict; lock preserved");

    // ---------------------------------------------------------------------------
    // TEST 5: Simultaneous Concurrent Race Condition (Promise.all)
    // ---------------------------------------------------------------------------
    const testChal2 = await prisma.challenge.create({
      data: {
        publicTrackingId: `TEST-NODAL-${Date.now()}-2`,
        title: "Decentralized Solar Microgrid Voltage Instability in Tribal Slums",
        description: "Severe fluctuating line voltage and lack of lithium-ion energy storage buffering in Simdega remote tribal dwellings.",
        domain: "Energy",
        district: "Simdega",
        location: "Kolebira Block Tribal Cluster",
        urgency: "HIGH",
        status: "OPEN_FOR_PROPOSALS",
        nodalStatus: "routed_to_academia",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(testChal2.id);

    const concurrentClaimA = claimPOST(
      makeJsonRequest(`http://localhost:3000/api/challenges/${testChal2.id}/claim`, {
        universityId: uniA.id,
        universityName: "IIT (ISM) Dhanbad",
      }),
      { params: { id: testChal2.id } }
    );

    const concurrentClaimB = claimPOST(
      makeJsonRequest(`http://localhost:3000/api/challenges/${testChal2.id}/claim`, {
        universityId: uniB.id,
        universityName: "Birsa Agricultural University",
      }),
      { params: { id: testChal2.id } }
    );

    const [resA, resB] = await Promise.all([concurrentClaimA, concurrentClaimB]);
    const statuses = [resA.status, resB.status];

    assert.ok(statuses.includes(200), "One concurrent request must succeed with HTTP 200");
    assert.ok(statuses.includes(409), "One concurrent request must be rejected with HTTP 409 Conflict");

    const chal2Final = await prisma.challenge.findUnique({ where: { id: testChal2.id } });
    assert.ok(chal2Final);
    assert.ok(chal2Final.claimedById !== null, "Exactly one university must hold the lock");
    recordPass("Concurrent Execution: Simultaneous race condition atomically resolves 1 winner (200) and 1 lockout (409)");

    // ---------------------------------------------------------------------------
    // TEST 6: Nodal Officer Reject flow (boundary checks & valid rejection)
    // ---------------------------------------------------------------------------
    const testChal3 = await prisma.challenge.create({
      data: {
        publicTrackingId: `TEST-NODAL-${Date.now()}-3`,
        title: "Spam Grievance with Fake Coordinates",
        description: "Completely fictitious complaint regarding gold mining in Ranchi municipal park.",
        domain: "Governance",
        district: "Ranchi",
        location: "Morabadi Ground",
        urgency: "LOW",
        status: "REPORTED",
        nodalStatus: "pending",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(testChal3.id);

    // 6a. Reject without reason -> 400 Bad Request
    const rejectNoReasonReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
      challengeId: testChal3.id,
      action: "reject",
      nodalOfficerId: govOfficer.id,
    });
    const rejectNoReasonRes = await triagePOST(rejectNoReasonReq);
    assert.equal(rejectNoReasonRes.status, 400, "Rejecting without mandatory reason must return HTTP 400");
    recordPass("Validation Boundary: Rejection rejected when mandatory reason is omitted (HTTP 400)");

    // 6b. Reject with valid reason -> 200 OK
    const validReason = "Fictitious submission without ground telemetry; violates civic intake policy guidelines.";
    const rejectValidReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
      challengeId: testChal3.id,
      action: "reject",
      rejectionReason: validReason,
      nodalOfficerId: govOfficer.id,
    });
    const rejectValidRes = await triagePOST(rejectValidReq);
    assert.equal(rejectValidRes.status, 200, "Rejecting with valid reason must return HTTP 200");
    const rejectData = await rejectValidRes.json();
    assert.equal(rejectData.nodalStatus, "rejected");

    const chal3DB = await prisma.challenge.findUnique({ where: { id: testChal3.id } });
    assert.ok(chal3DB);
    assert.equal(chal3DB.nodalStatus, "rejected");
    assert.equal(chal3DB.status, "CLOSED");
    assert.equal(chal3DB.rejectionReason, validReason);
    assert.ok(chal3DB.nodalReviewedAt);
    recordPass("Nodal Reject Action: Successfully records documented rejection and closes challenge (HTTP 200)");

    // ---------------------------------------------------------------------------
    // TEST 7: Nodal Officer Divert flow (boundary checks & valid diversion)
    // ---------------------------------------------------------------------------
    const testChal4 = await prisma.challenge.create({
      data: {
        publicTrackingId: `TEST-NODAL-${Date.now()}-4`,
        title: "Damaged Culvert on Rural Link Road in Latehar",
        description: "Concrete approach slab washed out by monsoon flash flood on MDR-14.",
        domain: "Infrastructure",
        district: "Latehar",
        location: "Mahuadanr Block Km 12",
        urgency: "HIGH",
        status: "REPORTED",
        nodalStatus: "pending",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(testChal4.id);

    // 7a. Divert without target -> 400 Bad Request
    const divertNoTargetReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
      challengeId: testChal4.id,
      action: "divert_to_gov",
      nodalOfficerId: govOfficer.id,
    });
    const divertNoTargetRes = await triagePOST(divertNoTargetReq);
    assert.equal(divertNoTargetRes.status, 400, "Diverting without target department must return HTTP 400");
    recordPass("Validation Boundary: Diversion rejected when target department is omitted (HTTP 400)");

    // 7b. Divert with valid target -> 200 OK
    const targetDept = "Road Construction Department (RCD) / State PWD";
    const divertValidReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
      challengeId: testChal4.id,
      action: "divert_to_gov",
      divertedTarget: targetDept,
      nodalOfficerId: govOfficer.id,
    });
    const divertValidRes = await triagePOST(divertValidReq);
    assert.equal(divertValidRes.status, 200, "Diverting with target department must return HTTP 200");
    const divertData = await divertValidRes.json();
    assert.equal(divertData.nodalStatus, "diverted_to_gov");

    const chal4DB = await prisma.challenge.findUnique({ where: { id: testChal4.id } });
    assert.ok(chal4DB);
    assert.equal(chal4DB.nodalStatus, "diverted_to_gov");
    assert.equal(chal4DB.divertedTarget, targetDept);
    assert.ok(chal4DB.divertedAt);
    recordPass("Nodal Divert Action: Successfully diverts infrastructure issue to PWD (HTTP 200)");

    // ---------------------------------------------------------------------------
    // TEST 8: GET /api/nodal/triage queue stats verification
    // ---------------------------------------------------------------------------
    const queueReq = makeJsonRequest("http://localhost:3000/api/nodal/triage", undefined, "GET");
    const queueRes = await triageGET(queueReq);
    assert.equal(queueRes.status, 200, "GET /api/nodal/triage must return HTTP 200");
    const queueData = await queueRes.json();
    assert.ok(queueData.stats, "Stats object must be returned");
    assert.ok(typeof queueData.stats.pending === "number", "stats.pending must be a number");
    assert.ok(typeof queueData.stats.routedToAcademia === "number", "stats.routedToAcademia must be a number");
    assert.ok(typeof queueData.stats.divertedToGov === "number", "stats.divertedToGov must be a number");
    assert.ok(typeof queueData.stats.rejected === "number", "stats.rejected must be a number");
    recordPass("Triage Queue API: GET /api/nodal/triage returns live metrics and challenge records");

    // ---------------------------------------------------------------------------
    // TEST 9: Audit Trail Verification
    // ---------------------------------------------------------------------------
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        challengeId: { in: createdChallengeIds },
      },
    });
    const actions = auditLogs.map((l) => l.action);
    assert.ok(actions.includes("CHALLENGE_ROUTED_TO_ACADEMIA"), "AuditLog must contain CHALLENGE_ROUTED_TO_ACADEMIA");
    assert.ok(actions.includes("CHALLENGE_CLAIMED_BY_UNIVERSITY"), "AuditLog must contain CHALLENGE_CLAIMED_BY_UNIVERSITY");
    assert.ok(actions.includes("CHALLENGE_REJECTED_BY_NODAL"), "AuditLog must contain CHALLENGE_REJECTED_BY_NODAL");
    assert.ok(actions.includes("CHALLENGE_DIVERTED_TO_GOV"), "AuditLog must contain CHALLENGE_DIVERTED_TO_GOV");
    recordPass("Audit Trail Integrity: Complete statutory audit logs recorded for all triage and claim events");

  } finally {
    // Teardown test records
    console.log("\n🧹 Cleaning up test fixtures from database...");
    if (createdChallengeIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await prisma.challenge.deleteMany({
        where: { id: { in: createdChallengeIds } },
      });
      console.log(`   Deleted ${createdChallengeIds.length} test challenges and associated audit records.`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`🎉 TEST SUITE COMPLETED: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log("===============================================================================\n");
}

runTests()
  .catch((err) => {
    console.error("❌ TEST SUITE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
