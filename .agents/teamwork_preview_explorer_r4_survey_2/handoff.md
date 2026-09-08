# Mobile Kotlin Application & Gradle Survey Report

## 1. Observation

### 1.1 Project Structure & Build Configuration
- **Root Path**: `a:/Development/Antigravity/SIH26043/mobile`
- **Gradle Structure**:
  - `mobile/settings.gradle.kts`: Configures root project `MyApplication`, includes `:androidApp`, `:shared`, `:desktopApp`. Declares plugin repositories (`gradlePluginPortal()`, `mavenCentral()`, `google()`, `maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")`).
  - `mobile/build.gradle.kts`: Root build script registering `kotlin("multiplatform")`, `id("com.android.application")`, `id("com.android.library")`, and `id("org.jetbrains.compose")` with `apply(false)`.
  - `mobile/gradle.properties`:
    - `kotlin.version=1.9.21`
    - `agp.version=8.0.2`
    - `compose.version=1.5.11`
    - `android.compileSdk=34`
    - `android.targetSdk=34`
    - `android.minSdk=24`
    - `org.gradle.jvmargs=-Xmx2048M -Dkotlin.daemon.jvm.options="-Xmx2048M"`
  - `mobile/gradle/wrapper/gradle-wrapper.properties`:
    - `distributionUrl=https\://services.gradle.org/distributions/gradle-8.11-bin.zip`
  - `mobile/local.properties`: Sets `sdk.dir=C\:\\Users\\vinod\\AppData\\Local\\Android\\Sdk`.
  - `mobile/androidApp/build.gradle.kts`: Android application module applying `kotlin("multiplatform")`, `id("com.android.application")`, `id("org.jetbrains.compose")`, target SDK 34, min SDK 24, compile SDK 34, JVM toolchain 17 (`JavaVersion.VERSION_17`). Depends on `project(":shared")`.
  - `mobile/shared/build.gradle.kts`: Kotlin Multiplatform library with targets `androidTarget()`, `jvm("desktop")`, and iOS targets (`iosX64()`, `iosArm64()`, `iosSimulatorArm64()`).
    - Dependencies in `commonMain`:
      - Compose runtime, foundation, material, components.resources (1.5.11)
      - Koin Core & Compose: `io.insert-koin:koin-core:3.5.3`, `io.insert-koin:koin-compose:1.1.2`
      - Ktor 2.3.7: `io.ktor:ktor-client-core`, `io.ktor:ktor-client-content-negotiation`, `io.ktor:ktor-serialization-kotlinx-json`
      - Kotlinx Serialization JSON: `org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2`
      - Voyager Navigator 1.0.0: `cafe.adriel.voyager:voyager-navigator`, `voyager-transitions`, `voyager-koin`
    - Platform-specific HTTP engines:
      - `androidMain`: `io.ktor:ktor-client-android:2.3.7`, AndroidX `activity-compose:1.7.2`, `appcompat:1.6.1`, `core-ktx:1.10.1`
      - `iosMain`: `io.ktor:ktor-client-darwin:2.3.7`
      - `desktopMain`: `io.ktor:ktor-client-cio:2.3.7`, `compose.desktop.common`

### 1.2 Acceptance Criteria Command Execution
- Command: `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"`
- Execution from `a:/Development/Antigravity/SIH26043/mobile`:
  - **Result**: `BUILD SUCCESSFUL in 21s` (incremental), `BUILD SUCCESSFUL in 44s` (clean build with `gradlew clean assembleDebug`).
  - **Exit Code**: `0`.
  - **Artifacts Produced**:
    - `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`
    - `mobile/shared/build/outputs/aar/shared-debug.aar`
- **Warnings Observed during build**:
  1. AGP Compatibility:
     ```
     WARNING: We recommend using a newer Android Gradle plugin to use compileSdk = 34
     This Android Gradle plugin (8.0.2) was tested up to compileSdk = 33.
     To suppress this warning, add/update android.suppressUnsupportedCompileSdk=34
     ```
  2. Kotlin/Native iOS Targets on Windows:
     ```
     w: The following Kotlin/Native targets cannot be built on this machine and are disabled: iosArm64, iosSimulatorArm64, iosX64
     To hide this message, add 'kotlin.native.ignoreDisabledTargets=true' to the Gradle properties.
     ```
  3. Default Hierarchy Template:
     ```
     w: The Default Kotlin Hierarchy Template was not applied to 'project ':shared'':
     Explicit .dependsOn() edges were configured for the following source sets: [iosArm64Main, iosMain, iosSimulatorArm64Main, iosX64Main]
     ```

### 1.3 Mobile App Architecture
- **Entry Points**:
  - `MainActivity.kt` (`com.myapplication.MainActivity` in `mobile/androidApp/src/androidMain/kotlin/com/myapplication/MainActivity.kt`): Extends `AppCompatActivity`, sets content to `MainView()`.
  - `main.android.kt` (`mobile/shared/src/androidMain/kotlin/main.android.kt`): Defines `@Composable fun MainView() = App()`.
  - `App.kt` (`mobile/shared/src/commonMain/kotlin/App.kt`):
    - Initializes Koin DI container: `KoinApplication(application = { modules(appModule) })`.
    - Injects localization: `ProvideLocalization(localizationEngine)`.
    - Themes the UI: `MaterialTheme(colors = AppColors)` with dark slate/indigo palette (`WebBackground = 0xFF020817`, `WebSurface = 0xFF0F172A`, `WebPrimary = 0xFF3B82F6`).
    - Initializes navigation stack: `Navigator(LoginScreen()) { navigator -> SlideTransition(navigator) }`.
- **Screens & Navigation (Voyager 1.0.0)**:
  - `LoginScreen.kt` (`screens/LoginScreen.kt`): Contains buttons for "Login as Government", "Login as University", and "Login as Industry".
  - `GovDashboardScreen.kt` (`screens/GovDashboardScreen.kt`): Renders stat cards (Total Reported, Resolved, Active Prototypes), pending user approvals, audit log items, and challenge ledger items.
  - `UniversityDashboardScreen.kt` (`screens/UniversityDashboardScreen.kt`): Renders Open RFP count, submitted proposals, funded proposals count, research proposals list, and available challenges.
  - `IndustryDashboardScreen.kt` (`screens/IndustryDashboardScreen.kt`): Renders active proposals, total escrow amount, active pledges, escrow commitments list, and CSR proposals.
- **Networking (`ApiClient.kt`)**:
  - Located at `mobile/shared/src/commonMain/kotlin/network/ApiClient.kt`.
  - Uses Ktor `HttpClient` with `ContentNegotiation(json)`.
  - Hardcoded base URL: `http://10.0.2.2:3000/api` (Android emulator loopback host address).
  - Methods:
    - `getAnalytics()` -> `GET /api/analytics`
    - `getChallenges()` -> `GET /api/challenges`
    - `getProposals()` -> `GET /api/proposals`
    - `getFunds()` -> `GET /api/funds`
    - `getPendingUsers()` -> `GET /api/admin/pending-users`
    - `getAuditLogs()` -> `GET /api/audit-logs`
- **Data Models (`Models.kt`)**:
  - `AnalyticsSummary`, `DomainDistribution`, `AnalyticsResponse`
  - `Challenge`, `ChallengesResponse`
  - `PendingUser`, `PendingUsersResponse`
  - `AuditLog`, `UserSimple`, `AuditLogsResponse`
  - `Proposal`, `ProposalsResponse`
  - `Fund`, `FundsResponse`

### 1.4 Problem Submission & Backend API Analysis
- **Missing Problem Submission in Mobile App**:
  - `ApiClient.kt` has no `post` methods or submission endpoints.
  - `screens/` contains no screen for reporting issues, selecting problem tracks, capturing media, or submitting problems.
  - `OfflineDatabase.kt` defines `IssueEntity`, `IssueDao`, `RoomMockDatabase`, and `IssueRepository`, but `IssueRepository.syncPendingIssues()` is an unexecuted stub (`// Mock sync logic to upstream Next.js API`).
  - `LocalizationEngine.kt` contains complete string keys for citizen reporting and sarpanch verification (`reportLocalIssue`, `captureEvidence`, `problemTitle`, `detailedDescription`, `submitToSarpanch`, `sarpanchVerification`, `pendingIssues`, `verifyAndRoute`, etc.), but these strings are not bound to any functional UI screens.
- **Existing Backend Endpoints for Mobile (`/web`)**:
  - `web/src/app/api/mobile/challenges/route.ts`:
    - Method: `POST /api/mobile/challenges`
    - Body schema: `{ title, description, district, location, reporterId, evidenceUrl? }`
    - Response: `{ success: true, trackingId, challengeId }`
  - `web/src/app/api/mobile/verify/route.ts`:
    - Method: `POST /api/mobile/verify`
    - Body schema: `{ challengeId, sarpanchId }`
    - Logic: Sarpanch RBAC verification, sets `localVerified: true`, calls `categorizeProblemWithAI`, performs deduplication, sets status to `UNDER_REVIEW`, logs audit event.

### 1.5 Identified Bugs, Errors & Deficiencies
1. **Missing Android Permissions in `AndroidManifest.xml`**:
   - `mobile/androidApp/src/androidMain/AndroidManifest.xml` lacks `<uses-permission android:name="android.permission.INTERNET" />` and `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`.
   - Lacks `android:usesCleartextTraffic="true"`. Because Ktor connects to `http://10.0.2.2:3000` (cleartext HTTP), Android 9+ will block all traffic with `IOException: Cleartext HTTP traffic to 10.0.2.2 not permitted`.
2. **JSON Deserialization Mismatch on `/api/analytics`**:
   - `web/src/app/api/analytics/route.ts` returns:
     `domainDistribution: [{ name: string, count: number }]`
   - `mobile/shared/src/commonMain/kotlin/network/Models.kt` defines:
     `data class DomainDistribution(val domain: String, val count: Int)`
   - Because `domain` does not match key `"name"` and has no default value, kotlinx.serialization throws `MissingFieldException: Field 'domain' is required for type with serial name 'network.DomainDistribution', but it was missing`.
3. **HTTP 401 Unauthorized in GovDashboardScreen**:
   - `GovDashboardScreen.kt` queries `getPendingUsers()` (`/api/admin/pending-users`) and `getAuditLogs()` (`/api/audit-logs`).
   - On the backend, both routes are protected with `withAuth(..., [UserRole.GOV])` requiring a valid `sih_session` cookie.
   - `ApiClient.kt` sends unauthenticated requests with no session cookie. The backend responds with HTTP 401 Unauthorized, causing `GovDashboardScreen` to throw `ClientRequestException` and display error `"Failed to load data: 401 Unauthorized"`.
4. **Desktop Module Redundant Duplicate Files**:
   - `mobile/desktopApp/src/desktopMain/kotlin/main.kt` and `mobile/desktopApp/src/jvmMain/kotlin/main.kt` are duplicate identical source files.

---

## 2. Logic Chain

1. **Gradle Build Health**:
   - Observations show that `gradlew assembleDebug` with `JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14` compiles both incremental and clean targets without compilation errors, producing a valid debug APK.
   - Therefore, the project build configuration is functionally viable with zero compiler errors.
2. **Runtime Viability on Android**:
   - Inspection of `AndroidManifest.xml` revealed no `<uses-permission android:name="android.permission.INTERNET" />` tag and no `android:usesCleartextTraffic="true"` attribute.
   - When an Android app attempts network calls without the `INTERNET` permission, Android runtime throws a fatal `SecurityException`.
   - Furthermore, Android 9+ (API 28+) strictly forbids cleartext HTTP without `android:usesCleartextTraffic="true"`. Since `ApiClient.kt` points to `http://10.0.2.2:3000`, all HTTP requests would fail at runtime.
3. **Data Contract Compliance**:
   - Comparing backend API payloads against Kotlin data models revealed a field name discrepancy in `DomainDistribution` (`name` in JSON vs `domain` in Kotlin data class).
   - In `kotlinx.serialization`, non-nullable fields without defaults throw `MissingFieldException` if the JSON key is absent. Thus, calling `getAnalytics()` will crash during JSON parsing unless annotated with `@SerialName("name")` or given a default.
4. **Authentication & RBAC Integration**:
   - Backend routes `/api/admin/pending-users` and `/api/audit-logs` require `UserRole.GOV` session authentication.
   - The mobile `ApiClient.kt` does not store or pass authentication cookies or headers.
   - Therefore, `GovDashboardScreen` will consistently fail to load data when interacting with a secured backend instance.
5. **3-Track Problem Triage Flow**:
   - The user requirements state that the platform must enforce a 3-track triage system: Track A (Innovation), Track B (Standard), Track C (Civic).
   - The mobile application currently lacks any UI or client methods to submit problems, let alone specify or track triage tracks.
   - Integrating mobile problem submission requires implementing client submission methods in `ApiClient.kt` that communicate with `/api/mobile/challenges` (or `/api/challenges`) with support for the 3-track triage system.

---

## 3. Caveats

- Investigation was performed in read-only analysis mode without modifying existing Kotlin source files.
- The build test was performed on Windows 11 using local JDK 17 (`C:\Users\vinod\.jdks\jbr-17.0.14`) and local Android SDK (`C:\Users\vinod\AppData\Local\Android\Sdk`). iOS targets were automatically disabled by Kotlin Multiplatform on Windows.
- Runtime UI execution was evaluated through static call graph and contract analysis rather than running on an active Android device or emulator.

---

## 4. Conclusion

The Kotlin Mobile application (`/mobile`) builds cleanly via Gradle using JDK 17, meeting the acceptance criterion for `assembleDebug`. However, there are five critical runtime, contract, and feature gaps that must be resolved for a production-ready baseline:
1. **Add `INTERNET` permission & `usesCleartextTraffic`** to `androidApp/src/androidMain/AndroidManifest.xml`.
2. **Fix `DomainDistribution` model contract** in `network/Models.kt` to map `name` or provide defaults to avoid deserialization crashes with `/api/analytics`.
3. **Address Gov Dashboard RBAC 401** either by implementing mobile session authentication or providing mobile-accessible endpoints/headers.
4. **Implement Problem Submission Flow** in `ApiClient.kt` and Compose UI to enable citizens to submit societal problems with Track A/B/C support.
5. **Clean up Gradle warnings** by adding `android.suppressUnsupportedCompileSdk=34` and `kotlin.native.ignoreDisabledTargets=true` to `gradle.properties`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Build**:
   Run from `a:/Development/Antigravity/SIH26043/mobile`:
   ```powershell
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew clean assembleDebug"
   ```
   Inspect APK generation at `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`.

2. **Verify Missing Android Manifest Permissions**:
   Inspect `mobile/androidApp/src/androidMain/AndroidManifest.xml` and confirm absence of:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```
   and absence of `android:usesCleartextTraffic="true"` in `<application>`.

3. **Verify Deserialization Contract**:
   Compare `DomainDistribution` in `mobile/shared/src/commonMain/kotlin/network/Models.kt` (lines 12-16) with `domainDistribution` payload in `web/src/app/api/analytics/route.ts` (lines 47-50).

4. **Verify RBAC Protection on Gov Routes**:
   Inspect `web/src/app/api/admin/pending-users/route.ts` (line 6) and `web/src/app/api/audit-logs/route.ts` (line 6) to verify backend `withAuth` requirement for `[UserRole.GOV]`.
