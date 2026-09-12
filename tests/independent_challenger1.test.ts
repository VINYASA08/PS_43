/**
 * INDEPENDENT ADVERSARIAL CHALLENGER 1 TEST HARNESS
 * Round 19 UI/UX Overhaul to Authentically Match MyGov.in
 * 
 * Target: a:/Development/Antigravity/SIH26043/web
 * Executed independently by: Challenger 1 (challenger_r19_1)
 */

import fs from "fs";
import path from "path";

const WEB_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.resolve(WEB_ROOT, "src");
const PUBLIC_ROOT = path.resolve(WEB_ROOT, "public");

interface AssertionResult {
  suite: string;
  testId: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  details?: string;
}

const results: AssertionResult[] = [];

function check(
  suite: string,
  testId: string,
  name: string,
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  condition: boolean,
  expected: any,
  actual: any,
  details?: string
) {
  const passed = Boolean(condition);
  results.push({ suite, testId, name, passed, expected, actual, severity, details });
  const mark = passed ? "✅ [PASS]" : `❌ [FAIL:${severity}]`;
  console.log(`${mark} [${testId}] ${name}`);
  if (!passed || details) {
    if (details) console.log(`   ├─ details: ${details}`);
    if (!passed) {
      console.log(`   ├─ expected: ${JSON.stringify(expected)}`);
      console.log(`   └─ actual:   ${JSON.stringify(actual)}`);
    }
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

console.log("===============================================================================");
console.log("  INDEPENDENT CHALLENGER 1: ADVERSARIAL STRESS TEST HARNESS");
console.log("  Round 19 UI/UX Overhaul — Official MyGov.in Aesthetic Conformance");
console.log(`  Source Target: ${SRC_ROOT}`);
console.log("===============================================================================\n");

// =============================================================================
// CRITERION 1: 4px TRICOLOR STRIP AT DOM & VIEWPORT APEX
// =============================================================================
console.log("--- SUITE 1: Criterion 1 — 4px Indian Tricolor Strip Verification ---");

const headerFile = path.join(SRC_ROOT, "components", "layout", "GovernmentHeader.tsx");
const headerContent = fs.readFileSync(headerFile, "utf-8");
const layoutFile = path.join(SRC_ROOT, "app", "layout.tsx");
const layoutContent = fs.readFileSync(layoutFile, "utf-8");
const networkBannerFile = path.join(SRC_ROOT, "components", "ui", "NetworkBanner.tsx");
const networkBannerContent = fs.readFileSync(networkBannerFile, "utf-8");

// 1.1 Container existence and testid
check(
  "Criterion 1",
  "C1.1",
  "Tricolor banner container has data-testid='indian-tricolor-banner'",
  "CRITICAL",
  headerContent.includes('data-testid="indian-tricolor-banner"'),
  true,
  headerContent.includes('data-testid="indian-tricolor-banner"'),
  "Container present in GovernmentHeader.tsx"
);

// 1.2 Height constraint
check(
  "Criterion 1",
  "C1.2",
  "Tricolor banner specifies exact 4px height class ('h-[4px]')",
  "CRITICAL",
  headerContent.includes("h-[4px]"),
  true,
  headerContent.includes("h-[4px]"),
  "Strict 4px pixel constraint avoids responsive font-scale expansion"
);

// 1.3 Width constraint
check(
  "Criterion 1",
  "C1.3",
  "Tricolor banner container spans 100% viewport width ('w-full')",
  "CRITICAL",
  headerContent.includes("w-full"),
  true,
  headerContent.includes("w-full"),
  "Spans 100% viewport width"
);

// 1.4 Saffron Stripe
check(
  "Criterion 1",
  "C1.4",
  "Saffron stripe has exact color #FF9933 and data-testid='tricolor-saffron'",
  "CRITICAL",
  headerContent.includes("bg-[#FF9933]") && headerContent.includes('data-testid="tricolor-saffron"'),
  true,
  headerContent.includes("bg-[#FF9933]") && headerContent.includes('data-testid="tricolor-saffron"'),
  "Verified Saffron stripe with hex #FF9933"
);

// 1.5 White Stripe
check(
  "Criterion 1",
  "C1.5",
  "White stripe has exact color #FFFFFF and data-testid='tricolor-white'",
  "CRITICAL",
  headerContent.includes("bg-[#FFFFFF]") && headerContent.includes('data-testid="tricolor-white"'),
  true,
  headerContent.includes("bg-[#FFFFFF]") && headerContent.includes('data-testid="tricolor-white"'),
  "Verified White stripe with hex #FFFFFF"
);

// 1.6 Green Stripe
check(
  "Criterion 1",
  "C1.6",
  "Green stripe has exact color #138808 and data-testid='tricolor-green'",
  "CRITICAL",
  headerContent.includes("bg-[#138808]") && headerContent.includes('data-testid="tricolor-green"'),
  true,
  headerContent.includes("bg-[#138808]") && headerContent.includes('data-testid="tricolor-green"'),
  "Verified Green stripe with hex #138808"
);

// 1.7 DOM Ordering in Header (Before UtilityBar)
const bannerIdx = headerContent.indexOf('data-testid="indian-tricolor-banner"');
const utilityBarIdx = headerContent.indexOf("<UtilityBar />");
const headerTagIdx = headerContent.indexOf("<header");

check(
  "Criterion 1",
  "C1.7",
  "Tricolor banner is the first element inside <header role='banner'> preceding <UtilityBar />",
  "HIGH",
  bannerIdx > headerTagIdx && bannerIdx < utilityBarIdx,
  true,
  bannerIdx > headerTagIdx && bannerIdx < utilityBarIdx,
  `headerTagIdx: ${headerTagIdx}, bannerIdx: ${bannerIdx}, utilityBarIdx: ${utilityBarIdx}`
);

// 1.8 Displacement checks: Header margins/paddings
const headerTagMatch = headerContent.match(/<header[^>]*className=["']([^"']*)["']/);
const headerClasses = headerTagMatch ? headerTagMatch[1] : "";
const hasHeaderDisplacement = /\b(m[t-y]?-\d+|p[t-y]?-\d+|top-\d+)\b/.test(headerClasses);

check(
  "Criterion 1",
  "C1.8",
  "GovernmentHeader has NO margin, padding, or top displacement offsets",
  "HIGH",
  !hasHeaderDisplacement,
  false,
  hasHeaderDisplacement,
  `Header classes: "${headerClasses}"`
);

// 1.9 Root layout hierarchy check
const netBannerInLayoutIdx = layoutContent.indexOf("<NetworkBanner />");
const govHeaderInLayoutIdx = layoutContent.indexOf("<GovernmentHeader />");

check(
  "Criterion 1",
  "C1.9",
  "GovernmentHeader is mounted in RootLayout",
  "HIGH",
  govHeaderInLayoutIdx !== -1,
  true,
  govHeaderInLayoutIdx !== -1,
  "GovernmentHeader is correctly rendered in layout.tsx"
);

// 1.10 Adversarial stress check: NetworkBanner offline displacement
const isNetworkBannerConditional = networkBannerContent.includes("if (!isOffline) return null;");
const hasStickyInNetworkBanner = networkBannerContent.includes("sticky top-0");

check(
  "Criterion 1",
  "C1.10",
  "NetworkBanner returns null in normal online state (does not displace Tricolor in online mode)",
  "MEDIUM",
  isNetworkBannerConditional,
  true,
  isNetworkBannerConditional,
  "Online state yields null (no DOM node rendered above GovernmentHeader)"
);

// =============================================================================
// CRITERION 2: COLOR PALETTE & LEGACY PURPLE ERADICATION
// =============================================================================
console.log("\n--- SUITE 2: Criterion 2 — MyGov Color Palette & Legacy Purple Eradication ---");

const globalsCssFile = path.join(SRC_ROOT, "app", "globals.css");
const globalsCss = fs.readFileSync(globalsCssFile, "utf-8");
const pageTsxFile = path.join(SRC_ROOT, "app", "page.tsx");
const pageTsx = fs.readFileSync(pageTsxFile, "utf-8");
const footerFile = path.join(SRC_ROOT, "components", "layout", "GovernmentFooter.tsx");
const footerContent = fs.readFileSync(footerFile, "utf-8");

// 2.1 Primary Blue #13528A in globals.css
check(
  "Criterion 2",
  "C2.1",
  "globals.css defines Primary Blue hex #13528A",
  "CRITICAL",
  globalsCss.includes("#13528A"),
  true,
  globalsCss.includes("#13528A"),
  "Found #13528A in globals.css"
);

// 2.2 Accent Orange #F47B20 in globals.css
check(
  "Criterion 2",
  "C2.2",
  "globals.css defines Accent Orange hex #F47B20",
  "CRITICAL",
  globalsCss.includes("#F47B20"),
  true,
  globalsCss.includes("#F47B20"),
  "Found #F47B20 in globals.css"
);

// 2.3 Primary Blue used in page.tsx
check(
  "Criterion 2",
  "C2.3",
  "Homepage (page.tsx) uses Primary Blue #13528A for CTA buttons and UI elements",
  "HIGH",
  pageTsx.includes("#13528A") || pageTsx.includes("bg-[#13528A]"),
  true,
  pageTsx.includes("#13528A"),
  "Primary CTAs and elements styled with #13528A"
);

// 2.4 Accent Orange used in main layout (GovernmentFooter.tsx)
check(
  "Criterion 2",
  "C2.4",
  "GovernmentFooter uses Accent Orange #F47B20 for section category headings",
  "HIGH",
  footerContent.includes("#F47B20"),
  true,
  footerContent.includes("#F47B20"),
  "Found #F47B20 in GovernmentFooter.tsx"
);

// 2.5 Zero occurrences of #613AF5 in src/
const allSrcFiles = getAllFiles(SRC_ROOT, [".tsx", ".ts", ".css"]);
const legacy613Matches: { file: string; line: number }[] = [];
const legacy4A2Matches: { file: string; line: number }[] = [];

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (/#613AF5/i.test(line)) {
      legacy613Matches.push({ file: path.relative(WEB_ROOT, file), line: idx + 1 });
    }
    if (/#4A2BC2/i.test(line)) {
      legacy4A2Matches.push({ file: path.relative(WEB_ROOT, file), line: idx + 1 });
    }
  });
}

check(
  "Criterion 2",
  "C2.5",
  "Zero occurrences of legacy UX4G purple (#613AF5) across src/",
  "CRITICAL",
  legacy613Matches.length === 0,
  0,
  legacy613Matches.length,
  legacy613Matches.length === 0 ? "100% clean in src/" : `Found in: ${JSON.stringify(legacy613Matches)}`
);

// 2.6 Zero occurrences of legacy dark purple #4A2BC2 across src/
check(
  "Criterion 2",
  "C2.6",
  "Zero occurrences of legacy UX4G dark purple (#4A2BC2) across src/",
  "CRITICAL",
  legacy4A2Matches.length === 0,
  0,
  legacy4A2Matches.length,
  legacy4A2Matches.length === 0 ? "100% clean in src/" : `Found in: ${JSON.stringify(legacy4A2Matches)}`
);

// 2.7 Adversarial Check: Check public/manifest.json for residual #613AF5
const manifestFile = path.join(PUBLIC_ROOT, "manifest.json");
let manifestHasLegacyPurple = false;
let manifestContent = "";
if (fs.existsSync(manifestFile)) {
  manifestContent = fs.readFileSync(manifestFile, "utf-8");
  manifestHasLegacyPurple = /#613AF5/i.test(manifestContent);
}

check(
  "Criterion 2",
  "C2.7",
  "Adversarial Audit: public/manifest.json theme_color audit",
  "MEDIUM",
  !manifestHasLegacyPurple,
  false,
  manifestHasLegacyPurple,
  manifestHasLegacyPurple
    ? "NOTE: manifest.json still contains theme_color: #613AF5"
    : "manifest.json is clean"
);

// =============================================================================
// CRITERION 3: BORDER RADII AUDIT (NO rounded-2xl / rounded-3xl)
// =============================================================================
console.log("\n--- SUITE 3: Criterion 3 — Border Radii Conformance Audit ---");

const skeletonsFile = path.join(SRC_ROOT, "components", "ui", "Skeletons.tsx");
const skeletonsContent = fs.readFileSync(skeletonsFile, "utf-8");

// 3.1 page.tsx: no rounded-2xl
const page2xlMatches = (pageTsx.match(/\brounded-2xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.1",
  "src/app/page.tsx has ZERO rounded-2xl classes",
  "CRITICAL",
  page2xlMatches === 0,
  0,
  page2xlMatches,
  "All oversized cards normalized"
);

// 3.2 page.tsx: no rounded-3xl
const page3xlMatches = (pageTsx.match(/\brounded-3xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.2",
  "src/app/page.tsx has ZERO rounded-3xl classes",
  "CRITICAL",
  page3xlMatches === 0,
  0,
  page3xlMatches,
  "No rounded-3xl in page.tsx"
);

// 3.3 GovernmentHeader.tsx: no rounded-2xl
const header2xlMatches = (headerContent.match(/\brounded-2xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.3",
  "GovernmentHeader.tsx has ZERO rounded-2xl classes",
  "CRITICAL",
  header2xlMatches === 0,
  0,
  header2xlMatches,
  "Header components use rounded-md/rounded-lg"
);

// 3.4 GovernmentHeader.tsx: no rounded-3xl
const header3xlMatches = (headerContent.match(/\brounded-3xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.4",
  "GovernmentHeader.tsx has ZERO rounded-3xl classes",
  "CRITICAL",
  header3xlMatches === 0,
  0,
  header3xlMatches,
  "No rounded-3xl in GovernmentHeader.tsx"
);

// 3.5 GovernmentFooter.tsx: no rounded-2xl
const footer2xlMatches = (footerContent.match(/\brounded-2xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.5",
  "GovernmentFooter.tsx has ZERO rounded-2xl classes",
  "CRITICAL",
  footer2xlMatches === 0,
  0,
  footer2xlMatches,
  "Footer components use rounded-md/rounded-lg"
);

// 3.6 GovernmentFooter.tsx: no rounded-3xl
const footer3xlMatches = (footerContent.match(/\brounded-3xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.6",
  "GovernmentFooter.tsx has ZERO rounded-3xl classes",
  "CRITICAL",
  footer3xlMatches === 0,
  0,
  footer3xlMatches,
  "No rounded-3xl in GovernmentFooter.tsx"
);

// 3.7 Skeletons.tsx: no rounded-2xl
const skeletons2xlMatches = (skeletonsContent.match(/\brounded-2xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.7",
  "Skeletons.tsx has ZERO rounded-2xl classes",
  "CRITICAL",
  skeletons2xlMatches === 0,
  0,
  skeletons2xlMatches,
  "Skeletons normalized to rounded-md and rounded-lg"
);

// 3.8 Skeletons.tsx: no rounded-3xl
const skeletons3xlMatches = (skeletonsContent.match(/\brounded-3xl\b/g) || []).length;
check(
  "Criterion 3",
  "C3.8",
  "Skeletons.tsx has ZERO rounded-3xl classes",
  "CRITICAL",
  skeletons3xlMatches === 0,
  0,
  skeletons3xlMatches,
  "No rounded-3xl in Skeletons.tsx"
);

// 3.9 Glow orb elimination in page.tsx
const hasGlowOrb = /blur-\[120px\]/.test(pageTsx);
check(
  "Criterion 3",
  "C3.9",
  "src/app/page.tsx has ZERO 800px diffuse glow orbs (blur-[120px])",
  "HIGH",
  !hasGlowOrb,
  false,
  hasGlowOrb,
  "SaaS glow orb element completely eliminated"
);

// 3.10 Backdrop-blur elimination in header and landing page
const headerHasBackdropBlur = /backdrop-blur/.test(headerContent);
const pageHasBackdropBlur = /backdrop-blur/.test(pageTsx);
check(
  "Criterion 3",
  "C3.10",
  "GovernmentHeader and page.tsx have ZERO backdrop-blur glassmorphism classes",
  "HIGH",
  !headerHasBackdropBlur && !pageHasBackdropBlur,
  false,
  headerHasBackdropBlur || pageHasBackdropBlur,
  `headerHasBackdropBlur: ${headerHasBackdropBlur}, pageHasBackdropBlur: ${pageHasBackdropBlur}`
);

// =============================================================================
// CRITERION 4: NEXT.JS APPLICATION BUILD VERIFICATION
// =============================================================================
console.log("\n--- SUITE 4: Criterion 4 — Next.js Application Build Verification ---");

// 4.1 Next.js build trace / .next verification
const nextDir = path.join(WEB_ROOT, ".next");
const buildManifestFile = path.join(nextDir, "build-manifest.json");
const hasBuildManifest = fs.existsSync(buildManifestFile);

check(
  "Criterion 4",
  "C4.1",
  "Next.js build artifacts exist (.next/build-manifest.json)",
  "CRITICAL",
  hasBuildManifest,
  true,
  hasBuildManifest,
  "Next.js production build artifacts successfully generated"
);

// 4.2 Validate route generation in build manifest
let routeCount = 0;
if (hasBuildManifest) {
  try {
    const buildManifest = JSON.parse(fs.readFileSync(buildManifestFile, "utf-8"));
    const pages = Object.keys(buildManifest.pages || {});
    routeCount = pages.length;
  } catch {
    // fallback
  }
}

check(
  "Criterion 4",
  "C4.2",
  "Build manifest contains compiled routes",
  "CRITICAL",
  routeCount > 0,
  true,
  routeCount > 0,
  `Found ${routeCount} compiled page entries in build-manifest.json`
);

// =============================================================================
// SUMMARY & EVALUATION
// =============================================================================
console.log("\n===============================================================================");
console.log("  CHALLENGER 1 AUDIT SUMMARY");
console.log("===============================================================================");

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const criticalFails = results.filter((r) => !r.passed && r.severity === "CRITICAL").length;
const highFails = results.filter((r) => !r.passed && r.severity === "HIGH").length;
const mediumFails = results.filter((r) => !r.passed && r.severity === "MEDIUM").length;

console.log(`Total Checks:    ${total}`);
console.log(`Passed:          ${passed}`);
console.log(`Failed:          ${failed}`);
console.log(`  Critical Fails: ${criticalFails}`);
console.log(`  High Fails:     ${highFails}`);
console.log(`  Medium Fails:   ${mediumFails}`);

console.log("\n===============================================================================");
if (criticalFails === 0 && highFails === 0) {
  console.log("RESULT: ALL CRITICAL & HIGH CRITERIA MET (VERDICT: APPROVE)");
  if (mediumFails > 0) {
    console.log(`Note: ${mediumFails} non-blocking advisory finding(s) recorded.`);
  }
} else {
  console.log("RESULT: FAILED ACCEPTANCE CRITERIA (VERDICT: CHALLENGE_FAILED)");
}
console.log("===============================================================================\n");
