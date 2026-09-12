import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import {
  hashPassword,
  signSessionToken,
  SessionPayload,
} from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { checkRateLimit } from "../src/lib/rateLimiter";
import { UserRole, UserStatus } from "../src/lib/types";

// Route Handlers under test
import { GET as pendingUsersGET } from "../src/app/api/admin/pending-users/route";
import { POST as approveUserPOST } from "../src/app/api/admin/approve-user/route";
import { GET as auditLogsGET } from "../src/app/api/audit-logs/route";
import { POST as proposalsPOST } from "../src/app/api/proposals/route";
import { POST as fundsPOST } from "../src/app/api/funds/route";
import { GET as userProfileGET } from "../src/app/api/users/profile/route";
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as challengesPOST } from "../src/app/api/challenges/route";

export interface TestResult {
  name: string;
  tier: number;
  status: "PASS" | "FAIL" | "PENDING";
  error?: string;
  durationMs: number;
}

export interface SuiteResult {
  suiteName: string;
  passed: number;
  failed: number;
  pending: number;
  total: number;
  results: TestResult[];
}

// Request builder helper
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

  if (options.body !== undefined) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

export async function runRbacSecuritySuite(): Promise<SuiteResult> {
  console.log("\n===============================================================================");
  console.log("SUITE: E2E RBAC & SECURITY HARDENING ACCEPTANCE");
  console.log("Tier 1 (401/403 Role Boundaries) & Tier 2 (Lockout, Rate Limit, CSRF)");
  console.log("===============================================================================\n");

  const results: TestResult[] = [];
  const cleanupUserIds: string[] = [];
  const csrfToken = generateCsrfToken();

  async function executeTest(name: string, tier: number, fn: () => Promise<void | "PENDING">) {
    const start = Date.now();
    try {
      const outcome = await fn();
      const durationMs = Date.now() - start;
      if (outcome === "PENDING") {
        console.log(`  ⏳ [Tier ${tier}] PENDING: ${name} (${durationMs}ms)`);
        results.push({ name, tier, status: "PENDING", durationMs });
      } else {
        console.log(`  ✓ [Tier ${tier}] PASS: ${name} (${durationMs}ms)`);
        results.push({ name, tier, status: "PASS", durationMs });
      }
    } catch (err: any) {
      const durationMs = Date.now() - start;
      console.error(`  ✗ [Tier ${tier}] FAIL: ${name} (${durationMs}ms)`);
      console.error(`    Error: ${err.message}`);
      results.push({ name, tier, status: "FAIL", error: err.message, durationMs });
    }
  }

  // Create real test persona records in DB to satisfy foreign keys
  const testCitizen = await prisma.user.create({
    data: {
      name: "RBAC Test Citizen",
      phone: `+9191${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  cleanupUserIds.push(testCitizen.id);

  const testUni = await prisma.user.create({
    data: {
      name: "RBAC Test University PI",
      email: `test.uni.${Date.now()}.${Math.floor(Math.random()*1000)}@iitism.ac.in`,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  cleanupUserIds.push(testUni.id);

  const testIndustry = await prisma.user.create({
    data: {
      name: "RBAC Test Industry Lead",
      email: `test.ind.${Date.now()}.${Math.floor(Math.random()*1000)}@tatasteel.com`,
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  cleanupUserIds.push(testIndustry.id);

  const testGov = await prisma.user.create({
    data: {
      name: "RBAC Test Gov Officer",
      email: `test.gov.${Date.now()}.${Math.floor(Math.random()*1000)}@jharkhand.gov.in`,
      role: UserRole.GOV,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  cleanupUserIds.push(testGov.id);

  const testPending = await prisma.user.create({
    data: {
      name: "RBAC Test Pending Industry",
      email: `test.pending.${Date.now()}.${Math.floor(Math.random()*1000)}@corporate.com`,
      role: UserRole.INDUSTRY,
      status: UserStatus.PENDING,
      passwordHash: "N/A",
    },
  });
  cleanupUserIds.push(testPending.id);

  // Mint signed test sessions for each role
  const citizenToken = await signSessionToken({
    userId: testCitizen.id,
    name: testCitizen.name,
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
  });

  const universityToken = await signSessionToken({
    userId: testUni.id,
    name: testUni.name,
    role: UserRole.UNIVERSITY,
    status: UserStatus.ACTIVE,
  });

  const industryToken = await signSessionToken({
    userId: testIndustry.id,
    name: testIndustry.name,
    role: UserRole.INDUSTRY,
    status: UserStatus.ACTIVE,
  });

  const govToken = await signSessionToken({
    userId: testGov.id,
    name: testGov.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  });

  const pendingIndustryToken = await signSessionToken({
    userId: testPending.id,
    name: testPending.name,
    role: UserRole.INDUSTRY,
    status: UserStatus.PENDING,
  });

  // ---------------------------------------------------------------------------
  // TIER 1: UNAUTHENTICATED (401) & ROLE BOUNDARY (403) ENFORCEMENT
  // ---------------------------------------------------------------------------
  console.log("--- TIER 1: Unauthenticated 401 & Role Boundary 403 Enforcement ---");

  await executeTest(
    "1.1 Unauthenticated: GET /api/admin/pending-users without session returns HTTP 401",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/admin/pending-users");
      const res = await pendingUsersGET(req);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.error, "Authentication required. Please log in.");
    }
  );

  await executeTest(
    "1.2 Unauthenticated: POST /api/admin/approve-user without session returns HTTP 401",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/admin/approve-user", {
        method: "POST",
        body: { userId: "some_id", action: "approve" },
        csrf: csrfToken,
      });
      const res = await approveUserPOST(req);
      assert.equal(res.status, 401);
    }
  );

  await executeTest(
    "1.3 Unauthenticated: GET /api/audit-logs without session returns HTTP 401",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/audit-logs");
      const res = await auditLogsGET(req);
      assert.equal(res.status, 401);
    }
  );

  await executeTest(
    "1.4 Unauthenticated: POST /api/proposals without session returns HTTP 401",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: { challengeId: "some_id", title: "Proposal" },
        csrf: csrfToken,
      });
      const res = await proposalsPOST(req);
      assert.equal(res.status, 401);
    }
  );

  await executeTest(
    "1.5 Unauthenticated: POST /api/funds without session returns HTTP 401",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: { proposalId: "some_id", amount: 100000 },
        csrf: csrfToken,
      });
      const res = await fundsPOST(req);
      assert.equal(res.status, 401);
    }
  );

  await executeTest(
    "1.6 Role Boundary: Citizen cannot approve pending users (HTTP 403 Forbidden)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/admin/approve-user", {
        method: "POST",
        body: { userId: "some_user_id", action: "approve" },
        token: citizenToken,
        csrf: csrfToken,
      });
      const res = await approveUserPOST(req);
      assert.equal(res.status, 403, `Expected 403, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /permission/i);
    }
  );

  await executeTest(
    "1.7 Role Boundary: Citizen cannot submit research proposals (HTTP 403 Forbidden)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: {
          challengeId: "chal_1",
          title: "Citizen Solution Draft",
          abstract: "Citizen trying to submit academic proposal.",
          methodology: "Testing citizen submission gate.",
          budget: 50000,
          universityName: "Self",
        },
        token: citizenToken,
        csrf: csrfToken,
      });
      const res = await proposalsPOST(req);
      assert.equal(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
    }
  );

  await executeTest(
    "1.8 Role Boundary: University PI cannot access Gov admin routes (HTTP 403 Forbidden)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/admin/pending-users", {
        token: universityToken,
      });
      const res = await pendingUsersGET(req);
      assert.equal(res.status, 403, `Expected 403, got ${res.status}`);
    }
  );

  await executeTest(
    "1.9 Role Boundary: Industry user cannot submit academic proposals (HTTP 403 Forbidden)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: {
          challengeId: "chal_1",
          title: "Corporate Solution Draft",
          abstract: "Corporate trying to submit academic proposal.",
          methodology: "Testing corporate proposal gate.",
          budget: 500000,
          universityName: "Corporate R&D",
        },
        token: industryToken,
        csrf: csrfToken,
      });
      const res = await proposalsPOST(req);
      assert.equal(res.status, 403, `Expected 403, got ${res.status}`);
    }
  );

  await executeTest(
    "1.10 Role Boundary: University user cannot commit CSR funds (HTTP 403 Forbidden)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: {
          proposalId: "prop_1",
          amount: 500000,
          type: "CSR",
          corporateName: "Academic Lab",
        },
        token: universityToken,
        csrf: csrfToken,
      });
      const res = await fundsPOST(req);
      assert.equal(res.status, 403, `Expected 403, got ${res.status}`);
    }
  );

  await executeTest(
    "1.11 Account Status Gate: Pending Industry user rejected from authenticated routes (HTTP 403)",
    1,
    async () => {
      const req = makeRequest("http://localhost:3000/api/users/profile", {
        token: pendingIndustryToken,
      });
      const res = await userProfileGET(req);
      assert.equal(res.status, 403, `Expected 403 for PENDING status, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /pending|not active/i);
    }
  );

  // ---------------------------------------------------------------------------
  // TIER 2: ACCOUNT LOCKOUT, RATE LIMITING & CSRF VALIDATION
  // ---------------------------------------------------------------------------
  console.log("\n--- TIER 2: Account Lockout, Rate Limiting & CSRF Validation ---");

  await executeTest(
    "2.1 Account Lockout: 5 consecutive failed logins triggers 30-min lockout (HTTP 423)",
    2,
    async () => {
      const testEmail = `lockout.test.${Date.now()}@tatasteel.com`;
      const correctPassword = "CorrectPassword123!";
      const wrongPassword = "WrongPassword999!";

      // Create test user in DB
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hashPassword(correctPassword),
          role: UserRole.INDUSTRY,
          status: UserStatus.ACTIVE,
          name: "Lockout Test Subject",
          failedLoginAttempts: 0,
        },
      });
      cleanupUserIds.push(testUser.id);

      // Attempt 1 through 4: Should return 401 with remaining attempts warning
      for (let attempt = 1; attempt <= 4; attempt++) {
        const req = makeRequest("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: { email: testEmail, password: wrongPassword },
          ip: "192.168.10.50",
        });
        const res = await loginPOST(req);
        assert.equal(res.status, 401, `Attempt ${attempt} should return 401`);
        const json = await res.json();
        assert.equal(json.attemptsRemaining, 5 - attempt);
      }

      // Attempt 5: Triggers account lockout -> HTTP 423 Locked
      const req5 = makeRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: testEmail, password: wrongPassword },
        ip: "192.168.10.50",
      });
      const res5 = await loginPOST(req5);
      assert.equal(res5.status, 423, `Attempt 5 should trigger lockout (423), got ${res5.status}`);
      const json5 = await res5.json();
      assert.match(json5.error, /Account Locked/i);

      // Verify DB record status updated to LOCKED and lockoutUntil set
      const dbUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      assert.equal(dbUser!.status, UserStatus.LOCKED);
      assert.ok(dbUser!.lockoutUntil !== null, "lockoutUntil must be set");
      assert.ok(new Date(dbUser!.lockoutUntil!).getTime() > Date.now() + 25 * 60 * 1000);
    }
  );

  await executeTest(
    "2.2 Rate Limiting: 11th request within 1-minute sliding window returns HTTP 429",
    2,
    async () => {
      const testIp = `172.16.88.${Math.floor(Math.random() * 200 + 10)}`;

      // Requests 1 through 10 must pass
      for (let i = 1; i <= 10; i++) {
        const result = checkRateLimit(testIp, 10, 60000);
        assert.equal(result.allowed, true, `Request ${i} should be allowed`);
      }

      // Request 11 must be blocked
      const result11 = checkRateLimit(testIp, 10, 60000);
      assert.equal(result11.allowed, false, "Request 11 should be blocked by rate limiter");
      assert.ok(result11.retryAfterSeconds > 0, "retryAfterSeconds must be positive");

      // Verify at API route level with login endpoint
      const reqBlocked = makeRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: "somebody@example.com", password: "Password123!" },
        ip: testIp,
      });
      const resBlocked = await loginPOST(reqBlocked);
      assert.equal(resBlocked.status, 429, `Expected HTTP 429 on rate limit, got ${resBlocked.status}`);
    }
  );

  await executeTest(
    "2.3 CSRF Validation: State-changing request without CSRF token returns HTTP 403",
    2,
    async () => {
      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "CSRF Test Challenge",
          description: "Testing state-changing CSRF protection without token.",
          domain: "Water Management",
          district: "Ranchi",
          location: "Ranchi",
        },
        // Missing CSRF token
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 403, `Expected 403 Forbidden for missing CSRF, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /CSRF/i);
    }
  );

  await executeTest(
    "2.4 CSRF Validation: Request with forged/tampered CSRF token returns HTTP 403",
    2,
    async () => {
      const forgedToken = "forged.csrf.signature.token";
      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Forged CSRF Test Challenge",
          description: "Testing state-changing CSRF protection with forged token.",
          domain: "Water Management",
          district: "Ranchi",
          location: "Ranchi",
        },
        csrf: forgedToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 403, `Expected 403 Forbidden for forged CSRF, got ${res.status}`);
    }
  );

  await executeTest(
    "2.5 CSRF Validation: Request with valid cryptographic token is permitted",
    2,
    async () => {
      const validToken = generateCsrfToken();
      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Valid CSRF Test Challenge",
          description: "Testing valid CSRF token acceptance across challenge intake.",
          domain: "Water Management",
          district: "Ranchi",
          location: "Ranchi Town Center",
          urgency: "LOW",
        },
        csrf: validToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 201, `Expected 201 Created with valid CSRF, got ${res.status}`);
      const json = await res.json();
      if (json.challenge?.id) {
        // Cleanup
        await prisma.auditLog.deleteMany({ where: { challengeId: json.challenge.id } });
        await prisma.challenge.delete({ where: { id: json.challenge.id } });
      }
    }
  );

  // ---------------------------------------------------------------------------
  // CLEANUP TEST FIXTURES
  // ---------------------------------------------------------------------------
  console.log("\n--- Cleaning up temporary RBAC test fixtures ---");
  if (cleanupUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: cleanupUserIds } },
    });
    console.log(`  ✓ Purged ${cleanupUserIds.length} temporary test users from database.`);
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const pending = results.filter((r) => r.status === "PENDING").length;

  console.log("\n===============================================================================");
  console.log(`RBAC SECURITY SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED | ${pending} PENDING | ${results.length} TOTAL`);
  console.log("===============================================================================\n");

  return {
    suiteName: "e2e-rbac-security",
    passed,
    failed,
    pending,
    total: results.length,
    results,
  };
}

// Standalone execution wrapper
if (typeof process !== "undefined" && process.argv[1]?.includes("e2e-rbac-security")) {
  runRbacSecuritySuite().then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  });
}
