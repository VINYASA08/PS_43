## 2026-09-04T21:21:35Z
You are Worker M2 (Milestone 2: External AI Problem Management & University Routing).
Your working directory is: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m2_1
Authoritative request file: a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md (read all sections, especially ## 2026-09-04T21:04:25Z and ## 2026-09-04T14:06:00Z)
Project master spec: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_orchestrator_r3\PROJECT.md
Spec report to consult: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_spec_miner_survey_3\spec_report.md
Backend survey to consult: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_2\survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You exclusively own:
- `web/package.json`
- `web/src/lib/ai.ts`
- `web/src/lib/routing.ts`
- `web/src/app/api/ai/categorize/route.ts`
- `web/src/app/api/challenges/route.ts`
- `web/prisma/schema.prisma`
Do NOT edit other API routes or other pages.

Objective:
Implement Milestone 2: External AI Problem Management & University Routing:
1. Dependencies & External AI Provider:
   - Install an official external AI provider package in `web/package.json` (e.g. `@google/genai` or `@google/generative-ai` or `openai`).
   - Wire support for external API calls using `process.env.GEMINI_API_KEY` (and/or `OPENAI_API_KEY`).
2. Academic Routing (`web/src/lib/routing.ts`):
   - Implement intelligent mapping connecting domain + district to empanelled Jharkhand institutions:
     - `WATER_SANITATION`: IIT (ISM) Dhanbad (Department of Environmental Science & Mining Engineering)
     - `AGRICULTURE`: Birsa Agricultural University (BAU), Ranchi/Gumla (Faculty of Agriculture & Agro-Forestry)
     - `HEALTHCARE`: Rajendra Institute of Medical Sciences (RIMS) Ranchi / BIT Mesra (Department of Bioengineering)
     - `ENERGY`: National Institute of Technology (NIT) Jamshedpur (Department of Electrical & Clean Energy Engineering)
     - `EDUCATION`: Central University of Jharkhand (CUJ), Brambe (Department of Education & Humanities)
     - `INFRASTRUCTURE`: BIT Mesra, Ranchi (Department of Civil Engineering)
     - `ENVIRONMENT`: IIT (ISM) Dhanbad (Centre for Mining Environment)
     - `GOVERNANCE`: Xavier Institute of Social Service (XISS), Ranchi (Department of Rural Management)
     - `LIVELIHOOD`: Xavier Institute of Social Service (XISS), Ranchi
     - `WASTE_MANAGEMENT`: NIT Jamshedpur / BIT Mesra
   - Export `routeChallengeToInstitute(domain: string, district?: string): { instituteName: string, department: string, reason: string }`.
3. AI Service (`web/src/lib/ai.ts`):
   - Function `categorizeProblemWithAI({ title, description, district, location })`:
     - If API key is present (`GEMINI_API_KEY` or `OPENAI_API_KEY`), call external provider API with structured schema request.
     - Parse response: domain (one of the 10 canonical domains), urgency ("LOW"|"MEDIUM"|"HIGH"|"CRITICAL"), priorityScore (1-100), reasoning, suggestedInstitute, slaDays (7 for CRITICAL, 14 for HIGH, 30 for MEDIUM, 60 for LOW).
     - Semantic deduplication: Check against active challenges in database or high similarity keywords/embeddings (e.g. detect similarity with IN-GR-2026-9842 / JHR-2026-842).
     - Resilient Heuristic Fallback Engine: If API key is missing or external API encounters HTTP 429 / timeout / network failure, fall back seamlessly to rule-based keyword & regex heuristics covering all 10 domains and emergency keyword triggers (e.g. "arsenic", "contamination", "outbreak", "epidemic", "cyanide" -> CRITICAL). Submissions must NEVER fail due to an AI API error.
4. Categorization API Route (`web/src/app/api/ai/categorize/route.ts`):
   - Handles `POST` requests, validates input body via Zod (`title`, `description`, optional `district`, `location`).
   - Invokes `categorizeProblemWithAI`.
   - Returns `{ success: true, categorization: { domain, urgency, priorityScore, reasoning, suggestedInstitute, slaDays, isDuplicate, duplicateOfId } }`.
5. Wire AI into Challenge Intake (`web/src/app/api/challenges/route.ts`):
   - In `POST /api/challenges`, execute AI categorization & routing upon receipt of a new challenge submission.
   - Save the AI-determined domain, urgency, assigned institute, and SLA deadline into the database.
   - Return the AI metadata in the response JSON.
6. Schema Update (`web/prisma/schema.prisma`):
   - Verify `assignedInstitute`, `slaDeadline`, `aiConfidence` fields exist on `Challenge`. If modifying schema, run `cmd /c npx prisma generate` and `cmd /c npx prisma db push`.
7. Verify all implementations:
   - Run `cmd /c npm run build` (0 TypeScript errors)
   - Run test suites (`cmd /c node tests/workflows.test.mjs`, `cmd /c npx tsx tests/auth-rbac-security.test.ts`, `cmd /c npx tsx tests/e2e-citizen-intake.test.ts`)
   Ensure 0 build errors and passing test suites.

Deliverables:
Write `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m2_1\worker_report.md` and `handoff.md`.
Message parent upon completion with summary and verification evidence.
