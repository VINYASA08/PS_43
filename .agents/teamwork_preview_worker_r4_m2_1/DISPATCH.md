# Dispatch: Milestone 2 - 3-Track Problem Triage Implementation
- Role: Worker (teamwork_preview_worker)
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m2_1
- Source of Truth: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md
- Scope: Implement 3-Track Problem Triage System across Prisma schema, database, AI/routing engine, API route handlers, and mobile models.

## 2026-09-05T11:15:00Z
You are teamwork_preview_worker (Worker M2: 3-Track Problem Triage Implementation).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m2_1
Your original parent conversation ID is: 7855deb8-3512-4bc1-b772-4058637aec00

MANDATORY FIRST STEP: Read a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md and a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m2_1/DISPATCH.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You own exclusively:
- web/prisma/schema.prisma
- web/src/lib/types.ts
- web/src/lib/validation.ts
- web/src/lib/routing.ts
- web/src/lib/ai.ts
- web/src/app/api/challenges/route.ts
- web/src/app/api/ai/categorize/route.ts
- web/src/app/api/mobile/challenges/route.ts
- web/src/app/api/mobile/verify/route.ts
- web/src/app/api/track/[id]/route.ts
- mobile/shared/src/commonMain/kotlin/network/Models.kt

Reference Documents:
- a:/Development/Antigravity/SIH26043/architecture_flow.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_spec_miner_r4_survey_3/handoff.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r4_survey_1/handoff.md

Objective:
Implement the 3-Track Problem Triage System (Track A Innovation, Track B Standard, Track C Civic) as specified in architecture_flow.md and spec miner handoff:
1. In web/prisma/schema.prisma:
   Add to Challenge model:
   - track String @default("TRACK_A_INNOVATION")
   - trackRouting String?
   - triageReasoning String?
   - triageConfidence Float?
   - targetEntityLevel String?
   - indices: @@index([track, status]), @@index([track, district])
   Execute from web/: `cmd.exe /c npx prisma db push` and `cmd.exe /c npx prisma generate`.
2. In web/src/lib/types.ts:
   Add TriageTrack enum ('TRACK_A_INNOVATION', 'TRACK_B_STANDARD', 'TRACK_C_CIVIC') and TargetEntityLevel.
3. In web/src/lib/validation.ts:
   Add validTracks array and update createChallengeSchema / updateChallengeSchema to accept track, trackRouting, triageReasoning.
4. In web/src/lib/routing.ts:
   Add directories for Track B (State Line Departments: JUVNL, DWSD, RCD, Health Dept, etc.) and Track C (Municipal Bodies: RMC, DMC, JNAC, Chas MC, Deoghar MC, Gram Panchayats), and routeProblemByTrack().
5. In web/src/lib/ai.ts:
   Update evaluateHeuristicCategorization to accurately classify:
   - Track C (Civic): localized sanitation, drain choke, garbage, streetlight, pothole, open manhole -> SLA 24-72h.
   - Track B (Standard): transformer replacement, feeder line, culvert, borewell pump motor, standard departmental work -> SLA 14-30d.
   - Track A (Innovation): acid mine drainage, nanofiltration, heavy metals, soil NPK, telemedicine, novel R&D -> SLA 45-90d.
   Update LLM prompt instructions to output track, trackRouting, triageReasoning, triageConfidence.
6. In web/src/app/api/challenges/route.ts:
   Persist track, trackRouting, triageReasoning, triageConfidence, slaDeadline in POST handler. Support ?track= query filter in GET handler.
7. In web/src/app/api/ai/categorize/route.ts, web/src/app/api/mobile/challenges/route.ts, web/src/app/api/mobile/verify/route.ts, web/src/app/api/track/[id]/route.ts:
   Pass through and return track metadata.
8. In mobile/shared/src/commonMain/kotlin/network/Models.kt:
   Add track, trackRouting, triageReasoning with default values to Challenge data class.
9. Verification:
   Run prisma queries or verification script in web/ to confirm the database schema is updated and records can be read/written with track fields.

Output:
Write your handoff report to a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m2_1/handoff.md.
Send a message back to parent (conversation ID: 7855deb8-3512-4bc1-b772-4058637aec00) when complete.
