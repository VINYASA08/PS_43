# Mobile Architecture Survey & Specification Report

## 1. Observation

### 1.1 Project Structure & Build Configuration
- **Root Directory**: `a:/Development/Antigravity/SIH26043/mobile`
- **Gradle Version**: Gradle 8.11 (`distributionUrl=https\://services.gradle.org/distributions/gradle-8.11-bin.zip` in `gradle/wrapper/gradle-wrapper.properties:3`).
- **Subprojects**: Configured in `mobile/settings.gradle.kts:3-5`:
  ```kotlin
  include(":androidApp")
  include(":shared")
  include(":desktopApp")
  ```
- **Toolchains & Versions**:
  - Defined in `mobile/gradle.properties`:
    - `kotlin.version=1.9.21` (line 19)
    - `agp.version=8.0.2` (line 20)
    - `compose.version=1.5.11` (line 21)
    - `android.compileSdk=34`, `android.targetSdk=34`, `android.minSdk=24` (lines 14-16)
  - Java Toolchain: Configured in `mobile/shared/build.gradle.kts:90-95` and `mobile/androidApp/build.gradle.kts:31-37` to `jvmToolchain(17)` with `sourceCompatibility = JavaVersion.VERSION_17`.
  - Android SDK Path: Configured in `mobile/local.properties:8`: `sdk.dir=C\:\\Users\\vinod\\AppData\\Local\\Android\\Sdk`.
  - JDK 17 Path on Host: `C:\Users\vinod\.jdks\jbr-17.0.14\bin\java.exe` (OpenJDK 17.0.14+1-1367.22-nomod).

### 1.2 Kotlin Multiplatform Targets & Dependency Topology
- Configured in `mobile/shared/build.gradle.kts:8-22`:
  - `androidTarget()`
  - `jvm("desktop")`
  - `iosX64()`, `iosArm64()`, `iosSimulatorArm64()`
- Dependencies in `mobile/shared/build.gradle.kts`:
  - **Compose Multiplatform**: `compose.runtime`, `compose.foundation`, `compose.material`, `compose.components.resources` (lines 27-31).
  - **Dependency Injection**: `io.insert-koin:koin-core:3.5.3`, `io.insert-koin:koin-compose:1.1.2` (lines 34-35).
  - **Serialization**: `kotlin("plugin.serialization") version "1.9.21"`, `org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2` (line 3, line 41).
  - **Networking (Ktor 2.3.7)**:
    - `commonMain`: `io.ktor:ktor-client-core:2.3.7`, `io.ktor:ktor-client-content-negotiation:2.3.7`, `io.ktor:ktor-serialization-kotlinx-json:2.3.7` (lines 38-40).
    - `androidMain`: `io.ktor:ktor-client-android:2.3.7` (line 54).
    - `desktopMain`: `io.ktor:ktor-client-cio:2.3.7` (line 72).
    - `iosMain`: `io.ktor:ktor-client-darwin:2.3.7` (line 66).
  - **Navigation**: `cafe.adriel.voyager:voyager-navigator:1.0.0`, `voyager-transitions:1.0.0`, `voyager-koin:1.0.0` (lines 44-46).

### 1.3 Build Verification Commands & Results
1. **Android APK Assembly**:
   - Command: `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"` in `mobile/`.
   - Result: `BUILD SUCCESSFUL in 23s` (62 actionable tasks: 9 executed, 53 up-to-date).
   - Artifact: `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`.
2. **Desktop JVM Jar Compilation**:
   - Command: `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew :desktopApp:jvmJar"` in `mobile/`.
   - Result: `BUILD SUCCESSFUL in 18s` (7 actionable tasks: 7 executed).
   - Compiler warning observed:
     `w: file:///A:/Development/Antigravity/SIH26043/mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt:24:13 Variable 'apiClient' is never used`

### 1.4 Analysis of Existing Source Code
- `mobile/shared/src/commonMain/kotlin/App.kt`:
  - Defines `expect fun getPlatformName(): String` (line 14).
  - Configures `KoinApplication` with `appModule` (lines 32-34).
  - Configures `LocalizationEngine` and `ProvideLocalization` (lines 30, 35).
  - Navigation starts at `Navigator(LoginScreen()) { navigator -> SlideTransition(navigator) }` (lines 38-40).
- `mobile/shared/src/commonMain/kotlin/screens/LoginScreen.kt`:
  - Contains two buttons:
    - Line 32: `onClick = { navigator?.push(CitizenSubmitScreen()) }` ("Login as Citizen").
    - Line 40: `onClick = { navigator?.push(SarpanchVerifyScreen()) }` ("Login as Local Sarpanch").
- `mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt`:
  - Only declares two input fields: `title` (line 26, 60) and `description` (line 27, 69).
  - Contains dummy "Capture Evidence" button with empty lambda `/* Launch Device Camera/Mic Intents */` (line 51).
  - Submit button (lines 79-90) executes a simulated delay:
    ```kotlin
    coroutineScope.launch {
        try {
            // Simulate API call to Next.js using Ktor
            // apiClient.submitIssue(...)
            kotlinx.coroutines.delay(1000)
        } finally {
            isSubmitting = false
            navigator?.pop()
        }
    }
    ```
  - Lacks: `district` input, `domain` input, "Attach photos/videos" mock data injection, "Get current location" mock data injection, real Ktor call, and UI feedback dialogs.
- `mobile/shared/src/commonMain/kotlin/network/ApiClient.kt`:
  - Only contains GET methods (`getAnalytics`, `getChallenges`, `getProposals`, `getFunds`, `getPendingUsers`, `getAuditLogs`) targeting hardcoded `http://10.0.2.2:3000` (lines 20-42).
  - Has zero POST methods.
  - Lacks platform-adaptive or configurable base URL (e.g. `http://localhost:3000` for desktop JVM testing vs `http://10.0.2.2:3000` for Android emulator).
- `mobile/shared/src/commonMain/kotlin/network/Models.kt`:
  - Contains models for responses (`Challenge`, `ChallengesResponse`, `Proposal`, `Fund`, etc.).
  - Completely lacks submission request/response models (`MobileSubmitRequest`, `MobileSubmitResponse`).

### 1.5 Backend API Endpoint Contract (`POST /api/mobile/challenges`)
- File: `web/src/app/api/mobile/challenges/route.ts`
- Zod validation schema (lines 6-16):
  ```ts
  const mobileSubmitSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    district: z.string(),
    location: z.string(),
    reporterId: z.string(), // Simulating auth session from mobile
    evidenceUrl: z.string().optional(),
    track: z.string().optional(),
    domain: z.string().optional(),
    urgency: z.string().optional(),
  });
  ```
- Processing:
  - Invokes `categorizeProblemWithAI` (lines 32-41).
  - Creates record via `prisma.challenge.create` with `reportedById: reporterId`, `status: "REPORTED"`, `evidence: evidenceUrl ? JSON.stringify({ media: evidenceUrl }) : null`.
  - Generates tracking ID: `trackingId = IN-JH-${new Date().getFullYear()}-${randomSuffix}` (line 58).
  - Returns (lines 82-89):
    ```json
    {
      "success": true,
      "trackingId": "IN-JH-2026-XXXX",
      "challengeId": "<cuid>",
      "track": "TRACK_A_INNOVATION",
      "trackRouting": "...",
      "status": "REPORTED"
    }
    ```
- Critical Backend Constraint:
  `reportedById` is a foreign key to `User.id` in `web/prisma/schema.prisma:75-76`. If `reporterId` does not match an existing user ID in `dev.db`, Prisma throws a foreign key error resulting in HTTP 500.

---

## 2. Logic Chain

1. **R1 Problem Submission UI Analysis**:
   - `CitizenSubmitScreen.kt` has scaffold, theme, and basic Voyager structure, but only inputs `title` and `description`.
   - The user request requires inputs for: `title`, `description`, `district`, and `domain`.
   - The request also requires two explicit action buttons:
     a. "Attach photos/videos": On tap, inject simulated multimedia URL/data into state (e.g. `evidenceUrl = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6"`) and display attached media status/name to the user.
     b. "Get current location": On tap, inject simulated GPS coordinate data (e.g. `location = "23.3441° N, 85.3096° E (Ranchi Block)"`) and display active location status to the user.
   - Form validation must enforce minimum length constraints before enabling submission (`title.length >= 5`, `description.length >= 10`, `district.isNotBlank()`, `location.isNotBlank()`).
   - Loading indicator and user feedback (success dialog showing `trackingId` and error dialog showing message) are needed.

2. **R2 Backend Integration Analysis**:
   - `ApiClient.kt` requires a new method: `suspend fun submitChallenge(request: MobileSubmitRequest): MobileSubmitResponse`.
   - The Ktor client already has `ContentNegotiation` and `kotlinx-json` configured in `shared/build.gradle.kts`.
   - Target URL requirement: `http://10.0.2.2:3000` (Android emulator loopback) with fallback/configuration for desktop/host (`http://localhost:3000`).
   - KMP already defines `expect fun getPlatformName(): String` returning `"Android"` on Android and `"Desktop"` on Desktop.
   - Therefore, `ApiClient` can dynamically default its base URL:
     ```kotlin
     val defaultBaseUrl = if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"
     ```
     and allow an optional constructor parameter or setter `ApiClient(var baseUrl: String = defaultBaseUrl)` for testing and arbitrary host targets.

3. **Multiplatform Execution & Judge Verification Strategy**:
   - The mobile project has both `androidApp` (which produces `androidApp-debug.apk`) and `desktopApp` (which produces JVM desktop runtime on Windows).
   - In a headless or automated judge environment, Android UI automation without an active emulator/ADB daemon is not possible. However, the exact same Compose UI and KMP shared code can run via `:desktopApp` or via a programmatic verification script in `shared/src/commonTest` or `desktopApp/src/jvmMain/kotlin/JudgeVerification.kt`.
   - This enables an agent acting as judge to execute end-to-end verification directly on the host, sending actual HTTP POST requests through Ktor to the Next.js backend, and querying Prisma SQLite database to verify persistence.

---

## 3. Caveats

1. **Backend SQLite Foreign Key on `reporterId`**:
   `POST /api/mobile/challenges` in `web/src/app/api/mobile/challenges/route.ts` requires `reporterId` to reference an existing `User` in SQLite. If arbitrary IDs like `"test-citizen-id"` are sent, Prisma fails.
   - *Recommendation*: Backend route should implement fallback to find the first `CITIZEN` user in `prisma.user` if the provided `reporterId` is not found, or the mobile app should use a seeded citizen user ID (`citizen.reporter@jharkhand.org`).
2. **Ktor CIO Engine on Desktop**:
   Desktop target uses `ktor-client-cio:2.3.7`. Ensure network permissions and local firewall on Windows allow outbound HTTP connections to `localhost:3000`.
3. **Android Target Network Security**:
   `androidApp/src/androidMain/AndroidManifest.xml` must have `<uses-permission android:name="android.permission.INTERNET" />` and `android:usesCleartextTraffic="true"` to communicate with cleartext `http://10.0.2.2:3000`.

---

## 4. Conclusion

The mobile project is in an excellent foundational state:
- Gradle 8.11, JDK 17, and Android SDK 34 compile both Android APK and Desktop JVM targets with zero errors.
- Koin, Voyager, Compose Multiplatform, and Ktor 2.3.7 are fully wired in `mobile/shared/build.gradle.kts`.
- Implementation requirements are well-defined, localized, and clean:
  1. **`network/Models.kt`**: Add `@Serializable data class MobileSubmitRequest` and `@Serializable data class MobileSubmitResponse`.
  2. **`network/ApiClient.kt`**: Add `submitChallenge(request: MobileSubmitRequest): MobileSubmitResponse` with platform-adaptive base URL (`http://10.0.2.2:3000` on Android, `http://localhost:3000` on Desktop).
  3. **`screens/CitizenSubmitScreen.kt`**: Upgrade form with `district`, `domain`, "Attach Photos/Videos" (mock data injection), "Get Current Location" (mock data injection), real `apiClient.submitChallenge` call, and success/error alert dialogs.
  4. **`androidApp/src/androidMain/AndroidManifest.xml`**: Ensure `INTERNET` permission and `usesCleartextTraffic="true"` are configured.
  5. **Judge Verification Runner**: Provide a runnable task/script in `desktopApp` or `shared` to verify the complete submission pipeline end-to-end.

---

## 5. Proposed Implementation Specifications

### 5.1 Models Specification (`network/Models.kt`)
```kotlin
@Serializable
data class MobileSubmitRequest(
    val title: String,
    val description: String,
    val district: String,
    val location: String,
    val reporterId: String,
    val evidenceUrl: String? = null,
    val domain: String? = null,
    val urgency: String? = "MEDIUM",
    val track: String? = null
)

@Serializable
data class MobileSubmitResponse(
    val success: Boolean = false,
    val trackingId: String? = null,
    val challengeId: String? = null,
    val track: String? = null,
    val trackRouting: String? = null,
    val status: String? = null,
    val error: String? = null
)
```

### 5.2 ApiClient Specification (`network/ApiClient.kt`)
```kotlin
package network

import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import io.ktor.client.request.*
import io.ktor.client.call.body
import io.ktor.http.ContentType
import io.ktor.http.contentType
import getPlatformName

class ApiClient(
    var baseUrl: String = if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"
) {
    val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    suspend fun submitChallenge(request: MobileSubmitRequest): MobileSubmitResponse {
        return client.post("$baseUrl/api/mobile/challenges") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()
    }

    suspend fun getAnalytics(): AnalyticsResponse = client.get("$baseUrl/api/analytics").body()
    suspend fun getChallenges(): ChallengesResponse = client.get("$baseUrl/api/challenges").body()
    suspend fun getProposals(): ProposalsResponse = client.get("$baseUrl/api/proposals").body()
    suspend fun getFunds(): FundsResponse = client.get("$baseUrl/api/funds").body()
    suspend fun getPendingUsers(): PendingUsersResponse = client.get("$baseUrl/api/admin/pending-users").body()
    suspend fun getAuditLogs(): AuditLogsResponse = client.get("$baseUrl/api/audit-logs").body()
}
```

### 5.3 CitizenSubmitScreen Specification (`screens/CitizenSubmitScreen.kt`)
Key UI Components to incorporate:
- **District Field**: Dropdown / OutlinedTextField with suggestions (e.g., Ranchi, Dhanbad, Gumla, Bokaro, East Singhbhum, Hazaribagh, Deoghar).
- **Domain Field**: Dropdown / OutlinedTextField with suggestions (e.g., Water Management, Public Service Delivery, Healthcare, Education, Infrastructure, Agriculture).
- **Location Section**:
  - Button: "📍 Get Current Location"
  - Action: Sets `location = "23.3441° N, 85.3096° E (Ranchi Block)"`
  - Visual Badge: "✓ Location captured: 23.3441° N, 85.3096° E"
- **Media Evidence Section**:
  - Button: "📷 Attach Photos / Videos"
  - Action: Sets `evidenceUrl = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"` and `attachedFileName = "bridge_damage_inspection.jpg"`
  - Visual Badge: "✓ Attached: bridge_damage_inspection.jpg (Simulated)"
- **Submit Action**:
  - Validates `title.length >= 5 && description.length >= 10 && district.isNotBlank() && location.isNotBlank()`.
  - Displays `CircularProgressIndicator` while submitting.
  - Calls `apiClient.submitChallenge(...)`.
  - On Success: Shows `AlertDialog` with `trackingId`, `challengeId`, and assigned track.
  - On Error: Shows `AlertDialog` or `Snackbar` with error message.

---

## 6. Verification Method

### 6.1 Build Verification
Execute from project root (`a:/Development/Antigravity/SIH26043`):
```powershell
cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& cd mobile && gradlew assembleDebug"
```
**Expected Output**: `BUILD SUCCESSFUL` with APK at `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`.

```powershell
cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& cd mobile && gradlew :desktopApp:jvmJar"
```
**Expected Output**: `BUILD SUCCESSFUL` with JAR at `mobile/desktopApp/build/libs/desktopApp-jvm.jar`.

### 6.2 End-to-End Submission Verification (Mobile -> Backend API -> SQLite)
1. Ensure Next.js web server is active on `http://localhost:3000`.
2. Run test script or verification runner to submit a mock challenge:
   ```json
   {
     "title": "Damaged Culvert on Rural Road",
     "description": "Culvert collapse disrupting access between 3 panchayats during monsoon.",
     "district": "Gumla",
     "location": "River Block 4, Gumla (Lat: 23.04, Long: 84.54)",
     "reporterId": "<valid_citizen_id>",
     "evidenceUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
     "domain": "Infrastructure",
     "urgency": "HIGH"
   }
   ```
3. Query Prisma SQLite database:
   ```powershell
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.challenge.findFirst({ where: { title: 'Damaged Culvert on Rural Road' } }).then(console.log).finally(() => prisma.\$disconnect());"
   ```
4. Confirm `publicTrackingId` matches `IN-JH-2026-XXXX`, `status` is `REPORTED`, and `evidence` contains the attached media URL.

### 6.3 Invalidation Conditions
- Any compile error in `mobile/shared/src/commonMain/kotlin/...` breaking `assembleDebug` or `:desktopApp:jvmJar`.
- Failure of Ktor to serialize/deserialize `MobileSubmitRequest`/`MobileSubmitResponse`.
- HTTP 500 error on `POST /api/mobile/challenges` due to SQLite foreign key violation if `reporterId` is unmapped.
