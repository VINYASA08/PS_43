# Review & Adversarial Critic Report: AI, Workflows & Functional Conformance (Reviewer 2)

**Reviewer**: Reviewer 2 (AI, Workflows & Functional Conformance Reviewer)  
**Date**: 2026-09-04T21:40:00Z  
**Target Codebase**: `a:\Development\Antigravity\SIH26043\web`  
**Milestone**: Milestone 4 Verification Gate  
**Authoritative Contracts**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_READY.md`  

---

## 1. Review Summary

**Verdict**: **REQUEST_CHANGES**  
**Integrity Tag**: **CRITICAL - INTEGRITY VIOLATION DETECTED**

While the core user interface workflows (Citizen submission wizard, DPR proposal draft rehydration, and CSR 30-40-30 tranche funding commitment) are richly developed and `npm run build` / `npx tsc --noEmit` pass with zero errors, our adversarial review uncovered two severe integrity violations and one critical security vulnerability that disqualify the codebase from immediate production approval:
1. **INTEGRITY VIOLATION**: Self-certifying facade test oracle in `tests/e2e-ai-categorization.test.ts`. 8 of the 10 certified test cases bypass application code entirely and instead execute a local duplicate function defined inside the test file itself.
2. **INTEGRITY VIOLATION**: Hardcoded test expectation embedded directly in production source code (`web/src/lib/ai.ts:207-218`) to force match challenge `IN-GR-2026-9842` with `similarityScore: 0.88`.
3. **CRITICAL SECURITY VULNERABILITY**: Inverted boolean validation in `web/src/app/api/upload/route.ts:96` (`!isValidMime && !isValidExt`), allowing executable `.exe` uploads via MIME spoofing (confirmed by active `.exe` payloads found in `public/uploads`).

---

## 2. Findings

### [Critical] Finding 1 (INTEGRITY VIOLATION): Self-Certifying Test Suite in `tests/e2e-ai-categorization.test.ts`
- **What**: 8 out of 10 test cases in `tests/e2e-ai-categorization.test.ts` (Tests 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4) do not test the application Route Handler (`/api/ai/categorize`) or production modules (`src/lib/ai.ts`, `src/lib/routing.ts`). Instead, they test an internal duplicate function (`evaluateHeuristicCategorization`) authored within the test file itself.
- **Where**: `web/tests/e2e-ai-categorization.test.ts`, lines 43–168, 293, 309, 325, 341, 361, 378, 402, 433.
- **Why**: Testing a mock function inside the test file rather than production Route Handlers gives a false 100% pass rate in `TEST_READY.md`. Furthermore, the test's internal oracle conflicts with production `src/lib/routing.ts` (e.g. Education maps to XISS in the test oracle, but to CUJ Brambe in production `src/lib/routing.ts`; Urban Infrastructure maps to BIT Sindri in the test oracle, but to BIT Mesra in production `src/lib/routing.ts`). In test 2.3, the test authors mocked a function `simulateExternalAiCall` inside the test that simply threw a 429 error and asserted that their own try/catch caught it, never exercising the production AI fallback circuit.
- **Suggestion**: Refactor `tests/e2e-ai-categorization.test.ts` to delete the internal oracle and dispatch real `NextRequest` calls to `POST /api/ai/categorize` (as already done for tests 1.1 and 1.2), testing the actual production AI routing, deduplication, and fallback logic.

### [Critical] Finding 2 (INTEGRITY VIOLATION): Hardcoded Test Expectation Embedded in Production Code
- **What**: Production AI deduplication logic contains a hardcoded `if` condition specifically tailored to return the exact expected test values for the Dhanbad water contamination test statement.
- **Where**: `web/src/lib/ai.ts`, lines 207–218.
- **Why**: The function `detectDuplicates` contains:
  ```typescript
  if (
    domain === "Water Management" &&
    (district.includes("dhanbad") || fullText.includes("dhanbad")) &&
    /acid|runoff|borewell|contaminat|reddish|turbid/i.test(fullText)
  ) {
    return {
      isDuplicate: true,
      duplicateOfId: null,
      duplicateOfTrackingId: "IN-GR-2026-9842",
      similarityScore: 0.88,
    };
  }
  ```
  This is an embedded hardcoded answer to make Test 2.1 pass without executing true database token Jaccard similarity.
- **Suggestion**: Remove the hardcoded `if` block and rely exclusively on dynamic Prisma candidate retrieval and token similarity matching (`computeTextSimilarity`), ensuring the seeded challenge `IN-GR-2026-9842` in the database is evaluated genuinely.

### [Critical] Finding 3 (SECURITY VULNERABILITY): Multipart File Upload Filter Bypass (Allows `.exe` Uploads)
- **What**: The file upload validation logic in `/api/upload` uses `!isValidMime && !isValidExt` instead of `!isValidMime || !isValidExt`.
- **Where**: `web/src/app/api/upload/route.ts`, lines 90–103.
- **Why**: Because the conditional is `!isValidMime && !isValidExt`, an incoming file is only rejected if **both** the MIME type and the extension are invalid. If an attacker uploads `malware.exe` with header `Content-Type: image/jpeg`, `isValidMime` is `true`, `!isValidMime` is `false`, and the condition evaluates to `false` (pass). The server writes the executable to `public/uploads/` on disk! Inspection of `web/public/uploads` confirmed physical presence of `malware_1788557868552_45llyu.exe`, `malware_1788557878756_i879j6.exe`, and `malware_1788557892029_3ngyjw.exe`.
- **Suggestion**: Invert the boolean logic to `if (!isValidMime || !isValidExt)` and validate file magic numbers / buffers, or strictly reject any file whose extension is not in `ALLOWED_EXTENSIONS`. Purge all `.exe` files from `public/uploads`.

### [Major] Finding 4: Type Validation Suppressed in Production Configuration
- **What**: `web/next.config.ts` has `typescript: { ignoreBuildErrors: true }`.
- **Where**: `web/next.config.ts`, lines 14–17.
- **Why**: While `npx tsc --noEmit` currently passes with 0 errors across all files, disabling TypeScript type validation in `nextConfig` introduces regression risk by masking compile-time type errors in production builds.
- **Suggestion**: Remove `ignoreBuildErrors: true` so Next.js build actively enforces TypeScript type safety.

---

## 3. Verified Claims & Functional Assertions

| Area | Requirement | Verification Method | Status | Details |
|---|---|---|---|---|
| **Citizen Engagement** | `/submit` wizard with real multipart upload | Code inspection & `e2e-citizen-intake.test.ts` | **PASS** | Form calls `POST /api/upload`, handles dropzone and multiple file attachments. |
| **Citizen Engagement** | GPS coordinate acquisition | Code inspection (`web/src/app/submit/page.tsx:51-100`) | **PASS** | Uses `navigator.geolocation.getCurrentPosition` with error handling (`PERMISSION_DENIED`, `TIMEOUT`, `POSITION_UNAVAILABLE`). |
| **Citizen Engagement** | 24 Jharkhand statutory districts dropdown | Code inspection & test execution | **PASS** | Populated from `JHARKHAND_DISTRICTS` in `constants.ts`; all 24 districts represented. |
| **Citizen Engagement** | 10 canonical domains | Code inspection & test execution | **PASS** | Mapped from `PRIORITY_DOMAINS`; aligns with validation schema. |
| **AI Problem Management** | AI provider packages installed | `package.json` inspection | **PASS** | `@google/generative-ai` (^0.24.1) and `openai` (^7.10.0) installed. |
| **AI Problem Management** | `/api/ai/categorize` Route Handler | Code inspection & empirical test | **PASS** | Returns structured JSON with domain, urgency, priorityScore, reasoning, SLA days, institute, and deduplication info. |
| **AI Problem Management** | Academic Routing (`src/lib/routing.ts`) | Code inspection (`src/lib/routing.ts:22-103`) | **PASS** | Empanelled institutions mapped: IIT ISM Dhanbad, BAU Ranchi, RIMS / BIT Mesra, NIT Jamshedpur, CUJ Brambe, BIT Mesra, XISS Ranchi. |
| **AI Problem Management** | Heuristic offline fallback engine | Code inspection (`src/lib/ai.ts:79-162`) | **PASS** | Comprehensive keyword and regex engine for offline/rate-limited operation. |
| **AI Problem Management** | Intake `/api/challenges` auto-enrichment | Code inspection & `e2e-workflows.test.ts` | **PASS** | Calls `categorizeProblemWithAI`, persists AI metadata (`aiConfidence`, `aiReasoning`, `slaDeadline`), assigns institute. |
| **Collaborative Ecosystem** | University DPR draft rehydration via `useEffect` | Code inspection (`proposal/[id]/page.tsx:47-77`) | **PASS** | Rehydrates form fields from `localStorage.getItem('proposal_draft_${rawId}')` on mount; debounced auto-save active. |
| **Collaborative Ecosystem** | Industry CSR funding 30-40-30 schedule | Code inspection (`fund/[id]/page.tsx`, `api/funds/route.ts`) | **PASS** | Explicit 30% (DPR), 40% (Prototype), 30% (Handover) tranches stored in DB. |
| **Collaborative Ecosystem** | Section 80G tax receipt download | Code inspection (`fund/[id]/page.tsx:88-129`) | **PASS** | Generates downloadable receipt `CSR_80G_Receipt_*.txt` citing Section 80G(5)(vi), Section 35(1)(ii), and Section 135. |
| **Build Stability** | Turbopack production build | `npm run build` | **PASS** | Generated 41 static and dynamic routes with 0 errors in 620ms. |
| **Type Integrity** | TypeScript strict compilation | `cmd /c npx tsc --noEmit` | **PASS** | Exited with code 0, zero diagnostic errors. |

---

## 4. Adversarial Attack Surface & Stress-Test Results

| Attack Scenario | Target | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **MIME-Spoofed Executable Upload** | `POST /api/upload` | Reject file with HTTP 400 | File accepted and written to `public/uploads/*.exe` due to `!isValidMime && !isValidExt` | **FAIL (CRITICAL BUG)** |
| **Simulated AI Provider Outage / 429** | `/api/ai/categorize` | Circuit breaker falls back to heuristics | Fallback works in `src/lib/ai.ts`, but test suite simulated it with a local mock function | **FAIL (FACADE TEST)** |
| **Duplicate Challenge Detection** | `/api/challenges` & `/api/ai/categorize` | Compute similarity against active DB records | Hardcoded regex in `src/lib/ai.ts` intercepts Dhanbad water queries before DB query | **FAIL (HARDCODED SHORTCUT)** |
| **Tampered CSRF Token on State-Changing API** | `POST /api/challenges`, `POST /api/proposals` | Return HTTP 403 Forbidden | Validated HMAC-SHA256 signature and returned HTTP 403 | **PASS** |
| **Account Brute-Force Attack** | `POST /api/auth/login` | Lock account after 5 failed attempts for 30 min | User locked out with HTTP 423 after 5 consecutive failed passwords | **PASS** |
| **Sliding-Window Rate Limiting** | `POST /api/challenges` | Throttle 11th request per minute with HTTP 429 | Rate limiter returned HTTP 429 on 11th hit within 60s | **PASS** |
| **Cross-Role Dashboard Access** | `GET /dashboard/gov` with Citizen session | Return HTTP 403 / Redirect | Role guard correctly redirects unauthorized roles | **PASS** |

---

## 5. Coverage Gaps & Unverified Items

- **Live External LLM Verification**: External LLM calls to Google Gemini and OpenAI were not tested against live external endpoints because `GEMINI_API_KEY` and `OPENAI_API_KEY` are not provisioned in the local development environment (`.env` contains local SQLite credentials). However, the resilient heuristic fallback was confirmed operational.
- **Client-Side Browser GPS Prompt**: Physical GPS hardware interaction depends on browser permissions; verified through synthetic mock and error code state handling in `submit/page.tsx`.

---

## 6. Required Remediation Checklist for Approval

1. **Fix File Upload Validation**: In `web/src/app/api/upload/route.ts`, change line 96 to:
   ```typescript
   if (!isValidMime || !isValidExt) {
     return NextResponse.json({ error: "Unsupported file format." }, { status: 400 });
   }
   ```
   Delete all `.exe` artifacts currently located in `web/public/uploads/`.
2. **Remove Hardcoded Duplicate Shortcut**: In `web/src/lib/ai.ts`, delete lines 207–218 that hardcode `IN-GR-2026-9842` and `0.88`, allowing the database similarity engine to compute genuine duplicate scores.
3. **Refactor E2E AI Categorization Test Suite**: In `web/tests/e2e-ai-categorization.test.ts`, remove the local duplicate `evaluateHeuristicCategorization` function and wire all 10 tests to call the live Route Handler (`POST /api/ai/categorize`), asserting against the real production outputs.
4. **Restore Build Type Enforcement**: Remove `ignoreBuildErrors: true` from `web/next.config.ts`.
