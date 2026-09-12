/**
 * Concurrency & Race Condition Deep Dive: Account Handover Portal
 * File: web/tests/test_concurrency_handover.ts
 * Execution: npx tsx tests/test_concurrency_handover.ts
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
import { hashPassword, verifyPassword } from "../src/lib/auth";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";
import { POST as tokenPOST } from "../src/app/api/handover/[token]/route";

function makeJsonRequest(url: string, body?: any): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "localhost:3000" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function testConcurrency() {
  console.log("\n===============================================================================");
  console.log("🔬 TESTING CONCURRENCY & RACE CONDITIONS IN HANDOVER CLAIM");
  console.log("===============================================================================\n");

  const cleanupUserIds: string[] = [];

  try {
    // ---------------------------------------------------------------------------
    // BATTERY 1: 2-Way Simultaneous Race Condition (Promise.all)
    // ---------------------------------------------------------------------------
    console.log("--- Battery 1: 2-Way Simultaneous Race Condition (Promise.all) ---");
    const predPassword1 = "PredPassword@2026!";
    const predHash1 = await hashPassword(predPassword1);

    const user1 = await prisma.user.create({
      data: {
        email: `conc_user1_${Date.now()}@jharkhand.gov.in`,
        name: "Concurrent Predecessor 1",
        passwordHash: predHash1,
        role: "GOV",
        status: "ACTIVE",
        twoFactorEnabled: true,
        twoFactorSecret: "SECRET2FA",
        failedLoginAttempts: 3,
      },
    });
    cleanupUserIds.push(user1.id);

    const token1 = crypto.randomBytes(32).toString("hex");
    const successorEmail1 = `conc_succ1_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: token1,
        userId: user1.id,
        successorEmail: successorEmail1,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    console.log("Firing 2 simultaneous claims with Promise.all...");

    const req1_1 = makeJsonRequest(`http://localhost:3000/api/handover/${token1}/claim`, {
      successorName: "Racer 1",
      password: "Password123@!",
      confirmPassword: "Password123@!",
    });
    const req1_2 = makeJsonRequest(`http://localhost:3000/api/handover/${token1}/claim`, {
      successorName: "Racer 2",
      password: "Password456@!",
      confirmPassword: "Password456@!",
    });

    const [res1_1, res1_2] = await Promise.all([
      claimPOST(req1_1, { params: Promise.resolve({ token: token1 }) }),
      claimPOST(req1_2, { params: Promise.resolve({ token: token1 }) }),
    ]);

    const statuses1 = [res1_1.status, res1_2.status].sort();
    console.log(`Responses: status1=${res1_1.status}, status2=${res1_2.status}`);
    assert.deepEqual(statuses1, [200, 409], "Must yield exactly 1x HTTP 200 and 1x HTTP 409");

    const winnerRes1 = res1_1.status === 200 ? res1_1 : res1_2;
    const loserRes1 = res1_1.status === 409 ? res1_1 : res1_2;
    const winnerBody1 = await winnerRes1.json();
    const loserBody1 = await loserRes1.json();

    // Winner assertions
    assert.equal(winnerBody1.success, true, "Winner must report success = true");
    assert.ok(winnerBody1.user, "Winner body must contain user object");
    assert.equal(winnerBody1.user.id, user1.id, "User ID must be preserved");
    assert.equal(winnerBody1.user.email, successorEmail1.toLowerCase(), "Email must be updated to successor");
    const winnerCookie1 = winnerRes1.headers.get("set-cookie");
    assert.ok(winnerCookie1 && winnerCookie1.includes("sih_session="), "Winner must receive sih_session cookie");

    // Loser assertions
    assert.equal(loserBody1.success, false, "Loser must report success = false");
    assert.match(loserBody1.error, /already been claimed/i, "Loser must receive already claimed conflict error");
    assert.equal(loserRes1.headers.get("set-cookie"), null, "Loser must NOT receive a session cookie");

    // Database state assertions
    const dbToken1 = await prisma.handoverToken.findUnique({ where: { token: token1 } });
    assert.ok(dbToken1 && dbToken1.usedAt !== null, "Token must be marked used in DB");

    const dbUser1 = await prisma.user.findUnique({ where: { id: user1.id } });
    assert.ok(dbUser1, "User must exist in DB");
    assert.equal(dbUser1.name, winnerBody1.user.name, "User name must match winning racer");
    assert.equal(dbUser1.twoFactorEnabled, false, "2FA must be disabled for successor");
    assert.equal(dbUser1.failedLoginAttempts, 0, "Failed login attempts must be reset");

    const winnerPass = winnerBody1.user.name === "Racer 1" ? "Password123@!" : "Password456@!";
    const loserPass = winnerBody1.user.name === "Racer 1" ? "Password456@!" : "Password123@!";
    assert.equal(await verifyPassword(winnerPass, dbUser1.passwordHash), true, "Winner password must authenticate");
    assert.equal(await verifyPassword(loserPass, dbUser1.passwordHash), false, "Loser password must NOT authenticate");

    const auditLogs1 = await prisma.auditLog.findMany({
      where: { userId: user1.id, action: "HANDOVER_CLAIMED" },
    });
    assert.equal(auditLogs1.length, 1, "Exactly 1 HANDOVER_CLAIMED audit log entry must exist");
    console.log("✅ Battery 1 Passed: Exactly 1 winner (200 + cookie) and 1 loser (409 lockout).");

    // ---------------------------------------------------------------------------
    // BATTERY 2: 5-Way Simultaneous Burst Race Condition
    // ---------------------------------------------------------------------------
    console.log("\n--- Battery 2: 5-Way Simultaneous Burst Race Condition ---");
    const predPassword2 = "PredPassword@2026!";
    const predHash2 = await hashPassword(predPassword2);

    const user2 = await prisma.user.create({
      data: {
        email: `conc_user2_${Date.now()}@jharkhand.gov.in`,
        name: "Concurrent Predecessor 2",
        passwordHash: predHash2,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(user2.id);

    const token2 = crypto.randomBytes(32).toString("hex");
    const successorEmail2 = `conc_succ2_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: token2,
        userId: user2.id,
        successorEmail: successorEmail2,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    console.log("Firing 5 simultaneous claims with Promise.all...");
    const burstPromises = Array.from({ length: 5 }, (_, i) => {
      const racerNum = i + 1;
      const req = makeJsonRequest(`http://localhost:3000/api/handover/${token2}/claim`, {
        successorName: `Burst Racer ${racerNum}`,
        password: `BurstPass@${racerNum}2026!`,
        confirmPassword: `BurstPass@${racerNum}2026!`,
      });
      return claimPOST(req, { params: Promise.resolve({ token: token2 }) });
    });

    const burstResponses = await Promise.all(burstPromises);
    const burstStatuses = burstResponses.map((r) => r.status);
    console.log("Burst statuses:", burstStatuses);

    const count200 = burstStatuses.filter((s) => s === 200).length;
    const count409 = burstStatuses.filter((s) => s === 409).length;
    assert.equal(count200, 1, "Burst must yield exactly 1x HTTP 200");
    assert.equal(count409, 4, "Burst must yield exactly 4x HTTP 409");

    const auditLogs2 = await prisma.auditLog.findMany({
      where: { userId: user2.id, action: "HANDOVER_CLAIMED" },
    });
    assert.equal(auditLogs2.length, 1, "Exactly 1 HANDOVER_CLAIMED audit log entry in burst");
    console.log("✅ Battery 2 Passed: Exactly 1 winner (200) and 4 losers (409).");

    // ---------------------------------------------------------------------------
    // BATTERY 3: Dual-Route Simultaneous Race Condition (/claim vs direct /[token])
    // ---------------------------------------------------------------------------
    console.log("\n--- Battery 3: Dual-Route Simultaneous Race Condition ---");
    const predPassword3 = "PredPassword@2026!";
    const predHash3 = await hashPassword(predPassword3);

    const user3 = await prisma.user.create({
      data: {
        email: `conc_user3_${Date.now()}@jharkhand.gov.in`,
        name: "Concurrent Predecessor 3",
        passwordHash: predHash3,
        role: "GOV",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(user3.id);

    const token3 = crypto.randomBytes(32).toString("hex");
    const successorEmail3 = `conc_succ3_${Date.now()}@jharkhand.gov.in`;
    await prisma.handoverToken.create({
      data: {
        token: token3,
        userId: user3.id,
        successorEmail: successorEmail3,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    });

    console.log("Firing parallel claims: 1 via /claim, 1 direct via /[token]...");
    const req3_sub = makeJsonRequest(`http://localhost:3000/api/handover/${token3}/claim`, {
      successorName: "Subroute Racer",
      password: "SubroutePassword123!",
      confirmPassword: "SubroutePassword123!",
    });
    const req3_direct = makeJsonRequest(`http://localhost:3000/api/handover/${token3}`, {
      successorName: "Direct Racer",
      password: "DirectPassword123!",
      confirmPassword: "DirectPassword123!",
    });

    const [res3_sub, res3_direct] = await Promise.all([
      claimPOST(req3_sub, { params: Promise.resolve({ token: token3 }) }),
      tokenPOST(req3_direct, { params: Promise.resolve({ token: token3 }) }),
    ]);

    const statuses3 = [res3_sub.status, res3_direct.status].sort();
    console.log(`Dual-route statuses: sub=${res3_sub.status}, direct=${res3_direct.status}`);
    assert.deepEqual(statuses3, [200, 409], "Dual-route collision must yield exactly 1x 200 and 1x 409");

    const auditLogs3 = await prisma.auditLog.findMany({
      where: { userId: user3.id, action: "HANDOVER_CLAIMED" },
    });
    assert.equal(auditLogs3.length, 1, "Exactly 1 HANDOVER_CLAIMED audit log entry in dual-route");
    console.log("✅ Battery 3 Passed: Exactly 1 winner (200) and 1 loser (409) across dual routes.");

    console.log("\n===============================================================================");
    console.log("🎉 ALL 3 CONCURRENCY BATTERIES PASSED WITH ZERO CONFLICT ERRORS!");
    console.log("===============================================================================\n");

  } finally {
    console.log("🧹 Cleaning up concurrency test fixtures...");
    for (const uid of cleanupUserIds) {
      await prisma.handoverToken.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
    console.log("✅ Teardown complete.");
  }
}

testConcurrency()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Concurrency test failure:", err);
    process.exit(1);
  });
