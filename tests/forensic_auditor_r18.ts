/**
 * FORENSIC AUDITOR 1 — ROUND 18 EMPIRICAL VERIFICATION ORACLE
 */

import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");

interface CheckResult {
  category: string;
  name: string;
  passed: boolean;
  evidence: string;
}

const checks: CheckResult[] = [];

function recordCheck(category: string, name: string, condition: boolean, evidence: string) {
  checks.push({
    category,
    name,
    passed: condition,
    evidence,
  });
  console.log(`${condition ? "✅ PASS" : "❌ FAIL"} [${category}] ${name}`);
  if (!condition) {
    console.error(`   Details: ${evidence}`);
  }
}

// 1. National Portal Linkage
const headerPath = path.join(projectRoot, "src/components/layout/GovernmentHeader.tsx");
const footerPath = path.join(projectRoot, "src/components/layout/GovernmentFooter.tsx");
const sitemapPath = path.join(projectRoot, "src/app/sitemap/page.tsx");
const problemCardPath = path.join(projectRoot, "src/components/ProblemCard.tsx");
const homePagePath = path.join(projectRoot, "src/app/page.tsx");
const layoutPath = path.join(projectRoot, "src/app/layout.tsx");

const headerSrc = fs.readFileSync(headerPath, "utf-8");
const footerSrc = fs.readFileSync(footerPath, "utf-8");
const sitemapSrc = fs.readFileSync(sitemapPath, "utf-8");
const problemCardSrc = fs.readFileSync(problemCardPath, "utf-8");
const homePageSrc = fs.readFileSync(homePagePath, "utf-8");
const layoutSrc = fs.readFileSync(layoutPath, "utf-8");

// Check 1.1: National Portal in Header
recordCheck(
  "R1 Statutory",
  "National Portal link (india.gov.in) present in GovernmentHeader.tsx",
  headerSrc.includes("https://india.gov.in") && headerSrc.includes("National Portal of India"),
  "Found https://india.gov.in with aria-label in GovernmentHeader"
);

// Check 1.2: National Portal in Footer
recordCheck(
  "R1 Statutory",
  "National Portal link (india.gov.in) present in GovernmentFooter.tsx",
  footerSrc.includes("https://india.gov.in") && footerSrc.includes("National Portal (india.gov.in)"),
  "Found https://india.gov.in with ExternalLink icon in GovernmentFooter"
);

// Check 1.3: National Portal in Sitemap
recordCheck(
  "R1 Statutory",
  "National Portal link present in sitemap/page.tsx",
  sitemapSrc.includes("https://india.gov.in"),
  "Found https://india.gov.in in statutory section of sitemap"
);

// Check 2: Global Search Mocked UI Component
recordCheck(
  "R1 Statutory",
  "Global Search mocked UI in GovernmentHeader.tsx has input, clear button, and dropdown overlay",
  headerSrc.includes("type=\"search\"") &&
    headerSrc.includes("isSearchDropdownOpen") &&
    headerSrc.includes("searchSuggestions") &&
    headerSrc.includes("setSelectedCategory"),
  "Found search input, state, suggestions, category filters, and dropdown overlay"
);

// Check 3: Site Map Link & Route
recordCheck(
  "R1 Statutory",
  "Site Map link (/sitemap) present in GovernmentFooter.tsx",
  footerSrc.includes("href=\"/sitemap\""),
  "Found /sitemap link in footer navigation"
);

recordCheck(
  "R1 Statutory",
  "Sitemap page file exists and contains semantic categories",
  fs.existsSync(sitemapPath) && sitemapSrc.includes("PRAGATI Portal Site Map"),
  "Found sitemap/page.tsx with comprehensive categories"
);

// Check 4: Mathematical Luminance & Contrast Calculation
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Amber-800 (#92400E) on Amber-50 (#FFFBEB)
const highBadgeContrast = contrastRatio("#92400E", "#FFFBEB");
recordCheck(
  "R1 WCAG 2.1 AA",
  `HIGH badge contrast ratio >= 4.5:1 (calculated: ${highBadgeContrast.toFixed(2)}:1)`,
  highBadgeContrast >= 4.5 && problemCardSrc.includes("text-amber-800") && problemCardSrc.includes("bg-amber-50"),
  `Amber-800 on Amber-50 yields ${highBadgeContrast.toFixed(2)}:1 (threshold: 4.5:1)`
);

// Red-700 (#B91C1C) on Red-50 (#FEF2F2)
const criticalBadgeContrast = contrastRatio("#B91C1C", "#FEF2F2");
recordCheck(
  "R1 WCAG 2.1 AA",
  `CRITICAL badge contrast ratio >= 4.5:1 (calculated: ${criticalBadgeContrast.toFixed(2)}:1)`,
  criticalBadgeContrast >= 4.5 && problemCardSrc.includes("text-red-700") && problemCardSrc.includes("bg-red-50"),
  `Red-700 on Red-50 yields ${criticalBadgeContrast.toFixed(2)}:1 (threshold: 4.5:1)`
);

// Check 5: Residual Branding Removal
const nextSvgExists = fs.existsSync(path.join(projectRoot, "public/next.svg"));
const vercelSvgExists = fs.existsSync(path.join(projectRoot, "public/vercel.svg"));
recordCheck(
  "R2 Visual Fixes",
  "public/next.svg and public/vercel.svg removed",
  !nextSvgExists && !vercelSvgExists,
  `next.svg: ${nextSvgExists}, vercel.svg: ${vercelSvgExists}`
);

recordCheck(
  "R2 Visual Fixes",
  "Footer DOM contains 0 references to next.svg or vercel.svg",
  !footerSrc.includes("next.svg") && !footerSrc.includes("vercel.svg"),
  "0 references to Next/Vercel assets in GovernmentFooter.tsx"
);

recordCheck(
  "R2 Visual Fixes",
  "layout.tsx metadata explicitly configures official icon.svg",
  layoutSrc.includes('icon: "/icon.svg"'),
  "Custom icon.svg configured in RootLayout metadata"
);

// Check 6: Footer Deduplication
const privacyPolicyMatches = (footerSrc.match(/Privacy Policy/g) || []).length;
const termsMatches = (footerSrc.match(/Terms of Use/g) || []).length;
recordCheck(
  "R2 Visual Fixes",
  "Privacy Policy and Terms of Use are deduplicated in footer",
  privacyPolicyMatches === 1 && termsMatches === 1,
  `Found Privacy Policy count=${privacyPolicyMatches}, Terms of Use count=${termsMatches}`
);

// Check 7: Emblem Vertical Spacing
recordCheck(
  "R2 Visual Fixes",
  "State emblem in GovernmentHeader has increased padding (py-4 sm:py-5 lg:py-6, p-2 sm:p-2.5)",
  headerSrc.includes("py-4 sm:py-5 lg:py-6") && headerSrc.includes("p-2 sm:p-2.5"),
  "Generous vertical padding applied to header bar and emblem wrapper"
);

// Check 8: Card Bottom-Row Alignment
recordCheck(
  "R3 UI/UX",
  "ProblemCard.tsx enforces mt-auto on footer action bar and flex-1 on body",
  problemCardSrc.includes("mt-auto") && problemCardSrc.includes("flex-1 flex flex-col"),
  "Bottom-row elements bound to mt-auto with flex-1 body"
);

recordCheck(
  "R3 UI/UX",
  "page.tsx enforces mt-auto on challenge card bottom row and flex-1 on body",
  homePageSrc.includes("mt-auto") && homePageSrc.includes("flex-1 flex flex-col"),
  "Homepage cards use mt-auto and flex-1 flex flex-col"
);

// Check 9: Urgency Left Borders
recordCheck(
  "R3 UI/UX",
  "ProblemCard.tsx applies 4px left border conditionally (Red for CRITICAL, Amber for HIGH, none for others)",
  problemCardSrc.includes("border-l-4 border-l-red-600") &&
    problemCardSrc.includes("border-l-4 border-l-amber-500") &&
    problemCardSrc.includes('case "MEDIUM":') &&
    problemCardSrc.includes('return "";'),
  "Found exact 4px border logic in getUrgencyBorderClass"
);

recordCheck(
  "R3 UI/UX",
  "page.tsx applies 4px left border conditionally (Red for CRITICAL, Amber for HIGH, none for others)",
  homePageSrc.includes('challenge.urgency === "CRITICAL"') &&
    homePageSrc.includes('"border-l-4 border-l-red-600"') &&
    homePageSrc.includes('"border-l-4 border-l-amber-500"'),
  "Found exact urgency border mapping in page.tsx"
);

// Check 10: Homepage Portal Login Hierarchy
recordCheck(
  "R3 UI/UX",
  "Homepage Portal Login button has outlined/ghost hierarchy with focus halo",
  homePageSrc.includes("border border-slate-300") &&
    homePageSrc.includes("bg-transparent") &&
    homePageSrc.includes("focus:ring-4 focus:ring-[#613AF5]/30"),
  "Found outlined ghost button styling with purple focus halo on Portal Login"
);

console.log("\n=======================================================");
console.log("FORENSIC AUDIT SUMMARY");
console.log("=======================================================");
const failed = checks.filter((c) => !c.passed);
console.log(`Total Checks: ${checks.length}`);
console.log(`Passed      : ${checks.length - failed.length}`);
console.log(`Failed      : ${failed.length}`);

if (failed.length > 0) {
  console.error("❌ VERDICT: INTEGRITY VIOLATION");
  process.exit(1);
} else {
  console.log("✅ VERDICT: CLEAN");
  process.exit(0);
}
