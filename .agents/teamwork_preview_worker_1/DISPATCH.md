# Dispatch for Worker 1: Full Implementation & Test Suite

## Mission
Implement the complete architectural pivot to replace the Sarpanch role with a District Nodal Officer routing system, AI 3-way matching with console email logs, university atomic race-condition claim endpoint, Next.js Web Nodal Dashboard, and automated test suite.

## Authoritative User Request & Scope Documents
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (header `## 2026-09-08T18:38:41Z`)
- `a:/Development/Antigravity/SIH26043/.agents/orchestrator_r6/PROJECT.md`
- Survey Handoffs:
  - `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_1/handoff.md` (Database & Schema blueprint)
  - `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_2/handoff.md` (Backend APIs & Concurrency blueprint)
  - `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_3/handoff.md` (Frontend Dashboard & Test Infra blueprint)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks & Responsibilities
1. **Database & Schema Updates**:
   - In `web/prisma/schema.prisma`:
     - Remove `localVerified` from `model Challenge`.
     - Add fields to `model Challenge`:
       - `nodalStatus String @default("pending")` (`pending`, `rejected`, `diverted_to_gov`, `routed_to_academia`)
       - `rejectionReason String?`
       - `divertedTarget String?`
       - `divertedAt DateTime?`
       - `matchedUniversities String?` (JSON string array of 3 matched universities)
       - `claimedById String?`
       - `claimedBy User? @relation("ClaimedChallenges", fields: [claimedById], references: [id])`
       - `claimedInstitute String?`
       - `claimedAt DateTime?`
       - `nodalOfficerId String?`
       - `nodalOfficer User? @relation("NodalOfficerChallenges", fields: [nodalOfficerId], references: [id])`
       - `nodalReviewedAt DateTime?`
     - In `model User`:
       - Add back-relations `claimedChallenges Challenge[] @relation("ClaimedChallenges")`
       - Add back-relations `nodalReviewedChallenges Challenge[] @relation("NodalOfficerChallenges")`
   - Run `npx prisma db push` in `web/` (or via cmd/pwsh).
   - In `web/prisma/seed.ts`:
     - Update seed script to ensure sample challenges have valid `nodalStatus` values (including pending submissions).
     - Add 3 university users (e.g. IIT ISM Dhanbad, BAU Ranchi, NIT Jamshedpur).
     - Run `npx prisma db seed`.

2. **Backend APIs & AI Matching**:
   - Refactor/deprecate `web/src/app/api/mobile/verify/route.ts` so it no longer uses `localVerified`.
   - Implement `web/src/lib/ai-matching.ts`:
     - Function `matchUniversities(challenge)` selecting top 3 empanelled universities from `web/src/lib/routing.ts` based on domain/district.
     - Function `sendSimulatedClaimEmails(challenge, universities)` logging mock emails to console:
       `[Mock Email to university.email] You have been matched to Challenge [title]. Claim link: http://localhost:3000/challenge/[id]`
   - Implement `web/src/app/api/nodal/triage/route.ts` (and/or `/api/challenges/[id]/triage`):
     - `POST` accepting `{ challengeId, action, rejectionReason, divertedTarget, nodalOfficerId }`.
     - `reject`: requires `rejectionReason` (min 5 chars). Updates `nodalStatus = "rejected"`, `rejectionReason`, `nodalReviewedAt = new Date()`.
     - `divert_to_gov`: requires `divertedTarget` (e.g. PWD, Municipal Corp). Updates `nodalStatus = "diverted_to_gov"`, `divertedTarget`, `divertedAt = new Date()`.
     - `route_to_academia`: Triggers AI 3-way match, logs console mock emails, updates `nodalStatus = "routed_to_academia"`, `matchedUniversities = JSON.stringify(universities)`.
     - Records audit log in `AuditLog` table.
   - Implement `web/src/app/api/challenges/[id]/claim/route.ts`:
     - `POST` accepting `{ universityId, universityName }`.
     - Enforce atomic race condition locking using Prisma conditional update:
       ```ts
       const result = await prisma.challenge.updateMany({
         where: {
           id: params.id,
           nodalStatus: "routed_to_academia",
           claimedAt: null,
         },
         data: {
           claimedById: universityId,
           claimedInstitute: universityName,
           claimedAt: new Date(),
         }
       });
       ```
     - If `result.count === 1`: returns HTTP 200 with `{ success: true, claimedInstitute: universityName, message: "Challenge successfully claimed" }`.
     - If `result.count === 0`: returns HTTP 409 Conflict with `{ error: "Challenge has already been claimed or is not open for claiming" }`.

3. **Frontend Nodal Dashboard & Claim UI**:
   - Create `web/src/app/dashboard/nodal/page.tsx` (and link/embed in `web/src/app/dashboard/gov/page.tsx`):
     - View pending citizen submissions (`nodalStatus == 'pending'`).
     - Reject button with modal/input prompting for mandatory reason.
     - Divert to Gov Body button with dropdown (PWD/RCD, RMC, DMC, JNAC, DWSD, JUVNL, etc.).
     - Route to Academia button triggering match & dispatch.
     - Clear status badges and feedback toast/message.
   - Update `web/src/app/dashboard/university/page.tsx` or `/challenge/[id]`:
     - Display matched challenges.
     - Show "Claim Challenge" button when unclaimed.
     - Show "Claimed by [Institute]" badge when claimed.

4. **Automated Verification Test Suite**:
   - Create `web/tests/test_nodal_triage_and_claim.ts` (executable via `npx tsx tests/test_nodal_triage_and_claim.ts` from `web/`):
     - Step 1: Create or identify a test challenge in `pending` status.
     - Step 2: Simulate Nodal Officer calling triage API with `route_to_academia`.
       - Assert response is 200, `nodalStatus` is `routed_to_academia`, and 3 matched universities are generated.
     - Step 3: Simulate University A calling `POST /api/challenges/[id]/claim`.
       - Assert response is HTTP 200, `claimedInstitute` is University A.
     - Step 4: Immediately simulate University B calling `POST /api/challenges/[id]/claim` for the same challenge.
       - Assert response is HTTP 409 Conflict / rejected, and challenge remains locked to University A.
     - Step 5: Test Reject action (with reason) and Divert action (with target body) to verify full coverage.
   - Run the test suite and verify 100% passing tests.
   - Run `npm run build` in `web/` and verify zero errors, exit code 0.

5. **Reporting**:
   - Write full implementation and verification results to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_1/handoff.md`.

## 2026-09-08T18:45:32Z
Received dispatch invocation from parent. Objective: Full Stack Implementation Worker for District Nodal Officer routing system, AI 3-way matching, race condition university claim endpoint, Web Nodal Dashboard, automated test suite, and build verification.

