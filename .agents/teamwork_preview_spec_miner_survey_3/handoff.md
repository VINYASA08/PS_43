# Handoff Report: AI & Ecosystem Specification Mining

**Author**: Spec Miner Survey 3 (AI & Ecosystem Spec Miner)  
**Date**: 2026-09-04T21:14:00Z  
**Target File**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_spec_miner_survey_3\handoff.md`  
**Comprehensive Report**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_spec_miner_survey_3\spec_report.md`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

1. **Absence of External AI Integration in Codebase**:
   - `package.json` (`web/package.json:11-38`) contains `@prisma/client`, `bcryptjs`, `framer-motion`, `jose`, `lucide-react`, `next`, `qrcode`, `react`, `zod`, `zustand`, but contains NO AI provider SDKs (`@google/genai`, `@google/generative-ai`, or `openai`).
   - `grep_search` across `web/` for `gemini` and `openai` yielded `No results found`.
   - `src/app/api/challenges/route.ts:128-144` stores user-submitted `parsed.data.domain` and `parsed.data.urgency` directly into the database without running NLP categorization, deduplication, priority scoring, or university routing.
   - `src/app/api/track/[id]/route.ts:108-114` statically renders timeline step 2 (`title: "AI Clustered & Triaged"`, `subtitle: "NLP Domain Categorization: " + challenge.domain`, `details: "Automated risk matrix assigned urgency level: " + challenge.urgency`) based on static database values rather than live or stored AI inference outputs.

2. **Database Schema & Academic Landscape**:
   - `prisma/schema.prisma:56-94` (`model Challenge`) defines `domain`, `urgency`, `status`, `assignedInstitute`, `evidence`, and `slaDeadline`, but lacks fields for AI metadata such as `aiConfidence`, `similarityScore`, `isDuplicate`, `duplicateOfId`, or `aiProcessed`.
   - `prisma/seed.ts:130-300` seeds challenges mapped to specific institutions:
     - Water Management (Dhanbad, Sahebganj) -> IIT (ISM) Dhanbad
     - Agriculture (Gumla) -> Birsa Agricultural University (BAU)
     - Healthcare (Simdega) -> RIMS Ranchi / BIT Mesra
     - Energy (Ranchi) -> NIT Jamshedpur
     - Education (Khunti) -> Xavier Institute of Social Service (XISS)
   - Near-duplicate challenges already exist in seed data: `IN-GR-2026-9842` (line 134) and `JHR-2026-842` (line 280) both describe "Contaminated Drinking Water & Acidic Runoff in Dhanbad" with overlapping metrics (pH 4.8, Turbidity 48 NTU).

3. **Collaborative Ecosystem Workflows & Prototype Defect**:
   - In `src/app/dashboard/university/proposal/[id]/page.tsx`, form state is maintained and draft save functionality is present, but `tests/workflows.test.mjs:399-403` confirmed:
     `DOCUMENTED DEFECT: Draft is not rehydrated on page reload (omitted useEffect)`.
   - In `src/app/dashboard/industry/fund/[id]/page.tsx:53-86`, industry partners commit CSR capital via `/api/funds`, generating an escrow reference (`JH-ESCROW-2026-CSR-XXXX`), executing digital MoU acceptance, and generating statutory Section 80G tax receipts.
   - `src/app/api/funds/route.ts:108-130` implements the 30-40-30 milestone tranche disbursement schedule (30% DPR, 40% Pilot, 30% Collector sign-off).
   - In `src/app/api/funds/route.ts:150-161`, committing funds automatically updates the proposal status to `FUNDED` and challenge status to `IN_PROGRESS`.

4. **Test Suite Execution & Runtime Oracles**:
   - `node tests/workflows.test.mjs` executed cleanly: `22 PASSED | 0 FAILED`.
   - `cmd /c "npx tsx tests/auth-rbac-security.test.ts"` executed cleanly: `29 PASSED | 0 FAILED | 29 TOTAL`, proving unauthenticated access yields 401, unauthorized roles yield 403, and rate limiting triggers at 11 requests/min.
   - `cmd /c "npx tsx tests/db-api-lifecycle.test.ts"` exposed SQLite unique constraint behavior: attempting to re-create a soft-deleted user with phone `+919999988888` triggers Prisma error `P2002: Unique constraint failed on the fields: (phone)` because soft-deleted rows physically remain in SQLite.

5. **Build Baseline Execution**:
   - Executing `cmd /c "npm run build"` compiled Next.js and passed TypeScript checks cleanly in 3.5s (`✓ Compiled successfully in 385ms`, `Finished TypeScript in 3.5s`, `Generating static pages using 15 workers (32/32)`).
   - However, it failed in the final page optimization step with:
     `Error: ENOENT: no such file or directory, open 'A:\Development\Antigravity\SIH26043\web\.next\static\8ZbqQpSmiC3C8gM50z8pr\_ssgManifest.js'`.
   - Root cause: Next.js 16 with Turbopack does not generate `_ssgManifest.js` in the format expected by the PWA wrapper configured in `next.config.ts`.

---

## 2. Logic Chain

1. From Observation 1, the portal currently possesses zero integration with Google Gemini or OpenAI APIs. The existing application layer treats AI categorization as a cosmetic presentation element in the UI. Therefore, fulfilling requirement **R2 (AI-Enabled Problem Management)** requires installing an official external AI SDK, providing API key environment variable configurations, and creating a dedicated server-side classification endpoint (`/api/ai/categorize`).
2. From Observation 1 and 2, external AI calls must not be placed on the client-side due to CSP constraints (`connect-src 'self'`) and OWASP secret protection requirements (`ORIGINAL_REQUEST.md` § R4). Wrapping the AI logic inside Next.js server Route Handlers keeps `GEMINI_API_KEY` / `OPENAI_API_KEY` secure.
3. From Observation 1 and Observation 4, external AI providers are susceptible to network latency, HTTP 429 rate limits, and outages. To fulfill system stability requirements (`ORIGINAL_REQUEST.md` § R4), citizen submissions must never fail when an AI API is down. A rule-based regex and keyword heuristic fallback must be implemented as a resilient secondary path.
4. From Observation 2, the academic ecosystem in Jharkhand is specialized by domain and region. The routing logic can be deterministically specified by matching the inferred domain and district against the institutional strengths of empanelled universities (e.g., IIT ISM for Water/Mining, BAU for Agriculture, BIT Mesra/RIMS for Healthcare, NIT Jamshedpur for Energy).
5. From Observation 3, the collaborative workflow between university proposals and corporate CSR escrow is functional at the API level, but proposal draft recovery on the frontend is broken due to a missing `useEffect` hydration hook. Fixing this ensures seamless PI authoring.
6. From Observation 5, achieving the Acceptance Criteria of a "0-error build" requires resolving the Turbopack manifest generation conflict with `@ducanh2912/next-pwa` in `next.config.ts`.

---

## 3. Caveats

1. **No External Network Probing**: No external HTTP requests to `api.openai.com` or `generativelanguage.googleapis.com` were attempted during this survey because external API keys are not yet configured in `.env`.
2. **PostgreSQL vs SQLite In-Memory Compatibility**: The current development database is SQLite (`dev.db`). In production with PostgreSQL, vector similarity search can utilize `pgvector` extensions (`vector(1536)`), whereas in SQLite/development, similarity matching is performed either via client-side vector cosine math or LLM prompt evaluation.
3. **PWA Build Plugin Incompatibility**: The `_ssgManifest.js` build defect was diagnosed through build log output analysis. Resolving it will require the developer to adjust `next.config.ts` (e.g., disabling PWA during Turbopack builds or configuring webpack fallback).

---

## 4. Conclusion

The specification for **R2 (AI-Enabled Problem Management)**, **R3 (Collaborative Ecosystem Workflows)**, and **Acceptance Criteria & Test Specifications** has been fully explored, documented, and architected.

Key implementation directives:
1. **AI Route (`/api/ai/categorize`)**: Implement structured JSON classification via Gemini/OpenAI with fallback to offline keyword heuristics for 10 canonical domains, 4 urgency levels, SLA deadlines, and academic routing.
2. **Citizen Submission Integration**: Update `/api/challenges` to invoke the categorization engine upon intake and store AI confidence, SLA deadline, and recommended institute.
3. **Proposal Hydration**: Add `useEffect` hydration hook to `src/app/dashboard/university/proposal/[id]/page.tsx` to restore drafts from `localStorage`.
4. **Build Tuning**: Configure `next.config.ts` to prevent the `_ssgManifest.js` ENOENT build failure under Turbopack.
5. **Test Infrastructure**: Implement automated programmatic suites for citizen intake (multimedia & geo), external AI classification (live + mock fallback), and verify RBAC security.

---

## 5. Verification Method

To independently verify the observations, data contracts, and test executions:

1. **Inspect Detailed Specification Report**:
   ```bash
   view_file a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_spec_miner_survey_3\spec_report.md
   ```
2. **Verify Workflow Test Suite**:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   node tests/workflows.test.mjs
   ```
   *Expected Output*: `22 PASSED | 0 FAILED` (including confirmation of the proposal draft hydration defect).
3. **Verify RBAC Security Suite**:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   cmd /c "npx tsx tests/auth-rbac-security.test.ts"
   ```
   *Expected Output*: `29 PASSED | 0 FAILED | 29 TOTAL` (verifying 401 unauthenticated, 403 unauthorized, and rate limiting).
4. **Verify Build Baseline & ENOENT Defect**:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   cmd /c "npm run build"
   ```
   *Expected Output*: TypeScript compilation passes cleanly, but final page optimization encounters `ENOENT: ... _ssgManifest.js`.
