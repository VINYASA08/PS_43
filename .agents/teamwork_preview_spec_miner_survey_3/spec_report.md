# Specification Report: AI-Enabled Problem Management, Collaborative Ecosystem Workflows & Test Infrastructure

**Document Version**: 1.0.0  
**Date**: 2026-09-04T21:13:00Z  
**Author**: Spec Miner Survey 3 (AI & Ecosystem Spec Miner)  
**Target Repository**: `a:\Development\Antigravity\SIH26043` (`web/`)  
**Authoritative Request Sources**: `.agents/ORIGINAL_REQUEST.md` (Sections: 2026-09-04T21:04:25Z, 2026-09-04T14:06:00Z, 2026-09-04T12:37:16Z)

---

## Executive Summary

This specification report details the functional requirements, architectural contracts, data structures, external AI provider integrations, collaborative workflow state machines, and automated test specifications for the **Jharkhand Societal Innovation Collaboration Portal**.

The system connects citizens logging grassroots societal problems across Jharkhand's 24 districts with empanelled academic institutions (e.g., IIT (ISM) Dhanbad, Birsa Agricultural University, BIT Mesra, NIT Jamshedpur) and corporate industry sponsors (e.g., Tata Steel CSR, Coal India CSR Trust) via statutory escrow mechanisms.

Key architectural gaps identified in the current codebase:
1. **AI Integration Gap (R2)**: The codebase currently has zero external AI provider integrations (`@google/genai` or `openai` are not installed in `package.json`). Citizen challenge submission (`/api/challenges`) currently records whatever domain/urgency the user typed without real NLP categorization, vector deduplication, priority scoring, or automated academic routing. The tracking route (`/api/track/[id]`) displays static text for "AI Clustered & Triaged".
2. **Workflow & Proposal Rehydration Gap (R3)**: While UI consoles exist for University Proposal (`/dashboard/university/proposal/[id]`) and Industry Funding (`/dashboard/industry/fund/[id]`), draft proposal saving relies on `localStorage` without a `useEffect` hydration hook on mount. Furthermore, the 7-stage lifecycle state machine transitions are partially implemented across disparate routes rather than unified via a deterministic state engine.
3. **Test Infrastructure Gap**: Existing tests cover UI workflows (`workflows.test.mjs`), database/soft-deletion (`db-api-lifecycle.test.ts`), and auth/RBAC (`auth-rbac-security.test.ts`), but lack automated tests for external AI categorization, multimedia MIME validation, and geo-coordinate bounding box checks.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R2: AI Problem Management | Automated Thematic Domain Categorization | Evaluates raw problem description and extracts primary/secondary domains from 10 canonical Jharkhand societal sectors | Text prompt (title, description, evidence text) | `{ domain: string, secondaryDomains: string[], confidence: number }` | Fallback to keyword heuristics if API down or timeout | `ORIGINAL_REQUEST.md` § R2, `schema.prisma`, `validation.ts` |
| 2 | R2: AI Problem Management | Automated Prioritization & Urgency Assessment | Assesses severity, public health hazard, population impact, and assigns urgency level with SLA deadline | Description, location, evidence metrics (pH, turbidity, etc.) | `{ urgency: "CRITICAL" \| "HIGH" \| "MEDIUM" \| "LOW", riskScore: number, slaDeadline: string, justification: string }` | Defaults to MEDIUM with 30-day SLA if unparseable | `ORIGINAL_REQUEST.md` § R2, `seed.ts`, `track/[id]/route.ts` |
| 3 | R2: AI Problem Management | Deduplication & Semantic Similarity Matching | Compares new submissions against database index via vector embeddings or LLM semantic matching to flag duplicates | New challenge text, candidate challenges from same district/domain | `{ isDuplicate: boolean, duplicateOfTrackingId?: string, similarityScore: number, clusterId?: string }` | Flags as unique (score 0.0) on comparison error | `ORIGINAL_REQUEST.md` § R2, `seed.ts` (CH-842 vs IN-GR-2026-9842) |
| 4 | R2: AI Problem Management | Intelligent Academic Routing | Recommends empanelled Jharkhand university and department matching domain, district, and faculty expertise | Inferred domain, district, technical complexity | `{ primaryInstitute: string, department: string, matchScore: number, rationale: string }` | Routes to default State Innovation Directorate if no match | `ORIGINAL_REQUEST.md` § R2, `seed.ts` (IIT ISM, BAU, BIT Mesra, NIT Jsr) |
| 5 | R2: AI Problem Management | Resilient AI Fallback & Circuit Breaker | Ensures citizen submission succeeds even when external AI API is unreachable, rate-limited (HTTP 429), or invalid | API error response, timeout trigger (3000ms) | Falls back to offline regex/keyword engine; sets `aiStatus: "PENDING_ENRICHMENT"` | Retries asynchronously via background job; user never gets 500 error | `ORIGINAL_REQUEST.md` § R2 & R4, `api/challenges/route.ts` |
| 6 | R3: Ecosystem Workflows | Multidisciplinary Team Formation | Enables university PI to assemble cross-departmental teams (Co-PIs, researchers, lab techs) on claimed challenges | Challenge ID, faculty member IDs, departments, roles | Team roster attached to proposal record | 403 if user not accredited University PI | `ORIGINAL_REQUEST.md` § R3, `dashboard/university/page.tsx` |
| 7 | R3: Ecosystem Workflows | Proposal Drafting & Submission Console | Console (`/dashboard/university/proposal/[id]`) for authoring solutions with budget, milestones, and DPR attachments | Challenge ID, title, abstract, methodology, budget, timeline, stage, attachments | Created `Proposal` record (`PR-XXX`), transitions challenge to `UNDER_REVIEW` | 400 validation error on negative budget or short abstract (<20 chars) | `ORIGINAL_REQUEST.md` § R3, `proposal/[id]/page.tsx`, `api/proposals` |
| 8 | R3: Ecosystem Workflows | Local Draft Auto-save & Rehydration | Persists in-progress proposal drafts in browser storage with timestamp and restores fields upon page reload | Form input change events | `localStorage["proposal_draft_<id>"]` JSON payload | Silent fail if localStorage quota exceeded; rehydration hook restores state | `workflows.test.mjs` (Workflow 7 defect analysis) |
| 9 | R3: Ecosystem Workflows | Industry Mentorship & CSR Commitment | Industry console (`/dashboard/industry/fund/[id]`) for pledging funding, mentorship, or dual support | Proposal ID, corporateName, PAN, CSR Reg No, amount, type, notes | `FundingCommitment` record (`JH-ESCROW-2026-CSR-XXXX`), sets proposal to `FUNDED` | 403 Forbidden for Citizen/University roles; 400 if amount < 1000 | `ORIGINAL_REQUEST.md` § R3, `fund/[id]/page.tsx`, `api/funds` |
| 10 | R3: Ecosystem Workflows | Tripartite Escrow Agreement & MoU | Legally binding electronic tripartite MoU between State Innovation Escrow Authority, University Lead PI, and Corporate CSR Sponsor | Digital signature acceptance, corporate PAN/CSR credentials | Executed MoU flag (`mouSigned: true`, `mouSignedAt: DateTime`), statutory escrow lock | 400 if required corporate registration details missing | `schema.prisma`, `fund/[id]/page.tsx`, `api/funds/route.ts` |
| 11 | R3: Ecosystem Workflows | 30-40-30 Milestone Tranche Disbursement | Statutory CSR disbursement schedule: 30% on DPR approval, 40% on pilot installation, 30% on Collector sign-off | Escrow commitment ID, milestone audit proofs | Structured `tranches` JSON with status per tranche (DISBURSED / IN_PROGRESS / PENDING) | Blocked if milestone completion proof not approved by Gov Nodal Officer | `schema.prisma`, `seed.ts`, `fund/[id]/page.tsx` |
| 12 | R3: Ecosystem Workflows | Statutory 80G / Section 135 Tax Receipt | Generates and downloads official tax deduction receipt (Section 80G(5)(vi) and Section 35(1)(ii)) | Pledged amount, escrow reference, corporate details | Text/PDF receipt blob with statutory clauses and IAS signatory signature | None (client-side generated based on validated escrow record) | `workflows.test.mjs` (Workflow 6), `fund/[id]/page.tsx` |
| 13 | R3: Ecosystem Workflows | End-to-End 7-Stage State Machine | Enforces valid lifecycle transitions: Submitted -> AI Categorized -> University Review -> Gov/Industry Funding -> Prototyping -> Deployment -> Impact Verification | Trigger events (submit, categorize, propose, fund, deploy, verify) | Challenge and Proposal status updates, audit log entries | Rejects illegal backward or skipped transitions with HTTP 400/409 | `ORIGINAL_REQUEST.md` § R3, `track/[id]/route.ts`, `schema.prisma` |
| 14 | Acceptance & Verification | Automated Citizen Submission Tests | Programmatic tests validating multi-file dropzone, file chip removal, size formatting, and GPS geo-coordinates | Mock image/video files, coordinate pairs, form fields | Verified HTTP 201 response, regex tracking ID, DB record | Asserts 400 on invalid coordinates or missing required fields | `ORIGINAL_REQUEST.md` § Verification, `tests/workflows.test.mjs` |
| 15 | Acceptance & Verification | Automated AI Provider Integration Tests | Validates live/mock external AI communication, structured JSON categorization, and resilience fallback | Problem statement text, test mock payload | Validated domain, urgency, routing recommendation | Asserts non-crashing fallback behavior when network or API key fails | `ORIGINAL_REQUEST.md` § Verification |
| 16 | Acceptance & Verification | RBAC Security Automated Tests | Validates authentication gates (401), role authorization (403), CSRF protection, and audit logging across all endpoints | Token-less requests, adversarial role tokens, missing CSRF headers | HTTP 401 / HTTP 403 responses, AuditLog failure entries | Asserts that unauthorized access attempts are blocked and logged | `ORIGINAL_REQUEST.md` § Verification, `tests/auth-rbac-security.test.ts` |
| 17 | Acceptance & Verification | Zero-Error Build & Runtime Verification | Ensures entire Next.js application compiles with 0 errors, 0 TypeScript defects, and clean linting | `npm run build`, `tsc --noEmit` | Exit code 0, 15+ compiled App Router routes, 0 build warnings | Fails build if unresolved imports, dead types, or missing route handlers exist | `ORIGINAL_REQUEST.md` § Verification, `PROJECT.md` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | File Size Formatting in Dropzone | File size of 30 KB (e.g., small sensor icon) | Formats to `"0.0 MB"` using `(size / (1024*1024)).toFixed(1)`. System must not reject files displaying 0.0 MB. |
| 2 | Public Issue Tracking Search | Query param `id="   in-dl-2026-3104   "` with spaces and lowercase | Query input is normalized via `.trim().toUpperCase()` before database lookup. |
| 3 | Public Issue Tracking Fallback | Non-existent tracking ID queried via `/track?id=UNKNOWN-1234` | Frontend track page falls back to default seeded issue (`IN-GR-2026-9842`) without throwing undefined/null exceptions; API returns 404. |
| 4 | University Live Search + Priority | Search query `"Agriculture"` with Priority Filter `"High"` | Filter excludes Medium priority items (e.g., CH-843), returning 0 results, verifying conjunction boolean logic. |
| 5 | Industry Commitment URL Parameter | URL `/dashboard/industry/fund/PR-102?type=mentorship` | Dynamically selects `mentorship` radio button; invalid or missing `type` parameter safely defaults to `both`. |
| 6 | Proposal Draft Hydration | Reloading `/dashboard/university/proposal/[id]` after saving draft | Draft was saved to `localStorage` but not restored because `useEffect` hydration hook was absent in prototype. |
| 7 | Soft-Deleted Unique Constraint | Re-creating a user with phone `+919999988888` when soft-deleted user exists | Prisma `findFirst` ignores soft-deleted row (`deletedAt IS NULL`), but SQLite table enforces physical unique constraint, causing Prisma P2002 error. |
| 8 | External AI API Rate Limiting | 10 rapid submissions triggering Gemini/OpenAI HTTP 429 | System catches 429 status code, activates local regex/keyword heuristic categorizer, logs warning, and does not reject citizen challenge. |
| 9 | Ambiguous Problem Statements | Input: "The village is suffering and nothing works here anymore" | AI domain confidence score drops below 0.40; system categorizes as "Public Service Delivery" / "General", urgency "MEDIUM", flags for human Nodal Officer triage. |
| 10 | Near-Duplicate Challenge Submissions | Submitting "Red water in Dhanbad wells" when "Contaminated water in Dhanbad" exists | Vector cosine similarity or LLM match score > 0.85; system sets `isDuplicate: true`, links `duplicateOfTrackingId: "IN-GR-2026-9842"`, prompts citizen with merge option. |
| 11 | Cross-District Academic Routing | Challenge in remote Simdega where local university does not have specialized water treatment department | Routing matrix evaluates domain expertise first (IIT ISM Dhanbad) and proximity second (RIMS Ranchi), recommending IIT ISM with field liaison via Simdega Polytechnic. |
| 12 | Negative or Zero Proposal Budget | University attempts to submit proposal with `budget: -50000` | Zod validation rejects with HTTP 400 (`budget: z.number().min(0)`); mentorship-only proposals permit `budget: 0`. |
| 13 | Cross-Tenant Proposal Deletion | University PI from Birsa Agricultural University attempts to update/delete IIT ISM Dhanbad's proposal | RBAC ownership check verifies `session.userId === proposal.submittedById`; returns HTTP 403 Forbidden. |
| 14 | Unapproved Industry CSR Pledge | Industry user in `PENDING` approval status attempts to pledge escrow funds | Session check verifies `session.status === "ACTIVE"`; pending industry user receives HTTP 403 with "Account pending approval" message. |
| 15 | Next.js Turbopack Build vs `_ssgManifest.js` | Running `npm run build` with Turbopack and `@ducanh2912/next-pwa` | Fails in post-generation step with `ENOENT: no such file or directory, open '...\_ssgManifest.js'` due to Turbopack manifest generation incompatibility with PWA plugin. Requires build config tuning for zero-error build AC. |

---

## Deep Dive Specification

### Section 1: R2 AI-Enabled Problem Management Specification

#### 1.1 External AI Provider Architecture
The portal requires real AI problem management using external LLM providers (Google Gemini or OpenAI). All AI interactions **must execute strictly on the server-side** (via Next.js Route Handlers) to ensure API keys are never exposed to the client.

- **Primary Provider Options**:
  - **Google Gemini API**: `gemini-1.5-flash` (recommended for high throughput, sub-second latency, and low cost) or `gemini-1.5-pro` (for complex multiphase reasoning).
    - SDK: `@google/genai` or `@google/generative-ai`
    - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
  - **OpenAI API**: `gpt-4o-mini` (fast structured JSON extraction) and `text-embedding-3-small` (for 1536-dimensional semantic deduplication).
    - SDK: `openai`
    - Endpoint: `https://api.openai.com/v1/chat/completions`

- **Environment Configuration**:
  ```env
  AI_PROVIDER="gemini" # or "openai"
  GEMINI_API_KEY="your-gemini-api-key-here"
  OPENAI_API_KEY="your-openai-api-key-here"
  AI_TIMEOUT_MS="5000"
  AI_FALLBACK_MODE="heuristic"
  ```

#### 1.2 Canonical Thematic Domain Taxonomy
The AI categorization engine must map unstructured citizen reports into one of the 10 canonical domains recognized by the Government of Jharkhand:

1. **Water Management**: Groundwater depletion, borewell contamination, heavy metal leaching (iron, lead, arsenic, fluoride), acidic mine drainage, pond siltation, drinking water potability.
2. **Agriculture**: Soil nitrogen/NPK deficiency, micro-irrigation scheduling, drought mitigation, seed quality, crop pest infestations, cold storage shortages.
3. **Healthcare**: Rural Primary Health Subcenters (PHC), maternal/infant mortality, telemedicine diagnostics, vector-borne disease outbreaks (malaria, dengue), pharmaceutical supply chain.
4. **Education**: Tribal residential school (KGBV) infrastructure, off-grid digital literacy, regional language (Santhali, Ho, Mundari, Kurukh) learning aids, STEM laboratories.
5. **Urban & Rural Infrastructure**: Rural road erosion, culvert/bridge collapses, village electrification, municipal solid waste management, drainage waterlogging.
6. **Energy**: Solar microgrid storage, inverter failures in informal settlements, bi-directional metering, decentralized biomass/clean energy.
7. **Environment & Mining Reclamation**: Abandoned open-cast coal pit hazards, mine dust pollution, deforestation, biodiversity degradation, fly ash remediation.
8. **Sanitation**: Community toilet blocks, sewage treatment, greywater recycling, septic tank overflow.
9. **Rural Livelihoods**: Lac cultivation, minor forest produce (MFP) processing, tribal handicrafts marketing, Sericulture/Tussar silk value chains, women's self-help groups (SHG).
10. **Public Service Delivery**: Public Distribution System (PDS) ration delivery, welfare scheme DBT bottlenecks, civil registration kiosks, grievance redressal delays.

#### 1.3 Prioritization & Urgency Assessment Matrix
The AI engine evaluates urgency based on a multi-factor risk matrix:

| Urgency Level | Criteria / Severity Thresholds | Default SLA Deadline | Escalation Tier |
|---|---|---|---|
| **CRITICAL** | Acute public health hazard (toxic heavy metals, water poisoning, disease outbreak), impending loss of life, collapsed primary access bridge, widespread infant morbidity. | **7 - 14 Days** | Tier 2 (District Collector) & Tier 3 (Chief Secretary) |
| **HIGH** | Imminent crop failure, seasonal drought risk, school building structural fault, persistent microgrid outage affecting entire community. | **21 - 30 Days** | Tier 1 (District Nodal Officer) |
| **MEDIUM** | Inefficient irrigation scheduling, low digital literacy equipment ratios, sub-optimal road paving, localized municipal garbage accumulation. | **45 Days** | Tier 0 (Gram Panchayat Nodal Committee) |
| **LOW** | Minor infrastructure aesthetic improvements, general advisory requests, long-term civic beautification. | **60 Days** | Tier 0 (Gram Panchayat Nodal Committee) |

#### 1.4 Deduplication & Semantic Similarity Engine
Citizens frequently report identical grassroots incidents (e.g., multiple residents reporting the same broken borewell or contaminated riverbank). The system must detect semantic overlap to prevent fragmented resource allocation:

1. **Pre-Filter**: Check existing challenges in the same **District** within the last 90 days.
2. **Similarity Scoring**:
   - Method A (Vector Embedding): Generate embeddings for new challenge (`title + " " + description`) and compute cosine similarity against stored challenge vectors in SQLite/PostgreSQL.
   - Method B (LLM Deduplication Prompt): Pass the candidate summaries to the external AI with instructions to return matching challenge IDs and similarity scores (0.00 to 1.00).
3. **Action Rules**:
   - **Similarity >= 0.85**: Classify as **DUPLICATE**. Suggest linking to existing `publicTrackingId` and incrementing `verifiedByCount` (+1 vote) instead of spawning a new challenge.
   - **0.65 <= Similarity < 0.85**: Classify as **RELATED_CLUSTER**. Group challenges into a regional incident cluster (e.g., "Dhanbad Aquifer Contamination Cluster").
   - **Similarity < 0.65**: Classify as **UNIQUE_NEW_CHALLENGE**.

#### 1.5 Intelligent Routing Decision Matrix
The AI engine assigns incoming challenges to empanelled institutions based on academic specialization and geographical proximity:

| Domain | Primary Empanelled University | Department / Center of Excellence | Secondary / Regional Partner |
|---|---|---|---|
| **Water Management** | **IIT (ISM) Dhanbad** | Centre of Excellence in Water Management & Dept of Environmental Science | BIT Sindri (Chemical Eng) / Ranchi University |
| **Agriculture** | **Birsa Agricultural University (BAU), Ranchi** | Faculty of Agriculture, Dept of Soil Science & Agricultural Engineering | ICAR-RCER Research Centre, Plandu, Ranchi |
| **Healthcare** | **RIMS Ranchi & BIT Mesra** | Dept of Bioengineering (BIT) & Community Medicine (RIMS) | AIIMS Deoghar / MGM Medical College, Jamshedpur |
| **Energy** | **NIT Jamshedpur** | Dept of Electrical Engineering & Centre for Renewable Energy | BIT Mesra (Power Systems) / BIT Sindri |
| **Education** | **Xavier Institute of Social Service (XISS), Ranchi** | Dept of Rural Management & Child Rights Centre | Central University of Jharkhand (CUJ), Brambe |
| **Infrastructure** | **BIT Sindri & NIT Jamshedpur** | Dept of Civil & Structural Engineering | National Institute of Foundry & Forge Technology (NIFFT) |
| **Environment** | **IIT (ISM) Dhanbad** | Dept of Mining Engineering (Mine Closure & Reclamation Cell) | Institute of Forest Productivity (IFP), Ranchi |
| **Sanitation** | **BIT Mesra** | Dept of Civil & Environmental Engineering | Urban Development Dept Nodal Cell |
| **Rural Livelihoods** | **XISS Ranchi & BAU** | Centre for Rural Entrepreneurship & Tribal Studies | JSLPS (Jharkhand State Livelihood Promotion Society) |
| **Public Delivery** | **Central University of Jharkhand (CUJ)** | Centre for Public Policy & Good Governance | Administrative Training Institute (ATI), Ranchi |

#### 1.6 Resilient Fallback & Error Handling Architecture
When the external AI provider is unreachable (network timeout, rate limit 429, quota exhaustion, or service outage):

```
       [Citizen Challenge Submission]
                    |
                    v
      [Next.js API: /api/challenges]
                    |
                    v
          [Call External AI API]
          (Timeout: 3000ms, Retries: 2)
                    |
          +---------+---------+
          |                   |
      [Success]            [Failure / 429 / Timeout]
          |                   |
          v                   v
   [Apply AI Output]   [Activate Rule-based Heuristic Engine]
   - Inferred Domain   - Keyword Regex Domain Matcher
   - Urgency & SLA     - Severity Keyword Urgency Scorer
   - Similarity Match  - Seed Institutional Routing Table
   - University Match  - Set `aiProcessed: false`, queue for retry
          |                   |
          +---------+---------+
                    |
                    v
   [Save to Database with Public Tracking ID]
   [Log Audit Event: CHALLENGE_CREATED]
   [Return HTTP 201 to Citizen]
```

- **Heuristic Domain Matcher Rules**:
  - `water|borewell|aquifer|turbidity|runoff|drinking water|pond|well` -> `"Water Management"`
  - `crop|soil|farmer|agriculture|nitrogen|fertilizer|irrigation|seed` -> `"Agriculture"`
  - `health|doctor|hospital|telemedicine|disease|malaria|patient|ambulance` -> `"Healthcare"`
  - `school|education|student|teacher|computer|literacy|classroom` -> `"Education"`
  - `solar|electricity|microgrid|power|battery|outage|grid` -> `"Energy"`
  - `road|bridge|drainage|infrastructure|culvert|sanitation|waste` -> `"Urban Infrastructure"`

- **Heuristic Urgency Scorer**:
  - Contains `death|fatal|poison|toxic|collapse|outbreak|emergency|critical|severe` -> `"CRITICAL"` (14-day SLA)
  - Contains `failed|broken|depleted|shortage|urgent|loss` -> `"HIGH"` (30-day SLA)
  - Default -> `"MEDIUM"` (45-day SLA)

#### 1.7 Structured AI API Contract: `POST /api/ai/categorize`
- **Request Body**:
  ```json
  {
    "title": "Acidic Mine Drainage contaminating Damodar Riverbank Wells",
    "description": "Reddish effluent from abandoned coal washeries has infiltrated the community drinking water supply across Bermo block. Over 1,200 households affected with gastrointestinal illnesses.",
    "district": "Bokaro",
    "location": "Bermo Block, Phusro Riverbank",
    "evidenceNotes": "pH 4.2, Turbidity 65 NTU"
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "success": true,
    "provider": "gemini-1.5-flash",
    "categorization": {
      "domain": "Water Management",
      "confidence": 0.96,
      "secondaryDomains": ["Environment", "Healthcare"],
      "urgency": "CRITICAL",
      "riskScore": 92,
      "slaDays": 14,
      "slaDeadline": "2026-09-18T21:14:00.000Z",
      "isDuplicate": false,
      "similarityScore": 0.34,
      "duplicateOfTrackingId": null,
      "recommendedInstitute": "IIT ISM Dhanbad",
      "recommendedDepartment": "Dept of Environmental Science & Engineering",
      "routingRationale": "IIT ISM Dhanbad holds premier institutional expertise in coal-mining acid runoff remediation and heavy metal water purification skids in Bokaro/Dhanbad coal belt.",
      "keyTerms": ["acid mine drainage", "coal washery effluent", "borewell contamination", "potable water"]
    }
  }
  ```

---

### Section 2: R3 Collaborative Ecosystem Workflows Specification

#### 2.1 University Review & Multidisciplinary Team Formation
Academic institutions serve as the translational R&D engine.
- **Workflow Steps**:
  1. University PI logs into `/dashboard/university` (institutional `.ac.in` email verified).
  2. PI filters live challenge dockets (`status: OPEN_FOR_PROPOSALS` or assigned to their institution).
  3. PI reviews ground telemetry (e.g., pH, Turbidity, NPK soil levels, high-resolution evidence photos).
  4. Team Formation Modal: PI defines multidisciplinary roles:
     - Lead Principal Investigator (e.g., Environmental Science)
     - Co-Principal Investigator (e.g., Chemical Engineering or IoT Sensors)
     - Student Research Fellows / JRFs (Field telemetry and community surveys)
  5. Navigates to `/dashboard/university/proposal/[id]` to author and submit the research proposal.

#### 2.2 Proposal Drafting & Submission Console (`/dashboard/university/proposal/[id]`)
- **Required Data Fields**:
  - `proposalRef`: Auto-generated unique reference (e.g., `PR-102`).
  - `challengeId`: Target challenge public ID or internal cuid.
  - `title`: Translational technical solution title (5 - 200 chars).
  - `abstract`: Executive overview and potability/efficacy targets (min 20 chars).
  - `methodology`: Technical blueprint, reactor engineering, telemetry protocols (min 20 chars).
  - `budget`: Pledged total expenditure in INR (Float, >= 0).
  - `timelineMonths`: Estimated duration (1 - 36 months, default 6).
  - `stage`: `"Research Phase"` | `"Lab Prototype"` | `"Prototype Ready"` | `"Pilot Implementation"`.
  - `attachedDocs`: JSON array of uploaded documents (name, size, SHA-256 hash, URL).
- **Draft Persistence Specification**:
  - Auto-save to `localStorage` under key `proposal_draft_${challengeId}` on every form change.
  - Must include `useEffect` hydration hook on mount:
    ```typescript
    useEffect(() => {
      const saved = localStorage.getItem(`proposal_draft_${rawId}`);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.title) setTitle(draft.title);
          if (draft.abstract) setAbstract(draft.abstract);
          if (draft.methodology) setMethodology(draft.methodology);
          if (draft.budget) setBudget(draft.budget);
          if (draft.timelineMonths) setTimelineMonths(draft.timelineMonths);
          if (draft.stage) setStage(draft.stage);
        } catch (e) {
          console.error("Failed to restore proposal draft:", e);
        }
      }
    }, [rawId]);
    ```

#### 2.3 Industry Participation & Statutory CSR Escrow (`/dashboard/industry/fund/[id]`)
Corporate participation converges statutory CSR capital (Companies Act Section 135) with university research:
- **Statutory Requirements**:
  - Qualifying criteria under Schedule VII, Item (ix): "Contributions to incubators or research and development projects funded by the Central or State Government or Public Sector Undertakings."
  - 100% Tax Exemption eligibility under Section 80G(5)(vi) and Section 35(1)(ii) of the Income Tax Act, 1961.
- **Console Controls**:
  - Select Commitment Type: Financial CSR Grant, Mentorship Only, or Combined.
  - Pledge Capital Input: Preset chips (₹3.5L, ₹5.0L, ₹12.0L) or custom INR input.
  - Corporate Statutory Details: Corporate Name, PAN Number, MCA CSR Registration Number.
  - Electronic Tripartite MoU Acceptance Modal: Displays terms of the Jharkhand State Innovation Escrow Authority.
- **30-40-30 Tranche Disbursement Mechanism**:
  - **Tranche 1 (30%)**: Deposited upon Detailed Project Report (DPR) approval and baseline survey.
  - **Tranche 2 (40%)**: Released upon functional laboratory pilot installation and sensor verification.
  - **Tranche 3 (30%)**: Released upon District Collector formal sign-off and citizen committee handover.

#### 2.4 End-to-End Lifecycle Workflow State Machine

```
  [1. SUBMITTED]
        |  (Citizen submits via Web or WhatsApp)
        v
  [2. AI_CATEGORIZED_AND_ROUTED]
        |  (AI assigns Domain, Urgency, SLA, and Routes to University)
        v
  [3. UNIVERSITY_REVIEW_AND_PROPOSAL]
        |  (University claims docket, forms team, submits PR-XXX)
        v
  [4. GOV_INDUSTRY_REVIEW_AND_FUNDING]
        |  (Gov approves; Industry executes MoU, commits Escrow JH-ESCROW-XXXX)
        v
  [5. PROTOTYPING_AND_FIELD_TESTING]
        |  (University deploys pilot; Tranches 1 & 2 disbursed; Telemetry live)
        v
  [6. DEPLOYMENT]
        |  (Full-scale solution installed; District Collector inspection)
        v
  [7. IMPACT_VERIFICATION]
           (Citizen OTP sign-off; Audit trail sealed; Status: RESOLVED / CLOSED)
```

- **Valid Transition Rules**:
  - `REPORTED` -> `CITIZEN_VERIFIED` (via Gram Sabha or 10+ citizen upvotes)
  - `REPORTED` / `CITIZEN_VERIFIED` -> `OPEN_FOR_PROPOSALS` (via AI Routing or Gov Nodal Officer)
  - `OPEN_FOR_PROPOSALS` -> `UNDER_REVIEW` (when proposal `PR-XXX` is submitted)
  - `UNDER_REVIEW` -> `IN_PROGRESS` (when CSR escrow `JH-ESCROW-...` is committed)
  - `IN_PROGRESS` -> `RESOLVED` (when field deployment passes inspection and citizen OTP verification)
  - `RESOLVED` -> `CLOSED` (administrative archive)

---

### Section 3: Acceptance Criteria & Test Specifications

#### 3.1 Automated Tests for Citizen Challenge Intake
Test harness must verify the full citizen submission journey:

```typescript
// Test Specification: Citizen Intake Flow
describe("Citizen Challenge Submission Acceptance Suite", () => {
  it("Validates mandatory input fields (title, description >= 20 chars, domain, district, location)", async () => {
    // Assert 400 when description < 20 chars
    // Assert 400 when invalid district passed (not in 24 Jharkhand districts)
    // Assert 201 when valid payload supplied
  });

  it("Processes multimedia evidence attachments (photos/videos)", async () => {
    // Verify file item list structure: [{ name, size, type }]
    // Verify dropzone additions and chip deletions
    // Verify formatting: sizes < 50KB format to '0.0 MB', sizes in MB format correctly
  });

  it("Captures and validates geographical coordinates and village identifiers", async () => {
    // Verify latitude/longitude parsing (e.g. 23.7957° N, 86.4304° E)
    // Verify district/block/village string persistence in database
  });

  it("Generates unique public tracking ID matching pattern IN-GR-2026-XXXX", async () => {
    // Verify regex /^IN-GR-2026-\d{4}$/
    // Verify query via /api/track/[trackingId] returns complete telemetry and timeline
  });
});
```

#### 3.2 Automated AI Integration Tests
Test harness must verify external AI provider integration and fallback:

```typescript
// Test Specification: AI Integration Suite
describe("AI Provider Categorization & Resilience Suite", () => {
  it("Successfully communicates with external AI provider when API key configured", async () => {
    // Calls /api/ai/categorize with sample water contamination prompt
    // Asserts response HTTP 200 with domain = "Water Management", urgency = "CRITICAL"
    // Asserts recommendedInstitute = "IIT ISM Dhanbad"
  });

  it("Validates structured JSON schema returned by external provider", async () => {
    // Asserts presence of domain, urgency, slaDays, recommendedInstitute, confidence
    // Asserts confidence score is float between 0.0 and 1.0
  });

  it("Activates resilient heuristic fallback when AI API throws 429 Rate Limit or times out", async () => {
    // Simulates external network timeout / 429 Too Many Requests
    // Verifies endpoint does NOT crash or return HTTP 500
    // Verifies heuristic regex correctly maps keywords to "Water Management"
    // Verifies challenge is saved in DB with pending enrichment tag
  });

  it("Evaluates semantic deduplication against existing challenge index", async () => {
    // Inputs problem statement almost identical to IN-GR-2026-9842
    // Asserts similarityScore > 0.80 and isDuplicate = true
  });
});
```

#### 3.3 RBAC Security Automated Tests
Test harness must enforce zero-trust role boundaries:

```typescript
// Test Specification: RBAC & Security Suite
describe("RBAC & Security Hardening Acceptance Suite", () => {
  it("Rejects unauthenticated requests to protected endpoints with HTTP 401", async () => {
    // Endpoints: /api/admin/pending-users, /api/audit-logs, /api/proposals (POST), /api/funds (POST)
    // Asserts 401 Unauthorized
  });

  it("Enforces role boundaries with HTTP 403 Forbidden", async () => {
    // Citizen attempts to approve pending industry user -> 403
    // Citizen attempts to submit academic proposal -> 403
    // University PI attempts to commit corporate CSR funding -> 403
    // Non-owner citizen attempts to delete another's challenge -> 403
  });

  it("Enforces CSRF token validation on all state-changing routes", async () => {
    // State-changing requests (POST, PUT, DELETE) without sih_csrf header/cookie -> 403
  });

  it("Logs all authorization and authentication failures to AuditLog table", async () => {
    // Triggers failed attempt, asserts new row in AuditLog with action = 'AUTHORIZATION_FAILURE'
  });

  it("Enforces rate limiting of 10 requests per minute per IP", async () => {
    // Requests 1-10 succeed; 11th request returns HTTP 429
  });
});
```

#### 3.4 Zero-Error Build & Runtime Verification
- **Automated build check specification**:
  - Command: `npm run build`
  - Output requirement: Exit Code 0
  - Compilation target: 15+ App Router routes (Static + Dynamic Server)
  - Zero TypeScript diagnostics (`tsc --noEmit` returns 0 errors)
  - Zero unhandled console warnings or fatal errors during standard execution flows
- **Empirical Build Diagnosis & Defect**:
  - Direct execution of `npm run build` currently compiles TypeScript cleanly (3.5s) and generates all 32 static/server pages (628ms), but fails in post-processing with:
    `Error: ENOENT: no such file or directory, open '...web\.next\static\<buildId>\_ssgManifest.js'`
  - **Root Cause**: In Next.js 16 with Turbopack enabled (`next build`), `@ducanh2912/next-pwa` hook expects standard Webpack SSG manifest output.
  - **Remediation Specification**: In `next.config.ts`, adjust PWA export wrapper or disable PWA build step during Turbopack production builds to ensure deterministic 0-error build exit code 0.

---

## Conclusion

The specification for **AI-Enabled Problem Management (R2)**, **Collaborative Ecosystem Workflows (R3)**, and **Acceptance Criteria / Test Infrastructure** is fully specified. The platform's next implementation phase requires:
1. Installing `@google/genai` (or `openai`) and building the `/api/ai/categorize` route with heuristic fallback.
2. Integrating the AI route into challenge submission (`/api/challenges` and `/submit`).
3. Adding the `useEffect` draft hydration hook in `/dashboard/university/proposal/[id]`.
4. Creating the programmatic AI integration and multimedia test suites.
