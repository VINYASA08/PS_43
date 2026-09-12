## 2026-09-08T14:14:01Z

You are the E2E Judge Test Writer (test_writer_m4) for Project Orchestrator (Round 5).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/test_writer_m4/
The authoritative project request is at: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (Subagents MUST read it before starting work. Do NOT skip reading it; read lines 195-221 for latest round requirements).
Scope Document: a:/Development/Antigravity/SIH26043/PROJECT.md
Reference Surveys & Reports:
- a:/Development/Antigravity/SIH26043/.agents/survey_e2e/handoff.md (Detailed test architecture and scenarios)
- a:/Development/Antigravity/SIH26043/.agents/worker_m1/handoff.md (Backend endpoint contract)
- a:/Development/Antigravity/SIH26043/.agents/worker_m3/handoff.md (Mobile UI form fields and mock data values)

Write Ownership: You EXCLUSIVELY own:
`a:/Development/Antigravity/SIH26043/web/tests/judge_e2e_mobile.ts`
Do NOT modify application code.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Description (Milestone 4 - Judge E2E Test Suite):
1. Author `web/tests/judge_e2e_mobile.ts`:
   Implement an automated, deterministic Agent Judge Verification Suite runnable via `npx tsx tests/judge_e2e_mobile.ts`:
   - Phase 1: Database connection & baseline health check (Prisma client).
   - Phase 2: Autonomous Judge Submission Simulation:
     - Scenario 1 (Water Management in Dhanbad):
       title: "Severe Mine Water Discharge Contaminating Water Supply",
       description: "Acidic runoff from mining cluster contaminating drinking water supply across multiple wards.",
       district: "Dhanbad",
       domain: "Water Management",
       location: "23.7957° N, 86.4304° E (Jharia Belt)",
       evidenceUrl: "https://storage.jharkhand.gov.in/evidence/water_sample_dhanbad.jpg",
       urgency: "HIGH"
     - Scenario 2 (Infrastructure in Gumla):
       title: "Damaged Culvert on Rural Link Road",
       description: "Culvert collapse disrupting access between 3 panchayats during heavy monsoon rains.",
       district: "Gumla",
       domain: "Urban Infrastructure",
       location: "22.9832° N, 84.5421° E (Chainpur Block)",
       evidenceUrl: "https://storage.jharkhand.gov.in/evidence/bridge_collapse_gumla.jpg",
       urgency: "MEDIUM"
   - Phase 3: Route Handler Invocation & Contract Validation:
     Invoke `POST /api/mobile/challenges` (using in-process NextRequest -> POST handler from `src/app/api/mobile/challenges/route.ts`).
     Assert HTTP 200, valid `trackingId` matching `/^IN-JH-2026-\d{4}$/`, valid `challengeId`, and status `"REPORTED"`.
   - Phase 4: Direct Database Verification via Prisma:
     Query `prisma.challenge.findUnique({ where: { id: res.challengeId } })`:
     - Assert `challenge.location === expectedLocation`
     - Assert `JSON.parse(challenge.evidence).media === expectedMediaUrl`
     - Assert `challenge.district === expectedDistrict`
     - Assert `challenge.domain === expectedDomain`
     - Assert `challenge.status === "REPORTED"`
     - Assert `challenge.publicTrackingId === res.trackingId`
   - Phase 5: Public API Query & Docket Retrieval:
     Query `GET /api/challenges/[id]` or `GET /api/track/[trackingId]`.
     Confirm the problem is publicly retrieved with matching location and evidence data.
   - Phase 6: Validation Error Boundary Testing:
     - Test rejection of short title (<5 chars) with HTTP 400.
     - Test rejection of short description (<10 chars) with HTTP 400.
   - Phase 7: Clean Physical Teardown:
     Delete created test mock challenges via Prisma in a `finally` block to guarantee 0 database pollution.
   - Phase 8: Emit structured Judge Verification Summary Card and exit code 0.
2. Run the test suite:
   Execute `cmd.exe /c npx tsx tests/judge_e2e_mobile.ts` in `web/` and verify all tests pass with exit code 0.
3. Write your completion report following the 5-component format to:
`a:/Development/Antigravity/SIH26043/.agents/test_writer_m4/handoff.md`
Update `progress.md` in your working directory and notify your parent.
