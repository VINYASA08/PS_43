/**
 * Adversarial Stress & Integrity Test Suite: Account Handover Portal (M1)
 * File: web/tests/adversarial_handover_test.ts
 *
 * Focus Areas:
 * 1. Replay Attacks (Sequential and Concurrent Race Conditions)
 * 2. Token Expiration & Boundary Conditions
 * 3. Input Fuzzing, Tampering, SQL Injection, XSS, and Malformed Payloads
 * 4. Relational Entity Preservation across 5+ dependent models
 * 5. Inactive / Soft-Deleted Predecessor Protection
 * 6. Email Collision Attacks During Claim
 *
 * Execution: npx tsx tests/adversarial_handover_test.ts
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
import { signSessionToken, hashPassword, verifyPassword } from "../src/lib/auth";
import { POST as initiatePOST, GET as initiateGET } from "../src/app/api/handover/initiate/route";
import { GET as validateGET } from "../src/app/api/handover/[token]/route";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";

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

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });
}

async function runAdversarialHandoverTests() {
  console.log("\n===============================================================================");
  console.log("🔥 STARTING ADVERSARIAL STRESS TEST SUITE: ACCOUNT HANDOVER PORTAL");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;
  const testResults: Array<{ name: string; passed: boolean; details?: string }> = [];

  function recordPass(testName: string) {
    totalTests++;
    passedTests++;
    testResults.push({ name: testName, passed: true });
    console.log(`✅ [PASS ${passedTests}] ${testName}`);
  }

  function recordFail(testName: string, reason: string) {
    totalTests++;
    testResults.push({ name: testName, passed: false, details: reason });
    console.log(`❌ [FAIL] ${testName} -> ${reason}`);
  }

  // Registry for cleanup
  const cleanupUserIds: string[] = [];
  const cleanupChallengeIds: string[] = [];
  const cleanupProposalIds: string[] = [];
  const cleanupTaskIds: string[] = [];
  const cleanupMessageIds: string[] = [];

  try {
    // ===========================================================================
    // SECTION 1: REPLAY ATTACKS & CONCURRENT RACE CONDITIONS
    // ===========================================================================
    console.log("\n--- [CATEGORY 1] REPLAY ATTACKS & CONCURRENT RACE CONDITIONS ---");

    // Create Predecessor A
    const predAPassword = "PredPassword@2026!";
    const predAHash = await hashPassword(predAPassword);
    const predA = await prisma.user.create({
      data: {
        email: `predecessor_a_${Date.now()}@jharkhand.gov.in`,
        name: "Officer A",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Rural Development Dept",
        designation: "Director",
        district: "Ranchi",
      },
    });
    cleanupUserIds.push(predA.id);

    const predASession = await signSessionToken({
      userId: predA.id,
      email: predA.email,
      name: predA.name,
      role: predA.role as any,
      status: predA.status as any,
    });

    // 1.1 Sequential Replay Attack
    const succAEmail = `successor_a_${Date.now()}@jharkhand.gov.in`;
    const initAReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: succAEmail },
      predASession
    );
    const initARes = await initiatePOST(initAReq);
    assert.equal(initARes.status, 200);
    const { token: tokenA } = await initARes.json();

    // First claim: Valid
    const claim1Req = makeJsonRequest(`http://localhost:3000/api/handover/${tokenA}/claim`, {
      successorName: "Legitimate Successor A",
      password: "ValidNewPass@123456",
      confirmPassword: "ValidNewPass@123456",
    });
    const claim1Res = await claimPOST(claim1Req, { params: Promise.resolve({ token: tokenA }) });
    assert.equal(claim1Res.status, 200, "First claim must succeed");

    // Second claim: Sequential replay attempt with different intruder name & password
    const replayReq = makeJsonRequest(`http://localhost:3000/api/handover/${tokenA}/claim`, {
      successorName: "Intruder User",
      password: "IntruderPass@123456",
      confirmPassword: "IntruderPass@123456",
    });
    const replayRes = await claimPOST(replayReq, { params: Promise.resolve({ token: tokenA }) });
    assert.equal(replayRes.status, 409, "Sequential replay must be rejected with HTTP 409 Conflict");
    const replayBody = await replayRes.json();
    assert.match(replayBody.error, /already been claimed/i, "Error must indicate token is already claimed");

    // Verify DB was NOT modified by intruder
    const checkUserA = await prisma.user.findUnique({ where: { id: predA.id } });
    assert.equal(checkUserA?.name, "Legitimate Successor A", "User name must NOT be overwritten by replay");
    const intruderPassValid = await verifyPassword("IntruderPass@123456", checkUserA!.passwordHash);
    assert.equal(intruderPassValid, false, "Intruder password must NOT be set in database");
    recordPass("1.1 Sequential Replay: Re-claiming used token rejected with 409 and state protected");

    // 1.2 Concurrent Race Condition Analysis (2 parallel claims)
    const predB2 = await prisma.user.create({
      data: {
        email: `predecessor_b2_${Date.now()}@jharkhand.gov.in`,
        name: "Officer B2",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Energy Dept",
        designation: "Special Secretary",
        district: "Dhanbad",
      },
    });
    cleanupUserIds.push(predB2.id);

    const predB2Session = await signSessionToken({
      userId: predB2.id,
      email: predB2.email,
      name: predB2.name,
      role: predB2.role as any,
      status: predB2.status as any,
    });

    const succB2Email = `successor_b2_${Date.now()}@jharkhand.gov.in`;
    const initB2Req = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: succB2Email },
      predB2Session
    );
    const initB2Res = await initiatePOST(initB2Req);
    assert.equal(initB2Res.status, 200);
    const { token: tokenB2 } = await initB2Res.json();

    console.log("   Testing 2 parallel concurrent claims (Promise.all)...");
    const racePromises2 = [0, 1].map((idx) => {
      const req = makeJsonRequest(`http://localhost:3000/api/handover/${tokenB2}/claim`, {
        successorName: `Racer 2-Way #${idx}`,
        password: `PasswordCandidate#${idx}!@`,
        confirmPassword: `PasswordCandidate#${idx}!@`,
      });
      return claimPOST(req, { params: Promise.resolve({ token: tokenB2 }) });
    });

    const raceResponses2 = await Promise.all(racePromises2);
    const raceStatuses2 = raceResponses2.map((r) => r.status);
    console.log(`   2-Way concurrent race responses: [${raceStatuses2.join(", ")}]`);

    const count200_2 = raceStatuses2.filter((s) => s === 200).length;
    const count409_2 = raceStatuses2.filter((s) => s === 409).length;
    const count500_2 = raceStatuses2.filter((s) => s === 500).length;

    if (count200_2 === 1 && count409_2 === 1) {
      recordPass("1.2 Concurrent Race Condition (2-way): Exactly 1 winner (200) and 1 lockout (409)");
    } else {
      recordFail(
        "1.2 Concurrent Race Condition (2-way)",
        `Expected 1x 200 and 1x 409, but got [${raceStatuses2.join(", ")}] (200: ${count200_2}, 409: ${count409_2}, 500: ${count500_2})`
      );
    }

    // 1.3 Concurrency Burst Stress (5 parallel claims)
    const predB5 = await prisma.user.create({
      data: {
        email: `predecessor_b5_${Date.now()}@jharkhand.gov.in`,
        name: "Officer B5",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Health Dept",
        designation: "Director",
      },
    });
    cleanupUserIds.push(predB5.id);

    const predB5Session = await signSessionToken({
      userId: predB5.id,
      email: predB5.email,
      name: predB5.name,
      role: predB5.role as any,
      status: predB5.status as any,
    });

    const succB5Email = `successor_b5_${Date.now()}@jharkhand.gov.in`;
    const initB5Req = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      { successorEmail: succB5Email },
      predB5Session
    );
    const initB5Res = await initiatePOST(initB5Req);
    assert.equal(initB5Res.status, 200);
    const { token: tokenB5 } = await initB5Res.json();

    console.log("   Testing 5 parallel concurrent claims (Promise.all)...");
    const racePromises5 = [0, 1, 2, 3, 4].map((idx) => {
      const req = makeJsonRequest(`http://localhost:3000/api/handover/${tokenB5}/claim`, {
        successorName: `Racer 5-Way #${idx}`,
        password: `PasswordCandidate#${idx}!@`,
        confirmPassword: `PasswordCandidate#${idx}!@`,
      });
      return claimPOST(req, { params: Promise.resolve({ token: tokenB5 }) });
    });

    const raceResponses5 = await Promise.all(racePromises5);
    const raceStatuses5 = raceResponses5.map((r) => r.status);
    console.log(`   5-Way concurrent race responses: [${raceStatuses5.join(", ")}]`);

    const count200_5 = raceStatuses5.filter((s) => s === 200).length;
    const count409_5 = raceStatuses5.filter((s) => s === 409).length;
    const count500_5 = raceStatuses5.filter((s) => s === 500).length;

    if (count200_5 === 1 && count409_5 === 4) {
      recordPass("1.3 Concurrency Burst (5-way): Exactly 1 winner (200) and 4 lockouts (409)");
    } else {
      recordFail(
        "1.3 Concurrency Burst (5-way)",
        `Expected 1x 200 and 4x 409, but got [${raceStatuses5.join(", ")}] (200: ${count200_5}, 409: ${count409_5}, 500: ${count500_5})`
      );
    }

    // ===========================================================================
    // SECTION 2: EXPIRED TOKENS & TIME BOUNDARIES
    // ===========================================================================
    console.log("\n--- [CATEGORY 2] EXPIRED TOKENS & TIME BOUNDARIES ---");

    const predC = await prisma.user.create({
      data: {
        email: `predecessor_c_${Date.now()}@jharkhand.gov.in`,
        name: "Officer C",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predC.id);

    // 2.1 Manually create token expired 1 hour ago
    const expiredTokenStr = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: expiredTokenStr,
        userId: predC.id,
        successorEmail: `successor_c_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour in past
      },
    });

    // Public GET validation of expired token
    const validateExpReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${expiredTokenStr}`,
      undefined,
      undefined,
      "GET"
    );
    const validateExpRes = await validateGET(validateExpReq, {
      params: Promise.resolve({ token: expiredTokenStr }),
    });
    assert.equal(validateExpRes.status, 410, "GET /api/handover/[token] for expired token must return HTTP 410 Gone");
    const validateExpBody = await validateExpRes.json();
    assert.equal(validateExpBody.valid, false);
    assert.match(validateExpBody.error, /expired/i);
    recordPass("2.1 Expiration Check: GET /api/handover/[token] returns HTTP 410 Gone for expired token");

    // 2.2 Attempt to claim expired token
    const claimExpReq = makeJsonRequest(`http://localhost:3000/api/handover/${expiredTokenStr}/claim`, {
      successorName: "Expired Claimer",
      password: "ExpiredPassword@123",
      confirmPassword: "ExpiredPassword@123",
    });
    const claimExpRes = await claimPOST(claimExpReq, {
      params: Promise.resolve({ token: expiredTokenStr }),
    });
    assert.equal(claimExpRes.status, 410, "POST claim on expired token must return HTTP 410 Gone");
    const claimExpBody = await claimExpRes.json();
    assert.equal(claimExpBody.success, false);
    assert.match(claimExpBody.error, /expired/i);

    // Verify token was NOT marked used
    const expiredTokenCheck = await prisma.handoverToken.findUnique({ where: { token: expiredTokenStr } });
    assert.equal(expiredTokenCheck?.usedAt, null, "Expired token must remain usedAt = null");

    // Verify user account was untouched
    const predCCheck = await prisma.user.findUnique({ where: { id: predC.id } });
    assert.equal(predCCheck?.name, "Officer C", "Predecessor account must NOT be changed by expired claim");
    recordPass("2.2 Expiration Enforcement: POST /api/handover/[token]/claim rejects expired token with HTTP 410");

    // 2.3 Boundary: Token expiring 100ms in the past
    const boundaryTokenStr = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: boundaryTokenStr,
        userId: predC.id,
        successorEmail: `boundary_succ_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() - 100), // 100ms in past
      },
    });
    const boundaryClaimReq = makeJsonRequest(`http://localhost:3000/api/handover/${boundaryTokenStr}/claim`, {
      successorName: "Boundary Claimer",
      password: "BoundaryPassword@123",
    });
    const boundaryRes = await claimPOST(boundaryClaimReq, {
      params: Promise.resolve({ token: boundaryTokenStr }),
    });
    assert.equal(boundaryRes.status, 410, "Token with expiresAt in past (even 100ms) must return 410");
    recordPass("2.3 Boundary Precision: Sub-second expired token strictly rejected with 410");

    // 2.4 GET /api/handover/initiate ignores expired tokens
    const predCSession = await signSessionToken({
      userId: predC.id,
      email: predC.email,
      name: predC.name,
      role: predC.role as any,
      status: predC.status as any,
    });
    const getInitExpiredReq = makeJsonRequest(
      "http://localhost:3000/api/handover/initiate",
      undefined,
      predCSession,
      "GET"
    );
    const getInitExpiredRes = await initiateGET(getInitExpiredReq);
    assert.equal(getInitExpiredRes.status, 200);
    const getInitExpiredBody = await getInitExpiredRes.json();
    assert.equal(
      getInitExpiredBody.hasPendingHandover,
      false,
      "User with only expired tokens must report hasPendingHandover: false"
    );
    recordPass("2.4 Query Filter: GET /api/handover/initiate correctly filters out expired invitations");

    // ===========================================================================
    // SECTION 3: TAMPERING, FUZZING, SQL INJECTION, XSS, MALFORMED PAYLOADS
    // ===========================================================================
    console.log("\n--- [CATEGORY 3] TAMPERING, FUZZING, SQL INJECTION & MALFORMED PAYLOADS ---");

    // 3.1 Non-existent 64-char hex token
    const nonExistentToken = "0".repeat(64);
    const neValidateReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${nonExistentToken}`,
      undefined,
      undefined,
      "GET"
    );
    const neValidateRes = await validateGET(neValidateReq, {
      params: Promise.resolve({ token: nonExistentToken }),
    });
    assert.equal(neValidateRes.status, 404, "Non-existent token must return HTTP 404");

    const neClaimReq = makeJsonRequest(`http://localhost:3000/api/handover/${nonExistentToken}/claim`, {
      successorName: "Phantom User",
      password: "PhantomPassword@123",
    });
    const neClaimRes = await claimPOST(neClaimReq, {
      params: Promise.resolve({ token: nonExistentToken }),
    });
    assert.equal(neClaimRes.status, 404, "Claiming non-existent token must return HTTP 404");
    recordPass("3.1 Non-Existent Token: Returns clean 404 on both validate and claim");

    // 3.2 SQL Injection & XSS Payloads in Token Route Parameter
    const maliciousTokens = [
      "' OR '1'='1",
      "'; DROP TABLE HandoverToken; --",
      "admin'--",
      "UNION SELECT * FROM User--",
      "<script>alert('xss')</script>",
      "../../../../etc/passwd",
      "%00",
      "\\0",
      "!@#$%^&*()_+{}[]:;\"'<>?,./",
      "a".repeat(4096), // 4KB string
    ];

    for (const badToken of maliciousTokens) {
      const fuzzValReq = makeJsonRequest(
        `http://localhost:3000/api/handover/${encodeURIComponent(badToken)}`,
        undefined,
        undefined,
        "GET"
      );
      const fuzzValRes = await validateGET(fuzzValReq, {
        params: Promise.resolve({ token: badToken }),
      });
      assert.ok(
        fuzzValRes.status === 404 || fuzzValRes.status === 400,
        `Malicious token '${badToken.substring(0, 20)}...' must return 404/400 (got ${fuzzValRes.status})`
      );

      const fuzzClaimReq = makeJsonRequest(
        `http://localhost:3000/api/handover/${encodeURIComponent(badToken)}/claim`,
        { successorName: "Hacker", password: "Password@123" }
      );
      const fuzzClaimRes = await claimPOST(fuzzClaimReq, {
        params: Promise.resolve({ token: badToken }),
      });
      assert.ok(
        fuzzClaimRes.status === 404 || fuzzClaimRes.status === 400,
        `Malicious token '${badToken.substring(0, 20)}...' on claim must return 404/400 (got ${fuzzClaimRes.status})`
      );
    }
    recordPass(`3.2 Injection & Path Traversal Fuzzing: ${maliciousTokens.length} attack vectors safely returned 404/400 with 0 crashes`);

    // 3.3 Body Payload Fuzzing on Claim Route
    const predD = await prisma.user.create({
      data: {
        email: `predecessor_d_${Date.now()}@jharkhand.gov.in`,
        name: "Officer D",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predD.id);

    const validTokenD = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: validTokenD,
        userId: predD.id,
        successorEmail: `successor_d_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    const malformedBodies = [
      { body: null, label: "Null body" },
      { body: {}, label: "Empty object" },
      { body: { successorName: "   ", password: "ValidPassword123" }, label: "Whitespace name" },
      { body: { successorName: "X", password: "ValidPassword123" }, label: "1-char name" },
      { body: { successorName: "Valid Name", password: "short" }, label: "Short password (<8 chars)" },
      {
        body: { successorName: "Valid Name", password: "Password@123", confirmPassword: "DifferentPassword@123" },
        label: "Mismatched confirmPassword",
      },
      {
        body: { successorName: 12345, password: "Password@123" },
        label: "Number for successorName",
      },
      {
        body: "NOT_JSON_RAW_STRING",
        label: "Non-JSON raw string",
      },
    ];

    for (const testCase of malformedBodies) {
      const badBodyReq = makeJsonRequest(
        `http://localhost:3000/api/handover/${validTokenD}/claim`,
        testCase.body
      );
      const badBodyRes = await claimPOST(badBodyReq, {
        params: Promise.resolve({ token: validTokenD }),
      });
      assert.equal(
        badBodyRes.status,
        400,
        `Claim endpoint must reject '${testCase.label}' with HTTP 400 Bad Request (got ${badBodyRes.status})`
      );
    }
    recordPass(`3.3 Payload Fuzzing: ${malformedBodies.length} malformed request bodies strictly rejected with HTTP 400`);

    // ===========================================================================
    // SECTION 4: RELATIONAL ENTITY PRESERVATION ACROSS 5+ MODELS
    // ===========================================================================
    console.log("\n--- [CATEGORY 4] RELATIONAL ENTITY PRESERVATION ACROSS 5+ MODELS ---");

    const predEPassword = "InitialPredecessorSecret!@#2026";
    const predEHash = await hashPassword(predEPassword);
    const predE = await prisma.user.create({
      data: {
        email: `predecessor_e_${Date.now()}@jharkhand.gov.in`,
        name: "Dr. Arvind Prasad, IAS",
        passwordHash: predEHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Department of Forest, Environment & Climate Change",
        designation: "Special Chief Secretary",
        district: "Ranchi",
        bio: "Overseeing state-wide environmental conservation.",
        twoFactorEnabled: true,
        twoFactorSecret: "SECRET2FAARVINDPRASAD",
        failedLoginAttempts: 3,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // Locked out!
      },
    });
    cleanupUserIds.push(predE.id);

    // 1. Create Challenge reportedBy predE
    const chal1 = await prisma.challenge.create({
      data: {
        publicTrackingId: `CHAL-CONSERVATION-${Date.now()}-1`,
        title: "Saranda Forest Sal Tree Preservation",
        description: "Botanical survey and community protection plan.",
        domain: "Forestry & Environment",
        district: "West Singhbhum",
        location: "Gua Block",
        urgency: "CRITICAL",
        reportedById: predE.id,
        nodalStatus: "routed_to_academia",
        nodalOfficerId: predE.id, // Also linked as Nodal Officer!
      },
    });
    cleanupChallengeIds.push(chal1.id);

    // 2. Create Proposal submittedBy predE
    const prop1 = await prisma.proposal.create({
      data: {
        proposalRef: `PR-ENV-${Date.now()}`,
        challengeId: chal1.id,
        submittedById: predE.id,
        universityName: "Birsa Agricultural University",
        title: "Biodiversity Remote Sensing Drone Survey",
        abstract: "AI-based canopy monitoring using multispectral sensors.",
        methodology: "Quarterly aerial sweeps with ground truth botanical sensors.",
        budget: 4500000.0,
      },
    });
    cleanupProposalIds.push(prop1.id);

    // 3. Create ChatMessage sent by predE
    const msg1 = await prisma.chatMessage.create({
      data: {
        senderId: predE.id,
        proposalId: prop1.id,
        content: "Draft DPR has been reviewed and cleared by nodal department.",
      },
    });
    cleanupMessageIds.push(msg1.id);

    // 4. Create MicroTask created by predE
    const task1 = await prisma.microTask.create({
      data: {
        title: "Soil Chemistry Sampling",
        description: "Collect 50 core soil samples from core zone.",
        skills: "Soil Science, GPS Mapping",
        challengeId: chal1.id,
        createdById: predE.id,
      },
    });
    cleanupTaskIds.push(task1.id);

    // 5. Create prior AuditLog by predE
    await prisma.auditLog.create({
      data: {
        userId: predE.id,
        action: "CHALLENGE_CREATED",
        resource: "Challenge",
        resourceId: chal1.id,
        oldState: "{}",
        newState: JSON.stringify({ title: chal1.title }),
      },
    });

    // Verify initial counts linked to predE.id
    const preCountChallenges = await prisma.challenge.count({ where: { reportedById: predE.id } });
    const preCountProposals = await prisma.proposal.count({ where: { submittedById: predE.id } });
    const preCountMessages = await prisma.chatMessage.count({ where: { senderId: predE.id } });
    const preCountTasks = await prisma.microTask.count({ where: { createdById: predE.id } });
    const preCountAuditLogs = await prisma.auditLog.count({ where: { userId: predE.id } });

    assert.equal(preCountChallenges, 1);
    assert.equal(preCountProposals, 1);
    assert.equal(preCountMessages, 1);
    assert.equal(preCountTasks, 1);
    assert.equal(preCountAuditLogs, 1);

    // Now execute Handover from predE to successorE
    const succEEmail = `successor_e_${Date.now()}@jharkhand.gov.in`;
    const tokenE = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: tokenE,
        userId: predE.id,
        successorEmail: succEEmail,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const succENewPass = "SuccessorSecurePassword@2026!";
    const claimEReq = makeJsonRequest(`http://localhost:3000/api/handover/${tokenE}/claim`, {
      successorName: "Smt. Sunita Murmu, IAS",
      password: succENewPass,
      confirmPassword: succENewPass,
    });
    const claimERes = await claimPOST(claimEReq, {
      params: Promise.resolve({ token: tokenE }),
    });
    assert.equal(claimERes.status, 200, "Claim must succeed for multi-entity predecessor");
    const claimEData = await claimERes.json();
    assert.equal(claimEData.user.id, predE.id, "User ID MUST remain identical");
    assert.equal(claimEData.user.name, "Smt. Sunita Murmu, IAS");
    assert.equal(claimEData.user.email, succEEmail);

    // POST-CLAIM INTEGRITY CHECKS:
    // 1. Check all entities still connect to predE.id
    const postCountChallenges = await prisma.challenge.count({ where: { reportedById: predE.id } });
    const postCountProposals = await prisma.proposal.count({ where: { submittedById: predE.id } });
    const postCountMessages = await prisma.chatMessage.count({ where: { senderId: predE.id } });
    const postCountTasks = await prisma.microTask.count({ where: { createdById: predE.id } });
    const postCountAuditLogs = await prisma.auditLog.count({ where: { userId: predE.id } });

    assert.equal(postCountChallenges, 1, "Challenge link must be preserved 100%");
    assert.equal(postCountProposals, 1, "Proposal link must be preserved 100%");
    assert.equal(postCountMessages, 1, "ChatMessage link must be preserved 100%");
    assert.equal(postCountTasks, 1, "MicroTask link must be preserved 100%");
    assert.equal(postCountAuditLogs, 2, "Historical AuditLog preserved AND new HANDOVER_CLAIMED logged");

    // 2. Check nodalOfficer link preserved
    const chalCheck = await prisma.challenge.findUnique({ where: { id: chal1.id } });
    assert.equal(chalCheck?.nodalOfficerId, predE.id, "Nodal officer ID link preserved");

    // 3. Check User credentials & security resets
    const updatedUserE = await prisma.user.findUnique({ where: { id: predE.id } });
    assert.ok(updatedUserE);
    assert.equal(updatedUserE.twoFactorEnabled, false, "2FA must be reset to avoid successor lockout");
    assert.equal(updatedUserE.twoFactorSecret, null, "2FA secret must be cleared");
    assert.equal(updatedUserE.failedLoginAttempts, 0, "Failed login counter reset");
    assert.equal(updatedUserE.lockoutUntil, null, "Lockout cleared");
    assert.equal(updatedUserE.organization, "Department of Forest, Environment & Climate Change");
    assert.equal(updatedUserE.designation, "Special Chief Secretary");
    assert.equal(updatedUserE.district, "Ranchi");
    assert.equal(updatedUserE.bio, "Overseeing state-wide environmental conservation.");

    // 4. Verify password verification works for successor and rejects predecessor
    const isNewPassValid = await verifyPassword(succENewPass, updatedUserE.passwordHash);
    assert.equal(isNewPassValid, true, "Successor new password must verify");
    const isOldPassValid = await verifyPassword(predEPassword, updatedUserE.passwordHash);
    assert.equal(isOldPassValid, false, "Predecessor old password must fail");

    recordPass("4.1 Relational Entity Preservation: User.id preserved across Challenge, Proposal, ChatMessage, MicroTask, AuditLog");
    recordPass("4.2 Credential & Security Overwrite: Password updated, 2FA/lockout reset, profile fields retained");

    // ===========================================================================
    // SECTION 5: INACTIVE / SOFT-DELETED PREDECESSOR & EMAIL COLLISION DEFENSE
    // ===========================================================================
    console.log("\n--- [CATEGORY 5] INACTIVE PREDECESSOR & EMAIL COLLISION DEFENSE ---");

    // 5.1 Soft-deleted predecessor
    const predF = await prisma.user.create({
      data: {
        email: `predecessor_f_${Date.now()}@jharkhand.gov.in`,
        name: "Officer F",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predF.id);

    const tokenF = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: tokenF,
        userId: predF.id,
        successorEmail: `successor_f_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    // Now soft delete predF
    await prisma.user.update({
      where: { id: predF.id },
      data: { deletedAt: new Date() },
    });

    // Validation must return 404 (account inactive)
    const valFReq = makeJsonRequest(
      `http://localhost:3000/api/handover/${tokenF}`,
      undefined,
      undefined,
      "GET"
    );
    const valFRes = await validateGET(valFReq, { params: Promise.resolve({ token: tokenF }) });
    assert.equal(valFRes.status, 404, "Validation of token for soft-deleted predecessor must return 404");

    // Claim must return 403 (predecessor inactive)
    const claimFReq = makeJsonRequest(`http://localhost:3000/api/handover/${tokenF}/claim`, {
      successorName: "Successor F",
      password: "Password@12345",
    });
    const claimFRes = await claimPOST(claimFReq, { params: Promise.resolve({ token: tokenF }) });
    assert.equal(claimFRes.status, 403, "Claim for soft-deleted predecessor must return HTTP 403 Forbidden");
    recordPass("5.1 Inactive Predecessor: Soft-deleted user token blocked on validate (404) and claim (403)");

    // 5.2 Email Collision Attack During Claim
    const predG = await prisma.user.create({
      data: {
        email: `predecessor_g_${Date.now()}@jharkhand.gov.in`,
        name: "Officer G",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predG.id);

    const succGEmail = `successor_g_colliding_${Date.now()}@jharkhand.gov.in`;
    const tokenG = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: tokenG,
        userId: predG.id,
        successorEmail: succGEmail,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    // Another user registers with the successor email before claim is executed!
    const thirdPartyUser = await prisma.user.create({
      data: {
        email: succGEmail,
        name: "Third Party Registered User",
        passwordHash: predAHash,
        role: "CITIZEN",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(thirdPartyUser.id);

    // Attempt claim: must detect email collision and return HTTP 400 without crashing
    const claimGReq = makeJsonRequest(`http://localhost:3000/api/handover/${tokenG}/claim`, {
      successorName: "Successor G",
      password: "Password@12345",
    });
    const claimGRes = await claimPOST(claimGReq, { params: Promise.resolve({ token: tokenG }) });
    assert.equal(claimGRes.status, 400, "Email collision must return HTTP 400 Bad Request");
    const claimGBody = await claimGRes.json();
    assert.match(claimGBody.error, /already exists/i, "Error message must cite existing account");

    // Verify token was NOT claimed
    const tokenGRecord = await prisma.handoverToken.findUnique({ where: { token: tokenG } });
    assert.equal(tokenGRecord?.usedAt, null, "Collided token must remain unused");
    recordPass("5.2 Email Collision Defense: Conflicting successor email caught gracefully with HTTP 400 (no P2002 crash)");

    // ===========================================================================
    // SUMMARY
    // ===========================================================================
    console.log("\n===============================================================================");
    console.log(`📊 ADVERSARIAL TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("===============================================================================");
    for (const r of testResults) {
      console.log(`  ${r.passed ? "✅ PASS" : "❌ FAIL"}: ${r.name} ${r.details ? `(${r.details})` : ""}`);
    }
    console.log("===============================================================================\n");

  } finally {
    console.log("🧹 Tearing down adversarial test fixtures...");
    for (const msgId of cleanupMessageIds) {
      await prisma.chatMessage.delete({ where: { id: msgId } }).catch(() => {});
    }
    for (const taskId of cleanupTaskIds) {
      await prisma.microTask.delete({ where: { id: taskId } }).catch(() => {});
    }
    for (const propId of cleanupProposalIds) {
      await prisma.proposal.delete({ where: { id: propId } }).catch(() => {});
    }
    for (const chalId of cleanupChallengeIds) {
      await prisma.challenge.delete({ where: { id: chalId } }).catch(() => {});
    }
    for (const uId of cleanupUserIds) {
      await prisma.handoverToken.deleteMany({ where: { userId: uId } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: uId } }).catch(() => {});
      await prisma.user.delete({ where: { id: uId } }).catch(() => {});
    }
    console.log("✅ Teardown complete.");
    await prisma.$disconnect();
  }
}

runAdversarialHandoverTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ ADVERSARIAL TEST SUITE FAILED:", err);
    process.exit(1);
  });
