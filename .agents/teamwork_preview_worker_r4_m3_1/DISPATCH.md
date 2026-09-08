# Dispatch: Milestone 3 - Cross-Platform Refactor & Bug Fixes
- Role: Worker (teamwork_preview_worker)
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m3_1
- Source of Truth: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md
- Scope: Fix Web TypeScript test errors, fix Mobile Android permissions & model contracts, and verify zero-error builds on both /web and /mobile.

## 2026-09-05T11:22:09Z
You are teamwork_preview_worker (Worker M3: Cross-Platform Refactor & Bug Fixes).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m3_1
Your original parent conversation ID is: 7855deb8-3512-4bc1-b772-4058637aec00

MANDATORY FIRST STEP: Read a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md and a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m3_1/DISPATCH.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You own exclusively:
- web/tests/challenger_ai_lifecycle_stress.test.ts
- mobile/androidApp/src/androidMain/AndroidManifest.xml
- mobile/shared/src/commonMain/kotlin/network/Models.kt
- mobile/gradle.properties

Reference Inputs:
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r4_survey_2/handoff.md
- a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r4_survey_1/handoff.md

Objective:
1. Web TypeScript Cleanliness:
   In web/tests/challenger_ai_lifecycle_stress.test.ts (lines 912-917), cast `(draft as any).abstract`, `(draft as any).budget`, `(draft as any).timelineMonths`.
   Run `cmd.exe /c npx tsc --noEmit` from web/ and verify 0 TypeScript errors.
2. Web Production Build Verification:
   Run `cmd.exe /c npm run build` from web/ and verify 0 errors (Exit code 0, 43/43 routes generated).
3. Mobile Android Permissions & Cleartext Traffic:
   In mobile/androidApp/src/androidMain/AndroidManifest.xml:
   Add `<uses-permission android:name="android.permission.INTERNET" />` and `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />` before `<application>`.
   Add `android:usesCleartextTraffic="true"` inside `<application ...>`.
4. Mobile Analytics Deserialization Parity:
   In mobile/shared/src/commonMain/kotlin/network/Models.kt:
   Update DomainDistribution data class to support both `name` and `domain` with default values:
   `val domain: String = "", val count: Int = 0, val name: String = ""`
   Ensure it never throws MissingFieldException.
5. Mobile Gradle Properties:
   In mobile/gradle.properties, append:
   `android.suppressUnsupportedCompileSdk=34`
   `kotlin.native.ignoreDisabledTargets=true`
6. Mobile Build Verification:
   Execute the exact acceptance criteria command from mobile/:
   `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"`
   Verify `BUILD SUCCESSFUL` with 0 errors (Exit code 0) and confirm the debug APK at `mobile/androidApp/build/outputs/apk/debug/androidApp-debug.apk`.

Output:
Write your handoff report to a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r4_m3_1/handoff.md.
Send a message back to parent (conversation ID: 7855deb8-3512-4bc1-b772-4058637aec00) when complete.

