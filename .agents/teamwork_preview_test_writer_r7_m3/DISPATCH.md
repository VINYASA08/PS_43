# Dispatch: Test Writer (Automated Web Route Crawler Suite)

## Assigned Role & Identity
You are Test Writer (`teamwork_preview_test_writer_r7_m3`).
Working Directory: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r7_m3`
Project Root: `a:/Development/Antigravity/SIH26043`
Target Test Location: `a:/Development/Antigravity/SIH26043/web/tests/test_route_crawler.mjs`

## MANDATORY Reading
Read `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically see entry under `## 2026-09-09T04:59:23Z`).
Also read:
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/handoff.md` (Section 4.2 Architecture Specification)
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/crawler_spec_prototype.mjs`
- `a:/Development/Antigravity/SIH26043/.agents/orchestrator_r7/PROJECT.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own files in `web/tests/`. Do not touch source application code.

## Detailed Tasks to Implement
1. Review the prototype crawler in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/crawler_spec_prototype.mjs`.
2. Implement the official automated test script at `a:/Development/Antigravity/SIH26043/web/tests/test_route_crawler.mjs` (or `.ts`).
3. The crawler MUST:
   - Discover or probe the running Next.js port (e.g. 3000, 3005, 3001) or start/connect to local server.
   - Crawl all 25 major web routes cataloged in the survey (public static, authenticated dashboards, dynamic detail pages, and query variations).
   - Assert for EVERY route:
     a) HTTP Status === 200
     b) Content-Type includes 'text/html'
     c) Body size >= 500 bytes
     d) No Next.js server crash markers: `/Application error/i`, `/500: Internal Server Error/i`, `/digest:\s*["']\d+["']/i`
     e) No React hydration failure markers: `/Hydration failed/i`, `/Text content does not match/i`, `/Minified React error #(?:418|423|425)/i`
4. Execute the test script:
   `node web/tests/test_route_crawler.mjs` (or `npx tsx web/tests/test_route_crawler.ts`)
5. Document all route results, pass/fail counts, and latency metrics in your handoff report at `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r7_m3/handoff.md` and message the parent orchestrator (`8534b656-72e3-43eb-908f-39e849088abf`).
