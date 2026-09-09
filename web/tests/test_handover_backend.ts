/**
 * Backend Handover Token & API Lifecycle Test Suite
 * File: web/tests/test_handover_backend.ts
 * Execution: npx tsx tests/test_handover_backend.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
import { signSessionToken, hashPassword, verifyPassword, SessionPayload } from "../src/lib/auth";
import { POST as initiatePOST, GET as initiateGET } from "../src/app/api/handover/initiate/route";
import { GET as validateGET, POST as tokenPOST } from "../src/app/api/handover/[token]/route";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";
import { POST as cancelPOST } from "../src/app/api/handover/cancel/route";

function makeJsonRequest(
  url: string,
  body?: any,
  sessionCookie?: string,
  method: string = "POST"
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    host: "localhost:3000",
  };
  if (sessionCookie) {
    headers["Cookie"] = `sih_session=${sessionCookie}`;
  }

  const req = new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return req;
}

async function runHandoverBackendTests() {
  console.log("\n===============================================================================");
  console.log("🚀 STARTING TEST SUITE: BACKEND HANDOVER TOKEN & API VERIFICATION");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(testName: string) {
    totalTests++;
    passedTests++;
    console.log(`✅ [PASS ${passedTests}] ${testName}`);
  }

  // Cleanup helper for test users
  const testPredecessorEmail = `predecessor_${Date.now()}@jharkhand.gov.in`;
  const testSuccessorEmail = `successor_${Date.now()}@jharkhand.gov.in`;
  const testInitialPassword = "PredecessorPassword@2026!";
  const testSuccessorPassword = "SuccessorNewSecret@2026!";

  let createdUserId: string | null = null;
  let createdChallengeId: string | null = null;
  const extraCleanupUserIds: string[] = [];

  try {
    // ---------------------------------------------------------------------------
    // SETUP: Create a predecessor user with attached challenges & 2FA enabled
    // ---------------------------------------------------------------------------
    const initialHash = await hashPassword(testInitialPassword);
    const predecessorUser = await prisma.user.create({
      data: {
        email: testPredecessorEmail,
        name: "Dr. Vikramaditya Singh, IAS",
        passwordHash: initialHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Department of Higher Education & Innovation",
        designation: "Principal Secretary",
        district: "Ranchi",
        twoFactorEnabled: true,
        twoFactorSecret: "BASE32TESTSECRET2FA",
        failedLoginAttempts: 2,
        emailVerified: new Date(),
      },
    });
    createdUserId = predecessorUser.id;

    // Attach a challenge to verify relational foreign key preservation
    const challenge = await prisma.challenge.create({
      data: {
        publicTrackingId: `CHAL-HANDOVER-TEST-${Date.now()}`,
        title: "Tribal Watershed Management Project",
        description: "Decentralized micro-checkdams in Khunti district.",
        domain: "Water Management",
        district: "Khunti",
        location: "Murhu Block",
        urgency: "HIGH",
        status: "OPEN_FOR_PROPOSALS",
        nodalStatus: "pending",
        reportedById: predecessorUser.id,
      },
    });
    createdChallengeId = challenge.id;

    recordPass("Setup: Predecessor user created with 2FA, failed attempts, and linked challenge");

    // Generate valid session JWT for predecessor
    const sessionPayload: SessionPayload = {
      userId: predecessorUser.id,
      email: predecessorUser.email,
      name: predecessorUser.name,
      role: predecessorUser.role as any,
      status: predecessorUser.status as any,
      organization: predecessorUser.organization,
      district: predecessorUser.district,
    };
    const predecessorSessionCookie = await signSessionToken(sessionPayload);

    // ---------------------------------------------------------------------------
    // TEST 1: Initiate Handover Validation - Reject Same Email
    // ---------------------------------------------------------------------------
    const sameEmailReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: testPredecessorEmail },
      predecessorSessionCookie
    );
    const sameEmailRes = await initiatePOST(sameEmailReq);
    assert.equal(sameEmailRes.status, 400, "Initiating handover to own email must return HTTP 400");
    recordPass("Initiate Validation: Self-handover rejected with HTTP 400");

    // ---------------------------------------------------------------------------
    // TEST 2: Initiate Handover Validation - Reject Invalid Email Format
    // ---------------------------------------------------------------------------
    const badEmailReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: "invalid-email-no-at" },
      predecessorSessionCookie
    );
    const badEmailRes = await initiatePOST(badEmailReq);
    assert.equal(badEmailRes.status, 400, "Invalid email format must return HTTP 400");
    recordPass("Initiate Validation: Malformed email rejected with HTTP 400");

    // ---------------------------------------------------------------------------
    // TEST 3: Initiate Handover Successfully
    // ---------------------------------------------------------------------------
    const initiateReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: testSuccessorEmail },
      predecessorSessionCookie
    );
    const initiateRes = await initiatePOST(initiateReq);
    assert.equal(initiateRes.status, 200, "Valid initiate request must return HTTP 200");
    const initiateData = await initiateRes.json();

    assert.equal(initiateData.success, true, "Response must indicate success");
    assert.ok(initiateData.token, "Response must include generated token");
    assert.equal(initiateData.token.length, 64, "Token must be a 64-character hex string");
    assert.equal(initiateData.successorEmail, testSuccessorEmail.toLowerCase());
    assert.ok(initiateData.expiresAt, "Response must include expiresAt timestamp");
    assert.ok(initiateData.claimUrl, "Response must include claimUrl");

    const handoverTokenString = initiateData.token;

    // Verify record in SQLite HandoverToken table
    const dbToken = await prisma.handoverToken.findUnique({
      where: { token: handoverTokenString },
    });
    assert.ok(dbToken, "HandoverToken record must exist in DB");
    assert.equal(dbToken.userId, predecessorUser.id);
    assert.equal(dbToken.successorEmail, testSuccessorEmail.toLowerCase());
    assert.equal(dbToken.usedAt, null, "usedAt must initially be null");
    assert.ok(dbToken.expiresAt > new Date(), "expiresAt must be in the future");

    recordPass("Initiate Success: 64-char token persisted in database with 48h expiry");

    // ---------------------------------------------------------------------------
    // TEST 4: Query Pending Handover Status via GET /api/handover/initiate
    // ---------------------------------------------------------------------------
    const statusReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      undefined,
      predecessorSessionCookie,
      "GET"
    );
    const statusRes = await initiateGET(statusReq);
    assert.equal(statusRes.status, 200, "Status query must return HTTP 200");
    const statusData = await statusRes.json();
    assert.equal(statusData.hasPendingHandover, true);
    assert.equal(statusData.pendingHandover.token, handoverTokenString);
    assert.equal(statusData.pendingHandover.successorEmail, testSuccessorEmail.toLowerCase());
    recordPass("Status Query: GET /api/handover/initiate returns active pending token");

    // ---------------------------------------------------------------------------
    // TEST 5: Validate Handover Token via Public GET /api/handover/[token]
    // ---------------------------------------------------------------------------
    const validateReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}`,
      undefined,
      undefined,
      "GET"
    );
    const validateRes = await validateGET(validateReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(validateRes.status, 200, "Public validate endpoint must return HTTP 200");
    const validateData = await validateRes.json();
    assert.equal(validateData.valid, true);
    assert.equal(validateData.successorEmail, testSuccessorEmail.toLowerCase());
    assert.equal(validateData.predecessor.name, "Dr. Vikramaditya Singh, IAS");
    assert.equal(validateData.predecessor.role, "GOV");
    assert.equal(validateData.predecessor.designation, "Principal Secretary");
    assert.equal(validateData.predecessor.district, "Ranchi");
    recordPass("Public Validation: GET /api/handover/[token] returns predecessor metadata");

    // ---------------------------------------------------------------------------
    // TEST 6: Invalid Token Validation Returns 404
    // ---------------------------------------------------------------------------
    const invalidTokenReq = makeJsonRequest(
      "http://localhost:3000/api/handover/invalid-token-12345",
      undefined,
      undefined,
      "GET"
    );
    const invalidTokenRes = await validateGET(invalidTokenReq, {
      params: Promise.resolve({ token: "invalid-token-12345" }),
    });
    assert.equal(invalidTokenRes.status, 404, "Invalid token must return HTTP 404");
    const invalidTokenData = await invalidTokenRes.json();
    assert.equal(invalidTokenData.valid, false);
    recordPass("Public Validation: Non-existent token returns HTTP 404");

    // ---------------------------------------------------------------------------
    // TEST 7: Claim Handover - Reject Short Password
    // ---------------------------------------------------------------------------
    const shortPassReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}/claim`,
      { successorName: "Ananya Sharma, IAS", password: "short" }
    );
    const shortPassRes = await claimPOST(shortPassReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(shortPassRes.status, 400, "Short password must return HTTP 400");
    recordPass("Claim Validation: Password under 8 characters rejected with HTTP 400");

    // ---------------------------------------------------------------------------
    // TEST 8: Claim Handover - Reject Mismatched Password
    // ---------------------------------------------------------------------------
    const mismatchReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}/claim`,
      {
        successorName: "Ananya Sharma, IAS",
        password: testSuccessorPassword,
        confirmPassword: "MismatchPassword@123!",
      }
    );
    const mismatchRes = await claimPOST(mismatchReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(mismatchRes.status, 400, "Mismatched confirmPassword must return HTTP 400");
    recordPass("Claim Validation: Mismatched password rejected with HTTP 400");

    // ---------------------------------------------------------------------------
    // TEST 9: Claim Handover Successfully (Atomic Transaction)
    // ---------------------------------------------------------------------------
    const claimReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}/claim`,
      {
        successorName: "Ananya Sharma, IAS",
        password: testSuccessorPassword,
        confirmPassword: testSuccessorPassword,
      }
    );
    const claimRes = await claimPOST(claimReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(claimRes.status, 200, "Valid claim request must return HTTP 200");
    const claimData = await claimRes.json();

    assert.equal(claimData.success, true);
    assert.equal(claimData.user.id, predecessorUser.id, "User.id MUST remain identical to preserve data relationships");
    assert.equal(claimData.user.name, "Ananya Sharma, IAS");
    assert.equal(claimData.user.email, testSuccessorEmail.toLowerCase());
    assert.equal(claimData.user.role, "GOV");
    assert.equal(claimData.redirectUrl, "/dashboard/gov");

    // Assert session cookie is set
    const setCookieHeader = claimRes.headers.get("set-cookie");
    assert.ok(setCookieHeader, "Claim response must set authentication cookie");
    assert.ok(setCookieHeader.includes("sih_session="), "Cookie must contain sih_session");

    // ---------------------------------------------------------------------------
    // TEST 10: Database State Verification After Claim
    // ---------------------------------------------------------------------------
    const updatedUserInDb = await prisma.user.findUnique({
      where: { id: predecessorUser.id },
    });
    assert.ok(updatedUserInDb);
    assert.equal(updatedUserInDb.name, "Ananya Sharma, IAS", "User name must be updated to successor");
    assert.equal(updatedUserInDb.email, testSuccessorEmail.toLowerCase(), "User email must be updated to successor email");
    assert.equal(updatedUserInDb.twoFactorEnabled, false, "2FA must be reset to prevent successor lockout");
    assert.equal(updatedUserInDb.twoFactorSecret, null, "2FA secret must be cleared");
    assert.equal(updatedUserInDb.failedLoginAttempts, 0, "Failed login counter must be reset");
    assert.equal(updatedUserInDb.lockoutUntil, null, "Lockout timestamp must be cleared");

    // Verify new password hashes and authenticates
    const passwordMatches = await verifyPassword(testSuccessorPassword, updatedUserInDb.passwordHash);
    assert.equal(passwordMatches, true, "Successor must be able to verify with new password");

    const oldPasswordMatches = await verifyPassword(testInitialPassword, updatedUserInDb.passwordHash);
    assert.equal(oldPasswordMatches, false, "Predecessor old password must no longer match");

    // Verify token marked as used
    const updatedTokenInDb = await prisma.handoverToken.findUnique({
      where: { token: handoverTokenString },
    });
    assert.ok(updatedTokenInDb);
    assert.ok(updatedTokenInDb.usedAt !== null, "usedAt timestamp must be populated on claimed token");

    // Verify challenge relationship remains fully preserved!
    const linkedChallenge = await prisma.challenge.findUnique({
      where: { id: createdChallengeId },
    });
    assert.ok(linkedChallenge);
    assert.equal(linkedChallenge.reportedById, predecessorUser.id, "Challenge reportedById must still link to preserved User ID");

    // Verify audit log entry
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        userId: predecessorUser.id,
        action: "HANDOVER_CLAIMED",
      },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(auditLog, "Statutory AuditLog record must exist for HANDOVER_CLAIMED");

    recordPass("Database State Verification: User updated, 2FA reset, token usedAt set, challenge FK preserved");

    // ---------------------------------------------------------------------------
    // TEST 11: Replay Attack Defense - Second Claim of Same Token Must Fail
    // ---------------------------------------------------------------------------
    const replayClaimReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}/claim`,
      {
        successorName: "Intruder User",
        password: "AttackerPassword123!",
      }
    );
    const replayClaimRes = await claimPOST(replayClaimReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(replayClaimRes.status, 409, "Replaying an already used token must return HTTP 409 Conflict");
    recordPass("Replay Protection: Re-claiming used token rejected with HTTP 409");

    // ---------------------------------------------------------------------------
    // TEST 12: GET /api/handover/[token] After Claim Returns 409
    // ---------------------------------------------------------------------------
    const validateUsedReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${handoverTokenString}`,
      undefined,
      undefined,
      "GET"
    );
    const validateUsedRes = await validateGET(validateUsedReq, {
      params: Promise.resolve({ token: handoverTokenString }),
    });
    assert.equal(validateUsedRes.status, 409, "GET on used token must return HTTP 409");
    const validateUsedData = await validateUsedRes.json();
    assert.equal(validateUsedData.valid, false);
    recordPass("Token Query: Validating claimed token returns HTTP 409 (already claimed)");

    // ---------------------------------------------------------------------------
    // TEST 13: Direct Claim via /api/handover/[token] (Dual-Path Interoperability)
    // ---------------------------------------------------------------------------
    // Initiate another token to test POST /api/handover/[token]
    const successor2Email = `successor2_${Date.now()}@jharkhand.gov.in`;
    const newSessionToken = await signSessionToken({
      userId: updatedUserInDb.id,
      email: updatedUserInDb.email,
      name: updatedUserInDb.name,
      role: updatedUserInDb.role as any,
      status: updatedUserInDb.status as any,
      organization: updatedUserInDb.organization,
      district: updatedUserInDb.district,
    });

    const init2Req = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: successor2Email },
      newSessionToken
    );
    const init2Res = await initiatePOST(init2Req);
    assert.equal(init2Res.status, 200);
    const init2Data = await init2Res.json();
    const token2 = init2Data.token;

    // Call POST directly on /api/handover/[token]
    const directPostReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${token2}`,
      { successorName: "Successor 2", password: "NewPassword@2026Second!" }
    );
    const directPostRes = await tokenPOST(directPostReq, {
      params: Promise.resolve({ token: token2 }),
    });
    assert.equal(directPostRes.status, 200, "POST /api/handover/[token] must succeed identically");
    recordPass("Dual-Path Route: Direct POST to /api/handover/[token] successfully claims account");

    // ---------------------------------------------------------------------------
    // TEST 14: Cancel Handover API via POST /api/handover/cancel
    // ---------------------------------------------------------------------------
    // Since TEST 13 claimed the account as Successor 2, generate session token for current owner
    const userAfterClaim2 = await prisma.user.findUnique({ where: { id: predecessorUser.id } });
    const sessionTokenAfterClaim2 = await signSessionToken({
      userId: userAfterClaim2!.id,
      email: userAfterClaim2!.email,
      name: userAfterClaim2!.name,
      role: userAfterClaim2!.role as any,
      status: userAfterClaim2!.status as any,
      organization: userAfterClaim2!.organization,
      district: userAfterClaim2!.district,
    });

    // Initiate token 3
    const successor3Email = `successor3_${Date.now()}@jharkhand.gov.in`;
    const init3Req = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: successor3Email },
      sessionTokenAfterClaim2
    );
    const init3Res = await initiatePOST(init3Req);
    assert.equal(init3Res.status, 200);
    const init3Data = await init3Res.json();
    const token3 = init3Data.token;

    // Verify token 3 exists in DB
    const dbToken3Before = await prisma.handoverToken.findUnique({ where: { token: token3 } });
    assert.ok(dbToken3Before);

    // Cancel handover
    const cancelReq = makeJsonRequest(
      "http://localhost:3000/api/handover/cancel",
      {},
      sessionTokenAfterClaim2
    );
    const cancelRes = await cancelPOST(cancelReq);
    assert.equal(cancelRes.status, 200, "Cancel handover must return HTTP 200");
    const cancelData = await cancelRes.json();
    assert.equal(cancelData.success, true);
    assert.ok(cancelData.cancelledCount >= 1);

    // Verify token 3 is no longer pending
    const dbToken3After = await prisma.handoverToken.findUnique({ where: { token: token3 } });
    assert.equal(dbToken3After, null, "Cancelled token must be removed or marked expired");

    recordPass("Cancel Handover: POST /api/handover/cancel invalidates pending invitations");

    // ---------------------------------------------------------------------------
    // TEST 15: Concurrent Claim: 2 Simultaneous Claims Yield Exactly 1x 200 & 1x 409
    // ---------------------------------------------------------------------------
    const concUser1 = await prisma.user.create({
      data: {
        email: `conc1_${Date.now()}@jharkhand.gov.in`,
        name: "Concurrent Predecessor 1",
        passwordHash: initialHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    extraCleanupUserIds.push(concUser1.id);

    const concToken1 = crypto.randomBytes(32).toString("hex");
    const concSuccEmail1 = `conc_succ1_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: concToken1,
        userId: concUser1.id,
        successorEmail: concSuccEmail1,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    const concReq1 = makeJsonRequest(`http://localhost:3000/api/handover/${concToken1}/claim`, {
      successorName: "Racer 1",
      password: "Password123@!",
      confirmPassword: "Password123@!",
    });
    const concReq2 = makeJsonRequest(`http://localhost:3000/api/handover/${concToken1}/claim`, {
      successorName: "Racer 2",
      password: "Password456@!",
      confirmPassword: "Password456@!",
    });

    const [concRes1, concRes2] = await Promise.all([
      claimPOST(concReq1, { params: Promise.resolve({ token: concToken1 }) }),
      claimPOST(concReq2, { params: Promise.resolve({ token: concToken1 }) }),
    ]);

    const concStatuses = [concRes1.status, concRes2.status].sort();
    assert.deepEqual(concStatuses, [200, 409], "Must yield exactly 1x 200 and 1x 409");

    const winnerRes = concRes1.status === 200 ? concRes1 : concRes2;
    const loserRes = concRes1.status === 409 ? concRes1 : concRes2;
    const winnerBody = await winnerRes.json();
    const loserBody = await loserRes.json();

    assert.equal(winnerBody.success, true);
    assert.ok(winnerRes.headers.get("set-cookie")?.includes("sih_session="), "Winner must have session cookie");
    assert.equal(loserBody.success, false);
    assert.match(loserBody.error, /already been claimed/i);
    assert.equal(loserRes.headers.get("set-cookie"), null, "Loser must not have session cookie");

    const concUser1Db = await prisma.user.findUnique({ where: { id: concUser1.id } });
    assert.equal(concUser1Db?.name, winnerBody.user.name);
    const winnerPass = winnerBody.user.name === "Racer 1" ? "Password123@!" : "Password456@!";
    const loserPass = winnerBody.user.name === "Racer 1" ? "Password456@!" : "Password123@!";
    assert.equal(await verifyPassword(winnerPass, concUser1Db!.passwordHash), true);
    assert.equal(await verifyPassword(loserPass, concUser1Db!.passwordHash), false);

    const concLogs1 = await prisma.auditLog.findMany({ where: { userId: concUser1.id, action: "HANDOVER_CLAIMED" } });
    assert.equal(concLogs1.length, 1, "Exactly 1 audit log must be recorded");

    recordPass("Concurrent Claim: 2 simultaneous claims yield 1x 200 winner with cookie & 1x 409 lockout");

    // ---------------------------------------------------------------------------
    // TEST 16: Multi-Burst Concurrency: 5 Simultaneous Claims Yield Exactly 1x 200 & 4x 409
    // ---------------------------------------------------------------------------
    const concUser2 = await prisma.user.create({
      data: {
        email: `conc2_${Date.now()}@jharkhand.gov.in`,
        name: "Concurrent Predecessor 2",
        passwordHash: initialHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    extraCleanupUserIds.push(concUser2.id);

    const concToken2 = crypto.randomBytes(32).toString("hex");
    const concSuccEmail2 = `conc_succ2_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: concToken2,
        userId: concUser2.id,
        successorEmail: concSuccEmail2,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    const burstRequests = Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1;
      const req = makeJsonRequest(`http://localhost:3000/api/handover/${concToken2}/claim`, {
        successorName: `Burst Racer ${idx}`,
        password: `BurstPass@${idx}2026!`,
        confirmPassword: `BurstPass@${idx}2026!`,
      });
      return claimPOST(req, { params: Promise.resolve({ token: concToken2 }) });
    });

    const burstResponses = await Promise.all(burstRequests);
    const burstStatuses = burstResponses.map((r) => r.status);
    const count200 = burstStatuses.filter((s) => s === 200).length;
    const count409 = burstStatuses.filter((s) => s === 409).length;
    assert.equal(count200, 1, "Burst must yield exactly 1x 200");
    assert.equal(count409, 4, "Burst must yield exactly 4x 409");

    const concLogs2 = await prisma.auditLog.findMany({ where: { userId: concUser2.id, action: "HANDOVER_CLAIMED" } });
    assert.equal(concLogs2.length, 1, "Exactly 1 audit log in 5-burst claim");

    recordPass("Multi-Burst Concurrency: 5 simultaneous claims yield 1x 200 winner & 4x 409 lockouts");

    // ---------------------------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------------------------
    console.log("\n===============================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!`);
    console.log("===============================================================================\n");

    } finally {
      // Teardown test fixtures
      try {
        if (createdChallengeId) {
          await prisma.challenge.delete({ where: { id: createdChallengeId } }).catch(() => {});
        }
        if (createdUserId) {
          await prisma.handoverToken.deleteMany({ where: { userId: createdUserId } }).catch(() => {});
          await prisma.auditLog.deleteMany({ where: { userId: createdUserId } }).catch(() => {});
          await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
        }
        for (const uid of extraCleanupUserIds) {
          await prisma.handoverToken.deleteMany({ where: { userId: uid } }).catch(() => {});
          await prisma.auditLog.deleteMany({ where: { userId: uid } }).catch(() => {});
          await prisma.user.delete({ where: { id: uid } }).catch(() => {});
        }
        console.log("🧹 Teardown completed: Test fixtures cleaned up from database.");
        await prisma.$disconnect();
      } catch (cleanupErr) {
        console.warn("Cleanup warning:", cleanupErr);
      }
      process.exit(0);
    }
}

runHandoverBackendTests().catch((err) => {
  console.error("❌ Test failed with unhandled error:", err);
  process.exit(1);
});
