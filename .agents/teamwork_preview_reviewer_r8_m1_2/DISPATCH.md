# Task Assignment: Reviewer 2 (M1 Backend Handover Review)

## Identity
- Archetype: teamwork_preview_reviewer
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_reviewer_r8_m1_2
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1/handoff.md`

## Scope
Review the backend implementation for Milestone 1:
- `web/prisma/schema.prisma`
- `web/src/app/api/handover/initiate/route.ts`
- `web/src/app/api/handover/[token]/route.ts`
- `web/src/app/api/handover/[token]/claim/route.ts`
- `web/src/app/api/handover/cancel/route.ts`
- `web/tests/test_handover_backend.ts`

## Review Criteria
1. Interface conformance: Do the request/response shapes match `PROJECT.md` interface contracts?
2. Data & Role preservation: Does the claim endpoint preserve the exact `User.id`, role, organization, and all dependent models (`Challenge`, `Proposal`, etc.)?
3. Build & Test: Run `npx tsx tests/test_handover_backend.ts` and `npm run build` in `web/` and verify pass.
4. Output: Write your structured verdict (`APPROVE` or `REQUEST_CHANGES`) to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_reviewer_r8_m1_2/handoff.md`.
5. Communicate back to parent orchestrator via send_message.

## 2026-09-09T10:32:10Z
You are Reviewer 2 for Milestone M1 (Round 8).
Your working directory is `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_reviewer_r8_m1_2`.
Read your task instructions in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_reviewer_r8_m1_2/DISPATCH.md` and `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md`.
Review M1 backend code against interface contracts and data preservation, run build & tests, write your verdict (APPROVE / REQUEST_CHANGES) to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_reviewer_r8_m1_2/handoff.md`, and report back via send_message.
