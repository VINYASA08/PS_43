/**
 * Challenger 2 Adversarial Stress-Test Suite: Handover Authentication & Security Verification
 * File: web/tests/challenger_auth_handover_stress.test.ts
 * Execution: npx tsx tests/challenger_auth_handover_stress.test.ts
 *
 * Scopes tested:
 * 1. Subsequent login with new credentials (User B / Successor)
 * 2. Old credentials revocation (User A / Predecessor password & email rejected)
 * 3. 2FA neutralization (predecessor secret wiped, old TOTP rejected, lockout avoided, fresh 2FA setup)
 * 4. Session cookie issuance, cryptographic validity, and authenticated endpoint access
 * 5. Replay attacks, lockout reset, and role preservation
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

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
import {
  signSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  SessionPayload,
} from "../src/lib/auth";
import { generateBase32Secret, generateTOTP, verifyTOTP } from "../src/lib/totp";

// API Route Handlers
import { POST as initiatePOST, GET as initiateGET } from "../src/app/api/handover/initiate/route";
import { GET as validateGET, POST as tokenPOST } from "../src/app/api/handover/[token]/route";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";
import { POST as cancelPOST } from "../src/app/api/handover/cancel/route";
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { GET as meGET } from "../src/app/api/auth/me/route";
import { POST as totpSetupPOST } from "../src/app/api/auth/totp-setup/route";
import { POST as totpVerifyPOST } from "../src/app/api/auth/totp-verify/route";

function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    sessionCookie?: string;
    ip?: string;
  } = {}
): NextRequest {
  const method = options.method || (options.body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    host: "localhost:3000",
    "x-forwarded-for": options.ip || "198.51.100.42",
  };
  if (options.sessionCookie) {
    headers["Cookie"] = `sih_session=${options.sessionCookie}`;
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

function extractSessionCookie(res: NextResponse): string | undefined {
  if (res.cookies && typeof res.cookies.get === "function") {
    const c = res.cookies.get("sih_session");
    if (c) return c.value;
  }
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/sih_session=([^;]+)/);
    if (match) return match[1];
  }
  return undefined;
}

async function runChallengerStressTests() {
  console.log("\n===============================================================================");
  console.log("🛡️ CHALLENGER 2 ADVERSARIAL STRESS TEST: AUTHENTICATION & HANDOVER SECURITY");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(testName: string, detail?: string) {
    totalTests++;
    passedTests++;
    console.log(`✅ [PASS ${passedTests}] ${testName}`);
    if (detail) {
      console.log(`   └─ ${detail}`);
    }
  }

  const timestamp = Date.now();
  const testPredecessorEmail = `predecessor_ias_${timestamp}@jharkhand.gov.in`;
  const testSuccessorEmail = `successor_ias_${timestamp}@jharkhand.gov.in`;
  const testOldPassword = "PredecessorPassword@Gov2026!";
  const testNewPassword = "SuccessorStrongPassword#Gov2026!";
  const predecessorOldSecret = generateBase32Secret(20);

  let userId: string | null = null;
  let challengeId: string | null = null;
  let handoverTokenStr: string | null = null;
  let claimSessionCookie: string | null = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Setup Predecessor with Active 2FA & Failed Attempts
    // -------------------------------------------------------------------------
    const oldHash = await hashPassword(testOldPassword);
    const predecessorUser = await prisma.user.create({
      data: {
        email: testPredecessorEmail,
        name: "Dr. Arvind Sharan, IAS",
        passwordHash: oldHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Jharkhand State Innovation Council",
        designation: "Principal Secretary",
        district: "Ranchi",
        twoFactorEnabled: true,
        twoFactorSecret: predecessorOldSecret,
        failedLoginAttempts: 4, // 1 step away from 5-attempt lockout!
        emailVerified: new Date(),
      },
    });
    userId = predecessorUser.id;

    // Link a Challenge to verify relational persistence
    const testChallenge = await prisma.challenge.create({
      data: {
        publicTrackingId: `GOV-AUTH-${timestamp}`,
        title: "Tribal Innovation Corridor - Digital Health",
        description: "Official governmental infrastructure challenge for auth transfer testing",
        domain: "Healthcare",
        district: "Ranchi",
        location: "Kanke Road, Ranchi",
        urgency: "HIGH",
        status: "OPEN",
        track: "TRACK_A_INNOVATION",
        reportedById: userId,
      },
    });
    challengeId = testChallenge.id;

    // Verify initial login works with old credentials
    const initialLoginReq = makeRequest("/api/auth/login", {
      body: { email: testPredecessorEmail, password: testOldPassword },
      ip: `198.51.100.${timestamp % 200 + 1}`,
    });
    const initialLoginRes = await loginPOST(initialLoginReq);
    assert.strictEqual(initialLoginRes.status, 200, "Initial login with predecessor password must succeed");
    const initialLoginData = await initialLoginRes.json();
    assert.strictEqual(initialLoginData.user.userId || initialLoginData.user.id, userId);

    // Verify predecessor's initial TOTP token is valid against their secret
    const validPredecessorTotp = generateTOTP(predecessorOldSecret);
    assert.strictEqual(
      verifyTOTP(predecessorOldSecret, validPredecessorTotp),
      true,
      "Predecessor TOTP secret must be active before handover"
    );

    recordPass(
      "Setup Predecessor with 2FA, 4 failed attempts, and active session",
      `User ${userId} created with role GOV, email ${testPredecessorEmail}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Predecessor Initiates Handover to Successor
    // -------------------------------------------------------------------------
    const predecessorSessionPayload: SessionPayload = {
      userId: predecessorUser.id,
      email: predecessorUser.email,
      name: predecessorUser.name,
      role: "GOV",
      status: "ACTIVE",
    };
    const predSessionToken = await signSessionToken(predecessorSessionPayload);

    const initReq = makeRequest("/api/handover/initiate", {
      body: { successorEmail: testSuccessorEmail },
      sessionCookie: predSessionToken,
      ip: "198.51.100.50",
    });
    const initRes = await initiatePOST(initReq);
    assert.strictEqual(initRes.status, 200, "Initiate handover must return HTTP 200");
    const initData = await initRes.json();
    assert.strictEqual(initData.success, true);
    assert.ok(initData.token && initData.token.length === 64, "Generated token must be 64-char hex");
    handoverTokenStr = initData.token;

    recordPass(
      "Predecessor Initiates Handover",
      `Generated 64-char token for successor ${testSuccessorEmail}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Successor Claims Account & Session Cookie Issuance
    // -------------------------------------------------------------------------
    const claimReq = makeRequest(`/api/handover/${handoverTokenStr}/claim`, {
      body: {
        successorName: "Ananya Soren, IAS",
        password: testNewPassword,
        confirmPassword: testNewPassword,
      },
      ip: "198.51.100.51",
    });
    const claimRes = await claimPOST(claimReq, { params: { token: handoverTokenStr! } });
    assert.strictEqual(claimRes.status, 200, "Claim endpoint must return HTTP 200");
    const claimData = await claimRes.json();

    assert.strictEqual(claimData.success, true);
    assert.strictEqual(claimData.user.id, userId, "Claim must preserve identical User.id");
    assert.strictEqual(claimData.user.email, testSuccessorEmail, "User email updated to successor");
    assert.strictEqual(claimData.user.name, "Ananya Soren, IAS", "User name updated to successor");
    assert.strictEqual(claimData.user.role, "GOV", "User role preserved as GOV");
    assert.strictEqual(claimData.redirectUrl, "/dashboard/gov", "Redirect URL directed to role dashboard");

    // Extract and inspect session cookie
    const issuedCookie = extractSessionCookie(claimRes);
    assert.ok(issuedCookie, "Response must attach sih_session cookie in Set-Cookie");
    claimSessionCookie = issuedCookie;

    // Cryptographically verify session cookie JWT
    const decodedJwt = await verifySessionToken(claimSessionCookie);
    assert.ok(decodedJwt, "Session cookie must be a cryptographically valid JWT signed with server secret");
    assert.strictEqual(decodedJwt.userId, userId, "JWT userId must match original user ID");
    assert.strictEqual(decodedJwt.email, testSuccessorEmail, "JWT email must match successor");
    assert.strictEqual(decodedJwt.name, "Ananya Soren, IAS", "JWT name must match successor");
    assert.strictEqual(decodedJwt.role, "GOV", "JWT role must match GOV");

    recordPass(
      "Successor Claims Account & Receives Valid Authenticated Session Cookie",
      `JWT decoded cleanly: userId=${decodedJwt.userId}, role=${decodedJwt.role}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Session Cookie Validated Against Protected Endpoints (/api/auth/me)
    // -------------------------------------------------------------------------
    const meReq = makeRequest("/api/auth/me", {
      sessionCookie: claimSessionCookie,
      ip: "198.51.100.52",
    });
    const meRes = await meGET(meReq);
    assert.strictEqual(meRes.status, 200, "/api/auth/me must return HTTP 200");
    const meData = await meRes.json();

    assert.strictEqual(meData.authenticated, true, "Session cookie must grant authenticated access");
    assert.strictEqual(meData.user.id, userId, "Auth me user.id matches predecessor user ID");
    assert.strictEqual(meData.user.email, testSuccessorEmail, "Auth me email reflects successor");
    assert.strictEqual(meData.user.name, "Ananya Soren, IAS", "Auth me name reflects successor");
    assert.strictEqual(meData.user.twoFactorEnabled, false, "Auth me confirms 2FA is reset to false");

    // Verify session cookie works on handover initiate status check
    const statusReq = makeRequest("/api/handover/initiate", {
      sessionCookie: claimSessionCookie,
      ip: "198.51.100.53",
    });
    const statusRes = await initiateGET(statusReq);
    assert.strictEqual(statusRes.status, 200, "Protected GET /api/handover/initiate must return HTTP 200");
    const statusData = await statusRes.json();
    assert.strictEqual(statusData.hasPendingHandover, false, "Successor currently has no pending handovers");

    recordPass(
      "Session Cookie Validated via /api/auth/me and /api/handover/initiate",
      "Authenticated endpoints respond with authenticated: true and accurate successor state"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Relational Integrity & Statutory Audit Log Verification
    // -------------------------------------------------------------------------
    // Check Challenge entity relation
    const challengeCheck = await prisma.challenge.findUnique({
      where: { id: challengeId! },
    });
    assert.ok(challengeCheck, "Challenge fixture must still exist");
    assert.strictEqual(challengeCheck.reportedById, userId, "Foreign key reportedById must remain unchanged");

    // Check AuditLog entry
    const auditLogCheck = await prisma.auditLog.findFirst({
      where: {
        userId: userId,
        action: "HANDOVER_CLAIMED",
      },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(auditLogCheck, "AuditLog HANDOVER_CLAIMED record must be created");
    assert.strictEqual(auditLogCheck.resource, "User");
    assert.strictEqual(auditLogCheck.resourceId, userId);
    const oldState = JSON.parse(auditLogCheck.oldState || "{}");
    const newState = JSON.parse(auditLogCheck.newState || "{}");
    assert.strictEqual(oldState.predecessorEmail, testPredecessorEmail);
    assert.strictEqual(newState.successorEmail, testSuccessorEmail);

    recordPass(
      "Relational Integrity & Statutory AuditLog Verified",
      "Challenge FK intact, HANDOVER_CLAIMED audit record correctly logged"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Adversarial Probing: Old Credentials Revocation
    // -------------------------------------------------------------------------
    // Probe 6A: Predecessor old email + old password
    const probe6AReq = makeRequest("/api/auth/login", {
      body: { email: testPredecessorEmail, password: testOldPassword },
      ip: "198.51.100.60",
    });
    const probe6ARes = await loginPOST(probe6AReq);
    assert.strictEqual(probe6ARes.status, 401, "Predecessor old email must be rejected with HTTP 401");
    const probe6AData = await probe6ARes.json();
    assert.ok(probe6AData.error, "Error message returned for non-existent predecessor email");

    // Probe 6B: Successor new email + predecessor old password
    const probe6BReq = makeRequest("/api/auth/login", {
      body: { email: testSuccessorEmail, password: testOldPassword },
      ip: "198.51.100.61",
    });
    const probe6BRes = await loginPOST(probe6BReq);
    assert.strictEqual(probe6BRes.status, 401, "Predecessor old password against successor email must be rejected with HTTP 401");
    const probe6BData = await probe6BRes.json();
    assert.ok(probe6BData.attemptsRemaining !== undefined, "Failed attempt must decrement attemptsRemaining");

    // Probe 6C: Predecessor old email + successor new password
    const probe6CReq = makeRequest("/api/auth/login", {
      body: { email: testPredecessorEmail, password: testNewPassword },
      ip: "198.51.100.62",
    });
    const probe6CRes = await loginPOST(probe6CReq);
    assert.strictEqual(probe6CRes.status, 401, "Old email with new password must be rejected with HTTP 401");

    // Probe 6D: Successor new email with tampered / incorrect password
    const probe6DReq = makeRequest("/api/auth/login", {
      body: { email: testSuccessorEmail, password: "CompletelyWrongPassword123!" },
      ip: "198.51.100.63",
    });
    const probe6DRes = await loginPOST(probe6DReq);
    assert.strictEqual(probe6DRes.status, 401, "Wrong password must be rejected with HTTP 401");

    recordPass(
      "Old Credentials Revocation & Adversarial Login Rejections",
      "All 4 unauthorized permutations (old email/old pass, new email/old pass, old email/new pass, bad pass) rejected with 401"
    );

    // -------------------------------------------------------------------------
    // TEST 7: Subsequent Login: Successor Logs In with New Credentials
    // -------------------------------------------------------------------------
    const successorLoginReq = makeRequest("/api/auth/login", {
      body: { email: testSuccessorEmail, password: testNewPassword },
      ip: "198.51.100.70",
    });
    const successorLoginRes = await loginPOST(successorLoginReq);
    assert.strictEqual(successorLoginRes.status, 200, "Successor subsequent login must return HTTP 200");
    const successorLoginData = await successorLoginRes.json();

    assert.strictEqual(successorLoginData.success, true);
    assert.strictEqual(successorLoginData.user.userId || successorLoginData.user.id, userId);
    assert.strictEqual(successorLoginData.user.email, testSuccessorEmail);
    assert.strictEqual(successorLoginData.user.name, "Ananya Soren, IAS");
    assert.strictEqual(successorLoginData.user.role, "GOV");
    assert.strictEqual(successorLoginData.redirectUrl, "/dashboard/gov");

    // Verify session cookie issued on login
    const loginCookie = extractSessionCookie(successorLoginRes);
    assert.ok(loginCookie, "Subsequent login must issue fresh sih_session cookie");

    // Validate login cookie with /api/auth/me
    const meReq2 = makeRequest("/api/auth/me", {
      sessionCookie: loginCookie,
      ip: "198.51.100.71",
    });
    const meRes2 = await meGET(meReq2);
    assert.strictEqual(meRes2.status, 200);
    const meData2 = await meRes2.json();
    assert.strictEqual(meData2.authenticated, true);
    assert.strictEqual(meData2.user.email, testSuccessorEmail);

    recordPass(
      "Subsequent Login: Successor Successfully Logs In & Authenticates",
      `Session established for ${testSuccessorEmail} with redirectUrl /dashboard/gov`
    );

    // -------------------------------------------------------------------------
    // TEST 8: 2FA Neutralization & Predecessor Secret Lockout Prevention
    // -------------------------------------------------------------------------
    // Check DB state: 2FA must be disabled and secret must be null
    const dbUserAfterClaim = await prisma.user.findUnique({
      where: { id: userId },
    });
    assert.ok(dbUserAfterClaim);
    assert.strictEqual(dbUserAfterClaim.twoFactorEnabled, false, "twoFactorEnabled must be false in DB");
    assert.strictEqual(dbUserAfterClaim.twoFactorSecret, null, "twoFactorSecret must be null in DB");

    // Attempt to submit predecessor's valid TOTP code to /api/auth/totp-verify
    const staleTotpCode = generateTOTP(predecessorOldSecret);
    const totpVerifyReq = makeRequest("/api/auth/totp-verify", {
      body: { code: staleTotpCode },
      sessionCookie: loginCookie,
      ip: "198.51.100.80",
    });
    const totpVerifyRes = await totpVerifyPOST(totpVerifyReq);
    assert.strictEqual(totpVerifyRes.status, 400, "Stale 2FA verification must return HTTP 400 (not configured)");
    const totpVerifyData = await totpVerifyRes.json();
    assert.strictEqual(
      totpVerifyData.error,
      "Two-factor authentication is not configured for this account.",
      "Must reject old 2FA code because 2FA secret is neutralized"
    );

    recordPass(
      "2FA Neutralization: Predecessor Secret Cleared & Old TOTP Code Blocked",
      "twoFactorSecret is null, old TOTP code rejected with HTTP 400 'not configured'"
    );

    // -------------------------------------------------------------------------
    // TEST 9: Fresh 2FA Setup by Successor
    // -------------------------------------------------------------------------
    // Successor calls /api/auth/totp-setup to initialize their own 2FA
    const totpSetupReq = makeRequest("/api/auth/totp-setup", {
      sessionCookie: loginCookie,
      ip: "198.51.100.90",
    });
    const totpSetupRes = await totpSetupPOST(totpSetupReq);
    assert.strictEqual(totpSetupRes.status, 200, "Successor must be able to configure fresh 2FA");
    const totpSetupData = await totpSetupRes.json();
    assert.ok(totpSetupData.secret, "New TOTP secret must be returned");
    assert.notStrictEqual(totpSetupData.secret, predecessorOldSecret, "New secret must differ from predecessor's secret");

    // Successor submits valid TOTP from the NEW secret
    const successorNewTotp = generateTOTP(totpSetupData.secret);
    const totpConfirmReq = makeRequest("/api/auth/totp-verify", {
      body: { code: successorNewTotp },
      sessionCookie: loginCookie,
      ip: "198.51.100.91",
    });
    const totpConfirmRes = await totpVerifyPOST(totpConfirmReq);
    assert.strictEqual(totpConfirmRes.status, 200, "Successor fresh 2FA verification must return HTTP 200");

    // Verify 2FA is now re-enabled with successor's secret
    const dbUserAfterTotp = await prisma.user.findUnique({ where: { id: userId } });
    assert.strictEqual(dbUserAfterTotp?.twoFactorEnabled, true, "2FA is now enabled for successor");
    assert.strictEqual(dbUserAfterTotp?.twoFactorSecret, totpSetupData.secret, "Successor secret is stored");

    // Predecessor's old TOTP code fails against newly configured 2FA
    assert.strictEqual(
      verifyTOTP(totpSetupData.secret, staleTotpCode),
      false,
      "Predecessor's old TOTP code must NOT be valid for successor's new secret"
    );

    recordPass(
      "Fresh 2FA Setup & Verification by Successor",
      "Successor configured new 2FA authenticator; predecessor's old code is completely invalid"
    );

    // -------------------------------------------------------------------------
    // TEST 10: Replay Attacks & Claim Immutability
    // -------------------------------------------------------------------------
    // Replay claim using the already used token
    const replayClaimReq = makeRequest(`/api/handover/${handoverTokenStr}/claim`, {
      body: {
        successorName: "Malicious Actor",
        password: "AttackerPassword@2026!",
        confirmPassword: "AttackerPassword@2026!",
      },
      ip: "198.51.100.100",
    });
    const replayClaimRes = await claimPOST(replayClaimReq, { params: { token: handoverTokenStr! } });
    assert.strictEqual(replayClaimRes.status, 409, "Replay claim must return HTTP 409 Conflict");
    const replayData = await replayClaimRes.json();
    assert.strictEqual(replayData.success, false);

    // Replay claim via root token route
    const rootTokenReq = makeRequest(`/api/handover/${handoverTokenStr}`, {
      body: { successorName: "Another Attacker", password: "AttackerPassword@2026!" },
      ip: "198.51.100.101",
    });
    const rootTokenRes = await tokenPOST(rootTokenReq, { params: { token: handoverTokenStr! } });
    assert.strictEqual(rootTokenRes.status, 409, "POST /api/handover/[token] on claimed token must return 409");

    // Query claimed token status via GET
    const tokenGetReq = makeRequest(`/api/handover/${handoverTokenStr}`, {
      ip: "198.51.100.102",
    });
    const tokenGetRes = await validateGET(tokenGetReq, { params: { token: handoverTokenStr! } });
    assert.strictEqual(tokenGetRes.status, 409, "GET /api/handover/[token] on claimed token must return 409");

    // Verify DB integrity: credentials remain unchanged by replay attempts
    const dbUserAfterReplay = await prisma.user.findUnique({ where: { id: userId } });
    assert.strictEqual(dbUserAfterReplay?.name, "Ananya Soren, IAS", "User name untouched by replay");
    assert.strictEqual(dbUserAfterReplay?.email, testSuccessorEmail, "User email untouched by replay");
    const isNewPassStillValid = await verifyPassword(testNewPassword, dbUserAfterReplay!.passwordHash);
    assert.strictEqual(isNewPassStillValid, true, "Successor passwordHash remains valid");

    recordPass(
      "Replay Attacks Rejected & User State Remains Immutable",
      "Both claim endpoints and GET validator return HTTP 409 Conflict; account credentials safe"
    );

    // -------------------------------------------------------------------------
    // TEST 11: Account Lockout & Security Defenses Preserved
    // -------------------------------------------------------------------------
    // Reset failed logins to 0 first to ensure clean state
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });

    const lockoutIp = `198.51.100.${timestamp % 150 + 10}`;
    // Send 4 bad attempts
    for (let i = 1; i <= 4; i++) {
      const badReq = makeRequest("/api/auth/login", {
        body: { email: testSuccessorEmail, password: `WrongGuess${i}!` },
        ip: `${lockoutIp}_${i}`,
      });
      const badRes = await loginPOST(badReq);
      assert.strictEqual(badRes.status, 401);
    }

    // 5th bad attempt must lock the account (HTTP 423)
    const lockReq = makeRequest("/api/auth/login", {
      body: { email: testSuccessorEmail, password: "WrongGuess5!" },
      ip: `${lockoutIp}_5`,
    });
    const lockRes = await loginPOST(lockReq);
    assert.strictEqual(lockRes.status, 423, "5th failed attempt must trigger HTTP 423 Locked");
    const lockData = await lockRes.json();
    assert.strictEqual(lockData.error, "Account Locked");

    // Even correct password is now blocked while locked
    const lockedAttemptReq = makeRequest("/api/auth/login", {
      body: { email: testSuccessorEmail, password: testNewPassword },
      ip: `${lockoutIp}_6`,
    });
    const lockedAttemptRes = await loginPOST(lockedAttemptReq);
    assert.strictEqual(lockedAttemptRes.status, 423, "Account lockout must block login even with correct password");

    // Reset lockout for test cleanup
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockoutUntil: null, status: "ACTIVE" },
    });

    recordPass(
      "Account Lockout Mechanism Preserved Post-Handover",
      "5 consecutive failed login attempts on successor account trigger HTTP 423 Locked"
    );

    // -------------------------------------------------------------------------
    // TEST 12: Cross-Role Continuity: University Official Handover
    // -------------------------------------------------------------------------
    const univTimestamp = Date.now() + 100;
    const univPredEmail = `prof_pred_${univTimestamp}@bitmesra.ac.in`;
    const univSuccEmail = `prof_succ_${univTimestamp}@bitmesra.ac.in`;
    const univPassword = "UniversityPass!2026";
    const univNewPass = "ProfSuccessorKey#2026!";

    const univHash = await hashPassword(univPassword);
    const univUser = await prisma.user.create({
      data: {
        email: univPredEmail,
        name: "Prof. Rajesh Verma",
        passwordHash: univHash,
        role: "UNIVERSITY",
        status: "ACTIVE",
        organization: "Birla Institute of Technology, Mesra",
        designation: "Dean of Research",
        district: "Ranchi",
        emailVerified: new Date(),
      },
    });

    // Create session and initiate handover
    const univSession = await signSessionToken({
      userId: univUser.id,
      email: univUser.email,
      name: univUser.name,
      role: "UNIVERSITY",
      status: "ACTIVE",
    });

    const univInitReq = makeRequest("/api/handover/initiate", {
      body: { successorEmail: univSuccEmail },
      sessionCookie: univSession,
      ip: "198.51.100.110",
    });
    const univInitRes = await initiatePOST(univInitReq);
    assert.strictEqual(univInitRes.status, 200);
    const univInitData = await univInitRes.json();

    // Claim university account
    const univClaimReq = makeRequest(`/api/handover/${univInitData.token}/claim`, {
      body: {
        successorName: "Prof. Priya Kumari",
        password: univNewPass,
        confirmPassword: univNewPass,
      },
      ip: "198.51.100.111",
    });
    const univClaimRes = await claimPOST(univClaimReq, { params: { token: univInitData.token } });
    assert.strictEqual(univClaimRes.status, 200);
    const univClaimData = await univClaimRes.json();
    assert.strictEqual(univClaimData.user.role, "UNIVERSITY");
    assert.strictEqual(univClaimData.redirectUrl, "/dashboard/university");

    // Successor login with university credentials
    const univLoginReq = makeRequest("/api/auth/login", {
      body: { email: univSuccEmail, password: univNewPass },
      ip: "198.51.100.112",
    });
    const univLoginRes = await loginPOST(univLoginReq);
    assert.strictEqual(univLoginRes.status, 200);
    const univLoginData = await univLoginRes.json();
    assert.strictEqual(univLoginData.user.userId || univLoginData.user.id, univUser.id);
    assert.strictEqual(univLoginData.user.role, "UNIVERSITY");
    assert.strictEqual(univLoginData.redirectUrl, "/dashboard/university");

    // Old university password rejected
    const univOldLoginReq = makeRequest("/api/auth/login", {
      body: { email: univSuccEmail, password: univPassword },
      ip: "198.51.100.113",
    });
    const univOldLoginRes = await loginPOST(univOldLoginReq);
    assert.strictEqual(univOldLoginRes.status, 401);

    // Cleanup university test user
    await prisma.handoverToken.deleteMany({ where: { userId: univUser.id } });
    await prisma.auditLog.deleteMany({ where: { userId: univUser.id } });
    await prisma.user.delete({ where: { id: univUser.id } });

    recordPass(
      "Cross-Role Handover: UNIVERSITY Role Preserved with Appropriate Dashboard",
      `Transferred BIT Mesra account to ${univSuccEmail}, redirectUrl /dashboard/university verified`
    );

    console.log("\n===============================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} ADVERSARIAL STRESS TESTS PASSED CLEANLY!`);
    console.log("===============================================================================\n");

  } catch (error) {
    console.error("\n❌ TEST FAILED WITH ERROR:\n", error);
    throw error;
  } finally {
    // Teardown fixtures
    if (challengeId) {
      await prisma.challenge.delete({ where: { id: challengeId } }).catch(() => {});
    }
    if (userId) {
      await prisma.handoverToken.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    console.log("🧹 Teardown completed: Test fixtures cleaned up from database.\n");
  }
}

runChallengerStressTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
