# Handoff Report: Mobile Screen & Navigation Graph Audit

**Explorer**: Survey Explorer 2 (`teamwork_preview_explorer_r7_survey_2`)  
**Working Directory**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_2`  
**Target Project**: Kotlin Multiplatform Mobile Application (`a:/Development/Antigravity/SIH26043/mobile`)  
**Parent Orchestrator**: `8534b656-72e3-43eb-908f-39e849088abf`  
**Date**: 2026-09-09T05:05:00Z  

---

## 1. Observation

### 1.1 Project Structure and Screen Inventory
The mobile application is a Kotlin Multiplatform (KMP) project targeting Android (`androidApp`), Desktop JVM (`desktopApp`), and iOS (`iosApp`), with shared Compose Multiplatform UI in `shared/src/commonMain/kotlin`.

Files directly inspected:
- Navigation & Root:
  - `shared/src/commonMain/kotlin/App.kt` (111 lines)
  - `shared/src/commonMain/kotlin/screens/MainScreen.kt` (91 lines)
  - `shared/src/desktopMain/kotlin/main.desktop.kt` (12 lines)
  - `desktopApp/src/jvmMain/kotlin/main.kt` (8 lines)
  - `desktopApp/src/desktopMain/kotlin/main.kt` (8 lines)
  - `desktopApp/build.gradle.kts` (31 lines)
  - `shared/build.gradle.kts` (98 lines)
- Screen Implementations:
  - `shared/src/commonMain/kotlin/screens/WelcomeScreen.kt` (125 lines)
  - `shared/src/commonMain/kotlin/screens/LoginScreen.kt` (103 lines)
  - `shared/src/commonMain/kotlin/screens/HomeTab.kt` (239 lines)
  - `shared/src/commonMain/kotlin/screens/SubmitTab.kt` (37 lines)
  - `shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt` (703 lines)
  - `shared/src/commonMain/kotlin/screens/SarpanchVerifyScreen.kt` (104 lines)
  - `shared/src/commonMain/kotlin/screens/GovDashboardScreen.kt` (183 lines)
  - `shared/src/commonMain/kotlin/screens/ProfileTab.kt` (210 lines)
- Networking, Database & DI:
  - `shared/src/commonMain/kotlin/network/ApiClient.kt` (58 lines)
  - `shared/src/commonMain/kotlin/network/Models.kt` (152 lines)
  - `shared/src/commonMain/kotlin/db/OfflineDatabase.kt` (71 lines)
  - `shared/src/commonMain/kotlin/di/AppModule.kt` (9 lines)
  - `shared/src/commonMain/kotlin/localization/LocalizationEngine.kt` (149 lines)
- Backend Parity References:
  - `web/src/app/api/mobile/verify/route.ts` (128 lines)
  - `web/src/app/api/track/[id]/route.ts` (321 lines)

### 1.2 Desktop Target Build Execution & Tooling Requirements
Command executed:
```cmd
cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"
```
Execution Result:
- **Status**: Exited with code `0` (`BUILD SUCCESSFUL in 43s`, 9 actionable tasks: 5 executed, 4 up-to-date).
- **Tooling Requirement**: Running gradle without setting `JAVA_HOME` fails with `java.lang.IllegalArgumentException: 25.0.3` because the system's default Java is JDK 25 (`25.0.3`), which Kotlin 1.9.21 does not recognize. JDK 17 (`C:\Users\vinod\.jdks\jbr-17.0.14`) is strictly mandatory.
- **Build Warnings Observed**:
  1. `w: file:///A:/Development/Antigravity/SIH26043/mobile/shared/src/commonMain/kotlin/screens/SarpanchVerifyScreen.kt:27:13 Variable 'apiClient' is never used`
  2. `w: The Default Kotlin Hierarchy Template was not applied to 'project ':shared'': Explicit .dependsOn() edges were configured for the following source sets: [iosArm64Main, iosMain, iosSimulatorArm64Main, iosX64Main]`
  3. Redundant / unmapped source file: `desktopApp/src/desktopMain/kotlin/main.kt`. In `desktopApp/build.gradle.kts`, the target is configured as `jvm()` (using `jvmMain`), so `src/desktopMain` is never compiled.

### 1.3 Audit of Dead Buttons & Broken Navigation Flows
A comprehensive scan across all `onClick` and navigation handlers revealed multiple dead buttons and unrouted screens:

| File & Line | Component | Code Snippet | Issue Description |
|---|---|---|---|
| `SarpanchVerifyScreen.kt:78` | `OutlinedButton` | `onClick = { /* Mark duplicate */ }` | **Explicit Dead Button**: Empty lambda with comment; does nothing when tapped. |
| `SarpanchVerifyScreen.kt:84-95` | `Button` | `onClick = { isLoading = true; coroutineScope.launch { delay(1000); isLoading = false } }` | **Stub / Fake Handler**: Only triggers a 1-second delay; does not call the backend verification API or update UI status. |
| `SarpanchVerifyScreen.kt:27` | Injected Property | `val apiClient = koinInject<ApiClient>()` | **Unused Dependency**: Injected but never referenced, generating a compiler warning. |
| `SarpanchVerifyScreen.kt:59-99` | `LazyColumn` | `items(3) { index -> Text("Issue #$index: Road Damage") }` | **Hardcoded Mock Items**: Displays static mock cards; does not fetch real issues from `apiClient.getChallenges()`. |
| `GovDashboardScreen.kt:26` | `Screen` | `class GovDashboardScreen : Screen` | **Orphan Screen**: 183 lines of complete UI with state analytics, audit logs, and challenge ledger, but **0 incoming navigation calls** in the entire codebase. Completely unreachable. |
| `CitizenSubmitScreen.kt:138` | `TopAppBar Back TextButton` | `onClick = { navigator?.pop() }` | **Dead Button in Tab Context**: Inside `SubmitTab`, `CitizenSubmitScreen` is the root of the nested navigator stack (`navigator.canPop == false`), so `navigator?.pop()` silently does nothing. |
| `CitizenSubmitScreen.kt:593, 655` | `AlertDialog Confirm/Dismiss` | `navigator?.pop()` | **Dead Pop on Dismiss**: Same issue; popping the root of the nested stack fails to return the user to the Home tab. |
| `CitizenSubmitScreen.kt:569` | `Button Text` | `text = strings.submitToSarpanch` | **Legacy Nomenclature**: Mentions "Submit to Sarpanch" despite the platform pivot to District Nodal Officer / Portal Triage. |
| `HomeTab.kt:124-155` | `LazyColumn Cards` | `items(3) { index -> GlassCard { ... } }` | **Unclickable Static Cards**: Hardcoded mock items with no `clickable` modifier and no navigation to view challenge tracking or details. |
| `ProfileTab.kt:108-117` | Profile Action | `var isEditing by remember { ... }` | **Missing Sign-Out Flow**: No logout button or role switching mechanism; user cannot return to `LoginScreen` or switch roles. |
| `LoginScreen.kt:68, 84` | Login Roles | Citizen -> `MainScreen()`, Sarpanch -> `SarpanchVerifyScreen()` | **Missing Role Navigation**: No button to log in as Government / District Nodal Officer to reach `GovDashboardScreen()`. |

### 1.4 Network Layer & Backend API Discrepancies
Inspection of `ApiClient.kt` and `Models.kt` against the Next.js backend revealed:
1. The backend has an active verification and triage endpoint at `POST /api/mobile/verify` (`web/src/app/api/mobile/verify/route.ts`), accepting `{ challengeId, nodalOfficerId, sarpanchId }` and performing AI categorization and Track A/B/C routing.
2. `ApiClient.kt` **does not have a client method** for `/api/mobile/verify`.
3. The backend has a public issue tracking endpoint at `GET /api/track/[id]` (`web/src/app/api/track/[id]/route.ts`) returning 5-stage timelines, track badges, telemetry, and SLA status.
4. `ApiClient.kt` **does not have a client method** for `/api/track/[id]`, and the mobile app has **no Challenge Detail / Tracking Screen** to display this data.

---

## 2. Logic Chain

1. **Premise**: The project requirement specifies reaching 100% implementation across the mobile app, ensuring zero dead buttons, no missing placeholder screens, and complete desktop target compilation.
2. **Build Readiness**:
   - `gradlew.bat desktopApp:assemble` runs successfully when supplied with JDK 17 (`C:\Users\vinod\.jdks\jbr-17.0.14`).
   - The build succeeds because dead buttons and orphan screens are syntactically valid Kotlin code.
3. **Dead Buttons & UX Dead-Ends**:
   - In `SarpanchVerifyScreen.kt`, line 78 has an empty `onClick` lambda (`/* Mark duplicate */`), and line 84 simulates work with `delay(1000)` without updating state or calling the backend.
   - In `HomeTab.kt`, citizens see mock problems but cannot click them. In the web platform, clicking a challenge opens `/track/[id]` or `/challenge/[id]`. On mobile, this journey abruptly terminates.
   - In `SubmitTab.kt`, `CitizenSubmitScreen` is nested as a root screen. Tapping "Back" invokes `navigator.pop()`, which fails because the stack has depth 1.
4. **Orphan Screen**:
   - `GovDashboardScreen` was built with Ktor network integration (`apiClient.getAnalytics()`, `apiClient.getChallenges()`, `apiClient.getPendingUsers()`, `apiClient.getAuditLogs()`), but `LoginScreen` only exposes two buttons: "Login as Citizen" and "Login as Local Sarpanch". `GovDashboardScreen` cannot be accessed anywhere in the app.
5. **Backend Parity Gap**:
   - The Next.js backend supports `POST /api/mobile/verify` and `GET /api/track/[id]`. Because `ApiClient.kt` lacks these endpoints, `SarpanchVerifyScreen` was left with mock delays and `HomeTab` was left with static dummy cards.

---

## 3. Caveats

1. **Android Emulator Environment**: Verification of network requests on Android requires `http://10.0.2.2:3000`, which is correctly configured in `ApiClient.kt` (`val defaultBaseUrl = if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"`). Verification on `desktopApp` hits `http://localhost:3000`.
2. **Offline Database Stub**: `OfflineDatabase.kt` contains `IssueDao` and `RoomMockDatabase`, but is not wired into Koin or screen view models. This does not cause build errors, but represents an unused architectural scaffold.
3. **Redundant Source Directory**: `desktopApp/src/desktopMain` contains a duplicate `main.kt` that is ignored by Gradle's `jvm()` target. It does not cause build failures but should be cleaned up or unified to avoid confusion.

---

## 4. Conclusion

The mobile application compiles cleanly under Desktop JVM (`exit code 0`), but has critical functional dead ends and orphaned components that prevent it from being 100% complete:
1. **1 Orphaned Screen**: `GovDashboardScreen` is fully implemented but unreachable.
2. **2 Explicit Dead Buttons / Stub Actions**: `SarpanchVerifyScreen.kt` lines 78 (`/* Mark duplicate */`) and 84 (`delay(1000)` fake route).
3. **1 Navigation Dead-End**: `CitizenSubmitScreen.kt` line 138 ("Back" button fails inside `SubmitTab`).
4. **1 Missing Feature / Screen**: `ChallengeDetailScreen` / `ProblemTrackScreen` to allow citizens to click cards on `HomeTab` and view the 5-stage timeline from `/api/track/[id]`.
5. **Missing Role & Logout Flow**: No Gov login button on `LoginScreen`, and no logout button on `ProfileTab`.
6. **2 Missing ApiClient Methods**: `POST /api/mobile/verify` and `GET /api/track/[id]`.

---

## 5. Verification Method

To independently reproduce and verify these findings:

1. **Execute Desktop Assemble Command**:
   ```cmd
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"
   ```
   *Verification expectation*: Clean compilation, exit code 0, with warning for unused `apiClient` in `SarpanchVerifyScreen.kt:27`.

2. **Verify Orphan Screen (`GovDashboardScreen`)**:
   Search for references across the repository:
   ```cmd
   git grep "GovDashboardScreen" mobile/
   ```
   *Verification expectation*: Only 1 match in `GovDashboardScreen.kt:26` (declaration only; zero usage).

3. **Verify Dead Buttons in `SarpanchVerifyScreen.kt`**:
   Inspect lines 75–96 in `mobile/shared/src/commonMain/kotlin/screens/SarpanchVerifyScreen.kt`:
   *Verification expectation*: Line 78 contains empty lambda `onClick = { /* Mark duplicate */ }`; line 84 contains dummy coroutine delay.

4. **Verify Back Navigation Defect in `SubmitTab.kt`**:
   Inspect `SubmitTab.kt` line 32 (`Navigator(CitizenSubmitScreen())`) and `CitizenSubmitScreen.kt` line 138 (`navigator?.pop()`).
   *Verification expectation*: Popping a single-entry navigator stack has no effect.

---

## 6. Recommended Action Plan for Implementation Agents

1. **Update `ApiClient.kt` & `Models.kt`**:
   - Add `verifyChallenge(challengeId: String, officerId: String)` calling `POST /api/mobile/verify`.
   - Add `getTrackDetails(trackingId: String)` calling `GET /api/track/{id}`.
   - Add corresponding data classes (`VerifyChallengeRequest`, `VerifyChallengeResponse`, `TrackDetailResponse`).
2. **Rescue `GovDashboardScreen` & Enhance `LoginScreen.kt`**:
   - Add a "Login as Government Official" button on `LoginScreen.kt` pointing to `GovDashboardScreen()`.
   - Update "Login as Local Sarpanch" to "Login as District Nodal Officer" (pointing to `SarpanchVerifyScreen()` or modernized `NodalVerifyScreen()`).
3. **Wire `SarpanchVerifyScreen.kt` to Live Backend**:
   - Fetch pending issues dynamically using `apiClient.getChallenges()`.
   - Wire "Verify & Route" button to call `apiClient.verifyChallenge(challenge.id, "test-nodal-id")`.
   - Wire "Mark Duplicate" to call backend verification or toggle status.
4. **Implement `ChallengeDetailScreen.kt` & Wire `HomeTab.kt`**:
   - Load recent submissions via `apiClient.getChallenges()`.
   - Make cards clickable, pushing `ChallengeDetailScreen(challenge)` to display track, SLA, and status timeline.
5. **Fix `SubmitTab` Navigation & `ProfileTab` Logout**:
   - In `CitizenSubmitScreen`, if `navigator?.canPop == false`, wire the Back button and Dialog OK button to switch `LocalTabNavigator.current.current = HomeTab`.
   - In `ProfileTab.kt`, add a "Logout / Switch Account" button that pushes `LoginScreen()` on the root navigator.
