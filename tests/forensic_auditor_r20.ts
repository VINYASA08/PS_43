/**
 * FORENSIC AUDITOR INDEPENDENT INTEGRITY & RUNTIME SUITE (ROUND 20)
 * 
 * Verifies:
 * 1. Static code forensics on web/src/app/login/page.tsx and GovernmentHeader.tsx
 * 2. Absence of hardcoded responses, mock shortcuts, dummy facade implementations
 * 3. Exact UI tokens, honeycomb background, squared inputs, registration text
 * 4. Runtime & Integration auth validation: verifies seeded database credentials and bcrypt password hashes
 * 5. Authentic role-based routing and redirect validation
 * 6. Live HTTP execution with realistic client IP headers to verify endpoint integrity
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import prisma from "../src/lib/prisma";
import { verifyPassword, signSessionToken } from "../src/lib/auth";
import { UserRole } from "../src/lib/types";

let passedCount = 0;
let failedCount = 0;

function check(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      passedCount++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err: any) {
      failedCount++;
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  };
}

async function runForensicAudit() {
  console.log("\n=======================================================");
  console.log("ROUND 20: FORENSIC INTEGRITY AUDIT SUITE");
  console.log("=======================================================\n");

  const loginFilePath = path.resolve(__dirname, "../src/app/login/page.tsx");
  const headerFilePath = path.resolve(__dirname, "../src/components/layout/GovernmentHeader.tsx");

  assert.ok(fs.existsSync(loginFilePath), "login/page.tsx must exist");
  assert.ok(fs.existsSync(headerFilePath), "GovernmentHeader.tsx must exist");

  const loginSrc = fs.readFileSync(loginFilePath, "utf-8");
  const headerSrc = fs.readFileSync(headerFilePath, "utf-8");

  // ---------------------------------------------------------------------------
  // PHASE 1: STATIC ANALYSIS & ANTI-FACADE FORENSICS
  // ---------------------------------------------------------------------------
  console.log("--- PHASE 1: STATIC ANALYSIS & ANTI-FACADE CHECKS ---");

  await check("1.1 Anti-Facade: No mock response or hardcoded JWT in login/page.tsx", () => {
    assert.ok(!loginSrc.includes("fake-jwt"), "Found fake-jwt placeholder");
    assert.ok(!loginSrc.includes("mock-token"), "Found mock-token placeholder");
    assert.ok(!loginSrc.includes("dummy-token"), "Found dummy-token placeholder");
    // Ensure real fetch to /api/auth/login
    assert.ok(loginSrc.includes('fetch("/api/auth/login"'), "Must perform real fetch to /api/auth/login");
    assert.ok(loginSrc.includes('method: "POST"'), "Must be POST request");
    assert.ok(loginSrc.includes('credentials: "include"'), "Must pass credentials: include for session cookies");
  })();

  await check("1.2 Anti-Shortcut: Fast login executes genuine executeLogin API call", () => {
    assert.ok(loginSrc.includes("executeLogin("), "executeLogin function must exist");
    assert.ok(/executeLogin\s*\(\s*preset\.email/m.test(loginSrc), "Fast login must invoke executeLogin with preset email");
    assert.ok(!loginSrc.includes("router.push(preset.redirect); // skip"), "Fast login must not skip API call");
  })();

  await check("1.3 Anti-Bypass: Role validation strictly enforced", () => {
    assert.ok(loginSrc.includes("data.user?.role !== targetRole"), "Must validate server user role matches requested role");
    assert.ok(loginSrc.includes("Invalid role selected for this account"), "Must reject mismatched roles");
  })();

  await check("1.4 Clean Card & Honeycomb Background Implementation", () => {
    assert.ok(loginSrc.includes("backgroundImage: `url(\"data:image/svg+xml"), "Must have inline SVG honeycomb pattern");
    assert.ok(loginSrc.includes("fill='none' stroke='%23cbd5e1'"), "Pattern stroke must be subtle grey #cbd5e1");
    assert.ok(loginSrc.includes("bg-white border border-slate-200 shadow-sm rounded-md"), "Must have crisp flat white card");
  })();

  await check("1.5 Squared Form Inputs (rounded-sm)", () => {
    assert.ok(loginSrc.includes('id="login-email"'), "Email field must exist with id");
    assert.ok(loginSrc.includes('id="login-password"'), "Password field must exist with id");
    assert.ok(loginSrc.includes('id="login-role"'), "Role field must exist with id");
    const roundedSmMatches = loginSrc.match(/rounded-sm/g);
    assert.ok(roundedSmMatches && roundedSmMatches.length >= 4, "Form fields and buttons must use squared rounded-sm");
    assert.ok(!loginSrc.includes("rounded-2xl"), "Must not use rounded-2xl in login");
    assert.ok(!loginSrc.includes("rounded-3xl"), "Must not use rounded-3xl in login");
    assert.ok(!loginSrc.includes("backdrop-blur"), "Must not use glassmorphic backdrop-blur");
  })();

  await check("1.6 Exact SPOC Registration Text & Semantic Routing", () => {
    const textCheck = loginSrc.includes("Register Now as SPOC") || loginSrc.includes("Don't Have Account? Register Now as SPOC");
    assert.ok(textCheck, "Exact text 'Register Now as SPOC' must be present");
    assert.ok(loginSrc.includes('href="/guidelines"'), "SPOC link must route to /guidelines (no dead '#' links)");
    assert.ok(!loginSrc.includes('href="#"'), "Zero '#' dead-end links allowed in login page");
  })();

  await check("1.7 Header Cleanup & Portal Login Styling", () => {
    assert.ok(headerSrc.includes("bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711]"), "Must have exact Portal Login styling");
    assert.ok(headerSrc.includes('href="/login"'), "Portal Login must route to /login");
    assert.ok(headerSrc.includes('data-testid="indian-tricolor-banner"'), "Tricolor banner must be preserved");
    assert.ok(headerSrc.includes("<UtilityBar />"), "UtilityBar must be preserved");
    assert.ok(headerSrc.includes("https://india.gov.in"), "National Portal link must be preserved");
  })();

  // ---------------------------------------------------------------------------
  // PHASE 2: RUNTIME & INTEGRATION AUTH VALIDATION (DATABASE CREDENTIALS)
  // ---------------------------------------------------------------------------
  console.log("\n--- PHASE 2: RUNTIME & INTEGRATION AUTH VALIDATION ---");

  await check("2.1 Database Credential Verification: Gov Nodal Officer", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "nodal.innovation@jharkhand.gov.in" },
    });
    assert.ok(user, "Gov user nodal.innovation@jharkhand.gov.in must exist in database");
    assert.equal(user.role, "GOV", "User role must be GOV");
    assert.equal(user.status, "ACTIVE", "User status must be ACTIVE");
    
    const isValid = await verifyPassword("Jharkhand@2026!", user.passwordHash);
    assert.ok(isValid, "Password 'Jharkhand@2026!' must verify against user's bcrypt hash");

    const isBadValid = await verifyPassword("WrongPassword!", user.passwordHash);
    assert.ok(!isBadValid, "Wrong password must be rejected");
  })();

  await check("2.2 Database Credential Verification: University SPOC", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "pi.water@iitism.ac.in" },
    });
    assert.ok(user, "University user pi.water@iitism.ac.in must exist in database");
    assert.equal(user.role, "UNIVERSITY", "User role must be UNIVERSITY");
    assert.equal(user.status, "ACTIVE", "User status must be ACTIVE");
    
    const isValid = await verifyPassword("Jharkhand@2026!", user.passwordHash);
    assert.ok(isValid, "Password 'Jharkhand@2026!' must verify against user's bcrypt hash");
  })();

  await check("2.3 Database Credential Verification: Industry Partner", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "csr.director@tatasteel.com" },
    });
    assert.ok(user, "Industry user csr.director@tatasteel.com must exist in database");
    assert.equal(user.role, "INDUSTRY", "User role must be INDUSTRY");
    assert.equal(user.status, "ACTIVE", "User status must be ACTIVE");
    
    const isValid = await verifyPassword("Jharkhand@2026!", user.passwordHash);
    assert.ok(isValid, "Password 'Jharkhand@2026!' must verify against user's bcrypt hash");
  })();

  await check("2.4 Session Token Creation & Claims Integrity for all 3 personas", async () => {
    const personas = [
      { email: "nodal.innovation@jharkhand.gov.in", role: UserRole.GOV },
      { email: "pi.water@iitism.ac.in", role: UserRole.UNIVERSITY },
      { email: "csr.director@tatasteel.com", role: UserRole.INDUSTRY },
    ];

    for (const p of personas) {
      const dbUser = await prisma.user.findUnique({ where: { email: p.email } });
      assert.ok(dbUser);
      const token = await signSessionToken({
        userId: dbUser.id,
        email: dbUser.email,
        phone: dbUser.phone,
        name: dbUser.name,
        role: dbUser.role as UserRole,
        status: dbUser.status as any,
        district: dbUser.district,
        organization: dbUser.organization,
      });
      assert.ok(token && typeof token === "string" && token.length > 50, `Token must be a valid JWT for ${p.email}`);
    }
  })();

  // ---------------------------------------------------------------------------
  // PHASE 3: LIVE HTTP API VERIFICATION (/api/auth/login)
  // ---------------------------------------------------------------------------
  console.log("\n--- PHASE 3: LIVE HTTP API VERIFICATION (/api/auth/login) ---");

  await check("3.1 Live API: Gov Nodal Officer Login Endpoint", async () => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.20.1.1",
      },
      body: JSON.stringify({
        email: "nodal.innovation@jharkhand.gov.in",
        password: "Jharkhand@2026!",
      }),
    });
    assert.equal(res.status, 200, "API response status must be 200");
    const data = await res.json();
    assert.ok(data.success, "Response must indicate success: true");
    assert.equal(data.user?.role, "GOV", "Response user role must be GOV");
    assert.equal(data.redirectUrl, "/dashboard/gov", "Redirect URL must be /dashboard/gov");
  })();

  await check("3.2 Live API: University SPOC Login Endpoint", async () => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.20.1.2",
      },
      body: JSON.stringify({
        email: "pi.water@iitism.ac.in",
        password: "Jharkhand@2026!",
      }),
    });
    assert.equal(res.status, 200, "API response status must be 200");
    const data = await res.json();
    assert.ok(data.success, "Response must indicate success: true");
    assert.equal(data.user?.role, "UNIVERSITY", "Response user role must be UNIVERSITY");
    assert.equal(data.redirectUrl, "/dashboard/university", "Redirect URL must be /dashboard/university");
  })();

  await check("3.3 Live API: Industry Partner Login Endpoint", async () => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.20.1.3",
      },
      body: JSON.stringify({
        email: "csr.director@tatasteel.com",
        password: "Jharkhand@2026!",
      }),
    });
    assert.equal(res.status, 200, "API response status must be 200");
    const data = await res.json();
    assert.ok(data.success, "Response must indicate success: true");
    assert.equal(data.user?.role, "INDUSTRY", "Response user role must be INDUSTRY");
    assert.equal(data.redirectUrl, "/dashboard/industry", "Redirect URL must be /dashboard/industry");
  })();

  await check("3.4 Live API: Rejection of Invalid Credentials (401)", async () => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.20.1.4",
      },
      body: JSON.stringify({
        email: "nodal.innovation@jharkhand.gov.in",
        password: "IncorrectPassword123!",
      }),
    });
    assert.equal(res.status, 401, "API must return 401 for incorrect password");
    const data = await res.json();
    assert.ok(data.error, "Error message must be present");
  })();

  await check("3.5 Live API: Rejection of Non-Existent User (401)", async () => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.20.1.5",
      },
      body: JSON.stringify({
        email: "nonexistent.user@randomdomain.org",
        password: "SomePassword123!",
      }),
    });
    assert.equal(res.status, 401, "API must return 401 for non-existent user");
  })();

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log("ROUND 20 FORENSIC AUDIT SUMMARY");
  console.log("=======================================================");
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.error("\n❌ VERDICT: INTEGRITY VIOLATION DETECTED");
    process.exit(1);
  } else {
    console.log("\n✅ VERDICT: CLEAN — ALL FORENSIC INTEGRITY CHECKS PASSED");
    process.exit(0);
  }
}

runForensicAudit().catch((err) => {
  console.error("Fatal error during forensic audit execution:", err);
  process.exit(1);
});
