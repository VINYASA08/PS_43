# Dispatch: Worker 1 (Web Flow, Missing Pages & Dead Buttons Repair)

## Assigned Role & Identity
You are Worker 1 (`teamwork_preview_worker_r7_m1`).
Working Directory: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m1`
Project Root: `a:/Development/Antigravity/SIH26043`
Target Codebase: `a:/Development/Antigravity/SIH26043/web`

## MANDATORY Reading
Read `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically see entry under `## 2026-09-09T04:59:23Z`).
Also read:
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_1/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/orchestrator_r7/PROJECT.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own files in `web/src/app/`. Do not touch `mobile/`.

## Detailed Tasks to Implement

### 1. Fix Unauthorized Redirection in Dashboards (F1)
In `web/src/app/dashboard/gov/page.tsx:62`, `web/src/app/dashboard/university/page.tsx:52`, and `web/src/app/dashboard/industry/page.tsx:68`:
Replace the broken dynamic interpolation (`router.replace('/dashboard/' + target + '?error=unauthorized')`) with a safe role router matching `RoleGuard.tsx`:
```typescript
if (userRole === "GOV") router.replace("/dashboard/gov");
else if (userRole === "UNIVERSITY") router.replace("/dashboard/university");
else if (userRole === "INDUSTRY") router.replace("/dashboard/industry");
else router.replace("/submit?error=unauthorized");
```

### 2. Update Dashboard Layout Navigation & Link Orphaned Pages (F2, F3)
In `web/src/app/dashboard/layout.tsx`:
- Add `{ name: "Industry-University Chat", href: "/dashboard/chat", icon: MessageSquare }` for University and Industry roles.
- Add `{ name: "Open Contributor Board", href: "/dashboard/open-board", icon: ListTodo }` for University, Gov, and general navigation.
- For Citizen / Expert fallback roles in `getNavigation()`: Provide valid citizen links:
  `[ { name: "Report Problem", href: "/submit", icon: ... }, { name: "Track Grievance", href: "/track", icon: ... }, { name: "Contributor Tasks", href: "/dashboard/open-board", icon: ... }, { name: "Public Accountability", href: "/accountability", icon: ... }, { name: "Settings", href: "/dashboard/settings", icon: ... } ]`.
- In lines 145–160, wrap the user profile card in `<Link href="/dashboard/settings">` so clicking user info opens profile settings.
- In `web/src/app/challenge/[id]/page.tsx`, ensure the mentor/expert application button links to `/apply/${challenge.publicTrackingId || challenge.id}` (or offers a direct link alongside the modal).

### 3. Resolve Parameter Ambiguities on Dynamic Routes (F4)
- In `web/src/app/dashboard/university/proposal/[id]/page.tsx`:
  When loaded with an existing proposal ID, store `challengeId` from the fetched proposal, set an `isEditing` flag, and on submission call `PUT /api/proposals/${rawId}` instead of failing with `POST /api/proposals`.
- In `web/src/app/dashboard/industry/fund/[id]/page.tsx`:
  Detect whether `params.id` is a funding commitment ID or proposal ID. If it's a commitment ID, fetch and display the escrow tranches and disbursement status; if a proposal ID, display the CSR escrow pledge form.

### 4. Create Branded Fallback Pages (F5)
- Implement `web/src/app/not-found.tsx`: Branded Next.js App Router 404 page adhering to the Tailwind CSS design system with "Return to Portal" CTA.
- Implement `web/src/app/error.tsx`: Branded client error boundary adhering to design system with "Retry" CTA.

### 5. Wire Dead Buttons & Interactive Elements (F6)
- In `web/src/app/whatsapp-intake/page.tsx`:
  - Wire emoji button (line 285) to insert `😊` into `inputValue`.
  - Wire paperclip button (line 317) to invoke `sendAttachment("photo")`.
  - Wire camera button (line 321) to invoke `sendAttachment("photo")`.
  - Wrap `Video`, `Phone`, `MoreVertical` (lines 192–194) in buttons triggering a simulated toast notification.
  - Wire microphone button when `!inputValue` to simulate speech-to-text input.
- In `web/src/app/dashboard/settings/page.tsx`:
  - Expose the 2FA Configuration card in the Security tab JSX using existing `handleStartTotpSetup` and `handleConfirmTotp`.

## Verification & Build
After implementing, verify:
`cd a:/Development/Antigravity/SIH26043/web && npm run build`
Must compile successfully with 0 errors across all routes.
Write your completion report to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m1/handoff.md` with build evidence and message your parent (`8534b656-72e3-43eb-908f-39e849088abf`).

## 2026-09-09T05:09:27Z
You are Worker 1 (Web Platform QA & Flow Repair Worker).
Your working directory is a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m1
Read your instructions in a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m1/DISPATCH.md
MANDATORY: Read a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (specifically entry under ## 2026-09-09T04:59:23Z).
Also read the survey reports in .agents/teamwork_preview_explorer_r7_survey_1/handoff.md and .agents/teamwork_preview_explorer_r7_survey_3/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
1. Fix unauthorized redirects in gov/page.tsx, university/page.tsx, and industry/page.tsx to eliminate 404 targets (/dashboard/citizen and /dashboard/expert).
2. Wire up orphaned routes in dashboard/layout.tsx: add /dashboard/chat and /dashboard/open-board, provide valid citizen navigation links, wrap user profile badge in Link to /dashboard/settings. Ensure /apply/[challengeId] is linked.
3. Fix parameter handling in university/proposal/[id] (PUT for existing proposals) and industry/fund/[id] (inspect commitment vs pledge form).
4. Create branded not-found.tsx and error.tsx adhering to Tailwind design.
5. Wire dead buttons in whatsapp-intake/page.tsx and expose 2FA config card in dashboard/settings/page.tsx.
6. Verify npm run build completes with exit code 0 and 0 errors across all routes.
Write your complete handoff report to a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m1/handoff.md and send a message to parent (conversation ID 8534b656-72e3-43eb-908f-39e849088abf).

