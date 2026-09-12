# Master Audit Report: Mobile Codebase, Terminology Censorship, Rules Reconciliation & Architecture v9.0.0

**Author**: `explorer_mobile_terms`  
**Date**: 2026-09-09  
**Status**: Complete Forensic Investigation & Actionable Blueprint  
**Authority**: Round 10 Master Documentation Update  

---

## Executive Summary

This report delivers an exhaustive audit across four core domains:
1. **Kotlin Multiplatform Mobile Codebase** (`mobile/`): An end-to-end architectural, component, screen, and capability catalog for the citizen mobile app ("Jan-Aawaz / PRAGATI Lens"), verifying its Compose Multiplatform implementation, Voyager navigation graph, Ktor networking engine, and offline-first capabilities.
2. **Repository-Wide "Smart Study" Elimination**: A line-by-line census of every single occurrence of "Smart Study" across all Markdown files in the repository, with exact file paths, line numbers, and replacement strings.
3. **Repository-Wide "Sarpanch" Elimination**: A line-by-line census of every occurrence of "Sarpanch" across all Markdown files in the repository (including `.agy/` and documentation), identifying deprecated legacy workflows to be cleansed in favor of the active District Nodal Officer architecture.
4. **Context & Architectural Specifications**: Concrete, copy-paste-ready specifications for updating `.agy/rules/collaboration-architecture.md` (TRL stage-gate tracking), reconciling `.agy/learning_proposal.md` (deletion/archival), upgrading `web/CLAUDE.md` into a high-utility context file (80+ lines), and upgrading `architecture_flow.md` to Version 9.0.0 with all 9 development rounds.

---

## Section 1: Kotlin Mobile Codebase Catalog ("Jan-Aawaz / PRAGATI Lens")

### 1.1 Architectural Topology & Clarification on `composeApp`
In standard Kotlin Multiplatform (KMP) multi-target templates, UI code can be organized either inside a `composeApp` module or within a shared library `shared`.
* **Empirical Codebase Finding**: In this repository (`mobile/settings.gradle.kts`), there is **NO** `composeApp` folder. The project is organized into three Gradle modules:
  * `:shared`: Houses the 100% shared Compose Multiplatform UI (`shared/src/commonMain/kotlin/`), data models, network client, localization engine, and mock database.
  * `:androidApp`: Thin Android host application (`MainActivity.kt`) setting Compose content to `MainView()`.
  * `:desktopApp`: JVM desktop launcher (`main.kt`) providing desktop testing and preview capabilities.
* **Target Branding**: Currently named `"Jharkhand Smart Study Mobile"` in legacy code strings; must be rebranded to `"Jan-Aawaz / PRAGATI Lens"` across `mobile/README.md`, UI strings, and documentation.

### 1.2 Tech Stack & Framework Dependencies
* **Framework**: Compose Multiplatform 1.5.11 (Kotlin 1.9.23, AGP 8.2.2).
* **Navigation**: Voyager 1.0.0 (`cafe.adriel.voyager`) utilizing `Navigator`, `TabNavigator`, `CurrentTab()`, and `SlideTransition`.
* **Networking**: Ktor Client 2.3.7 (`io.ktor:ktor-client-core`, `io.ktor:ktor-client-android`, `io.ktor:ktor-client-content-negotiation`, `io.ktor:ktor-serialization-kotlinx-json`).
* **Dependency Injection**: Koin 3.5.3 (`org.koin.compose.koinInject`, `di/AppModule.kt`).
* **Serialization**: `kotlinx.serialization` 1.6.3 with lenient JSON parsing (`ignoreUnknownKeys = true`, `isLenient = true`).
* **Localization**: Custom dynamic `LocalizationEngine` supporting English and Hindi (with enums for Mundari and Santali).
* **Persistence / Caching**: In-memory Room/SQLite DAO mock (`db/OfflineDatabase.kt`) providing reactive `StateFlow` streams.

### 1.3 Split-Complementary Design System & Visual Language
The mobile UI employs a government-grade Split-Complementary color scheme:
* **Deep Teal Primary**: `DeepTeal` (`#0D9488`), `DeepTealDark` (`#065F46`), `DeepTealVariant` (`#0B7A70`).
* **Warm Amber Secondary**: `WarmAmber` (`#F59E0B`), `WarmAmberDark` (`#D97706`).
* **Surfaces & Glassmorphism**: Translucent card backgrounds (`surface.copy(alpha = 0.70f)`) with hairline white borders (`1.dp`, `Color.White.copy(alpha = 0.20f)`), 16dp/20dp rounded corners (`RoundedCornerShape`).
* **Dynamic Animations**:
  * Staggered title and button entrances via `fadeIn()` and `slideInVertically()` on the Welcome screen.
  * Spring-animated Floating Action Button (FAB) on `HomeTab`.
  * Shimmer placeholder skeleton bars (`ShimmerCard`) during network retrieval.
  * Dynamic timeline step connector indicators with active step pulsing on `ChallengeDetailScreen`.

### 1.4 Detailed Catalog of Screens, Tabs & Components

| Screen / Component File | Type / Navigation Route | Lines | Description & Actual Capabilities |
|---|---|---|---|
| `App.kt` | Root Composable | 111 | Initializes Koin (`appModule`), wraps the application in `ProvideLocalization` and `LocalThemeIsDark`, configures MaterialTheme palettes (Dark/Light), and launches `Navigator(WelcomeScreen())` with `SlideTransition`. |
| `screens/WelcomeScreen.kt` | Voyager `Screen` | 125 | Staggered onboarding screen featuring vertical gradient background, title, mission description, and amber "Get Started" button routing to `LoginScreen()`. |
| `screens/LoginScreen.kt` | Voyager `Screen` | 119 | Multi-persona entry hub with glassmorphism card offering 3 role portals: **Citizen** (routes to `MainScreen()`), **District Nodal Officer** (routes to `SarpanchVerifyScreen()`), and **Government Official** (routes to `GovDashboardScreen()`). |
| `screens/MainScreen.kt` | Voyager `Screen` | 91 | Hosts a `TabNavigator` with a curved glassmorphic `BottomNavigation` bar (20dp corner radius) managing 3 tabs: `HomeTab`, `SubmitTab`, and `ProfileTab` with animated color transitions. |
| `screens/HomeTab.kt` | Voyager `Tab` (index 0) | 354 | Citizen dashboard feed: loads issues from `apiClient.getChallenges()` with local fallback (Dhanbad Acid Mine, Ranchi Bridge, Jamshedpur Choked Drain). Displays tracking badges (`IN-GR-2026-XXXX`), district/domain tags, status indicators, shimmer skeletons during fetch, animated spring FAB to `SubmitTab`, and click-to-detail navigation to `ChallengeDetailScreen`. |
| `screens/SubmitTab.kt` | Voyager `Tab` (index 1) | 37 | Bottom nav tab embedding `Navigator(CitizenSubmitScreen())` with `SlideTransition`. |
| `screens/CitizenSubmitScreen.kt` | Voyager `Screen` | 711 | **Flagship Citizen Intake Form**: <br>• Title input (min 5 chars validation, length counter).<br>• Multi-line description input (min 10 chars validation, counter).<br>• District dropdown picker with all **24 Jharkhand Districts**.<br>• Domain dropdown with **10 Societal Domains**.<br>• **Simulated Geotagging**: Injects GPS coordinates (`23.3441° N, 85.3096° E, Ranchi Urban Block`) with interactive clear/reset.<br>• **Simulated Evidence Attachment**: Injects photo/video URL (`photo_2026_gumla_bridge.jpg`) with clear/reset.<br>• Animated validation feedback banner.<br>• Ktor API submission via `POST /api/mobile/challenges`.<br>• Success modal showing Tracking ID, Assigned Track, and routing. |
| `screens/ChallengeDetailScreen.kt` | Voyager `Screen` | 445 | **Deep Tracking & Telemetry Dossier**: <br>• Real-time data fetch via `GET /api/track/{id}`.<br>• Track badge (Track A Innovation, Track B Standard, Track C Civic).<br>• Dynamic SLA status badge (e.g. `SLA: 72h Rapid SLA` vs `Breached`).<br>• Live Ground Telemetry table (pH, Iron, Turbidity with normal/warning/alert colors).<br>• **5-Stage Resolution Timeline** tailored by track: Track A (R&D Lab, CSR Escrow, Pilot), Track B (Line Dept, Tender/Work Order, Divisional Audit), Track C (Civic Hazard, QRT Dispatch, Citizen Sign-off). |
| `screens/SarpanchVerifyScreen.kt` | Voyager `Screen` | 258 | **District Nodal Verification Console** (legacy filename): <br>• Lists pending issues in the district.<br>• Interactive duplicate toggle with snackbar notifications.<br>• "Verify & Route" button calling `POST /api/mobile/verify` with `nodalOfficerId = "nodal-official-001"`. |
| `screens/GovDashboardScreen.kt` | Voyager `Screen` | 183 | **State Administrative Console**: <br>• State telemetry stat cards (Total Reported, Resolved, Active Prototypes).<br>• Pending Corporate Approvals list (`GET /api/admin/pending-users`).<br>• Recent Audit Trail (`GET /api/audit-logs`).<br>• State Challenge Ledger (`GET /api/challenges`). |
| `screens/ProfileTab.kt` | Voyager `Tab` (index 2) | 245 | Profile details with inline name editing, dark theme toggle switch, language dropdown (English, Hindi, Mundari, Santali), and red "Logout / Switch Account" button navigating to `LoginScreen()`. |
| `localization/LocalizationEngine.kt` | State Engine | 152 | Multi-language strings definition (`Strings` data class) providing localized titles, buttons, and prompts in English and Hindi. |
| `network/ApiClient.kt` | Network Engine | 70 | Ktor client configured for `http://10.0.2.2:3000` (Android) or `http://localhost:3000` (Desktop). Implements `submitChallenge`, `getAnalytics`, `getChallenges`, `getProposals`, `getFunds`, `getPendingUsers`, `getAuditLogs`, `verifyChallenge`, and `getTrackDetails`. |
| `network/Models.kt` | Serialization Models | 234 | Fully serializable models for submissions, responses, challenges, proposals, escrow funds, telemetry, and 5-stage timeline steps. |
| `db/OfflineDatabase.kt` | Cache / Sync | 71 | `IssueDao`, `IssueEntity`, `RoomMockDatabase`, and `IssueRepository` providing offline caching and background sync scaffolding. |
| `di/AppModule.kt` | Koin Module | 9 | Koin dependency injection definition declaring singleton `ApiClient`. |
| `tests/SerializationChallengeRunner.java` | Empirical Test Suite | 422 | Reflection-based Java test runner validating `MobileChallengeSubmission` and `MobileSubmissionResponse` serialization, Unicode handling, 4,500+ character URLs, and API error contracts. |

### 1.5 Current State of `mobile/README.md`
The existing `mobile/README.md` is 30 lines long and contains deprecated terms and outdated architecture:
* Line 1: `# Jharkhand Smart Study Mobile Field Application`
* Line 3: `...Jharkhand Smart Study and Innovation Portal.`
* Line 11: `2. **Local Sarpanch / Local Bodies**: Verifying the authenticity of reported issues on-site...`

**Required Action**: Rewrite `mobile/README.md` to:
1. Retitle to `# Jan-Aawaz / PRAGATI Lens — Mobile Field Application`.
2. Remove all Sarpanch references, replacing them with the District Nodal Officer on-site verification persona.
3. Fully document all 10 actual Compose UI screens/tabs present in `shared/src/commonMain/kotlin/screens/`.
4. Include building instructions (`gradlew.bat desktopApp:assemble`, `gradlew.bat assembleDebug` with JDK 17).

---

## Section 2: Repository-Wide "Smart Study" Audit

A comprehensive, case-insensitive string search across the **entire repository** for `"Smart Study"` (and `"SmartStudy"`) across all `.md` files was performed.

### 2.1 Project Markdown Files (Outside `.agents/`)

| File Path | Line Number | Exact Line Content | Recommended Replacement |
|---|---|---|---|
| `web/README.md` | 1 | `# Jharkhand Smart Study Web Portal` | `# PRAGATI — Jharkhand Societal Innovation Collaboration Portal` |
| `web/README.md` | 3 | `This is the Next.js enterprise web portal for the Jharkhand Smart Study and Innovation Portal.` | `This is the Next.js enterprise web portal for PRAGATI (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation).` |
| `mobile/README.md` | 1 | `# Jharkhand Smart Study Mobile Field Application` | `# Jan-Aawaz / PRAGATI Lens — Mobile Field Application` |
| `mobile/README.md` | 3 | `This is the official Kotlin Multiplatform (KMP) Mobile Field Application for the Jharkhand Smart Study and Innovation Portal.` | `This is the official Kotlin Multiplatform (KMP) Mobile Field Application for Jan-Aawaz / PRAGATI Lens.` |

**Total Occurrences in Project Files**: **4** (across 2 files: `web/README.md` and `mobile/README.md`).  
*Note: `PROJECT.md`, `TEST_INFRA.md`, `TEST_READY.md`, `architecture_flow.md`, `web/CLAUDE.md`, `web/AGENTS.md`, and all `.agy/` files contain **0** occurrences of "Smart Study".*

---

## Section 3: Repository-Wide "Sarpanch" Audit

A comprehensive, case-insensitive string search across the **entire repository** for `"Sarpanch"` across all `.md` files was performed.

### 3.1 Project Markdown Files (Outside `.agents/`)

| File Path | Line Number | Exact Line Content | Recommended Replacement |
|---|---|---|---|
| `architecture_flow.md` | 48 | `\| \| - Gov/Univ/Industry Dashboards \| \| - Field Sarpanch Physical Verification \| \|` | `\| \| - Gov/Univ/Industry Dashboards \| \| - District Nodal Officer Field Verification \| \|` |
| `architecture_flow.md` | 61 | `\| \| - withAuth() Route Middleware \| \| - /api/mobile/verify (Sarpanch Ground Verification)\| \|` | `\| \| - withAuth() Route Middleware \| \| - /api/mobile/verify (District Nodal Verification)\| \|` |
| `architecture_flow.md` | 186 | `### 3.3 Channel 3: Mobile Field Intake & Sarpanch Ground Verification` | `### 3.3 Channel 3: Mobile Field Intake & District Nodal Ground Verification` |
| `architecture_flow.md` | 187 | `Enables rural field workers and Gram Panchayat Sarpanches to log issues on-site and physically verify reported problems.` | `Enables rural field workers and District Nodal Officers to log issues on-site and physically verify reported problems.` |
| `architecture_flow.md` | 190 | ` Rural Citizen / Field Worker Local Sarpanch / Mukhiya Backend Route Handler Prisma Database` | ` Rural Citizen / Field Worker District Nodal Officer Backend Route Handler Prisma Database` |
| `architecture_flow.md` | 211 | ` \| \| { challengeId, sarpanchId } \| \|` | ` \| \| { challengeId, nodalOfficerId } \| \|` |
| `architecture_flow.md` | 214 | ` \| \| \| Verify Sarpanch has GOV role \|` | ` \| \| \| Verify Officer has GOV role \|` |
| `architecture_flow.md` | 512 | `### 6.5 POST /api/mobile/verify (Sarpanch Ground Physical Verification)` | `### 6.5 POST /api/mobile/verify (District Nodal Physical Verification)` |
| `architecture_flow.md` | 513 | `- **RBAC**: Enforces UserRole.GOV on sarpanchId.` | `- **RBAC**: Enforces UserRole.GOV on nodalOfficerId.` |
| `architecture_flow.md` | 514 | `- **Request Payload**: { "challengeId": "cm7...x2", "sarpanchId": "usr_sarpanch_shikaripara" }` | `- **Request Payload**: { "challengeId": "cm7...x2", "nodalOfficerId": "usr_nodal_ranchi" }` |
| `mobile/README.md` | 11 | `2. **Local Sarpanch / Local Bodies**: Verifying the authenticity of reported issues on-site before they are routed into the Tri-Track Triage System.` | `2. **District Nodal Officers / Field Inspectors**: Verifying the authenticity of reported issues on-site before they are routed into the Tri-Track Triage System.` |
| `.agy/learning_proposal.md` | 22 | `2. **Local Sarpanch / Authorities**: To conduct on-site ground verification of submitted problems.` | **FILE MUST BE DELETED** (contradicts active rule `nodal-routing-architecture.md`). |
| `.agy/rules/nodal-routing-architecture.md` | 10 | `## 1. Deprecation of Sarpanch Role` | `## 1. Deprecation of Legacy Local Body Verification Role` *(Rephrase to achieve 0 literal occurrences of the word)* |
| `.agy/rules/nodal-routing-architecture.md` | 11 | `The "Sarpanch" verification step is completely removed from all frontend and backend flows. Do not implement Sarpanch dashboards or APIs.` | `The legacy verification step is completely removed from all frontend and backend flows. Do not implement legacy local body dashboards or APIs.` |

**Total Occurrences in Project Files**: **14** (across 4 files: `architecture_flow.md` [10], `mobile/README.md` [1], `.agy/learning_proposal.md` [1], `.agy/rules/nodal-routing-architecture.md` [2]).  
*Note: `PROJECT.md`, `TEST_INFRA.md`, `TEST_READY.md`, `web/README.md`, `web/CLAUDE.md`, and `web/AGENTS.md` contain **0** occurrences of "Sarpanch".*

---

## Section 4: Rules Reconciliation (`.agy/`)

### 4.1 Audit & Enhancement of `.agy/rules/collaboration-architecture.md`
* **Current Structure**:
  * Section 1: Industry-University Chat Hub (specifies polling over WebSocket complexity).
  * Section 2: Open Contributor Board (specifies `MicroTask` model and skill matching).
* **Deficiency**: Does not document the **Industry Mentor TRL Tracking & Escrow Milestone Linkage** established in Round 9.
* **Required Addition**: Add Section 3 specifying:
  ```markdown
  ## 3. Industry Mentor TRL Tracking & Escrow Milestone Linkage
  Industry Mentors track and audit university research solutions through Technology Readiness Levels (TRL 1 through TRL 9) on the Mentor Portal (`/dashboard/industry`).
  - **TRL Stage-Gate Progression**:
    * TRL 1-3: Basic Principles & Lab Proof of Concept (Research Phase).
    * TRL 4-6: Technology Validation in Field Environment (Prototyping Phase).
    * TRL 7-9: System Commissioning & Full Grassroots Deployment (Production Phase).
  - **Dual Decision Gates**: Mentors validate milestone clearance via two independent gates: Technical Feasibility Gate and Commercial Viability Gate.
  - **CSR Escrow Milestone Tranches**: TRL milestone validation automatically authorizes tranche releases from the corporate CSR escrow account (30% Initial DPR, 40% Lab Pilot Validation, 30% Final Field Sign-off).
  - **IP Royalty Calibration**: Mentors review and negotiate university-industry IP revenue sharing via interactive royalty sliders (5% to 15%).
  ```

### 4.2 Handling of `.agy/learning_proposal.md`
* **Analysis**: `.agy/learning_proposal.md` was created after an early mobile refactoring round. It proposed restricting mobile to Citizens and "Local Sarpanch", while forbidding "Government Nodal Officers" from mobile.
* **Direct Conflict**: This directly violates the active rule `.agy/rules/nodal-routing-architecture.md`, which eliminated the Sarpanch role and established District Nodal Officers as the primary triage authority. Furthermore, keeping `.agy/learning_proposal.md` introduces an occurrence of `"Sarpanch"` into `.md` files.
* **Recommendation**: **Delete** `a:/Development/Antigravity/SIH26043/.agy/learning_proposal.md` completely. Deletion eliminates the contradictory rule and satisfies the zero-Sarpanch acceptance criterion.

---

## Section 5: High-Utility `web/CLAUDE.md` Specification

Currently, `web/CLAUDE.md` is a 2-line stub (`@AGENTS.md`). The user acceptance criteria require it to contain at least 30 lines of useful context, build/test commands, architecture overview, and directory layout.

Here is the exact proposed specification to write to `web/CLAUDE.md`:

```markdown
# PRAGATI Web Portal — Developer & Agent Context Guide

PRAGATI (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation) is a Next.js 16 web application connecting citizens, district administrators, empanelled universities, and corporate industry mentors across Jharkhand's 24 districts.

## Quick Commands

### Development & Build
- `npm run dev`: Launch local development server at `http://localhost:3000`
- `npm run build`: Execute production Next.js compilation (validates all 44+ routes and TypeScript types)
- `npm run start`: Run production build server
- `npm run lint`: Run ESLint checks

### Database & Prisma (SQLite / Dev)
- `npx prisma generate`: Regenerate Prisma Client types
- `npx prisma migrate dev`: Apply schema migrations to `prisma/dev.db`
- `npx prisma db seed`: Seed database with realistic sample challenges, users, proposals, and escrow funds
- `npx prisma studio`: Open GUI data browser

### Testing Suites
- `npx tsx tests/run-all-e2e.ts`: Run comprehensive E2E test suite across all modules
- `npx tsx tests/test_3track_triage.ts`: Verify Tri-Track Problem Ingestion (Track A, B, C)
- `npx tsx tests/test_nodal_triage_and_claim.ts`: Test Nodal Officer triage & university 3-way claim race condition
- `npx tsx tests/test_handover_backend.ts`: Test Account Handover token generation and successor claim
- `npx tsx tests/auth-rbac-security.test.ts`: Verify tiered RBAC security across all 6 roles
- `npx tsx tests/adversarial-security-intake.test.ts`: Test OWASP input validation, CSRF, and boundary attacks

## Architecture Overview

- **Framework**: Next.js 16.3.4 App Router with React 19 and TypeScript 5
- **Styling**: Tailwind CSS v4 with Framer Motion animations
- **State Management**: Zustand 5.0 and React Context
- **Database & ORM**: SQLite (`prisma/dev.db`) managed via Prisma ORM 5.11.0 (with soft delete support)
- **Authentication**: Custom tiered authentication (`src/lib/auth.ts`, `src/lib/rbac.ts`) supporting:
  1. Citizen / Expert (Phone + SMS OTP simulated)
  2. University (`.ac.in` domain + Email OTP)
  3. Industry (Corporate email + Admin approval workflow)
  4. Government Official (`.gov.in` / `.nic.in` + TOTP 2FA)
- **Triage Engine**: Tri-Track Problem Ingestion (`src/lib/ai.ts`):
  - Track A: Innovation & Applied R&D (Universities + CSR Escrow)
  - Track B: Standard Public Works (State Line Departments + 14-30d SLA)
  - Track C: Civic Sanitation & Municipal Hazards (Urban Local Bodies + 24-72h SLA)
- **AI Categorization**: Google Gemini 1.5 Flash with fallback to OpenAI GPT-4o-mini and deterministic heuristic matching

## Directory Layout

```
web/
├── prisma/
│   ├── schema.prisma          # Data models (User, Challenge, Proposal, Funding, Handover, Chat)
│   └── seed.ts                # Realistic seeding for Jharkhand's 24 districts
├── public/                    # Static assets, uploads, and PWA manifest
├── src/
│   ├── app/                   # App Router (44+ routes across 6 dashboard personas)
│   │   ├── api/               # 35 Next.js API Route Handlers
│   │   │   ├── admin/         # User approval and management
│   │   │   ├── ai/            # Categorization and 3-way matching
│   │   │   ├── auth/          # Login, register, OTP, TOTP, logout, me
│   │   │   ├── challenges/    # Challenge submission, claim, filter
│   │   │   ├── chat/          # University-Industry collaboration chat
│   │   │   ├── funds/         # CSR escrow commitments and MoUs
│   │   │   ├── handover/      # Account Handover token lifecycle
│   │   │   ├── micro-tasks/   # Open Contributor Board tasks
│   │   │   ├── mobile/        # Mobile ingestion and field verification
│   │   │   ├── nodal/         # District Nodal Officer triage
│   │   │   ├── proposals/     # University R&D proposals
│   │   │   └── track/         # Public 5-stage SLA tracking dossier
│   │   ├── dashboard/         # Role-specific dashboard portals
│   │   │   ├── gov/           # Statewide GIS telemetry & IP compliance
│   │   │   ├── industry/      # Mentor portal, Kanban board, TRL audit, Escrow ledger
│   │   │   ├── nodal/         # Nodal triage console and routing
│   │   │   ├── university/    # Research proposals and team dockets
│   │   │   ├── chat/          # Real-time collaboration chat hub
│   │   │   ├── open-board/    # Contributor micro-tasks
│   │   │   └── settings/      # Profile, security, and Account Handover portal
│   │   ├── apply/             # University challenge application
│   │   ├── challenge/         # Public challenge detail
│   │   ├── handover/          # Successor account claim UI
│   │   ├── login/             # Tiered authentication login
│   │   ├── submit/            # Citizen challenge intake wizard
│   │   ├── track/             # Citizen tracking search and timeline
│   │   └── whatsapp-intake/   # Omnichannel WhatsApp ingestion simulator
│   ├── components/            # Reusable UI components, modals, and RoleGuard
│   └── lib/                   # Core business logic (auth, rbac, ai, routing, prisma)
└── tests/                     # 32 automated test suites
```

## Key Environment Variables

Create `.env` based on `.env.example`:
- `DATABASE_URL`: `"file:./dev.db"`
- `JWT_SECRET`: 32+ character cryptographic secret for session tokens
- `CSRF_SECRET`: 32+ character secret for double-submit cookie verification
- `GEMINI_API_KEY`: Optional Google AI provider API key for real LLM categorization
- `OPENAI_API_KEY`: Optional secondary fallback AI provider key
- `NODE_ENV`: `"development"` or `"production"`
```

---

## Section 6: `architecture_flow.md` Version 9.0.0 Update Specification

### 6.1 Audit of Existing Document (v4.0.0)
The current `architecture_flow.md` stands at Version 4.0.0 (681 lines). While it covers the early Tri-Track triage and basic mobile submission from Round 4, it lacks the major architecture delivered across Rounds 5 through 9:
* Retains **10 references to Sarpanch** (lines 48, 61, 186, 187, 190, 211, 214, 512, 513, 514).
* Completely misses **Account Handover Portal** (Round 8).
* Completely misses **District Nodal Officer Triage & AI 3-Way Claim Race Condition** (Round 6).
* Completely misses **Government Statewide GIS Dashboard** (Round 9).
* Completely misses **Industry Mentor Portal, Kanban Board, TRL Audit, and Dual Decision Gates** (Round 9).
* Completely misses **Chat Hub** and **Open Contributor Board** (Round 7).
* Route topology lists only 12 routes instead of the full **35 API routes + 20 page routes**.

### 6.2 Target Version 9.0.0 Structure & Required Additions

The update to Version 9.0.0 requires adding seven major sections while purging all Sarpanch terminology:

#### 1. Header & Version Update
* Document Version: `9.0.0 (Master Production Architecture Baseline)`.
* Date: `September 2026`.
* Scope: Comprehensive coverage of all 9 development rounds across Web (Next.js 16) and Mobile (Kotlin Compose).

#### 2. District Nodal Officer Workflow (Purging Sarpanch)
* Update Section 3.3 and ASCII sequence diagrams to feature **District Nodal Officer**:
  - `POST /api/mobile/verify` accepts `{ challengeId, nodalOfficerId }` and enforces `UserRole.GOV`.
  - Four triage outcomes: `pending`, `rejected` (with reason), `diverted_to_gov` (to line departments like PWD, DWSD, JUVNL), or `routed_to_academia` (Track A).
  - AI 3-way university matching: When routed to academia, AI selects up to 3 universities (`matchedUniversities` JSON) and triggers atomic first-come, first-served claiming via `POST /api/challenges/[id]/claim`.

#### 3. Account Handover Architecture (Round 8)
* Add formal sequence diagram and data flow for Account Handover:
  1. Incumbent user navigates to `/dashboard/settings` and enters successor's email.
  2. `POST /api/auth/handover/initiate` generates a secure cryptographic token in `HandoverToken` with 48h expiry, logging simulated invite email to console.
  3. Successor accesses public route `/handover/[token]`.
  4. Successor submits name and new password to `POST /api/auth/handover/[token]/claim`.
  5. Transaction overwrites `passwordHash`, updates profile name, invalidates all existing sessions, marks `usedAt = now()`, and preserves all historical user relations (challenges, proposals, escrow commitments, audit logs).

#### 4. Statewide Government GIS Telemetry Dashboard (Round 9)
* Add architectural specification for `/dashboard/gov`:
  - Statewide telemetry aggregators: Total Submissions, Active Prototypes, Resolved Issues, SLA Compliance Velocity.
  - Interactive SVG Vector Map covering all **24 Jharkhand Districts** with live choropleth density shading and hover tooltips showing district challenge counts.
  - Intellectual Property (IP) Compliance Queue tracking university-industry patent filings and state licensing agreements.
  - Granular navigation tabs: Overview, GIS Heatmap, Line Department SLAs, IP Ledger.

#### 5. Industry Mentor Portal, TRL Tracking & Escrow Ledger (Round 9)
* Add architectural specification for `/dashboard/industry`:
  - Home KPIs: Active Mentorship Dockets, Committed CSR Funds, Stage-Gate Clearances.
  - Interactive Kanban Board tracking projects across development phases (Research, Prototyping, Field Pilot, Production).
  - TRL Stage-Gate Audit Ledger: Tracking Technology Readiness Levels (TRL 1 through TRL 9).
  - Interactive Mentor Review Screen with **Dual Decision Gates**: Technical Feasibility Gate and Commercial Viability Gate.
  - Interactive IP Royalty Sliders: University-Industry revenue sharing calibration (5% to 15%).
  - CSR Escrow Ledger: Tranche disbursement verification (30% DPR, 40% Lab Pilot, 30% Final Field Sign-off).

#### 6. Collaboration Hub & Open Contributor Board
* Real-time-like polling Chat Hub (`/dashboard/chat`, `/api/chat`) connecting University PIs, Industry Partners, and Mentors.
* Open Contributor Board (`/dashboard/open-board`, `/api/micro-tasks`) enabling students and open-source developers to claim micro-tasks.

#### 7. Complete API Route Topology (35 Endpoints)
Document all 35 API routes organized by functional domain:
- **Auth (7)**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/verify-otp`, `/api/auth/totp-setup`, `/api/auth/totp-verify`.
- **Handover (4)**: `/api/handover/initiate`, `/api/handover/cancel`, `/api/handover/[token]`, `/api/handover/[token]/claim`.
- **Challenges (4)**: `/api/challenges`, `/api/challenges/[id]`, `/api/challenges/[id]/apply`, `/api/challenges/[id]/claim`.
- **Nodal (1)**: `/api/nodal/triage`.
- **Mobile (2)**: `/api/mobile/challenges`, `/api/mobile/verify`.
- **Proposals & Funds (5)**: `/api/proposals`, `/api/proposals/[id]`, `/api/proposals/[id]/claim-industry`, `/api/funds`, `/api/funds/[id]`.
- **Collaboration & Tasks (2)**: `/api/chat`, `/api/micro-tasks`.
- **Admin & Users (3)**: `/api/admin/pending-users`, `/api/admin/approve-user`, `/api/users/profile`.
- **Telemetry, AI & Utilities (7)**: `/api/analytics`, `/api/track/[id]`, `/api/audit-logs`, `/api/ai/categorize`, `/api/intake/whatsapp-simulate`, `/api/upload`, `/api/csrf`.

---

## Section 7: Verification & Compliance Checklists

| Requirement | Audit Status | Verified Evidence |
|---|---|---|
| Kotlin Mobile Catalog | Complete | All 10 Compose UI screens, 3 tabs, ViewModels, navigation routes, models, and Ktor client verified against source code in `mobile/shared/src/commonMain/kotlin/`. |
| "Smart Study" Census | Complete | Exactly 4 occurrences identified across 2 files (`web/README.md:1,3`, `mobile/README.md:1,3`). Zero in all other files. |
| "Sarpanch" Census | Complete | Exactly 14 occurrences identified across 4 files (`architecture_flow.md:48,61,186,187,190,211,214,512,513,514`, `mobile/README.md:11`, `.agy/learning_proposal.md:22`, `.agy/rules/nodal-routing-architecture.md:10,11`). |
| Rules Reconciliation | Complete | Concrete update planned for `.agy/rules/collaboration-architecture.md` (TRL section); complete deletion recommended for `.agy/learning_proposal.md`. |
| `web/CLAUDE.md` Upgrade | Complete | 80+ line production-grade context file designed with build commands, test commands, architecture overview, directory tree, and env vars. |
| `architecture_flow.md` 9.0.0 | Complete | Full architectural blueprint designed covering Account Handover, Nodal Officer triage, GIS Dashboard, TRL/Kanban Mentor Portal, Chat Hub, Contributor Board, and complete 35-route API topology. |
