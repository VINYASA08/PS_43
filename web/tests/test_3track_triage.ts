/**
 * Autonomous Programmatic Test Suite: 3-Track Problem Triage System
 * File: web/tests/test_3track_triage.ts
 *
 * Acceptance Criteria (ORIGINAL_REQUEST.md & DISPATCH.md):
 * "Programmatic: A test script is created and run that successfully submits three mock problems
 *  (one for each track) and verifies they are routed and categorized correctly in the database."
 *
 * Verification Requirements:
 * 1. Submit 3 mock problems via Route Handler invocation (POST /api/challenges) with valid payload & CSRF token:
 *    - Problem 1 (Track A Innovation): Novel graphene-based nanofiltration skid for Jharia acid mine drainage heavy metal potability in Dhanbad.
 *    - Problem 2 (Track B Standard): Blown 100 kVA distribution transformer replacement under JUVNL on rural feeder line in Dumka.
 *    - Problem 3 (Track C Civic): Choked stormwater drain and overflowing garbage vat on Harmu Main Road in Ranchi.
 * 2. Assert HTTP 201 response and returned tracking IDs (format IN-GR-2026-XXXX).
 * 3. Query Prisma database directly:
 *    - Problem 1: challenge.track === "TRACK_A_INNOVATION", trackRouting contains "IIT (ISM) Dhanbad", SLA >= 45 days.
 *    - Problem 2: challenge.track === "TRACK_B_STANDARD", trackRouting contains "JUVNL" or "Jharkhand Urja Vikas Nigam Limited", SLA 14-30 days.
 *    - Problem 3: challenge.track === "TRACK_C_CIVIC", trackRouting contains "RMC" or "Ranchi Municipal Corporation", SLA <= 72 hours.
 *    - Assert all 3 have non-empty triageReasoning.
 * 4. Assert corresponding AuditLog records exist for each challenge in Prisma (action: "CHALLENGE_CREATED").
 * 5. Assert Prisma track filtering (prisma.challenge.findMany({ where: { track: ... } })).
 * 6. Adversarial verification: Missing CSRF rejection (403), Zod validation boundary failure (400).
 * 7. Perform clean teardown of test mock records physically from the database.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
process.env.NODE_ENV = "test";

import { PrismaClient } from "@prisma/client";
import prisma from "../src/lib/prisma";
import { generateCsrfToken } from "../src/lib/csrf";
import { POST as challengesPOST, GET as challengesGET } from "../src/app/api/challenges/route";

// Resilient .env loader ensuring environment variables are populated when run via standalone tsx
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

// Helper to construct NextRequest with CSRF and Headers
function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    csrf?: string;
    ip?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers || {}),
  };

  if (options.token) {
    headers["cookie"] = `sih_session=${options.token}`;
  }

  if (options.ip) {
    headers["x-forwarded-for"] = options.ip;
  }

  if (options.csrf) {
    const csrfCookie = `sih_csrf=${options.csrf}`;
    headers["cookie"] = headers["cookie"]
      ? `${headers["cookie"]}; ${csrfCookie}`
      : csrfCookie;
    headers["x-csrf-token"] = options.csrf;
  }

  const init: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body !== undefined) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

interface TestStepResult {
  step: string;
  name: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  error?: string;
}

export async function run3TrackTriageTestSuite(): Promise<{
  passed: number;
  failed: number;
  total: number;
  results: TestStepResult[];
}> {
  console.log("\n===============================================================================");
  console.log("3-TRACK PROBLEM TRIAGE SYSTEM: PROGRAMMATIC ACCEPTANCE CRITERIA TEST SUITE");
  console.log("Jharkhand Societal Innovation Portal (Milestone 4 Baseline)");
  console.log("===============================================================================\n");

  const results: TestStepResult[] = [];
  const createdChallengeIds: string[] = [];
  const rawPrisma = new PrismaClient({ log: ["error"] });
  const csrfToken = generateCsrfToken();

  async function executeStep(step: string, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      console.log(`  ✓ [${step}] PASS: ${name} (${durationMs}ms)`);
      results.push({ step, name, status: "PASS", durationMs });
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ [${step}] FAIL: ${name} (${durationMs}ms)`);
      console.error(`    Details: ${errMsg}`);
      results.push({ step, name, status: "FAIL", durationMs, error: errMsg });
      throw err; // Fail-fast for audit integrity
    }
  }

  try {
    // ---------------------------------------------------------------------------
    // STEP 0: PRE-TEST SANITATION
    // ---------------------------------------------------------------------------
    console.log("[PHASE 0] Pre-test environment sanitation & database readiness check...");
    await executeStep("0.1", "Verify Prisma database connection and clean stale mock data", async () => {
      const staleChallenges = await rawPrisma.challenge.findMany({
        where: {
          title: {
            in: [
              "Novel Graphene-Based Nanofiltration Skid for Jharia Acid Mine Drainage Heavy Metal Potability in Dhanbad",
              "Blown 100 kVA Distribution Transformer Replacement Under JUVNL on Rural Feeder Line in Dumka",
              "Choked Stormwater Drain and Overflowing Garbage Vat on Harmu Main Road in Ranchi",
            ],
          },
        },
        select: { id: true },
      });

      if (staleChallenges.length > 0) {
        const ids = staleChallenges.map((c) => c.id);
        await rawPrisma.auditLog.deleteMany({ where: { challengeId: { in: ids } } });
        await rawPrisma.challenge.deleteMany({ where: { id: { in: ids } } });
        console.log(`    (Cleaned up ${ids.length} stale pre-existing test record(s))`);
      }
      assert.ok(true);
    });

    // ---------------------------------------------------------------------------
    // STEP 1: ROUTE HANDLER INGESTION & TRACKING ID VERIFICATION
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 1] Submitting 3 Mock Problems via POST /api/challenges...");

    let challenge1Id = "";
    let challenge1TrackingId = "";
    let challenge2Id = "";
    let challenge2TrackingId = "";
    let challenge3Id = "";
    let challenge3TrackingId = "";

    // Problem 1: Track A Innovation
    await executeStep(
      "1.1",
      "POST /api/challenges Problem 1 (Track A Innovation: Graphene Nanofiltration Skid in Dhanbad)",
      async () => {
        const payload = {
          title: "Novel Graphene-Based Nanofiltration Skid for Jharia Acid Mine Drainage Heavy Metal Potability in Dhanbad",
          description: "Acidic mine drainage runoff from open-cast coal pits in Jharia has contaminated aquifers with dissolved iron and sulfates (pH 3.9). Requires applied research into novel graphene-based nanofiltration skid and university laboratory water filtration prototypes for drinking potability.",
          domain: "Water Management",
          district: "Dhanbad",
          location: "Jharia Block, Sector 4 Damodar Aquifer",
          urgency: "CRITICAL",
          evidence: JSON.stringify({
            ph: 3.9,
            dissolvedIron: "7.8 mg/L",
            turbidity: "65 NTU",
            hazard: "Acid mine drainage and toxic heavy metal potability deficit",
          }),
        };

        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: payload,
          csrf: csrfToken,
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 201, `Expected HTTP 201 Created, got ${res.status}`);

        const json = await res.json();
        assert.equal(json.success, true, "Response success must be true");
        assert.ok(json.trackingId, "Public tracking ID must be generated");
        assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/, "Tracking ID format must match /^IN-GR-2026-\\d{4}$/");
        assert.ok(json.challenge?.id, "Challenge ID must be returned");

        challenge1Id = json.challenge.id;
        challenge1TrackingId = json.trackingId;
        createdChallengeIds.push(challenge1Id);
      }
    );

    // Problem 2: Track B Standard
    await executeStep(
      "1.2",
      "POST /api/challenges Problem 2 (Track B Standard: Blown 100 kVA Transformer in Dumka)",
      async () => {
        const payload = {
          title: "Blown 100 kVA Distribution Transformer Replacement Under JUVNL on Rural Feeder Line in Dumka",
          description: "The 100 kVA distribution transformer on Feeder 4 in Shikaripara block suffered winding failure and burnt out after a lightning surge. Needs standard departmental tender replacement with 11kV/415V transformer unit under JUVNL rural feeder maintenance schedule.",
          domain: "Energy",
          district: "Dumka",
          location: "Shikaripara Block, Substation Feeder 4",
          urgency: "HIGH",
          evidence: JSON.stringify({
            rating: "100 kVA",
            voltageRatio: "11kV/415V",
            failureType: "Winding Burnout Surge",
            utility: "JUVNL",
          }),
        };

        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: payload,
          csrf: csrfToken,
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 201, `Expected HTTP 201 Created, got ${res.status}`);

        const json = await res.json();
        assert.equal(json.success, true, "Response success must be true");
        assert.ok(json.trackingId, "Public tracking ID must be generated");
        assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/, "Tracking ID format must match /^IN-GR-2026-\\d{4}$/");
        assert.ok(json.challenge?.id, "Challenge ID must be returned");

        challenge2Id = json.challenge.id;
        challenge2TrackingId = json.trackingId;
        createdChallengeIds.push(challenge2Id);
      }
    );

    // Problem 3: Track C Civic
    await executeStep(
      "1.3",
      "POST /api/challenges Problem 3 (Track C Civic: Choked Drain & Overflowing Vat on Harmu Road, Ranchi)",
      async () => {
        const payload = {
          title: "Choked Stormwater Drain and Overflowing Garbage Vat on Harmu Main Road in Ranchi",
          description: "Municipal stormwater drain is severely choked with solid plastic waste causing foul stagnant blackwater overflow onto Harmu Main Road. Overflowing community garbage vat attracts animals and creates acute pedestrian safety hazard requiring rapid municipal cleaning crew dispatch.",
          domain: "Urban Infrastructure",
          district: "Ranchi",
          location: "Harmu Main Road, Ward 26",
          urgency: "HIGH",
          evidence: JSON.stringify({
            street: "Harmu Main Road",
            ward: "Ward 26",
            hazard: "Blackwater drain choke and garbage vat overflow",
          }),
        };

        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: payload,
          csrf: csrfToken,
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 201, `Expected HTTP 201 Created, got ${res.status}`);

        const json = await res.json();
        assert.equal(json.success, true, "Response success must be true");
        assert.ok(json.trackingId, "Public tracking ID must be generated");
        assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/, "Tracking ID format must match /^IN-GR-2026-\\d{4}$/");
        assert.ok(json.challenge?.id, "Challenge ID must be returned");

        challenge3Id = json.challenge.id;
        challenge3TrackingId = json.trackingId;
        createdChallengeIds.push(challenge3Id);
      }
    );

    // ---------------------------------------------------------------------------
    // STEP 2: DIRECT PRISMA DATABASE ASSERTIONS (TRACK, ROUTING, SLA, REASONING)
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 2] Direct Prisma Database Verification (Track, TrackRouting, SLA, Reasoning)...");

    // Assert Problem 1 (Track A Innovation)
    await executeStep(
      "2.1",
      "Assert Problem 1 in Prisma: track === TRACK_A_INNOVATION, routing contains 'IIT (ISM) Dhanbad', SLA >= 45 days",
      async () => {
        const record = await prisma.challenge.findUnique({
          where: { id: challenge1Id },
        });

        assert.ok(record, "Problem 1 challenge record must exist in Prisma database");
        assert.equal(record.publicTrackingId, challenge1TrackingId, "Tracking ID must match");
        assert.equal(record.track, "TRACK_A_INNOVATION", "Track must be TRACK_A_INNOVATION");
        assert.ok(
          record.trackRouting && record.trackRouting.includes("IIT (ISM) Dhanbad"),
          `Expected trackRouting to contain 'IIT (ISM) Dhanbad', got '${record.trackRouting}'`
        );
        assert.ok(
          record.triageReasoning && record.triageReasoning.trim().length > 0,
          "triageReasoning must be non-empty"
        );

        // Verify SLA duration
        assert.ok(record.slaDeadline, "slaDeadline must be set in database");
        const slaDurationMs = record.slaDeadline.getTime() - record.createdAt.getTime();
        const slaDays = Math.round(slaDurationMs / (1000 * 60 * 60 * 24));
        assert.ok(
          slaDays >= 45,
          `Expected SLA >= 45 days for Track A Innovation, got ${slaDays} days`
        );
        console.log(`    → Verified: Track=${record.track}, Routing='${record.trackRouting}', SLA=${slaDays} days`);
      }
    );

    // Assert Problem 2 (Track B Standard)
    await executeStep(
      "2.2",
      "Assert Problem 2 in Prisma: track === TRACK_B_STANDARD, routing contains 'JUVNL' or 'Jharkhand Urja Vikas Nigam Limited', SLA 14-30 days",
      async () => {
        const record = await prisma.challenge.findUnique({
          where: { id: challenge2Id },
        });

        assert.ok(record, "Problem 2 challenge record must exist in Prisma database");
        assert.equal(record.publicTrackingId, challenge2TrackingId, "Tracking ID must match");
        assert.equal(record.track, "TRACK_B_STANDARD", "Track must be TRACK_B_STANDARD");
        const routingValid =
          record.trackRouting &&
          (record.trackRouting.includes("JUVNL") ||
            record.trackRouting.includes("Jharkhand Urja Vikas Nigam Limited"));
        assert.ok(
          routingValid,
          `Expected trackRouting to contain 'JUVNL' or 'Jharkhand Urja Vikas Nigam Limited', got '${record.trackRouting}'`
        );
        assert.ok(
          record.triageReasoning && record.triageReasoning.trim().length > 0,
          "triageReasoning must be non-empty"
        );

        // Verify SLA duration
        assert.ok(record.slaDeadline, "slaDeadline must be set in database");
        const slaDurationMs = record.slaDeadline.getTime() - record.createdAt.getTime();
        const slaDays = Math.round(slaDurationMs / (1000 * 60 * 60 * 24));
        assert.ok(
          slaDays >= 14 && slaDays <= 30,
          `Expected SLA between 14 and 30 days for Track B Standard, got ${slaDays} days`
        );
        console.log(`    → Verified: Track=${record.track}, Routing='${record.trackRouting}', SLA=${slaDays} days`);
      }
    );

    // Assert Problem 3 (Track C Civic)
    await executeStep(
      "2.3",
      "Assert Problem 3 in Prisma: track === TRACK_C_CIVIC, routing contains 'RMC' or 'Ranchi Municipal Corporation', SLA <= 72 hours",
      async () => {
        const record = await prisma.challenge.findUnique({
          where: { id: challenge3Id },
        });

        assert.ok(record, "Problem 3 challenge record must exist in Prisma database");
        assert.equal(record.publicTrackingId, challenge3TrackingId, "Tracking ID must match");
        assert.equal(record.track, "TRACK_C_CIVIC", "Track must be TRACK_C_CIVIC");
        const routingValid =
          record.trackRouting &&
          (record.trackRouting.includes("RMC") ||
            record.trackRouting.includes("Ranchi Municipal Corporation"));
        assert.ok(
          routingValid,
          `Expected trackRouting to contain 'RMC' or 'Ranchi Municipal Corporation', got '${record.trackRouting}'`
        );
        assert.ok(
          record.triageReasoning && record.triageReasoning.trim().length > 0,
          "triageReasoning must be non-empty"
        );

        // Verify SLA duration
        assert.ok(record.slaDeadline, "slaDeadline must be set in database");
        const slaDurationMs = record.slaDeadline.getTime() - record.createdAt.getTime();
        const slaHours = Math.round(slaDurationMs / (1000 * 60 * 60));
        assert.ok(
          slaHours <= 72,
          `Expected SLA <= 72 hours for Track C Civic, got ${slaHours} hours`
        );
        console.log(`    → Verified: Track=${record.track}, Routing='${record.trackRouting}', SLA=${slaHours} hours`);
      }
    );

    // ---------------------------------------------------------------------------
    // STEP 3: AUDIT LOG VERIFICATION IN PRISMA
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 3] Verifying Immutable AuditLog Records in Prisma...");

    await executeStep(
      "3.1",
      "Assert AuditLog records exist for all 3 challenges with CHALLENGE_CREATED action and track metadata",
      async () => {
        for (const [idx, id] of [challenge1Id, challenge2Id, challenge3Id].entries()) {
          const log = await prisma.auditLog.findFirst({
            where: {
              resource: "Challenge",
              resourceId: id,
              action: "CHALLENGE_CREATED",
            },
          });

          assert.ok(log, `AuditLog must exist for challenge ${id}`);
          assert.equal(log.challengeId, id, `AuditLog challengeId must equal ${id}`);
          assert.equal(log.action, "CHALLENGE_CREATED");
          assert.equal(log.resource, "Challenge");

          // Verify state snapshot
          assert.ok(log.newState, "AuditLog newState JSON snapshot must exist");
          const state = JSON.parse(log.newState);
          assert.ok(state.publicTrackingId, "AuditLog newState must contain publicTrackingId");
          assert.ok(state.track, "AuditLog newState must contain track");
          assert.ok(state.trackRouting, "AuditLog newState must contain trackRouting");

          const expectedTracks = ["TRACK_A_INNOVATION", "TRACK_B_STANDARD", "TRACK_C_CIVIC"];
          assert.equal(state.track, expectedTracks[idx], `AuditLog track must match ${expectedTracks[idx]}`);
        }
        console.log("    → Verified: 3/3 AuditLog entries confirmed with immutable track and trackingId metadata.");
      }
    );

    // ---------------------------------------------------------------------------
    // STEP 4: PRISMA TRACK FILTERING ASSERTIONS
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 4] Verifying Prisma Track Query Filtering (where: { track: ... })...");

    await executeStep(
      "4.1",
      "Assert prisma.challenge.findMany({ where: { track } }) correctly isolates each challenge",
      async () => {
        // Query database by track
        const trackAChallenges = await prisma.challenge.findMany({
          where: { track: "TRACK_A_INNOVATION" },
          select: { id: true, track: true },
        });
        const trackBChallenges = await prisma.challenge.findMany({
          where: { track: "TRACK_B_STANDARD" },
          select: { id: true, track: true },
        });
        const trackCChallenges = await prisma.challenge.findMany({
          where: { track: "TRACK_C_CIVIC" },
          select: { id: true, track: true },
        });

        // Track A isolation
        assert.ok(
          trackAChallenges.some((c) => c.id === challenge1Id),
          "Track A query must include Problem 1"
        );
        assert.ok(
          !trackAChallenges.some((c) => c.id === challenge2Id || c.id === challenge3Id),
          "Track A query must NOT include Problem 2 or Problem 3"
        );

        // Track B isolation
        assert.ok(
          trackBChallenges.some((c) => c.id === challenge2Id),
          "Track B query must include Problem 2"
        );
        assert.ok(
          !trackBChallenges.some((c) => c.id === challenge1Id || c.id === challenge3Id),
          "Track B query must NOT include Problem 1 or Problem 3"
        );

        // Track C isolation
        assert.ok(
          trackCChallenges.some((c) => c.id === challenge3Id),
          "Track C query must include Problem 3"
        );
        assert.ok(
          !trackCChallenges.some((c) => c.id === challenge1Id || c.id === challenge2Id),
          "Track C query must NOT include Problem 1 or Problem 2"
        );

        console.log(`    → Database Track Counts: Track A=${trackAChallenges.length}, Track B=${trackBChallenges.length}, Track C=${trackCChallenges.length}`);
      }
    );

    await executeStep(
      "4.2",
      "Assert GET /api/challenges?track=... route handler filters records by track parameter",
      async () => {
        interface ChallengeResponseItem {
          id: string;
          track?: string;
        }

        const getReqA = makeRequest("http://localhost:3000/api/challenges?track=TRACK_A_INNOVATION");
        const getResA = await challengesGET(getReqA);
        assert.equal(getResA.status, 200);
        const getJsonA = (await getResA.json()) as { challenges: ChallengeResponseItem[] };
        assert.ok(getJsonA.challenges.some((c) => c.id === challenge1Id));
        assert.ok(!getJsonA.challenges.some((c) => c.id === challenge2Id || c.id === challenge3Id));

        const getReqB = makeRequest("http://localhost:3000/api/challenges?track=TRACK_B_STANDARD");
        const getResB = await challengesGET(getReqB);
        assert.equal(getResB.status, 200);
        const getJsonB = (await getResB.json()) as { challenges: ChallengeResponseItem[] };
        assert.ok(getJsonB.challenges.some((c) => c.id === challenge2Id));
        assert.ok(!getJsonB.challenges.some((c) => c.id === challenge1Id || c.id === challenge3Id));

        const getReqC = makeRequest("http://localhost:3000/api/challenges?track=TRACK_C_CIVIC");
        const getResC = await challengesGET(getReqC);
        assert.equal(getResC.status, 200);
        const getJsonC = (await getResC.json()) as { challenges: ChallengeResponseItem[] };
        assert.ok(getJsonC.challenges.some((c) => c.id === challenge3Id));
        assert.ok(!getJsonC.challenges.some((c) => c.id === challenge1Id || c.id === challenge2Id));
      }
    );

    // ---------------------------------------------------------------------------
    // STEP 5: ADVERSARIAL INTEGRITY & SECURITY ASSERTIONS
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 5] Adversarial & Security Edge Case Assertions...");

    await executeStep(
      "5.1",
      "Assert POST /api/challenges rejects submission with missing CSRF token (HTTP 403)",
      async () => {
        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: {
            title: "Adversarial CSRF Attack Submission",
            description: "Attempting submission without CSRF token to test OWASP defense.",
            domain: "Urban Infrastructure",
            district: "Ranchi",
            location: "Main Road",
            urgency: "LOW",
          },
          // No csrf token supplied
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 403, `Expected HTTP 403 Forbidden on missing CSRF, got ${res.status}`);
        const json = await res.json();
        assert.ok(json.error, "Error message must be present");
      }
    );

    await executeStep(
      "5.2",
      "Assert POST /api/challenges rejects submission with invalid domain / short description (HTTP 400)",
      async () => {
        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          csrf: csrfToken,
          body: {
            title: "Bad",
            description: "Too short",
            domain: "NonExistentDomain123",
            district: "Ranchi",
            location: "Main Road",
          },
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 400, `Expected HTTP 400 Bad Request on schema violation, got ${res.status}`);
      }
    );
  } finally {
    // ---------------------------------------------------------------------------
    // STEP 6: TEARDOWN & RECOVERY
    // ---------------------------------------------------------------------------
    console.log("\n[PHASE 6] Clean Teardown: Purging test mock records from database...");
    try {
      if (createdChallengeIds.length > 0) {
        const deletedAuditLogs = await rawPrisma.auditLog.deleteMany({
          where: { challengeId: { in: createdChallengeIds } },
        });
        const deletedChallenges = await rawPrisma.challenge.deleteMany({
          where: { id: { in: createdChallengeIds } },
        });
        console.log(`  ✓ Physically deleted ${deletedAuditLogs.count} AuditLog record(s).`);
        console.log(`  ✓ Physically deleted ${deletedChallenges.count} Challenge record(s).`);
        console.log("  ✓ Database restored to clean state.");
      }
    } catch (cleanupErr: unknown) {
      const cleanupMsg = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
      console.warn("  ⚠ Warning during teardown:", cleanupMsg);
    } finally {
      await rawPrisma.$disconnect();
    }
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log("\n===============================================================================");
  console.log(`3-TRACK TRIAGE TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED | ${results.length} TOTAL`);
  console.log("===============================================================================\n");

  return {
    passed,
    failed,
    total: results.length,
    results,
  };
}

// Standalone execution entrypoint
if (typeof process !== "undefined" && process.argv[1]?.includes("test_3track_triage")) {
  run3TrackTriageTestSuite()
    .then((summary) => {
      if (summary.failed > 0) {
        console.error(`\nTEST SUITE FAILED: ${summary.failed} assertion failure(s).`);
        process.exit(1);
      }
      console.log(`\nTEST SUITE PASSED: 100% assertions verified successfully (${summary.passed}/${summary.total}).`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("\nFATAL ERROR DURING TEST EXECUTION:", err);
      process.exit(1);
    });
}
