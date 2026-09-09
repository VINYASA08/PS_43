# Comprehensive Test Infrastructure & Verification Audit Report (Rounds 1–9)
**Project**: Jharkhand Societal Innovation Collaboration Portal (Branded "PRAGATI" & "Jan-Aawaz")  
**Target Applications**: Next.js 16 (React 19, TypeScript, Tailwind CSS v4, Prisma SQLite) & Kotlin Multiplatform Mobile  
**Investigator**: `explorer_tests`  
**Timestamp**: 2026-09-09T17:32:00Z  
**Destination**: `a:/Development/Antigravity/SIH26043/.agents/explorer_tests/report.md`

---

## 1. Executive Summary & Audit Highlights

An exhaustive, opaque-box audit of all test suites, test files, and verification scripts across the PRAGATI codebase was conducted. The investigation spanned `web/tests/`, `web/src/**`, and `mobile/tests/`.

### Key Metrics
- **Total Test Files Cataloged**: **34 test files** (32 in `web/tests/`, 1 in `web/src/app/dashboard/gov/`, 1 in `mobile/tests/`).
  - *Verification Condition*: Meets and exceeds the requirement of $\ge 32$ test files across Rounds 1–9, and provides an inventory of 34 files to replace the 7 files currently in `TEST_INFRA.md`.
- **Total Test Cases & Assertions**: **380+ distinct test cases and empirical assertions** across all suites.
- **Compiled Routes Verified**: **44+ compiled routes** (20 UI Page routes in `web/src/app/**/page.tsx` + 35 API Route handlers in `web/src/app/api/**/route.ts` = 55 route endpoints).
- **Features Covered**: **F1 through F37** spanning all 9 development rounds from September 4 to September 9, 2026.
- **Empirical Execution Status**: Validated test executions exit code `0` (e.g., `judge_e2e_mobile.ts`: 17/17 PASS; `govDashboard.test.ts`: 6/6 PASS; `test_prisma_connection.mjs`: PASS with 354 users, 262 challenges).

---

## 2. Exhaustive Catalog of All 34 Test Files

The table below catalogs every single test file discovered in the project, mapped to its relative path, primary purpose, assertion count, covered features (F1–F37), development round, tier classification, and execution command.

### Master Test Suite Directory Table

| # | File Path | Development Round | Primary Test Tier | Test Count / Assertions | Features Covered | Execution Command |
|---|---|---|---|---|---|---|
| **1** | `web/tests/adversarial-security-intake.test.ts` | Round 3 | Tier 2 & Tier 1 | 39 tests | F1, F2, F3, F4, F5, F6, F7, F18 | `npx tsx tests/adversarial-security-intake.test.ts` |
| **2** | `web/tests/adversarial_handover_test.ts` | Round 8 | Tier 2 & Tier 3 | 14 scenarios (11+ vectors) | F31, F32, F33 | `npx tsx tests/adversarial_handover_test.ts` |
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
| **18** | `web/tests/run-all-e2e.ts` | Round 3 | Master Runner | 45 aggregated tests | F1 to F19 | `npx tsx tests/run-all-e2e.ts` |
| **19** | `web/tests/stress_mobile_api.ts` | Round 5 | Tier 2 | 12 steps / 17 assertions | F23, F25 | `npx tsx tests/stress_mobile_api.ts` |
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

## 3. Expanded Feature Coverage Inventory (F1 to F37)

The table below provides the full, expanded feature coverage inventory spanning all 9 development rounds, ready for verbatim integration into `TEST_INFRA.md`.

| Feature ID | Feature Name | Development Round | Mapped Test Suites | Verification Method | Primary Test Tier |
|---|---|---|---|---|---|
| **F1** | Permissions-Policy & Sensor Hardening | Round 3 | `e2e-citizen-intake.test.ts`, `adversarial-security-intake.test.ts` | Security headers inspection, GPS permission contract enforcement | Tier 2 |
| **F2** | Citizen Multimedia Evidence Upload | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs`, `adversarial-security-intake.test.ts` | Multipart upload validation, 10MB size limit, MIME type whitelist | Tier 1 & Tier 2 |
| **F3** | Geolocation & 24-District Administrative Boundary | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs` | 24-district validation & GPS bounding box [21.96°N–25.35°N, 83.32°E–87.94°E] | Tier 1 & Tier 2 |
| **F4** | Canonical 10-Domain Schema Alignment | Round 3 | `e2e-citizen-intake.test.ts`, `workflows.test.mjs` | Canonical 10-domain schema validation on `/api/challenges` | Tier 1 |
| **F5** | CSRF Double-Submit Protection | Round 2 & 3 | `e2e-rbac-security.test.ts`, `auth-rbac-security.test.ts`, `adversarial-security-intake.test.ts` | State-changing request rejection without/with `sih_csrf` token | Tier 2 |
| **F6** | Frontend & API Role-Based Access Control | Round 2 & 3 | `e2e-rbac-security.test.ts`, `auth-rbac-security.test.ts`, `workflows.test.mjs` | HTTP 401 unauth, HTTP 403 role separation across Gov/Uni/Industry/Citizen | Tier 1 |
| **F7** | Database Soft-Delete Invariant (`deletedAt`) | Round 2 & 3 | `db-api-lifecycle.test.ts`, `empirical_challenge_p3_2.test.mjs`, `adversarial-security-intake.test.ts` | Prisma query extension verification (`deletedAt IS NULL`) & SQLite query | Tier 2 |
| **F8** | Relational Database Integrity & Migration | Round 2 | `test_prisma_connection.mjs`, `db-api-lifecycle.test.ts` | Foreign key cascades, SQLite foreign_keys=ON, schema consistency | Tier 1 |
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

## 4. 4-Tier Test Methodology & Coverage Architecture

The PRAGATI testing philosophy uses a strict 4-tier opaque-box pyramid:

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

---

## 5. Audit & Gap Analysis of Current Documentation

### Gaps in `TEST_INFRA.md`
1. **Truncated File Listing**: Section 4 lists only 7 test files in `web/tests/`. The project contains **32 files in `web/tests/`**, plus 1 in `web/src/` and 1 in `mobile/tests/`.
2. **Missing Features Beyond F19**: The feature table stops at Round 3 (F19). All features developed in Rounds 4 through 9 (F20 to F37) are absent.
3. **Missing Runner Commands**: Only `npx tsx tests/run-all-e2e.ts` is documented. Key test scripts (e.g. `test_3track_triage.ts`, `test_nodal_triage_and_claim.ts`, `judge_e2e_mobile.ts`, `test_route_crawler.ts`, `test_handover_backend.ts`, `govDashboard.test.ts`) have no documented run commands.
4. **Branding Alignment**: References to "Jharkhand Societal Innovation Collaboration Portal" should be updated to "PRAGATI (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation)".

### Gaps in `TEST_READY.md`
1. **Single-Round Myopia**: Titled "E2E Test Suite Ready: Round 5 Mobile Challenge Submission". It only records Round 5 mobile tests (`judge_e2e_mobile.ts`), omitting all other rounds.
2. **Outdated Route Count**: Mentions "(36 routes compiled)". Next.js now compiles **44+ routes** (55 route handlers and pages in total).
3. **Missing Test Suite Verification Matrix**: Does not report readiness or test counts for:
   - 4-Tier Master E2E Suite (`run-all-e2e.ts`, 45 tests)
   - 3-Track Triage Suite (`test_3track_triage.ts`, 12 steps)
   - District Nodal Triage & Race Claim Suite (`test_nodal_triage_and_claim.ts`, 8 steps)
   - High-Concurrency Claim Re-Verification (`test_challenger_r2_concurrency_reverification.ts`, 10 batteries)
   - Route Crawler & Hydration Error Suite (`test_route_crawler.ts`, 27 routes)
   - Account Handover Security & Concurrency Suite (`test_handover_backend.ts`, `adversarial_handover_test.ts`, 16+ scenarios)
   - Government GIS Dashboard Verification Suite (`govDashboard.test.ts`, 6 suites)

---

## 6. Deprecated Terminology Check ("Sarpanch" & "Smart Study")

In accordance with Round 9 directives:
- **`mobile-pipeline.mjs` (line 25)**: Contains `sarpanchId: "test-sarpanch-id"`. This is the only test file containing the deprecated string. It should be replaced with `nodalOfficerId` or documented as legacy smoke script.
- **`routes.test.mjs` & `test_route_crawler.ts`**: Do not contain deprecated terms.
- **`auth-rbac-security.test.ts` & `db-api-lifecycle.test.ts`**: Contain the header string `"Jharkhand Smart Study and Innovation Portal"`, which should be updated to PRAGATI in test logs.

---

## 7. Ready-to-Integrate Content Blocks

### Recommended Replacement for `TEST_INFRA.md` Section 4 (Test Suite File Structure)

```markdown
## 4. Test Suite File Structure

The project test infrastructure comprises 34 specialized test suites and harnesses organized across web and mobile:

### Web E2E & Domain Integration Suites (`web/tests/`)
```
web/tests/
├── run-all-e2e.ts                                  # Master 4-Tier E2E Runner (Orchestrates 45 tests)
├── e2e-citizen-intake.test.ts                      # Tier 1 & 2: Citizen intake, geolocation, dropzone
├── e2e-ai-categorization.test.ts                   # Tier 1 & 2: AI categorization, routing, deduplication
├── e2e-rbac-security.test.ts                       # Tier 1 & 2: RBAC gates, lockout (423), rate-limiting (429)
├── e2e-workflows.test.ts                           # Tier 3 & 4: Multi-actor workflows & 3 Jharkhand field scenarios
├── auth-rbac-security.test.ts                      # Unit & Route RBAC verification (25 tests)
├── db-api-lifecycle.test.ts                        # Database soft-delete & problem-to-funding lifecycle (26 tests)
├── test_3track_triage.ts                           # Round 4: 3-Track Triage (Innovation, Standard, Civic) (12 steps)
├── judge_e2e_mobile.ts                             # Round 5: Agent Judge mobile submission verification (17 checks)
├── stress_mobile_api.ts                            # Round 5: Mobile API boundaries, concurrency & fidelity (12 steps)
├── test_mobile_api_hardening.ts                    # Round 5: Mobile API fallback & reporterId hardening (3 tests)
├── test_nodal_triage_and_claim.ts                  # Round 6: Nodal triage, 3-way AI match & claim race (8 steps)
├── test_adversarial_stress_and_race.ts             # Round 6: 5/10/20-way concurrency race & triage matrix (15 tests)
├── test_challenger_r2_concurrency_reverification.ts# Round 6: 30/50-way bursts & 100-request parallel matrix (10 tests)
├── challenger_boundary_attacks.ts                  # Round 6: Nodal triage & claim boundary attacks (37 attacks)
├── test_route_crawler.ts                           # Round 7: Next.js route crawler & SSR error detector (TypeScript)
├── test_route_crawler.mjs                          # Round 7: Next.js route crawler & SSR error detector (ESM)
├── routes.test.mjs                                 # Round 1 & 7: HTTP route availability verification (19 routes)
├── test_handover_backend.ts                        # Round 8: Account Handover API & token lifecycle (16 tests)
├── test_concurrency_handover.ts                    # Round 8: Account Handover concurrency race conditions (3 batteries)
├── test_initiate_cancel_concurrency.ts             # Round 8: Initiate & Cancel concurrency deep dive (6 tests)
├── test_isolation_handover.ts                      # Round 8: Handover categories isolation verification (5 suites)
├── adversarial_handover_test.ts                    # Round 8: Handover fuzzing, replay & relational integrity (14 tests)
├── challenger_auth_handover_stress.test.ts         # Round 8: Handover auth, 2FA wipe & credential swap (12 tests)
├── challenger_stress_concurrency.ts                # Round 8: 10-way burst & interleaved claim/cancel race (3 tests)
├── adversarial-security-intake.test.ts             # Round 3: Challenger 1 adversarial intake stress (39 tests)
├── challenger_ai_lifecycle_stress.test.ts          # Round 3: Challenger 1 AI lifecycle stress (22 tests)
├── challenger_mobile_contract_verify.ts            # Round 5: Challenger 2 mobile contract alignment (5 tests)
├── workflows.test.mjs                              # Round 3: UI dropzone, telemetry & query oracles (21 tests)
├── empirical_challenge_p3_2.test.mjs               # Round 3: Live server database soft deletion verification (12 tests)
├── mobile-pipeline.mjs                             # Round 5: Minimal mobile pipeline simulation (1 test)
└── test_prisma_connection.mjs                      # Round 2: Prisma database connectivity smoke test (1 test)
```

### In-Source Component & Mobile Test Suites
```
web/src/app/dashboard/gov/
└── govDashboard.test.ts                            # Round 9: GIS map, 24 districts, IP queue, Master projects (6 suites)

mobile/tests/
└── SerializationChallengeRunner.java               # Round 5: Kotlinx Serialization & DTO test suite (60+ assertions)
```
```

---

## 8. Summary of Execution Commands by Milestone

```bash
# 1. Full E2E 4-Tier Master Runner (45 tests)
cmd /c npx tsx tests/run-all-e2e.ts

# 2. Round 4 Tri-Track Triage Verification
cmd /c npx tsx tests/test_3track_triage.ts

# 3. Round 5 Mobile Challenge Submission Verification (Agent Judge)
cmd /c npx tsx tests/judge_e2e_mobile.ts

# 4. Round 6 District Nodal Triage & Race Claim System
cmd /c npx tsx tests/test_nodal_triage_and_claim.ts
cmd /c npx tsx tests/test_adversarial_stress_and_race.ts

# 5. Round 7 Automated Route Crawler & SSR/Hydration Check
cmd /c npx tsx tests/test_route_crawler.ts

# 6. Round 8 Account Handover Portal (Backend & Security)
cmd /c npx tsx tests/test_handover_backend.ts
cmd /c npx tsx tests/adversarial_handover_test.ts

# 7. Round 9 Government GIS Dashboard Verification
cmd /c npx tsx src/app/dashboard/gov/govDashboard.test.ts
```

---

## 9. Conclusion

The testing infrastructure of PRAGATI is mature, deeply layered, and contains **34 test files** covering **F1 through F37** across all 9 rounds of development. The current `TEST_INFRA.md` (which lists only 7 files and F1–F19) and `TEST_READY.md` (which only documents Round 5 mobile tests with 36 routes) represent severe documentation lag.

The findings, expanded tables, file inventories, and command references in this report provide complete, ready-to-integrate specifications for updating `TEST_INFRA.md` and `TEST_READY.md` to 100% fidelity.
