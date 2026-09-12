# Dispatch: Milestone 4 - Programmatic 3-Track Triage Test Suite
- Role: Test Writer (teamwork_preview_test_writer)
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r4_m4_1
- Source of Truth: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md
- Scope: Author and execute autonomous test script a:/Development/Antigravity/SIH26043/web/tests/test_3track_triage.ts submitting three mock problems (Track A, Track B, Track C) and asserting database persistence and routing.

## 2026-09-05T11:25:41Z
You are teamwork_preview_test_writer (Test Writer M4: Programmatic 3-Track Triage Test Suite).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r4_m4_1
Your original parent conversation ID is: 7855deb8-3512-4bc1-b772-4058637aec00

MANDATORY FIRST STEP: Read a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md and a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r4_m4_1/DISPATCH.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You own exclusively:
- web/tests/test_3track_triage.ts

Reference Inputs:
- a:/Development/Antigravity/SIH26043/architecture_flow.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_spec_miner_r4_survey_3/handoff.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m2_1/handoff.md

Objective:
Implement and execute the programmatic acceptance criteria test script at `web/tests/test_3track_triage.ts`:
"Programmatic: A test script is created and run that successfully submits three mock problems (one for each track) and verifies they are routed and categorized correctly in the database."

Requirements for `web/tests/test_3track_triage.ts`:
1. Submit 3 mock problems via Route Handler invocation (`POST /api/challenges`) with valid payload & CSRF token:
   - Problem 1 (Track A Innovation): Novel graphene-based nanofiltration skid for Jharia acid mine drainage heavy metal potability in Dhanbad.
   - Problem 2 (Track B Standard): Blown 100 kVA distribution transformer replacement under JUVNL on rural feeder line in Dumka.
   - Problem 3 (Track C Civic): Choked stormwater drain and overflowing garbage vat on Harmu Main Road in Ranchi.
2. Assert HTTP 201 response and returned tracking IDs.
3. Query Prisma database directly:
   - Problem 1: Assert `challenge.track === "TRACK_A_INNOVATION"`, `challenge.trackRouting` contains "IIT (ISM) Dhanbad", SLA >= 45 days.
   - Problem 2: Assert `challenge.track === "TRACK_B_STANDARD"`, `challenge.trackRouting` contains "JUVNL" or "Jharkhand Urja Vikas Nigam Limited", SLA 14-30 days.
   - Problem 3: Assert `challenge.track === "TRACK_C_CIVIC"`, `challenge.trackRouting` contains "RMC" or "Ranchi Municipal Corporation", SLA <= 72 hours.
   - Assert all 3 have non-empty `triageReasoning`.
4. Assert corresponding `AuditLog` records exist for each challenge in Prisma.
5. Assert Prisma track filtering (`prisma.challenge.findMany({ where: { track: ... } })`).
6. Perform clean teardown of test mock records.
7. Execute: `cmd.exe /c npx tsx tests/test_3track_triage.ts` from `web/`.
   Verify 100% assertions pass and exit code is 0.

Output:
Write your handoff report to a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_test_writer_r4_m4_1/handoff.md.
Send a message back to parent (conversation ID: 7855deb8-3512-4bc1-b772-4058637aec00) when complete.
