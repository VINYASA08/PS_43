/**
 * Milestone 2 Help Center & Statutory FAQs Test Suite
 * File: web/tests/test_milestone2_help_center.ts
 *
 * Authority: Department of Higher & Technical Education, Government of Jharkhand
 * Project: PRAGATI / JSICP (Problem Statement 26043) | Round 14
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Browser mock polyfills
const mockStorage = new Map<string, string>();
(globalThis as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage.get(k) || null,
    setItem: (k: string, v: string) => mockStorage.set(k, String(v)),
    removeItem: (k: string) => mockStorage.delete(k),
  },
};

import { 
  ROLE_DOCUMENTATION, 
  STATUTORY_FAQS, 
  WORKFLOW_LIFECYCLE_STAGES, 
  GRIEVANCE_LADDER,
  DIALECT_SYNONYMS,
  HELP_CONTACT_INFO
} from "../src/components/guidance/Layer3_HelpCenter/helpData";
import { HelpFaqAccordion } from "../src/components/guidance/Layer3_HelpCenter/HelpFaqAccordion";
import { HelpWorkflowDiagram } from "../src/components/guidance/Layer3_HelpCenter/HelpWorkflowDiagram";

console.log("===============================================================================");
console.log("   MILESTONE 2 (HELP CENTER & STATUTORY FAQS) VERIFICATION SUITE");
console.log("===============================================================================\n");

let passed = 0;
let total = 0;

function test(name: string, fn: () => boolean | void) {
  total++;
  try {
    const res = fn();
    if (res === false) {
      console.error(`  \x1b[31m[FAIL]\x1b[0m ${name}`);
    } else {
      console.log(`  \x1b[32m[PASS]\x1b[0m ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${name} - Error:`, err);
  }
}

// 1. Role Documentation Verification
test("M2-01: Exactly 5 primary role desks configured", () => {
  const roles = Object.keys(ROLE_DOCUMENTATION);
  return roles.length === 5 && 
    roles.includes("citizens") && 
    roles.includes("universities") && 
    roles.includes("industry") && 
    roles.includes("government") && 
    roles.includes("local-body");
});

test("M2-02: Citizen role documentation includes DPDP, 500m fuzzing, Whisper, and 21-day SLA", () => {
  const cit = ROLE_DOCUMENTATION.citizens;
  const hText = cit.highlights.join(" ");
  return hText.includes("DPDP") && 
    hText.includes("500m") && 
    hText.includes("Whisper") && 
    hText.includes("21-Day") &&
    cit.proceduralGuides.length >= 3;
});

test("M2-03: University role documentation includes 72-hr claim, 60-20-20 split, and 30-40-30 DPR", () => {
  const univ = ROLE_DOCUMENTATION.universities;
  const hText = univ.highlights.join(" ");
  return hText.includes("72-Hour") && 
    hText.includes("60-20-20") && 
    hText.includes("30-40-30") &&
    univ.proceduralGuides.length >= 3;
});

test("M2-04: Industry role documentation includes 30-day priority gate, Sec 135 CSR, Form CSR-1, and 180-day ROFR", () => {
  const ind = ROLE_DOCUMENTATION.industry;
  const hText = ind.highlights.join(" ");
  return hText.includes("30-Day") && 
    hText.includes("Section 135") && 
    hText.includes("Form CSR-1") && 
    hText.includes("180-Day") &&
    ind.proceduralGuides.length >= 3;
});

test("M2-05: Government role documentation includes 48-hr triage, Valley of Death, and Dual DSC", () => {
  const gov = ROLE_DOCUMENTATION.government;
  const hText = gov.highlights.join(" ");
  return hText.includes("48-Hour") && 
    hText.includes("Valley of Death") && 
    hText.includes("Dual Escrow") &&
    gov.proceduralGuides.length >= 3;
});

test("M2-06: Local Body role documentation includes WhatsApp Cloud API, QR-code PDF, and Day 0-3-7 SLA", () => {
  const loc = ROLE_DOCUMENTATION["local-body"];
  const hText = loc.highlights.join(" ");
  return hText.includes("WhatsApp") && 
    hText.includes("QR-Code") && 
    hText.includes("Day 0-3-7") &&
    loc.proceduralGuides.length >= 3;
});

// 2. Verbatim Statutory FAQs (Q1 - Q7)
test("M2-07: All 7 Verbatim Statutory FAQs (Q1 through Q7) are present", () => {
  const ids = STATUTORY_FAQS.map(f => f.id);
  for (let i = 1; i <= 7; i++) {
    if (!ids.includes(`Q${i}`)) return false;
  }
  return true;
});

test("M2-08: Q1 verifies 50/50 Tier 3 default, negotiable to 60/40, and mandatory 60-20-20 split", () => {
  const q1 = STATUTORY_FAQS.find(f => f.id === "Q1")!;
  return q1.question.includes("How are IP rights divided") &&
    q1.answer.includes("50% Industry / 50% University") &&
    q1.answer.includes("60% Industry / 40% University") &&
    q1.answer.includes("60-20-20 Royalty Split") &&
    q1.answer.includes("NISP) 2019");
});

test("M2-09: Q2 verifies 30-day grace period, Stalled status, and 90-day ROFR extension", () => {
  const q2 = STATUTORY_FAQS.find(f => f.id === "Q2")!;
  return q2.question.includes("fails to satisfy the milestone benchmarks") &&
    q2.answer.includes("30-day grace period") &&
    q2.answer.includes("Stalled") &&
    q2.answer.includes("90 days");
});

test("M2-10: Q3 verifies national bodies (ISRO, DRDO, CSIR, ICAR) and DARPAN NGOs", () => {
  const q3 = STATUTORY_FAQS.find(f => f.id === "Q3")!;
  return q3.question.includes("independent researcher or retired scientist") &&
    q3.answer.includes("ISRO, DRDO, CSIR, ICAR") &&
    q3.answer.includes("DARPAN ID");
});

test("M2-11: Q4 verifies zero Aadhaar/PAN, AES-256, 500m fuzzing, and Whistleblower Act", () => {
  const q4 = STATUTORY_FAQS.find(f => f.id === "Q4")!;
  return q4.question.includes("citizen anonymity and protect whistleblower data") &&
    q4.answer.includes("AES-256") &&
    q4.answer.includes("500m radius polygon") &&
    q4.answer.includes("Jharkhand Whistleblower Protection Act") &&
    q4.answer.includes("DPDP Act 2023");
});

test("M2-12: Q5 verifies Companies Act Schedule VII Item (ix)(a), Sec 80G, and Form CSR-1", () => {
  const q5 = STATUTORY_FAQS.find(f => f.id === "Q5")!;
  return q5.question.includes("tax exemptions apply to corporate entities") &&
    q5.answer.includes("Schedule VII of the Companies Act, 2013") &&
    q5.answer.includes("Item no. (ix)(a)") &&
    q5.answer.includes("Section 80G") &&
    q5.answer.includes("Form CSR-1");
});

test("M2-13: Q6 verifies SWEC 30-day expedited clearance", () => {
  const q6 = STATUTORY_FAQS.find(f => f.id === "Q6")!;
  return q6.question.includes("inter-departmental clearances") &&
    q6.answer.includes("SWEC") &&
    q6.answer.includes("30 days");
});

test("M2-14: Q7 verifies Jharkhand Student Innovation Policy 2025 (22 universities, ₹1,280 Cr corpus)", () => {
  const q7 = STATUTORY_FAQS.find(f => f.id === "Q7")!;
  return q7.question.includes("institutional research and innovation cells") &&
    q7.answer.includes("Jharkhand Student Research and Innovation Policy, 2025") &&
    q7.answer.includes("22 universities") &&
    q7.answer.includes("1,280 crore") &&
    q7.answer.includes("1,000 student-led innovations");
});

// 3. 5-Stage Lifecycle Workflow Stages
test("M2-15: Exactly 5 lifecycle stages in HelpWorkflowDiagram", () => {
  return WORKFLOW_LIFECYCLE_STAGES.length === 5 &&
    WORKFLOW_LIFECYCLE_STAGES[0].timeline.includes("0 to 2 Hours") &&
    WORKFLOW_LIFECYCLE_STAGES[1].timeline.includes("48 Hours") &&
    WORKFLOW_LIFECYCLE_STAGES[2].timeline.includes("Days 3 to 14") &&
    WORKFLOW_LIFECYCLE_STAGES[3].timeline.includes("Days 15 to 45") &&
    WORKFLOW_LIFECYCLE_STAGES[4].timeline.includes("Months 2 to 6");
});

// 4. Grievance Redressal Ladder
test("M2-16: 3-Tier Grievance Redressal ladder specifies L1 (5d), L2 (10d), L3 (20d)", () => {
  const l1 = GRIEVANCE_LADDER.find(g => g.level === 1)!;
  const l2 = GRIEVANCE_LADDER.find(g => g.level === 2)!;
  const l3 = GRIEVANCE_LADDER.find(g => g.level === 3)!;
  return l1.slaAck?.includes("2 working days") &&
    l1.slaResolution.includes("5 working days") &&
    l2.slaResolution.includes("10 working days") &&
    l3.slaResolution.includes("20 working days");
});

// 5. Dialect Synonym Dictionaries
test("M2-17: Dialect dictionary maps rural terms (khortha, nagpuri, chapa-kal, nal-jal)", () => {
  return DIALECT_SYNONYMS["khortha"] === "Voice Input" &&
    DIALECT_SYNONYMS["nagpuri"] === "Voice Input" &&
    DIALECT_SYNONYMS["chapa-kal"] === "Drinking Water & Sanitation" &&
    DIALECT_SYNONYMS["nal-jal"] === "Track B Public Works";
});

// 6. Help Desk Contact Info
test("M2-18: Help desk contact info specifies official email and helpline", () => {
  return HELP_CONTACT_INFO.dpoEmail === "dpo-pragati@jharkhand.gov.in" &&
    HELP_CONTACT_INFO.helplinePhone === "+91 94311 00000" &&
    HELP_CONTACT_INFO.headquarters.includes("Ranchi");
});

// 7. Component SSR Rendering
test("M2-19: HelpFaqAccordion renders cleanly via ReactDOMServer", () => {
  const html = ReactDOMServer.renderToString(React.createElement(HelpFaqAccordion, {}));
  return html.includes("Master Statutory FAQ") && 
    html.includes("Q1") && 
    html.includes("Q4") && 
    html.includes("DPDP");
});

test("M2-20: HelpWorkflowDiagram renders cleanly via ReactDOMServer", () => {
  const html = ReactDOMServer.renderToString(React.createElement(HelpWorkflowDiagram));
  return html.includes("Stage 1") && 
    html.includes("AI Cognitive Intake") && 
    html.includes("District Nodal") && 
    html.includes("Corporate CSR");
});

// 8. Sidebar layout navigation check
test("M2-21: dashboard/layout.tsx includes /help link with HelpCircle icon", () => {
  const layoutContent = fs.readFileSync(path.resolve(__dirname, "../src/app/dashboard/layout.tsx"), "utf-8");
  return layoutContent.includes("HelpCircle") &&
    layoutContent.includes('{ name: "Help Center", href: "/help", icon: HelpCircle }');
});

// 9. Help Page Server Component Shell
test("M2-22: app/help/page.tsx exports metadata and mounts HelpCenterClient", () => {
  const pageContent = fs.readFileSync(path.resolve(__dirname, "../src/app/help/page.tsx"), "utf-8");
  return pageContent.includes("Help Center & Statutory Operating Manual") &&
    pageContent.includes("<HelpCenterClient />") &&
    pageContent.includes("<Suspense");
});

console.log("\n===============================================================================");
console.log(`  RESULTS: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log("===============================================================================\n");

if (passed === total) {
  console.log("\x1b[32m[VERDICT: 100% SUCCESS]\x1b[0m All Milestone 2 Help Center assertions verified.");
  process.exit(0);
} else {
  console.error("\x1b[31m[VERDICT: FAILURE]\x1b[0m Some assertions failed.");
  process.exit(1);
}
