# Dispatch for Worker M3

**Role**: Worker (Milestone 3: Collaborative Ecosystem & Security Hardening)
**Working Directory**: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m3_1
**Exclusively Owned Files**:
- `web/src/app/api/users/profile/route.ts`
- `web/src/app/api/challenges/[id]/apply/route.ts`
- `web/src/app/dashboard/gov/page.tsx`
- `web/src/app/dashboard/university/page.tsx`
- `web/src/app/dashboard/industry/page.tsx`
- `web/src/app/dashboard/university/proposal/[id]/page.tsx`

## 2026-09-04T21:28:19Z
You are Worker M3 (Milestone 3: Collaborative Ecosystem & Security Hardening).
Your working directory is: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m3_1
Authoritative request file: a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md (read all sections, especially ## 2026-09-04T21:04:25Z and ## 2026-09-04T14:06:00Z)
Project master spec: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_orchestrator_r3\PROJECT.md
Survey reports to consult: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_2\survey_report.md` and `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_spec_miner_survey_3\spec_report.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You exclusively own:
- `web/src/app/api/users/profile/route.ts`
- `web/src/app/api/challenges/[id]/apply/route.ts`
- `web/src/app/dashboard/gov/page.tsx`
- `web/src/app/dashboard/university/page.tsx`
- `web/src/app/dashboard/industry/page.tsx`
- `web/src/app/dashboard/university/proposal/[id]/page.tsx`
Do NOT edit other API routes or other pages.

Objective:
Implement Milestone 3: Collaborative Ecosystem & Security Hardening:
1. CSRF Security Patches:
   - In `web/src/app/api/users/profile/route.ts`: In the `PUT` handler, add CSRF validation using `validateCsrfRequest(req)` (return 403 if invalid).
   - In `web/src/app/api/challenges/[id]/apply/route.ts`: In the `POST` handler, add CSRF validation using `validateCsrfRequest(req)` (return 403 if invalid).
2. Frontend Subpage RBAC Protection:
   - In `web/src/app/dashboard/gov/page.tsx`: Protect the page so only `role === 'GOV'` can access Gov Dashboard; if another role (e.g. UNIVERSITY, INDUSTRY, CITIZEN) navigates to this URL, redirect them to their respective dashboard (`/dashboard/${user.role.toLowerCase()}`) with a notice.
   - In `web/src/app/dashboard/university/page.tsx`: Restrict to `role === 'UNIVERSITY'`; redirect other roles to their respective dashboards.
   - In `web/src/app/dashboard/industry/page.tsx`: Restrict to `role === 'INDUSTRY'`; redirect other roles to their respective dashboards.
3. Proposal Draft Hydration Defect:
   - In `web/src/app/dashboard/university/proposal/[id]/page.tsx`: Add a `useEffect` hook to rehydrate saved draft form fields (title, abstract, methodology, budget, milestones) from `localStorage` on component mount, ensuring PIs do not lose drafted proposals on page reload.
4. Verify all changes:
   - Run `cmd /c npm run build` (verify 0 errors)
   - Run `cmd /c npx tsx tests/run-all-e2e.ts` (verify 45/45 PASS)
   - Run `cmd /c npx tsx tests/auth-rbac-security.test.ts` (29/29 PASS)
   - Run `cmd /c node tests/workflows.test.mjs` (22/22 PASS)
   - Run `cmd /c npx tsx tests/db-api-lifecycle.test.ts` (26/26 PASS)
   Ensure all tests pass and build succeeds cleanly.

Deliverables:
Write `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m3_1\worker_report.md` and `handoff.md`.
Message parent with summary of changes and verification evidence.
