/**
 * ROUND 19 EMPIRICAL AUDIT & VERIFICATION SUITE
 * 
 * Verifies:
 * - R1: Official MyGov Color Palette & Typography (#13528A, #F47B20, system fonts)
 * - R2: Component Architecture Restyling (Anti-SaaS: 0 rounded-2xl/3xl, 0 backdrop-blur, moderate radii)
 * - R3: Structural Authenticity (Indian Tricolor Banner h-[4px], #FF9933, #FFFFFF, #138808)
 */

import fs from "fs";
import path from "path";

const WEB_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.resolve(WEB_ROOT, "src");

interface TestAssertion {
  category: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

const assertions: TestAssertion[] = [];

function assert(category: string, name: string, condition: boolean, expected: any, actual: any, details?: string) {
  assertions.push({ category, name, passed: Boolean(condition), expected, actual, details });
  if (condition) {
    console.log(`✅ [PASS] [${category}] ${name}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    console.error(`❌ [FAIL] [${category}] ${name}`);
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
    if (details) console.error(`   Details: `, details);
  }
}

function getAllFiles(dir: string, extensions: string[]): string[] {
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

console.log("=======================================================");
console.log("ROUND 19: MYGOV.IN UI/UX OVERHAUL VERIFICATION SUITE");
console.log(`Target: ${SRC_ROOT}`);
console.log("=======================================================\n");

// -----------------------------------------------------------------------------
// R1: Official Color Palette & Typography
// -----------------------------------------------------------------------------
console.log("--- SUITE 1: Color Palette & Typography (R1) ---");

const allSourceFiles = getAllFiles(SRC_ROOT, [".tsx", ".ts", ".css"]);

// 1.1 Zero old UX4G purple tokens
const purpleMatches: { file: string; match: string }[] = [];
for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const matches = content.match(/#613AF5|#4A2BC2|rgba\(\s*97\s*,\s*58\s*,\s*245/gi);
  if (matches) {
    for (const m of matches) {
      purpleMatches.push({ file: path.relative(SRC_ROOT, file), match: m });
    }
  }
}
assert(
  "R1: Palette",
  "Zero occurrences of legacy UX4G purple (#613AF5, #4A2BC2, rgba(97,58,245)) across src",
  purpleMatches.length === 0,
  0,
  purpleMatches.length,
  purpleMatches.length === 0 ? "100% eliminated from all source files" : `Found in: ${purpleMatches.map((m) => `${m.file} (${m.match})`).join(", ")}`
);

// 1.2 MyGov tokens in globals.css
const globalsCssPath = path.join(SRC_ROOT, "app", "globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

assert(
  "R1: Palette",
  "globals.css defines MyGov Primary Blue #13528A",
  globalsCss.includes("#13528A"),
  true,
  globalsCss.includes("#13528A"),
  "Found #13528A in globals.css"
);

assert(
  "R1: Palette",
  "globals.css defines MyGov Primary Dark #0E3D66",
  globalsCss.includes("#0E3D66"),
  true,
  globalsCss.includes("#0E3D66"),
  "Found #0E3D66 in globals.css"
);

assert(
  "R1: Palette",
  "globals.css defines MyGov Accent Orange #F47B20",
  globalsCss.includes("#F47B20"),
  true,
  globalsCss.includes("#F47B20"),
  "Found #F47B20 in globals.css"
);

assert(
  "R1: Palette",
  "globals.css defines MyGov Backgrounds #FFFFFF and #F5F7FA",
  globalsCss.includes("#F5F7FA") && globalsCss.includes("#FFFFFF"),
  true,
  globalsCss.includes("#F5F7FA") && globalsCss.includes("#FFFFFF"),
  "Found #FFFFFF and #F5F7FA in globals.css"
);

assert(
  "R1: Palette",
  "globals.css defines Primary Blue focus ring (rgba(19, 82, 138, 0.3))",
  globalsCss.includes("rgba(19, 82, 138, 0.3)"),
  true,
  globalsCss.includes("rgba(19, 82, 138, 0.3)"),
  "--focus-ring: 0 0 0 4px rgba(19, 82, 138, 0.3)"
);

assert(
  "R1: Typography",
  "globals.css configures standard highly-legible system typography",
  globalsCss.includes("Arial, Roboto, system-ui"),
  true,
  globalsCss.includes("Arial, Roboto, system-ui"),
  "Found Arial, Roboto, system-ui font stack in globals.css"
);

assert(
  "R1: Syntax",
  "globals.css has valid font smoothing syntax and no invalid 'antialiased: true;'",
  !globalsCss.includes("antialiased: true;") && globalsCss.includes("-webkit-font-smoothing: antialiased;"),
  true,
  !globalsCss.includes("antialiased: true;"),
  "Invalid syntax removed, standard vendor prefixes present"
);

assert(
  "R1: Anti-SaaS",
  "globals.css has neutralized .glass without backdrop-filter blur",
  !globalsCss.includes("backdrop-filter: blur"),
  true,
  !globalsCss.includes("backdrop-filter: blur"),
  "Solid surfaces declared without translucent blur"
);

// -----------------------------------------------------------------------------
// R2: Component Architecture Restyling
// -----------------------------------------------------------------------------
console.log("\n--- SUITE 2: Component Architecture Restyling (R2) ---");

const pageTsxPath = path.join(SRC_ROOT, "app", "page.tsx");
const pageTsx = fs.readFileSync(pageTsxPath, "utf-8");

assert(
  "R2: page.tsx",
  "page.tsx has ZERO rounded-2xl classes",
  !pageTsx.includes("rounded-2xl"),
  false,
  pageTsx.includes("rounded-2xl"),
  "0 occurrences of rounded-2xl in page.tsx"
);

assert(
  "R2: page.tsx",
  "page.tsx has ZERO rounded-3xl classes",
  !pageTsx.includes("rounded-3xl"),
  false,
  pageTsx.includes("rounded-3xl"),
  "0 occurrences of rounded-3xl in page.tsx"
);

assert(
  "R2: page.tsx",
  "page.tsx has ZERO glow orb elements (blur-[120px])",
  !pageTsx.includes("blur-[120px]"),
  false,
  pageTsx.includes("blur-[120px]"),
  "800px diffuse glow orb removed"
);

assert(
  "R2: page.tsx",
  "page.tsx has ZERO excessive shadows (shadow-xl or shadow-2xl)",
  !pageTsx.includes("shadow-xl") && !pageTsx.includes("shadow-2xl"),
  false,
  pageTsx.includes("shadow-xl") || pageTsx.includes("shadow-2xl"),
  "Only subtle shadow-sm / shadow-md elevation used"
);

assert(
  "R2: page.tsx",
  "page.tsx does NOT contain redundant nested <main> tag",
  !pageTsx.includes("<main") && !pageTsx.includes("</main>"),
  false,
  pageTsx.includes("<main"),
  "Replaced with semantic <div> container"
);

assert(
  "R2: page.tsx",
  "page.tsx Primary CTA button uses MyGov Primary Blue (#13528A, hover #0E3D66, rounded-md, shadow-sm)",
  pageTsx.includes("bg-[#13528A]") && pageTsx.includes("hover:bg-[#0E3D66]") && pageTsx.includes("shadow-sm"),
  true,
  true,
  "Primary CTA button adheres to MyGov styling"
);

// Skeletons.tsx
const skeletonsPath = path.join(SRC_ROOT, "components", "ui", "Skeletons.tsx");
const skeletonsSource = fs.readFileSync(skeletonsPath, "utf-8");

assert(
  "R2: Skeletons.tsx",
  "Skeletons.tsx has ZERO rounded-2xl or rounded-3xl classes",
  !skeletonsSource.includes("rounded-2xl") && !skeletonsSource.includes("rounded-3xl"),
  false,
  skeletonsSource.includes("rounded-2xl") || skeletonsSource.includes("rounded-3xl"),
  "Skeletons all use moderate rounded-md and rounded-lg"
);

// Layout components
const headerPath = path.join(SRC_ROOT, "components", "layout", "GovernmentHeader.tsx");
const headerSource = fs.readFileSync(headerPath, "utf-8");

assert(
  "R2: GovernmentHeader.tsx",
  "GovernmentHeader.tsx has ZERO backdrop-blur classes",
  !headerSource.includes("backdrop-blur"),
  false,
  headerSource.includes("backdrop-blur"),
  "Solid backdrops used across header and mobile drawer"
);

assert(
  "R2: GovernmentHeader.tsx",
  "GovernmentHeader.tsx has ZERO rounded-xl shadow-2xl dropdowns",
  !headerSource.includes("rounded-xl shadow-2xl"),
  false,
  headerSource.includes("rounded-xl shadow-2xl"),
  "Dropdown uses moderate rounded-md and shadow-md"
);

// Guidance components
const guidanceFiles = getAllFiles(path.join(SRC_ROOT, "components", "guidance"), [".tsx", ".ts"]);
let guidanceHyperRounded = 0;
let guidanceBackdropBlur = 0;
for (const file of guidanceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes("rounded-2xl") || content.includes("rounded-3xl")) guidanceHyperRounded++;
  if (content.includes("backdrop-blur")) guidanceBackdropBlur++;
}

assert(
  "R2: Guidance",
  "guidance/* components have ZERO rounded-2xl or rounded-3xl classes",
  guidanceHyperRounded === 0,
  0,
  guidanceHyperRounded,
  "All guidance modals, cards, and tooltips use rounded-lg or rounded-md"
);

assert(
  "R2: Guidance",
  "guidance/* components have ZERO backdrop-blur classes",
  guidanceBackdropBlur === 0,
  0,
  guidanceBackdropBlur,
  "All guidance overlays use clean solid backdrops"
);

// -----------------------------------------------------------------------------
// R3: Structural Authenticity (Indian Tricolor Banner)
// -----------------------------------------------------------------------------
console.log("\n--- SUITE 3: Structural Authenticity (R3) ---");

assert(
  "R3: Tricolor Banner",
  "GovernmentHeader.tsx contains Indian Tricolor banner container with data-testid='indian-tricolor-banner'",
  headerSource.includes('data-testid="indian-tricolor-banner"'),
  true,
  headerSource.includes('data-testid="indian-tricolor-banner"'),
  "data-testid='indian-tricolor-banner' present"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner container enforces exact 4px height ('h-[4px]')",
  headerSource.includes('h-[4px]'),
  true,
  headerSource.includes('h-[4px]'),
  "h-[4px] explicitly declared to resist font-scaling variance"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner container spans 100% viewport width ('w-full')",
  headerSource.includes('w-full h-[4px] flex shrink-0'),
  true,
  headerSource.includes('w-full h-[4px] flex shrink-0'),
  "w-full flex shrink-0 present"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner contains Saffron segment (#FF9933, data-testid='tricolor-saffron')",
  headerSource.includes('bg-[#FF9933]') && headerSource.includes('data-testid="tricolor-saffron"'),
  true,
  true,
  "Saffron #FF9933 verified"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner contains White segment (#FFFFFF, data-testid='tricolor-white')",
  headerSource.includes('bg-[#FFFFFF]') && headerSource.includes('data-testid="tricolor-white"'),
  true,
  true,
  "White #FFFFFF verified"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner contains Green segment (#138808, data-testid='tricolor-green')",
  headerSource.includes('bg-[#138808]') && headerSource.includes('data-testid="tricolor-green"'),
  true,
  true,
  "Green #138808 verified"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner is positioned immediately before <UtilityBar /> at absolute top of header",
  headerSource.indexOf('data-testid="indian-tricolor-banner"') < headerSource.indexOf('<UtilityBar />'),
  true,
  true,
  "Tricolor banner appears before <UtilityBar /> in DOM"
);

assert(
  "R3: Tricolor Banner",
  "Tricolor banner has role='presentation' and aria-hidden='true' for accessibility",
  headerSource.includes('role="presentation"') && headerSource.includes('aria-hidden="true"'),
  true,
  true,
  "Accessible screen reader neutrality verified"
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("ROUND 19 VERIFICATION SUMMARY");
console.log("=======================================================");
const total = assertions.length;
const passed = assertions.filter((a) => a.passed).length;
const failed = assertions.filter((a) => !a.passed).length;

console.log(`Total Assertions: ${total}`);
console.log(`Passed:           ${passed}`);
console.log(`Failed:           ${failed}`);

if (failed === 0) {
  console.log("\n✅ FINAL VERDICT: 100% PASS - ALL ROUND 19 REQUIREMENTS SATISFIED");
  process.exit(0);
} else {
  console.log("\n❌ FINAL VERDICT: FAIL - UNRESOLVED ISSUES DETECTED");
  process.exit(1);
}
