# Dispatch: Worker 2 (Mobile Navigation, Missing Screen & Dead Buttons Repair)

## Assigned Role & Identity
You are Worker 2 (`teamwork_preview_worker_r7_m2`).
Working Directory: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m2`
Project Root: `a:/Development/Antigravity/SIH26043`
Target Codebase: `a:/Development/Antigravity/SIH26043/mobile`

## MANDATORY Reading
Read `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically see entry under `## 2026-09-09T04:59:23Z`).
Also read:
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_2/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/orchestrator_r7/PROJECT.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own files in `mobile/shared/src/commonMain/kotlin/`. Do not touch `web/`.

## Detailed Tasks to Implement

### 1. Update ApiClient.kt & Models.kt (F10)
- Add `verifyChallenge(challengeId: String, officerId: String)` calling `POST /api/mobile/verify` (backend route already exists in Next.js).
- Add `getTrackDetails(trackingId: String): TrackDetailResponse?` calling `GET /api/track/{id}`.
- Add serializable models in `Models.kt`: `VerifyChallengeRequest`, `VerifyChallengeResponse`, `TrackDetailResponse` (with status, track, urgency, timeline items).

### 2. Rescue GovDashboardScreen & Update LoginScreen.kt (F7)
- In `LoginScreen.kt`:
  - Add "Login as Government Official" button pointing to `GovDashboardScreen()` (rescuing the 183-line orphan screen).
  - Update "Login as Local Sarpanch" button text/label to "Login as District Nodal Officer" (pointing to `SarpanchVerifyScreen()`).

### 3. Wire SarpanchVerifyScreen.kt to Live Backend & Fix Dead Buttons (F8)
- Fetch real issues using `apiClient.getChallenges()` in `LaunchedEffect` instead of static `items(3)`.
- Wire "Verify & Route" button to call `apiClient.verifyChallenge(challenge.id, "nodal-official-001")` and update state/toast feedback.
- Wire "Mark Duplicate" button (line 78) to functional logic (e.g. toggle duplicate flag, mark duplicate via API or local state feedback).
- Eliminate the unused `apiClient` compiler warning.

### 4. Create ChallengeDetailScreen.kt & Wire Clickable Cards in HomeTab.kt (F9)
- Implement `ChallengeDetailScreen.kt` in `mobile/shared/src/commonMain/kotlin/screens/`:
  - Displays challenge title, description, district, domain, GPS coordinates, triage track badge (`TRACK_A_INNOVATION`, `TRACK_B_STANDARD`, `TRACK_C_CIVIC`), SLA countdown, and 5-stage timeline from `apiClient.getTrackDetails(trackingId)`.
  - Includes TopAppBar with back navigation (`navigator?.pop()`).
- In `HomeTab.kt`:
  - Load recent submissions from `apiClient.getChallenges()` or display fallback challenges with tracking IDs.
  - Add `Modifier.clickable` to problem cards, pushing `ChallengeDetailScreen(challenge)` onto the navigator.

### 5. Fix Navigation Dead-Ends & Logout Flow (F7)
- In `CitizenSubmitScreen.kt`:
  - For the TopAppBar Back button (line 138) and AlertDialog confirmation buttons (lines 593, 655): check `if (navigator?.canPop == true) navigator?.pop() else LocalTabNavigator.current.current = HomeTab`.
- In `ProfileTab.kt`:
  - Add a "Logout / Switch Account" button navigating back to `LoginScreen()` on the root navigator.

## Verification & Build
After implementing, verify:
`cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"`
Must compile cleanly with exit code 0.
Write your completion report to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r7_m2/handoff.md` with build evidence and message your parent (`8534b656-72e3-43eb-908f-39e849088abf`).
