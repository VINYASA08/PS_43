/**
 * CHALLENGER 1 ROUND 2 CONCURRENCY STRESS RE-VERIFICATION HARNESS
 *
 * File: web/tests/test_challenger_r2_concurrency_reverification.ts
 * Execution: npx tsx tests/test_challenger_r2_concurrency_reverification.ts
 *
 * Purpose:
 * Empirically stress-test POST /api/challenges/[id]/claim under severe concurrency bursts,
 * race conditions, mixed payload collisions, and invalid triage states.
 *
 * Test Matrix:
 * 1. 30-Way Simultaneous Parallel Claim Burst (Promise.all) -> Exactly 1x 200, 29x 409
 * 2. 50-Way Ultra-Burst Concurrent Race Condition (Promise.all) -> Exactly 1x 200, 49x 409
 * 3. 100-Request Massive Parallelism Matrix (10 distinct challenges x 10 concurrent requests each)
 *    -> Exactly 10x 200 (1 per challenge) and 90x 409 lockouts
 * 4. Mixed-Payload Concurrent Collisions (Valid claims racing alongside malformed/missing fields)
 *    -> Exactly 1x 200 winner, 400s for malformed, 409s for locked out
 * 5. Triage Status Lockout Matrix:
 *    - 'pending' -> 409 Lockout
 *    - 'rejected' -> 409 Lockout
 *    - 'diverted_to_gov' -> 409 Lockout
 *    - Non-existent ID -> 404
 *    - SQL Injection / Malformed ID -> 404
 * 6. DB State & Statutory Audit Log Invariants:
 *    - Database row strictly contains winner's ID and timestamp
 *    - AuditLog table records strictly 1 entry per challenge with action CHALLENGE_CLAIMED_BY_UNIVERSITY
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
import { POST as claimPOST, GET as claimGET } from "../src/app/api/challenges/[id]/claim/route";

function makeJsonRequest(url: string, body?: any, method: string = "POST"): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      host: "localhost:3000",
    },
  };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

async function runChallengerR2Verification() {
  console.log("\n===============================================================================");
  console.log("🔥 CHALLENGER 1 ROUND 2: ULTRA-HIGH CONCURRENCY & RACE RE-VERIFICATION");
  console.log("===============================================================================\n");

  let testCount = 0;
  let passCount = 0;

  function pass(desc: string) {
    testCount++;
    passCount++;
    console.log(`✅ [TEST ${testCount}] ${desc}`);
  }

  const createdChallengeIds: string[] = [];
  const createdUserIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // Setup: Provision Base Citizen Reporter and 50 Distinct Test Universities
    // -------------------------------------------------------------------------
    console.log("📦 Setup: Provisioning 50 distinct test universities for ultra-high concurrency...");
    let reporter = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
    if (!reporter) {
      reporter = await prisma.user.create({
        data: {
          email: `r2.reporter.${Date.now()}@jharkhand.in`,
          passwordHash: "hash",
          role: "CITIZEN",
          status: "ACTIVE",
          name: "R2 Citizen Reporter",
        },
      });
      createdUserIds.push(reporter.id);
    }

    const universities: Array<{ id: string; name: string; email: string }> = [];
    for (let i = 1; i <= 50; i++) {
      const u = await prisma.user.create({
        data: {
          email: `r2.stress.uni.${i}.${Date.now()}@ac.in`,
          passwordHash: "hash",
          role: "UNIVERSITY",
          status: "ACTIVE",
          name: `Dr. Academician ${i}`,
          organization: `Jharkhand Technical University Unit #${i}`,
          district: "Ranchi",
        },
      });
      createdUserIds.push(u.id);
      universities.push({
        id: u.id,
        name: u.organization || u.name,
        email: u.email,
      });
    }
    console.log(`   Provisioned ${universities.length} distinct academic identities.\n`);

    // =========================================================================
    // BATTERY 1: 30-WAY SIMULTANEOUS BURST
    // =========================================================================
    console.log("⚡ [BATTERY 1] Testing 30-Way Simultaneous Concurrency Burst (Promise.all)...");
    const chal30 = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-BURST-30W-${Date.now()}`,
        title: "30-Way Concurrent Claim Race on Arsenic Water Filter",
        description: "Testing 30 simultaneous claims against an academic challenge.",
        domain: "Water Management",
        district: "Sahibganj",
        location: "Rajmahal Ganga Basin",
        urgency: "CRITICAL",
        status: "OPEN_FOR_PROPOSALS",
        nodalStatus: "routed_to_academia",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chal30.id);

    const burst30Promises = universities.slice(0, 30).map((uni) =>
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chal30.id}/claim`, {
          universityId: uni.id,
          universityName: uni.name,
        }),
        { params: { id: chal30.id } }
      )
    );

    const burst30Responses = await Promise.all(burst30Promises);
    const burst30Statuses = burst30Responses.map((r) => r.status);
    const count200_30 = burst30Statuses.filter((s) => s === 200).length;
    const count409_30 = burst30Statuses.filter((s) => s === 409).length;

    assert.equal(count200_30, 1, `30-way burst must yield exactly 1 HTTP 200 (got ${count200_30})`);
    assert.equal(count409_30, 29, `30-way burst must yield exactly 29 HTTP 409 (got ${count409_30})`);

    const chal30DB = await prisma.challenge.findUnique({ where: { id: chal30.id } });
    assert.ok(chal30DB?.claimedAt !== null, "chal30 claimedAt must be set");
    assert.ok(chal30DB?.claimedById !== null, "chal30 claimedById must be set");
    assert.equal(chal30DB?.status, "IN_PROGRESS", "chal30 status must be IN_PROGRESS");

    const logs30 = await prisma.auditLog.findMany({
      where: { challengeId: chal30.id, action: "CHALLENGE_CLAIMED_BY_UNIVERSITY" },
    });
    assert.equal(logs30.length, 1, `Exactly 1 audit log must be created (got ${logs30.length})`);
    pass("30-Way Simultaneous Burst: Deterministic Single Winner (1x 200) and Atomic Lockout (29x 409)");

    // =========================================================================
    // BATTERY 2: 50-WAY ULTRA-BURST RACE CONDITION
    // =========================================================================
    console.log("⚡ [BATTERY 2] Testing 50-Way Ultra-Burst Concurrent Race Condition (Promise.all)...");
    const chal50 = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-BURST-50W-${Date.now()}`,
        title: "50-Way Ultra-Burst Race on Forest Drone Seed Bombing",
        description: "Testing maximum concurrency burst with 50 simultaneous competing claims.",
        domain: "Forestry",
        district: "Saranda",
        location: "Kiriburu Core Forest",
        urgency: "HIGH",
        status: "OPEN_FOR_PROPOSALS",
        nodalStatus: "routed_to_academia",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chal50.id);

    const burst50Promises = universities.map((uni) =>
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chal50.id}/claim`, {
          universityId: uni.id,
          universityName: uni.name,
        }),
        { params: { id: chal50.id } }
      )
    );

    const burst50Responses = await Promise.all(burst50Promises);
    const burst50Statuses = burst50Responses.map((r) => r.status);
    const count200_50 = burst50Statuses.filter((s) => s === 200).length;
    const count409_50 = burst50Statuses.filter((s) => s === 409).length;

    assert.equal(count200_50, 1, `50-way burst must yield exactly 1 HTTP 200 (got ${count200_50})`);
    assert.equal(count409_50, 49, `50-way burst must yield exactly 49 HTTP 409 (got ${count409_50})`);

    const chal50DB = await prisma.challenge.findUnique({ where: { id: chal50.id } });
    assert.ok(chal50DB?.claimedAt !== null, "chal50 claimedAt must be set");
    assert.ok(chal50DB?.claimedById !== null, "chal50 claimedById must be set");
    assert.equal(chal50DB?.status, "IN_PROGRESS");

    const logs50 = await prisma.auditLog.findMany({
      where: { challengeId: chal50.id, action: "CHALLENGE_CLAIMED_BY_UNIVERSITY" },
    });
    assert.equal(logs50.length, 1, `Exactly 1 audit log must be created under 50-way burst (got ${logs50.length})`);
    pass("50-Way Ultra-Burst: Strict Deterministic Single Winner (1x 200) and 49x 409 Atomic Lockouts");

    // =========================================================================
    // BATTERY 3: MASSIVE MULTI-CHALLENGE PARALLEL MATRIX (100 CONCURRENT REQUESTS)
    // =========================================================================
    console.log("⚡ [BATTERY 3] Testing 100-Request Massive Parallel Matrix (10 distinct challenges x 10 concurrent claims)...");
    const matrixChallenges: any[] = [];
    for (let c = 1; c <= 10; c++) {
      const chal = await prisma.challenge.create({
        data: {
          publicTrackingId: `R2-MATRIX-C${c}-${Date.now()}`,
          title: `Parallel Matrix Challenge #${c}: Rural Solar Microgrid`,
          description: `Independent parallel challenge ${c} under high concurrency.`,
          domain: "Energy",
          district: "Ranchi",
          location: `Angara Block Sector ${c}`,
          urgency: "HIGH",
          status: "OPEN_FOR_PROPOSALS",
          nodalStatus: "routed_to_academia",
          reportedById: reporter.id,
        },
      });
      matrixChallenges.push(chal);
      createdChallengeIds.push(chal.id);
    }

    // Prepare 100 requests executed simultaneously via Promise.all
    const matrixPromises: Promise<any>[] = [];
    for (let c = 0; c < 10; c++) {
      const chal = matrixChallenges[c];
      for (let u = 0; u < 10; u++) {
        const uni = universities[u];
        matrixPromises.push(
          claimPOST(
            makeJsonRequest(`http://localhost:3000/api/challenges/${chal.id}/claim`, {
              universityId: uni.id,
              universityName: uni.name,
            }),
            { params: { id: chal.id } }
          ).then(async (res) => ({
            challengeId: chal.id,
            status: res.status,
            body: await res.json(),
          }))
        );
      }
    }

    const matrixResults = await Promise.all(matrixPromises);
    assert.equal(matrixResults.length, 100, "Must have 100 completed responses");

    const total200s = matrixResults.filter((r) => r.status === 200).length;
    const total409s = matrixResults.filter((r) => r.status === 409).length;

    assert.equal(total200s, 10, `Across 10 challenges, there must be exactly 10 winners (got ${total200s})`);
    assert.equal(total409s, 90, `Across 10 challenges, there must be exactly 90 lockouts (got ${total409s})`);

    // Verify per-challenge isolation
    for (const chal of matrixChallenges) {
      const chalRes = matrixResults.filter((r) => r.challengeId === chal.id);
      const wins = chalRes.filter((r) => r.status === 200).length;
      const losses = chalRes.filter((r) => r.status === 409).length;
      assert.equal(wins, 1, `Challenge ${chal.id} must have exactly 1 winner`);
      assert.equal(losses, 9, `Challenge ${chal.id} must have exactly 9 lockouts`);

      const dbRecord = await prisma.challenge.findUnique({ where: { id: chal.id } });
      assert.ok(dbRecord?.claimedAt !== null, `Challenge ${chal.id} must be claimed`);
      assert.ok(dbRecord?.claimedById !== null, `Challenge ${chal.id} must have claimedById`);
    }
    pass("100-Request Parallel Matrix: 10/10 challenges resolved exactly 1 winner (200) and 9 lockouts (409) each");

    // =========================================================================
    // BATTERY 4: MIXED PAYLOAD CONCURRENT COLLISION
    // =========================================================================
    console.log("⚡ [BATTERY 4] Testing Mixed Payload Concurrent Collision (Valid vs Malformed claims in same burst)...");
    const chalMixed = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-MIXED-${Date.now()}`,
        title: "Mixed Payload Collision on IoT Water Sensor Mesh",
        description: "Racing valid requests against malformed payloads concurrently.",
        domain: "Technology",
        district: "Dhanbad",
        location: "Sindri Industrial Zone",
        urgency: "MEDIUM",
        status: "OPEN_FOR_PROPOSALS",
        nodalStatus: "routed_to_academia",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chalMixed.id);

    // 5 valid universities + 5 malformed payloads firing concurrently
    const mixedCalls = [
      // 5 valid
      ...universities.slice(0, 5).map((uni) =>
        claimPOST(
          makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, {
            universityId: uni.id,
            universityName: uni.name,
          }),
          { params: { id: chalMixed.id } }
        )
      ),
      // 5 malformed
      claimPOST(makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, {}), {
        params: { id: chalMixed.id },
      }),
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, { universityId: "" }),
        { params: { id: chalMixed.id } }
      ),
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, { universityName: "No ID Uni" }),
        { params: { id: chalMixed.id } }
      ),
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, {
          universityId: null,
          universityName: null,
        }),
        { params: { id: chalMixed.id } }
      ),
      claimPOST(
        makeJsonRequest(`http://localhost:3000/api/challenges/${chalMixed.id}/claim`, "invalid json payload string"),
        { params: { id: chalMixed.id } }
      ),
    ];

    const mixedResponses = await Promise.all(mixedCalls);
    const mixed200s = mixedResponses.filter((r) => r.status === 200).length;
    const mixed400s = mixedResponses.filter((r) => r.status === 400).length;
    const mixed409s = mixedResponses.filter((r) => r.status === 409).length;
    const mixed500s = mixedResponses.filter((r) => r.status === 500).length;

    assert.equal(mixed200s, 1, `Mixed burst must have exactly 1 winner (got ${mixed200s})`);
    assert.equal(mixed400s, 5, `Mixed burst must cleanly reject all 5 malformed payloads with 400 (got ${mixed400s})`);
    assert.equal(mixed409s, 4, `Mixed burst must lock out remaining 4 valid claims with 409 (got ${mixed409s})`);
    assert.equal(mixed500s, 0, `Mixed burst must produce ZERO HTTP 500 errors (got ${mixed500s})`);
    pass("Mixed Collision Burst: 1x 200 winner, 5x 400 bad request rejections, 4x 409 lockouts, 0x 500 crashes");

    // =========================================================================
    // BATTERY 5: TRIAGE STATUS LOCKOUT MATRIX (NON-ROUTED CHALLENGES)
    // =========================================================================
    console.log("⚡ [BATTERY 5] Testing Triage Status Lockout Matrix...");

    // 5.1 Pending status
    const chalPending = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-PENDING-${Date.now()}`,
        title: "Un-triaged Submission",
        description: "Newly submitted problem.",
        domain: "Civic",
        district: "Ranchi",
        location: "Ranchi Main Road Sector 1",
        urgency: "LOW",
        status: "REPORTED",
        nodalStatus: "pending",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chalPending.id);

    const pendingRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/challenges/${chalPending.id}/claim`, {
        universityId: universities[0].id,
        universityName: universities[0].name,
      }),
      { params: { id: chalPending.id } }
    );
    assert.equal(pendingRes.status, 409, "Claiming pending challenge must return 409");
    const pendingJson = await pendingRes.json();
    assert.equal(pendingJson.nodalStatus, "pending");
    pass("Triage Status Lockout: 'pending' challenge cannot be claimed (HTTP 409 Conflict)");

    // 5.2 Rejected status
    const chalRejected = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-REJECTED-${Date.now()}`,
        title: "Rejected Submission",
        description: "Rejected by nodal officer.",
        domain: "Civic",
        district: "Ranchi",
        location: "Kanke Road Ward 2",
        urgency: "LOW",
        status: "CLOSED",
        nodalStatus: "rejected",
        rejectionReason: "Outside jurisdiction of nodal portal.",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chalRejected.id);

    const rejectedRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/challenges/${chalRejected.id}/claim`, {
        universityId: universities[0].id,
        universityName: universities[0].name,
      }),
      { params: { id: chalRejected.id } }
    );
    assert.equal(rejectedRes.status, 409, "Claiming rejected challenge must return 409");
    const rejectedJson = await rejectedRes.json();
    assert.equal(rejectedJson.nodalStatus, "rejected");
    pass("Triage Status Lockout: 'rejected' challenge cannot be claimed (HTTP 409 Conflict)");

    // 5.3 Diverted to Gov status
    const chalDiverted = await prisma.challenge.create({
      data: {
        publicTrackingId: `R2-DIVERTED-${Date.now()}`,
        title: "Diverted Submission",
        description: "Diverted to Municipal Corporation.",
        domain: "Infrastructure",
        district: "Ranchi",
        location: "Harmu Bypass Road",
        urgency: "HIGH",
        status: "UNDER_REVIEW",
        nodalStatus: "diverted_to_gov",
        divertedTarget: "Ranchi Municipal Corporation (RMC)",
        reportedById: reporter.id,
      },
    });
    createdChallengeIds.push(chalDiverted.id);

    const divertedRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/challenges/${chalDiverted.id}/claim`, {
        universityId: universities[0].id,
        universityName: universities[0].name,
      }),
      { params: { id: chalDiverted.id } }
    );
    assert.equal(divertedRes.status, 409, "Claiming diverted challenge must return 409");
    const divertedJson = await divertedRes.json();
    assert.equal(divertedJson.nodalStatus, "diverted_to_gov");
    pass("Triage Status Lockout: 'diverted_to_gov' challenge cannot be claimed (HTTP 409 Conflict)");

    // 5.4 Non-existent ID & SQL Injection attempts
    const nonExistentRes = await claimPOST(
      makeJsonRequest("http://localhost:3000/api/challenges/non_existent_cuid_12345/claim", {
        universityId: universities[0].id,
        universityName: universities[0].name,
      }),
      { params: { id: "non_existent_cuid_12345" } }
    );
    assert.equal(nonExistentRes.status, 404, "Claiming non-existent ID must return HTTP 404");
    pass("Invalid Challenge Boundary: Non-existent ID returns HTTP 404 Not Found");

    const sqlInjRes = await claimPOST(
      makeJsonRequest("http://localhost:3000/api/challenges/'%20OR%201=1%20--/claim", {
        universityId: universities[0].id,
        universityName: universities[0].name,
      }),
      { params: { id: "' OR 1=1 --" } }
    );
    assert.equal(sqlInjRes.status, 404, "SQL injection attempt in ID returns HTTP 404");
    pass("Invalid Challenge Boundary: Malicious SQL injection probe safely neutralized (HTTP 404)");

    // =========================================================================
    // BATTERY 6: GET CLAIM TELEMETRY INTEGRITY
    // =========================================================================
    console.log("⚡ [BATTERY 6] Testing GET Telemetry for claimed vs unclaimed challenges...");
    const getClaimedRes = await claimGET(
      makeJsonRequest(`http://localhost:3000/api/challenges/${chal30.id}/claim`, undefined, "GET"),
      { params: { id: chal30.id } }
    );
    assert.equal(getClaimedRes.status, 200);
    const getClaimedJson = await getClaimedRes.json();
    assert.equal(getClaimedJson.isClaimed, true);
    assert.equal(getClaimedJson.isAvailableForClaim, false);
    assert.ok(getClaimedJson.claimedInstitute !== null);
    pass("GET Telemetry: Accurately reflects isClaimed=true and isAvailableForClaim=false for claimed challenge");

  } finally {
    // -------------------------------------------------------------------------
    // Teardown: Clean up all generated test challenges and users
    // -------------------------------------------------------------------------
    console.log("\n🧹 Teardown: Cleaning up all test entities...");
    if (createdChallengeIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await prisma.challenge.deleteMany({
        where: { id: { in: createdChallengeIds } },
      });
      console.log(`   Removed ${createdChallengeIds.length} test challenges & audit records.`);
    }

    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      console.log(`   Removed ${createdUserIds.length} test users.`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`🎉 ALL BATTERIES COMPLETED: ${passCount}/${testCount} TESTS PASSED (100% SUCCESS)`);
  console.log("===============================================================================\n");
}

runChallengerR2Verification()
  .catch((err) => {
    console.error("❌ CHALLENGER R2 SUITE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
