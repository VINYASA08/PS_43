# Dispatch for Explorer Survey 2 (Backend APIs, AI Match & Race Condition Claim)

## Mission
Investigate Next.js backend API routes, services, handlers, and endpoints related to:
1. Citizen submission triage, Sarpanch verification routes that must be removed or replaced with District Nodal Officer routing.
2. Triage actions: Reject (with reason), Divert to Gov Body (PWD, Municipal Corp, etc.), Route to Academia.
3. AI 3-way university match simulation (logging mock emails to console).
4. Claim challenge endpoint for universities with atomic race condition locking (first university to claim succeeds, subsequent claims fail/reject).
5. Existing auth, roles, and test scripts.

## Key Files & Requirements
- Read ORIGINAL_REQUEST.md at `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically `## 2026-09-08T18:38:41Z`).
- Explore `web/src/app/api/...` or wherever API routes live.
- Determine concurrency/atomic update mechanism in Prisma/PostgreSQL or API for claim race condition.
- Deliver your findings to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_2/handoff.md`.

## 2026-09-08T18:40:00Z
You are Explorer Survey 2 (Backend APIs, AI Match & Race Condition Claim).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_2
Read your dispatch file at: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_2/DISPATCH.md
Read the authoritative user request at: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (header ## 2026-09-08T18:38:41Z).

Your goal:
Investigate Next.js backend API routes, services, handlers, and endpoints related to:
1. Citizen submissions and triage: where Sarpanch verification is currently handled and what API routes need to be removed or replaced for the District Nodal Officer.
2. The exact API design for Nodal Officer triage:
   - Reject (with rejection reason)
   - Divert to Gov Body (PWD, Municipal Corp, etc.)
   - Route to Academia (triggers AI 3-way match & mock email console logs)
3. The AI 3-way university match simulation service and console email logging.
4. The university "Claim" endpoint and how to guarantee strict atomic race condition locking (e.g., Prisma interactive transaction, atomic conditional update `updateMany` with `{ status: 'routed_to_academia', claimedBy: null }`, or database lock) so that the first university wins and subsequent claims are rejected/locked out.

Write your comprehensive findings and recommendations to:
a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_2/handoff.md
Once done, send a message back to parent with a concise summary and reference to your handoff file.
