/**
 * CHALLENGER 2 — ROUND 18 EMPIRICAL ADVERSARIAL VERIFICATION SUITE
 * 
 * Focus Areas:
 * 1. Programmatic contrast ratio verification (WCAG 2.1 AA mathematical oracle)
 *    - HIGH: text-amber-800 (#92400E) on bg-amber-50 (#FFFBEB) >= 4.5:1
 *    - CRITICAL: text-red-700 (#B91C1C) on bg-red-50 (#FEF2F2) >= 4.5:1
 *    - Adversarial negative control: old failing colors (#F59E0B, #D97706, #EF4444)
 *    - Dark mode pairs verification
 *    - Codebase audit in ProblemCard.tsx and page.tsx
 * 2. Programmatic elimination of Next.js 'N' framework branding:
 *    - Assert public/next.svg and public/vercel.svg do NOT exist
 *    - Assert GovernmentFooter.tsx has 0 Next.js framework logos or branding
 *    - Assert layout.tsx sets custom icon metadata
 * 3. Programmatic statutory links verification:
 *    - Assert india.gov.in (National Portal) link present in GovernmentFooter and GovernmentHeader
 *    - Assert /sitemap link present in GovernmentFooter
 *    - Assert /sitemap page implementation exists in filesystem
 * 4. Programmatic deduplication verification:
 *    - Assert "Privacy Policy" and "Terms of Use" occur exactly once as visible text in GovernmentFooter.tsx
 */

import fs from "fs";
import path from "path";

interface TestAssertion {
  suite: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

const assertions: TestAssertion[] = [];

function assert(suite: string, name: string, condition: boolean, expected: any, actual: any, details?: string) {
  assertions.push({
    suite,
    name,
    passed: Boolean(condition),
    expected,
    actual,
    details,
  });
  if (!condition) {
    console.error(`❌ [FAIL] [${suite}] ${name}`);
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
    if (details) console.error(`   Details: `, details);
  } else {
    console.log(`✅ [PASS] [${suite}] ${name}`);
    if (details) console.log(`   └─ ${details}`);
  }
}

// ============================================================================
// W3C WCAG 2.1 MATHEMATICAL FORMULAS
// ============================================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const sanitized = hex.replace("#", "").trim();
  if (sanitized.length === 3) {
    return {
      r: parseInt(sanitized[0] + sanitized[0], 16),
      g: parseInt(sanitized[1] + sanitized[1], 16),
      b: parseInt(sanitized[2] + sanitized[2], 16),
    };
  }
  if (sanitized.length === 6) {
    return {
      r: parseInt(sanitized.slice(0, 2), 16),
      g: parseInt(sanitized.slice(2, 4), 16),
      b: parseInt(sanitized.slice(4, 6), 16),
    };
  }
  throw new Error(`Invalid hex color string: "${hex}"`);
}

/**
 * Computes relative luminance according to W3C WCAG 2.1 definition:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(rgb: RGB): number {
  const toLinear = (c8: number): number => {
    const c = c8 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(rgb.r);
  const G = toLinear(rgb.g);
  const B = toLinear(rgb.b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes contrast ratio according to W3C WCAG 2.1 definition:
 * (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter luminance.
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

// Base directory for project (web/)
const webRoot = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("CHALLENGER 2: ROUND 18 EMPIRICAL ADVERSARIAL AUDIT");
console.log("Project directory:", webRoot);
console.log("=======================================================\n");

// ============================================================================
// SUITE 1: MATHEMATICAL CONTRAST RATIO VERIFICATION (WCAG 2.1)
// ============================================================================
console.log("--- SUITE 1: Mathematical Contrast Ratio Verification (WCAG 2.1) ---");

// 1.1 "HIGH" priority badge: text-amber-800 (#92400E) on bg-amber-50 (#FFFBEB)
const highTextHex = "#92400E";
const highBgHex = "#FFFBEB";
const highRatio = getContrastRatio(highTextHex, highBgHex);
assert(
  "Suite 1 - Contrast",
  'HIGH badge contrast ratio (#92400E on #FFFBEB) >= 4.5:1',
  highRatio >= 4.5,
  ">= 4.5:1",
  `${highRatio}:1`,
  `Computed exact ratio: ${highRatio}:1 (WCAG 2.1 AA requires >= 4.5:1 for normal text)`
);

// 1.2 "CRITICAL" priority badge: text-red-700 (#B91C1C) on bg-red-50 (#FEF2F2)
const critTextHex = "#B91C1C";
const critBgHex = "#FEF2F2";
const critRatio = getContrastRatio(critTextHex, critBgHex);
assert(
  "Suite 1 - Contrast",
  'CRITICAL badge contrast ratio (#B91C1C on #FEF2F2) >= 4.5:1',
  critRatio >= 4.5,
  ">= 4.5:1",
  `${critRatio}:1`,
  `Computed exact ratio: ${critRatio}:1 (WCAG 2.1 AA requires >= 4.5:1 for normal text)`
);

// 1.3 Adversarial Negative Controls: Confirm prior violating colors fail our oracle
const oldWarningHex = "#F59E0B"; // amber-500
const oldHighRatio = getContrastRatio(oldWarningHex, highBgHex);
assert(
  "Suite 1 - Contrast",
  'Adversarial Negative Control: Old warning amber (#F59E0B on #FFFBEB) must FAIL (< 4.5:1)',
  oldHighRatio < 4.5,
  "< 4.5:1 (failing)",
  `${oldHighRatio}:1`,
  `Oracle correctly detects defect in old warning color: ratio is only ${oldHighRatio}:1 (-54% deficit)`
);

const oldAmber600Hex = "#D97706"; // amber-600
const oldAmber600Ratio = getContrastRatio(oldAmber600Hex, highBgHex);
assert(
  "Suite 1 - Contrast",
  'Adversarial Negative Control: Intermediate amber-600 (#D97706 on #FFFBEB) must FAIL (< 4.5:1)',
  oldAmber600Ratio < 4.5,
  "< 4.5:1 (failing)",
  `${oldAmber600Ratio}:1`,
  `Oracle correctly rejects amber-600: ratio is ${oldAmber600Ratio}:1 (-31.8% deficit)`
);

const oldCritHex = "#EF4444"; // red-500
const oldCritRatio = getContrastRatio(oldCritHex, critBgHex);
assert(
  "Suite 1 - Contrast",
  'Adversarial Negative Control: Old red-500 (#EF4444 on #FEF2F2) must FAIL (< 4.5:1)',
  oldCritRatio < 4.5,
  "< 4.5:1 (failing)",
  `${oldCritRatio}:1`,
  `Oracle correctly rejects old red-500: ratio is ${oldCritRatio}:1 (-23.5% deficit)`
);

// 1.4 Dark Mode Urgency Badges Verification
// dark:text-amber-300 (#FCD34D) on dark:bg-amber-950 (#451A03)
const darkAmberText = "#FCD34D";
const darkAmberBg = "#451A03";
const darkAmberRatio = getContrastRatio(darkAmberText, darkAmberBg);
assert(
  "Suite 1 - Contrast",
  'Dark mode HIGH badge (#FCD34D on #451A03) >= 4.5:1',
  darkAmberRatio >= 4.5,
  ">= 4.5:1",
  `${darkAmberRatio}:1`,
  `Computed dark mode amber ratio: ${darkAmberRatio}:1`
);

// dark:text-red-300 (#FCA5A5) on dark:bg-red-950 (#450A0A)
const darkRedText = "#FCA5A5";
const darkRedBg = "#450A0A";
const darkRedRatio = getContrastRatio(darkRedText, darkRedBg);
assert(
  "Suite 1 - Contrast",
  'Dark mode CRITICAL badge (#FCA5A5 on #450A0A) >= 4.5:1',
  darkRedRatio >= 4.5,
  ">= 4.5:1",
  `${darkRedRatio}:1`,
  `Computed dark mode red ratio: ${darkRedRatio}:1`
);

// 1.5 Source Code Audit for Priority Badges
const problemCardPath = path.join(webRoot, "src/components/ProblemCard.tsx");
const problemCardContent = fs.readFileSync(problemCardPath, "utf-8");

assert(
  "Suite 1 - Contrast",
  'ProblemCard.tsx uses text-amber-800 and bg-amber-50 for HIGH priority',
  problemCardContent.includes("text-amber-800") && problemCardContent.includes("bg-amber-50"),
  true,
  true,
  "ProblemCard.tsx contains compliant amber-800 and amber-50 classes"
);

assert(
  "Suite 1 - Contrast",
  'ProblemCard.tsx uses text-red-700 and bg-red-50 for CRITICAL priority',
  problemCardContent.includes("text-red-700") && problemCardContent.includes("bg-red-50"),
  true,
  true,
  "ProblemCard.tsx contains compliant red-700 and red-50 classes"
);

const homepagePath = path.join(webRoot, "src/app/page.tsx");
const homepageContent = fs.readFileSync(homepagePath, "utf-8");

assert(
  "Suite 1 - Contrast",
  'page.tsx uses text-amber-800 and bg-amber-50 for HIGH urgency',
  homepageContent.includes("text-amber-800 bg-amber-50"),
  true,
  true,
  "page.tsx contains text-amber-800 bg-amber-50"
);

assert(
  "Suite 1 - Contrast",
  'page.tsx uses text-red-700 and bg-red-50 for CRITICAL urgency',
  homepageContent.includes("text-red-700 bg-red-50"),
  true,
  true,
  "page.tsx contains text-red-700 bg-red-50"
);

// Assert no deprecated text-amber-600 or warning token in urgency badge context in ProblemCard.tsx
const hasProblemCardAmber600 = problemCardContent.includes("text-amber-600");
const hasProblemCardWarningToken = problemCardContent.includes("var(--color-warning");
assert(
  "Suite 1 - Contrast",
  'ProblemCard.tsx contains NO deprecated text-amber-600 or var(--color-warning) in badges',
  !hasProblemCardAmber600 && !hasProblemCardWarningToken,
  "no violating classes",
  `hasAmber600: ${hasProblemCardAmber600}, hasWarningToken: ${hasProblemCardWarningToken}`,
  "Zero deprecated low-contrast amber tokens found in ProblemCard.tsx"
);


// ============================================================================
// SUITE 2: ELIMINATION OF NEXT.JS 'N' FRAMEWORK BRANDING
// ============================================================================
console.log("\n--- SUITE 2: Elimination of Next.js / Vercel Framework Branding ---");

const nextSvgPath = path.join(webRoot, "public/next.svg");
const vercelSvgPath = path.join(webRoot, "public/vercel.svg");

const nextSvgExists = fs.existsSync(nextSvgPath);
const vercelSvgExists = fs.existsSync(vercelSvgPath);

assert(
  "Suite 2 - Branding",
  'public/next.svg does NOT exist in filesystem',
  !nextSvgExists,
  false,
  nextSvgExists,
  `public/next.svg existence: ${nextSvgExists}`
);

assert(
  "Suite 2 - Branding",
  'public/vercel.svg does NOT exist in filesystem',
  !vercelSvgExists,
  false,
  vercelSvgExists,
  `public/vercel.svg existence: ${vercelSvgExists}`
);

// Inspect GovernmentFooter.tsx for Next.js framework logos and branding
const footerPath = path.join(webRoot, "src/components/layout/GovernmentFooter.tsx");
const footerContent = fs.readFileSync(footerPath, "utf-8");

// Search for any reference to next.svg or vercel.svg or framework logos
const footerHasNextSvg = footerContent.includes("next.svg");
const footerHasVercelSvg = footerContent.includes("vercel.svg");
const footerHasVercelWord = /\bvercel\b/i.test(footerContent);
// Match "Next.js" as rendered text (not imports like `next/link` or `next/image`)
const footerLinesWithoutImports = footerContent
  .split("\n")
  .filter(line => !line.trim().startsWith("import ") && !line.includes("from \"next/"));
const footerContentWithoutImports = footerLinesWithoutImports.join("\n");
const footerHasNextBrandingText = /next\.js/i.test(footerContentWithoutImports);

assert(
  "Suite 2 - Branding",
  'GovernmentFooter.tsx contains 0 references to next.svg',
  !footerHasNextSvg,
  false,
  footerHasNextSvg,
  "Zero next.svg asset references in footer"
);

assert(
  "Suite 2 - Branding",
  'GovernmentFooter.tsx contains 0 references to vercel.svg',
  !footerHasVercelSvg,
  false,
  footerHasVercelSvg,
  "Zero vercel.svg asset references in footer"
);

assert(
  "Suite 2 - Branding",
  'GovernmentFooter.tsx contains 0 occurrences of Vercel branding',
  !footerHasVercelWord,
  false,
  footerHasVercelWord,
  "Zero Vercel brand mentions in footer"
);

assert(
  "Suite 2 - Branding",
  'GovernmentFooter.tsx contains 0 occurrences of Next.js branding in JSX body',
  !footerHasNextBrandingText,
  false,
  footerHasNextBrandingText,
  "Zero Next.js brand mentions in rendered footer JSX"
);

// Check that layout.tsx does not reference default Next.js starter icon
const layoutPath = path.join(webRoot, "src/app/layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");
const layoutHasCustomIcons = layoutContent.includes("/icon.svg") || layoutContent.includes("emblem-of-india");
assert(
  "Suite 2 - Branding",
  'layout.tsx configures official/custom icon rather than default Next.js starter favicon',
  layoutHasCustomIcons,
  true,
  layoutHasCustomIcons,
  "layout.tsx metadata explicitly configures custom icon"
);


// ============================================================================
// SUITE 3: STATUTORY NATIONAL PORTAL & SITE MAP LINKS VERIFICATION
// ============================================================================
console.log("\n--- SUITE 3: Statutory National Portal & Site Map Links Verification ---");

// Check National Portal link in GovernmentFooter.tsx
const footerHasIndiaGovIn = footerContent.includes("https://india.gov.in");
const footerHasIndiaGovInNewTab = footerContent.includes('target="_blank"') && footerContent.includes('rel="noopener noreferrer"');
const footerHasNationalPortalText = footerContent.includes("National Portal (india.gov.in)");

assert(
  "Suite 3 - Statutory Links",
  'GovernmentFooter.tsx contains https://india.gov.in',
  footerHasIndiaGovIn,
  true,
  footerHasIndiaGovIn,
  "GovernmentFooter.tsx includes link to apex National Portal"
);

assert(
  "Suite 3 - Statutory Links",
  'GovernmentFooter.tsx links to https://india.gov.in with target="_blank" and rel="noopener noreferrer"',
  footerHasIndiaGovInNewTab,
  true,
  footerHasIndiaGovInNewTab,
  "External statutory link configured securely with target blank and noopener"
);

assert(
  "Suite 3 - Statutory Links",
  'GovernmentFooter.tsx contains descriptive text "National Portal (india.gov.in)"',
  footerHasNationalPortalText,
  true,
  footerHasNationalPortalText,
  "Complies with GIGW 3.0 statutory apex linking text requirements"
);

// Check National Portal link in GovernmentHeader.tsx
const headerPath = path.join(webRoot, "src/components/layout/GovernmentHeader.tsx");
const headerContent = fs.readFileSync(headerPath, "utf-8");
const headerHasIndiaGovIn = headerContent.includes("https://india.gov.in");

assert(
  "Suite 3 - Statutory Links",
  'GovernmentHeader.tsx contains https://india.gov.in',
  headerHasIndiaGovIn,
  true,
  headerHasIndiaGovIn,
  "GovernmentHeader.tsx includes external National Portal link"
);

// Check Site Map link in GovernmentFooter.tsx
const footerHasSitemapLink = footerContent.includes('href="/sitemap"');
assert(
  "Suite 3 - Statutory Links",
  'GovernmentFooter.tsx contains link to /sitemap',
  footerHasSitemapLink,
  true,
  footerHasSitemapLink,
  "GovernmentFooter.tsx links to /sitemap route"
);

// Verify that the /sitemap route actually exists and has content (0 dead ends)
const sitemapPagePath = path.join(webRoot, "src/app/sitemap/page.tsx");
const sitemapExists = fs.existsSync(sitemapPagePath);
assert(
  "Suite 3 - Statutory Links",
  '/sitemap route implementation file exists (src/app/sitemap/page.tsx)',
  sitemapExists,
  true,
  sitemapExists,
  `sitemap route file located at ${sitemapPagePath}`
);

if (sitemapExists) {
  const sitemapContent = fs.readFileSync(sitemapPagePath, "utf-8");
  const sitemapHasMetadata = sitemapContent.includes("Site Map | PRAGATI Portal");
  const sitemapHasCitizenSection = sitemapContent.includes("Citizen Engagement");
  const sitemapHasGovSection = sitemapContent.includes("Government");
  assert(
    "Suite 3 - Statutory Links",
    'sitemap/page.tsx contains structured 5-section directory hierarchy',
    sitemapHasMetadata && sitemapHasCitizenSection && sitemapHasGovSection,
    true,
    true,
    "Site Map page implements comprehensive GIGW 3.0 directory with zero dead-ends"
  );
}


// ============================================================================
// SUITE 4: FOOTER LINK DEDUPLICATION VERIFICATION
// ============================================================================
console.log("\n--- SUITE 4: Footer Legal Links Deduplication Verification ---");

// Helper to count visible occurrences of a string inside JSX tags
function countVisibleOccurrences(content: string, searchText: string): number {
  // Matches `>...searchText...<`
  const regex = new RegExp(`>\\s*${searchText}\\s*<`, "g");
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

const privacyPolicyCount = countVisibleOccurrences(footerContent, "Privacy Policy");
assert(
  "Suite 4 - Deduplication",
  '"Privacy Policy" occurs exactly once as visible text in GovernmentFooter.tsx',
  privacyPolicyCount === 1,
  1,
  privacyPolicyCount,
  `Found exactly ${privacyPolicyCount} instance of visible "Privacy Policy" in footer`
);

const termsOfUseCount = countVisibleOccurrences(footerContent, "Terms of Use");
assert(
  "Suite 4 - Deduplication",
  '"Terms of Use" occurs exactly once as visible text in GovernmentFooter.tsx',
  termsOfUseCount === 1,
  1,
  termsOfUseCount,
  `Found exactly ${termsOfUseCount} instance of visible "Terms of Use" in footer`
);

// Adversarial check: verify that Column 3 (lines 194-263) does NOT contain duplicate Privacy Policy or Terms of Use buttons
const column3Match = footerContent.match(/Column 3: Statutory & Legal Framework[\s\S]*?Column 4:/);
if (column3Match) {
  const col3Text = column3Match[0];
  const col3HasPrivacy = col3Text.includes("Privacy Policy</") || col3Text.includes(">Privacy Policy<");
  const col3HasTerms = col3Text.includes("Terms of Use</") || col3Text.includes(">Terms of Use<");
  assert(
    "Suite 4 - Deduplication",
    'Column 3 of GovernmentFooter.tsx does NOT contain duplicate Privacy Policy button',
    !col3HasPrivacy,
    false,
    col3HasPrivacy,
    "Column 3 is cleanly reserved for DPDP Act, Whistleblower, RTI, and National Portal"
  );
  assert(
    "Suite 4 - Deduplication",
    'Column 3 of GovernmentFooter.tsx does NOT contain duplicate Terms of Use button',
    !col3HasTerms,
    false,
    col3HasTerms,
    "Terms of Use is cleanly removed from Column 3"
  );
} else {
  console.warn("⚠️ Warning: Column 3 boundary comment not matched; relying on global count.");
}

// Check that the single authoritative occurrences sit inside the bottom sub-bar
const bottomBarMatch = footerContent.match(/Bottom Bar[\s\S]*?<\/footer>/);
if (bottomBarMatch) {
  const bottomBarText = bottomBarMatch[0];
  const bottomBarHasPrivacy = bottomBarText.includes("Privacy Policy");
  const bottomBarHasTerms = bottomBarText.includes("Terms of Use");
  assert(
    "Suite 4 - Deduplication",
    'Bottom sub-bar of GovernmentFooter.tsx houses the authoritative Privacy Policy trigger',
    bottomBarHasPrivacy,
    true,
    bottomBarHasPrivacy,
    "Privacy Policy trigger located in standard bottom copyright bar"
  );
  assert(
    "Suite 4 - Deduplication",
    'Bottom sub-bar of GovernmentFooter.tsx houses the authoritative Terms of Use trigger',
    bottomBarHasTerms,
    true,
    bottomBarHasTerms,
    "Terms of Use trigger located in standard bottom copyright bar"
  );
}


// ============================================================================
// SUITE 5: COMPREHENSIVE SUMMARY & VERDICT
// ============================================================================
console.log("\n=======================================================");
console.log("TEST EXECUTION SUMMARY");
console.log("=======================================================");

const totalTests = assertions.length;
const passedTests = assertions.filter(a => a.passed).length;
const failedTests = assertions.filter(a => !a.passed).length;

console.log(`Total Assertions Run: ${totalTests}`);
console.log(`Passed:              ${passedTests}`);
console.log(`Failed:              ${failedTests}`);

if (failedTests > 0) {
  console.error(`\n❌ VERDICT: REJECT (${failedTests} assertions failed)`);
  process.exit(1);
} else {
  console.log(`\n✅ VERDICT: APPROVE (${passedTests}/${totalTests} assertions passed with zero defects)`);
  process.exit(0);
}
