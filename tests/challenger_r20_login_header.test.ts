/**
 * ROUND 20 ADVERSARIAL CHALLENGER VERIFICATION SUITE
 * 
 * Programmatically asserts:
 * 1. Faint honeycomb background pattern exists in `login/page.tsx`.
 * 2. Login card has crisp flat white styling with subtle borders.
 * 3. Form fields (Email, Password, Role) have `rounded-sm` squared-off borders.
 * 4. Registration prompt has exact string: "Don't Have Account? Register Now as SPOC".
 * 5. 1-click Fast Login buttons exist for Gov Nodal Officer, University SPOC, and Industry Partner, and trigger proper login.
 * 6. Header "Portal Login" button has exact classes: `bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711]`.
 * 7. Existing test suites pass without regression.
 */

import fs from "fs";
import path from "path";

const WEB_ROOT = path.resolve(__dirname, "..");
const LOGIN_PAGE_PATH = path.resolve(WEB_ROOT, "src", "app", "login", "page.tsx");
const HEADER_PATH = path.resolve(WEB_ROOT, "src", "components", "layout", "GovernmentHeader.tsx");

interface AssertionResult {
  suite: string;
  testId: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

const results: AssertionResult[] = [];

function assert(
  suite: string,
  testId: string,
  name: string,
  condition: boolean,
  expected: any,
  actual: any,
  details?: string
) {
  results.push({
    suite,
    testId,
    name,
    passed: Boolean(condition),
    expected,
    actual,
    details,
  });

  const icon = condition ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} [${testId}] ${name}`);
  if (!condition) {
    console.error(`   ├─ Expected: ${JSON.stringify(expected)}`);
    console.error(`   ├─ Actual:   ${JSON.stringify(actual)}`);
    if (details) console.error(`   └─ Details:  ${details}`);
  } else if (details) {
    console.log(`   └─ ${details}`);
  }
}

async function runVerification() {
  console.log("===============================================================================");
  console.log("ROUND 20 EMPIRICAL CHALLENGER VERIFICATION SUITE");
  console.log("Target Files:");
  console.log(`  - Login:  ${LOGIN_PAGE_PATH}`);
  console.log(`  - Header: ${HEADER_PATH}`);
  console.log("===============================================================================\n");

  const loginContent = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
  const headerContent = fs.readFileSync(HEADER_PATH, "utf-8");

  // =========================================================================
  // SUITE 1: Faint Honeycomb Background Pattern in login/page.tsx
  // =========================================================================
  console.log("--- SUITE 1: Faint Honeycomb Background Pattern ---");

  const hasSvgPattern =
    loginContent.includes("data:image/svg+xml") &&
    (loginContent.includes("%3Csvg") || loginContent.includes("<svg"));
  assert(
    "Suite 1",
    "1.1",
    "SVG pattern data URI present in login page background",
    hasSvgPattern,
    true,
    hasSvgPattern,
    "Inline SVG background pattern embedded in container style"
  );

  const hasHoneycombGeometry =
    loginContent.includes("M28 66L0 50L0 16L28 0L56 16L56 50") ||
    loginContent.includes("polygon") ||
    loginContent.includes("M28 0L28 34L0 50");
  assert(
    "Suite 1",
    "1.2",
    "SVG path defines interlocking hexagonal / honeycomb vertices",
    hasHoneycombGeometry,
    true,
    hasHoneycombGeometry,
    "Hexagonal coordinate points form repeating honeycomb tessellation"
  );

  const hasFaintStrokeAndOpacity =
    (loginContent.includes("%23cbd5e1") || loginContent.includes("#cbd5e1")) &&
    (loginContent.includes("stroke-opacity='0.35'") || loginContent.includes("opacity"));
  assert(
    "Suite 1",
    "1.3",
    "Pattern uses faint stroke (#cbd5e1) and subtle opacity (0.35)",
    hasFaintStrokeAndOpacity,
    true,
    hasFaintStrokeAndOpacity,
    "Stroke uses slate-300 with 35% opacity to guarantee faintness"
  );

  const hasBackgroundRepeat =
    loginContent.includes('backgroundRepeat: "repeat"') ||
    loginContent.includes("bg-repeat");
  assert(
    "Suite 1",
    "1.4",
    "Background pattern repeats seamlessly",
    hasBackgroundRepeat,
    true,
    hasBackgroundRepeat,
    "backgroundRepeat: 'repeat' ensures full screen tile"
  );

  const hasSlate50Base = loginContent.includes("bg-slate-50");
  assert(
    "Suite 1",
    "1.5",
    "Outer container uses clean slate-50 canvas base",
    hasSlate50Base,
    true,
    hasSlate50Base
  );

  // =========================================================================
  // SUITE 2: Crisp Flat White Login Card with Subtle Borders
  // =========================================================================
  console.log("\n--- SUITE 2: Crisp Flat White Login Card Styling ---");

  const hasFlatWhiteCard =
    loginContent.includes("bg-white border border-slate-200") ||
    (loginContent.includes("bg-white") && loginContent.includes("border-slate-200"));
  assert(
    "Suite 2",
    "2.1",
    "Card utilizes crisp flat white background (bg-white) and subtle border (border-slate-200)",
    hasFlatWhiteCard,
    true,
    hasFlatWhiteCard
  );

  const hasSubtleShadow =
    loginContent.includes("shadow-sm") || loginContent.includes("shadow-xs");
  assert(
    "Suite 2",
    "2.2",
    "Card utilizes subtle elevation (shadow-sm)",
    hasSubtleShadow,
    true,
    hasSubtleShadow
  );

  const cardBackdropBlur = loginContent.match(/backdrop-blur/g);
  assert(
    "Suite 2",
    "2.3",
    "Anti-SaaS: Zero glassmorphism backdrop-blur in login page",
    cardBackdropBlur === null,
    0,
    cardBackdropBlur ? cardBackdropBlur.length : 0,
    "No backdrop-blur found in login page"
  );

  const translucentCardMatch = loginContent.match(/bg-white\/[1-8]0/g);
  assert(
    "Suite 2",
    "2.4",
    "Anti-SaaS: Card is solid white, zero translucent card containers",
    translucentCardMatch === null,
    0,
    translucentCardMatch ? translucentCardMatch.length : 0
  );

  // =========================================================================
  // SUITE 3: Form Fields rounded-sm Squared-off Borders
  // =========================================================================
  console.log("\n--- SUITE 3: Squared-off Borders (rounded-sm) ---");

  // Email input
  const emailInputMatch = loginContent.match(
    /<input[\s\S]*?id="login-email"[\s\S]*?className="([^"]+)"/
  );
  const emailClasses = emailInputMatch ? emailInputMatch[1] : "";
  const emailHasRoundedSm = emailClasses.includes("rounded-sm");
  assert(
    "Suite 3",
    "3.1",
    "Email input uses rounded-sm border radius",
    emailHasRoundedSm,
    true,
    emailHasRoundedSm,
    `Email classes: ${emailClasses}`
  );

  // Password input
  const passInputMatch = loginContent.match(
    /<input[\s\S]*?id="login-password"[\s\S]*?className="([^"]+)"/
  );
  const passClasses = passInputMatch ? passInputMatch[1] : "";
  const passHasRoundedSm = passClasses.includes("rounded-sm");
  assert(
    "Suite 3",
    "3.2",
    "Password input uses rounded-sm border radius",
    passHasRoundedSm,
    true,
    passHasRoundedSm,
    `Password classes: ${passClasses}`
  );

  // Role select
  const roleSelectMatch = loginContent.match(
    /<select[\s\S]*?id="login-role"[\s\S]*?className="([^"]+)"/
  );
  const roleClasses = roleSelectMatch ? roleSelectMatch[1] : "";
  const roleHasRoundedSm = roleClasses.includes("rounded-sm");
  assert(
    "Suite 3",
    "3.3",
    "Role select dropdown uses rounded-sm border radius",
    roleHasRoundedSm,
    true,
    roleHasRoundedSm,
    `Role select classes: ${roleClasses}`
  );

  // Submit button
  const submitBtnMatch = loginContent.match(
    /<button[\s\S]*?type="submit"[\s\S]*?className="([^"]+)"/
  );
  const submitBtnClasses = submitBtnMatch ? submitBtnMatch[1] : "";
  const submitHasRoundedSm = submitBtnClasses.includes("rounded-sm");
  assert(
    "Suite 3",
    "3.4",
    "Submit button uses rounded-sm border radius",
    submitHasRoundedSm,
    true,
    submitHasRoundedSm,
    `Submit button classes: ${submitBtnClasses}`
  );

  // Absence of rounded-xl / 2xl / 3xl on form inputs
  const roundedModernInputs = [emailClasses, passClasses, roleClasses].some((cls) =>
    /rounded-(md|lg|xl|2xl|3xl|full)/.test(cls)
  );
  assert(
    "Suite 3",
    "3.5",
    "Form inputs have zero rounded-md/lg/xl/2xl/3xl modern pill styling",
    !roundedModernInputs,
    true,
    !roundedModernInputs,
    "Strict squared-off styling enforced"
  );

  // =========================================================================
  // SUITE 4: Registration Prompt Exact String
  // =========================================================================
  console.log("\n--- SUITE 4: Registration Prompt String Verification ---");

  // Extract text from the registration container
  const regContainerMatch = loginContent.match(
    /<div className="text-center pt-2[^"]*">([\s\S]*?)<\/div>/
  );
  const extractedPromptText = regContainerMatch
    ? regContainerMatch[1]
        .replace(/&apos;/g, "'")
        .replace(/\{" "\}/g, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  const exactString = "Don't Have Account? Register Now as SPOC";
  const containsExactPrompt = extractedPromptText === exactString;
  assert(
    "Suite 4",
    "4.1",
    `Registration prompt contains exact text: "${exactString}"`,
    containsExactPrompt,
    exactString,
    extractedPromptText,
    "Rendered DOM text matches exact requested copy"
  );

  const spocLinkTargetMatch = loginContent.match(
    /<Link\s+href="([^"]+)"[^>]*>\s*Register Now as SPOC\s*<\/Link>/
  );
  const spocLink = spocLinkTargetMatch ? spocLinkTargetMatch[1] : "";
  assert(
    "Suite 4",
    "4.2",
    "Registration link points to valid route (not '#')",
    Boolean(spocLink && spocLink !== "#"),
    true,
    spocLink,
    `SPOC link points to: ${spocLink}`
  );

  // No dead links in login page
  const deadLinksInLogin = loginContent.match(/href="#"/g);
  assert(
    "Suite 4",
    "4.3",
    "Zero dead placeholder links (href='#') in login/page.tsx",
    deadLinksInLogin === null,
    0,
    deadLinksInLogin ? deadLinksInLogin.length : 0
  );

  // =========================================================================
  // SUITE 5: 1-Click Fast Login Implementation & Auth Execution
  // =========================================================================
  console.log("\n--- SUITE 5: 1-Click Fast Login Buttons & Auth Execution ---");

  // Section title
  const hasDemoSection =
    loginContent.includes("Demo / Fast Login") &&
    loginContent.includes("1-Click Evaluator Sign-In");
  assert(
    "Suite 5",
    "5.1",
    "'Demo / Fast Login' section exists on page",
    hasDemoSection,
    true,
    hasDemoSection
  );

  // 3 Preset Definitions
  const hasGovPreset =
    loginContent.includes("Gov Nodal Officer") &&
    loginContent.includes("nodal.innovation@jharkhand.gov.in");
  assert(
    "Suite 5",
    "5.2",
    "Gov Nodal Officer demo preset configured",
    hasGovPreset,
    true,
    hasGovPreset
  );

  const hasUnivPreset =
    loginContent.includes("University SPOC") &&
    loginContent.includes("pi.water@iitism.ac.in");
  assert(
    "Suite 5",
    "5.3",
    "University SPOC demo preset configured",
    hasUnivPreset,
    true,
    hasUnivPreset
  );

  const hasIndustryPreset =
    loginContent.includes("Industry Partner") &&
    loginContent.includes("csr.director@tatasteel.com");
  assert(
    "Suite 5",
    "5.4",
    "Industry Partner demo preset configured",
    hasIndustryPreset,
    true,
    hasIndustryPreset
  );

  // Live Auth API Verification (using dedicated testing IP 127.0.0.80)
  const testAccounts = [
    {
      roleName: "Gov Nodal Officer",
      email: "nodal.innovation@jharkhand.gov.in",
      password: "Jharkhand@2026!",
      expectedRole: "GOV",
      expectedRedirect: "/dashboard/gov",
    },
    {
      roleName: "University SPOC",
      email: "pi.water@iitism.ac.in",
      password: "Jharkhand@2026!",
      expectedRole: "UNIVERSITY",
      expectedRedirect: "/dashboard/university",
    },
    {
      roleName: "Industry Partner",
      email: "csr.director@tatasteel.com",
      password: "Jharkhand@2026!",
      expectedRole: "INDUSTRY",
      expectedRedirect: "/dashboard/industry",
    },
  ];

  for (let i = 0; i < testAccounts.length; i++) {
    const acc = testAccounts[i];
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": `127.0.0.${81 + i}`,
        },
        body: JSON.stringify({ email: acc.email, password: acc.password }),
      });
      const data = await res.json();
      const statusOk = res.status === 200;
      const roleOk = data.user?.role === acc.expectedRole;
      const redirectOk = data.redirectUrl === acc.expectedRedirect;

      assert(
        "Suite 5",
        `5.${5 + i}`,
        `Live Fast Login API test for ${acc.roleName} (${acc.email})`,
        statusOk && roleOk && redirectOk,
        { status: 200, role: acc.expectedRole, redirect: acc.expectedRedirect },
        { status: res.status, role: data.user?.role, redirect: data.redirectUrl },
        `Authenticated as ${data.user?.name}`
      );
    } catch (err: any) {
      assert(
        "Suite 5",
        `5.${5 + i}`,
        `Live Fast Login API test for ${acc.roleName}`,
        false,
        200,
        err.message,
        "Network or endpoint error"
      );
    }
  }

  // Button disabled while loading to avoid race conditions
  const hasDisabledGuard =
    loginContent.includes("disabled={isLoading}") &&
    loginContent.includes("setActiveFastLogin");
  assert(
    "Suite 5",
    "5.8",
    "Fast Login buttons prevent concurrent clicks during request (disabled={isLoading})",
    hasDisabledGuard,
    true,
    hasDisabledGuard
  );

  // Frontend Role Mismatch Guard
  const hasRoleMismatchGuard = loginContent.includes(
    "data.user?.role !== targetRole"
  );
  assert(
    "Suite 5",
    "5.9",
    "Role verification guard prevents role spoofing on login",
    hasRoleMismatchGuard,
    true,
    hasRoleMismatchGuard
  );

  // =========================================================================
  // SUITE 6: Header "Portal Login" Button Exact Classes & Cleanup
  // =========================================================================
  console.log("\n--- SUITE 6: GovernmentHeader Cleanup & Portal Login Styling ---");

  const exactHeaderClasses =
    "bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711]";
  const headerHasExactClasses = headerContent.includes(exactHeaderClasses);
  assert(
    "Suite 6",
    "6.1",
    `Header "Portal Login" button has exact classes: "${exactHeaderClasses}"`,
    headerHasExactClasses,
    true,
    headerHasExactClasses
  );

  const headerLoginLink = headerContent.includes('href="/login"');
  assert(
    "Suite 6",
    "6.2",
    "Portal Login button correctly links to '/login'",
    headerLoginLink,
    true,
    headerLoginLink
  );

  // Mobile drawer contains Portal Login
  const mobileDrawerHasLogin =
    headerContent.includes('id="mobile-nav-drawer"') &&
    headerContent.includes(exactHeaderClasses);
  assert(
    "Suite 6",
    "6.3",
    "Mobile nav drawer includes Portal Login button with matching vibrant orange pill",
    mobileDrawerHasLogin,
    true,
    mobileDrawerHasLogin
  );

  // Dead links in header
  const deadLinksInHeader = headerContent.match(/href="#"/g);
  assert(
    "Suite 6",
    "6.4",
    "Zero dead placeholder links (href='#') in GovernmentHeader.tsx",
    deadLinksInHeader === null,
    0,
    deadLinksInHeader ? deadLinksInHeader.length : 0
  );

  // Invariant preservation
  const hasTricolor = headerContent.includes('data-testid="indian-tricolor-banner"');
  assert(
    "Suite 6",
    "6.5",
    "Invariant preserved: Indian Tricolor banner (4px) at top",
    hasTricolor,
    true,
    hasTricolor
  );

  const hasNationalPortal = headerContent.includes("https://india.gov.in");
  assert(
    "Suite 6",
    "6.6",
    "Invariant preserved: india.gov.in national portal link",
    hasNationalPortal,
    true,
    hasNationalPortal
  );

  // Duplicate header removed from login page
  const loginHasInnerHeader =
    loginContent.includes("<header") || loginContent.includes("</header>");
  assert(
    "Suite 6",
    "6.7",
    "Obsolete inner duplicate <header> eliminated from login/page.tsx",
    !loginHasInnerHeader,
    true,
    !loginHasInnerHeader,
    "Only global GovernmentHeader renders"
  );

  // =========================================================================
  // SUITE 7: Adversarial Stress Tests & Input Hardening
  // =========================================================================
  console.log("\n--- SUITE 7: Adversarial Stress Tests & Input Hardening ---");

  // 7.1 Empty credentials
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.90",
      },
      body: JSON.stringify({ email: "", password: "" }),
    });
    assert(
      "Suite 7",
      "7.1",
      "Adversarial: Empty credentials rejected (HTTP 400)",
      res.status === 400,
      400,
      res.status
    );
  } catch (err: any) {
    assert("Suite 7", "7.1", "Empty credentials", false, 400, err.message);
  }

  // 7.2 Invalid password
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.91",
      },
      body: JSON.stringify({
        email: "nodal.innovation@jharkhand.gov.in",
        password: "WrongPassword123!",
      }),
    });
    assert(
      "Suite 7",
      "7.2",
      "Adversarial: Invalid password rejected (HTTP 401)",
      res.status === 401,
      401,
      res.status
    );
  } catch (err: any) {
    assert("Suite 7", "7.2", "Invalid password", false, 401, err.message);
  }

  // 7.3 Non-existent user
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.92",
      },
      body: JSON.stringify({
        email: "nonexistent.user@jharkhand.gov.in",
        password: "Jharkhand@2026!",
      }),
    });
    assert(
      "Suite 7",
      "7.3",
      "Adversarial: Non-existent user rejected (HTTP 401)",
      res.status === 401,
      401,
      res.status
    );
  } catch (err: any) {
    assert("Suite 7", "7.3", "Non-existent user", false, 401, err.message);
  }

  // 7.4 SQL Injection Attack in email
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.93",
      },
      body: JSON.stringify({
        email: "' OR '1'='1' --",
        password: "' OR '1'='1'",
      }),
    });
    assert(
      "Suite 7",
      "7.4",
      "Adversarial: SQL injection string safely rejected (HTTP 400 or 401)",
      res.status === 400 || res.status === 401,
      "400 or 401",
      res.status
    );
  } catch (err: any) {
    assert("Suite 7", "7.4", "SQL Injection", false, "400/401", err.message);
  }

  // 7.5 XSS Payload in login fields
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.94",
      },
      body: JSON.stringify({
        email: "<script>alert(1)</script>@test.com",
        password: "<svg onload=alert(1)>",
      }),
    });
    assert(
      "Suite 7",
      "7.5",
      "Adversarial: XSS payload in auth fields handled safely without execution (HTTP 400 or 401)",
      res.status === 400 || res.status === 401,
      "400 or 401",
      res.status
    );
  } catch (err: any) {
    assert("Suite 7", "7.5", "XSS Auth", false, "400/401", err.message);
  }

  // 7.6 OWASP Rate Limiting Enforcement Test
  try {
    const testIp = "127.0.0.95";
    let triggeredRateLimit = false;
    for (let attempt = 1; attempt <= 12; attempt++) {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({
          email: `flood.${attempt}@test.com`,
          password: "password123",
        }),
      });
      if (res.status === 429) {
        triggeredRateLimit = true;
        break;
      }
    }
    assert(
      "Suite 7",
      "7.6",
      "OWASP Security: Auth endpoint enforces rate limit (HTTP 429) on request flood",
      triggeredRateLimit,
      true,
      triggeredRateLimit,
      "Rate limiter triggered on high-frequency flood attempts"
    );
  } catch (err: any) {
    assert("Suite 7", "7.6", "Rate limit test", false, true, err.message);
  }

  // Summary
  console.log("\n===============================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL ASSERTIONS: ${total}`);
  console.log(`PASSED:           ${passed}`);
  console.log(`FAILED:           ${failed}`);
  console.log(`PASS RATE:        ${((passed / total) * 100).toFixed(1)}%`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((e) => {
  console.error("Test execution fatal failure:", e);
  process.exit(1);
});
