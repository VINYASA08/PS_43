# Test Infrastructure Specification: Jharkhand Societal Innovation Collaboration Portal

## 1. Test Philosophy: Opaque-Box, Requirement-Driven, Zero Internal Coupling

The test infrastructure for the **Jharkhand Societal Innovation Collaboration Portal** adheres to the following core tenets:

1. **Opaque-Box Verification**: Tests interact strictly via public HTTP contracts, Next.js Route Handler interfaces (`NextRequest`/`NextResponse`), and observable state (database models, status codes, response headers, and audit trails). Tests have zero coupling to internal UI component states or private implementation trivia.
2. **Authoritative Specification Derivation**: Every test case, assertion threshold, and expected result is derived directly from `ORIGINAL_REQUEST.md` (specifically `## 2026-09-04T21:04:25Z`, `## 2026-09-04T14:06:00Z`, and `## 2026-09-04T12:37:16Z`) and the Project Master Specification `PROJECT.md`.
3. **Progressive Testability & Graceful Dependency Resolution**: Tests must be self-contained and independently executable. Features undergoing active implementation across milestones (M1, M2, M3) are exercised via resilient discovery mechanisms that test live route handlers when mounted while validating contract invariants and noting milestone dependencies.
4. **Adversarial & Fault Injection Hardening**: Test cases probe boundary values, encoding attacks, oversized payload limits, rate-limiting windows, CSRF tampering, and simulated network timeouts/HTTP 429 rate limit conditions.

---

## 2. Feature Coverage Inventory (F1 to F19)

| Feature ID | Feature Name | Mapped Test Suite | Verification Method | Primary Test Tier |
|---|---|---|---|---|
| **F1** | Permissions-Policy Update | `e2e-citizen-intake.test.ts` | Header inspection & GPS sensor permission contract | Tier 2 |
| **F2** | Citizen Multimedia Evidence Upload | `e2e-citizen-intake.test.ts` | Multipart upload validation, size caps (10MB), MIME check | Tier 1 & Tier 2 |
| **F3** | Citizen Geolocation & Administrative Selection | `e2e-citizen-intake.test.ts` | 24-district validation & GPS bounding box coordinates | Tier 1 & Tier 2 |
| **F4** | Challenge Submission Domain Alignment | `e2e-citizen-intake.test.ts` | Canonical 10-domain schema validation on `/api/challenges` | Tier 1 |
| **F5** | Security Patches (CSRF) | `e2e-rbac-security.test.ts` | State-changing request validation without/with CSRF token | Tier 2 |
| **F6** | Frontend Subpage RBAC Protection | `e2e-rbac-security.test.ts` | Role-based dashboard route access and redirect validation | Tier 1 |
| **F7** | Database Soft-Delete Integrity | `e2e-workflows.test.ts` | Prisma query extension verification (`deletedAt IS NULL`) | Tier 2 |
| **F8** | Database Migration Compatibility | `run-all-e2e.ts` / Prisma | Schema consistency & relational integrity assertions | Tier 1 |
| **F9** | External AI Categorization API | `e2e-ai-categorization.test.ts` | Structured AI categorization (domain, urgency, priority) | Tier 1 |
| **F10** | Intelligent University Routing | `e2e-ai-categorization.test.ts` | Domain/district mapping to 6 empanelled institutions | Tier 1 |
| **F11** | Semantic Deduplication | `e2e-ai-categorization.test.ts` | Similarity matching against existing seeded challenges | Tier 2 |
| **F12** | Resilient AI Fallback Engine | `e2e-ai-categorization.test.ts` | Circuit-breaker & keyword heuristic fallback on 429/timeout | Tier 2 |
| **F13** | AI Integration in Challenge Intake | `e2e-workflows.test.ts` | Auto-enrichment of challenge docket with AI metadata | Tier 3 |
| **F14** | Collaborative Lifecycle & Proposal Hydration | `e2e-workflows.test.ts` | Proposal submission (`PR-XXX`), draft hydration, CSR escrow | Tier 3 |
| **F15** | Turbopack PWA Build Stabilization | `run-all-e2e.ts` | Build verification with Next.js 16 App Router | Tier 4 |
| **F16** | Programmatic Tests: Citizen Intake | `e2e-citizen-intake.test.ts` | Automated multi-field intake, telemetry & dropzone suites | Tier 1 & Tier 2 |
| **F17** | AI Integration Tests | `e2e-ai-categorization.test.ts` | Automated NLP domain, urgency, and university routing tests | Tier 1 & Tier 2 |
| **F18** | RBAC & Security Tests | `e2e-rbac-security.test.ts` | 401 unauth, 403 role separation, 423 lockout, 429 rate limit | Tier 1 & Tier 2 |
| **F19** | End-to-End Build Verification | `run-all-e2e.ts` | Zero-error test runner execution across all 4 tiers | Master Runner |

---

## 3. Systematic 4-Tier Test Methodology

The test suite is structured into four distinct, progressive tiers:

```
+-----------------------------------------------------------------------+
|  Tier 4: Real-World Workloads (Dhanbad, Gumla, Simdega Field Scenarios) |
+-----------------------------------------------------------------------+
                                  ^
+-----------------------------------------------------------------------+
|  Tier 3: Pairwise Combinations (Citizen -> AI -> Uni -> Industry -> Track) |
+-----------------------------------------------------------------------+
                                  ^
+-----------------------------------------------------------------------+
|  Tier 2: Boundary Value Analysis (BVA), Lockout, Fallbacks, Corners   |
+-----------------------------------------------------------------------+
                                  ^
+-----------------------------------------------------------------------+
|  Tier 1: Category-Partition & Canonical Happy Path Contracts          |
+-----------------------------------------------------------------------+
```

### Tier 1: Category-Partition & Canonical Happy Paths
- **Category-Partitioning**: Partitions input domains (10 canonical domains, 24 districts, 4 urgency levels, 5 user roles).
- **Happy Path Verifications**:
  - Valid citizen challenge intake with multimedia metadata, GPS location, and auto-generated `IN-GR-2026-XXXX` tracking ID.
  - Accurate AI categorization of problem statements (e.g. Water Contamination in Dhanbad -> "Water Management", Urgency "CRITICAL", routing to IIT ISM Dhanbad).
  - RBAC access control gates: unauthenticated requests to protected endpoints return HTTP 401; authorized role sessions access designated resources.

### Tier 2: Boundary Value Analysis (BVA) & Corner Cases
- **Input Boundaries**:
  - Description lengths: minimum 20 characters, reject 19 characters with HTTP 400.
  - Title lengths: minimum 5 characters, reject 4 characters with HTTP 400.
  - Geolocation coordinates: validate Jharkhand bounding box (Lat: 21.96°N to 25.35°N, Long: 83.32°E to 87.94°E); handle boundary formatting.
  - Evidence uploads: maximum 10 MB per file, reject > 10 MB with HTTP 400/413; enforce MIME whitelist (`image/jpeg`, `image/png`, `application/pdf`, `video/mp4`).
- **Security & Fault Boundaries**:
  - Account lockout: exactly 5 failed login attempts triggers account lockout (`status: "LOCKED"`, HTTP 423 with 30-minute cooldown).
  - Rate limiting: sliding window of 10 requests per minute per IP; 11th request triggers HTTP 429 with `Retry-After` header.
  - CSRF protection: state-changing methods (`POST`, `PUT`, `DELETE`) without valid `sih_csrf` token fail with HTTP 403.
  - Semantic deduplication: near-duplicate submissions (e.g. against `IN-GR-2026-9842`) flagged with `isDuplicate: true` and matched tracking ID.
  - AI Circuit Breaker & Fallback: external API timeout (3000ms) or HTTP 429 activates local keyword/regex heuristic engine without 500 crashes.

### Tier 3: Pairwise Combinations & Cross-Feature Workflows
- Exercises multi-actor, multi-phase collaborative lifecycle transitions across independent components:
  1. **Citizen Ingestion**: Citizen creates challenge via `/api/challenges` with CSRF cookie. Docket assigned `IN-GR-2026-XXXX` with status `REPORTED`.
  2. **AI Triage & Routing**: AI categorization engine assigns domain, urgency, and routes to empanelled university; status advances to `OPEN_FOR_PROPOSALS`.
  3. **University Solutioning**: University PI authors and submits proposal `PR-XXX` with budget, methodology, and timeline; challenge transitions to `UNDER_REVIEW`.
  4. **Industry Escrow Commitment**: Corporate CSR Director executes electronic MoU and locks funds `JH-ESCROW-2026-CSR-XXXX` with 30-40-30 tranches; proposal transitions to `FUNDED`, challenge transitions to `IN_PROGRESS`.
  5. **Public Accountability Telemetry**: Citizen and government query `/api/track/[id]` verifying full 5-stage lifecycle history, telemetry metrics, and immutable audit logs.

### Tier 4: Real-World Jharkhand Workloads & Stress Scenarios
- High-fidelity end-to-end field simulation matching specific socio-geographic challenges of Jharkhand:
  - **Scenario 1: Dhanbad Acidic Mine Runoff**:
    - Severe water contamination in Jharia/Bermo coal belt; pH 4.8, Turbidity 48 NTU, Dissolved Iron 6.2 mg/L.
    - AI classification: "Water Management", Urgency: "CRITICAL", SLA: 14 days.
    - Routing: IIT (ISM) Dhanbad Department of Environmental Science & Mining Engineering.
    - Solution: Solar-powered dual-stage nanofiltration skid.
    - Escrow Sponsor: Coal India CSR Trust / Tata Steel.
  - **Scenario 2: Gumla Solar Drip Irrigation**:
    - Rainfed tribal plateau agriculture, acute soil nitrogen deficit (N < 180 kg/ha), drought vulnerability.
    - AI classification: "Agriculture", Urgency: "HIGH", SLA: 30 days.
    - Routing: Birsa Agricultural University (BAU) Faculty of Agricultural Engineering.
    - Solution: IoT-enabled solar-powered smart drip micro-irrigation and bio-fertilizer schedule.
    - Escrow Sponsor: NABARD / Tata Trusts CSR.
  - **Scenario 3: Simdega Rural Maternal Healthcare**:
    - Remote forested tribal blocks, lack of specialist obstetricians at Primary Health Centers.
    - AI classification: "Healthcare", Urgency: "CRITICAL", SLA: 14 days.
    - Routing: RIMS Ranchi & BIT Mesra Bioengineering.
    - Solution: Portable solar point-of-care ultrasound and tele-triage kit.
    - Escrow Sponsor: Jindal Steel & Power CSR.

---

## 4. Test Suite File Structure

```
web/tests/
├── e2e-citizen-intake.test.ts     # Tier 1 & Tier 2: Intake, Geolocation, Multimedia Upload
├── e2e-ai-categorization.test.ts  # Tier 1 & Tier 2: NLP Domain, Urgency, Routing, Deduplication, Fallback
├── e2e-rbac-security.test.ts      # Tier 1 & Tier 2: 401/403 RBAC, Lockout, Rate Limiting, CSRF
├── e2e-workflows.test.ts          # Tier 3 & Tier 4: Pairwise Lifecycle & Real-World Jharkhand Workloads
├── run-all-e2e.ts                 # Master E2E Runner: Executes all 4 tiers, formats summaries, exits 0
├── auth-rbac-security.test.ts     # Unit & Route Level Security Suite (Baseline)
└── db-api-lifecycle.test.ts       # Database & Soft-Delete Lifecycle Suite (Baseline)
```

---

## 5. Execution Command

To execute the full E2E test suite:

```bash
# Windows PowerShell / CMD
cmd /c npx tsx tests/run-all-e2e.ts
```
