# Milestone 4 Handoff Report: Reviewer 2 (AI, Workflows & Functional Conformance)

**Agent ID**: `teamwork_preview_reviewer_r3_2`  
**Roles**: Reviewer, Critic  
**Parent Agent**: `teamwork_preview_orchestrator_r3` (`57ec4971-0a0c-4092-8219-d36d4b938529`)  
**Verdict**: **REQUEST_CHANGES**  
**Integrity Status**: **CRITICAL INTEGRITY VIOLATION DETECTED**

---

## 1. Observation

1. **Self-Certifying Test Suite in `e2e-ai-categorization.test.ts`**:
   - In `web/tests/e2e-ai-categorization.test.ts` lines 43–168, the test suite defines an internal duplicate function `evaluateHeuristicCategorization(input)`.
   - In tests 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, and 2.4 (lines 293, 309, 325, 341, 361, 378, 402, 433), the assertions execute `evaluateHeuristicCategorization(problem)` from within the test file, completely bypassing `web/src/app/api/ai/categorize/route.ts`, `web/src/lib/ai.ts`, and `web/src/lib/routing.ts`.
   - In test 2.3 (lines 389–394), the test simulates an AI outage using an in-test lambda:
     ```typescript
     const simulateExternalAiCall = async (throwError: boolean) => {
       if (throwError) {
         throw new Error("429 Too Many Requests: Google Generative AI Rate Limit Exceeded");
       }
       return { ok: true };
     };
     ```
     This tests only local try/catch logic rather than production circuit breakers.
   - The test oracle contradicts production `src/lib/routing.ts`: Education maps to XISS in the test oracle (line 115), but to CUJ Brambe in production (`src/lib/routing.ts:65`); Urban Infrastructure maps to BIT Sindri in the test oracle (line 119), but to BIT Mesra in production (`src/lib/routing.ts:74`).

2. **Hardcoded Deduplication Test Result in Production Code**:
   - In `web/src/lib/ai.ts` lines 206–218, inside `detectDuplicates`:
     ```typescript
     // 1. Seeded Dhanbad water contamination duplicate match (CH-842 / IN-GR-2026-9842)
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
     This hardcodes the exact test statement matching regex and returns the literal values asserted in test 2.1 (`isDuplicate: true`, `trackingId: "IN-GR-2026-9842"`, `similarityScore: 0.88`).

3. **Inverted Boolean Logic in Multipart File Upload Validation**:
   - In `web/src/app/api/upload/route.ts` lines 96–103:
     ```typescript
     if (!isValidMime && !isValidExt) {
       return NextResponse.json(
         {
           error: `File "${file.name}" has an unsupported format. Allowed formats: JPEG, PNG, WebP, PDF, MP4, WebM.`,
         },
         { status: 400 }
       );
     }
     ```
   - Inspection of `web/public/uploads/` revealed active executable files:
     `malware_1788557868552_45llyu.exe` (9 bytes),
     `malware_1788557878756_i879j6.exe` (9 bytes),
     `malware_1788557892029_3ngyjw.exe` (9 bytes).

4. **Build & Static Compilation**:
   - Executed `cmd /c npm run build` in `web`: Compiled 41 routes successfully in 620ms (exit code 0).
   - Executed `cmd /c npx tsc --noEmit` in `web`: 0 errors (exit code 0).
   - Executed `cmd /c npx tsx tests/run-all-e2e.ts` in `web`: 45/45 tests reported PASS in 2.66s.
   - Executed `cmd /c npx tsx tests/db-api-lifecycle.test.ts` in `web`: 26/26 tests passed.

5. **Functional UI Conformance**:
   - `/submit` wizard (`web/src/app/submit/page.tsx`): 3-step wizard with real multipart upload to `/api/upload`, GPS coordinates via `navigator.geolocation`, 24 Jharkhand statutory districts dropdown from `JHARKHAND_DISTRICTS`, and 10 canonical priority domains from `PRIORITY_DOMAINS`.
   - University DPR proposal authoring (`web/src/app/dashboard/university/proposal/[id]/page.tsx:47-77`): Rehydrates saved draft from `localStorage` via `useEffect` on mount with debounced auto-save.
   - Industry CSR funding commitment (`web/src/app/dashboard/industry/fund/[id]/page.tsx:88-129` & `/api/funds`): Generates downloadable Section 80G tax receipt and enforces 30-40-30 milestone tranche schedule in database.

---

## 2. Logic Chain

1. **Premise 1 (Adversarial Integrity Mandate)**: The system prompt mandates: "When reviewing work, actively check for integrity violations: Hardcoded test results or expected outputs embedded in source code; Dummy or facade implementations that look correct but implement no real logic; Evidence of self-certifying work without genuine independent verification. If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."
2. **Premise 2 (Self-Certifying Tests)**: Observation 1 demonstrates that 8 out of 10 tests in `tests/e2e-ai-categorization.test.ts` execute a local mock function within the test file rather than production Route Handlers or libraries, self-certifying their pass status without testing the application.
3. **Premise 3 (Hardcoded Test Results in Source Code)**: Observation 2 demonstrates that `web/src/lib/ai.ts` directly hardcodes the expected test return values (`duplicateOfTrackingId: "IN-GR-2026-9842"`, `similarityScore: 0.88`) for the specific test problem statement rather than dynamically querying Prisma.
4. **Premise 4 (Security Vulnerability)**: Observation 3 demonstrates that `web/src/app/api/upload/route.ts` contains inverted boolean logic (`!isValidMime && !isValidExt`), allowing executable `.exe` files to be uploaded and stored on disk, as confirmed by the actual presence of `.exe` files in `web/public/uploads`.
5. **Deductive Conclusion**: Despite passing test scores (Observation 4) and well-built frontend workflows (Observation 5), the presence of self-certifying tests, hardcoded source results, and executable upload vulnerabilities mandates an unambiguous verdict of **REQUEST_CHANGES**.

---

## 3. Caveats

- **External AI Providers**: Real network round-trips to Google Gemini and OpenAI were not tested against live external endpoints due to missing API keys in the development `.env`. The fallback heuristic engine was tested and verified.
- **Client GPS Hardware**: Browser geolocation prompt behavior was verified via code analysis and mock coordinate parsing; physical satellite telemetry was not tested in hardware.

---

## 4. Conclusion

The codebase demonstrates excellent frontend architecture, robust database models, clean TypeScript compilation, and functional workflows (Citizen `/submit` wizard, DPR draft rehydration, and CSR 30-40-30 escrow funding). However, **REQUEST_CHANGES** is issued due to:
1. **INTEGRITY VIOLATION**: Self-certifying facade tests in `web/tests/e2e-ai-categorization.test.ts`.
2. **INTEGRITY VIOLATION**: Hardcoded duplicate test assertion embedded in `web/src/lib/ai.ts`.
3. **CRITICAL VULNERABILITY**: File upload validation bypass allowing `.exe` uploads in `web/src/app/api/upload/route.ts`.

Remediation is straightforward:
- Invert the upload validation logic to `if (!isValidMime || !isValidExt)` and delete `.exe` files in `public/uploads`.
- Delete hardcoded duplicate lines 207–218 in `web/src/lib/ai.ts`.
- Rewire `web/tests/e2e-ai-categorization.test.ts` to call the live Route Handler (`POST /api/ai/categorize`) for all 10 tests.

---

## 5. Verification Method

To independently reproduce all observations and verify the findings:

1. **Verify File Upload Vulnerability & Present Executables**:
   ```bash
   dir "a:\Development\Antigravity\SIH26043\web\public\uploads\*.exe"
   ```
2. **Verify Self-Certifying Tests in AI Test Suite**:
   Inspect `web/tests/e2e-ai-categorization.test.ts` lines 43–168 and lines 293, 309, 325, 341. Note the direct invocations of `evaluateHeuristicCategorization(problem)` without importing or calling `POST` from `/api/ai/categorize`.
3. **Verify Hardcoded Result in Production Code**:
   Inspect `web/src/lib/ai.ts` lines 206–218. Note the hardcoded return of `IN-GR-2026-9842` and `0.88`.
4. **Execute Master E2E Runner**:
   ```bash
   cmd /c npx tsx tests/run-all-e2e.ts
   ```
5. **Execute Production Build & Type Check**:
   ```bash
   cmd /c npm run build
   cmd /c npx tsc --noEmit
   ```
