# Dispatch for E2E Test Writer

**Role**: Test Writer (Independent E2E Testing Track)
**Working Directory**: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_test_writer_e2e_1
**Exclusively Owned Files**:
- `web/tests/e2e-citizen-intake.test.ts`
- `web/tests/e2e-ai-categorization.test.ts`
- `web/tests/e2e-rbac-security.test.ts`
- `web/tests/e2e-workflows.test.ts`
- `web/tests/run-all-e2e.ts`
- `TEST_INFRA.md`
- `TEST_READY.md`

## 2026-09-04T21:15:09Z
Objective:
Design and author the independent, opaque-box E2E test suite for the Jharkhand Societal Innovation Collaboration Portal derived from `ORIGINAL_REQUEST.md` (section ## 2026-09-04T21:04:25Z) following the systematic 4-tier methodology:

1. Create `a:\Development\Antigravity\SIH26043\TEST_INFRA.md` at project root outlining:
   - Test philosophy (opaque-box, requirement-driven, zero internal coupling).
   - Feature coverage inventory (F1 to F19).
   - 4-Tier methodology (Category-Partition, BVA, Pairwise Combinations, Real-World Workloads).

2. Implement test suites in `web/tests/`:
   - `web/tests/e2e-citizen-intake.test.ts`:
     - Tier 1: Challenge submission with valid title, description, domain, district, GPS coordinates, and multimedia attachments.
     - Tier 2: Boundary & corner cases: Empty description, missing required fields, boundary coordinates, oversized file upload rejection, unsupported file mime types.
   - `web/tests/e2e-ai-categorization.test.ts`:
     - Tier 1: Classification of sample problem statement into correct canonical domain, urgency, and priority score.
     - Tier 1: Intelligent routing of domain/district to empanelled Jharkhand university (e.g. Water in Dhanbad -> IIT ISM; Agriculture in Gumla -> Birsa Agricultural Univ).
     - Tier 2: Boundary & corner cases: Semantic deduplication against near-identical challenge (`IN-GR-2026-9842`), fallback heuristic engine when AI provider is unreachable or returns HTTP 429/timeout.
   - `web/tests/e2e-rbac-security.test.ts`:
     - Tier 1: Unauthenticated request to protected API routes returns 401.
     - Tier 1: Role boundary enforcement (Citizen, University, Industry, Gov): Citizen cannot approve proposals (403), University cannot access Gov admin routes (403), Industry cannot submit university proposals (403).
     - Tier 2: 5 failed login attempts triggers account lockout (30-min cooldown); sliding-window rate limit triggers 429; CSRF token validation on state-changing requests.
   - `web/tests/e2e-workflows.test.ts`:
     - Tier 3: Pairwise cross-feature workflow: Citizen submission -> AI categorization & routing -> University proposal submission -> Industry CSR escrow commitment -> Track status updates.
     - Tier 4: Real-world Jharkhand scenarios (Dhanbad Acidic Mine Runoff, Gumla Solar Drip Irrigation, Simdega Rural Maternal Healthcare).
   - `web/tests/run-all-e2e.ts` (or runner script):
     - Single command test runner that executes all test tiers, prints formatted tier-by-tier summaries, and exits with 0 on pass.

3. Run the test runner (e.g. `cmd /c npx tsx tests/run-all-e2e.ts`) to verify that the tests execute cleanly. Note any expected failures that depend on M2/M3 completion.

4. Publish `a:\Development\Antigravity\SIH26043\TEST_READY.md` summarizing:
   - Runner command
   - Tier count and coverage checklist (Tier 1, Tier 2, Tier 3, Tier 4)
   - Status of all tests
