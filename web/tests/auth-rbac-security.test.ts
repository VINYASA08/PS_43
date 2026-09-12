import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  resetFailedLogins,
  SessionPayload,
} from "../src/lib/auth";
import { generateTOTP, generateBase32Secret } from "../src/lib/totp";
import { generateCsrfToken } from "../src/lib/csrf";
import { checkRateLimit } from "../src/lib/rateLimiter";
import { UserRole, UserStatus } from "../src/lib/types";

// Route Handlers
import { GET as pendingUsersGET } from "../src/app/api/admin/pending-users/route";
import { POST as approveUserPOST } from "../src/app/api/admin/approve-user/route";
import { GET as auditLogsGET } from "../src/app/api/audit-logs/route";
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as registerPOST } from "../src/app/api/auth/register/route";
import { POST as totpSetupPOST } from "../src/app/api/auth/totp-setup/route";
import { POST as totpVerifyPOST } from "../src/app/api/auth/totp-verify/route";
import { POST as proposalsPOST } from "../src/app/api/proposals/route";
import { POST as fundsPOST } from "../src/app/api/funds/route";

console.log("===============================================================================");
console.log("EMPIRICAL TEST SUITE: AUTHENTICATION & RBAC SECURITY VERIFICATION");
console.log("Jharkhand Smart Study and Innovation Portal (Tasks 1 - 6)");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) {
      console.error(`    Stack: ${err.stack.split("\n")[1]}`);
    }
    failed++;
  }
}

// Helper to create request with cookies & CSRF
function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    ip?: string;
    csrf?: string;
  } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
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

  const init: any = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

async function main() {
  const CSRF_TOKEN = generateCsrfToken();

  // ===========================================================================
  // TASK 1: TEST UNAUTHENTICATED ACCESS
  // ===========================================================================
  console.log("--- Task 1: Unauthenticated Access ---");

  await runTest("1.1 GET /api/admin/pending-users without session cookie returns HTTP 401", async () => {
    const req = makeRequest("http://localhost:3000/api/admin/pending-users");
    const res = await pendingUsersGET(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Authentication required. Please log in.");
  });

  await runTest("1.2 GET /api/audit-logs without session cookie returns HTTP 401", async () => {
    const req = makeRequest("http://localhost:3000/api/audit-logs");
    const res = await auditLogsGET(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Authentication required. Please log in.");
  });

  await runTest("1.3 POST /api/admin/approve-user without session cookie returns HTTP 401", async () => {
    const req = makeRequest("http://localhost:3000/api/admin/approve-user", {
      method: "POST",
      body: { userId: "test", action: "approve" },
      csrf: CSRF_TOKEN,
    });
    const res = await approveUserPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Authentication required. Please log in.");
  });

  await runTest("1.4 POST /api/proposals without session cookie returns HTTP 401", async () => {
    const req = makeRequest("http://localhost:3000/api/proposals", {
      method: "POST",
      body: { title: "Research Proposal", challengeId: "test" },
      csrf: CSRF_TOKEN,
    });
    const res = await proposalsPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Authentication required to submit proposals.");
  });

  await runTest("1.5 POST /api/funds without session cookie returns HTTP 401", async () => {
    const req = makeRequest("http://localhost:3000/api/funds", {
      method: "POST",
      body: { proposalId: "test", amount: 100000 },
      csrf: CSRF_TOKEN,
    });
    const res = await fundsPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Authentication required to pledge funding.");
  });

  await runTest("1.6 Route Existence Verification: /api/challenges/create vs /api/challenges", async () => {
    // Verify that /api/challenges/create is a documented alias/non-existent route,
    // while the actual challenge endpoint is /api/challenges (which permits public citizen reporting)
    let createRouteExists = false;
    try {
      // @ts-ignore
      const mod = await import("../src/app/api/challenges/create/route");
      if (mod) createRouteExists = true;
    } catch {
      createRouteExists = false;
    }
    assert.equal(createRouteExists, false, "Confirmed: /api/challenges/create route does not exist (HTTP 404 in Next.js router)");
  });

  // ===========================================================================
  // TASK 2: TEST ROLE AUTHORIZATION & AUDIT LOGGING
  // ===========================================================================
  console.log("\n--- Task 2: Role Authorization & Audit Logging ---");

  // Fetch University user
  const universityUser = await prisma.user.findUnique({
    where: { email: "pi.water@iitism.ac.in" },
  });
  assert.ok(universityUser, "Seed university user must exist");

  // Authenticate University user via login API
  let universityToken: string = "";
  await runTest("2.1 Authenticate as University user (pi.water@iitism.ac.in)", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: "pi.water@iitism.ac.in", password: "Jharkhand@2026!" },
      ip: "192.168.10.1",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Login response must set cookie");
    const match = setCookie.match(/sih_session=([^;]+)/);
    assert.ok(match, "sih_session cookie must be present");
    universityToken = match[1];

    const decoded = await verifySessionToken(universityToken);
    assert.equal(decoded?.role, "UNIVERSITY");
    assert.equal(decoded?.email, "pi.water@iitism.ac.in");
  });

  await runTest("2.2 University user calling Gov-only GET /api/admin/pending-users returns HTTP 403", async () => {
    const req = makeRequest("http://localhost:3000/api/admin/pending-users", {
      token: universityToken,
      ip: "192.168.10.1",
    });
    const res = await pendingUsersGET(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "You do not have permission to access this resource.");
  });

  await runTest("2.3 University user calling Gov-only POST /api/admin/approve-user returns HTTP 403", async () => {
    const req = makeRequest("http://localhost:3000/api/admin/approve-user", {
      method: "POST",
      body: { userId: "dummy", action: "approve" },
      token: universityToken,
      csrf: CSRF_TOKEN,
      ip: "192.168.10.1",
    });
    const res = await approveUserPOST(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "You do not have permission to access this resource.");
  });

  await runTest("2.4 University user calling Gov-only GET /api/audit-logs returns HTTP 403", async () => {
    const req = makeRequest("http://localhost:3000/api/audit-logs", {
      token: universityToken,
      ip: "192.168.10.1",
    });
    const res = await auditLogsGET(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "You do not have permission to access this resource.");
  });

  await runTest("2.5 Verify AuditLog records generated with action AUTHORIZATION_FAILURE", async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: universityUser.id,
        action: "AUTHORIZATION_FAILURE",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    assert.ok(logs.length >= 3, `Expected at least 3 audit log records for unauthorized attempts, found ${logs.length}`);
    const latestLog = logs[0];
    assert.equal(latestLog.action, "AUTHORIZATION_FAILURE");
    assert.equal(latestLog.resource, "Auth");
    assert.ok(latestLog.newState?.includes("Role UNIVERSITY attempted to access GOV route"), `Expected role violation details, got: ${latestLog.newState}`);
  });

  // ===========================================================================
  // TASK 3: TEST INDUSTRY PENDING APPROVAL GATE
  // ===========================================================================
  console.log("\n--- Task 3: Industry Pending Approval Gate ---");

  await runTest("3.1 Login with unapproved industry account (csr.lead@coalindia.in) returns HTTP 403 PENDING", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: "csr.lead@coalindia.in", password: "Jharkhand@2026!" },
      ip: "192.168.20.1",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.status, "PENDING");
    assert.equal(json.error, "Account pending administrator approval");
  });

  const testIndustryEmail = `empirical.csr.${Date.now()}@tatasteel.com`;
  let newIndustryUserId = "";

  await runTest("3.2 Industry registration automatically assigns status PENDING", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: {
        role: "INDUSTRY",
        email: testIndustryEmail,
        password: "Jharkhand@2026!",
        name: "Adversarial Test Executive",
        organization: "Tata Steel Special CSR",
        designation: "Chief Sustainability Officer",
        district: "East Singhbhum",
      },
      ip: "192.168.20.2",
    });
    const res = await registerPOST(req);
    assert.equal(res.status, 201, `Expected HTTP 201, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.status, "PENDING");
    assert.ok(json.userId);
    newIndustryUserId = json.userId;

    const dbUser = await prisma.user.findUnique({ where: { id: newIndustryUserId } });
    assert.equal(dbUser?.status, "PENDING");
  });

  await runTest("3.3 Newly registered industry account cannot log in prior to Gov approval (HTTP 403)", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: testIndustryEmail, password: "Jharkhand@2026!" },
      ip: "192.168.20.3",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.status, "PENDING");
  });

  await runTest("3.4 Session with status PENDING is blocked from protected operations (HTTP 403)", async () => {
    const pendingPayload: SessionPayload = {
      userId: newIndustryUserId,
      email: testIndustryEmail,
      name: "Adversarial Test Executive",
      role: UserRole.INDUSTRY,
      status: UserStatus.PENDING,
      organization: "Tata Steel Special CSR",
      district: "East Singhbhum",
    };
    const pendingToken = await signSessionToken(pendingPayload);

    const req = makeRequest("http://localhost:3000/api/admin/pending-users", {
      token: pendingToken,
    });
    const res = await pendingUsersGET(req);
    assert.equal(res.status, 403, `Expected HTTP 403 for non-active status, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Your account is not active. Please contact support.");
  });

  // Gov Admin Approves the Industry User
  const govUser = await prisma.user.findUnique({
    where: { email: "nodal.innovation@jharkhand.gov.in" },
  });
  assert.ok(govUser, "Gov admin user must exist");

  const govToken = await signSessionToken({
    userId: govUser.id,
    email: govUser.email,
    name: govUser.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  });

  await runTest("3.5 Gov Admin approves the pending industry user via POST /api/admin/approve-user", async () => {
    const req = makeRequest("http://localhost:3000/api/admin/approve-user", {
      method: "POST",
      body: {
        userId: newIndustryUserId,
        action: "approve",
        reason: "Corporate statutory verification approved by Nodal Officer",
      },
      token: govToken,
      csrf: CSRF_TOKEN,
    });
    const res = await approveUserPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.newStatus, "ACTIVE");

    const updatedUser = await prisma.user.findUnique({ where: { id: newIndustryUserId } });
    assert.equal(updatedUser?.status, "ACTIVE");
  });

  await runTest("3.6 Approved industry user can now successfully log in (HTTP 200)", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: testIndustryEmail, password: "Jharkhand@2026!" },
      ip: "192.168.20.4",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "INDUSTRY");
    assert.equal(json.user.status, "ACTIVE");
    assert.equal(json.redirectUrl, "/dashboard/industry");
  });

  // ===========================================================================
  // TASK 4: TEST ACCOUNT LOCKOUT
  // ===========================================================================
  console.log("\n--- Task 4: Account Lockout ---");

  // Create isolated account for lockout testing
  const lockoutEmail = `lockout.victim.${Date.now()}@iitism.ac.in`;
  const pwdHash = await hashPassword("Jharkhand@2026!");
  const lockoutUser = await prisma.user.create({
    data: {
      email: lockoutEmail,
      passwordHash: pwdHash,
      name: "Lockout Test User",
      role: "UNIVERSITY",
      status: "ACTIVE",
    },
  });

  await runTest("4.1 4 consecutive incorrect logins decrement remaining attempts (HTTP 401)", async () => {
    for (let attempt = 1; attempt <= 4; attempt++) {
      const req = makeRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: lockoutEmail, password: "WrongPassword!" },
        ip: `192.168.30.${attempt}`,
      });
      const res = await loginPOST(req);
      assert.equal(res.status, 401, `Attempt ${attempt}: Expected HTTP 401, got ${res.status}`);
      const json = await res.json();
      assert.equal(json.attemptsRemaining, 5 - attempt, `Attempt ${attempt}: Expected ${5 - attempt} remaining`);
    }

    const u = await prisma.user.findUnique({ where: { id: lockoutUser.id } });
    assert.equal(u?.failedLoginAttempts, 4);
    assert.equal(u?.status, "ACTIVE");
  });

  await runTest("4.2 5th consecutive incorrect login triggers HTTP 423 Locked and sets status LOCKED", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: lockoutEmail, password: "WrongPassword!" },
      ip: "192.168.30.5",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 423, `Attempt 5: Expected HTTP 423, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Account Locked");
    assert.ok(json.message.includes("Account locked for 30 minutes"));
    assert.equal(json.remainingMinutes, 30);

    const u = await prisma.user.findUnique({ where: { id: lockoutUser.id } });
    assert.equal(u?.failedLoginAttempts, 5);
    assert.equal(u?.status, "LOCKED");
    assert.ok(u?.lockoutUntil !== null, "lockoutUntil must be set");
  });

  await runTest("4.3 6th attempt (even with valid credentials) returns HTTP 423 Locked with countdown message", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: lockoutEmail, password: "Jharkhand@2026!" }, // Correct password
      ip: "192.168.30.6",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 423, `Attempt 6: Expected HTTP 423, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Account Locked");
    assert.ok(
      json.message.includes("Account temporarily locked due to 5 consecutive failed login attempts"),
      `Expected countdown lockout message, got: ${json.message}`
    );
    assert.ok(json.remainingMinutes >= 1);
  });

  await runTest("4.4 Account unlock / reset restores login capability", async () => {
    await resetFailedLogins(lockoutUser.id);
    const u = await prisma.user.findUnique({ where: { id: lockoutUser.id } });
    assert.equal(u?.failedLoginAttempts, 0);
    assert.equal(u?.status, "ACTIVE");
    assert.equal(u?.lockoutUntil, null);

    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: lockoutEmail, password: "Jharkhand@2026!" },
      ip: "192.168.30.7",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200 after reset, got ${res.status}`);
  });



  // ===========================================================================
  // TASK 6: TEST RATE LIMITING
  // ===========================================================================
  console.log("\n--- Task 6: Rate Limiting ---");

  const rateLimitTestIp = "10.250.250.99";

  await runTest("6.1 Requests 1 through 10 from same IP are admitted", async () => {
    for (let i = 1; i <= 10; i++) {
      const req = makeRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: "nonexistent@test.org", password: "dummy" },
        ip: rateLimitTestIp,
      });
      const res = await loginPOST(req);
      assert.notEqual(res.status, 429, `Request ${i} should be allowed through limiter, got 429`);
    }
  });

  await runTest("6.2 11th rapid request from same IP returns HTTP 429 Too Many Requests", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: "nonexistent@test.org", password: "dummy" },
      ip: rateLimitTestIp,
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 429, `Expected HTTP 429 on 11th request, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Too many login attempts. Please try again in 1 minute.");
    assert.ok(res.headers.get("retry-after") !== null, "Must include Retry-After header");
  });

  await runTest("6.3 12th rapid request from same IP returns HTTP 429 Too Many Requests", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: { email: "nonexistent@test.org", password: "dummy" },
      ip: rateLimitTestIp,
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 429, `Expected HTTP 429 on 12th request, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Too many login attempts. Please try again in 1 minute.");
  });

  await runTest("6.4 Rate Limiter Sliding Window Unit Oracle", async () => {
    const testIp = `unit.test.${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(testIp, 10, 60000);
      assert.equal(r.allowed, true, `Step ${i + 1} must be allowed`);
    }
    const overflow = checkRateLimit(testIp, 10, 60000);
    assert.equal(overflow.allowed, false, "11th check must return allowed: false");
    assert.equal(overflow.remaining, 0);
    assert.ok(overflow.retryAfterSeconds > 0 && overflow.retryAfterSeconds <= 60);
  });

  // ===========================================================================
  // CLEANUP TEST USERS
  // ===========================================================================
  console.log("\n--- Cleaning up temporary test fixtures ---");
  await prisma.user.deleteMany({
    where: {
      id: { in: [newIndustryUserId, lockoutUser.id] },
    },
  });
  console.log("  ✓ Test users purged from SQLite database.");

  await prisma.$disconnect();

  console.log("\n===============================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED | ${passed + failed} TOTAL`);
  console.log("===============================================================================");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
