## 2026-09-08T14:08:34Z
You are the Compose Multiplatform UI Worker (worker_m3) for Project Orchestrator (Round 5).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/worker_m3/
The authoritative project request is at: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (Subagents MUST read it before starting work. Do NOT skip reading it; read lines 195-221 for latest round requirements).
Scope Document: a:/Development/Antigravity/SIH26043/PROJECT.md
Reference Surveys: a:/Development/Antigravity/SIH26043/.agents/survey_mobile/handoff.md and a:/Development/Antigravity/SIH26043/.agents/worker_m2/handoff.md

Write Ownership: You EXCLUSIVELY own:
`a:/Development/Antigravity/SIH26043/mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt`
Do NOT touch ApiClient.kt, Models.kt, or any web files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Description (Milestone 3):
Implement the complete Compose Multiplatform Problem Submission UI in `CitizenSubmitScreen.kt`:
1. Form Inputs:
   - `title`: OutlinedTextField with character counter or label.
   - `description`: OutlinedTextField (multi-line, minLines = 3).
   - `district`: DropdownMenu or picker populated with Jharkhand districts (e.g., Ranchi, Dhanbad, Gumla, Bokaro, East Singhbhum, Hazaribagh, Deoghar, Palamu, Giridih, Ramgarh, Simdega, Dumka, etc.).
   - `domain`: DropdownMenu or picker populated with societal domains (e.g., "Water Management", "Agriculture", "Healthcare", "Urban Infrastructure", "Rural Livelihoods", "Public Service Delivery", "Education", "Environment", "Energy", "Sanitation").
2. Simulated Mock Data Injection Buttons (Per Requirement R1):
   - Button 1: "📍 Get Current Location"
     - On tap: Injects simulated GPS location data into state: e.g. `"23.3441° N, 85.3096° E, Ranchi Urban Block"`
     - Shows visual confirmation (e.g., Card or Badge showing captured location).
   - Button 2: "📷 Attach Photos / Videos"
     - On tap: Injects simulated evidence URL into state: e.g. `"https://storage.jharkhand.gov.in/evidence/photo_2026_gumla_bridge.jpg"`
     - Shows visual confirmation (e.g., Card or Badge showing attached file name or URL).
3. Backend API Integration & Feedback (Per Requirement R2):
   - Submit Button:
     - Validates form (e.g. `title.length >= 5`, `description.length >= 10`, `district.isNotBlank()`, `location.isNotBlank()`).
     - Shows `CircularProgressIndicator` during submission (`isSubmitting == true`).
     - Calls `apiClient.submitChallenge(MobileChallengeSubmission(title = title, description = description, district = district, location = location, domain = domain, evidenceUrl = evidenceUrl))`.
     - On Success (`response.success == true`):
       Displays `AlertDialog` with title "Submission Successful", showing `trackingId` (`${response.trackingId}`), `track` (`${response.track}`), and `status` (`${response.status}`). Clicking "OK" clears the form or pops the navigator.
     - On Error (`response.success == false` or exception):
       Displays error `AlertDialog` showing error message with "Dismiss" button.
4. Verification:
   Run Gradle build commands in `mobile/`:
   `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"`
   `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew :desktopApp:jvmJar"`
   Ensure both pass with exit code 0.
5. Write your completion report following the 5-component format to:
`a:/Development/Antigravity/SIH26043/.agents/worker_m3/handoff.md`
Update `progress.md` in your working directory and notify your parent.
