/**
 * Concurrency & Race Condition Deep Dive: Initiate & Cancel Routes
 * File: web/tests/test_initiate_cancel_concurrency.ts
 * Execution: npx tsx tests/test_initiate_cancel_concurrency.ts
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
import { hashPassword, signSessionToken } from "../src/lib/auth";
import { POST as initiatePOST, GET as initiateGET } from "../src/app/api/handover/initiate/route";
import { POST as cancelPOST } from "../src/app/api/handover/cancel/route";
import { POST as claimPOST } from "../src/app/api/handover/[token]/claim/route";

async function makeAuthReq(url: string, method: string, token: string, body?: any): Promise<NextRequest> {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      "Content-Type": "application/json",
      cookie: `sih_session=${token}`,
      host: "localhost:3000",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function makeClaimReq(url: string, body: any): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "localhost:3000",
    },
    body: JSON.stringify(body),
  });
}

async function createTestUser(prefix: string) {
  const predHash = await hashPassword("TestPass@2026!");
  return prisma.user.create({
    data: {
      email: `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@jharkhand.gov.in`,
      name: `User ${prefix}`,
      passwordHash: predHash,
      role: "GOV",
      status: "ACTIVE",
    },
  });
}

async function getAuthToken(user: any) {
  return signSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "GOV" as any,
    status: "ACTIVE" as any,
  });
}

async function cleanupUser(userId: string) {
  try {
    await prisma.handoverToken.deleteMany({ where: { userId } });
    await prisma.auditLog.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  } catch (e) {
    // ignore
  }
}

async function runAllTests() {
  console.log("===============================================================================");
  console.log("🔬 DEEP DIVE: INITIATE & CANCEL CONCURRENCY & RACE CONDITIONS");
  console.log("===============================================================================\n");

  let testCount = 0;
  let failCount = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Dual Concurrent Initiate (Same User)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`[TEST ${testCount}] Concurrent Initiate (2 simultaneous calls by same user)...`);
  const user1 = await createTestUser("init_dual");
  const token1 = await getAuthToken(user1);

  const succEmail1 = `succ1_${Date.now()}@jharkhand.gov.in`;
  const succEmail2 = `succ2_${Date.now()}@jharkhand.gov.in`;

  const req1_1 = await makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", token1, { successorEmail: succEmail1 });
  const req1_2 = await makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", token1, { successorEmail: succEmail2 });

  const [res1_1, res1_2] = await Promise.all([
    initiatePOST(req1_1).catch((e: any) => ({ status: 999, error: e })),
    initiatePOST(req1_2).catch((e: any) => ({ status: 999, error: e })),
  ]);

  const body1_1 = "json" in res1_1 ? await res1_1.json() : (res1_1 as any).error;
  const body1_2 = "json" in res1_2 ? await res1_2.json() : (res1_2 as any).error;

  console.log(`   Response 1: status=${res1_1.status}`, body1_1?.success ? `(token=${body1_1.token?.substring(0, 10)}...)` : body1_1);
  console.log(`   Response 2: status=${res1_2.status}`, body1_2?.success ? `(token=${body1_2.token?.substring(0, 10)}...)` : body1_2);

  const tokens1 = await prisma.handoverToken.findMany({
    where: { userId: user1.id, usedAt: null },
    orderBy: { createdAt: "asc" },
  });
  console.log(`   Tokens in DB for user: ${tokens1.length}`);
  tokens1.forEach((t, i) => console.log(`     Token [${i}]: id=${t.id} email=${t.successorEmail} token=${t.token.substring(0, 10)}...`));

  if (tokens1.length > 1) {
    console.log(`   ⚠️ RACE CONDITION DETECTED: ${tokens1.length} active tokens co-exist for same user!`);
  }
  await cleanupUser(user1.id);

  // -------------------------------------------------------------------------
  // TEST 2: High Concurrency Initiate (5 simultaneous calls by same user)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] High Concurrency Initiate (5 simultaneous calls by same user)...`);
  const user2 = await createTestUser("init_high");
  const token2 = await getAuthToken(user2);

  const reqs2 = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", token2, {
        successorEmail: `succ_burst_${i}_${Date.now()}@jharkhand.gov.in`,
      })
    )
  );

  const responses2 = await Promise.all(
    reqs2.map((req) => initiatePOST(req).catch((e: any) => ({ status: 999, error: e })))
  );

  const statusCounts2: Record<string, number> = {};
  for (const r of responses2) {
    statusCounts2[r.status] = (statusCounts2[r.status] || 0) + 1;
  }
  console.log(`   Burst 5 status distribution:`, statusCounts2);

  const tokens2 = await prisma.handoverToken.findMany({
    where: { userId: user2.id, usedAt: null },
  });
  console.log(`   Tokens in DB for user after 5-burst: ${tokens2.length}`);
  await cleanupUser(user2.id);

  // -------------------------------------------------------------------------
  // TEST 3: Concurrent Cancel (2 simultaneous calls by same user)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Concurrent Cancel (2 simultaneous calls by same user)...`);
  const user3 = await createTestUser("cancel_dual");
  const token3 = await getAuthToken(user3);

  // Seed 1 active token first
  await prisma.handoverToken.create({
    data: {
      token: crypto.randomBytes(32).toString("hex"),
      userId: user3.id,
      successorEmail: `succ_cancel_${Date.now()}@jharkhand.gov.in`,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    },
  });

  const req3_1 = await makeAuthReq("http://localhost:3000/api/handover/cancel", "POST", token3);
  const req3_2 = await makeAuthReq("http://localhost:3000/api/handover/cancel", "POST", token3);

  const [res3_1, res3_2] = await Promise.all([
    cancelPOST(req3_1).catch((e: any) => ({ status: 999, error: e })),
    cancelPOST(req3_2).catch((e: any) => ({ status: 999, error: e })),
  ]);

  const body3_1 = "json" in res3_1 ? await res3_1.json() : (res3_1 as any).error;
  const body3_2 = "json" in res3_2 ? await res3_2.json() : (res3_2 as any).error;

  console.log(`   Cancel 1: status=${res3_1.status}`, body3_1);
  console.log(`   Cancel 2: status=${res3_2.status}`, body3_2);

  const remainingTokens3 = await prisma.handoverToken.findMany({ where: { userId: user3.id } });
  console.log(`   Tokens remaining in DB: ${remainingTokens3.length}`);
  await cleanupUser(user3.id);

  // -------------------------------------------------------------------------
  // TEST 4: High Concurrency Cancel (5 simultaneous calls by same user)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] High Concurrency Cancel (5 simultaneous calls by same user)...`);
  const user4 = await createTestUser("cancel_high");
  const token4 = await getAuthToken(user4);

  // Seed 1 active token
  await prisma.handoverToken.create({
    data: {
      token: crypto.randomBytes(32).toString("hex"),
      userId: user4.id,
      successorEmail: `succ_cancel_burst_${Date.now()}@jharkhand.gov.in`,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    },
  });

  const reqs4 = await Promise.all(
    Array.from({ length: 5 }, () => makeAuthReq("http://localhost:3000/api/handover/cancel", "POST", token4))
  );

  const responses4 = await Promise.all(
    reqs4.map((req) => cancelPOST(req).catch((e: any) => ({ status: 999, error: e })))
  );

  const statusCounts4: Record<string, number> = {};
  for (const r of responses4) {
    statusCounts4[r.status] = (statusCounts4[r.status] || 0) + 1;
  }
  console.log(`   Cancel 5-burst status distribution:`, statusCounts4);
  await cleanupUser(user4.id);

  // -------------------------------------------------------------------------
  // TEST 5: Simultaneous Initiate and Cancel (Race: Initiate vs Cancel)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Simultaneous Initiate vs Cancel (Same user)...`);
  const user5 = await createTestUser("init_vs_cancel");
  const token5 = await getAuthToken(user5);

  // Seed an old token
  await prisma.handoverToken.create({
    data: {
      token: crypto.randomBytes(32).toString("hex"),
      userId: user5.id,
      successorEmail: `old_token_${Date.now()}@jharkhand.gov.in`,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    },
  });

  const reqInit = await makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", token5, {
    successorEmail: `new_token_${Date.now()}@jharkhand.gov.in`,
  });
  const reqCancel = await makeAuthReq("http://localhost:3000/api/handover/cancel", "POST", token5);

  const [resInit, resCancel] = await Promise.all([
    initiatePOST(reqInit).catch((e: any) => ({ status: 999, error: e })),
    cancelPOST(reqCancel).catch((e: any) => ({ status: 999, error: e })),
  ]);

  const bodyInit = "json" in resInit ? await resInit.json() : (resInit as any).error;
  const bodyCancel = "json" in resCancel ? await resCancel.json() : (resCancel as any).error;

  console.log(`   Initiate: status=${resInit.status}`, bodyInit?.success ? `(token=${bodyInit.token?.substring(0, 10)}...)` : bodyInit);
  console.log(`   Cancel:   status=${resCancel.status}`, bodyCancel);

  const finalTokens5 = await prisma.handoverToken.findMany({ where: { userId: user5.id } });
  console.log(`   Final tokens in DB: ${finalTokens5.length}`);
  finalTokens5.forEach((t) => console.log(`     Token: email=${t.successorEmail} token=${t.token.substring(0, 10)}...`));
  await cleanupUser(user5.id);

  // -------------------------------------------------------------------------
  // TEST 6: Simultaneous Cancel vs Claim (Race: Predecessor Cancels while Successor Claims)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Simultaneous Cancel vs Claim (Predecessor cancels while Successor claims)...`);
  const user6 = await createTestUser("cancel_vs_claim");
  const token6 = await getAuthToken(user6);

  const handoverSecret = crypto.randomBytes(32).toString("hex");
  const succEmail6 = `succ_claim_${Date.now()}@jharkhand.gov.in`;

  await prisma.handoverToken.create({
    data: {
      token: handoverSecret,
      userId: user6.id,
      successorEmail: succEmail6,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    },
  });

  const reqCancel6 = await makeAuthReq("http://localhost:3000/api/handover/cancel", "POST", token6);
  const reqClaim6 = makeClaimReq(`http://localhost:3000/api/handover/${handoverSecret}/claim`, {
    successorName: "Successor Person",
    password: "NewPassword@123!",
    confirmPassword: "NewPassword@123!",
  });

  const [resCancel6, resClaim6] = await Promise.all([
    cancelPOST(reqCancel6).catch((e: any) => ({ status: 999, error: e })),
    claimPOST(reqClaim6, { params: Promise.resolve({ token: handoverSecret }) }).catch((e: any) => ({ status: 999, error: e })),
  ]);

  const bodyCancel6 = "json" in resCancel6 ? await resCancel6.json() : (resCancel6 as any).error;
  const bodyClaim6 = "json" in resClaim6 ? await resClaim6.json() : (resClaim6 as any).error;

  console.log(`   Cancel result: status=${resCancel6.status}`, bodyCancel6);
  console.log(`   Claim result:  status=${resClaim6.status}`, bodyClaim6);

  const finalUser6 = await prisma.user.findUnique({ where: { id: user6.id } });
  console.log(`   Final user state in DB: email=${finalUser6?.email}, name=${finalUser6?.name}`);
  await cleanupUser(user6.id);

  // -------------------------------------------------------------------------
  // TEST 7: Cross-User Concurrency (Multiple distinct users initiating concurrently)
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Cross-User Concurrency (3 distinct users initiating simultaneously)...`);
  const users7 = await Promise.all([
    createTestUser("cross_1"),
    createTestUser("cross_2"),
    createTestUser("cross_3"),
  ]);
  const tokens7 = await Promise.all(users7.map(getAuthToken));

  const reqs7 = await Promise.all(
    users7.map((u, i) =>
      makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", tokens7[i], {
        successorEmail: `succ_cross_${i}_${Date.now()}@jharkhand.gov.in`,
      })
    )
  );

  const responses7 = await Promise.all(
    reqs7.map((req) => initiatePOST(req).catch((e: any) => ({ status: 999, error: e })))
  );

  for (let i = 0; i < 3; i++) {
    const b = "json" in responses7[i] ? await responses7[i].json() : (responses7[i] as any).error;
    console.log(`   User ${i + 1}: status=${responses7[i].status}`, b?.success ? "OK" : b);
  }

  for (const u of users7) {
    await cleanupUser(u.id);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Anti-Pattern Check: Would wrapping initiate in interactive prisma.$transaction cause P2028?
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Anti-Pattern Check: Concurrent interactive prisma.$transaction...`);
  const user8 = await createTestUser("tx_anti_pattern");
  const runInteractiveTx = async (idx: number) => {
    return prisma.$transaction(async (tx) => {
      await tx.handoverToken.deleteMany({ where: { userId: user8.id, usedAt: null } });
      const token = crypto.randomBytes(32).toString("hex");
      return tx.handoverToken.create({
        data: {
          token,
          userId: user8.id,
          successorEmail: `succ_tx_${idx}_${Date.now()}@jharkhand.gov.in`,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
    });
  };

  const results8 = await Promise.allSettled([runInteractiveTx(1), runInteractiveTx(2)]);
  const failed8 = results8.filter((r) => r.status === "rejected");
  console.log(`   Interactive TX Results: Succeeded=${results8.length - failed8.length}, Failed=${failed8.length}`);
  if (failed8.length > 0) {
    const err = (failed8[0] as PromiseRejectedResult).reason;
    console.log(`   ⚠️ INTERACTIVE TRANSACTION FAILED WITH: code=${err?.code} message=${err?.message}`);
  }
  await cleanupUser(user8.id);

  // -------------------------------------------------------------------------
  // TEST 9: Predecessor Stale Session Exploitation after Successor Claim
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Predecessor Stale Session Check after Successor Claim...`);
  const user9 = await createTestUser("alice_pred");
  const aliceToken9 = await getAuthToken(user9);

  const bobHandoverSecret = crypto.randomBytes(32).toString("hex");
  const bobEmail = `bob_succ_${Date.now()}@jharkhand.gov.in`;

  await prisma.handoverToken.create({
    data: {
      token: bobHandoverSecret,
      userId: user9.id,
      successorEmail: bobEmail,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  // Bob claims token
  const reqClaim9 = makeClaimReq(`http://localhost:3000/api/handover/${bobHandoverSecret}/claim`, {
    successorName: "Bob Successor",
    password: "BobPassword@123!",
    confirmPassword: "BobPassword@123!",
  });
  const resClaim9 = await claimPOST(reqClaim9, { params: Promise.resolve({ token: bobHandoverSecret }) });
  console.log(`   Bob Claim status: ${resClaim9.status}`);

  // Now Alice attempts to initiate with her pre-existing session token
  const charlieEmail = `charlie_intruder_${Date.now()}@jharkhand.gov.in`;
  const reqAliceHijack = await makeAuthReq("http://localhost:3000/api/handover/initiate", "POST", aliceToken9, {
    successorEmail: charlieEmail,
  });
  const resAliceHijack = await initiatePOST(reqAliceHijack);
  const bodyAliceHijack = await resAliceHijack.json();
  console.log(`   Alice Post-Claim Initiate status: ${resAliceHijack.status}`, bodyAliceHijack);

  if (resAliceHijack.status === 200) {
    console.log(`   ⚠️ CRITICAL AUTH/STATE FLAW: Predecessor initiated new handover of claimed account!`);
  } else {
    console.log(`   Protected against stale session initiation: ${resAliceHijack.status}`);
  }

  await cleanupUser(user9.id);

  // -------------------------------------------------------------------------
  // TEST 10: Fix Candidate Evaluation: Prisma Sequential Batch Array ($transaction([...]))
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Fix Candidate: Batch Array $transaction([deleteMany, create])...`);
  const user10 = await createTestUser("batch_candidate");
  const runBatch = (idx: number) => {
    const token = crypto.randomBytes(32).toString("hex");
    return prisma.$transaction([
      prisma.handoverToken.deleteMany({ where: { userId: user10.id, usedAt: null } }),
      prisma.handoverToken.create({
        data: {
          token,
          userId: user10.id,
          successorEmail: `succ_batch_${idx}_${Date.now()}@jharkhand.gov.in`,
          expiresAt: new Date(Date.now() + 86400000),
        },
      }),
    ]);
  };

  const batchResults = await Promise.allSettled([runBatch(1), runBatch(2)]);
  console.log(`   Batch 1: ${batchResults[0].status}`);
  console.log(`   Batch 2: ${batchResults[1].status}`);

  const tokens10 = await prisma.handoverToken.findMany({ where: { userId: user10.id, usedAt: null } });
  console.log(`   Active tokens in DB after concurrent batch tx: ${tokens10.length}`);
  tokens10.forEach((t, i) => console.log(`     Token [${i}]: email=${t.successorEmail} token=${t.token.substring(0, 10)}...`));
  await cleanupUser(user10.id);

  // -------------------------------------------------------------------------
  // TEST 11: Fix Candidate Evaluation: Per-User Mutex Serialization
  // -------------------------------------------------------------------------
  testCount++;
  console.log(`\n[TEST ${testCount}] Fix Candidate: In-Process Mutex Serialization...`);
  const user11 = await createTestUser("mutex_candidate");
  const userLocks = new Map<string, Promise<void>>();
  async function acquireLock(userId: string) {
    while (userLocks.has(userId)) {
      await userLocks.get(userId);
    }
    let resolveLock!: () => void;
    const p = new Promise<void>((resolve) => { resolveLock = resolve; });
    userLocks.set(userId, p);
    return () => {
      userLocks.delete(userId);
      resolveLock();
    };
  }

  const runWithMutex = async (idx: number) => {
    const unlock = await acquireLock(user11.id);
    try {
      // Check if there is an existing active token created < 1000ms ago (deduplicate rapid double-clicks)
      const recent = await prisma.handoverToken.findFirst({
        where: {
          userId: user11.id,
          usedAt: null,
          createdAt: { gt: new Date(Date.now() - 1000) },
        },
      });
      if (recent) {
        return { deduplicated: true, token: recent.token };
      }

      await prisma.handoverToken.deleteMany({ where: { userId: user11.id, usedAt: null } });
      const token = crypto.randomBytes(32).toString("hex");
      const created = await prisma.handoverToken.create({
        data: {
          token,
          userId: user11.id,
          successorEmail: `succ_mutex_${idx}_${Date.now()}@jharkhand.gov.in`,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      return { deduplicated: false, token: created.token };
    } finally {
      unlock();
    }
  };

  const mutexResults = await Promise.all([runWithMutex(1), runWithMutex(2)]);
  console.log(`   Mutex Call 1:`, mutexResults[0]);
  console.log(`   Mutex Call 2:`, mutexResults[1]);

  const tokens11 = await prisma.handoverToken.findMany({ where: { userId: user11.id, usedAt: null } });
  console.log(`   Active tokens in DB with Mutex: ${tokens11.length}`);
  tokens11.forEach((t, i) => console.log(`     Token [${i}]: email=${t.successorEmail} token=${t.token.substring(0, 10)}...`));
  await cleanupUser(user11.id);

  await prisma.$disconnect();
  console.log("\n===============================================================================");
  console.log("🏁 INVESTIGATION COMPLETE");
  console.log("===============================================================================\n");
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
