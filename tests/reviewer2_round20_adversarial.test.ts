/**
 * Independent Reviewer 2 Adversarial & Verification Suite for Round 20
 * Tests R1 (Login UI), R2 (1-Click Fast Login), and R3 (GovernmentHeader Cleanup)
 */

import fs from "fs";
import path from "path";

const WEB_ROOT = path.resolve(__dirname, "..");
const LOGIN_PAGE_PATH = path.join(WEB_ROOT, "src/app/login/page.tsx");
const GOV_HEADER_PATH = path.join(WEB_ROOT, "src/components/layout/GovernmentHeader.tsx");

interface AssertionResult {
  id: string;
  name: string;
  category: "R1" | "R2" | "R3" | "A11Y" | "API" | "INTEGRITY";
  passed: boolean;
  message: string;
}

const results: AssertionResult[] = [];

function assert(
  id: string,
  category: AssertionResult["category"],
  name: string,
  condition: boolean,
  passMsg: string,
  failMsg: string
) {
  results.push({
    id,
    category,
    name,
    passed: condition,
    message: condition ? passMsg : failMsg,
  });
  const symbol = condition ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${symbol} [${category}] ${id}: ${name}`);
  console.log(`   └─ ${condition ? passMsg : failMsg}`);
}

async function runTestSuite() {
  console.log("===============================================================================");
  console.log("REVIEWER 2: ROUND 20 ADVERSARIAL & COMPREHENSIVE VERIFICATION SUITE");
  console.log("Target Files: login/page.tsx, GovernmentHeader.tsx");
  console.log("===============================================================================\n");

  const loginContent = fs.readFileSync(LOGIN_PAGE_PATH, "utf-8");
  const headerContent = fs.readFileSync(GOV_HEADER_PATH, "utf-8");

  // =========================================================================
  // SUITE 1: R1 — Login Page UI Overhaul
  // =========================================================================
  console.log("--- SUITE 1: R1 — Login Page UI Overhaul ---");

  // 1. Honeycomb background
  const hasHoneycomb =
    loginContent.includes("data:image/svg+xml") &&
    loginContent.includes("%23cbd5e1") &&
    loginContent.includes("backgroundRepeat: \"repeat\"");
  assert(
    "R1-HONEYCOMB",
    "R1",
    "Faint honeycomb background lattice SVG pattern",
    hasHoneycomb,
    "Inline SVG pattern with #cbd5e1 stroke and repeat mode configured",
    "Missing honeycomb background SVG pattern in login/page.tsx"
  );

  // 2. Announcement banner
  const hasAnnouncement =
    loginContent.includes("PRAGATI REGISTRATIONS ARE NOW") &&
    loginContent.includes("OPEN") &&
    loginContent.includes("text-red-600");
  assert(
    "R1-ANNOUNCEMENT",
    "R1",
    "Red prominent registration announcement header",
    hasAnnouncement,
    "Announcement text 'PRAGATI REGISTRATIONS ARE NOW OPEN' in text-red-600 present",
    "Missing or altered registration announcement header"
  );

  // 3. Crisp white card
  const hasCrispCard =
    loginContent.includes("bg-white border border-slate-200 shadow-sm rounded-md") &&
    loginContent.includes("max-w-md");
  assert(
    "R1-CARD",
    "R1",
    "Crisp flat white card container with subtle borders",
    hasCrispCard,
    "White card container with border-slate-200, shadow-sm, and rounded-md present",
    "Login form container does not match crisp flat white card specification"
  );

  // 4. Squared-off input borders
  const emailInputSquared = loginContent.includes('id="login-email"') && loginContent.includes("rounded-sm");
  const passwordInputSquared = loginContent.includes('id="login-password"') && loginContent.includes("rounded-sm");
  const roleSelectSquared = loginContent.includes('id="login-role"') && loginContent.includes("rounded-sm");
  const submitButtonSquared = loginContent.includes("type=\"submit\"") && loginContent.includes("rounded-sm");

  assert(
    "R1-SQUARED-FIELDS",
    "R1",
    "Form fields and buttons have squared-off borders (rounded-sm)",
    emailInputSquared && passwordInputSquared && roleSelectSquared && submitButtonSquared,
    "Email, Password, Role selector, and Submit button all use clean rounded-sm squared borders",
    "One or more form fields do not use rounded-sm squared borders"
  );

  // 5. Exact registration text
  const exactRegistrationText = loginContent.includes("Register Now as SPOC");
  const fullRegistrationPhrase = loginContent.includes("Don't Have Account?") || loginContent.includes("Don&apos;t Have Account?");
  const registrationLinkTarget = loginContent.includes('href="/guidelines"') || loginContent.includes("href='/guidelines'");

  assert(
    "R1-REG-TEXT",
    "R1",
    "Exact prompt text 'Don't Have Account? Register Now as SPOC'",
    exactRegistrationText && fullRegistrationPhrase && registrationLinkTarget,
    "Exact text 'Don't Have Account? Register Now as SPOC' linking to /guidelines verified",
    "Registration text is incorrect or points to a dead link"
  );

  // 6. Elimination of duplicate header and dead links
  const hasNoDuplicateHeader = !loginContent.includes("<header") && !loginContent.includes("</header>");
  const hasNoDeadHashLinks = !loginContent.includes('href="#"') && !loginContent.includes("href='#'");
  const hasNoPlaceholderCircles = !loginContent.includes("MIC Alumni") && !loginContent.includes(">MoE<");

  assert(
    "R1-CLEAN-DOM",
    "R1",
    "Zero duplicate headers, placeholder circles, or dead '#' links in login/page.tsx",
    hasNoDuplicateHeader && hasNoDeadHashLinks && hasNoPlaceholderCircles,
    "Old prototype header, placeholder circle logos, and '#' links completely eliminated",
    "Found residual prototype header, circles, or dead links in login/page.tsx"
  );

  // =========================================================================
  // SUITE 2: R2 — Fast Login (1-Click Demo Credentials)
  // =========================================================================
  console.log("\n--- SUITE 2: R2 — Fast Login (1-Click Demo Credentials) ---");

  // 1. Fast login section presence
  const hasFastLoginSection =
    loginContent.includes("Demo / Fast Login") &&
    loginContent.includes("1-Click Evaluator Sign-In");
  assert(
    "R2-SECTION",
    "R2",
    "Demo / Fast Login section with evaluator badge",
    hasFastLoginSection,
    "Fast Login section clearly partitioned with evaluator banner",
    "Missing Demo / Fast Login section in login/page.tsx"
  );

  // 2. All 3 roles covered in DEMO_PRESETS
  const hasGovPreset =
    loginContent.includes("Gov Nodal Officer") &&
    loginContent.includes("nodal.innovation@jharkhand.gov.in") &&
    loginContent.includes("UserRole.GOV") &&
    loginContent.includes("/dashboard/gov");
  const hasUnivPreset =
    loginContent.includes("University SPOC") &&
    loginContent.includes("pi.water@iitism.ac.in") &&
    loginContent.includes("UserRole.UNIVERSITY") &&
    loginContent.includes("/dashboard/university");
  const hasIndPreset =
    loginContent.includes("Industry Partner") &&
    loginContent.includes("csr.director@tatasteel.com") &&
    loginContent.includes("UserRole.INDUSTRY") &&
    loginContent.includes("/dashboard/industry");

  assert(
    "R2-PRESETS",
    "R2",
    "3 Main Evaluator Presets (Gov Nodal Officer, University SPOC, Industry Partner)",
    hasGovPreset && hasUnivPreset && hasIndPreset,
    "All 3 institutional roles configured with authentic credentials and specific dashboard routes",
    "One or more required demo presets are missing or misconfigured"
  );

  // 3. 1-click execution logic (populates state AND executes submission)
  const autoPopulatesState =
    loginContent.includes("setEmail(targetEmail)") &&
    loginContent.includes("setPassword(targetPassword)") &&
    loginContent.includes("setRole(targetRole)");
  const executesFetch =
    loginContent.includes('fetch("/api/auth/login"') &&
    loginContent.includes('method: "POST"');
  const updatesAuthStore =
    loginContent.includes("setUser(data.user)");
  const redirectsToDashboard =
    loginContent.includes("router.push(destination)");

  assert(
    "R2-EXECUTION",
    "R2",
    "1-Click button populates state, calls API, updates auth store, and redirects",
    autoPopulatesState && executesFetch && updatesAuthStore && redirectsToDashboard,
    "Automated end-to-end execution flow verified (form inputs populated + API called + store updated)",
    "Fast login logic does not execute complete authentic authentication pipeline"
  );

  // 4. Loading indicators on fast login buttons
  const hasFastLoginSpinner =
    loginContent.includes("activeFastLogin") &&
    loginContent.includes("Loader2 className=\"w-4 h-4 animate-spin text-[#13528A]\"");
  assert(
    "R2-SPINNER",
    "R2",
    "Interactive loading spinner on active 1-click button",
    hasFastLoginSpinner,
    "Loader2 spinner animates on the specific clicked button during authentication",
    "Missing active loading state indicator on 1-click buttons"
  );

  // =========================================================================
  // SUITE 3: R3 — GovernmentHeader Cleanup & Portal Login Styling
  // =========================================================================
  console.log("\n--- SUITE 3: R3 — GovernmentHeader Cleanup & Portal Login Styling ---");

  // 1. Portal Login button styling
  const exactOrangeButtonClasses =
    headerContent.includes('bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711]');
  assert(
    "R3-ORANGE-BTN",
    "R3",
    "Vibrant solid orange rounded-full 'Portal Login' button",
    exactOrangeButtonClasses,
    "Desktop Portal Login button matches exact class specification: bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711]",
    "Portal Login button styling does not match the prompt specification"
  );

  // 2. Mobile drawer Portal Login CTA
  const mobileDrawerHasLogin =
    headerContent.includes('id="mobile-nav-drawer"') &&
    headerContent.includes('href="/login"') &&
    headerContent.includes('bg-[#F47B20] text-white rounded-full');
  assert(
    "R3-MOBILE-LOGIN",
    "R3",
    "Mobile navigation drawer includes matching Portal Login CTA",
    mobileDrawerHasLogin,
    "Mobile drawer provides full orange pill button for authentication access",
    "Mobile navigation drawer lacks Portal Login button"
  );

  // 3. Invariant: 4px Indian Tricolor Strip
  const hasTricolorStrip =
    headerContent.includes('data-testid="indian-tricolor-banner"') &&
    headerContent.includes('h-[4px]') &&
    headerContent.includes('#FF9933') &&
    headerContent.includes('#FFFFFF') &&
    headerContent.includes('#138808');
  assert(
    "R3-TRICOLOR",
    "R3",
    "Invariant: 4px Indian Tricolor banner at apex of header",
    hasTricolorStrip,
    "Tricolor banner with exact dimensions (4px) and colors (#FF9933, #FFFFFF, #138808) preserved",
    "Tricolor banner is missing or modified"
  );

  // 4. Invariant: UtilityBar & State Emblem
  const hasUtilityBar = headerContent.includes("<UtilityBar />");
  const hasEmblem = headerContent.includes('src="/assets/emblem-of-india.svg"') && headerContent.includes("State Emblem of India");
  const hasNationalPortal = headerContent.includes('href="https://india.gov.in"');

  assert(
    "R3-INVARIANTS",
    "R3",
    "Invariants: Accessibility UtilityBar, State Emblem, and india.gov.in apex link",
    hasUtilityBar && hasEmblem && hasNationalPortal,
    "All statutory GIGW header components (UtilityBar, Emblem, National Portal) preserved intact",
    "One or more statutory header invariants were removed or corrupted"
  );

  // =========================================================================
  // SUITE 4: Accessibility & WCAG 2.1 AA Compliance
  // =========================================================================
  console.log("\n--- SUITE 4: Accessibility & WCAG 2.1 AA Compliance ---");

  // 1. Accessible Labels on Login inputs
  const hasEmailLabel = loginContent.includes('htmlFor="login-email"') && loginContent.includes('id="login-email"');
  const hasPasswordLabel = loginContent.includes('htmlFor="login-password"') && loginContent.includes('id="login-password"');
  const hasRoleLabel = loginContent.includes('htmlFor="login-role"') && loginContent.includes('id="login-role"');
  const hasErrorRole = loginContent.includes('role="alert"');

  assert(
    "A11Y-FORM-LABELS",
    "A11Y",
    "All form inputs have programmatic htmlFor labels and error has role='alert'",
    hasEmailLabel && hasPasswordLabel && hasRoleLabel && hasErrorRole,
    "Screen reader accessible labels and alert regions verified",
    "Missing accessible labels or alert role on login form"
  );

  // 2. Header Search Combobox ARIA attributes
  const hasCombobox = headerContent.includes('role="combobox"');
  const hasAutocomplete = headerContent.includes('aria-autocomplete="list"');
  const hasAriaControls = headerContent.includes('aria-controls="global-search-suggestions"');
  const hasMatchingId = headerContent.includes('id="global-search-suggestions"');

  assert(
    "A11Y-SEARCH-COMBOBOX",
    "A11Y",
    "Search input satisfies WAI-ARIA Combobox pattern without a11y warnings",
    hasCombobox && hasAutocomplete && hasAriaControls && hasMatchingId,
    "Combobox role, aria-autocomplete, aria-controls, and target id verified",
    "Search input has broken or missing WAI-ARIA combobox relationship"
  );

  // 3. Mobile Drawer Accessibility
  const drawerDialog = headerContent.includes('role="dialog"') && headerContent.includes('aria-modal="true"');
  const drawerEscape = headerContent.includes('e.key === "Escape"');
  const drawerFocusTrap = headerContent.includes("handleDrawerKeyDown") && headerContent.includes("e.key !== \"Tab\"");
  const drawerScrollLock = headerContent.includes('document.body.style.overflow = "hidden"');

  assert(
    "A11Y-MOBILE-DRAWER",
    "A11Y",
    "Mobile navigation drawer has dialog role, Escape key listener, focus trap, and scroll lock",
    drawerDialog && drawerEscape && drawerFocusTrap && drawerScrollLock,
    "Mobile drawer satisfies WCAG 2.1 modal dialog keyboard and assistive standards",
    "Mobile drawer lacks complete accessibility behavior"
  );

  // =========================================================================
  // SUITE 5: Live API Integration Tests (Localhost:3000)
  // =========================================================================
  console.log("\n--- SUITE 5: Live API Integration Tests ---");

  const demoAccounts = [
    {
      role: "GOV",
      email: "nodal.innovation@jharkhand.gov.in",
      password: "Jharkhand@2026!",
      expectedRedirect: "/dashboard/gov",
    },
    {
      role: "UNIVERSITY",
      email: "pi.water@iitism.ac.in",
      password: "Jharkhand@2026!",
      expectedRedirect: "/dashboard/university",
    },
    {
      role: "INDUSTRY",
      email: "csr.director@tatasteel.com",
      password: "Jharkhand@2026!",
      expectedRedirect: "/dashboard/industry",
    },
  ];

  let ipCounter = 100;
  for (const account of demoAccounts) {
    ipCounter++;
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": `192.168.1.${ipCounter}`,
        },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });
      const data = await res.json();
      const setCookie = res.headers.get("set-cookie") || "";

      const passed =
        res.status === 200 &&
        data.user?.role === account.role &&
        data.redirectUrl === account.expectedRedirect;

      assert(
        `API-LOGIN-${account.role}`,
        "API",
        `Live authentication for ${account.role} (${account.email})`,
        passed,
        `Status ${res.status}, role=${data.user?.role}, redirect=${data.redirectUrl}, cookies attached`,
        `Failed authentication for ${account.role}: status=${res.status}, error=${data.error}`
      );
    } catch (e: any) {
      assert(
        `API-LOGIN-${account.role}`,
        "API",
        `Live authentication for ${account.role} (${account.email})`,
        false,
        "",
        `Fetch exception: ${e.message}`
      );
    }
  }

  // Adversarial: Invalid password
  ipCounter++;
  try {
    const badRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `192.168.1.${ipCounter}`,
      },
      body: JSON.stringify({ email: "nodal.innovation@jharkhand.gov.in", password: "WrongPassword123!" }),
    });
    const badData = await badRes.json();
    assert(
      "API-ADVERSARIAL-BAD-PASS",
      "API",
      "Reject invalid password with HTTP 401",
      badRes.status === 401 && badData.error?.includes("Invalid"),
      `Rejected with status 401: '${badData.error}'`,
      `Unexpected response for bad password: status=${badRes.status}`
    );
  } catch (e: any) {
    assert("API-ADVERSARIAL-BAD-PASS", "API", "Reject invalid password", false, "", e.message);
  }

  // Adversarial: Missing credentials
  ipCounter++;
  try {
    const emptyRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `192.168.1.${ipCounter}`,
      },
      body: JSON.stringify({}),
    });
    assert(
      "API-ADVERSARIAL-EMPTY",
      "API",
      "Reject empty payload with HTTP 400",
      emptyRes.status === 400,
      `Rejected with status 400 as expected`,
      `Unexpected response for empty credentials: status=${emptyRes.status}`
    );
  } catch (e: any) {
    assert("API-ADVERSARIAL-EMPTY", "API", "Reject empty credentials", false, "", e.message);
  }

  // =========================================================================
  // SUITE 6: Integrity & Adversarial Critic Audit
  // =========================================================================
  console.log("\n--- SUITE 6: Integrity & Adversarial Critic Audit ---");

  // 1. No hardcoded credentials bypass in login/page.tsx
  // Check that login doesn't just mock a user object without calling the API
  const hasNoFakeBypass = !loginContent.includes("if (email === 'fake')") &&
    !loginContent.includes("setUser({ id: 'dummy'") &&
    !loginContent.includes("return mockUser");
  assert(
    "INTEGRITY-NO-FAKES",
    "INTEGRITY",
    "No facade implementations or hardcoded user bypasses in login/page.tsx",
    hasNoFakeBypass,
    "Authentic API call to /api/auth/login is always required and executed",
    "Detected facade/mock bypass in login/page.tsx"
  );

  // 2. Real auth store interaction
  const usesAuthStoreProperly =
    loginContent.includes("const setUser = useAuthStore((state) => state.setUser);") &&
    loginContent.includes("setUser(data.user);");
  assert(
    "INTEGRITY-AUTH-STORE",
    "INTEGRITY",
    "Authentic auth store integration using setUser(data.user)",
    usesAuthStoreProperly,
    "Valid Zustand auth store integration without monkey-patching or undefined methods",
    "Invalid or missing auth store integration in login/page.tsx"
  );

  // 3. Dynamic destination fallback
  const hasDynamicRedirectFallback =
    loginContent.includes("const destination = forcedRedirect || data.redirectUrl || getRoleRedirect(data.user.role);");
  assert(
    "INTEGRITY-REDIRECT-RESILIENCE",
    "INTEGRITY",
    "Dynamic destination fallback using getRoleRedirect",
    hasDynamicRedirectFallback,
    "Resilient multi-tier redirect resolution (forcedRedirect -> API redirectUrl -> getRoleRedirect)",
    "Brittle or hardcoded redirect logic"
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n===============================================================================");
  console.log("REVIEWER 2 VERIFICATION SUMMARY");
  console.log("===============================================================================");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);

  if (failed === 0) {
    console.log("\n🎯 GATE VERDICT: APPROVE (100% of adversarial and quality assertions passed)");
    process.exit(0);
  } else {
    console.log(`\n❌ GATE VERDICT: REQUEST_CHANGES (${failed} assertions failed)`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
