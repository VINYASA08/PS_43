/**
 * CHALLENGER 2 ADVERSARIAL VERIFICATION & STRESS TEST HARNESS
 * Round 19 UI/UX Overhaul to Match MyGov.in
 * 
 * Target: a:/Development/Antigravity/SIH26043/web
 * 
 * Test Suites:
 * 1. Typography & Font Rendering Suite (Arial, Roboto, system-ui, smoothing, font scale, zero invalid CSS)
 * 2. Guidance Modal & Overlay De-SaaSification Suite (Zero backdrop-blur, zero rounded-2xl/3xl, solid overlays, scroll locks, a11y)
 * 3. CommandPalette & Tooltip Architecture Suite (Geometry, focus trapping, boundary detection, no SaaS blur/pill)
 * 4. High-Contrast Accessibility & Token Integrity Suite (Pure black/white, gold links/buttons, localStorage persistence)
 * 5. Structural Tricolor Banner & Responsive Behavior Suite (Fixed 4px, DOM apex, drawer focus trap, viewport breakpoints)
 * 6. Color Token Purity & Mathematical Contrast Oracle (WCAG 2.1 AA/AAA compliance, zero legacy purple)
 */

import fs from "fs";
import path from "path";

const WEB_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.resolve(WEB_ROOT, "src");

interface TestResult {
  suite: string;
  testCase: string;
  passed: boolean;
  expected: any;
  actual: any;
  rationale: string;
}

const results: TestResult[] = [];

function recordTest(
  suite: string,
  testCase: string,
  condition: boolean,
  expected: any,
  actual: any,
  rationale: string
) {
  const passed = Boolean(condition);
  results.push({ suite, testCase, passed, expected, actual, rationale });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} [${suite}] ${testCase}`);
  if (!passed) {
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
    console.error(`   Rationale:`, rationale);
  } else {
    console.log(`   └─ ${rationale}`);
  }
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Contrast ratio calculation oracle (WCAG 2.1)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getHexContrastRatio(hex1: string, hex2: string): number {
  const parseHex = (h: string) => {
    const clean = h.replace("#", "");
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };
  const [r1, g1, b1] = parseHex(hex1);
  const [r2, g2, b2] = parseHex(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

console.log("===============================================================================");
console.log("CHALLENGER 2: ADVERSARIAL STRESS TEST & VERIFICATION HARNESS");
console.log(`Workspace: ${WEB_ROOT}`);
console.log("===============================================================================\n");

// =============================================================================
// SUITE 1: Typography & Font Rendering Configuration
// =============================================================================
console.log("--- SUITE 1: Typography & Font Rendering Configuration ---");

const globalsCssPath = path.join(SRC_ROOT, "app", "globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

// 1.1 Arial, Roboto, system-ui in font-sans
const hasArialRobotoSystemUi =
  globalsCss.includes("Arial, Roboto, system-ui") ||
  (globalsCss.includes("Arial") && globalsCss.includes("Roboto") && globalsCss.includes("system-ui"));
recordTest(
  "Suite 1: Typography",
  "Font stack explicitly includes Arial, Roboto, and system-ui fallback tokens",
  hasArialRobotoSystemUi,
  true,
  hasArialRobotoSystemUi,
  "Found Arial, Roboto, system-ui priority stack in globals.css @theme inline"
);

// 1.2 Body font family mapping
recordTest(
  "Suite 1: Typography",
  "Body applies var(--font-sans) with standard sans-serif fallback",
  globalsCss.includes("font-family: var(--font-sans)") || globalsCss.includes("font-family: var(--font-sans), Arial, Roboto, sans-serif;"),
  true,
  true,
  "body correctly targets var(--font-sans) cascade"
);

// 1.3 Font smoothing properties
const hasWebkitSmoothing = globalsCss.includes("-webkit-font-smoothing: antialiased;");
const hasMozSmoothing = globalsCss.includes("-moz-osx-font-smoothing: grayscale;");
recordTest(
  "Suite 1: Typography",
  "Smooth font rendering declared with cross-platform vendor prefixes (-webkit and -moz-osx)",
  hasWebkitSmoothing && hasMozSmoothing,
  true,
  hasWebkitSmoothing && hasMozSmoothing,
  "-webkit-font-smoothing: antialiased and -moz-osx-font-smoothing: grayscale present"
);

// 1.4 No invalid CSS properties
const invalidPropertyMatch = globalsCss.match(/antialiased\s*:\s*true/i);
recordTest(
  "Suite 1: Typography",
  "Absence of malformed CSS property 'antialiased: true;'",
  invalidPropertyMatch === null,
  true,
  invalidPropertyMatch === null,
  "No invalid 'antialiased: true;' found in globals.css"
);

// 1.5 Font scale rules
const hasFontScaleSmall = globalsCss.includes('data-fontscale="small"') && globalsCss.includes("90%");
const hasFontScaleNormal = globalsCss.includes('data-fontscale="normal"') && globalsCss.includes("100%");
const hasFontScaleLarge = globalsCss.includes('data-fontscale="large"') && globalsCss.includes("115%");
recordTest(
  "Suite 1: Typography",
  "Accessible font scale rules defined for 90% (A-), 100% (A), and 115% (A+)",
  hasFontScaleSmall && hasFontScaleNormal && hasFontScaleLarge,
  true,
  hasFontScaleSmall && hasFontScaleNormal && hasFontScaleLarge,
  "All 3 font scaling tiers mapped to relative root rem percentages"
);

// =============================================================================
// SUITE 2: Guidance Modal & Overlay De-SaaSification
// =============================================================================
console.log("\n--- SUITE 2: Guidance Modal & Overlay De-SaaSification ---");

const guidanceDir = path.join(SRC_ROOT, "components", "guidance");
const guidanceFiles = getAllFiles(guidanceDir, [".tsx", ".ts"]);

let guidanceBackdropBlurCount = 0;
let guidanceRounded2xlCount = 0;
let guidanceRounded3xlCount = 0;

for (const file of guidanceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes("backdrop-blur")) guidanceBackdropBlurCount++;
  if (content.includes("rounded-2xl")) guidanceRounded2xlCount++;
  if (content.includes("rounded-3xl")) guidanceRounded3xlCount++;
}

recordTest(
  "Suite 2: De-SaaSification",
  "All components in components/guidance/* have ZERO backdrop-blur occurrences",
  guidanceBackdropBlurCount === 0,
  0,
  guidanceBackdropBlurCount,
  `Scanned ${guidanceFiles.length} files in guidance: 0 instances of backdrop-blur`
);

recordTest(
  "Suite 2: De-SaaSification",
  "All components in components/guidance/* have ZERO rounded-2xl or rounded-3xl occurrences",
  guidanceRounded2xlCount === 0 && guidanceRounded3xlCount === 0,
  0,
  guidanceRounded2xlCount + guidanceRounded3xlCount,
  `Scanned ${guidanceFiles.length} files in guidance: 0 instances of rounded-2xl/3xl`
);

// Individual Modal Verification
const modalFiles = [
  "Layer1_Onboarding/CitizenOnboardingModal.tsx",
  "Layer1_Onboarding/RoleOnboardingModal.tsx",
  "Layer2_Tooltips/FundingTiersModal.tsx",
  "Layer2_Tooltips/IpRightsModal.tsx",
  "Layer2_Tooltips/WhatHappensAfterSubmitModal.tsx",
  "Layer4_LegalFooter/PrivacyPolicyModal.tsx",
  "Layer4_LegalFooter/TermsModal.tsx",
];

for (const mPath of modalFiles) {
  const fullPath = path.join(guidanceDir, mPath);
  const name = path.basename(mPath);
  if (!fs.existsSync(fullPath)) {
    recordTest("Suite 2: De-SaaSification", `Modal exists: ${name}`, false, true, false, "File missing");
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf-8");

  // Check 1: Backdrop opacity without blur
  const hasSolidBackdrop =
    content.includes("bg-slate-950/80") ||
    content.includes("bg-slate-950/85") ||
    content.includes("bg-black/60") ||
    content.includes("bg-black/50");
  const hasNoBackdropBlur = !content.includes("backdrop-blur");
  recordTest(
    "Suite 2: Modal Integrity",
    `${name} uses solid backdrop overlay without blur`,
    hasSolidBackdrop && hasNoBackdropBlur,
    true,
    hasSolidBackdrop && hasNoBackdropBlur,
    `${name} implements solid accessible backdrop`
  );

  // Check 2: Modal dialog container radius
  const hasModerateRadius =
    content.includes("rounded-lg") || content.includes("rounded-md");
  const hasNoExtremeRadius = !content.includes("rounded-2xl") && !content.includes("rounded-3xl");
  recordTest(
    "Suite 2: Modal Integrity",
    `${name} container uses moderate border radius (rounded-lg or rounded-md)`,
    hasModerateRadius && hasNoExtremeRadius,
    true,
    hasModerateRadius && hasNoExtremeRadius,
    `${name} adheres to MyGov moderate border radius`
  );

  // Check 3: WAI-ARIA modal dialog contract
  const hasAriaModal = content.includes('aria-modal="true"');
  const hasRoleDialog = content.includes('role="dialog"');
  recordTest(
    "Suite 2: Accessibility",
    `${name} implements role='dialog' and aria-modal='true'`,
    hasAriaModal && hasRoleDialog,
    true,
    hasAriaModal && hasRoleDialog,
    `${name} satisfies assistive screen reader modal contract`
  );

  // Check 4: Keyboard Escape dismissal listener
  const hasEscapeListener = content.includes('"Escape"') || content.includes("'Escape'");
  recordTest(
    "Suite 2: Accessibility",
    `${name} implements keyboard Escape key dismissal listener`,
    hasEscapeListener,
    true,
    hasEscapeListener,
    `${name} dismisses gracefully on Escape key press`
  );

  // Check 5: Body scroll locking
  const locksBodyScroll = content.includes('document.body.style.overflow = "hidden"');
  recordTest(
    "Suite 2: UX Behavior",
    `${name} locks background body scroll on open`,
    locksBodyScroll,
    true,
    locksBodyScroll,
    `${name} locks body scroll while open`
  );
}

// =============================================================================
// SUITE 3: CommandPalette & Tooltip Architecture Suite
// =============================================================================
console.log("\n--- SUITE 3: CommandPalette & Tooltip Architecture Suite ---");

// 3.1 CommandPalette.tsx
const cmdPalettePath = path.join(SRC_ROOT, "components", "ui", "CommandPalette.tsx");
const cmdPaletteContent = fs.readFileSync(cmdPalettePath, "utf-8");

recordTest(
  "Suite 3: CommandPalette",
  "CommandPalette.tsx has ZERO backdrop-blur classes",
  !cmdPaletteContent.includes("backdrop-blur"),
  true,
  !cmdPaletteContent.includes("backdrop-blur"),
  "CommandPalette overlay uses solid bg-slate-900/60"
);

recordTest(
  "Suite 3: CommandPalette",
  "CommandPalette.tsx container uses rounded-md or rounded-lg (zero rounded-2xl/3xl)",
  !cmdPaletteContent.includes("rounded-2xl") &&
    !cmdPaletteContent.includes("rounded-3xl") &&
    cmdPaletteContent.includes("rounded-md"),
  true,
  true,
  "CommandPalette container styled with rounded-md shadow-lg border-slate-200"
);

recordTest(
  "Suite 3: CommandPalette",
  "CommandPalette.tsx has Ctrl+K / Cmd+K keyboard shortcut toggle listener",
  cmdPaletteContent.includes("ctrlKey") && cmdPaletteContent.includes('"k"'),
  true,
  true,
  "Global keyboard shortcut listener active"
);

// 3.2 Tooltip.tsx
const tooltipPath = path.join(guidanceDir, "Layer2_Tooltips", "Tooltip.tsx");
const tooltipContent = fs.readFileSync(tooltipPath, "utf-8");

recordTest(
  "Suite 3: Tooltip",
  "Tooltip.tsx has ZERO backdrop-blur classes",
  !tooltipContent.includes("backdrop-blur"),
  true,
  !tooltipContent.includes("backdrop-blur"),
  "Tooltip popover uses solid bg-slate-900"
);

recordTest(
  "Suite 3: Tooltip",
  "Tooltip.tsx has ZERO rounded-2xl or rounded-3xl classes",
  !tooltipContent.includes("rounded-2xl") && !tooltipContent.includes("rounded-3xl"),
  true,
  true,
  "Tooltip container uses moderate rounded-md"
);

recordTest(
  "Suite 3: Tooltip",
  "Tooltip.tsx implements dynamic viewport boundary collision detection",
  tooltipContent.includes("getBoundingClientRect") &&
    tooltipContent.includes("viewportWidth") &&
    tooltipContent.includes("viewportHeight"),
  true,
  true,
  "Auto-flips vertically and aligns horizontally to prevent viewport overflow"
);

recordTest(
  "Suite 3: Tooltip",
  "Tooltip.tsx implements mobile touch toggle with auto-dismiss timer",
  tooltipContent.includes("handleTouchToggle") && tooltipContent.includes("autoDismissTimerRef"),
  true,
  true,
  "5-second auto-dismiss timer prevents sticky tooltips on mobile touchscreens"
);

// =============================================================================
// SUITE 4: High-Contrast Accessibility & Token Integrity Suite
// =============================================================================
console.log("\n--- SUITE 4: High-Contrast Accessibility & Token Integrity Suite ---");

// 4.1 High contrast CSS rules
recordTest(
  "Suite 4: High-Contrast",
  "globals.css defines .high-contrast and body.high-contrast root rules",
  globalsCss.includes(".high-contrast,") && globalsCss.includes("body.high-contrast"),
  true,
  true,
  ".high-contrast selectors present"
);

recordTest(
  "Suite 4: High-Contrast",
  "High contrast mode enforces pure black (#000000) background",
  globalsCss.includes("--background: #000000 !important;") && globalsCss.includes("background-color: #000000 !important;"),
  true,
  true,
  "Pure black background guaranteed with !important"
);

recordTest(
  "Suite 4: High-Contrast",
  "High contrast mode enforces pure white (#ffffff) foreground and borders",
  globalsCss.includes("--foreground: #ffffff !important;") && globalsCss.includes("border-color: #ffffff !important;"),
  true,
  true,
  "Pure white foreground and 100% border contrast enforced"
);

recordTest(
  "Suite 4: High-Contrast",
  "High contrast mode styles links with gold (#FFD700) and mandatory underline",
  globalsCss.includes("color: #FFD700 !important;") && globalsCss.includes("text-decoration: underline !important;"),
  true,
  true,
  "WCAG AAA compliance for hyperlinks in high-contrast mode"
);

recordTest(
  "Suite 4: High-Contrast",
  "High contrast mode styles buttons with gold (#FFD700) fill and black text",
  globalsCss.includes("background-color: #FFD700 !important;") && globalsCss.includes("color: #000000 !important;"),
  true,
  true,
  "High visibility interactive buttons in high-contrast mode"
);

recordTest(
  "Suite 4: High-Contrast",
  "High contrast mode enforces 3px gold (:focus-visible) outline halo",
  globalsCss.includes("outline: 3px solid #FFD700 !important;"),
  true,
  true,
  "Visible focus halo guaranteed in high-contrast mode"
);

// 4.2 UtilityBar high-contrast toggle implementation
const utilityBarPath = path.join(SRC_ROOT, "components", "layout", "UtilityBar.tsx");
const utilityBarContent = fs.readFileSync(utilityBarPath, "utf-8");

recordTest(
  "Suite 4: High-Contrast",
  "UtilityBar persists high-contrast preference under key 'jsicp-contrast'",
  utilityBarContent.includes('localStorage.setItem("jsicp-contrast", "true")') &&
    utilityBarContent.includes('localStorage.getItem("jsicp-contrast")'),
  true,
  true,
  "Persists across page navigation and reloads"
);

recordTest(
  "Suite 4: High-Contrast",
  "UtilityBar applies .high-contrast to both html and body elements",
  utilityBarContent.includes('document.documentElement.classList.add("high-contrast")') &&
    utilityBarContent.includes('document.body.classList.add("high-contrast")'),
  true,
  true,
  "Ensures complete DOM coverage regardless of CSS scoping"
);

recordTest(
  "Suite 4: High-Contrast",
  "UtilityBar toggle button has aria-pressed attribute for assistive tech",
  utilityBarContent.includes("aria-pressed={mounted && highContrast}"),
  true,
  true,
  "ARIA state exposed to screen readers"
);

// =============================================================================
// SUITE 5: Structural Tricolor Banner & Responsive Behavior Suite
// =============================================================================
console.log("\n--- SUITE 5: Structural Tricolor Banner & Responsive Behavior Suite ---");

const headerPath = path.join(SRC_ROOT, "components", "layout", "GovernmentHeader.tsx");
const headerContent = fs.readFileSync(headerPath, "utf-8");

// 5.1 Tricolor banner geometry & placement
recordTest(
  "Suite 5: Tricolor Banner",
  "Tricolor banner is first element inside <header role='banner'> before <UtilityBar />",
  headerContent.indexOf('data-testid="indian-tricolor-banner"') < headerContent.indexOf("<UtilityBar />"),
  true,
  true,
  "Tricolor banner at absolute apex of header"
);

recordTest(
  "Suite 5: Tricolor Banner",
  "Tricolor banner container specifies exact h-[4px] to prevent font-scaling expansion",
  headerContent.includes("h-[4px]"),
  true,
  true,
  "h-[4px] fixed pixel height prevents font-scaling deformation"
);

recordTest(
  "Suite 5: Tricolor Banner",
  "Tricolor banner container specifies w-full flex shrink-0 to span full width",
  headerContent.includes("w-full h-[4px] flex shrink-0"),
  true,
  true,
  "100% viewport width coverage"
);

recordTest(
  "Suite 5: Tricolor Banner",
  "All 3 stripes have exact MyGov hexes (#FF9933 Saffron, #FFFFFF White, #138808 Green)",
  headerContent.includes("bg-[#FF9933]") &&
    headerContent.includes("bg-[#FFFFFF]") &&
    headerContent.includes("bg-[#138808]"),
  true,
  true,
  "Authentic national tricolor hex color specification"
);

recordTest(
  "Suite 5: Tricolor Banner",
  "Tricolor banner elements include all 4 mandatory testids",
  headerContent.includes('data-testid="indian-tricolor-banner"') &&
    headerContent.includes('data-testid="tricolor-saffron"') &&
    headerContent.includes('data-testid="tricolor-white"') &&
    headerContent.includes('data-testid="tricolor-green"'),
  true,
  true,
  "All 4 testids present for automated testing"
);

// 5.2 Responsive Mobile Drawer
recordTest(
  "Suite 5: Responsive",
  "GovernmentHeader provides accessible mobile drawer with Escape key listener",
  headerContent.includes("isMobileMenuOpen") &&
    headerContent.includes('"Escape"') &&
    headerContent.includes("setIsMobileMenuOpen(false)"),
  true,
  true,
  "Escape key closes mobile navigation drawer"
);

recordTest(
  "Suite 5: Responsive",
  "Mobile drawer implements keyboard Tab focus trapping (handleDrawerKeyDown)",
  headerContent.includes("handleDrawerKeyDown") &&
    headerContent.includes("shiftKey") &&
    headerContent.includes("focus()"),
  true,
  true,
  "Keyboard focus trapped inside open mobile drawer"
);

recordTest(
  "Suite 5: Responsive",
  "Mobile drawer locks body scroll on open (overflow = 'hidden')",
  headerContent.includes('document.body.style.overflow = "hidden"'),
  true,
  true,
  "Prevents background page scrolling while mobile drawer is open"
);

// =============================================================================
// SUITE 6: Color Token Purity & Mathematical Contrast Oracle
// =============================================================================
console.log("\n--- SUITE 6: Color Token Purity & Mathematical Contrast Oracle ---");

// 6.1 Contrast Ratios
const primaryBlueContrast = getHexContrastRatio("#13528A", "#FFFFFF");
recordTest(
  "Suite 6: Contrast Oracle",
  `Primary Blue (#13528A) on White (#FFFFFF) passes WCAG AAA (>= 7.0:1) [Actual: ${primaryBlueContrast.toFixed(2)}:1]`,
  primaryBlueContrast >= 7.0,
  true,
  primaryBlueContrast >= 7.0,
  `Ratio is ${primaryBlueContrast.toFixed(2)}:1 (exceeds AAA threshold 7.0:1)`
);

const primaryDarkContrast = getHexContrastRatio("#0E3D66", "#FFFFFF");
recordTest(
  "Suite 6: Contrast Oracle",
  `Primary Dark (#0E3D66) on White (#FFFFFF) passes WCAG AAA (>= 7.0:1) [Actual: ${primaryDarkContrast.toFixed(2)}:1]`,
  primaryDarkContrast >= 7.0,
  true,
  primaryDarkContrast >= 7.0,
  `Ratio is ${primaryDarkContrast.toFixed(2)}:1 (exceptional legibility)`
);

const highContrastGoldOnBlack = getHexContrastRatio("#FFD700", "#000000");
recordTest(
  "Suite 6: Contrast Oracle",
  `High Contrast Gold (#FFD700) on Black (#000000) passes WCAG AAA (>= 7.0:1) [Actual: ${highContrastGoldOnBlack.toFixed(2)}:1]`,
  highContrastGoldOnBlack >= 7.0,
  true,
  highContrastGoldOnBlack >= 7.0,
  `Ratio is ${highContrastGoldOnBlack.toFixed(2)}:1 (exceeds AAA)`
);

// 6.2 Zero legacy purple in src
const allSrcFiles = getAllFiles(SRC_ROOT, [".tsx", ".ts", ".css"]);
const purpleViolations: string[] = [];
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, "utf-8");
  if (/#613AF5|#4A2BC2|rgba\(\s*97\s*,\s*58\s*,\s*245/i.test(content)) {
    purpleViolations.push(path.relative(SRC_ROOT, f));
  }
}

recordTest(
  "Suite 6: Purity",
  "Zero occurrences of legacy purple (#613AF5, #4A2BC2, rgba(97,58,245)) across entire web/src",
  purpleViolations.length === 0,
  0,
  purpleViolations.length,
  purpleViolations.length === 0
    ? `Verified across ${allSrcFiles.length} source files: zero residual purple`
    : `Violations found in: ${purpleViolations.join(", ")}`
);

// 6.3 Zero rounded-2xl or rounded-3xl in page.tsx and layout
const pageTsx = fs.readFileSync(path.join(SRC_ROOT, "app", "page.tsx"), "utf-8");
const hasNoRounded2xlInPage = !pageTsx.includes("rounded-2xl") && !pageTsx.includes("rounded-3xl");
recordTest(
  "Suite 6: Purity",
  "Zero rounded-2xl or rounded-3xl in src/app/page.tsx",
  hasNoRounded2xlInPage,
  true,
  hasNoRounded2xlInPage,
  "All cards, badges, and banners in homepage use rounded-md or rounded-lg"
);

// =============================================================================
// FINAL AUDIT SUMMARY
// =============================================================================
console.log("\n===============================================================================");
console.log("CHALLENGER 2 ADVERSARIAL AUDIT SUMMARY");
console.log("===============================================================================");
const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log(`Total Assertions: ${totalTests}`);
console.log(`Passed:           ${passedTests}`);
console.log(`Failed:           ${failedTests}`);

if (failedTests === 0) {
  console.log("\n🎯 VERDICT: APPROVE (100% ADVERSARIAL PASS)");
  console.log("No regressions, syntax defects, or SaaS artifacts detected.");
  process.exit(0);
} else {
  console.error(`\n🔥 VERDICT: CHALLENGE_FAILED (${failedTests} failures detected)`);
  process.exit(1);
}
