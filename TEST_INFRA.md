# Test Infrastructure Specification: PRAGATI Platform

> **Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation**  
> Master Test Architecture, 4-Tier Verification Methodology, and Complete Feature Coverage Matrix (F1–F37)

---

## 1. Test Philosophy: Opaque-Box, Requirement-Driven, Zero Internal Coupling

The test infrastructure for the **PRAGATI** platform and its companion mobile client **Jan-Aawaz** adheres to four non-negotiable architectural tenets:

1. **Opaque-Box Verification**: Tests interact strictly via public HTTP contracts, Next.js Route Handler interfaces (`NextRequest`/`NextResponse`), mobile DTO schemas, and observable system state (database models in SQLite/Prisma, HTTP status codes, response headers, structured JSON payloads, and immutable audit logs). Tests maintain zero coupling to internal UI component states, private hooks, or implementation trivia.
2. **Authoritative Specification Derivation**: Every test case, boundary threshold, and assertion invariant is derived directly from `ORIGINAL_REQUEST.md` (spanning all 9 development rounds from September 4 to September 9, 2026), the Master Project Specification `PROJECT.md`, and architectural guidelines (`nodal-routing-architecture.md`, `collaboration-architecture.md`).
3. **Progressive Testability & Graceful Dependency Resolution**: Tests are self-contained and independently executable across environments (CI/CD, local development, staging). Services subject to external dependencies (e.g., Google Gemini AI categorization, SMS OTP gateways, DigiLocker signing) feature resilient discovery mechanisms, deterministic mock fallbacks, and circuit-breaker handlers that validate contract invariants without third-party flakiness.
4. **Adversarial & Fault Injection Hardening**: Test suites actively probe edge conditions: parameter boundary values, SQL injection vectors, XSS payloads, 10MB multipart size caps, IP sliding-window rate limits (10 req/min), 5-strike account lockouts (HTTP 423), CSRF token tampering, and high-concurrency race conditions (e.g., 30/50/100-way parallel claims on academia dockets and cryptographic handover token collisions).

---

## 2. Comprehensive Feature Coverage Inventory (F1 to F37)

Across Development Rounds 1 through 9, the PRAGATI platform has expanded from 19 initial baseline features to 37 fully implemented and verified functional capabilities:

| Feature ID | Feature Name | Development Round | Mapped Test Suite(s) | Verification Method | Primary Test Tier |
|---|---|---|---|---|---|
| **F1** | Permissions-Policy & Sensor Hardening | Round 3 | `e2e-citizen-intake.test.ts`, `adversarial-security-intake.test.ts` | Security headers inspection, GPS sensor permission contract enforcement | Tier 2 |
| **F2** | Citizen Multimedia Evidence Upload | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs`, `adversarial-security-intake.test.ts` | Multipart upload validation, 10MB size limit, MIME type whitelist enforcement | Tier 1 & Tier 2 |
| **F3** | Geolocation & 24-District Administrative Boundary | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs` | 24-district validation & GPS bounding box [21.96°N–25.35°N, 83.32°E–87.94°E] | Tier 1 & Tier 2 |
| **F4** | Canonical 10-Domain Schema Alignment | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs` | Canonical 10-domain schema validation on `/api/challenges` | Tier 1 |
| **F5** | CSRF Double-Submit Protection | Round 2 & 3 | `e2e-rbac-security.test.ts`, `auth-rbac-security.test.ts`, `adversarial-security-intake.test.ts` | State-changing request rejection without/with `sih_csrf` token | Tier 2 |
| **F6** | Frontend & API Role-Based Access Control | Round 2 & 3 | `e2e-rbac-security.test.ts`, `auth-rbac-security.test.ts`, `workflows.test.mjs` | HTTP 401 unauth, HTTP 403 role separation across Gov/Nodal/Uni/Industry/Citizen | Tier 1 |
| **F7** | Database Soft-Delete Invariant (`deletedAt`) | Round 2 & 3 | `db-api-lifecycle.test.ts`, `empirical_challenge_p3_2.test.mjs`, `adversarial-security-intake.test.ts` | Prisma query extension verification (`deletedAt IS NULL`) & SQLite query | Tier 2 |
| **F8** | Relational Database Integrity & Migration | Round 2 | `test_prisma_connection.mjs`, `db-api-lifecycle.test.ts` | Foreign key cascades, SQLite `foreign_keys=ON`, schema consistency | Tier 1 |
| **F9** | External AI Categorization Engine | Round 3 | `e2e-ai-categorization.test.ts`, `challenger_ai_lifecycle_stress.test.ts` | Structured AI categorization (domain, urgency, priority score, SLA) | Tier 1 |
| **F10** | Empanelled University AI Routing | Round 3 | `e2e-ai-categorization.test.ts`, `challenger_ai_lifecycle_stress.test.ts` | Domain & district mapping to 6 Jharkhand state universities | Tier 1 |
| **F11** | Semantic Deduplication Engine | Round 3 | `e2e-ai-categorization.test.ts`, `challenger_ai_lifecycle_stress.test.ts` | Vector/similarity cosine matching against seeded challenge dockets | Tier 2 |
| **F12** | Resilient AI Fallback & Circuit Breaker | Round 3 | `e2e-ai-categorization.test.ts`, `challenger_ai_lifecycle_stress.test.ts` | Keyword heuristic fallback on external API 429/500/timeout | Tier 2 |
| **F13** | Challenge Intake AI Enrichment | Round 3 | `e2e-workflows.test.ts`, `challenger_ai_lifecycle_stress.test.ts` | Auto-tagging challenge dockets with AI SLA, urgency, and routing tags | Tier 3 |
| **F14** | Collaborative Lifecycle & Proposal Hydration | Round 3 | `e2e-workflows.test.ts`, `db-api-lifecycle.test.ts`, `workflows.test.mjs` | Proposal `PR-XXX`, draft hydration, electronic MoU, 30-40-30 CSR escrow | Tier 3 |
| **F15** | Turbopack PWA Build Stabilization | Round 3 | Next.js build runner, `routes.test.mjs` | App router compilation, service worker generation, offline fallback | Tier 4 |
| **F16** | Programmatic Tests: Citizen Intake | Round 3 | `e2e-citizen-intake.test.ts` | Multi-field validation, telemetry dropzone, coordinate parsing | Tier 1 & Tier 2 |
| **F17** | AI Integration Verification Tests | Round 3 | `e2e-ai-categorization.test.ts` | Automated NLP classification tests across 10 problem archetypes | Tier 1 & Tier 2 |
| **F18** | Security & Penetration Hardening | Round 2 & 3 | `e2e-rbac-security.test.ts`, `auth-rbac-security.test.ts`, `adversarial-security-intake.test.ts` | 5-strike account lockout (HTTP 423), 10 req/min IP sliding rate limit (429) | Tier 1 & Tier 2 |
| **F19** | Master E2E 4-Tier Orchestrator | Round 3 | `run-all-e2e.ts` | Aggregates 45 tests across 4 tiers, formats ASCII report, exits 0 | Master Runner |
| **F20** | Tri-Track Problem Triage Architecture | Round 4 | `test_3track_triage.ts`, `challenger_mobile_contract_verify.ts` | Auto-classification: Track A (Innovation), Track B (Standard), Track C (Civic) | Tier 1 & Tier 3 |
| **F21** | Track SLA & Institutional Line Routing | Round 4 | `test_3track_triage.ts`, `challenger_mobile_contract_verify.ts` | Track A -> University (45d), Track B -> PWD/JUVNL (14-30d), Track C -> Municipal (72h) | Tier 1 |
| **F22** | Cross-Platform Data Flow Topology | Round 4 | `test_3track_triage.ts`, `challenger_mobile_contract_verify.ts` | 5-stage lifecycle timeline per track rendered on `/api/track/[id]` | Tier 3 |
| **F23** | Mobile Challenge Submission API | Round 5 | `judge_e2e_mobile.ts`, `stress_mobile_api.ts`, `test_mobile_api_hardening.ts` | `POST /api/mobile/challenges` with reporterId fallback & `IN-JH-` docket ID | Tier 1 & Tier 2 |
| **F24** | Kotlin Mobile Serialization Contracts | Round 5 | `SerializationChallengeRunner.java` | Kotlinx serialization of `MobileChallengeSubmission` / `Response` | Tier 1 & Tier 2 |
| **F25** | Field Geolocation & Evidence Ingestion | Round 5 | `judge_e2e_mobile.ts`, `stress_mobile_api.ts`, `SerializationChallengeRunner.java` | GPS coordinate strings and media URLs persisted bit-perfect to DB | Tier 2 & Tier 4 |
| **F26** | District Nodal Officer Triage Actions | Round 6 | `test_nodal_triage_and_claim.ts`, `challenger_boundary_attacks.ts` | `POST /api/nodal/triage`: Reject (reason $\ge$ 5 chars), Divert to Gov, Route to Academia | Tier 1 & Tier 2 |
| **F27** | AI 3-Way University Empanelled Matching | Round 6 | `test_nodal_triage_and_claim.ts`, `challenger_boundary_attacks.ts` | Matching 3 `.ac.in` universities and simulated mock email console dispatch | Tier 1 & Tier 2 |
| **F28** | University Atomic Claim Race Condition | Round 6 | `test_nodal_triage_and_claim.ts`, `test_adversarial_stress_and_race.ts`, `test_challenger_r2_concurrency_reverification.ts` | Atomic mutex on `POST /api/challenges/[id]/claim`: exactly 1 winner (200), rest 409 | Tier 2 |
| **F29** | Automated Route Crawler & SSR Integrity | Round 7 | `test_route_crawler.ts`, `test_route_crawler.mjs`, `routes.test.mjs` | Crawls 27 major route endpoints; asserts HTTP 200, zero #418/423/425 hydration errors | Tier 1 & Tier 2 |
| **F30** | Interactive Dead-End Elimination | Round 1 & 7 | `test_route_crawler.ts`, `routes.test.mjs` | Zero `href="#"` links; all interactive dashboard subpages wired | Tier 1 |
| **F31** | Account Handover Crypto Token Lifecycle | Round 8 | `test_handover_backend.ts`, `adversarial_handover_test.ts`, `test_initiate_cancel_concurrency.ts` | `POST /api/handover/initiate`: 64-char crypto token, 48h expiration, cancel/revoke | Tier 1 & Tier 2 |
| **F32** | Successor Claim & Relational Continuity | Round 8 | `test_handover_backend.ts`, `adversarial_handover_test.ts`, `test_isolation_handover.ts` | `POST /api/handover/[token]/claim`: user ID preserved across 10 dependent models, 2FA reset | Tier 1 & Tier 3 |
| **F33** | Handover Mutex & Concurrency Hardening | Round 8 | `test_concurrency_handover.ts`, `challenger_stress_concurrency.ts`, `challenger_auth_handover_stress.test.ts` | Concurrent claim race condition resolution, per-user initiate mutex, 409 conflict, 410 gone | Tier 2 |
| **F34** | Statewide GIS Telemetry & 24 Districts | Round 9 | `web/src/app/dashboard/gov/govDashboard.test.ts` | 24 administrative districts with SVG paths, DNO DSC verification, 4 pin types | Tier 1 & Tier 2 |
| **F35** | State IP Registry & DigiLocker Ledger | Round 9 | `web/src/app/dashboard/gov/govDashboard.test.ts` | 64-char SHA-256 deed hashes, NISP badges, locked royalty distribution splits | Tier 1 & Tier 2 |
| **F36** | Industry Mentor Portal & TRL Progression | Round 9 | `web/src/app/dashboard/gov/govDashboard.test.ts`, `PROJECT.md` | Escrow ledger (30-40-30), Kanban task board, TRL 1–9 audit log, Dual Decision Gates | Tier 1 & Tier 3 |
| **F37** | Master Route Inventory & Multi-Persona | Round 9 | Next.js build runner, `test_route_crawler.ts` | 44+ compiled routes across 6 dashboard personas (Citizen, Nodal, Gov, Uni, Ind, Contributor) | Master Topology |

---

## 3. Systematic 4-Tier Test Methodology & Coverage Architecture

The PRAGATI test architecture adheres to a strict 4-tier opaque-box pyramid:

```
+-------------------------------------------------------------------------------+
|  Tier 4: Real-World Workloads & Socio-Geographic Stress Scenarios              |
|  - Dhanbad Acid Mine Drainage (IIT ISM, Coal India CSR, pH 4.8, 14d SLA)      |
|  - Gumla Solar Micro-Irrigation (BAU, NABARD CSR, soil N deficit, 30d SLA)     |
|  - Simdega Rural Maternal Tele-Triage (RIMS / BIT Mesra, Jindal CSR, 14d SLA) |
+-------------------------------------------------------------------------------+
                                       ^
+-------------------------------------------------------------------------------+
|  Tier 3: Pairwise Cross-Feature Combinations & Multi-Actor Lifecycle           |
|  - Citizen Intake -> AI Triage -> DNO Review -> Uni DPR -> Escrow -> Track   |
|  - Handover Lifecycle: Token Gen -> Mutex Lock -> Successor Claim -> ID Presv  |
|  - Tri-Track Flow: Track A (R&D) vs Track B (Line Dept) vs Track C (Municipal) |
+-------------------------------------------------------------------------------+
                                       ^
+-------------------------------------------------------------------------------+
|  Tier 2: Boundary Value Analysis (BVA), Lockouts, Fallbacks & Concurrency     |
|  - Input BVA: min 5 char title, min 10/20 char desc, 10MB upload limit        |
|  - 24-District bounding box coordinates [21.96°N–25.35°N, 83.32°E–87.94°E]    |
|  - High Concurrency: 5-way, 10-way, 30-way, 50-way, 100-request claim bursts   |
|  - Security BVA: 5 failed logins -> HTTP 423; 10 req/min -> HTTP 429; CSRF 403 |
|  - Handover BVA: sub-second expired token -> 410; used token -> 409; SQLi 404  |
+-------------------------------------------------------------------------------+
                                       ^
+-------------------------------------------------------------------------------+
|  Tier 1: Category-Partition & Canonical Happy Path Contracts                  |
|  - Route HTTP 200 OK & Content-Type text/html validation across 27+ routes     |
|  - Canonical 10 domains, 24 districts, 4 urgency levels, 5 user roles          |
|  - Database schema & foreign key cascades on SQLite dev.db via Prisma ORM      |
|  - Kotlinx JSON serialization/deserialization DTO roundtrip contracts          |
+-------------------------------------------------------------------------------+
```

### Tier 1: Category-Partition & Canonical Happy Path Contracts
- **Category Partitioning**: Exhaustively verifies input partitions across:
  - 10 canonical problem domains (Water Management, Agriculture, Healthcare, Rural Road Infrastructure, Renewable Energy, Mining Environmental Safety, Tribal Livelihoods, Forest Conservation, Waste Management, Education & Skill Development).
  - 24 administrative districts of Jharkhand (Ranchi, Dhanbad, East Singhbhum, Bokaro, Palamu, Gumla, Simdega, etc.).
  - 4 urgency levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - 6 user personas / roles (`CITIZEN`, `NODAL_OFFICER`, `GOV_OFFICIAL`, `UNIVERSITY_RESEARCHER`, `INDUSTRY_MENTOR`, `CONTRIBUTOR`).
- **Happy Path Verifications**:
  - Full citizen challenge intake yielding valid tracking numbers (`IN-GR-2026-XXXX` or `IN-JH-2026-XXXX`).
  - Accurate AI categorization and domain tagging.
  - Role-based routing: unauthenticated requests return HTTP 401; authorized users receive role-tailored payloads.
  - Serialization contracts: Kotlinx mobile DTOs convert to/from Next.js API payloads without schema drift.

### Tier 2: Boundary Value Analysis (BVA), Lockouts, Fallbacks & Concurrency
- **Input Boundary Constraints**:
  - Title lengths: Minimum 5 characters (rejects 4 characters with HTTP 400).
  - Description lengths: Minimum 10/20 characters (rejects short inputs with HTTP 400).
  - Evidence uploads: Maximum 10MB per file; rejects payloads exceeding 10MB with HTTP 400/413.
  - MIME whitelist: Validates `image/jpeg`, `image/png`, `application/pdf`, `video/mp4`; rejects executable binaries (`.exe`, `.sh`).
  - Coordinate bounding box: Validates Jharkhand bounds (Lat: 21.96°N to 25.35°N, Long: 83.32°E to 87.94°E); flags out-of-bounds coordinates.
- **Security & Concurrency Boundaries**:
  - Account lockout: Exactly 5 consecutive failed login attempts triggers account lockout (`status: "LOCKED"`, HTTP 423 with 30-minute cooldown).
  - Rate limiting: Sliding window of 10 requests per minute per IP; 11th request triggers HTTP 429 with `Retry-After`.
  - CSRF protection: State-changing requests (`POST`, `PUT`, `DELETE`) without valid `sih_csrf` token are rejected with HTTP 403.
  - AI Circuit Breaker: Network timeouts (3000ms) or HTTP 429 errors from Google Gemini trigger keyword heuristic fallback without crashing.
  - District Nodal Triage Mutex: Concurrency bursts (5, 10, 30, 50, and 100 simultaneous requests) attempting to claim an academia-routed challenge result in exactly ONE successful claim (HTTP 200) and atomic HTTP 409 rejection for all competing institutions.
  - Account Handover Token Boundaries: Sub-second expired tokens return HTTP 410 (Gone); redeemed or canceled tokens return HTTP 409 (Conflict); malformed or non-existent tokens return HTTP 404.

### Tier 3: Pairwise Combinations & Multi-Actor Lifecycle Workflows
- **End-to-End Governance Lifecycle**:
  1. **Citizen Ingestion**: Submits challenge with GPS and media via `/api/challenges` or `/api/mobile/challenges`.
  2. **AI Triage & Tri-Track Routing**: Assigns Track A (Innovation), Track B (Line Department), or Track C (Civic Resolution) with SLA deadline.
  3. **District Nodal Officer (DNO) Triage**: Reviews docket in `/dashboard/nodal`, validates ground truth, and selects Divert to Gov Body, Reject (with $\ge$ 5 char mandatory reason), or Route to Academia.
  4. **Empanelled University Matching & Claim**: AI matches 3 state universities; first university to claim locks the docket atomically.
  5. **University Detailed Project Report (DPR)**: PI authors and submits proposal `PR-XXX` with budget, methodology, and milestone schedule.
  6. **Industry Mentorship & Escrow Commitment**: Corporate sponsor pledges CSR escrow `JH-ESCROW-2026-CSR-XXXX` with 30-40-30 tranche release schedules and signs electronic MoU.
  7. **Public Accountability Telemetry**: Citizen and state monitor `/api/track/[id]` verifying the 5-stage milestone progression and immutable audit log.
- **Account Handover Continuity Lifecycle**:
  - Departing user generates 64-character cryptographic token via `/dashboard/settings`.
  - System enforces active handover mutex (only 1 active token per user).
  - Successor claims token via public `/handover/[token]` route, sets new name and password.
  - Backend executes atomic database update: updates name/password, resets 2FA secrets, logs security audit entry, and preserves primary user ID across all 10 relational tables (challenges reported, proposals submitted, funding pledges, and audit logs).

### Tier 4: Real-World Jharkhand Workloads & Stress Scenarios
High-fidelity simulations reflecting acute socio-geographic challenges of Jharkhand:
1. **Scenario 1: Dhanbad Acidic Mine Drainage**:
   - Severe mine drainage in Jharia/Bermo coal belt; water quality parameters: pH 4.8, Turbidity 48 NTU, Dissolved Iron 6.2 mg/L.
   - Classification: Domain "Water Management", Urgency "CRITICAL", SLA 14 days.
   - Institutional Routing: IIT (ISM) Dhanbad Department of Environmental Science & Mining Engineering.
   - Proposed Solution: Solar-powered dual-stage nanofiltration skid with heavy-metal neutralization.
   - Industry Escrow Sponsor: Coal India CSR Trust / Tata Steel Rural Development Society.
2. **Scenario 2: Gumla Solar Drip Micro-Irrigation**:
   - Rainfed plateau agriculture, soil nitrogen deficiency (N < 180 kg/ha), seasonal drought vulnerability.
   - Classification: Domain "Agriculture", Urgency "HIGH", SLA 30 days.
   - Institutional Routing: Birsa Agricultural University (BAU) Faculty of Agricultural Engineering.
   - Proposed Solution: IoT-enabled solar smart drip micro-irrigation network and bio-fertilizer dosing schedules.
   - Industry Escrow Sponsor: NABARD Rural Infrastructure Development Fund / Tata Trusts.
3. **Scenario 3: Simdega Rural Maternal Tele-Triage**:
   - Forested tribal blocks with maternal health deserts and lack of specialist obstetricians.
   - Classification: Domain "Healthcare", Urgency "CRITICAL", SLA 14 days.
   - Institutional Routing: Rajendra Institute of Medical Sciences (RIMS) Ranchi & BIT Mesra Bioengineering.
   - Proposed Solution: Portable solar point-of-care ultrasound diagnostic kit with tele-triage uplink.
   - Industry Escrow Sponsor: Jindal Steel & Power CSR Foundation.

---

## 4. Test Suite File Structure & Catalog (All 34 Test Files)

The PRAGATI test infrastructure encompasses **34 specialized test files** across web and mobile directories:

```
SIH26043/
├── web/
│   ├── tests/                                      # 32 Integration, E2E, Adversarial & Performance Suites
│   │   ├── run-all-e2e.ts                          # Master 4-Tier E2E Orchestrator (45 aggregated tests)
│   │   ├── e2e-citizen-intake.test.ts              # Tier 1 & 2: Citizen intake, geolocation, dropzone
│   │   ├── e2e-ai-categorization.test.ts           # Tier 1 & 2: AI categorization, routing, deduplication
│   │   ├── e2e-rbac-security.test.ts               # Tier 1 & 2: RBAC gates, lockout (423), rate-limiting (429)
│   │   ├── e2e-workflows.test.ts                   # Tier 3 & 4: Multi-actor workflows & 3 Jharkhand field scenarios
│   │   ├── auth-rbac-security.test.ts              # Unit & Route RBAC verification (25 tests)
│   │   ├── db-api-lifecycle.test.ts                # Database soft-delete & problem-to-funding lifecycle (26 tests)
│   │   ├── test_3track_triage.ts                   # Round 4: 3-Track Triage (Innovation, Standard, Civic) (12 steps)
│   │   ├── judge_e2e_mobile.ts                     # Round 5: Agent Judge mobile submission verification (17 checks)
│   │   ├── stress_mobile_api.ts                    # Round 5: Mobile API boundaries, concurrency & fidelity (12 steps)
│   │   ├── test_mobile_api_hardening.ts            # Round 5: Mobile API fallback & reporterId hardening (3 tests)
│   │   ├── test_nodal_triage_and_claim.ts          # Round 6: Nodal triage, 3-way AI match & claim race (8 steps)
│   │   ├── test_adversarial_stress_and_race.ts     # Round 6: 5/10/20-way concurrency race & triage matrix (15 tests)
│   │   ├── test_challenger_r2_concurrency_reverification.ts # Round 6: 30/50-way bursts & 100-request matrix (10 tests)
│   │   ├── challenger_boundary_attacks.ts          # Round 6: Nodal triage & claim boundary attacks (37 attacks)
│   │   ├── test_route_crawler.ts                   # Round 7: Next.js route crawler & SSR error detector (TypeScript)
│   │   ├── test_route_crawler.mjs                  # Round 7: Next.js route crawler & SSR error detector (ESM)
│   │   ├── routes.test.mjs                         # Round 1 & 7: HTTP route availability verification (19 routes)
│   │   ├── test_handover_backend.ts                # Round 8: Account Handover API & token lifecycle (16 tests)
│   │   ├── test_concurrency_handover.ts            # Round 8: Account Handover concurrency race conditions (3 batteries)
│   │   ├── test_initiate_cancel_concurrency.ts     # Round 8: Initiate & Cancel concurrency deep dive (6 tests)
│   │   ├── test_isolation_handover.ts              # Round 8: Handover categories isolation verification (5 suites)
│   │   ├── adversarial_handover_test.ts            # Round 8: Handover fuzzing, replay & relational integrity (14 tests)
│   │   ├── challenger_auth_handover_stress.test.ts # Round 8: Handover auth, 2FA wipe & credential swap (12 tests)
│   │   ├── challenger_stress_concurrency.ts        # Round 8: 10-way burst & interleaved claim/cancel race (3 tests)
│   │   ├── adversarial-security-intake.test.ts     # Round 3: Challenger 1 adversarial intake stress (39 tests)
│   │   ├── challenger_ai_lifecycle_stress.test.ts  # Round 3: Challenger 1 AI lifecycle stress (22 tests)
│   │   ├── challenger_mobile_contract_verify.ts    # Round 5: Challenger 2 mobile contract alignment (5 tests)
│   │   ├── workflows.test.mjs                      # Round 3: UI dropzone, telemetry & query oracles (21 tests)
│   │   ├── empirical_challenge_p3_2.test.mjs       # Round 3: Live server database soft deletion verification (12 tests)
│   │   ├── mobile-pipeline.mjs                     # Round 5: Minimal mobile pipeline simulation (1 test)
│   │   └── test_prisma_connection.mjs              # Round 2: Prisma database connectivity smoke test (1 test)
│   └── src/app/dashboard/gov/
│       └── govDashboard.test.ts                    # Round 9: GIS map, 24 districts, IP queue, Master projects (6 suites)
└── mobile/
    └── tests/
        └── SerializationChallengeRunner.java       # Round 5: Kotlinx Serialization & DTO test suite (60+ assertions)
```

### Master Test Suite Directory Table

| # | File Path | Development Round | Primary Test Tier | Test Count / Assertions | Features Covered | Execution Command |
|---|---|---|---|---|---|---|
| **1** | `web/tests/adversarial-security-intake.test.ts` | Round 3 | Tier 2 & Tier 1 | 39 tests | F1, F2, F3, F4, F5, F6, F7, F18 | `npx tsx tests/adversarial-security-intake.test.ts` |
| **2** | `web/tests/adversarial_handover_test.ts` | Round 8 | Tier 2 & Tier 3 | 14 scenarios | F31, F32, F33 | `npx tsx tests/adversarial_handover_test.ts` |
| **3** | `web/tests/auth-rbac-security.test.ts` | Round 2 | Tier 1 & Tier 2 | 25 tests | F5, F6, F18 | `npx tsx tests/auth-rbac-security.test.ts` |
| **4** | `web/tests/challenger_ai_lifecycle_stress.test.ts` | Round 3 | Tier 2 & Tier 3 | 22 tests | F9, F10, F11, F12, F13, F14, F20 | `npx tsx tests/challenger_ai_lifecycle_stress.test.ts` |
| **5** | `web/tests/challenger_auth_handover_stress.test.ts` | Round 8 | Tier 2 & Tier 3 | 12 scenarios | F31, F32, F33 | `npx tsx tests/challenger_auth_handover_stress.test.ts` |
| **6** | `web/tests/challenger_boundary_attacks.ts` | Round 6 | Tier 2 | 37 attacks | F26, F27, F28 | `npx tsx tests/challenger_boundary_attacks.ts` |
| **7** | `web/tests/challenger_mobile_contract_verify.ts` | Round 5 | Tier 1 & Tier 3 | 5 scenarios | F20, F21, F22, F23, F25 | `npx tsx tests/challenger_mobile_contract_verify.ts` |
| **8** | `web/tests/challenger_stress_concurrency.ts` | Round 8 | Tier 2 & Tier 3 | 3 batteries | F32, F33 | `npx tsx tests/challenger_stress_concurrency.ts` |
| **9** | `web/tests/db-api-lifecycle.test.ts` | Round 2 & 3 | Tier 1 & Tier 2 | 26 tests | F7, F8, F14, F18 | `npx tsx tests/db-api-lifecycle.test.ts` |
| **10** | `web/tests/e2e-ai-categorization.test.ts` | Round 3 | Tier 1 & Tier 2 | 10 tests | F9, F10, F11, F12, F17 | `npx tsx tests/e2e-ai-categorization.test.ts` |
| **11** | `web/tests/e2e-citizen-intake.test.ts` | Round 3 | Tier 1 & Tier 2 | 11 tests | F1, F2, F3, F4, F16 | `npx tsx tests/e2e-citizen-intake.test.ts` |
| **12** | `web/tests/e2e-rbac-security.test.ts` | Round 3 | Tier 1 & Tier 2 | 16 tests | F5, F6, F18 | `npx tsx tests/e2e-rbac-security.test.ts` |
| **13** | `web/tests/e2e-workflows.test.ts` | Round 3 | Tier 3 & Tier 4 | 8 scenarios | F7, F13, F14, F19 | `npx tsx tests/e2e-workflows.test.ts` |
| **14** | `web/tests/empirical_challenge_p3_2.test.mjs` | Round 3 | Tier 1 & Tier 3 | 12 tests | F7, F8, F14 | `node tests/empirical_challenge_p3_2.test.mjs` |
| **15** | `web/tests/judge_e2e_mobile.ts` | Round 5 | Tier 1 through 4 | 17 assertions | F23, F24, F25 | `npx tsx tests/judge_e2e_mobile.ts` |
| **16** | `web/tests/mobile-pipeline.mjs` | Round 5 | Tier 1 | 1 pipeline | F23, F25 | `node tests/mobile-pipeline.mjs` |
| **17** | `web/tests/routes.test.mjs` | Round 1 & 7 | Tier 1 | 19 routes | F29, F30 | `node tests/routes.test.mjs` |
| **18** | `web/tests/run-all-e2e.ts` | Round 3 | Master Runner | 45 tests | F1 to F19 | `npx tsx tests/run-all-e2e.ts` |
| **19** | `web/tests/stress_mobile_api.ts` | Round 5 | Tier 2 | 12 steps | F23, F25 | `npx tsx tests/stress_mobile_api.ts` |
| **20** | `web/tests/test_3track_triage.ts` | Round 4 | Tier 1 & Tier 3 | 12 steps | F20, F21, F22 | `npx tsx tests/test_3track_triage.ts` |
| **21** | `web/tests/test_adversarial_stress_and_race.ts` | Round 6 | Tier 2 & Tier 3 | 15 scenarios | F26, F27, F28 | `npx tsx tests/test_adversarial_stress_and_race.ts` |
| **22** | `web/tests/test_challenger_r2_concurrency_reverification.ts` | Round 6 | Tier 2 | 10 batteries (100 reqs) | F28 | `npx tsx tests/test_challenger_r2_concurrency_reverification.ts` |
| **23** | `web/tests/test_concurrency_handover.ts` | Round 8 | Tier 2 | 3 batteries | F32, F33 | `npx tsx tests/test_concurrency_handover.ts` |
| **24** | `web/tests/test_handover_backend.ts` | Round 8 | Tier 1 & Tier 2 | 16 scenarios | F31, F32, F33 | `npx tsx tests/test_handover_backend.ts` |
| **25** | `web/tests/test_initiate_cancel_concurrency.ts` | Round 8 | Tier 2 | 6 tests | F31, F33 | `npx tsx tests/test_initiate_cancel_concurrency.ts` |
| **26** | `web/tests/test_isolation_handover.ts` | Round 8 | Tier 2 & Tier 3 | 5 suites | F31, F32, F33 | `npx tsx tests/test_isolation_handover.ts` |
| **27** | `web/tests/test_mobile_api_hardening.ts` | Round 5 | Tier 1 & Tier 2 | 3 scenarios | F23, F25 | `npx tsx tests/test_mobile_api_hardening.ts` |
| **28** | `web/tests/test_nodal_triage_and_claim.ts` | Round 6 | Tier 1 & Tier 3 | 8 steps | F26, F27, F28 | `npx tsx tests/test_nodal_triage_and_claim.ts` |
| **29** | `web/tests/test_prisma_connection.mjs` | Round 2 | Tier 1 | 1 sanity test | F8 | `node tests/test_prisma_connection.mjs` |
| **30** | `web/tests/test_route_crawler.mjs` | Round 7 | Tier 1 & Tier 2 | 27 routes crawled | F29, F30 | `node tests/test_route_crawler.mjs` |
| **31** | `web/tests/test_route_crawler.ts` | Round 7 | Tier 1 & Tier 2 | 27 routes crawled | F29, F30 | `npx tsx tests/test_route_crawler.ts` |
| **32** | `web/tests/workflows.test.mjs` | Round 3 | Tier 1 & Tier 2 | 21 tests | F2, F3, F4, F5, F6, F14 | `node tests/workflows.test.mjs` |
| **33** | `web/src/app/dashboard/gov/govDashboard.test.ts` | Round 9 | Tier 1 & Tier 2 | 6 verification suites | F34, F35 | `npx tsx src/app/dashboard/gov/govDashboard.test.ts` |
| **34** | `mobile/tests/SerializationChallengeRunner.java` | Round 5 | Tier 1 & Tier 2 | 60+ assertions | F24, F25 | Android JVM / JUnit harness |

---

## 5. Execution Commands by Milestone & Runner Invocations

All tests are executable via standard shell environments (PowerShell / Command Prompt on Windows, Bash on Linux/macOS). For Web tests, change working directory to `a:/Development/Antigravity/SIH26043/web`.

### Master 4-Tier E2E Runner (45 tests)
Executes all four tiers (Category Partitioning, BVA/Security, Pairwise Lifecycle, and Real-World Scenarios) and generates formatted ASCII report:
```bash
cmd /c npx tsx tests/run-all-e2e.ts
```

### Milestone & Feature-Specific Invocations

1. **Round 4: Tri-Track Triage Verification (Innovation, Standard, Civic)**:
   ```bash
   cmd /c npx tsx tests/test_3track_triage.ts
   ```
2. **Round 5: Jan-Aawaz Mobile Intake & Backend Hardening**:
   ```bash
   cmd /c npx tsx tests/judge_e2e_mobile.ts
   cmd /c npx tsx tests/stress_mobile_api.ts
   cmd /c npx tsx tests/test_mobile_api_hardening.ts
   ```
3. **Round 6: District Nodal Triage & Atomic University Claim Race**:
   ```bash
   cmd /c npx tsx tests/test_nodal_triage_and_claim.ts
   cmd /c npx tsx tests/test_adversarial_stress_and_race.ts
   cmd /c npx tsx tests/test_challenger_r2_concurrency_reverification.ts
   cmd /c npx tsx tests/challenger_boundary_attacks.ts
   ```
4. **Round 7: Next.js Route Crawler & SSR Hydration Integrity**:
   ```bash
   cmd /c npx tsx tests/test_route_crawler.ts
   cmd /c node tests/routes.test.mjs
   ```
5. **Round 8: Account Handover Portal Security & Concurrency Suites**:
   ```bash
   cmd /c npx tsx tests/test_handover_backend.ts
   cmd /c npx tsx tests/adversarial_handover_test.ts
   cmd /c npx tsx tests/test_concurrency_handover.ts
   cmd /c npx tsx tests/test_initiate_cancel_concurrency.ts
   cmd /c npx tsx tests/test_isolation_handover.ts
   cmd /c npx tsx tests/challenger_auth_handover_stress.test.ts
   cmd /c npx tsx tests/challenger_stress_concurrency.ts
   ```
6. **Round 9: Government GIS Dashboard & 24 Districts Suite**:
   ```bash
   cmd /c npx tsx src/app/dashboard/gov/govDashboard.test.ts
   ```
7. **Mobile Client Compilation & Serialization Tests**:
   ```bash
   # Android Debug APK
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat assembleDebug"

   # Desktop / JVM Compose Build
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"
   ```
8. **Web Production Build**:
   ```bash
   cmd /c npm run build
   ```

---

## 6. Traceability & Quality Invariant Matrix

To prevent regression across continuous deployments, every test suite enforces immutable architectural invariants:

1. **Zero Data Pollution**: Suites that insert ephemeral seed records (`judge_e2e_mobile.ts`, `test_handover_backend.ts`, `test_nodal_triage_and_claim.ts`) must run cleanup operations in `finally` blocks, maintaining zero pollution in `dev.db`.
2. **Soft-Delete Enforcement**: Queries filtering active challenges or users must assert `deletedAt IS NULL`. Direct deletions are rejected at the ORM extension layer.
3. **Atomic Mutual Exclusion**: Any state transition involving resource allocation (university claiming challenge docket, successor claiming handover token) must be enclosed in an atomic transaction (`prisma.$transaction`) with concurrency collision detection yielding HTTP 409.
4. **No Broken Links or Placeholders**: Route crawler asserts 0 hydration errors (#418, #423, #425) and 0 unrouted `href="#"` dead ends.
