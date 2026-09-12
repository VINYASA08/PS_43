# Task Assignment: Worker Frontend (M2 Settings UI & M3 Public Claim Route)

## Identity
- Archetype: teamwork_preview_worker
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_frontend
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_survey_1/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_survey_3/handoff.md`

## Scope & File Ownership
You exclusively own and may edit/create:
- `web/src/app/dashboard/settings/page.tsx`
- `web/src/app/handover/[token]/page.tsx`

## Detailed Implementation Instructions

### 1. Milestone 2: Settings UI Handover Section Integration (`web/src/app/dashboard/settings/page.tsx`)
- Add an "Account Handover" tab to the tab list (e.g. `activeTab === "handover"`).
- In the Handover panel:
  - Header: "Official Account & Mandate Handover" with clear administrative context (explaining that initiating transfer will generate an invitation for a designated successor, preserving all historical proposals, challenges, reviews, and roles upon claim).
  - Status display: Fetch current pending handover status on mount (`GET /api/handover/initiate`).
    - If a pending invitation exists:
      - Show active banner: successor email, expiration time (formatted safely on client to avoid React 19 hydration mismatch), and claim link.
      - Copy claim link button (with clipboard feedback).
      - "Revoke / Cancel Handover" button calling `POST /api/handover/cancel` with confirmation and state refresh.
    - If no pending invitation:
      - Show initiate form:
        - Input: Successor Email Address (`type="email"`).
        - Important notice / advisory box: "Transferring your account will grant the successor full access to your position, mandates, and data history. Your existing password and 2FA will be replaced once claimed."
        - Submit button: "Generate Handover Invitation" with loading state calling `POST /api/handover/initiate`.
  - Ensure zero hydration mismatches (use `mounted` state check before rendering client-only dates or window origin).
  - Use existing design tokens: Tailwind CSS, Lucide icons (`Users`, `ShieldAlert`, `CheckCircle2`, `Copy`, `ExternalLink`, `AlertTriangle`, `XCircle`), rounded cards, smooth transitions.

### 2. Milestone 3: Public Successor Claim Route (`web/src/app/handover/[token]/page.tsx`)
- Create the page at `web/src/app/handover/[token]/page.tsx` with `"use client"`.
- Fetch token validation on mount via `GET /api/handover/${token}`:
  - While loading: clean skeleton card.
  - If invalid / expired / already claimed: show clear error card with icon and error message (e.g., "This handover invitation has expired or has already been claimed.") with link to `/login`.
  - If valid:
    - Predecessor Mandate Verification Card:
      - Displays predecessor's Name, Designation, Department/Organization, Role (`GOV`, `UNIVERSITY`, etc.), and District.
      - Displays successor email: "Transferring account to: [successorEmail]".
    - Claim Credential Form:
      - Input: Successor Full Name (`type="text"`, required).
      - Input: New Password (`type="password"`, min 8 characters, required).
      - Input: Confirm New Password (`type="password"`, required).
      - Client-side validation: matching passwords, min length.
      - Submit button: "Accept Mandate & Claim Account".
    - On submission:
      - Call `POST /api/handover/${token}/claim` with `{ successorName, password, confirmPassword }`.
      - On 200 OK:
        - Show success screen ("Account Transferred Successfully! Setting up your session...").
        - Automatically redirect to `res.redirectUrl` (or `/dashboard`) after 1.5 seconds.
  - Hydration safety: use `useEffect` and `isMounted` guard for any browser-specific APIs or parameter reads.

### 3. Verification Required
- Run `npm run build` in `web/` to confirm 0 TypeScript or compile errors.
- Test both pages to verify no hydration warnings or rendering errors.
- Document all work and verification in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_frontend/handoff.md`.
- Message parent orchestrator when complete.

## 2026-09-09T10:59:03Z
You are Worker Frontend for Round 8 (Milestones M2 & M3).
Your working directory is `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_frontend`.
Read your task instructions in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_frontend/DISPATCH.md` and `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md`.
Implement the Settings UI "Account Handover" section in `/dashboard/settings` and the public claim page `/handover/[token]`.
Verify that both render cleanly with 0 hydration errors, run `npm run build`, and write your completion report to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_frontend/handoff.md`.
Message parent orchestrator when complete.
