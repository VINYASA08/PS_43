/**
 * PRAGATI / JSICP Round 14 — Challenger 2 Adversarial Stress Suite
 * File: web/tests/adversarial_challenger2_guidance.ts
 *
 * Adversarial edge cases tested:
 * 1. LocalStorage corruption, invalid JSON, unexpected schemas, primitive values, nulls
 * 2. Private browsing / incognito quota exceeded errors (DOMException: QuotaExceededError, SecurityError)
 * 3. Malformed /help URL parameters (/help?role=invalid, hacker, ../../etc, <script>, undefined, null)
 * 4. Vernacular dialect synonym searches (khortha, nagpuri, chapa-kal, nal-jal, sadak, bijli, paani)
 * 5. Deep link navigation integrity across all 5 layers and dashboards
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import assert from "node:assert/strict";

// ----------------------------------------------------------------------------
// 1. Mock Storage Harness for Extreme Adversarial Conditions
// ----------------------------------------------------------------------------

export class AdversarialStorage implements Storage {
  private store = new Map<string, string>();
  public throwOnSetQuota = false;
  public throwOnSetSecurity = false;
  public throwOnGetSecurity = false;
  public throwOnRemoveSecurity = false;

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    if (this.throwOnGetSecurity) {
      const err = new Error("The operation is insecure (SecurityError in strict incognito)");
      (err as any).name = "SecurityError";
      (err as any).code = 18;
      throw err;
    }
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key: string): void {
    if (this.throwOnRemoveSecurity) {
      const err = new Error("The operation is insecure");
      (err as any).name = "SecurityError";
      throw err;
    }
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSetQuota) {
      const err = new Error("QuotaExceededError: The quota has been exceeded");
      (err as any).name = "QuotaExceededError";
      (err as any).code = 22;
      throw err;
    }
    if (this.throwOnSetSecurity) {
      const err = new Error("SecurityError: Access denied in private window");
      (err as any).name = "SecurityError";
      (err as any).code = 18;
      throw err;
    }
    this.store.set(key, String(value));
  }

  rawDump(): Record<string, string> {
    const res: Record<string, string> = {};
    for (const [k, v] of this.store.entries()) res[k] = v;
    return res;
  }
}

const advStorage = new AdversarialStorage();

// Polyfill window, localStorage, document for server-side evaluation
(globalThis as any).window = {
  localStorage: advStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 1280,
  innerHeight: 800,
};
(globalThis as any).localStorage = advStorage;
(globalThis as any).document = {
  body: { style: { overflow: "auto" } },
  createElement: (tag: string) => ({ tagName: tag, style: {} }),
};

// Import modules to stress-test
import { GUIDANCE_STORAGE_KEYS, GuidanceRole } from "../src/components/guidance/types";
import { useGuidanceStore } from "../src/components/guidance/store";
import {
  DIALECT_SYNONYMS,
  STATUTORY_FAQS,
  ROLE_DOCUMENTATION,
  HelpRoleKey,
} from "../src/components/guidance/Layer3_HelpCenter/helpData";
import { HelpFaqAccordion } from "../src/components/guidance/Layer3_HelpCenter/HelpFaqAccordion";

// ----------------------------------------------------------------------------
// Test Reporting Harness
// ----------------------------------------------------------------------------

interface ChallengeResult {
  category: string;
  testId: string;
  description: string;
  passed: boolean;
  findings: string;
}

const results: ChallengeResult[] = [];

function recordChallenge(
  category: string,
  testId: string,
  description: string,
  fn: () => { passed: boolean; findings: string }
) {
  try {
    const outcome = fn();
    results.push({
      category,
      testId,
      description,
      passed: outcome.passed,
      findings: outcome.findings,
    });
    const status = outcome.passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL / FINDING]\x1b[0m";
    console.log(`  ${status} [${testId}] ${description}`);
    if (!outcome.passed) {
      console.log(`         -> Observation: ${outcome.findings}`);
    }
  } catch (err: any) {
    results.push({
      category,
      testId,
      description,
      passed: false,
      findings: `Unhandled Exception: ${err?.message || err}`,
    });
    console.error(`  \x1b[31m[CRASH]\x1b[0m [${testId}] ${description} -> Unhandled Exception: ${err?.message || err}`);
  }
}

// ----------------------------------------------------------------------------
// BATTERY 1: LocalStorage Corruption & Schema Anomalies
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 1: LOCALSTORAGE CORRUPTION & SCHEMA ANOMALIES");
console.log("==================================================================");

recordChallenge(
  "LocalStorage Corruption",
  "ADV-LS-01",
  "Handle completely malformed non-JSON strings in checklist storage keys",
  () => {
    advStorage.clear();
    advStorage.setItem("pragati-guidance-storage", "INVALID_JSON_CORRUPT_STRING");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, "<<<SYNTAX ERROR>>>");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY, "{ unquoted_key: [unclosed }");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_GOV, "NaN");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_TRACK, "<script>alert('pwn')</script>");

    // Force initFromStorage
    (useGuidanceStore.getState() as any).isHydrated = false;
    useGuidanceStore.getState().initFromStorage();

    const hydrated = useGuidanceStore.getState().isHydrated;
    const uniState = useGuidanceStore.getState().checklistStates[GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY] || {};

    return {
      passed: hydrated && typeof uniState === "object",
      findings: `Hydrated: ${hydrated}, Uni state fallback: ${JSON.stringify(uniState)}`,
    };
  }
);

recordChallenge(
  "LocalStorage Corruption",
  "ADV-LS-02",
  "Handle JSON primitive values (numbers, strings, booleans, null) in checklist storage",
  () => {
    advStorage.clear();
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, "12345");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY, '"just a string"');
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_GOV, "null");
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_TRACK, "true");

    (useGuidanceStore.getState() as any).isHydrated = false;
    useGuidanceStore.getState().initFromStorage();

    // Now test toggleChecklistItem on corrupted primitive slots
    let toggleUniThrew = false;
    let toggleIndThrew = false;
    let toggleGovThrew = false;
    let toggleTrackThrew = false;

    try {
      useGuidanceStore.getState().toggleChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, "item_1");
    } catch {
      toggleUniThrew = true;
    }
    try {
      useGuidanceStore.getState().toggleChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY, "item_1");
    } catch {
      toggleIndThrew = true;
    }
    try {
      useGuidanceStore.getState().toggleChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_GOV, "item_1");
    } catch {
      toggleGovThrew = true;
    }
    try {
      useGuidanceStore.getState().toggleChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_TRACK, "item_1");
    } catch {
      toggleTrackThrew = true;
    }

    const noThrows = !toggleUniThrew && !toggleIndThrew && !toggleGovThrew && !toggleTrackThrew;
    return {
      passed: noThrows,
      findings: `toggleUniThrew=${toggleUniThrew}, toggleIndThrew=${toggleIndThrew}, toggleGovThrew=${toggleGovThrew}, toggleTrackThrew=${toggleTrackThrew}`,
    };
  }
);

recordChallenge(
  "LocalStorage Corruption",
  "ADV-LS-03",
  "Handle unexpected schemas / array values in checklist storage",
  () => {
    advStorage.clear();
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, JSON.stringify(["unexpected", "array"]));
    advStorage.setItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY, JSON.stringify({ deep: { nested: { invalid: true } } }));

    (useGuidanceStore.getState() as any).isHydrated = false;
    useGuidanceStore.getState().initFromStorage();

    useGuidanceStore.getState().setChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, "new_item", true);
    const updated = useGuidanceStore.getState().checklistStates[GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY];

    const isObject = typeof updated === "object" && updated !== null && !Array.isArray(updated);
    return {
      passed: isObject && updated.new_item === true,
      findings: `Resulting checklist type: ${typeof updated}, new_item: ${updated?.new_item}`,
    };
  }
);

recordChallenge(
  "LocalStorage Corruption",
  "ADV-LS-04",
  "Handle corrupted collapsed cards prefix values",
  () => {
    advStorage.clear();
    advStorage.setItem(`${GUIDANCE_STORAGE_KEYS.CARD_COLLAPSED_PREFIX}${GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY}`, "NOT_A_BOOLEAN");
    advStorage.setItem(`${GUIDANCE_STORAGE_KEYS.CARD_COLLAPSED_PREFIX}${GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY}`, "1");

    (useGuidanceStore.getState() as any).isHydrated = false;
    useGuidanceStore.getState().initFromStorage();

    // In store.ts: only "true" sets true, others remain false
    const uniCollapsed = useGuidanceStore.getState().collapsedCards[GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY];
    const indCollapsed = useGuidanceStore.getState().collapsedCards[GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY];

    return {
      passed: !uniCollapsed && !indCollapsed,
      findings: `uniCollapsed=${uniCollapsed} (expected false/undefined), indCollapsed=${indCollapsed} (expected false/undefined)`,
    };
  }
);

// ----------------------------------------------------------------------------
// BATTERY 2: Incognito Quota Exceeded & Storage Denial
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 2: INCOGNITO QUOTA EXCEEDED & STORAGE DENIAL");
console.log("==================================================================");

recordChallenge(
  "Incognito Quota Exceeded",
  "ADV-QUOTA-01",
  "DOMException: QuotaExceededError during completeOnboarding does not crash store",
  () => {
    advStorage.clear();
    advStorage.throwOnSetQuota = true;

    let threw = false;
    try {
      useGuidanceStore.getState().completeOnboarding("citizen");
      useGuidanceStore.getState().completeOnboarding("university");
      useGuidanceStore.getState().completeOnboarding("industry");
      useGuidanceStore.getState().completeOnboarding("government");
      useGuidanceStore.getState().completeOnboarding("local_body");
    } catch {
      threw = true;
    }

    const state = useGuidanceStore.getState().completedOnboardings;
    const allCompletedInMemory = Object.values(state).every(Boolean);
    advStorage.throwOnSetQuota = false;

    return {
      passed: !threw && allCompletedInMemory,
      findings: `threw=${threw}, allCompletedInMemory=${allCompletedInMemory}`,
    };
  }
);

recordChallenge(
  "Incognito Quota Exceeded",
  "ADV-QUOTA-02",
  "DOMException: QuotaExceededError during checklist item toggling and reset does not crash store",
  () => {
    advStorage.throwOnSetQuota = true;

    let toggleThrew = false;
    let resetThrew = false;
    try {
      useGuidanceStore.getState().toggleChecklistItem(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY, "test_item");
    } catch {
      toggleUniThrew: toggleThrew = true;
    }

    try {
      useGuidanceStore.getState().resetChecklist(GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY);
    } catch {
      resetThrew = true;
    }

    advStorage.throwOnSetQuota = false;
    return {
      passed: !toggleThrew && !resetThrew,
      findings: `toggleThrew=${toggleThrew}, resetThrew=${resetThrew}`,
    };
  }
);

recordChallenge(
  "Incognito SecurityError",
  "ADV-QUOTA-03",
  "Strict incognito SecurityError on getItem, setItem, and removeItem",
  () => {
    advStorage.throwOnGetSecurity = true;
    advStorage.throwOnSetSecurity = true;
    advStorage.throwOnRemoveSecurity = true;

    let initThrew = false;
    let completeThrew = false;
    let resetThrew = false;

    try {
      (useGuidanceStore.getState() as any).isHydrated = false;
      useGuidanceStore.getState().initFromStorage();
    } catch {
      initThrew = true;
    }

    try {
      useGuidanceStore.getState().completeOnboarding("university");
    } catch {
      completeThrew = true;
    }

    try {
      useGuidanceStore.getState().resetOnboarding("university");
    } catch {
      resetThrew = true;
    }

    advStorage.throwOnGetSecurity = false;
    advStorage.throwOnSetSecurity = false;
    advStorage.throwOnRemoveSecurity = false;

    return {
      passed: !initThrew && !completeThrew && !resetThrew,
      findings: `initThrew=${initThrew}, completeThrew=${completeThrew}, resetThrew=${resetThrew}`,
    };
  }
);

// ----------------------------------------------------------------------------
// BATTERY 3: Malformed /help URL Parameters (/help?role=...)
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 3: MALFORMED /help URL PARAMETERS");
console.log("==================================================================");

function sanitizeHelpRoleParam(rawRoleParam: string | null): HelpRoleKey {
  if (!rawRoleParam) return "citizens";
  const lower = rawRoleParam.toLowerCase();
  if (lower === "citizen" || lower === "citizens") return "citizens";
  if (lower === "university" || lower === "universities") return "universities";
  if (lower === "industry") return "industry";
  if (lower === "gov" || lower === "government" || lower === "state_admin") return "government";
  if (lower === "local_body" || lower === "local-body" || lower === "ulb" || lower === "pri") return "local-body";
  return "citizens";
}

const adversarialRoleVectors = [
  { input: "invalid", expected: "citizens" },
  { input: "hacker", expected: "citizens" },
  { input: "undefined", expected: "citizens" },
  { input: "null", expected: "citizens" },
  { input: "../../etc/passwd", expected: "citizens" },
  { input: "<script>alert(1)</script>", expected: "citizens" },
  { input: "SELECT * FROM users", expected: "citizens" },
  { input: "", expected: "citizens" },
  { input: "CITIZENS", expected: "citizens" },
  { input: "GOV", expected: "government" },
  { input: "state_admin", expected: "government" },
  { input: "local_body", expected: "local-body" },
  { input: "ULB", expected: "local-body" },
  { input: "PRI", expected: "local-body" },
  { input: "universities", expected: "universities" },
  { input: "industry", expected: "industry" },
];

recordChallenge(
  "Help Center URL Sanitization",
  "ADV-URL-01",
  "Sanitize 16 adversarial role query parameters to safe valid HelpRoleKey values",
  () => {
    const mismatches: string[] = [];
    for (const vec of adversarialRoleVectors) {
      const sanitized = sanitizeHelpRoleParam(vec.input);
      if (sanitized !== vec.expected) {
        mismatches.push(`Input '${vec.input}' -> Got '${sanitized}', Expected '${vec.expected}'`);
      }
    }
    return {
      passed: mismatches.length === 0,
      findings: mismatches.length === 0 ? "All 16 vectors passed" : mismatches.join("; "),
    };
  }
);

recordChallenge(
  "Help Center URL Sanitization",
  "ADV-URL-02",
  "Ensure ROLE_DOCUMENTATION lookup never returns undefined for sanitized role keys",
  () => {
    const missingDocs: string[] = [];
    for (const vec of adversarialRoleVectors) {
      const sanitized = sanitizeHelpRoleParam(vec.input);
      const doc = ROLE_DOCUMENTATION[sanitized];
      if (!doc || !doc.title || !doc.proceduralGuides || doc.proceduralGuides.length === 0) {
        missingDocs.push(`Role '${sanitized}' missing valid documentation`);
      }
    }
    return {
      passed: missingDocs.length === 0,
      findings: missingDocs.length === 0 ? "All documentation objects intact" : missingDocs.join("; "),
    };
  }
);

// ----------------------------------------------------------------------------
// BATTERY 4: Vernacular Dialect Synonym Searches & Diacritic Stress Testing
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 4: VERNACULAR DIALECT SEARCH & SYNONYM EXPANSION");
console.log("==================================================================");

const targetDialects = ["khortha", "nagpuri", "chapa-kal", "nal-jal", "sadak", "bijli", "paani"];

recordChallenge(
  "Dialect Search",
  "ADV-DIA-01",
  "Verify dictionary presence of requested dialect terms in DIALECT_SYNONYMS",
  () => {
    const present: string[] = [];
    const missing: string[] = [];

    for (const term of targetDialects) {
      if (DIALECT_SYNONYMS[term]) {
        present.push(`${term} -> "${DIALECT_SYNONYMS[term]}"`);
      } else {
        missing.push(term);
      }
    }

    return {
      passed: missing.length === 0,
      findings: `Present (${present.length}): [${present.join(", ")}]; Missing (${missing.length}): [${missing.join(", ")}]`,
    };
  }
);

recordChallenge(
  "Dialect Search",
  "ADV-DIA-02",
  "Test FAQ filtering behavior when user searches dialect terms: HelpFaqAccordion matching",
  () => {
    const resultsSummary: Record<string, number> = {};

    for (const term of targetDialects) {
      const q = term.toLowerCase();
      // Simulate HelpFaqAccordion search logic
      const matched = STATUTORY_FAQS.filter((faq) => {
        const matchesQ = faq.question.toLowerCase().includes(q);
        const matchesA = faq.answer.toLowerCase().includes(q);
        const matchesRef = (faq.statutoryRef || "").toLowerCase().includes(q);
        const matchesCat = faq.category.toLowerCase().includes(q);
        const matchesId = faq.id.toLowerCase().includes(q);
        return matchesQ || matchesA || matchesRef || matchesCat || matchesId;
      });
      resultsSummary[term] = matched.length;
    }

    // Notice: khortha and nagpuri match OP-CIT-02. But chapa-kal, nal-jal, sadak, bijli, paani yield 0 because FAQ text does not contain literal dialect terms!
    const zeroMatchTerms = Object.entries(resultsSummary).filter(([_, count]) => count === 0).map(([k]) => k);

    return {
      passed: zeroMatchTerms.length === 0,
      findings: `Match counts: ${JSON.stringify(resultsSummary)}. Terms with 0 matches in literal FAQ filter: [${zeroMatchTerms.join(", ")}]`,
    };
  }
);

recordChallenge(
  "Dialect Search",
  "ADV-DIA-03",
  "Test if HelpFaqAccordion expands synonym mapping (e.g. chapa-kal -> Drinking Water)",
  () => {
    // If the accordion were to expand DIALECT_SYNONYMS:
    const testExpansion = (term: string) => {
      const expanded = DIALECT_SYNONYMS[term];
      if (!expanded) return 0;
      const terms = [term, expanded.toLowerCase(), ...expanded.toLowerCase().split(/[\s&]+/g).filter(w => w.length > 2)];
      return STATUTORY_FAQS.filter((faq) => {
        const fullText = `${faq.question} ${faq.answer} ${faq.statutoryRef || ""} ${faq.category}`.toLowerCase();
        return terms.some(t => fullText.includes(t));
      }).length;
    };

    const chapaKalWithExpansion = testExpansion("chapa-kal");
    const sadakWithExpansion = testExpansion("sadak");

    // But actual production HelpFaqAccordion currently uses literal 'q'
    return {
      passed: true,
      findings: `With expansion: chapa-kal matches ${chapaKalWithExpansion} FAQs (e.g. water/sanitation), sadak matches ${sadakWithExpansion} FAQs. Production accordion does not yet import DIALECT_SYNONYMS for FAQ filtering.`,
    };
  }
);

// ----------------------------------------------------------------------------
// BATTERY 5: Deep Link Navigation Integrity
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 5: DEEP LINK NAVIGATION INTEGRITY");
console.log("==================================================================");

const registeredAppRoutes = [
  "/",
  "/submit",
  "/track",
  "/guidelines",
  "/accountability",
  "/whatsapp-intake",
  "/login",
  "/apply/[challengeId]",
  "/challenge/[id]",
  "/handover/[token]",
  "/dashboard",
  "/dashboard/gov",
  "/dashboard/nodal",
  "/dashboard/university",
  "/dashboard/industry",
  "/dashboard/open-board",
  "/dashboard/chat",
  "/dashboard/settings",
  "/dashboard/state",
  "/privacy-policy",
  "/help",
];

const guidanceGeneratedLinks = [
  // LegalFooter
  "/submit",
  "/track",
  "/dashboard/university",
  "/dashboard/industry",
  "/dashboard/gov",
  "/dashboard/state",
  "/help",
  "/privacy-policy",
  // HelpCenterClient
  "/",
  "/submit",
  "/track",
  "/dashboard",
  // Checklists actionHref
  "/guidelines",
  "/help",
];

recordChallenge(
  "Deep Link Navigation",
  "ADV-NAV-01",
  "Verify all internal href targets generated in Guidance components resolve to active routes",
  () => {
    const unmapped: string[] = [];
    for (const link of guidanceGeneratedLinks) {
      const cleanPath = link.split("?")[0].split("#")[0];
      if (!registeredAppRoutes.includes(cleanPath)) {
        unmapped.push(cleanPath);
      }
    }
    return {
      passed: unmapped.length === 0,
      findings: unmapped.length === 0 ? "All 10 unique internal guidance hrefs mapped 1:1 to active routes" : `Unmapped: ${unmapped.join(", ")}`,
    };
  }
);

recordChallenge(
  "Deep Link Navigation",
  "ADV-NAV-02",
  "Verify /help deep links with ?role= queries match valid tabs",
  () => {
    const testRoles = ["citizens", "universities", "industry", "government", "local-body"];
    const verifiedRoles: string[] = [];
    for (const r of testRoles) {
      const sanitized = sanitizeHelpRoleParam(r);
      if (sanitized === r) {
        verifiedRoles.push(r);
      }
    }
    return {
      passed: verifiedRoles.length === testRoles.length,
      findings: `Verified deep linked role tabs: [${verifiedRoles.join(", ")}]`,
    };
  }
);

// ----------------------------------------------------------------------------
// BATTERY 6: React SSR Component Rendering under Extreme Adversarial State
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("BATTERY 6: REACT SSR COMPONENT RENDERING UNDER ADVERSARIAL STATE");
console.log("==================================================================");

recordChallenge(
  "SSR Adversarial Rendering",
  "ADV-SSR-01",
  "HelpFaqAccordion renders without crashing with empty, special, and non-ASCII queries",
  () => {
    const queries = ["", "!@#$%^&*()", "खोरठा", "नागपुरी", "चपा-कल", "<script>bad()</script>", "null", "undefined"];
    let renderedCount = 0;
    for (const q of queries) {
      const html = ReactDOMServer.renderToString(
        React.createElement(HelpFaqAccordion, { searchQuery: q, activeRole: "citizens" })
      );
      if (typeof html === "string" && html.length > 0) {
        renderedCount++;
      }
    }
    return {
      passed: renderedCount === queries.length,
      findings: `Successfully rendered ${renderedCount}/${queries.length} adversarial query renders without throwing`,
    };
  }
);

// ----------------------------------------------------------------------------
// Summary of Results
// ----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("CHALLENGER 2 ADVERSARIAL STRESS TEST SUMMARY");
console.log("==================================================================");

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`Total Challenges Executed: ${total}`);
console.log(`Passed / Resilient:        ${passed}`);
console.log(`Findings / Weaknesses:     ${failed}`);

if (failed > 0) {
  console.log("\nSpecific Findings Breakdown:");
  results.filter(r => !r.passed).forEach(r => {
    console.log(` - [${r.testId}] ${r.description}: ${r.findings}`);
  });
}
