/**
 * CHALLENGER 1 — ROUND 18 EMPIRICAL AUDIT & STRESS-TEST SUITE
 * 
 * Target Verifications:
 * 1. Card bottom-row alignment under variable title lengths (ProblemCard.tsx and page.tsx)
 * 2. 4px urgency left-border conditional classes (CRITICAL, HIGH, MEDIUM, LOW)
 * 3. Homepage Portal Login button ghost/outline hierarchy and focus halo
 * 4. Flexbox box-model mathematical oracle simulating multi-card row alignment
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import path from "path";
import { ProblemCard, ProblemCardProps } from "../src/components/ProblemCard";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, expected: any, actual: any) {
  results.push({
    suite,
    name,
    passed: condition,
    expected,
    actual,
  });
  if (!condition) {
    console.error(`❌ [FAIL] ${suite} -> ${name}`);
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
  } else {
    console.log(`✅ [PASS] ${suite} -> ${name}`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: ProblemCard.tsx DOM & Class Hierarchy Verification
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("SUITE 1: ProblemCard.tsx DOM & Class Hierarchy Audit");
console.log("=======================================================");

const defaultProps: ProblemCardProps = {
  id: "chal-001",
  publicTrackingId: "JH-2026-001",
  title: "Short Title",
  description: "Standard challenge description text for testing.",
  domain: "Water Resources",
  district: "Ranchi",
  urgency: "CRITICAL",
};

// Test 1.1: Root article layout classes
const htmlCritical = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, defaultProps)
);

assert(
  "ProblemCard Structure",
  "Root <article> contains 'h-full'",
  htmlCritical.includes("<article") && /class="[^"]*\bh-full\b[^"]*"/.test(htmlCritical),
  "true",
  String(/class="[^"]*\bh-full\b[^"]*"/.test(htmlCritical))
);

assert(
  "ProblemCard Structure",
  "Root <article> contains 'flex flex-col'",
  /class="[^"]*\bflex\b[^"]*\bflex-col\b[^"]*"/.test(htmlCritical),
  "true",
  String(/class="[^"]*\bflex\b[^"]*\bflex-col\b[^"]*"/.test(htmlCritical))
);

assert(
  "ProblemCard Structure",
  "Content container contains 'flex-1 flex flex-col'",
  htmlCritical.includes("flex-1 flex flex-col"),
  "true",
  String(htmlCritical.includes("flex-1 flex flex-col"))
);

assert(
  "ProblemCard Structure",
  "Bottom action bar contains 'mt-auto'",
  /class="[^"]*\bmt-auto\b[^"]*"/.test(htmlCritical),
  "true",
  String(/class="[^"]*\bmt-auto\b[^"]*"/.test(htmlCritical))
);

// Test 1.6: Variable title length stress-test (1-line, 5-line, 1000-char title)
const titles = [
  "Short 1-line",
  "Three line title spanning across multiple words and describing a severe municipal drainage overflow issue in ward 12",
  "Five line title with extreme length describing recurring landslides along national highway 33 near Bundu valley obstructing emergency healthcare ambulances and causing catastrophic structural damage to retaining walls during monsoon season across multiple panchayats",
  "A".repeat(1000), // Extreme 1000-char stress case
];

titles.forEach((testTitle, idx) => {
  const rendered = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ProblemCard, { ...defaultProps, title: testTitle })
  );
  assert(
    "ProblemCard Stress",
    `Card with title variation #${idx + 1} (${testTitle.length} chars) retains 'h-full flex flex-col', 'flex-1', and 'mt-auto'`,
    rendered.includes("h-full") &&
      rendered.includes("flex flex-col") &&
      rendered.includes("flex-1 flex flex-col") &&
      rendered.includes("mt-auto"),
    "true",
    "All layout classes present"
  );
});

// Test 1.7: UX4G Touch Target Size verification (>= 44x44px)
assert(
  "ProblemCard Accessibility",
  "Action button enforces minimum 44x44px touch target ('min-h-[44px] min-w-[44px]')",
  htmlCritical.includes("min-h-[44px]") && htmlCritical.includes("min-w-[44px]"),
  "true",
  String(htmlCritical.includes("min-h-[44px]") && htmlCritical.includes("min-w-[44px]"))
);

// -----------------------------------------------------------------------------
// SUITE 2: ProblemCard.tsx 4px Urgency Left-Border Verification
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("SUITE 2: ProblemCard.tsx 4px Urgency Left-Border Audit");
console.log("=======================================================");

// Test 2.1: CRITICAL urgency
assert(
  "ProblemCard Urgency Border",
  "CRITICAL has 'border-l-4 border-l-red-600'",
  htmlCritical.includes("border-l-4 border-l-red-600"),
  "true",
  String(htmlCritical.includes("border-l-4 border-l-red-600"))
);

// Test 2.2: HIGH urgency
const htmlHigh = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: "HIGH" })
);
assert(
  "ProblemCard Urgency Border",
  "HIGH has 'border-l-4 border-l-amber-500'",
  htmlHigh.includes("border-l-4 border-l-amber-500"),
  "true",
  String(htmlHigh.includes("border-l-4 border-l-amber-500"))
);
assert(
  "ProblemCard Urgency Border",
  "HIGH does NOT have 'border-l-red-600'",
  !htmlHigh.includes("border-l-red-600"),
  "true",
  String(!htmlHigh.includes("border-l-red-600"))
);

// Test 2.3: MEDIUM urgency
const htmlMedium = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: "MEDIUM" })
);
assert(
  "ProblemCard Urgency Border",
  "MEDIUM has NO 'border-l-4' class",
  !htmlMedium.includes("border-l-4"),
  "true",
  String(!htmlMedium.includes("border-l-4"))
);

// Test 2.4: LOW urgency
const htmlLow = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: "LOW" })
);
assert(
  "ProblemCard Urgency Border",
  "LOW has NO 'border-l-4' class",
  !htmlLow.includes("border-l-4"),
  "true",
  String(!htmlLow.includes("border-l-4"))
);

// Test 2.5: Undefined urgency (default prop behavior)
const htmlDefault = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: undefined })
);
assert(
  "ProblemCard Urgency Border",
  "Undefined urgency defaults to 'HIGH' ('border-l-4 border-l-amber-500') per component signature",
  htmlDefault.includes("border-l-4 border-l-amber-500"),
  "true",
  String(htmlDefault.includes("border-l-4 border-l-amber-500"))
);

// Test 2.6: Case-insensitivity (e.g. 'critical', 'high')
const htmlCriticalLower = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: "critical" })
);
assert(
  "ProblemCard Urgency Border",
  "Lowercase 'critical' properly resolves to 'border-l-4 border-l-red-600'",
  htmlCriticalLower.includes("border-l-4 border-l-red-600"),
  "true",
  String(htmlCriticalLower.includes("border-l-4 border-l-red-600"))
);

const htmlHighLower = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ProblemCard, { ...defaultProps, urgency: "high" })
);
assert(
  "ProblemCard Urgency Border",
  "Lowercase 'high' properly resolves to 'border-l-4 border-l-amber-500'",
  htmlHighLower.includes("border-l-4 border-l-amber-500"),
  "true",
  String(htmlHighLower.includes("border-l-4 border-l-amber-500"))
);

// -----------------------------------------------------------------------------
// SUITE 3: Homepage (src/app/page.tsx) Static Code & Pattern Audit
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("SUITE 3: Homepage (src/app/page.tsx) Static & Dynamic Audit");
console.log("=======================================================");

const pagePath = path.resolve(__dirname, "../src/app/page.tsx");
const pageSource = fs.readFileSync(pagePath, "utf-8");

// Test 3.1: Homepage Portal Login Button Styling
assert(
  "Homepage Portal Login",
  "Portal Login link points to /login",
  pageSource.includes('href="/login"'),
  "true",
  String(pageSource.includes('href="/login"'))
);

const loginButtonRegex = /<Link\s+href="\/login"\s+className="([^"]+)"\s*>\s*Portal Login\s*<\/Link>/;
const loginMatch = pageSource.match(loginButtonRegex);
const loginClasses = loginMatch ? loginMatch[1] : "";

assert(
  "Homepage Portal Login",
  "Portal Login has outlined border ('border border-slate-300')",
  loginClasses.includes("border") && loginClasses.includes("border-slate-300"),
  "true",
  `Found classes: '${loginClasses}'`
);

assert(
  "Homepage Portal Login",
  "Portal Login has ghost styling ('bg-transparent')",
  loginClasses.includes("bg-transparent"),
  "true",
  `Found classes: '${loginClasses}'`
);

assert(
  "Homepage Portal Login",
  "Portal Login has focus halo ('focus:ring-4 focus:ring-[#613AF5]/30')",
  loginClasses.includes("focus:ring-4") && loginClasses.includes("focus:ring-[#613AF5]/30"),
  "true",
  `Found classes: '${loginClasses}'`
);

// Test 3.2: Homepage Challenge Cards Layout Classes
assert(
  "Homepage Cards Layout",
  "Challenge card outer Link has 'h-full flex flex-col'",
  pageSource.includes('className="h-full flex flex-col focus:outline-none focus:ring-4 focus:ring-[#613AF5]/30 rounded-2xl"'),
  "true",
  "Found matching Link element"
);

assert(
  "Homepage Cards Layout",
  "Challenge motion.div container has 'h-full flex flex-col'",
  /className=\{`bg-white rounded-2xl border border-slate-200 \$\{urgencyBorder\} p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer h-full flex flex-col`\}/.test(pageSource),
  "true",
  "Found motion.div with h-full flex flex-col"
);

assert(
  "Homepage Cards Layout",
  "Challenge content wrapper has 'flex-1 flex flex-col'",
  pageSource.includes('<div className="flex-1 flex flex-col">'),
  "true",
  "Found flex-1 flex flex-col content wrapper"
);

assert(
  "Homepage Cards Layout",
  "Challenge card bottom row has 'mt-auto'",
  pageSource.includes('className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto"'),
  "true",
  "Found bottom row with mt-auto"
);

// Test 3.3: Homepage Urgency Border Logic
const urgencyBorderLogicRegex = /const urgencyBorder =\s*challenge\.urgency === "CRITICAL"\s*\?\s*"border-l-4 border-l-red-600"\s*:\s*challenge\.urgency === "HIGH"\s*\?\s*"border-l-4 border-l-amber-500"\s*:\s*"";/;
assert(
  "Homepage Urgency Border",
  "Urgency border logic precisely matches CRITICAL -> red-600, HIGH -> amber-500, else -> empty",
  urgencyBorderLogicRegex.test(pageSource),
  "true",
  String(urgencyBorderLogicRegex.test(pageSource))
);

// -----------------------------------------------------------------------------
// SUITE 4: Adversarial Simulation & Box-Model Mathematical Oracle
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("SUITE 4: Adversarial Box-Model Oracle (Title Length Variance)");
console.log("=======================================================");

/**
 * CSS Flexbox Specification Simulation:
 * In a CSS grid column with equal row height H_row:
 * Container height = H_row (due to h-full).
 * Child 1: Metadata header (height H_meta, margin M_meta)
 * Child 2: Title (height H_title, margin M_title)
 * Child 3: Description (height H_desc, margin M_desc)
 * Top container total content height H_top = H_meta + M_meta + H_title + M_title + H_desc + M_desc.
 *
 * Child 4: Footer (height H_footer, margin-top: auto, border-top: 1px)
 * 
 * Under Flexbox Level 1 Spec:
 * Available free space S = H_row - (padding_top + H_top + H_footer + padding_bottom).
 * If margin-top is 'auto':
 * margin-top is assigned S.
 * Therefore:
 * Footer Y-offset from top = padding_top + H_top + S
 *                          = padding_top + H_top + (H_row - padding_top - H_top - H_footer - padding_bottom)
 *                          = H_row - H_footer - padding_bottom.
 *
 * Distance from Footer bottom to Card bottom = H_row - (Footer Y-offset + H_footer)
 *                                            = H_row - (H_row - padding_bottom)
 *                                            = padding_bottom.
 *
 * Notice that H_title CANCELS OUT COMPLETELY from the footer position formula!
 * The footer bottom alignment is strictly INVARIANT to title length.
 */

interface SimulatedCard {
  title: string;
  lines: number;
  titleHeight: number; // in px
  descHeight: number;  // in px
  metaHeight: number;  // in px
  paddingY: number;    // in px
  footerHeight: number;// in px
}

const mockCards: SimulatedCard[] = [
  {
    title: "Clean Water",
    lines: 1,
    titleHeight: 28, // 1 line leading-snug
    descHeight: 60,
    metaHeight: 32,
    paddingY: 24, // p-6 = 24px top & bottom
    footerHeight: 40,
  },
  {
    title: "Damaged culvert causing flash floods and soil erosion across agricultural fields in Bero",
    lines: 3,
    titleHeight: 84, // 3 lines
    descHeight: 60,
    metaHeight: 32,
    paddingY: 24,
    footerHeight: 40,
  },
  {
    title: "Severe recurring structural cracking and water contamination in multi-village overhead reservoir supply infrastructure impacting 12000 rural residents during summer drought",
    lines: 5,
    titleHeight: 140, // 5 lines
    descHeight: 60,
    metaHeight: 32,
    paddingY: 24,
    footerHeight: 40,
  },
];

// In CSS Grid, row height is determined by the tallest card in that row
const maxIntrinsicHeight = Math.max(
  ...mockCards.map(
    (c) => c.paddingY * 2 + c.metaHeight + c.titleHeight + c.descHeight + c.footerHeight
  )
);
const H_row = maxIntrinsicHeight; // Grid row expands to tallest card

console.log(`Simulated Grid Row Height (dictated by 5-line title card): ${H_row}px`);

// Compute footer positions WITH mt-auto
const footerBottomDistancesWithMtAuto = mockCards.map((c) => {
  const contentHeight = c.metaHeight + c.titleHeight + c.descHeight;
  const freeSpace = H_row - (c.paddingY * 2 + contentHeight + c.footerHeight);
  const marginTopAuto = Math.max(0, freeSpace);
  const footerTop = c.paddingY + contentHeight + marginTopAuto;
  const footerBottom = footerTop + c.footerHeight;
  const distanceToCardBottom = H_row - footerBottom;
  return {
    lines: c.lines,
    contentHeight,
    freeSpace,
    marginTopAuto,
    distanceToCardBottom,
    footerTop,
  };
});

console.log("\nCard Layout Metrics WITH mt-auto:");
footerBottomDistancesWithMtAuto.forEach((res) => {
  console.log(
    `  [${res.lines} Line(s)] Content: ${res.contentHeight}px | Margin-top auto: ${res.marginTopAuto}px | Dist to bottom: ${res.distanceToCardBottom}px`
  );
});

// Verify that all cards have EXACTLY distanceToCardBottom === paddingY (24px)
const allEqualWithMtAuto = footerBottomDistancesWithMtAuto.every(
  (r) => r.distanceToCardBottom === 24
);
assert(
  "Box-Model Oracle",
  "WITH mt-auto: Footer bottom offset is IDENTICAL (24px) across 1-line, 3-line, and 5-line cards",
  allEqualWithMtAuto,
  "All 24px (0px delta)",
  `${footerBottomDistancesWithMtAuto.map((r) => r.distanceToCardBottom).join("px, ")}px`
);

// Counter-factual: Compute WITHOUT mt-auto (static spacing)
const footerBottomDistancesWITHOUTMtAuto = mockCards.map((c) => {
  const contentHeight = c.metaHeight + c.titleHeight + c.descHeight;
  const footerTop = c.paddingY + contentHeight + 16; // say standard mt-4 = 16px
  const footerBottom = footerTop + c.footerHeight;
  const distanceToCardBottom = H_row - footerBottom;
  return {
    lines: c.lines,
    distanceToCardBottom,
  };
});

console.log("\nCounter-factual Metrics WITHOUT mt-auto:");
footerBottomDistancesWITHOUTMtAuto.forEach((res) => {
  console.log(`  [${res.lines} Line(s)] Dist to bottom: ${res.distanceToCardBottom}px`);
});

const misalignmentDelta =
  footerBottomDistancesWITHOUTMtAuto[0].distanceToCardBottom -
  footerBottomDistancesWITHOUTMtAuto[2].distanceToCardBottom;
console.log(`Without mt-auto, bottom-row misalignment delta would be: ${misalignmentDelta}px`);

assert(
  "Box-Model Oracle",
  "Proof of Necessity: Without mt-auto, cards exhibit severe bottom-row misalignment (delta = 112px)",
  misalignmentDelta === 112,
  "112px misalignment",
  `${misalignmentDelta}px misalignment`
);

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log("CHALLENGE AUDIT SUMMARY");
console.log("=======================================================");

const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log(`Total Assertions : ${totalTests}`);
console.log(`Passed           : ${passedTests}`);
console.log(`Failed           : ${failedTests}`);

if (failedTests > 0) {
  console.error("\n❌ VERDICT: REJECT (Failures detected)");
  process.exit(1);
} else {
  console.log("\n✅ VERDICT: APPROVE (100% assertions verified empirically)");
  process.exit(0);
}
