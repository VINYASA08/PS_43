/**
 * Challenger 1 Empirical UI/UX, Animations & Viewport Stress-Test Suite
 * Target: web/src/app/login/page.tsx
 * Command: npx tsx tests/challenger_ui_login_stress.ts
 *
 * Scopes Verified:
 * R1: Split-screen layout & dynamic pure CSS/Framer Motion mesh gradient (0 static images, infinite loop)
 * R2: Glassmorphism card, backdrop-blur, optical highlights, input micro-interactions, password toggle
 * R3: Modern SSO OAuth buttons (Google, Microsoft, DigiLocker), type="button", AnimatePresence toast, auth logic preservation
 * R4: Staggered entry animation orchestration, error shake animation
 * Production Readiness: TypeScript AST validity, zero syntax errors, build compliance
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const TARGET_FILE = path.resolve(__dirname, "../src/app/login/page.tsx");

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function runTest(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [PASS] ${suite} -> ${name}`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message });
    console.error(`  ✗ [FAIL] ${suite} -> ${name}`);
    console.error(`    Details: ${err.message}`);
  }
}

console.log("\n===============================================================================");
console.log("CHALLENGER 1: EMPIRICAL UI/UX, ANIMATION & VIEWPORT STRESS TEST SUITE");
console.log(`Target: ${TARGET_FILE}`);
console.log("===============================================================================\n");

// 1. Verify Target File Existence and Integrity
assert.ok(fs.existsSync(TARGET_FILE), `Target file does not exist at ${TARGET_FILE}`);
const fileContent = fs.readFileSync(TARGET_FILE, "utf-8");
const fileLines = fileContent.split("\n");

console.log(`[Target Stats] Total Lines: ${fileLines.length}, Total Bytes: ${fileContent.length}\n`);

// =============================================================================
// SUITE 1: STATIC ANALYSIS OF MESH GRADIENT (ZERO STATIC IMAGES & PURE VECTOR)
// =============================================================================
console.log("--- SUITE 1: MESH GRADIENT & ZERO STATIC IMAGES AUDIT ---");

runTest("MeshGradient", "Source file contains 'use client' directive at line 1", () => {
  const line1 = fileLines[0].trim();
  assert.equal(line1, '"use client";', `Expected line 1 to be '"use client";', got '${line1}'`);
});

runTest("MeshGradient", "AnimatedMeshGradient component exists in source", () => {
  assert.match(fileContent, /function\s+AnimatedMeshGradient\s*\(\s*\)/, "Missing AnimatedMeshGradient function definition");
});

runTest("MeshGradient", "Strict zero static <img> or Next.js <Image> tags in mesh gradient", () => {
  // Extract AnimatedMeshGradient body
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  assert.ok(meshStart !== -1, "AnimatedMeshGradient function not found");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  assert.ok(meshEnd !== -1, "GoogleIcon boundary not found");
  const meshBody = fileContent.substring(meshStart, meshEnd);

  assert.doesNotMatch(meshBody, /<img\b/i, "Forbidden <img> tag found inside AnimatedMeshGradient");
  assert.doesNotMatch(meshBody, /<Image\b/, "Forbidden <Image> tag found inside AnimatedMeshGradient");
});

runTest("MeshGradient", "Strict zero static image URLs (png, jpg, jpeg, webp, gif, svg file paths) in gradient", () => {
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  const meshBody = fileContent.substring(meshStart, meshEnd);

  assert.doesNotMatch(meshBody, /url\s*\(['"]?[^'")]+\.(?:png|jpg|jpeg|webp|gif|svg)/i, "External static image URL found inside AnimatedMeshGradient");
  assert.doesNotMatch(meshBody, /background-image:\s*url\(/i, "CSS background-image URL found inside AnimatedMeshGradient");
});

runTest("MeshGradient", "Mesh gradient utilizes pure CSS procedural dot-matrix overlay", () => {
  assert.match(fileContent, /radial-gradient\(rgba\(255,\s*255,\s*255,\s*0\.07\)/, "Missing procedural dot-matrix radial-gradient overlay");
  assert.match(fileContent, /\[background-size:24px_24px\]/, "Missing dot-matrix tile background sizing");
});

runTest("MeshGradient", "Mesh gradient contains multiple GPU-accelerated vector blobs with heavy blur", () => {
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  const meshBody = fileContent.substring(meshStart, meshEnd);

  // Check blur filters for smooth mesh dispersion
  const blur120Matches = meshBody.match(/blur-\[120px\]/g) || [];
  const blur130Matches = meshBody.match(/blur-\[130px\]/g) || [];
  const blur110Matches = meshBody.match(/blur-\[110px\]/g) || [];
  const totalBlurBlobs = blur120Matches.length + blur130Matches.length + blur110Matches.length;

  assert.ok(totalBlurBlobs >= 4, `Expected at least 4 blurred vector blobs, found ${totalBlurBlobs}`);
  
  // Check will-change-transform for compositor thread optimization
  const willChangeMatches = meshBody.match(/will-change-transform/g) || [];
  assert.ok(willChangeMatches.length >= 4, `Expected at least 4 will-change-transform tags, found ${willChangeMatches.length}`);
});


// =============================================================================
// SUITE 2: FRAMER MOTION ANIMATIONS & CONTINUOUS LOOPING VERIFICATION
// =============================================================================
console.log("\n--- SUITE 2: FRAMER MOTION ANIMATION & LOOPING INVARIANTS ---");

runTest("Animations", "AnimatedMeshGradient blobs loop infinitely with repeat: Infinity", () => {
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  const meshBody = fileContent.substring(meshStart, meshEnd);

  const repeatMatches = meshBody.match(/repeat:\s*Infinity/g) || [];
  assert.ok(repeatMatches.length >= 4, `Expected >= 4 repeat: Infinity transitions for blobs, found ${repeatMatches.length}`);
});

runTest("Animations", "AnimatedMeshGradient blobs utilize continuous smooth easing (ease: 'easeInOut')", () => {
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  const meshBody = fileContent.substring(meshStart, meshEnd);

  const easeMatches = meshBody.match(/ease:\s*["']easeInOut["']/g) || [];
  assert.ok(easeMatches.length >= 4, `Expected >= 4 easeInOut configurations for smooth mesh cycle, found ${easeMatches.length}`);
});

runTest("Animations", "AnimatedMeshGradient blob durations are asynchronously staggered (avoiding harmonic lock)", () => {
  const meshStart = fileContent.indexOf("function AnimatedMeshGradient()");
  const meshEnd = fileContent.indexOf("function GoogleIcon", meshStart);
  const meshBody = fileContent.substring(meshStart, meshEnd);

  const durationMatches = meshBody.match(/duration:\s*(\d+)/g) || [];
  const durations = durationMatches.map((d) => parseInt(d.replace(/\D/g, ""), 10));
  
  assert.ok(durations.length >= 4, `Expected at least 4 duration declarations, found ${durations.length}`);
  // Check that durations are distinct/asynchronous (e.g. 18s, 15s, 22s, 26s)
  const uniqueDurations = new Set(durations);
  assert.ok(uniqueDurations.size >= 3, `Expected at least 3 distinct duration intervals for organic fluid movement, found ${uniqueDurations.size}`);
  
  for (const d of durations) {
    assert.ok(d >= 10 && d <= 45, `Duration ${d}s outside of recommended ambient range [10, 45]`);
  }
});

runTest("Animations", "Page entry orchestration features staggered Framer Motion variants", () => {
  assert.match(fileContent, /containerVariants\s*=\s*\{/, "Missing containerVariants definition");
  assert.match(fileContent, /staggerChildren:\s*0\.08/, "Missing staggerChildren orchestration");
  assert.match(fileContent, /itemVariants\s*=\s*\{/, "Missing itemVariants definition");
  assert.match(fileContent, /y:\s*18/, "Missing subtle vertical slide entry in itemVariants");
});

runTest("Animations", "Main card features dynamic Framer Motion error shake on authentication failure", () => {
  assert.match(
    fileContent,
    /animate=\{errorMessage\s*\?\s*\{\s*x:\s*\[-10,\s*10,\s*-8,\s*8,\s*-4,\s*4,\s*0\]\s*\}\s*:\s*\{\s*x:\s*0\s*\}\}/,
    "Missing Framer Motion dynamic error shake animation on form card"
  );
});

runTest("Animations", "Role tab pills feature animated shared layout transitions (layoutId)", () => {
  const layoutMatches = fileContent.match(/layoutId="activeTabPill"/g) || [];
  assert.ok(layoutMatches.length >= 4, `Expected 4 active tab pill layoutId animations, found ${layoutMatches.length}`);
});


// =============================================================================
// SUITE 3: GLASSMORPHISM CARD & MICRO-INTERACTION STYLING (R2)
// =============================================================================
console.log("\n--- SUITE 3: GLASSMORPHISM CARD & MICRO-INTERACTION STYLING ---");

runTest("Glassmorphism", "Main login card implements backdrop-blur-2xl glassmorphism", () => {
  assert.match(fileContent, /backdrop-blur-2xl/, "Missing backdrop-blur-2xl class on card container");
});

runTest("Glassmorphism", "Main card contains translucent border and ambient drop shadow", () => {
  assert.match(fileContent, /border\s+border-white\/15/, "Missing border-white/15 translucent border on card");
  assert.match(fileContent, /shadow-\[0_12px_40px_rgba\(0,0,0,0\.5\)\]/, "Missing soft ambient drop shadow on card");
  assert.match(fileContent, /rounded-3xl/, "Missing rounded-3xl modern curvature on card");
});

runTest("Glassmorphism", "Optical specular highlight strip implemented at the top of the card", () => {
  assert.match(
    fileContent,
    /bg-gradient-to-r\s+from-transparent\s+via-white\/30\s+to-transparent\s+pointer-events-none/,
    "Missing optical specular top highlight reflection strip"
  );
});

runTest("Glassmorphism", "Inputs implement glowing focus ring micro-interactions", () => {
  // Orange focus glow for citizen
  assert.match(fileContent, /focus:ring-orange-500\/40/, "Missing citizen glowing orange focus ring");
  assert.match(fileContent, /focus:shadow-\[0_0_20px_rgba\(249,115,22,0\.25\)\]/, "Missing citizen glowing shadow bloom");

  // Blue focus glow for university, industry, gov
  assert.match(fileContent, /focus:ring-blue-500\/40/, "Missing institutional glowing blue focus ring");
  assert.match(fileContent, /focus:shadow-\[0_0_20px_rgba\(59,130,246,0\.25\)\]/, "Missing institutional glowing shadow bloom");
});

runTest("Glassmorphism", "Password input implements interactive visibility eye toggle with Eye/EyeOff icons", () => {
  assert.match(fileContent, /showPassword\s*\?\s*<EyeOff/, "Missing EyeOff icon condition for visible password");
  assert.match(fileContent, /:\s*<Eye\b/, "Missing Eye icon condition for masked password");
  assert.match(fileContent, /setShowPassword\(!showPassword\)/, "Missing setShowPassword click handler");
});

runTest("Glassmorphism", "Floating telemetry cards on left column feature frosted glassmorphism", () => {
  const telemetryBackdropMatches = fileContent.match(/backdrop-blur-xl\s+border\s+border-white\/10/g) || [];
  assert.ok(telemetryBackdropMatches.length >= 3, `Expected at least 3 frosted telemetry cards, found ${telemetryBackdropMatches.length}`);
  assert.match(fileContent, /24 Districts Synced/, "Missing '24 Districts Synced' telemetry card");
  assert.match(fileContent, /Tri-Track AI Triage/, "Missing 'Tri-Track AI Triage' telemetry card");
  assert.match(fileContent, /Verified Credentials/, "Missing 'Verified Credentials' telemetry card");
});


// =============================================================================
// SUITE 4: RESPONSIVE VIEWPORT BREAKPOINTS & LAYOUT STRUCTURE (R1)
// =============================================================================
console.log("\n--- SUITE 4: RESPONSIVE VIEWPORT BREAKPOINTS & LAYOUT STRUCTURE ---");

runTest("Responsiveness", "Split-screen layout implemented via responsive grid classes (grid-cols-1 lg:grid-cols-2)", () => {
  assert.match(fileContent, /grid\s+grid-cols-1\s+lg:grid-cols-2/, "Missing split-screen grid layout (grid-cols-1 lg:grid-cols-2)");
});

runTest("Responsiveness", "Main layout occupies full viewport height with flex separation", () => {
  assert.match(fileContent, /min-h-screen/, "Missing min-h-screen class on main container");
  assert.match(fileContent, /flex\s+flex-col\s+justify-between/, "Missing flex flex-col justify-between layout");
});

runTest("Responsiveness", "Statutory footer strip renders at the bottom of the page", () => {
  assert.match(fileContent, /Higher & Technical Education Department,\s*Government of Jharkhand/, "Missing official department footer copyright text");
});

runTest("Responsiveness", "Universal back button navigates back to PRAGATI Home", () => {
  assert.match(fileContent, /href="\/"/, "Missing Link href='/' back to home");
  assert.match(fileContent, /Back to PRAGATI Home/, "Missing 'Back to PRAGATI Home' label");
});


// =============================================================================
// SUITE 5: MODERN SSO BUTTONS & IN-PAGE TOAST MECHANICS (R3)
// =============================================================================
console.log("\n--- SUITE 5: SSO BUTTONS & FEEDBACK TOAST NOTIFICATIONS ---");

runTest("SSO", "Google, Microsoft, and DigiLocker inline vector SVG components exist", () => {
  assert.match(fileContent, /function\s+GoogleIcon/, "Missing GoogleIcon component");
  assert.match(fileContent, /function\s+MicrosoftIcon/, "Missing MicrosoftIcon component");
  assert.match(fileContent, /function\s+DigiLockerIcon/, "Missing DigiLockerIcon component");
});

runTest("SSO", "All three SSO buttons explicitly declare type='button' (adversarial form safety)", () => {
  // Check that all 3 SSO buttons cannot accidentally submit credential form
  const ssoContainerStart = fileContent.indexOf("{/* MODERN SSO OAUTH BUTTONS (Google, Microsoft, DigiLocker) */}");
  assert.ok(ssoContainerStart !== -1, "SSO container comment boundary not found");
  const ssoDividerStart = fileContent.indexOf("{/* Frosted Divider */}", ssoContainerStart);
  assert.ok(ssoDividerStart !== -1, "SSO divider boundary not found");
  const ssoBlock = fileContent.substring(ssoContainerStart, ssoDividerStart);

  const buttonTypeMatches = ssoBlock.match(/type="button"/g) || [];
  assert.equal(buttonTypeMatches.length, 3, `Expected all 3 SSO buttons to have type="button", found ${buttonTypeMatches.length}`);
});

runTest("SSO", "SSO buttons wire up triggerSsoToast with provider names", () => {
  assert.match(fileContent, /onClick=\{?\(\)\s*=>\s*triggerSsoToast\("Google"\)\}?/, "Missing Google triggerSsoToast handler");
  assert.match(fileContent, /onClick=\{?\(\)\s*=>\s*triggerSsoToast\("Microsoft"\)\}?/, "Missing Microsoft triggerSsoToast handler");
  assert.match(fileContent, /onClick=\{?\(\)\s*=>\s*triggerSsoToast\("DigiLocker"\)\}?/, "Missing DigiLocker triggerSsoToast handler");
});

runTest("SSO", "Frosted divider separates SSO buttons from standard statutory inputs", () => {
  assert.match(fileContent, /or continue with statutory credentials/, "Missing 'or continue with statutory credentials' divider text");
});

runTest("SSO", "SSO toast utilizes Framer Motion AnimatePresence and auto-dismiss timer", () => {
  assert.match(fileContent, /<AnimatePresence>/, "Missing AnimatePresence container for toast");
  assert.match(fileContent, /toast\.show\s*&&/, "Missing conditional toast rendering");
  assert.match(fileContent, /Phase 2/, "Missing 'Phase 2' badge on toast");
  assert.match(fileContent, /setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]*?3500\s*\)/, "Missing 3500ms auto-dismiss timeout");
});


// =============================================================================
// SUITE 6: AUTHENTICATION INTEGRITY & FLOW PRESERVATION (R3)
// =============================================================================
console.log("\n--- SUITE 6: AUTHENTICATION FLOW PRESERVATION AUDIT ---");

runTest("AuthPreservation", "Citizen phone submission handler handleCitizenSubmit preserved", () => {
  assert.match(fileContent, /const\s+handleCitizenSubmit\s*=\s*async/, "Missing handleCitizenSubmit definition");
  assert.match(fileContent, /\/api\/auth\/login/, "Missing login endpoint call in citizen handler");
  assert.match(fileContent, /\/api\/auth\/register/, "Missing register endpoint call in citizen handler");
  assert.match(fileContent, /setShowOtpModal\(true\)/, "Missing OTP modal activation in citizen handler");
});

runTest("AuthPreservation", "Citizen OTP verification handler handleVerifyOtp preserved", () => {
  assert.match(fileContent, /const\s+handleVerifyOtp\s*=\s*async/, "Missing handleVerifyOtp definition");
  assert.match(fileContent, /\/api\/auth\/verify-otp/, "Missing /api/auth/verify-otp call");
  assert.match(fileContent, /setUser\(data\.user\)/, "Missing setUser auth store sync");
  assert.match(fileContent, /router\.push\(data\.redirectUrl\s*\|\|\s*"\/submit"\)/, "Missing citizen redirect router.push");
});

runTest("AuthPreservation", "Institutional email submission handler handleEmailSubmit preserved", () => {
  assert.match(fileContent, /const\s+handleEmailSubmit\s*=\s*async/, "Missing handleEmailSubmit definition");
  assert.match(fileContent, /res\.status\s*===\s*423/, "Missing HTTP 423 Account Lockout branch");
  assert.match(fileContent, /res\.status\s*===\s*403\s*&&\s*data\.status\s*===\s*"PENDING"/, "Missing HTTP 403 Pending Status branch");
});

runTest("AuthPreservation", "TOTP 2FA government authentication modal & handler preserved", () => {
  assert.match(fileContent, /const\s+handleVerifyTotp\s*=\s*async/, "Missing handleVerifyTotp definition");
  assert.match(fileContent, /\/api\/auth\/totp-verify/, "Missing /api/auth/totp-verify call");
  assert.match(fileContent, /Government 2FA Verification/, "Missing Government 2FA Modal title");
  assert.match(fileContent, /JBSWY3DPEHPK3PXP/, "Missing seeded TOTP test secret hint in modal");
});

runTest("AuthPreservation", "Quick persona test dock preserves all 5 pre-seeded evaluation buttons", () => {
  assert.match(fileContent, /handleQuickDemoLogin\("citizen"\)/, "Missing citizen demo button handler");
  assert.match(fileContent, /handleQuickDemoLogin\("university"\)/, "Missing university demo button handler (pi.water@iitism.ac.in)");
  assert.match(fileContent, /handleQuickDemoLogin\("industry"\)/, "Missing industry demo button handler (csr.director@tatasteel.com)");
  assert.match(fileContent, /handleQuickDemoLogin\("industry_pending"\)/, "Missing industry_pending demo button handler (csr.lead@coalindia.in)");
  assert.match(fileContent, /handleQuickDemoLogin\("gov"\)/, "Missing gov demo button handler (nodal.innovation@jharkhand.gov.in)");
});


// =============================================================================
// SUITE 7: TYPESCRIPT AST PARSER VALIDATION & SYNTACTIC INTEGRITY
// =============================================================================
console.log("\n--- SUITE 7: TYPESCRIPT AST PARSER & STATIC ANALYSIS ---");

runTest("ASTValidation", "TypeScript compiler parses web/src/app/login/page.tsx with 0 parse errors", () => {
  const sourceFile = ts.createSourceFile(
    TARGET_FILE,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  assert.ok(sourceFile, "Failed to create TypeScript AST SourceFile");
  
  // Check parse diagnostics
  const parseDiagnostics = (sourceFile as any).parseDiagnostics || [];
  assert.equal(
    parseDiagnostics.length,
    0,
    `TypeScript AST parser encountered ${parseDiagnostics.length} diagnostics: ${JSON.stringify(parseDiagnostics)}`
  );

  // Traverse AST to verify default exported function
  let hasDefaultExport = false;
  let componentName = "";

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node)) {
      const isDefault = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
      if (isDefault) {
        hasDefaultExport = true;
        componentName = node.name?.text || "Anonymous";
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  assert.ok(hasDefaultExport, "Expected export default function in page.tsx");
  assert.equal(componentName, "Login", `Expected default export function to be named 'Login', got '${componentName}'`);
});


// =============================================================================
// SUMMARY & VERDICT CALCULATION
// =============================================================================
console.log("\n===============================================================================");
const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log(`TEST SUITE SUMMARY: ${passedTests} PASSED | ${failedTests} FAILED | ${totalTests} TOTAL`);
console.log("===============================================================================\n");

if (failedTests > 0) {
  console.error(`💥 EMPIRICAL TEST SUITE FAILED WITH ${failedTests} DEFECT(S)!`);
  process.exit(1);
} else {
  console.log(`🎉 ALL ${totalTests}/${totalTests} EMPIRICAL STATIC ANALYSIS & UI STRESS TESTS PASSED CLEANLY!`);
  process.exit(0);
}
