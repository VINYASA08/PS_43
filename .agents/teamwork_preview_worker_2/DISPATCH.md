# Dispatch for Worker 2 (Targeted Remediation & Verification)

## Mission
Apply the targeted fixes formulated by Fix Explorers 1, 2, and 3 to resolve all gate issues reported by Reviewer 1 and Challenger 2:
1. **Fix 1: Zod Error Handling in `web/src/app/api/nodal/triage/route.ts:69`**:
   - Replace line 69 with:
     ```ts
     const firstError = validationResult.error.issues?.[0]?.message || "Invalid triage parameters";
     ```
   - Reference: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_1/handoff.md` and patch file.
2. **Fix 2: Bug & String Cleanup in `web/src/app/api/mobile/verify/route.ts`**:
   - Destructure `nodalOfficerId` on line 7:
     ```ts
     const { challengeId, sarpanchId, nodalOfficerId } = await req.json();
     ```
   - Evaluate `const officerId = nodalOfficerId || sarpanchId;`.
   - Update line 17 to support `officerId === "test-sarpanch-id" || officerId === "test-nodal-id"`.
   - Update AI evidence string to `"Verified by District Nodal Officer."` and audit log `newState`.
   - Reference: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_2/handoff.md` and `proposed_route.ts`.
3. **Fix 3: Deduplicate Markup in `web/src/app/dashboard/university/page.tsx`**:
   - Remove the redundant second `<AnimatePresence>` toast block and redundant legacy header (lines 258–285), preserving the AI 3-Way Academic Match Queue and interactive Claim Challenge button.
   - Reference: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_3/handoff.md`.
4. **Verification**:
   - Run `npx tsx tests/challenger_boundary_attacks.ts` in `web/` and verify **37/37 PASSED (100%)**.
   - Run `npx tsx tests/test_nodal_triage_and_claim.ts` in `web/` and verify **11/11 PASSED (100%)**.
   - Run `npx tsx tests/test_3track_triage.ts` and `npx tsx tests/judge_e2e_mobile.ts` to ensure 0 regressions.
   - Run `npm run build` in `web/` and verify 0 errors, exit code 0 across all routes.
5. **Mandatory Integrity Warning**:
   DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your report to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_2/handoff.md`.

## 2026-09-08T19:03:09Z
You are Worker 2 (Targeted Remediation Worker).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_2
Read your dispatch file at: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_2/DISPATCH.md
Read the authoritative user request at: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (header ## 2026-09-08T18:38:41Z).
Read PROJECT.md at: a:/Development/Antigravity/SIH26043/.agents/orchestrator_r6/PROJECT.md
Read Fix Explorer reports:
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_1/handoff.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_2/handoff.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_fix_3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective:
1. Fix 1: In `web/src/app/api/nodal/triage/route.ts:69`, replace `.errors` with `.issues`:
   `const firstError = validationResult.error.issues?.[0]?.message || "Invalid triage parameters";`
2. Fix 2: In `web/src/app/api/mobile/verify/route.ts`:
   - Destructure `nodalOfficerId` on line 7: `const { challengeId, sarpanchId, nodalOfficerId } = await req.json();`
   - Evaluate `const officerId = nodalOfficerId || sarpanchId;`
   - Update line 17 to check `officerId === "test-sarpanch-id" || officerId === "test-nodal-id"`
   - Update line 45 AI evidence note: `"Verified by District Nodal Officer."`
   - Update audit log description and `newState`.
3. Fix 3: In `web/src/app/dashboard/university/page.tsx`:
   - Remove redundant duplicate toast `<AnimatePresence>` and redundant legacy header (lines 258–285), preserving the AI 3-Way Academic Match Queue and interactive Claim Challenge button.
4. Verification:
   - Run `npx tsx tests/challenger_boundary_attacks.ts` in `web/` and assert 37/37 PASSED (100%).
   - Run `npx tsx tests/test_nodal_triage_and_claim.ts` in `web/` and assert 11/11 PASSED (100%).
   - Run `npx tsx tests/test_3track_triage.ts` and `npx tsx tests/judge_e2e_mobile.ts` (0 regressions).
   - Run `npm run build` in `web/` and assert exit code 0.
5. Write your complete handoff report to:
   a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_2/handoff.md
Once complete, send a message to parent with summary and handoff reference.
