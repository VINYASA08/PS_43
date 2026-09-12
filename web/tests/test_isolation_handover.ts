/**
 * Verification Script: Categories 1.1 (Sequential Replay), 2 (Expiration),
 * 3 (Fuzzing/Tampering), 4 (Entity Preservation), 5 (Boundaries/Collisions)
 *
 * File: web/tests/test_isolation_handover.ts
 * Execution: npx tsx tests/test_isolation_handover.ts
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
import { GET as validateGET, POST as tokenPOST } from "../src/app/api/handover/[token]/route";
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

async function runIsolationTests() {
  console.log("\n===============================================================================");
  console.log("🔍 ADVERSARIAL INTEGRITY VERIFICATION (CATEGORIES 1.1, 2, 3, 4, 5)");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(testName: string) {
    totalTests++;
    passedTests++;
    console.log(`✅ [PASS ${passedTests}] ${testName}`);
  }

  const cleanupUserIds: string[] = [];
  const cleanupChallengeIds: string[] = [];
  const cleanupProposalIds: string[] = [];
  const cleanupTaskIds: string[] = [];
  const cleanupMessageIds: string[] = [];

  try {
    // ---------------------------------------------------------------------------
    // TEST 1: SEQUENTIAL REPLAY ATTACK DEFENSE
    // ---------------------------------------------------------------------------
    const predAPassword = "PredPassword@2026!";
    const predAHash = await hashPassword(predAPassword);
    const predA = await prisma.user.create({
      data: {
        email: `pred_iso_a_${Date.now()}@jharkhand.gov.in`,
        name: "Officer Iso A",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
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

    const succAEmail = `succ_iso_a_${Date.now()}@jharkhand.gov.in`;
    const initARes = await initiatePOST(
      makeJsonRequest("http://localhost:3000/api/handover/initiate", { successorEmail: succAEmail }, predASession)
    );
    assert.equal(initARes.status, 200);
    const { token: tokenA } = await initARes.json();

    // First claim: Valid -> 200
    const claim1Res = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenA}/claim`, {
        successorName: "Legit Successor",
        password: "ValidPassword@2026",
        confirmPassword: "ValidPassword@2026",
      }),
      { params: Promise.resolve({ token: tokenA }) }
    );
    assert.equal(claim1Res.status, 200, "Initial valid claim must succeed with 200");

    // Second claim: Sequential replay attempt -> 409 Conflict
    const claim2Res = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenA}/claim`, {
        successorName: "Intruder",
        password: "IntruderPassword@2026",
      }),
      { params: Promise.resolve({ token: tokenA }) }
    );
    assert.equal(claim2Res.status, 409, "Sequential replay of claimed token must return 409 Conflict");
    const claim2Body = await claim2Res.json();
    assert.match(claim2Body.error, /already been claimed/i);

    // Third claim via alternative route /api/handover/[token] -> 409 Conflict
    const claim3Res = await tokenPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenA}`, {
        successorName: "Intruder 2",
        password: "IntruderPassword@2026",
      }),
      { params: Promise.resolve({ token: tokenA }) }
    );
    assert.equal(claim3Res.status, 409, "Direct POST replay must also return 409 Conflict");

    recordPass("1. Sequential Replay Attack: Strictly blocked with HTTP 409 across both endpoints");

    // ---------------------------------------------------------------------------
    // TEST 2: EXPIRED TOKENS & TIME BOUNDARIES
    // ---------------------------------------------------------------------------
    const predC = await prisma.user.create({
      data: {
        email: `pred_iso_c_${Date.now()}@jharkhand.gov.in`,
        name: "Officer Iso C",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predC.id);

    // Expired token (1 hour past)
    const expToken = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: expToken,
        userId: predC.id,
        successorEmail: `succ_exp_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() - 3600 * 1000),
      },
    });

    // Public GET validation of expired token -> 410 Gone
    const valExpRes = await validateGET(
      makeJsonRequest(`http://localhost:3000/api/handover/${expToken}`, undefined, undefined, "GET"),
      { params: Promise.resolve({ token: expToken }) }
    );
    assert.equal(valExpRes.status, 410, "GET /api/handover/[token] for expired token must return HTTP 410");

    // POST claim on expired token -> 410 Gone
    const claimExpRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${expToken}/claim`, {
        successorName: "Expired Claimer",
        password: "Password@12345",
      }),
      { params: Promise.resolve({ token: expToken }) }
    );
    assert.equal(claimExpRes.status, 410, "POST claim on expired token must return HTTP 410");

    // Boundary check (100ms in past) -> 410 Gone
    const boundaryToken = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: boundaryToken,
        userId: predC.id,
        successorEmail: `succ_boundary_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() - 100),
      },
    });
    const claimBoundaryRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${boundaryToken}/claim`, {
        successorName: "Boundary Claimer",
        password: "Password@12345",
      }),
      { params: Promise.resolve({ token: boundaryToken }) }
    );
    assert.equal(claimBoundaryRes.status, 410, "Boundary expired token (100ms past) must return HTTP 410");

    recordPass("2. Expired Tokens & Time Boundaries: HTTP 410 Gone enforced on validation and claim");

    // ---------------------------------------------------------------------------
    // TEST 3: TAMPERING, FUZZING, SQL INJECTION, XSS, MALFORMED PAYLOADS
    // ---------------------------------------------------------------------------
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
      "0".repeat(64),
      "a".repeat(4096),
    ];

    for (const badToken of maliciousTokens) {
      const getRes = await validateGET(
        makeJsonRequest(`http://localhost:3000/api/handover/${encodeURIComponent(badToken)}`, undefined, undefined, "GET"),
        { params: Promise.resolve({ token: badToken }) }
      );
      assert.ok(getRes.status === 404 || getRes.status === 400, `Token ${badToken.slice(0, 15)} must return 400/404`);

      const postRes = await claimPOST(
        makeJsonRequest(`http://localhost:3000/api/handover/${encodeURIComponent(badToken)}/claim`, {
          successorName: "Hacker",
          password: "Password@123",
        }),
        { params: Promise.resolve({ token: badToken }) }
      );
      assert.ok(postRes.status === 404 || postRes.status === 400, `Claim ${badToken.slice(0, 15)} must return 400/404`);
    }

    recordPass("3. Input Fuzzing & Injection Defense: 11 attack payloads rejected safely with 404/400 (0 crashes)");

    // ---------------------------------------------------------------------------
    // TEST 4: RELATIONAL ENTITY PRESERVATION ACROSS 5+ MODELS
    // ---------------------------------------------------------------------------
    const predEPassword = "InitialPredecessorSecret!@#2026";
    const predEHash = await hashPassword(predEPassword);
    const predE = await prisma.user.create({
      data: {
        email: `pred_iso_e_${Date.now()}@jharkhand.gov.in`,
        name: "Dr. Arvind Prasad, IAS",
        passwordHash: predEHash,
        role: "GOV",
        status: "ACTIVE",
        organization: "Department of Forest, Environment & Climate Change",
        designation: "Special Chief Secretary",
        district: "Ranchi",
        bio: "Environmental leadership in Jharkhand.",
        twoFactorEnabled: true,
        twoFactorSecret: "SECRET2FAARVINDPRASAD",
        failedLoginAttempts: 4,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    cleanupUserIds.push(predE.id);

    // Create 5 relational entities
    const chal = await prisma.challenge.create({
      data: {
        publicTrackingId: `CHAL-ISO-${Date.now()}`,
        title: "Sal Tree Conservation",
        description: "Botanical survey.",
        domain: "Forestry",
        district: "West Singhbhum",
        location: "Gua",
        urgency: "CRITICAL",
        reportedById: predE.id,
        nodalOfficerId: predE.id,
      },
    });
    cleanupChallengeIds.push(chal.id);

    const prop = await prisma.proposal.create({
      data: {
        proposalRef: `PR-ISO-${Date.now()}`,
        challengeId: chal.id,
        submittedById: predE.id,
        universityName: "Birsa Agricultural University",
        title: "Drone Survey",
        abstract: "AI-based canopy monitoring.",
        methodology: "Multispectral sensors.",
        budget: 4500000.0,
      },
    });
    cleanupProposalIds.push(prop.id);

    const msg = await prisma.chatMessage.create({
      data: {
        senderId: predE.id,
        proposalId: prop.id,
        content: "DPR approved.",
      },
    });
    cleanupMessageIds.push(msg.id);

    const task = await prisma.microTask.create({
      data: {
        title: "Soil Core Sampling",
        description: "Core samples from zone A.",
        skills: "Soil Science",
        challengeId: chal.id,
        createdById: predE.id,
      },
    });
    cleanupTaskIds.push(task.id);

    await prisma.auditLog.create({
      data: {
        userId: predE.id,
        action: "CHALLENGE_CREATED",
        resource: "Challenge",
        resourceId: chal.id,
      },
    });

    // Initiate and claim
    const tokenE = crypto.randomBytes(32).toString("hex");
    const succEEmail = `succ_iso_e_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: tokenE,
        userId: predE.id,
        successorEmail: succEEmail,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const succNewPassword = "SuccessorBrandNewPassword@2026!";
    const claimERes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenE}/claim`, {
        successorName: "Smt. Sunita Murmu, IAS",
        password: succNewPassword,
        confirmPassword: succNewPassword,
      }),
      { params: Promise.resolve({ token: tokenE }) }
    );
    assert.equal(claimERes.status, 200, "Claim must return HTTP 200");
    const claimEData = await claimERes.json();
    assert.equal(claimEData.user.id, predE.id, "User ID MUST remain identical to preserve relationships");

    // Relational checks
    const chalAfter = await prisma.challenge.findUnique({ where: { id: chal.id } });
    assert.equal(chalAfter?.reportedById, predE.id, "Challenge reportedById preserved");
    assert.equal(chalAfter?.nodalOfficerId, predE.id, "Challenge nodalOfficerId preserved");

    const propAfter = await prisma.proposal.findUnique({ where: { id: prop.id } });
    assert.equal(propAfter?.submittedById, predE.id, "Proposal submittedById preserved");

    const msgAfter = await prisma.chatMessage.findUnique({ where: { id: msg.id } });
    assert.equal(msgAfter?.senderId, predE.id, "ChatMessage senderId preserved");

    const taskAfter = await prisma.microTask.findUnique({ where: { id: task.id } });
    assert.equal(taskAfter?.createdById, predE.id, "MicroTask createdById preserved");

    const userAfter = await prisma.user.findUnique({ where: { id: predE.id } });
    assert.equal(userAfter?.name, "Smt. Sunita Murmu, IAS");
    assert.equal(userAfter?.email, succEEmail);
    assert.equal(userAfter?.twoFactorEnabled, false, "2FA reset to prevent successor lockout");
    assert.equal(userAfter?.twoFactorSecret, null);
    assert.equal(userAfter?.failedLoginAttempts, 0);
    assert.equal(userAfter?.lockoutUntil, null);

    const isNewPassValid = await verifyPassword(succNewPassword, userAfter!.passwordHash);
    assert.equal(isNewPassValid, true, "Successor password authenticates");
    const isOldPassValid = await verifyPassword(predEPassword, userAfter!.passwordHash);
    assert.equal(isOldPassValid, false, "Predecessor password rejected");

    recordPass("4. Relational Entity Preservation: User.id preserved across 5 models; 2FA/lockout reset; credentials updated");

    // ---------------------------------------------------------------------------
    // TEST 5: INACTIVE PREDECESSOR & EMAIL COLLISION ATTACKS
    // ---------------------------------------------------------------------------
    // 5.1 Soft-deleted predecessor
    const predF = await prisma.user.create({
      data: {
        email: `pred_iso_f_${Date.now()}@jharkhand.gov.in`,
        name: "Officer Iso F",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
        deletedAt: new Date(),
      },
    });
    cleanupUserIds.push(predF.id);

    const tokenF = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: tokenF,
        userId: predF.id,
        successorEmail: `succ_iso_f_${Date.now()}@jharkhand.gov.in`,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    const valFRes = await validateGET(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenF}`, undefined, undefined, "GET"),
      { params: Promise.resolve({ token: tokenF }) }
    );
    assert.equal(valFRes.status, 404, "Validate for soft-deleted user must return 404");

    const claimFRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenF}/claim`, {
        successorName: "Successor F",
        password: "Password@12345",
      }),
      { params: Promise.resolve({ token: tokenF }) }
    );
    assert.equal(claimFRes.status, 403, "Claim for soft-deleted user must return HTTP 403");

    // 5.2 Email collision attack
    const predG = await prisma.user.create({
      data: {
        email: `pred_iso_g_${Date.now()}@jharkhand.gov.in`,
        name: "Officer Iso G",
        passwordHash: predAHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(predG.id);

    const succGEmail = `succ_colliding_${Date.now()}@jharkhand.gov.in`;
    const tokenG = crypto.randomBytes(32).toString("hex");
    await prisma.handoverToken.create({
      data: {
        token: tokenG,
        userId: predG.id,
        successorEmail: succGEmail,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    // Conflicting account created
    const collisionUser = await prisma.user.create({
      data: {
        email: succGEmail,
        name: "Conflicting Citizen",
        passwordHash: predAHash,
        role: "CITIZEN",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(collisionUser.id);

    const claimGRes = await claimPOST(
      makeJsonRequest(`http://localhost:3000/api/handover/${tokenG}/claim`, {
        successorName: "Successor G",
        password: "Password@12345",
      }),
      { params: Promise.resolve({ token: tokenG }) }
    );
    assert.equal(claimGRes.status, 400, "Email collision must return HTTP 400");
    const claimGBody = await claimGRes.json();
    assert.match(claimGBody.error, /already exists/i);

    recordPass("5. Inactive Predecessor & Email Collision: Protected with 404/403 and 400 (no P2002 crash)");

    console.log("\n===============================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} INTEGRITY TESTS PASSED CLEANLY!`);
    console.log("===============================================================================\n");

  } finally {
    console.log("🧹 Cleaning up isolation test fixtures...");
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

runIsolationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
