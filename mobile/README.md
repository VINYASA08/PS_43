# Jan-Aawaz / PRAGATI Lens — Mobile Field Application

This is the official Kotlin Multiplatform (KMP) Mobile Field Application for **Jan-Aawaz / PRAGATI Lens**, the grassroots field intake and verification companion for the **PRAGATI** (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation) platform across Jharkhand's 24 districts.

## Purpose & Field Personas

The mobile application is optimized for low-bandwidth rural field environments, providing an intuitive, touch-first mobile interface with offline-first caching and simulated hardware sensor integration. It serves three primary field personas:

1. **Citizens & Grassroots Reporters**: On-site reporting of grassroots challenges and civic hazards with simulated multimedia evidence (photos/videos) and automated GPS coordinate injection, tracking issue resolution dossiers via public tracking IDs (`IN-GR-2026-XXXX`).
2. **District Nodal Officers (DNO) & Field Inspectors**: On-site physical verification of reported challenges, semantic duplicate detection, and authoritative routing into the statewide Tri-Track Triage System.
3. **State Government Officials**: Mobile executive oversight of statewide telemetry, active prototype deployments, pending corporate CSR partner approvals, and statutory audit trails.

## Architecture & Technology Stack

The mobile application is built using modern Kotlin Multiplatform (KMP) targeting Android and JVM Desktop:

* **Framework:** Compose Multiplatform 1.5.11 (Kotlin 1.9.23, AGP 8.2.2)
* **Navigation:** Voyager 1.0.0 (`cafe.adriel.voyager`) utilizing `Navigator`, `TabNavigator`, `CurrentTab()`, and `SlideTransition`
* **Networking:** Ktor Client 2.3.7 (`io.ktor:ktor-client-core`, `io.ktor:ktor-client-android`, `io.ktor:ktor-client-content-negotiation`, `io.ktor:ktor-serialization-kotlinx-json`)
* **Dependency Injection:** Koin 3.5.3 (`di/AppModule.kt`, `koinInject`)
* **Serialization:** `kotlinx.serialization` 1.6.3 with lenient JSON decoding (`ignoreUnknownKeys = true`, `isLenient = true`)
* **Localization:** Custom dynamic `LocalizationEngine` supporting English and Hindi (with enums for Mundari and Santali)
* **Persistence & Cache:** In-memory Room/SQLite DAO mock (`db/OfflineDatabase.kt`) providing reactive `StateFlow` streams for offline resilience
* **Design System:** Split-Complementary palette (Deep Teal `#0D9488` primary, Warm Amber `#F59E0B` secondary), translucent glassmorphism cards (`surface.copy(alpha = 0.70f)`), 16dp/20dp rounded corners, spring-animated Floating Action Buttons (FAB), and shimmer loading skeletons (`ShimmerCard`)

## Module Structure

The project codebase is organized into three Gradle modules:

* `:shared` (`mobile/shared/`): Houses 100% shared Compose Multiplatform UI (`shared/src/commonMain/kotlin/`), domain data models, network client, localization engine, and mock database.
* `:androidApp` (`mobile/androidApp/`): Thin Android host application (`MainActivity.kt`) setting Compose content to `MainView()`.
* `:desktopApp` (`mobile/desktopApp/`): JVM desktop launcher (`main.kt`) for desktop previewing, rapid testing, and verification without an Android emulator.

## Catalog of Compose UI Screens & Tabs

The Kotlin mobile codebase (`mobile/shared/src/commonMain/kotlin/screens/`) implements 10 specialized Compose UI screens and tabs:

1. **WelcomeScreen (`screens/WelcomeScreen.kt`)**:
   - Staggered onboarding screen featuring vertical gradient background, state branding, mission overview, and animated "Get Started" CTA button navigating to `LoginScreen()`.

2. **LoginScreen (`screens/LoginScreen.kt`)**:
   - Multi-persona authentication gateway with glassmorphism card offering three role portals:
     - **Citizen**: Direct navigation to `MainScreen()` (home feed and submission).
     - **District Nodal Officer**: Direct navigation to District Verification Console for on-site triage.
     - **Government Official**: Direct navigation to `GovDashboardScreen()` for statewide administration.

3. **MainScreen (`screens/MainScreen.kt`)**:
   - Primary application scaffold hosting a `TabNavigator` with a curved glassmorphic `BottomNavigation` bar (20dp corner radius) orchestrating three tabs: `HomeTab`, `SubmitTab`, and `ProfileTab` with smooth animated color transitions.

4. **HomeTab (`screens/HomeTab.kt`)**:
   - Citizen dashboard feed loading issues from `apiClient.getChallenges()` with local fallbacks (e.g. Dhanbad Acid Mine, Ranchi Bridge, Jamshedpur Choked Drain). Displays tracking badges (`IN-GR-2026-XXXX`), district/domain tags, status indicators, shimmer skeletons during network retrieval, animated spring FAB jumping to `SubmitTab`, and click-to-detail navigation to `ChallengeDetailScreen`.

5. **SubmitTab (`screens/SubmitTab.kt`)**:
   - Dedicated Voyager tab container embedding `Navigator(CitizenSubmitScreen())` with `SlideTransition`.

6. **CitizenSubmitScreen (`screens/CitizenSubmitScreen.kt`)**:
   - Flagship grassroots problem reporting wizard featuring:
     - Title input with live character counter (minimum 5 characters validation).
     - Multi-line description input with character counter (minimum 10 characters validation).
     - District dropdown selector covering all **24 Jharkhand Districts** (Ranchi, Dhanbad, East Singhbhum, Bokaro, Palamu, Hazaribagh, Deoghar, Dumka, etc.).
     - Domain dropdown selector covering **10 Societal Domains** (Water Management, Agriculture, Healthcare, Sanitation, Clean Energy, Education, Infrastructure, Waste Management, Mining & Environment, Tribal Welfare).
     - **Simulated GPS Geotagging**: Injects live mock coordinates (`23.3441° N, 85.3096° E, Ranchi Urban Block`) with interactive clear and reset controls.
     - **Simulated Media Evidence**: Injects photo/video URL (`photo_2026_gumla_bridge.jpg`) with clear/reset controls.
     - Animated validation feedback banners and Ktor submission via `POST /api/mobile/challenges`.
     - Confirmation modal displaying generated Tracking ID, assigned triage track, and routing details.

7. **ChallengeDetailScreen (`screens/ChallengeDetailScreen.kt`)**:
   - Deep tracking and live telemetry dossier fetching live data from `GET /api/track/{id}`:
     - Track badge: Track A (Innovation), Track B (Standard Public Works), Track C (Civic Rapid Redressal).
     - Dynamic SLA status badge (e.g., `SLA: 72h Rapid SLA` vs `Breached`).
     - Live Ground Telemetry table (pH, Iron, Turbidity with normal/warning/alert color-coded thresholds).
     - **5-Stage Resolution Timeline** tailored by track:
       - *Track A (Innovation)*: R&D Lab Assignment → CSR Escrow Lock → Prototype Build → Field Pilot → Grassroots Handover.
       - *Track B (Standard Public Works)*: Line Department Route → Tender/Work Order → Field Execution → Divisional Inspection → Completion Sign-off.
       - *Track C (Civic Rapid Redressal)*: Civic Hazard Intake → QRT Dispatch → On-site Rectification → Citizen Verification → Case Closed.

8. **District Verification Console (DNO Triage)**:
   - On-site field inspection and triage console for District Nodal Officers:
     - Lists pending citizen submissions across the district.
     - Interactive duplicate detection toggle with real-time feedback snackbars.
     - Authoritative "Verify & Route" action invoking `POST /api/mobile/verify` with `nodalOfficerId` to validate citizen evidence, trigger AI categorization, and forward issues into the state triage pipeline.

9. **GovDashboardScreen (`screens/GovDashboardScreen.kt`)**:
   - Statewide executive administrative console providing:
     - Statewide telemetry stat cards: Total Reported, Resolved, and Active Research Prototypes.
     - Pending corporate industry registration clearances (`GET /api/admin/pending-users`).
     - Recent statutory system audit trail (`GET /api/audit-logs`).
     - Statewide challenge ledger with status filters (`GET /api/challenges`).

10. **ProfileTab (`screens/ProfileTab.kt`)**:
    - User account management tab featuring inline name editing, dark/light theme toggle switch, language dropdown selector (English, Hindi, Mundari, Santali), and account switch/logout action returning to `LoginScreen()`.

## Building and Running

### Prerequisites
- JDK 17 (set `JAVA_HOME` appropriately, e.g. `set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14`)
- Android SDK (API 34 / Build Tools 34.0.0) for Android builds

### Android Build
To build the debug APK:

```bash
set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14
gradlew assembleDebug
```

The compiled APK will be generated at `androidApp/build/outputs/apk/debug/androidApp-debug.apk`.

### Desktop Build & Execution
To build or launch the JVM desktop application:

```bash
gradlew.bat desktopApp:assemble
gradlew.bat desktopApp:run
```

## Backend API Integration

The mobile application communicates with the Next.js PRAGATI backend:
- Android Emulator: `http://10.0.2.2:3000`
- Desktop JVM / Host: `http://localhost:3000`

Core API endpoints consumed:
- `POST /api/mobile/challenges` — Submit grassroots challenge with GPS and media evidence
- `POST /api/mobile/verify` — District Nodal Officer on-site verification and track routing
- `GET /api/challenges` — Fetch statewide challenge ledger
- `GET /api/track/{id}` — Fetch live challenge dossier, sensor telemetry, and 5-stage SLA timeline
- `GET /api/admin/pending-users` — Fetch pending corporate registrations for government approval
- `GET /api/audit-logs` — Fetch statutory administrative audit trail