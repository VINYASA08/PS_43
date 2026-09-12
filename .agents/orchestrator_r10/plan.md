# Orchestration Plan — Round 10 Documentation Refresh

## Objective
Update all markdown documentation across the Jharkhand Societal Innovation Collaboration Portal ("PRAGATI") to reflect the current state (44+ routes, 24 Jharkhand districts, features across 9 rounds), remove deprecated terms ("Smart Study", "Sarpanch"), update rules and agent context, and verify clean build.

## Milestones

### Milestone 0: Comprehensive Codebase Survey
- **Lead**: Explorers (`teamwork_preview_explorer`)
- **Objectives**:
  1. Survey all Next.js API routes (`web/src/app/api/**/route.ts`) and pages (`web/src/app/**/page.tsx`). Confirm count >= 44.
  2. Survey all 6 dashboard types: Citizen, Nodal, Gov, University, Industry, Contributor.
  3. Survey all test files in `web/src/__tests__` and any root/e2e tests (confirm >= 32 test files).
  4. Survey mobile application screens and structure in `mobile/` (Kotlin Compose Multiplatform screens: Jan-Aawaz / PRAGATI Lens).
  5. Search for every occurrence of "Smart Study" and "Sarpanch" across all `.md` files in the repository.
  6. Examine current state of `PROJECT.md`, `TEST_INFRA.md`, `TEST_READY.md`, `architecture_flow.md`, `mobile/README.md`, `web/README.md`, `web/CLAUDE.md`, `.agy/rules/collaboration-architecture.md`, and `.agy/learning_proposal.md`.

### Milestone 1: Master Project Documentation (`PROJECT.md` & `architecture_flow.md`)
- **Lead**: Worker (`teamwork_preview_worker`)
- **Objectives**:
  1. Rewrite `PROJECT.md` as Master Project Specification:
     - Tri-Track Triage (Track A: Innovation/Academia, Track B: Standard/Gov Body, Track C: Civic Rapid)
     - Citizen Intake (Web & Mobile Jan-Aawaz)
     - AI Categorization (thematic domains, priority, deduplication)
     - Nodal Officer Triage (reject, divert to gov body, route to academia)
     - University DPR & Proposals (3-university match, claim lock, proposal submission, budget)
     - Industry AI Matching & Escrow (commitments, funding, escrow ledger, milestones)
     - Government GIS Dashboard (24 Jharkhand districts telemetry, interactive GIS map UI, IP compliance queue)
     - Industry Mentor Portal (Kanban task board, TRL 1-9 tracking audit log, interactive mentor review with dual decision gates & royalty sliders)
     - Chat Hub & Open Contributor Board
     - WhatsApp Simulator & Account Handover Portal (/dashboard/settings, /handover/[token])
     - Mobile App (Jan-Aawaz / PRAGATI Lens)
     - Complete 44+ route inventory with methods & purposes
     - 6 dashboard personas (Citizen, Nodal, Gov, University, Industry, Contributor)
  2. Update `architecture_flow.md`:
     - Version updated to 9.0.0
     - Remove all Sarpanch references
     - Add Account Handover flow, Nodal Officer workflow, Government GIS Dashboard, Industry Mentor Portal (Kanban/TRL/Escrow), Chat Hub, Open Contributor Board, and complete API route topology.

### Milestone 2: Test Infrastructure Documentation (`TEST_INFRA.md` & `TEST_READY.md`)
- **Lead**: Worker (`teamwork_preview_worker`)
- **Objectives**:
  1. Update `TEST_INFRA.md`:
     - Update feature coverage inventory beyond F19 (incorporate all features from Rounds 1-9)
     - Retain 4-tier testing methodology (Tier 1: Feature, Tier 2: Boundary/Corner, Tier 3: Cross-Feature, Tier 4: Real-World)
     - List at least 25 test files in the file structure section (reflecting all 32+ test files in `web/src/__tests__`).
  2. Update `TEST_READY.md`:
     - Reflect current 44+ route count and all test suites across all rounds (not just Round 5 mobile tests).

### Milestone 3: READMEs & Agent Context (`mobile/README.md`, `web/README.md`, `web/CLAUDE.md`)
- **Lead**: Worker (`teamwork_preview_worker`)
- **Objectives**:
  1. `mobile/README.md`:
     - Rename from "Smart Study" to "Jan-Aawaz / PRAGATI Lens"
     - Remove Sarpanch persona references
     - Document actual Compose screens present in the Kotlin codebase
  2. `web/README.md`:
     - Rename from "Smart Study" to "PRAGATI"
     - Add complete route inventory (44+ routes)
     - Document all 6 dashboard personas and major features
  3. `web/CLAUDE.md`:
     - Expand from 2-line stub to comprehensive project guide (>= 30 lines)
     - Include build commands, test commands, architecture overview, directory layout, environment vars, coding guidelines.

### Milestone 4: Rules Reconciliation & Deprecation Cleanup
- **Lead**: Worker (`teamwork_preview_worker`)
- **Objectives**:
  1. Update `.agy/rules/collaboration-architecture.md` to document Industry Mentor TRL tracking linkage.
  2. Delete or archive `.agy/learning_proposal.md` (which proposes Sarpanch rule contradicting `nodal-routing-architecture.md`).
  3. Perform repository-wide audit to ensure NO markdown file contains "Smart Study" or "Sarpanch".

### Milestone 5: Verification, Review, Challenge & Build Gate
- **Lead**: Reviewers (`teamwork_preview_reviewer`), Challenger (`teamwork_preview_challenger`), Forensic Auditor (`teamwork_preview_auditor`)
- **Objectives**:
  1. Review all updated documentation against user acceptance criteria.
  2. Adversarially verify: string search for "Smart Study" and "Sarpanch" across all `.md` files; count API routes in `PROJECT.md`; count test files in `TEST_INFRA.md`; verify `architecture_flow.md` version 9.0.0; verify `web/CLAUDE.md` line count.
  3. Run `npm run build` in `web/` to guarantee exit code 0.
  4. Forensic audit for genuine documentation without dummy/facade placeholders.
  5. Gate check: record in `GATE_STATUS.md`.
