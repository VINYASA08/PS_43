# E2E & Judge Verification Strategy Report (Round 5)

**Agent**: `survey_e2e` (E2E & Judge Verification Explorer)  
**Date**: 2026-09-08T19:31:00+05:30  
**Working Directory**: `a:/Development/Antigravity/SIH26043/.agents/survey_e2e`  
**Parent Conversation ID**: `3b8e13f4-7b33-4362-b809-330047fef382`  
**Handoff Type**: Hard Handoff (Investigation & Verification Strategy Complete)

---

## 1. Observation

### 1.1 Authoritative Acceptance Criteria Inspection
From `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (lines 195–221):
- **Requirement R1**: Implement a Compose Multiplatform UI allowing users to input a problem title, description, district, and domain. The UI must include buttons to "attach" photos/videos and "get current location", which will inject simulated mock data into the payload.
- **Requirement R2**: Integrate Ktor to perform a `POST /api/mobile/challenges` request to the Next.js backend running at `http://10.0.2.2:3000`. The app must handle success and error states appropriately and provide feedback to the user.
- **Acceptance Criteria — Submission Verification**:
  1. *"An agent acting as a judge must be able to launch the app, navigate to the submission screen, fill out the form, and successfully submit a problem."*
  2. *"The agent judge must verify via the Next.js backend (or database) that the submitted problem was accurately received and stored with the simulated location and media data."*
  3. *"Both web and mobile builds must pass cleanly (`gradlew assembleDebug` in mobile, `npm run build` in web if backend modified/needed)."*

### 1.2 Baseline Build Reproducibility Verification
Direct empirical verification was executed in the workspace:
1. **Mobile Build Command**:
   ```bash
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"
   ```
   - **Result**: `BUILD SUCCESSFUL in 5s`, exit code `0`.
   - **Artifact**: `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk` exists (valid signed Android debug APK).
   - **Gradle / JDK Environment**: Gradle 8.11 running with Launcher JVM 17.0.14 at `C:\Users\vinod\.jdks\jbr-17.0.14`.
2. **Web Build Command**:
   ```bash
   npm run build
   ```
   - **Result**: Next.js 16.3.4 (Turbopack) compiled cleanly with exit code `0`.
   - **Route Manifest**: 36 static pages, dynamic route `/api/mobile/challenges` compiled and mounted cleanly without TypeScript or packaging errors.

### 1.3 Prior Rounds Test Infrastructure & Verification Patterns
Inspection of prior round test suites and auditor reports revealed:
1. **Round 4 Milestone 4 Test Suite** (`web/tests/test_3track_triage.ts`, 647 lines):
   - Pattern: Autonomous programmatic test runner executed via `cmd.exe /c npx tsx tests/test_3track_triage.ts`.
   - Execution mechanism: Direct in-process invocation of Next.js route handlers (`POST` from `src/app/api/challenges/route.ts`) via `NextRequest`.
   - Direct database assertion: Queried `prisma.challenge` directly to assert `track`, `trackRouting`, `triageReasoning`, and `slaDeadline`.
   - Teardown: Physical cleanup of test mock records via raw SQL/Prisma in a `finally` block, leaving zero persistent test pollution.
   - Result: 12/12 passed (100%) in ~45ms, exit code 0.
2. **Round 3 Master E2E Suite** (`web/tests/run-all-e2e.ts` & `TEST_INFRA.md`):
   - 4-Tier test architecture with 45 tests executed via `npx tsx tests/run-all-e2e.ts` in ~2.02 seconds, exit code 0.
3. **Existing Mobile Pipeline Probe** (`web/tests/mobile-pipeline.mjs`):
   - Script that attempted `fetch("http://localhost:3000/api/mobile/challenges")`.
   - Observation: When port 3000 is not actively listening (no running dev/start server), raw HTTP `fetch` fails immediately with `ECONNREFUSED`.

### 1.4 Mobile Codebase Inspection & Gap Forensics
Inspection of `mobile/` files revealed:
1. `mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt` (lines 16–105):
   - Contains input fields for `title` and `description` only.
   - **Gaps**: Lacks inputs for `district` (24 Jharkhand districts) and `domain` (10 canonical domains).
   - **Gaps**: Lacks explicit buttons for "Attach Photos/Videos" and "Get Current Location" injecting simulated mock data.
   - **Gaps**: Button onClick handler contains dummy delay (`kotlinx.coroutines.delay(1000)`) without calling Ktor `ApiClient`.
2. `mobile/shared/src/commonMain/kotlin/network/ApiClient.kt` (lines 10–44):
   - Defines Ktor `HttpClient` with `ContentNegotiation` and JSON.
   - Hardcodes `http://10.0.2.2:3000/...` across all requests.
   - **Gaps**: No `submitChallenge(...)` method exists in `ApiClient`.
   - **Gaps**: `10.0.2.2` is valid *only* inside the Android emulator. On Desktop JVM (`desktopApp` or `desktopTest`), `10.0.2.2` fails to resolve.
3. `mobile/shared/src/commonMain/kotlin/network/Models.kt`:
   - Contains `Challenge`, `AnalyticsSummary`, etc.
   - **Gaps**: Lacks `@Serializable` data classes for `MobileChallengeSubmission` and `MobileSubmissionResponse`.
4. `mobile/desktopApp/src/jvmMain/kotlin/main.kt`:
   - Runs Compose Multiplatform on Desktop JVM (`Window { MainView() }`).
   - `gradlew :desktopApp:run` runs the Compose app interactively on Windows.

### 1.5 Backend Mobile Endpoint & Database Storage Inspection
Inspection of `web/src/app/api/mobile/challenges/route.ts` and `web/prisma/schema.prisma`:
1. **Schema Contract** (`mobileSubmitSchema`):
   ```typescript
   const mobileSubmitSchema = z.object({
     title: z.string().min(5),
     description: z.string().min(10),
     district: z.string(),
     location: z.string(),
     reporterId: z.string(), // Currently required
     evidenceUrl: z.string().optional(),
     track: z.string().optional(),
     domain: z.string().optional(),
     urgency: z.string().optional(),
   });
   ```
2. **Database Storage**:
   - `location` is persisted directly into `Challenge.location` (`String`).
   - `evidenceUrl` is persisted into `Challenge.evidence` (`String?`) as `JSON.stringify({ media: evidenceUrl })`.
   - Returns: `{ success: true, trackingId, challengeId, track, trackRouting, status }`.
3. **Empirical Route Probe**:
   - Executed live in-process probe submitting mock problem:
     - `title`: "Test Broken Bridge in Gumla"
     - `district`: "Gumla"
     - `location`: "Lat: 22.9832 N, Long: 84.5421 E"
     - `evidenceUrl`: "https://images.unsplash.com/mock-bridge.jpg"
     - `domain`: "Urban Infrastructure"
     - `reporterId`: "cmtngm5010005ugsyunbe2ich" (active citizen from `prisma.user`)
   - **Result**: Status `200 OK`, returned `trackingId: 'IN-JH-2026-7921'`, `challengeId: 'cmtsqlh800001133j2yar1xh6'`.
   - **Prisma Verification**: Queried `prisma.challenge.findUnique`:
     - `c.location === 'Lat: 22.9832 N, Long: 84.5421 E'`
     - `c.evidence === '{"media":"https://images.unsplash.com/mock-bridge.jpg"}'`
     - `c.district === 'Gumla'`
     - `c.domain === 'Urban Infrastructure'`
   - **Teardown**: Physically removed probe record via Prisma.

---

## 2. Logic Chain

1. **Premise 1: Agent Environment Constraints**:
   - An automated agent acting as a judge in a CLI/CI tool-calling environment does not have access to an Android emulator daemon (`adb devices` exited with code 1; adb is not present).
   - Therefore, the judge cannot rely solely on driving an Android GUI via ADB to verify the submission flow.

2. **Premise 2: Multi-Modal Judge Architecture**:
   - The Acceptance Criteria requires:
     *"An agent acting as a judge must be able to launch the app, navigate to the submission screen, fill out the form, and successfully submit a problem."*
     *"The agent judge must verify via the Next.js backend (or database) that the submitted problem was accurately received and stored with the simulated location and media data."*
   - To satisfy all interpretations of an "agent acting as a judge" (automated subagent runner, terminal CLI execution, JVM headless test, or human judge launching the app), the system must provide:
     - **Path A (Deterministic Programmatic Judge Script)**: An automated TypeScript judge script (`web/tests/judge_e2e_mobile.ts`) runnable via `cmd.exe /c npx tsx tests/judge_e2e_mobile.ts`. It exercises the complete mobile submission payload contract, invokes `/api/mobile/challenges`, verifies the HTTP response, directly queries Prisma to verify that `location` and `evidence` (media) are stored, verifies retrieval via the public Next.js API, and cleans up test data.
     - **Path B (Kotlin Multiplatform JVM Test Harness)**: A Kotlin test/runner in `mobile/` runnable via `gradlew test` (or `:shared:desktopTest`) that verifies Voyager navigation from `LoginScreen` to `CitizenSubmitScreen`, form population, location/media injection, and Ktor serialization.
     - **Path C (Interactive Compose Desktop Application)**: Runnable on Windows via `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew :desktopApp:run"`. This allows an interactive or human judge to visually launch the Compose UI, navigate to the citizen screen, click the simulated buttons, and submit.
     - **Path D (Production Debug APK)**: Verifiable via `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"`.

3. **Premise 3: Network Host Resolution Parity**:
   - In `ApiClient.kt`, `10.0.2.2:3000` is hardcoded. While correct for the Android emulator, it fails on Desktop JVM and local testing environments.
   - By resolving base URL dynamically (e.g. `if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"` or accepting a configurable parameter in Koin), both Android and Desktop/JVM environments function without code modification.

4. **Premise 4: Backend Reporter Fallback Robustness**:
   - In `web/src/app/api/mobile/challenges/route.ts`, `mobileSubmitSchema` currently requires `reporterId: z.string()`.
   - In real mobile submissions, users do not input database CUID strings.
   - If `reporterId` is made optional with a fallback to the active seeded citizen user (`cmtngm5010005ugsyunbe2ich` / `citizen.reporter@jharkhand.org`), mobile submissions are guaranteed to succeed without database foreign key violation errors.

---

## 3. Caveats

1. **Android Emulator / Device Testing**: No Android emulator or physical device is attached in the host workspace. Verification of the Android artifact relies on clean Gradle compilation (`assembleDebug`) and binary APK presence (`androidApp-debug.apk`), while live runtime execution is verified on Desktop JVM (`desktopApp` / `desktopTest`) and programmatic E2E test harness (`judge_e2e_mobile.ts`).
2. **Standalone HTTP Server vs In-Process Invocation**: If the programmatic judge script runs standalone, in-process invocation (`NextRequest` -> Route Handler) provides millisecond execution speed and 100% determinism without depending on a pre-launched `next dev` background process. However, if a live HTTP server is already running, the script can seamlessly probe `http://localhost:3000`. The judge script should support both modes gracefully.
3. **Teardown Safety**: Any verification script that creates records in `dev.db` must include a physical delete in a `finally` block to preserve test idempotency and prevent database bloat across multiple runs.

---

## 4. Conclusion

### 4.1 Recommended Judge Verification Architecture

```
+-----------------------------------------------------------------------------------------+
|                                  AGENT JUDGE HARNESS                                    |
+-----------------------------------------------------------------------------------------+
                                             |
            +--------------------------------+--------------------------------+
            |                                                                 |
            v                                                                 v
+-----------------------+                                         +-----------------------+
|    AUTOMATED E2E      |                                         |     KMP CLIENT        |
|     JUDGE SCRIPT      |                                         |     VERIFICATION      |
| web/tests/            |                                         | mobile/               |
| judge_e2e_mobile.ts   |                                         |                       |
+-----------------------+                                         +-----------------------+
            |                                                                 |
   [1] Simulates mobile payload                              [1] Navigates Voyager stack
       (title, desc, district,                                   Login -> CitizenSubmit
        domain, mock GPS & media)                            [2] Simulates button clicks:
            |                                                    "Get Location" -> GPS
   [2] POST /api/mobile/challenges                               "Attach Media" -> URL
            |                                                [3] ApiClient / Ktor call
   [3] Asserts 200 OK + TrackingId                               [4] Desktop App UI
            |                                                    gradlew :desktopApp:run
   [4] Asserts Prisma Storage                                [5] Android APK
       - location == simulated GPS                               gradlew assembleDebug
       - evidence == simulated media
            |
   [5] Asserts Public API retrieval
       GET /api/challenges?search=...
            |
   [6] Physical Teardown & Exit 0
```

### 4.2 Required Implementation Actions for Worker Tracks

#### Track 1: Mobile UI & State (`survey_mobile` / `worker_m1`)
1. **`screens/CitizenSubmitScreen.kt`**:
   - Add state and UI dropdowns/selectors for:
     - `district` (from 24 Jharkhand districts: Ranchi, Dhanbad, Gumla, Simdega, Dumka, etc.)
     - `domain` (canonical 10 domains: Water Management, Agriculture, Healthcare, Energy, Infrastructure, etc.)
   - Add **"Get Current Location"** button:
     - Injects simulated GPS string: `"23.3441° N, 85.3096° E, Ranchi Urban Block"` (or selected district coordinates).
     - Displays captured coordinates in a designated Chip / Card.
   - Add **"Attach Photos/Videos"** button:
     - Injects simulated media URL: `"https://storage.jharkhand.gov.in/evidence/photo_2026_gumla_bridge.jpg"`.
     - Displays preview thumbnail / file badge.
   - Add **"Submit Problem"** button:
     - Calls `apiClient.submitChallenge(...)`.
     - Displays loading indicator during network roundtrip.
     - On success: displays persistent success feedback dialog/snackbar with the generated `trackingId` (e.g. `IN-JH-2026-XXXX`).
     - On failure: displays error message.

#### Track 2: Ktor Network Client & Models (`worker_m2`)
1. **`network/Models.kt`**:
   ```kotlin
   @Serializable
   data class MobileChallengeSubmission(
       val title: String,
       val description: String,
       val district: String,
       val location: String,
       val domain: String? = null,
       val evidenceUrl: String? = null,
       val reporterId: String? = null,
       val urgency: String? = "MEDIUM"
   )

   @Serializable
   data class MobileSubmissionResponse(
       val success: Boolean,
       val trackingId: String,
       val challengeId: String,
       val track: String? = null,
       val trackRouting: String? = null,
       val status: String
   )
   ```
2. **`network/ApiClient.kt`**:
   - Support dynamic base URL resolution:
     ```kotlin
     val baseUrl: String = if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"
     ```
   - Implement:
     ```kotlin
     suspend fun submitChallenge(request: MobileChallengeSubmission): MobileSubmissionResponse {
         return client.post("$baseUrl/api/mobile/challenges") {
             contentType(ContentType.Application.Json)
             setBody(request)
         }.body()
     }
     ```

#### Track 3: Backend Endpoint Alignment (`survey_backend` / `worker_m3`)
1. **`web/src/app/api/mobile/challenges/route.ts`**:
   - Make `reporterId` optional: `reporterId: z.string().optional()`.
   - Fallback to active citizen in Prisma if `reporterId` is not supplied:
     ```typescript
     const defaultCitizen = await prisma.user.findFirst({ where: { role: "CITIZEN", status: "ACTIVE" } });
     const effectiveReporterId = reporterId || defaultCitizen?.id || "cmtngm5010005ugsyunbe2ich";
     ```
   - Support both `evidenceUrl` and `mediaUrl` aliases for media payload compatibility.

#### Track 4: E2E Judge Verification Suite (`worker_m4` / `test_writer`)
1. Author **`web/tests/judge_e2e_mobile.ts`**:
   - Phase 1: Verify database connection & clean baseline.
   - Phase 2: Form submission simulation with realistic field scenarios:
     - Scenario A (Water Management in Dhanbad): Location `"Lat: 23.7957 N, Long: 86.4304 E (Jharia Belt)"`, Media `"https://storage.jharkhand.gov.in/evidence/water_sample_dhanbad.jpg"`.
     - Scenario B (Infrastructure in Gumla): Location `"Lat: 22.9832 N, Long: 84.5421 E (Chainpur Block)"`, Media `"https://storage.jharkhand.gov.in/evidence/bridge_collapse_gumla.jpg"`.
   - Phase 3: Assert API Response: HTTP 200, valid `trackingId` (`/^IN-JH-2026-\d{4}$/`), `challengeId`.
   - Phase 4: Direct Database Verification via Prisma:
     - `challenge.location === expectedLocation`
     - `JSON.parse(challenge.evidence).media === expectedMediaUrl`
     - `challenge.status === "REPORTED"`
     - Track & routing fields correctly populated.
   - Phase 5: Public API Verification:
     - `GET /api/challenges?search=<trackingId>` confirms the problem is queryable by public users.
   - Phase 6: Validation Error Boundaries:
     - Short title (<5 chars) rejected with HTTP 400.
     - Short description (<10 chars) rejected with HTTP 400.
   - Phase 7: Clean Teardown:
     - Physically deletes mock test records from `Challenge` table via Prisma in a `finally` block.
   - Phase 8: Output formatted Judge Verification Card and exit code 0.

---

## 5. Verification Method

### 5.1 Verification Commands

1. **Master Judge Verification Command**:
   ```powershell
   cmd.exe /c npx tsx tests/judge_e2e_mobile.ts
   ```
   - Working Directory: `a:/Development/Antigravity/SIH26043/web`
   - Expected Output: All judge submission phases pass (100%), verified database storage of location and media data, exit code `0`.

2. **Mobile Build Verification Command**:
   ```powershell
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"
   ```
   - Working Directory: `a:/Development/Antigravity/SIH26043/mobile`
   - Expected Output: `BUILD SUCCESSFUL`, 0 errors, APK generated at `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`, exit code `0`.

3. **Web Build Verification Command**:
   ```powershell
   npm run build
   ```
   - Working Directory: `a:/Development/Antigravity/SIH26043/web`
   - Expected Output: Next.js Turbopack compilation passes with 0 errors, route `/api/mobile/challenges` generated, exit code `0`.

4. **Desktop Compose Multiplatform Launch Command (Manual / Visual Judge)**:
   ```powershell
   cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew :desktopApp:run"
   ```
   - Working Directory: `a:/Development/Antigravity/SIH26043/mobile`
   - Expected Output: Desktop application launches with Compose UI on Windows.

### 5.2 Files to Inspect
- `web/src/app/api/mobile/challenges/route.ts` — Mobile submission Route Handler
- `web/tests/judge_e2e_mobile.ts` — Automated judge verification suite
- `mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt` — Problem submission Compose UI
- `mobile/shared/src/commonMain/kotlin/network/ApiClient.kt` — Ktor submission integration
- `mobile/shared/src/commonMain/kotlin/network/Models.kt` — Data models with serialization
- `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk` — Mobile APK build output

### 5.3 Invalidation Conditions
- Any failure in `npm run build` or `gradlew assembleDebug`.
- `POST /api/mobile/challenges` rejecting valid mobile submission or failing to store `location` and `evidence`.
- Judge script failing to clean up mock records from `dev.db`.
- Mobile client failing to connect on Desktop JVM due to hardcoded `10.0.2.2` IP address.
