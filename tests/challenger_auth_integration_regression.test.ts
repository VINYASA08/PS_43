import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  signTempToken,
  resetFailedLogins,
  SessionPayload,
} from "../src/lib/auth";
import { generateTOTP, verifyTOTP } from "../src/lib/totp";
import { createAndStoreOtp } from "../src/lib/otp";
import { generateCsrfToken } from "../src/lib/csrf";
import { UserRole, UserStatus } from "../src/lib/types";

// Target Route Handlers
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as verifyOtpPOST } from "../src/app/api/auth/verify-otp/route";
import { POST as totpSetupPOST } from "../src/app/api/auth/totp-setup/route";
import { POST as totpVerifyPOST } from "../src/app/api/auth/totp-verify/route";
import { GET as pendingUsersGET } from "../src/app/api/admin/pending-users/route";
import { GET as auditLogsGET } from "../src/app/api/audit-logs/route";

console.log("===============================================================================");
console.log("CHALLENGER 2: EMPIRICAL AUTH INTEGRATION & REGRESSION STRESS TEST SUITE");
console.log("Target Component: web/src/app/login/page.tsx & Auth API Routes");
console.log("===============================================================================\n");

let passedCount = 0;
let failedCount = 0;
const failures: { name: string; error: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Details: ${err.message}`);
    failures.push({ name, error: err.message });
    failedCount++;
  }
}

// Helper to construct NextRequest with cookies, headers, and body
function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    sessionToken?: string;
    tempToken?: string;
    csrfToken?: string;
    ip?: string;
  } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  const cookieParts: string[] = [];
  if (options.sessionToken) {
    cookieParts.push(`sih_session=${options.sessionToken}`);
  }
  if (options.csrfToken) {
    cookieParts.push(`sih_csrf=${options.csrfToken}`);
    headers["x-csrf-token"] = options.csrfToken;
  }
  if (cookieParts.length > 0) {
    headers["cookie"] = cookieParts.join("; ");
  }

  if (options.ip) {
    headers["x-forwarded-for"] = options.ip;
  }

  const init: any = {
    method: options.method || "POST",
    headers,
  };

  if (options.body) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

async function main() {
  const CSRF_TOKEN = generateCsrfToken();
  const LOGIN_PAGE_PATH = path.resolve(__dirname, "../src/app/login/page.tsx");

  // Ensure Gov seed persona has pristine secret and status before tests begin
  await prisma.user.updateMany({
    where: { email: "nodal.innovation@jharkhand.gov.in" },
    data: {
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      twoFactorEnabled: true,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      lockoutUntil: null,
    },
  });

  // ===========================================================================
  // SECTION 1: LOGIN COMPONENT SOURCE & CONTRACT PRESERVATION AUDIT
  // ===========================================================================

  console.log("--- Section 1: Login Page Source & Auth Logic Preservation ---");

  await test("1.1 Login page file exists and contains 'use client'", async () => {
    assert.ok(fs.existsSync(LOGIN_PAGE_PATH), `File not found: ${LOGIN_PAGE_PATH}`);
    const source = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
    assert.ok(source.startsWith('"use client";'), "Must begin with 'use client'; directive");
  });

  await test("1.2 Login page includes all 5 Quick Demo persona definitions and handlers", async () => {
    const source = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
    assert.ok(source.includes('handleQuickDemoLogin("citizen")'), "Missing citizen quick persona trigger");
    assert.ok(source.includes('handleQuickDemoLogin("university")'), "Missing university quick persona trigger");
    assert.ok(source.includes('handleQuickDemoLogin("industry")'), "Missing industry quick persona trigger");
    assert.ok(source.includes('handleQuickDemoLogin("industry_pending")'), "Missing industry_pending quick persona trigger");
    assert.ok(source.includes('handleQuickDemoLogin("gov")'), "Missing gov quick persona trigger");
  });

  await test("1.3 Quick demo persona credentials in login page match backend specification", async () => {
    const source = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
    // Verify phone and emails
    assert.ok(source.includes("+919708099999"), "Citizen phone must be +919708099999");
    assert.ok(source.includes("pi.water@iitism.ac.in"), "University email must be pi.water@iitism.ac.in");
    assert.ok(source.includes("csr.director@tatasteel.com"), "Industry email must be csr.director@tatasteel.com");
    assert.ok(source.includes("csr.lead@coalindia.in"), "Pending Industry email must be csr.lead@coalindia.in");
    assert.ok(source.includes("nodal.innovation@jharkhand.gov.in"), "Gov email must be nodal.innovation@jharkhand.gov.in");
    assert.ok(source.includes("Jharkhand@2026!"), "Password must match standard seed Jharkhand@2026!");
  });

  await test("1.4 Login form micro-interactions, password toggle, and error shake present", async () => {
    const source = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
    assert.ok(source.includes("showPassword"), "Missing showPassword state toggle");
    assert.ok(source.includes("<EyeOff"), "Missing EyeOff toggle icon");
    assert.ok(source.includes("<Eye"), "Missing Eye toggle icon");
    assert.ok(source.includes("type={showPassword ? \"text\" : \"password\"}"), "Password input must switch types dynamically");
    assert.ok(source.includes("animate={errorMessage ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}"), "Missing Framer Motion error shake animation");
  });

  await test("1.5 SSO OAuth buttons trigger sandbox toast notification", async () => {
    const source = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
    assert.ok(source.includes('triggerSsoToast("Google")'), "Google SSO button must call triggerSsoToast");
    assert.ok(source.includes('triggerSsoToast("Microsoft")'), "Microsoft SSO button must call triggerSsoToast");
    assert.ok(source.includes('triggerSsoToast("DigiLocker")'), "DigiLocker SSO button must call triggerSsoToast");
    assert.ok(source.includes("AnimatePresence"), "Toast must use Framer Motion AnimatePresence");
  });

  // ===========================================================================
  // SECTION 2: VERIFY ALL 5 DEMO PERSONAS AGAINST PRISMA BACKEND DATABASE
  // ===========================================================================
  console.log("\n--- Section 2: Backend Database Verification of All 5 Personas ---");

  let citizenDbUser: any = null;
  let universityDbUser: any = null;
  let industryDbUser: any = null;
  let pendingIndustryDbUser: any = null;
  let govDbUser: any = null;

  await test("2.1 Verify Persona 1 (Citizen: +919708099999) exists and is ACTIVE", async () => {
    citizenDbUser = await prisma.user.findUnique({ where: { phone: "+919708099999" } });
    assert.ok(citizenDbUser, "Citizen user (+919708099999) must exist in DB");
    assert.equal(citizenDbUser.role, "CITIZEN");
    assert.equal(citizenDbUser.status, "ACTIVE");
  });

  await test("2.2 Verify Persona 2 (University: pi.water@iitism.ac.in) exists with valid password", async () => {
    universityDbUser = await prisma.user.findUnique({ where: { email: "pi.water@iitism.ac.in" } });
    assert.ok(universityDbUser, "University user must exist in DB");
    assert.equal(universityDbUser.role, "UNIVERSITY");
    assert.equal(universityDbUser.status, "ACTIVE");
    const valid = await verifyPassword("Jharkhand@2026!", universityDbUser.passwordHash);
    assert.ok(valid, "Password hash must match 'Jharkhand@2026!'");
  });

  await test("2.3 Verify Persona 3 (Industry: csr.director@tatasteel.com) exists with valid password", async () => {
    industryDbUser = await prisma.user.findUnique({ where: { email: "csr.director@tatasteel.com" } });
    assert.ok(industryDbUser, "Industry user must exist in DB");
    assert.equal(industryDbUser.role, "INDUSTRY");
    assert.equal(industryDbUser.status, "ACTIVE");
    const valid = await verifyPassword("Jharkhand@2026!", industryDbUser.passwordHash);
    assert.ok(valid, "Password hash must match 'Jharkhand@2026!'");
  });

  await test("2.4 Verify Persona 4 (Industry Pending: csr.lead@coalindia.in) has status PENDING", async () => {
    pendingIndustryDbUser = await prisma.user.findUnique({ where: { email: "csr.lead@coalindia.in" } });
    assert.ok(pendingIndustryDbUser, "Pending Industry user must exist in DB");
    assert.equal(pendingIndustryDbUser.role, "INDUSTRY");
    assert.equal(pendingIndustryDbUser.status, "PENDING");
    const valid = await verifyPassword("Jharkhand@2026!", pendingIndustryDbUser.passwordHash);
    assert.ok(valid, "Password hash must match 'Jharkhand@2026!'");
  });

  await test("2.5 Verify Persona 5 (Gov: nodal.innovation@jharkhand.gov.in) exists with TOTP secret", async () => {
    govDbUser = await prisma.user.findUnique({ where: { email: "nodal.innovation@jharkhand.gov.in" } });
    assert.ok(govDbUser, "Gov user must exist in DB");
    assert.equal(govDbUser.role, "GOV");
    assert.equal(govDbUser.status, "ACTIVE");
    assert.equal(govDbUser.twoFactorSecret, "JBSWY3DPEHPK3PXP");
    const valid = await verifyPassword("Jharkhand@2026!", govDbUser.passwordHash);
    assert.ok(valid, "Password hash must match 'Jharkhand@2026!'");
  });

  // ===========================================================================
  // SECTION 3: CREDENTIALS SUBMISSION TO /api/auth/login FOR ALL PERSONAS
  // ===========================================================================
  console.log("\n--- Section 3: Credentials Submission to /api/auth/login ---");

  await test("3.1 Quick Demo Citizen: POST /api/auth/login with phone returns OTP dispatch response", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { phone: "+919708099999" },
      ip: "10.10.1.1",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.requireOtp, true);
    assert.equal(json.identifier, "+919708099999");
  });

  await test("3.2 Quick Demo University: POST /api/auth/login authenticates and sets session cookie", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "pi.water@iitism.ac.in", password: "Jharkhand@2026!" },
      ip: "10.10.1.2",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "UNIVERSITY");
    assert.equal(json.user.status, "ACTIVE");
    assert.equal(json.redirectUrl, "/dashboard/university");

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie?.includes("sih_session="), "Must set sih_session cookie");
  });

  await test("3.3 Quick Demo Industry: POST /api/auth/login authenticates and redirects to /dashboard/industry", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "csr.director@tatasteel.com", password: "Jharkhand@2026!" },
      ip: "10.10.1.3",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "INDUSTRY");
    assert.equal(json.redirectUrl, "/dashboard/industry");
  });

  await test("3.4 Quick Demo Industry Pending: POST /api/auth/login returns HTTP 403 PENDING gate", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "csr.lead@coalindia.in", password: "Jharkhand@2026!" },
      ip: "10.10.1.4",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 403, `Expected HTTP 403, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.status, "PENDING");
    assert.ok(json.error.includes("Account pending administrator approval"));
  });

  await test("3.5 Quick Demo Gov: POST /api/auth/login authenticates and redirects to /dashboard/gov", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "nodal.innovation@jharkhand.gov.in", password: "Jharkhand@2026!" },
      ip: "10.10.1.5",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "GOV");
    assert.equal(json.redirectUrl, "/dashboard/gov");
  });

  // ===========================================================================
  // SECTION 4: INVALID CREDENTIALS & ERROR STATES (HTTP 401 & 400)
  // ===========================================================================
  console.log("\n--- Section 4: Invalid Credentials & Error Handling (HTTP 401) ---");

  await test("4.1 Missing credentials returns HTTP 400 Bad Request", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "pi.water@iitism.ac.in" }, // Missing password
      ip: "10.10.2.1",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 400, `Expected HTTP 400, got ${res.status}`);
  });

  await test("4.2 Non-existent user returns HTTP 401 Invalid credentials", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: "nonexistent.user.2026@jharkhand.gov.in", password: "Jharkhand@2026!" },
      ip: "10.10.2.2",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Invalid email address or password.");
  });

  await test("4.3 Incorrect password for real account returns HTTP 401 with remaining attempts count", async () => {
    // Use an isolated temporary user to avoid affecting seed users
    const tempEmail = `adversarial.check.${Date.now()}@iitism.ac.in`;
    const tempUser = await prisma.user.create({
      data: {
        email: tempEmail,
        passwordHash: await hashPassword("CorrectSecret123!"),
        name: "Temporary Checker",
        role: "UNIVERSITY",
        status: "ACTIVE",
      },
    });

    try {
      const req = createMockRequest("http://localhost:3000/api/auth/login", {
        body: { email: tempEmail, password: "WrongSecretPassword!" },
        ip: "10.10.2.3",
      });
      const res = await loginPOST(req);
      assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
      const json = await res.json();
      assert.equal(json.error, "Invalid email address or password.");
      assert.equal(json.attemptsRemaining, 4);
    } finally {
      await prisma.user.delete({ where: { id: tempUser.id } });
    }
  });

  // ===========================================================================
  // SECTION 5: ACCOUNT LOCKOUT RESILIENCE (HTTP 423)
  // ===========================================================================
  console.log("\n--- Section 5: Account Lockout Resilience (HTTP 423) ---");

  const lockoutTestEmail = `lockout.victim.${Date.now()}@jharkhand.gov.in`;
  const lockoutTestUser = await prisma.user.create({
    data: {
      email: lockoutTestEmail,
      passwordHash: await hashPassword("Jharkhand@2026!"),
      name: "Lockout Test Official",
      role: "GOV",
      status: "ACTIVE",
    },
  });

  await test("5.1 5 consecutive incorrect passwords triggers HTTP 423 Locked", async () => {
    // Attempts 1 through 4
    for (let i = 1; i <= 4; i++) {
      const req = createMockRequest("http://localhost:3000/api/auth/login", {
        body: { email: lockoutTestEmail, password: "IncorrectPassword!" },
        ip: `10.10.3.${i}`,
      });
      const res = await loginPOST(req);
      assert.equal(res.status, 401, `Attempt ${i}: Expected HTTP 401, got ${res.status}`);
    }

    // 5th attempt -> Should lock
    const req5 = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: lockoutTestEmail, password: "IncorrectPassword!" },
      ip: "10.10.3.5",
    });
    const res5 = await loginPOST(req5);
    assert.equal(res5.status, 423, `5th attempt: Expected HTTP 423, got ${res5.status}`);
    const json5 = await res5.json();
    assert.equal(json5.error, "Account Locked");
    assert.equal(json5.remainingMinutes, 30);

    const dbRecord = await prisma.user.findUnique({ where: { id: lockoutTestUser.id } });
    assert.equal(dbRecord?.status, "LOCKED");
    assert.equal(dbRecord?.failedLoginAttempts, 5);
    assert.ok(dbRecord?.lockoutUntil !== null, "lockoutUntil timestamp must be set");
  });

  await test("5.2 6th attempt with CORRECT credentials during lockout returns HTTP 423 Locked", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: lockoutTestEmail, password: "Jharkhand@2026!" }, // Correct password
      ip: "10.10.3.6",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 423, `Expected HTTP 423 even with correct password, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Account Locked");
    assert.ok(json.remainingMinutes >= 1);
  });

  await test("5.3 Admin reset restores account to ACTIVE and permits login", async () => {
    await resetFailedLogins(lockoutTestUser.id);
    const dbRecord = await prisma.user.findUnique({ where: { id: lockoutTestUser.id } });
    assert.equal(dbRecord?.status, "ACTIVE");
    assert.equal(dbRecord?.failedLoginAttempts, 0);
    assert.equal(dbRecord?.lockoutUntil, null);

    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { email: lockoutTestEmail, password: "Jharkhand@2026!" },
      ip: "10.10.3.7",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200 after reset, got ${res.status}`);
  });

  // Clean up lockout fixture
  await prisma.user.delete({ where: { id: lockoutTestUser.id } });

  // ===========================================================================
  // SECTION 6: SMS / WHATSAPP OTP ENDPOINTS CONTRACT INTEGRITY
  // ===========================================================================
  console.log("\n--- Section 6: SMS OTP Endpoints Contract Integrity ---");

  const testCitizenPhone = "+919708" + Math.floor(100000 + Math.random() * 900000);
  let generatedOtp = "";

  await test("6.1 Citizen login initiates OTP generation via /api/auth/login", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/login", {
      body: { phone: testCitizenPhone },
      ip: "10.10.4.1",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.requireOtp, true);

    // Generate known OTP for testing verify endpoint
    generatedOtp = createAndStoreOtp(testCitizenPhone, "login");
    assert.equal(generatedOtp.length, 6, "OTP must be 6 digits");
  });

  await test("6.2 POST /api/auth/verify-otp without parameters returns HTTP 400", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/verify-otp", {
      body: {},
      ip: "10.10.4.2",
    });
    const res = await verifyOtpPOST(req);
    assert.equal(res.status, 400, `Expected HTTP 400, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "Missing identifier or OTP code.");
  });

  await test("6.3 POST /api/auth/verify-otp with incorrect OTP returns HTTP 401", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/verify-otp", {
      body: { identifier: testCitizenPhone, otp: "000000" },
      ip: "10.10.4.3",
    });
    const res = await verifyOtpPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
  });

  await test("6.4 POST /api/auth/verify-otp with valid OTP authenticates and sets session cookie", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/verify-otp", {
      body: { identifier: testCitizenPhone, otp: generatedOtp },
      ip: "10.10.4.4",
    });
    const res = await verifyOtpPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "CITIZEN");
    assert.equal(json.redirectUrl, "/submit");

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie?.includes("sih_session="), "Must set sih_session cookie");
  });

  // Clean up test citizen phone user
  await prisma.user.deleteMany({ where: { phone: testCitizenPhone } });

  // ===========================================================================
  // SECTION 7: TOTP 2FA ENDPOINTS CONTRACT INTEGRITY
  // ===========================================================================
  console.log("\n--- Section 7: TOTP 2FA Endpoints Contract Integrity ---");

  // Ensure Gov user has original seed secret restored
  await prisma.user.update({
    where: { id: govDbUser.id },
    data: { twoFactorSecret: "JBSWY3DPEHPK3PXP" },
  });

  const govUserSessionPayload: SessionPayload = {
    userId: govDbUser.id,
    email: govDbUser.email,
    name: govDbUser.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  };
  const govSessionToken = await signSessionToken(govUserSessionPayload);

  // Dedicated test user for TOTP setup to avoid modifying seed personas
  const totpSetupTestEmail = `totp.setup.test.${Date.now()}@jharkhand.gov.in`;
  const totpSetupUser = await prisma.user.create({
    data: {
      email: totpSetupTestEmail,
      passwordHash: await hashPassword("Jharkhand@2026!"),
      name: "TOTP Setup Tester",
      role: "GOV",
      status: "ACTIVE",
    },
  });
  const totpSetupSessionToken = await signSessionToken({
    userId: totpSetupUser.id,
    email: totpSetupUser.email,
    name: totpSetupUser.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  });

  let newSetupSecret = "";

  await test("7.1 POST /api/auth/totp-setup returns Base32 secret, manualEntryKey, and QR code", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/totp-setup", {
      sessionToken: totpSetupSessionToken,
      csrfToken: CSRF_TOKEN,
      ip: "10.10.5.1",
    });
    const res = await totpSetupPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.ok(json.secret, "Response must include secret");
    assert.ok(json.manualEntryKey, "Response must include manualEntryKey");
    assert.ok(json.qrCodeUrl?.startsWith("data:image/png;base64,"), "Must include QR code data URL");
    assert.equal(json.issuer, "Jharkhand State Innovation Council");
    newSetupSecret = json.secret;
  });

  await test("7.2 POST /api/auth/totp-verify without code returns HTTP 400", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: "" },
      sessionToken: govSessionToken,
      csrfToken: CSRF_TOKEN,
      ip: "10.10.5.2",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 400, `Expected HTTP 400, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.error, "A valid 6-digit authenticator code is required.");
  });

  await test("7.3 POST /api/auth/totp-verify unauthenticated returns HTTP 401", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: "123456" }, // No session token and no tempToken
      ip: "10.10.5.3",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
  });

  await test("7.4 POST /api/auth/totp-verify with wrong 6-digit code returns HTTP 401", async () => {
    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: "000000" },
      sessionToken: govSessionToken,
      csrfToken: CSRF_TOKEN,
      ip: "10.10.5.4",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    const json = await res.json();
    assert.ok(json.error.includes("Invalid 6-digit authenticator code"));
  });

  await test("7.5 POST /api/auth/totp-verify with mathematically valid TOTP code succeeds (HTTP 200)", async () => {
    // Generate valid TOTP from seed secret "JBSWY3DPEHPK3PXP"
    const validCode = generateTOTP("JBSWY3DPEHPK3PXP");
    assert.equal(validCode.length, 6, "TOTP must be 6 digits");

    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: validCode },
      sessionToken: govSessionToken,
      csrfToken: CSRF_TOKEN,
      ip: "10.10.5.5",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.role, "GOV");
    assert.equal(json.redirectUrl, "/dashboard/gov");

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie?.includes("sih_session="), "Must set sih_session cookie");
  });

  await test("7.6 POST /api/auth/totp-verify via tempToken (2FA login step) succeeds", async () => {
    const tempToken = await signTempToken({ userId: govDbUser.id, email: govDbUser.email, scope: "2fa" });
    const validCode = generateTOTP("JBSWY3DPEHPK3PXP");

    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: validCode, tempToken },
      ip: "10.10.5.6",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200 via tempToken, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.user.email, govDbUser.email);
  });

  await test("7.7 Newly configured 2FA secret can be verified to complete setup", async () => {
    const validCode = generateTOTP(newSetupSecret);
    const req = createMockRequest("http://localhost:3000/api/auth/totp-verify", {
      body: { code: validCode },
      sessionToken: totpSetupSessionToken,
      csrfToken: CSRF_TOKEN,
      ip: "10.10.5.7",
    });
    const res = await totpVerifyPOST(req);
    assert.equal(res.status, 200, `Expected HTTP 200 for new setup verification, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, true);

    const updatedUser = await prisma.user.findUnique({ where: { id: totpSetupUser.id } });
    assert.equal(updatedUser?.twoFactorEnabled, true);
  });

  // Clean up dedicated TOTP setup test fixture
  await prisma.user.delete({ where: { id: totpSetupUser.id } });


  await prisma.$disconnect();

  // ===========================================================================
  // SUMMARY REPORT
  // ===========================================================================
  console.log("\n===============================================================================");
  console.log(`EMPIRICAL SUITE SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED | ${passedCount + failedCount} TOTAL`);
  if (failures.length > 0) {
    console.log("\nFailed Tests:");
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.error}`));
  }
  console.log("===============================================================================");

  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("FATAL RUNTIME ERROR:", err);
  process.exit(1);
});
