import React from "react";
import ReactDOMServer from "react-dom/server";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import { UserRole, UserStatus } from "../src/lib/types";
import { signSessionToken } from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { logAuditEvent } from "../src/lib/rbac";
import { GET as getAnalytics } from "../src/app/api/state/analytics/route";
import { POST as overrideChallenge } from "../src/app/api/state/override/challenge/route";
import { POST as revokeFunding } from "../src/app/api/state/override/revoke-funding/route";
import { POST as postAiConfig } from "../src/app/api/state/ai-config/route";
import { FinancialCommand } from "../src/app/dashboard/state/components/FinancialCommand";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function runHardeningTests() {
  console.log("===============================================================================");
  console.log("     MILESTONE 3 REMEDIATION & HARDENING VERIFICATION SUITE");
  console.log("===============================================================================\n");

  // --------------------------------------------------------------------------
  // 1. FinancialCommand Clock Import & SSR Rendering
  // --------------------------------------------------------------------------
  console.log("--- 1. FinancialCommand Clock Import & Render Oracle ---");
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(FinancialCommand, {
        financialEscrow: [
          { domain: "Water", pledged: 1000000, escrowed: 500000, disbursed: 200000 },
        ],
        financialTrend: [
          { month: "Jan", pledged: 1000000, disbursed: 200000 },
        ],
        totalCsrPledged: 1000000,
        totalCsrDisbursed: 200000,
        escrowBalance: 300000,
      })
    );
    assert(html.length > 0, "FinancialCommand renders to HTML without ReferenceError: Clock is not defined");
    assert(html.includes("TRL-5 Gate"), "FinancialCommand contains rendered TRL-5 Gate milestone element");
  } catch (err: any) {
    assert(false, "FinancialCommand component execution", err.message);
  }

  // --------------------------------------------------------------------------
  // 2. GET /api/state/analytics Auth & RBAC Enforcement
  // --------------------------------------------------------------------------
  console.log("\n--- 2. GET /api/state/analytics Authentication & RBAC Enforcement ---");
  {
    // 2.1 Unauthenticated request -> HTTP 401
    const unauthReq = new NextRequest("http://localhost:3000/api/state/analytics");
    const unauthRes = await getAnalytics(unauthReq);
    assert(unauthRes.status === 401, "Unauthenticated GET /api/state/analytics returns HTTP 401 Unauthorized");

    // 2.2 Citizen role -> HTTP 403
    const citizenToken = await signSessionToken({
      userId: "citizen-hardening-test",
      name: "Citizen Test",
      email: "citizen@example.com",
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
    });
    const citizenReq = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: `sih_session=${citizenToken}` },
    });
    const citizenRes = await getAnalytics(citizenReq);
    assert(citizenRes.status === 403, "Citizen attempting GET /api/state/analytics returns HTTP 403 Forbidden");

    // 2.3 University role -> HTTP 403
    const uniToken = await signSessionToken({
      userId: "uni-hardening-test",
      name: "Uni Researcher",
      email: "researcher@bitmesra.ac.in",
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
    });
    const uniReq = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: `sih_session=${uniToken}` },
    });
    const uniRes = await getAnalytics(uniReq);
    assert(uniRes.status === 403, "University researcher attempting GET /api/state/analytics returns HTTP 403 Forbidden");

    // 2.4 Industry role -> HTTP 403
    const indToken = await signSessionToken({
      userId: "industry-hardening-test",
      name: "Industry CSR",
      email: "csr@tatasteel.com",
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
    });
    const indReq = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: `sih_session=${indToken}` },
    });
    const indRes = await getAnalytics(indReq);
    assert(indRes.status === 403, "Industry user attempting GET /api/state/analytics returns HTTP 403 Forbidden");

    // 2.5 State Admin -> HTTP 200
    const stateAdminToken = await signSessionToken({
      userId: "state-admin-hardening",
      name: "Chief Secretary",
      email: "chief.secretary@jharkhand.gov.in",
      role: UserRole.STATE_ADMIN,
      tier: "STATE",
      status: UserStatus.ACTIVE,
    });
    const adminReq = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: `sih_session=${stateAdminToken}` },
    });
    const adminRes = await getAnalytics(adminReq);
    assert(adminRes.status === 200, "STATE_ADMIN GET /api/state/analytics returns HTTP 200 OK");
  }

  // --------------------------------------------------------------------------
  // 3. Strict CSRF Verification on State Mutation Endpoints
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Strict CSRF Verification on State Override Endpoints ---");
  {
    const stateAdminToken = await signSessionToken({
      userId: "state-admin-csrf-test",
      name: "Chief Secretary",
      email: "chief.secretary@jharkhand.gov.in",
      role: UserRole.STATE_ADMIN,
      tier: "STATE",
      status: UserStatus.ACTIVE,
    });

    // 3.1 Challenge Override without X-CSRF-Token header -> HTTP 403
    const noCsrfChallengeReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
      method: "POST",
      headers: {
        cookie: `sih_session=${stateAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ challengeId: "nonexistent", newStatus: "RESOLVED" }),
    });
    const noCsrfChallengeRes = await overrideChallenge(noCsrfChallengeReq);
    assert(
      noCsrfChallengeRes.status === 403,
      "POST /api/state/override/challenge without X-CSRF-Token header returns HTTP 403 Forbidden"
    );

    // 3.2 Revoke Funding without X-CSRF-Token header -> HTTP 403
    const noCsrfRevokeReq = new NextRequest("http://localhost:3000/api/state/override/revoke-funding", {
      method: "POST",
      headers: {
        cookie: `sih_session=${stateAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fundingId: "nonexistent", reason: "breach" }),
    });
    const noCsrfRevokeRes = await revokeFunding(noCsrfRevokeReq);
    assert(
      noCsrfRevokeRes.status === 403,
      "POST /api/state/override/revoke-funding without X-CSRF-Token header returns HTTP 403 Forbidden"
    );

    // 3.3 AI Config without X-CSRF-Token header -> HTTP 403
    const noCsrfAiReq = new NextRequest("http://localhost:3000/api/state/ai-config", {
      method: "POST",
      headers: {
        cookie: `sih_session=${stateAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confidenceThreshold: 0.88 }),
    });
    const noCsrfAiRes = await postAiConfig(noCsrfAiReq);
    assert(
      noCsrfAiRes.status === 403,
      "POST /api/state/ai-config without X-CSRF-Token header returns HTTP 403 Forbidden"
    );

    // 3.4 Challenge Override with forged CSRF token -> HTTP 403
    const forgedCsrfChallengeReq = new NextRequest("http://localhost:3000/api/state/override/challenge", {
      method: "POST",
      headers: {
        cookie: `sih_session=${stateAdminToken}; sih_csrf=attacker.forged.cookie`,
        "x-csrf-token": "attacker.forged.header",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ challengeId: "nonexistent", newStatus: "RESOLVED" }),
    });
    const forgedCsrfRes = await overrideChallenge(forgedCsrfChallengeReq);
    assert(
      forgedCsrfRes.status === 403,
      "POST /api/state/override/challenge with forged CSRF token returns HTTP 403 Forbidden"
    );
  }

  // --------------------------------------------------------------------------
  // 4. AuditLog Foreign Key Safety for Synthetic / Non-existent User IDs
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AuditLog Foreign Key Safety & Resilience ---");
  {
    const syntheticNonExistentUserId = `synthetic_nonexistent_user_${Date.now()}`;
    const dummyReq = new NextRequest("http://localhost:3000/api/test");

    // Must not throw SQLite P2003 Foreign key constraint error
    let threwFkError = false;
    try {
      await logAuditEvent(
        syntheticNonExistentUserId,
        "TEST_SYNTHETIC_AUDIT_ACTION",
        "TestResource",
        "test-resource-123",
        dummyReq,
        { before: "value1" },
        { after: "value2" }
      );
    } catch (err: any) {
      threwFkError = true;
      console.error("Caught unexpected exception:", err);
    }

    assert(!threwFkError, "logAuditEvent with non-existent userId does not throw P2003 FK constraint error");

    // Verify audit log record was created with userId: null and attemptedUserId recorded in newState
    const createdLog = await prisma.auditLog.findFirst({
      where: {
        action: "TEST_SYNTHETIC_AUDIT_ACTION",
        resourceId: "test-resource-123",
      },
      orderBy: { createdAt: "desc" },
    });

    assert(createdLog !== null, "AuditLog record was successfully inserted into SQLite database");
    assert(createdLog?.userId === null, "AuditLog.userId is safely stored as null (avoiding FK constraint)");
    const parsedNewState = createdLog?.newState ? JSON.parse(createdLog.newState) : {};
    assert(
      parsedNewState.attemptedUserId === syntheticNonExistentUserId,
      "AuditLog.newState preserves attempted non-existent user identity"
    );

    // Clean up test audit log
    if (createdLog) {
      await prisma.auditLog.deleteMany({
        where: { id: createdLog.id },
      });
    }
  }

  console.log("\n===============================================================================");
  console.log(`     HARDENING TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================\n");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runHardeningTests().catch(async (err) => {
  console.error("Hardening test fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
