/**
 * Empirical Verification & Stress Test Battery: Challenger 2
 * Focus: Boundary Attacks, Rejection, Diversion, Non-Existent Challenge ID,
 * Claim Collisions/Consecutive Claims, and Mock Email Output Verification.
 *
 * Execution: npx tsx tests/challenger_boundary_attacks.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

// Load environment variables
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
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

// Intercept console.log helper
class ConsoleInterceptor {
  private originalLog: typeof console.log;
  public logs: string[] = [];

  constructor() {
    this.originalLog = console.log;
  }

  start() {
    this.logs = [];
    console.log = (...args: any[]) => {
      const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      this.logs.push(msg);
      this.originalLog(...args);
    };
  }

  stop(): string[] {
    console.log = this.originalLog;
    return this.logs;
  }
}

async function runEmpiricalBattery() {
  console.log("\n===============================================================================");
  console.log("⚔️ CHALLENGER 2: EMPIRICAL BOUNDARY, REJECTION, DIVERSION & CLAIM ATTACK SUITE");
  console.log("===============================================================================\n");

  let testCount = 0;
  let passCount = 0;

  const attackResults: { id: number; name: string; passed: boolean; details?: string }[] = [];

  function record(name: string, passed: boolean, details?: string) {
    testCount++;
    attackResults.push({ id: testCount, name, passed, details });
    if (passed) {
      passCount++;
      console.log(`✅ [ATTACK ${testCount} - PASSED] ${name}${details ? ` -> ${details}` : ""}`);
    } else {
      console.error(`❌ [ATTACK ${testCount} - FAILED] ${name}${details ? ` -> ${details}` : ""}`);
    }
  }

  const createdChallengeIds: string[] = [];

  try {
    // Locate seeded actors
    const govOfficer = await prisma.user.findFirst({ where: { role: "GOV", status: "ACTIVE" } });
    assert.ok(govOfficer, "District Nodal Officer user must exist");

    const uniA = await prisma.user.findFirst({ where: { role: "UNIVERSITY", email: "pi.water@iitism.ac.in" } })
      || await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
    assert.ok(uniA, "University A must exist");

    const uniB = await prisma.user.findFirst({ where: { role: "UNIVERSITY", email: "pi.agri@bau.ac.in" } })
      || await prisma.user.findFirst({ where: { role: "UNIVERSITY", id: { not: uniA.id } } });
    assert.ok(uniB, "University B must exist");

    const uniC = await prisma.user.findFirst({ where: { role: "UNIVERSITY", email: "pi.energy@nitjsr.ac.in" } })
      || await prisma.user.findFirst({ where: { role: "UNIVERSITY", id: { notIn: [uniA.id, uniB.id] } } })
      || { id: "mock-uni-c-id", organization: "NIT Jamshedpur", name: "NIT Jamshedpur Clean Energy Cell" };

    const citizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
    assert.ok(citizen, "Citizen reporter must exist");

    // Helper to create test challenges
    async function createTestChallenge(prefix: string, domain: string = "Water Management", initialNodalStatus: string = "pending"): Promise<any> {
      const ch = await prisma.challenge.create({
        data: {
          publicTrackingId: `CHALLENGE-ATTACK-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: `Adversarial Attack Test Subject ${prefix}`,
          description: `Empirical stress verification test for boundary conditions in ${domain}.`,
          domain,
          district: "Dhanbad",
          location: "Block 4 Test Zone",
          urgency: "HIGH",
          status: initialNodalStatus === "routed_to_academia" ? "OPEN_FOR_PROPOSALS" : (initialNodalStatus === "rejected" ? "CLOSED" : "REPORTED"),
          nodalStatus: initialNodalStatus,
          reportedById: citizen.id,
        },
      });
      createdChallengeIds.push(ch.id);
      return ch;
    }

    // =========================================================================
    // SECTION 1: REJECTION BOUNDARY ATTACKS (HTTP 400 Expected)
    // =========================================================================
    console.log("\n--- [SECTION 1] REJECTION BOUNDARY ATTACKS ---");

    const chalReject = await createTestChallenge("REJECT-TEST");

    // 1.1: Missing rejectionReason key
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.1 Rejection with missing rejectionReason key returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.2: Empty string rejectionReason: ""
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: "",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.2 Rejection with empty string rejectionReason ('') returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.3: Whitespace only rejectionReason: "   " (3 spaces)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: "   ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.3 Rejection with 3 spaces whitespace returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.4: Whitespace only rejectionReason: "     " (5 spaces - meets raw length but fails trim)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: "     ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.4 Rejection with 5 spaces whitespace (evades raw length) returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.5: Short reason < 5 chars: "nope" (4 chars)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: "nope",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.5 Rejection with reason < 5 characters ('nope') returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.6: Reason with spaces padding < 5 chars after trim: "  ab  "
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: "  ab  ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("1.6 Rejection with 2 chars padded to 6 spaces returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 1.7: Valid rejection reason (>= 5 chars) succeeds HTTP 200
    {
      const validReasonText = "Spam entry with unverifiable coordinates and false claims.";
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalReject.id,
        action: "reject",
        rejectionReason: validReasonText,
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      const chalDB = await prisma.challenge.findUnique({ where: { id: chalReject.id } });
      const validPass = res.status === 200 &&
        data.nodalStatus === "rejected" &&
        chalDB?.nodalStatus === "rejected" &&
        chalDB?.status === "CLOSED" &&
        chalDB?.rejectionReason === validReasonText;
      record("1.7 Legitimate rejection with >= 5 chars succeeds HTTP 200 & updates DB", validPass, `Status: ${res.status}, nodalStatus: ${chalDB?.nodalStatus}`);
    }

    // =========================================================================
    // SECTION 2: DIVERSION BOUNDARY ATTACKS (HTTP 400 Expected)
    // =========================================================================
    console.log("\n--- [SECTION 2] DIVERSION BOUNDARY ATTACKS ---");

    const chalDivert = await createTestChallenge("DIVERT-TEST");

    // 2.1: Missing divertedTarget key
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.1 Diversion with missing divertedTarget key returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.2: Empty string divertedTarget: ""
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: "",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.2 Diversion with empty string divertedTarget ('') returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.3: Whitespace only divertedTarget: " " (1 space)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: " ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.3 Diversion with single space returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.4: Whitespace only divertedTarget: "  " (2 spaces - evades min(2) but fails trim)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: "  ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.4 Diversion with 2 spaces whitespace returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.5: Target < 2 chars: "X" (1 char)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: "X",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.5 Diversion with target < 2 chars ('X') returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.6: Target < 2 chars after trim: " Y " (1 char padded)
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: " Y ",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("2.6 Diversion with single char padded with spaces returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 2.7: Valid diversion target (e.g. "RMC") succeeds HTTP 200
    {
      const validTarget = "Ranchi Municipal Corporation (RMC)";
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalDivert.id,
        action: "divert_to_gov",
        divertedTarget: validTarget,
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      const chalDB = await prisma.challenge.findUnique({ where: { id: chalDivert.id } });
      const validPass = res.status === 200 &&
        data.nodalStatus === "diverted_to_gov" &&
        chalDB?.nodalStatus === "diverted_to_gov" &&
        chalDB?.status === "UNDER_REVIEW" &&
        chalDB?.divertedTarget === validTarget &&
        chalDB?.divertedAt !== null;
      record("2.7 Legitimate diversion with valid target succeeds HTTP 200 & updates DB", validPass, `Status: ${res.status}, nodalStatus: ${chalDB?.nodalStatus}`);
    }

    // =========================================================================
    // SECTION 3: NON-EXISTENT CHALLENGE ID & INVALID ACTION ATTACKS
    // =========================================================================
    console.log("\n--- [SECTION 3] NON-EXISTENT CHALLENGE ID & INVALID ACTION ATTACKS ---");

    const nonExistentId = "cuid_non_existent_999999999";

    // 3.1: Route to academia on non-existent challenge ID -> HTTP 404
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: nonExistentId,
        action: "route_to_academia",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("3.1 Route to academia on non-existent challenge ID returns HTTP 404", res.status === 404, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 3.2: Rejection on non-existent challenge ID -> HTTP 404
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: nonExistentId,
        action: "reject",
        rejectionReason: "Reason for non-existent challenge",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("3.2 Rejection on non-existent challenge ID returns HTTP 404", res.status === 404, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 3.3: Diversion on non-existent challenge ID -> HTTP 404
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: nonExistentId,
        action: "divert_to_gov",
        divertedTarget: "PWD/RCD",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("3.3 Diversion on non-existent challenge ID returns HTTP 404", res.status === 404, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 3.4: Triage with invalid action -> HTTP 400
    {
      const chalAny = await createTestChallenge("INVALID-ACTION");
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalAny.id,
        action: "arbitrary_delete_action",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("3.4 Triage with invalid action string returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 3.5: Triage with empty challengeId -> HTTP 400
    {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: "",
        action: "route_to_academia",
        nodalOfficerId: govOfficer.id,
      });
      const res = await triagePOST(req);
      const data = await res.json();
      record("3.5 Triage with empty challengeId returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // =========================================================================
    // SECTION 4: UNIVERSITY CLAIM BOUNDARY ATTACKS
    // =========================================================================
    console.log("\n--- [SECTION 4] UNIVERSITY CLAIM BOUNDARY ATTACKS ---");

    const chalClaimOpen = await createTestChallenge("CLAIM-BOUNDARY", "Water Management", "routed_to_academia");

    // 4.1: Claim with missing universityId and universityName
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalClaimOpen.id}/claim`, {});
      const res = await claimPOST(req, { params: { id: chalClaimOpen.id } });
      const data = await res.json();
      record("4.1 Claim with empty body returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 4.2: Claim with missing universityName and non-existent universityId
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalClaimOpen.id}/claim`, {
        universityId: "unknown_user_id_999",
      });
      const res = await claimPOST(req, { params: { id: chalClaimOpen.id } });
      const data = await res.json();
      record("4.2 Claim with unresolvable universityId and no universityName returns HTTP 400", res.status === 400, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 4.3: Claim on non-existent challenge ID -> HTTP 404
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${nonExistentId}/claim`, {
        universityId: uniA.id,
        universityName: uniA.organization || "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: nonExistentId } });
      const data = await res.json();
      record("4.3 Claim on non-existent challenge ID returns HTTP 404", res.status === 404, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 4.4: Claim on challenge in 'pending' status (not routed to academia) -> HTTP 409
    {
      const chalPending = await createTestChallenge("PENDING-CLAIM", "Agriculture", "pending");
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalPending.id}/claim`, {
        universityId: uniA.id,
        universityName: uniA.organization || "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: chalPending.id } });
      const data = await res.json();
      record("4.4 Claim on 'pending' challenge returns HTTP 409 Conflict", res.status === 409, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 4.5: Claim on challenge in 'rejected' status -> HTTP 409
    {
      const chalRejectedState = await createTestChallenge("REJECTED-CLAIM", "Healthcare", "rejected");
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalRejectedState.id}/claim`, {
        universityId: uniA.id,
        universityName: uniA.organization || "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: chalRejectedState.id } });
      const data = await res.json();
      record("4.5 Claim on 'rejected' challenge returns HTTP 409 Conflict", res.status === 409, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // 4.6: Claim on challenge in 'diverted_to_gov' status -> HTTP 409
    {
      const chalDivertedState = await createTestChallenge("DIVERTED-CLAIM", "Energy", "diverted_to_gov");
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalDivertedState.id}/claim`, {
        universityId: uniA.id,
        universityName: uniA.organization || "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: chalDivertedState.id } });
      const data = await res.json();
      record("4.6 Claim on 'diverted_to_gov' challenge returns HTTP 409 Conflict", res.status === 409, `Status: ${res.status}, Error: "${data.error}"`);
    }

    // =========================================================================
    // SECTION 5: CONSECUTIVE CLAIMS ON ALREADY CLAIMED CHALLENGES (LOCKOUT ATTACK)
    // =========================================================================
    console.log("\n--- [SECTION 5] CONSECUTIVE CLAIMS & RACE LOCKOUT ATTACKS ---");

    const chalRace = await createTestChallenge("CONSECUTIVE-RACE", "Water Management", "routed_to_academia");

    // 5.1: University A acquires the initial lock -> HTTP 200
    let firstClaimTimestamp: string = "";
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalRace.id}/claim`, {
        universityId: uniA.id,
        universityName: "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: chalRace.id } });
      const data = await res.json();
      firstClaimTimestamp = data.claimedAt;
      record("5.1 First claimant (Uni A) successfully claims challenge -> HTTP 200",
        res.status === 200 && data.claimedInstitute === "IIT (ISM) Dhanbad" && Boolean(firstClaimTimestamp),
        `Status: ${res.status}, Institute: ${data.claimedInstitute}, Time: ${firstClaimTimestamp}`);
    }

    // 5.2: Uni A attempts CONSECUTIVE RE-CLAIM on same challenge -> HTTP 409 Conflict
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalRace.id}/claim`, {
        universityId: uniA.id,
        universityName: "IIT (ISM) Dhanbad",
      });
      const res = await claimPOST(req, { params: { id: chalRace.id } });
      const data = await res.json();
      record("5.2 Consecutive claim by SAME university (Uni A again) is rejected -> HTTP 409 Conflict",
        res.status === 409 && data.claimedInstitute === "IIT (ISM) Dhanbad",
        `Status: ${res.status}, Locked by: ${data.claimedInstitute}`);
    }

    // 5.3: Uni B attempts CONSECUTIVE CLAIM on already claimed challenge -> HTTP 409 Conflict
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalRace.id}/claim`, {
        universityId: uniB.id,
        universityName: "Birsa Agricultural University",
      });
      const res = await claimPOST(req, { params: { id: chalRace.id } });
      const data = await res.json();
      record("5.3 Competing claimant (Uni B) on claimed challenge is rejected -> HTTP 409 Conflict",
        res.status === 409 && data.claimedInstitute === "IIT (ISM) Dhanbad",
        `Status: ${res.status}, Locked by: ${data.claimedInstitute}`);
    }

    // 5.4: Uni C attempts CONSECUTIVE CLAIM on already claimed challenge -> HTTP 409 Conflict
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalRace.id}/claim`, {
        universityId: uniC.id,
        universityName: "National Institute of Technology Jamshedpur",
      });
      const res = await claimPOST(req, { params: { id: chalRace.id } });
      const data = await res.json();
      record("5.4 Third claimant (Uni C) on claimed challenge is rejected -> HTTP 409 Conflict",
        res.status === 409 && data.claimedInstitute === "IIT (ISM) Dhanbad",
        `Status: ${res.status}, Locked by: ${data.claimedInstitute}`);
    }

    // 5.5: Database Lock Invariant Check: Verify database integrity was not mutated by repeat claims
    {
      const chalDB = await prisma.challenge.findUnique({ where: { id: chalRace.id } });
      const intact = chalDB?.claimedById === uniA.id &&
        chalDB?.claimedInstitute === "IIT (ISM) Dhanbad" &&
        chalDB?.claimedAt?.toISOString() === new Date(firstClaimTimestamp).toISOString() &&
        chalDB?.status === "IN_PROGRESS";
      record("5.5 Database lock invariant verified: claimedById, claimedAt, status unchanged after collisions",
        intact,
        `Holder: ${chalDB?.claimedInstitute}, Status: ${chalDB?.status}`);
    }

    // =========================================================================
    // SECTION 6: MOCK EMAIL OUTPUT VERIFICATION & CONSOLE LOGGING
    // =========================================================================
    console.log("\n--- [SECTION 6] MOCK EMAIL OUTPUT VERIFICATION & CONSOLE LOGGING ---");

    const chalEmail = await createTestChallenge("EMAIL-VERIFY", "Agriculture");

    const interceptor = new ConsoleInterceptor();
    interceptor.start();

    let emailTriageRes: any;
    try {
      const req = makeJsonRequest("http://localhost:3000/api/nodal/triage", {
        challengeId: chalEmail.id,
        action: "route_to_academia",
        nodalOfficerId: govOfficer.id,
      });
      emailTriageRes = await triagePOST(req);
    } finally {
      interceptor.stop();
    }

    const capturedLogs = interceptor.logs.join("\n");

    // 6.1: Assert route to academia returned HTTP 200
    record("6.1 Routing to academia returned HTTP 200", emailTriageRes.status === 200, `Status: ${emailTriageRes.status}`);

    // 6.2: Verify console output contains MOCK EMAIL banner
    const hasBanner = capturedLogs.includes("📧 [MOCK EMAIL DISPATCH] AI 3-WAY UNIVERSITY MATCH NOTIFICATION");
    record("6.2 Console output contains '[MOCK EMAIL DISPATCH]' notification banner", hasBanner);

    // 6.3: Verify console logs contain the exact challenge ID and title
    const hasChallengeId = capturedLogs.includes(chalEmail.id);
    const hasChallengeTitle = capturedLogs.includes(chalEmail.title);
    record("6.3 Console logs include Challenge ID and Title", hasChallengeId && hasChallengeTitle, `ID: ${chalEmail.id.slice(0, 15)}...`);

    // 6.4: Verify exactly 3 mock emails were logged with [Mock Email to ...]
    const emailMatches = [...capturedLogs.matchAll(/\[Mock Email to ([^\]]+)\]/g)];
    const emailCountPass = emailMatches.length === 3;
    const recipientEmails = emailMatches.map(m => m[1]);
    record("6.4 Exactly 3 mock emails logged to console", emailCountPass, `Recipients: ${recipientEmails.join(", ")}`);

    // 6.5: Verify all 3 university email addresses end with valid academic domain (.ac.in)
    const allAcIn = recipientEmails.every(email => email.endsWith(".ac.in"));
    record("6.5 All 3 matched university emails end with '.ac.in'", allAcIn, `Emails: ${recipientEmails.join("; ")}`);

    // 6.6: Verify claim links contain the correct URL pattern: http://localhost:3000/challenge/<id>
    const expectedClaimUrl = `http://localhost:3000/challenge/${chalEmail.id}`;
    const hasClaimLinks = capturedLogs.includes(`Claim link: ${expectedClaimUrl}`);
    record("6.6 Claim URL pattern in mock email matches http://localhost:3000/challenge/<id>", hasClaimLinks, `URL: ${expectedClaimUrl}`);

    // 6.7: Verify GET /api/challenges/[id]/claim returns matched universities & claim status
    {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${chalEmail.id}/claim`, undefined, "GET");
      const res = await claimGET(req, { params: { id: chalEmail.id } });
      const data = await res.json();
      const getPass = res.status === 200 &&
        data.isAvailableForClaim === true &&
        data.isClaimed === false &&
        Array.isArray(data.matchedUniversities) &&
        data.matchedUniversities.length === 3;
      record("6.7 GET /api/challenges/[id]/claim reports available for claim with 3 matched universities", getPass, `isAvailable: ${data.isAvailableForClaim}, matched: ${data.matchedUniversities.length}`);
    }

  } finally {
    // Teardown
    console.log("\n🧹 Cleaning up test challenges and audit records...");
    if (createdChallengeIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await prisma.challenge.deleteMany({
        where: { id: { in: createdChallengeIds } },
      });
      console.log(`   Cleaned up ${createdChallengeIds.length} test challenges.`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`🏆 EMPIRICAL BATTERY COMPLETE: ${passCount}/${testCount} ATTACKS PASSED`);
  if (passCount < testCount) {
    console.log("\n⚠️ DETAILED FAILURES:");
    for (const r of attackResults) {
      if (!r.passed) {
        console.log(`❌ [ATTACK ${r.id}] ${r.name}`);
        console.log(`   Details: ${r.details}`);
      }
    }
  }
  console.log("===============================================================================\n");
}

runEmpiricalBattery()
  .catch((err) => {
    console.error("FATAL SUITE ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
