# Project: Multi-Platform 3-Track Problem Triage & Cross-Platform Refactor (Round 4)

## Architecture
- **Web Frontend & API**: Next.js 16.3.4 (App Router, Turbopack, React 19, Tailwind CSS v4, Zustand) at `/web`.
- **Database & Persistence**: SQLite with Prisma Client 5.11.0 (`/web/prisma/schema.prisma`, `web/prisma/dev.db`), soft-delete extensions, and immutable audit logging.
- **AI Triage & Categorization**: Google Gemini / OpenAI with local deterministic heuristic fallback in `/web/src/lib/ai.ts` and `/web/src/lib/routing.ts`.
- **Mobile Frontend**: Kotlin Multiplatform (Compose Multiplatform 1.5.11, Voyager 1.0.0, Ktor 2.3.7, Koin 3.5.3, AGP 8.0.2, Android SDK 34, JDK 17) at `/mobile`.
- **Tri-Track Triage System**:
  - `TRACK_A_INNOVATION`: Applied R&D, empanelled universities (IIT ISM, BAU, RIMS, NIT Jsr), CSR escrow funding, 45-90d SLA.
  - `TRACK_B_STANDARD`: Known engineering solutions, government line departments (JUVNL, DWSD, RCD), e-procurement/work order, 14-30d SLA.
  - `TRACK_C_CIVIC`: Immediate municipal grievance, urban local bodies (RMC, DMC, JNAC) and gram panchayats, 24-72h rapid SLA.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Architecture Flow Document | Map full data flow between Web, Mobile, Route Handlers, AI, and Database (`architecture_flow.md`) | M1 | ORIGINAL_REQUEST R1 |
| 2 | Prisma Schema 3-Track Fields | Add `track`, `trackRouting`, `triageReasoning`, `triageConfidence` to `Challenge` model | M2 | ORIGINAL_REQUEST R2 |
| 3 | Application Types & Zod Schemas | Define `TriageTrack` enum, `validTracks`, update `createChallengeSchema` and `updateChallengeSchema` | M2 | ORIGINAL_REQUEST R2 |
| 4 | AI & Heuristic 3-Track Engine | Update `ai.ts` and `routing.ts` with 3-track classification rules, SLA hours, and routing targets | M2 | ORIGINAL_REQUEST R2 |
| 5 | Route Handlers 3-Track Integration | Update `POST/GET /api/challenges`, `/api/ai/categorize`, `/api/mobile/challenges`, `/api/mobile/verify`, `/api/track/[id]` | M2 | ORIGINAL_REQUEST R2 |
| 6 | Mobile Model & Client Support | Add `track`, `trackRouting`, `triageReasoning` to `Models.kt` and `ApiClient.kt` | M2 | ORIGINAL_REQUEST R2 |
| 7 | Web TypeScript Baseline Fix | Fix type assertions in `tests/challenger_ai_lifecycle_stress.test.ts` so `npx tsc --noEmit` passes with 0 errors | M3 | ORIGINAL_REQUEST R3 |
| 8 | Web Build Verification | Verify `npm run build` in `/web` passes with 0 errors | M3 | Acceptance Criteria |
| 9 | Mobile Android Manifest & Permissions | Add `INTERNET` permission and `usesCleartextTraffic="true"` to `AndroidManifest.xml` | M3 | ORIGINAL_REQUEST R3 |
| 10 | Mobile Model Serialization Contract | Fix `DomainDistribution` model contract (`name` mapping) in `Models.kt` | M3 | ORIGINAL_REQUEST R3 |
| 11 | Mobile Gradle & JDK 17 Build | Configure build properties, verify `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"` passes with 0 errors | M3 | Acceptance Criteria |
| 12 | 3-Track Programmatic Test Script | Create `tests/test_3track_triage.ts` submitting 3 mock problems (one per track) and asserting DB state | M4 | Acceptance Criteria |
| 13 | Final Verification & Audit Gate | Run full test suite, verify builds, audit integrity, certify acceptance | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Architecture Flow & System Audit | Author `architecture_flow.md` mapping full cross-platform data flow; update root `PROJECT.md` | Survey Complete | PLANNED |
| 2 | 3-Track Problem Triage Implementation | Schema update, Prisma push, AI/routing engine, and API route updates | M1 | PLANNED |
| 3 | Cross-Platform Refactor & Bug Fixes | Fix Web TS test errors, fix Mobile Android permissions & model contracts, verify zero-error builds | M2 | PLANNED |
| 4 | Programmatic 3-Track Test Suite | Implement and execute `test_3track_triage.ts` with 3 mock problems and DB assertions | M2, M3 | PLANNED |
| 5 | Acceptance Certification & Audit | Execute all acceptance criteria commands, verify Reviewer, Challenger, and Forensic Auditor verdicts | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Web API ↔ Database (Prisma)
- `Challenge.track`: `String @default("TRACK_A_INNOVATION")`
- `Challenge.trackRouting`: `String?` (e.g., "IIT (ISM) Dhanbad", "JUVNL", "RMC")
- `Challenge.triageReasoning`: `String?`
- `Challenge.triageConfidence`: `Float?`
- `Challenge.slaDeadline`: `DateTime?` (Track C: <=72h, Track B: 14-30d, Track A: 45-90d)

### Mobile Client ↔ Backend API
- `POST /api/mobile/challenges`
  - Request: `{ title, description, district, location, reporterId?, evidenceUrl?, track? }`
  - Response: `{ success: true, trackingId, challengeId, track, trackRouting }`
- `GET /api/analytics`
  - Response payload `domainDistribution` elements mapped cleanly in `Models.kt` without deserialization failure.

## Code Layout
- Web Platform: `a:/Development/Antigravity/SIH26043/web/`
  - Routes: `src/app/`
  - API Routes: `src/app/api/`
  - Business Logic: `src/lib/` (`ai.ts`, `routing.ts`, `types.ts`, `validation.ts`, `prisma.ts`)
  - Tests: `tests/`
  - Schema: `prisma/schema.prisma`, `prisma/dev.db`
- Mobile Application: `a:/Development/Antigravity/SIH26043/mobile/`
  - Android App: `androidApp/src/androidMain/`
  - Shared KMP: `shared/src/commonMain/kotlin/` (`network/`, `screens/`, `App.kt`)
  - Gradle: `build.gradle.kts`, `settings.gradle.kts`, `gradle.properties`
- Workspace Artifacts:
  - `a:/Development/Antigravity/SIH26043/architecture_flow.md`
  - `a:/Development/Antigravity/SIH26043/PROJECT.md`
