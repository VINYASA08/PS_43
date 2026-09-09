/**
 * Challenger Adversarial Stress Harness: Handover Concurrency & Interleaving
 * File: web/tests/challenger_stress_concurrency.ts
 * Execution: npx tsx tests/challenger_stress_concurrency.ts
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
import { hashPassword, verifyPassword, signSessionToken } from "../src/lib/auth";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";
import { POST as initiatePOST } from "../src/app/api/handover/initiate/route";
import { POST as cancelPOST } from "../src/app/api/handover/cancel/route";

function makeJsonRequest(url: string, body?: any, cookie?: string): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    host: "localhost:3000",
  };
  if (cookie) {
    headers["Cookie"] = `sih_session=${cookie}`;
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function runChallengerStress() {
  console.log("\n===============================================================================");
  console.log("⚡ CHALLENGER STRESS HARNESS: 10-WAY BURST, INITIATE FLOOD, CLAIM-CANCEL RACE");
  console.log("===============================================================================\n");

  const cleanupUserIds: string[] = [];

  try {
    // ---------------------------------------------------------------------------
    // STRESS TEST 1: 10-Way Simultaneous Claim Burst
    // ---------------------------------------------------------------------------
    console.log("--- STRESS 1: 10-Way Simultaneous Claim Burst ---");
    const testHash = await hashPassword("PredecessorPass@2026!");
    const user1 = await prisma.user.create({
      data: {
        email: `stress_user1_${Date.now()}@jharkhand.gov.in`,
        name: "Stress Target 1",
        passwordHash: testHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(user1.id);

    const token1 = crypto.randomBytes(32).toString("hex");
    const succEmail1 = `succ_stress1_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: token1,
        userId: user1.id,
        successorEmail: succEmail1,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    console.log("Launching 10 parallel claim requests...");
    const burst10Reqs = Array.from({ length: 10 }, (_, i) => {
      const idx = i + 1;
      const req = makeJsonRequest(`http://localhost:3000/api/handover/${token1}/claim`, {
        successorName: `Contender ${idx}`,
        password: `ContenderPass@${idx}2026!`,
        confirmPassword: `ContenderPass@${idx}2026!`,
      });
      return claimPOST(req, { params: Promise.resolve({ token: token1 }) });
    });

    const burst10Res = await Promise.all(burst10Reqs);
    const burst10Statuses = burst10Res.map((r) => r.status);
    console.log("10-Way Burst Statuses:", burst10Statuses);

    const count200_10 = burst10Statuses.filter((s) => s === 200).length;
    const count409_10 = burst10Statuses.filter((s) => s === 409).length;
    const count500_10 = burst10Statuses.filter((s) => s === 500).length;

    assert.equal(count500_10, 0, "Zero HTTP 500 internal errors under 10-way burst");
    assert.equal(count200_10, 1, "Exactly 1 winner must obtain HTTP 200");
    assert.equal(count409_10, 9, "Exactly 9 losers must receive HTTP 409 Conflict");

    const audit10 = await prisma.auditLog.findMany({
      where: { userId: user1.id, action: "HANDOVER_CLAIMED" },
    });
    assert.equal(audit10.length, 1, "Exactly 1 HANDOVER_CLAIMED audit log entry under 10-way burst");
    console.log("✅ Stress 1 Passed: Exactly 1x 200, 9x 409, 0x 500 under 10-way concurrency.");

    // ---------------------------------------------------------------------------
    // STRESS TEST 2: Concurrent Initiate Token Flood (5 parallel calls by same user)
    // ---------------------------------------------------------------------------
    console.log("\n--- STRESS 2: Concurrent Initiate Token Flood ---");
    const user2 = await prisma.user.create({
      data: {
        email: `stress_user2_${Date.now()}@jharkhand.gov.in`,
        name: "Stress Target 2",
        passwordHash: testHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(user2.id);

    const user2Session = await signSessionToken({
      userId: user2.id,
      email: user2.email,
      name: user2.name,
      role: "GOV",
      status: "ACTIVE",
    });

    console.log("Launching 5 parallel initiate calls by same user...");
    const initReqs = Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1;
      const req = makeJsonRequest(
        "http://localhost:3000/api/handover/initiate",
        { successorEmail: `succ_flood_${idx}_${Date.now()}@jharkhand.gov.in` },
        user2Session
      );
      return initiatePOST(req);
    });

    const initRes = await Promise.all(initReqs);
    const initStatuses = initRes.map((r) => r.status);
    console.log("Initiate Flood Statuses:", initStatuses);

    // All should be 200
    for (const status of initStatuses) {
      assert.equal(status, 200, "All initiate calls must complete with HTTP 200");
    }

    // Inspect active tokens in DB
    const activeTokens2 = await prisma.handoverToken.findMany({
      where: { userId: user2.id, usedAt: null },
    });
    console.log(`Remaining active tokens in DB for user 2: ${activeTokens2.length}`);
    assert.equal(activeTokens2.length, 1, "Only exactly 1 active token may remain in DB for the user!");
    console.log("✅ Stress 2 Passed: Mutex serialization prevented token proliferation; exactly 1 active token in DB.");

    // ---------------------------------------------------------------------------
    // STRESS TEST 3: Interleaved Race Between Successor Claim and Predecessor Cancel
    // ---------------------------------------------------------------------------
    console.log("\n--- STRESS 3: Interleaved Race Between Claim and Cancel ---");
    const user3 = await prisma.user.create({
      data: {
        email: `stress_user3_${Date.now()}@jharkhand.gov.in`,
        name: "Stress Target 3",
        passwordHash: testHash,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(user3.id);

    const user3Session = await signSessionToken({
      userId: user3.id,
      email: user3.email,
      name: user3.name,
      role: "GOV",
      status: "ACTIVE",
    });

    const token3 = crypto.randomBytes(32).toString("hex");
    const succEmail3 = `succ_race3_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: token3,
        userId: user3.id,
        successorEmail: succEmail3,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    console.log("Firing parallel Claim vs Cancel requests...");
    const claimReq = makeJsonRequest(`http://localhost:3000/api/handover/${token3}/claim`, {
      successorName: "Interleaved Racer",
      password: "NewPassword@2026!",
      confirmPassword: "NewPassword@2026!",
    });
    const cancelReq = makeJsonRequest("http://localhost:3000/api/handover/cancel", {}, user3Session);

    const [claimRes, cancelRes] = await Promise.all([
      claimPOST(claimReq, { params: Promise.resolve({ token: token3 }) }),
      cancelPOST(cancelReq),
    ]);

    console.log(`Claim status: ${claimRes.status}, Cancel status: ${cancelRes.status}`);

    // Neither call may return 500 Internal Server Error
    assert.notEqual(claimRes.status, 500, "Claim must not fail with 500");
    assert.notEqual(cancelRes.status, 500, "Cancel must not fail with 500");

    // Cancel always succeeds (status 200) returning cancelledCount (either 0 or 1)
    assert.equal(cancelRes.status, 200, "Cancel must succeed with 200");
    const cancelBody = await cancelRes.json();

    if (claimRes.status === 200) {
      console.log("Claim won the race! Cancel arrived after claim was committed.");
      assert.equal(cancelBody.cancelledCount, 0, "Since token was claimed (usedAt set), cancel deleted 0 tokens");
      const dbToken = await prisma.handoverToken.findUnique({ where: { token: token3 } });
      assert.ok(dbToken && dbToken.usedAt !== null, "Token remains preserved as used");
    } else {
      console.log("Cancel won the race! Claim arrived after token was invalidated/deleted.");
      assert.ok([404, 409].includes(claimRes.status), "Claim rejected because token was cancelled");
      assert.equal(cancelBody.cancelledCount, 1, "Cancel deleted the unused token");
    }

    console.log("✅ Stress 3 Passed: Claim vs Cancel race resolved deterministically with 0 server errors.");

    console.log("\n===============================================================================");
    console.log("🎉 ALL 3 CHALLENGER STRESS TESTS COMPLETED WITH 100% EMPIRICAL INTEGRITY!");
    console.log("===============================================================================\n");

  } finally {
    console.log("🧹 Cleaning up challenger stress fixtures...");
    for (const uid of cleanupUserIds) {
      await prisma.handoverToken.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
    console.log("✅ Teardown complete.");
  }
}

runChallengerStress()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Challenger stress failed:", err);
    process.exit(1);
  });
