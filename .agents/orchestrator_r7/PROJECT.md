# Project: Comprehensive QA Diagnostic and Repair (Round 7)

## Architecture
- **Web Platform (Next.js 16.3.4, React 19, TypeScript, Tailwind CSS)**:
  - Role-based routing across Citizen, District Nodal Officer, University PI, Industry Partner, Government Administrator.
  - Core layouts: `web/src/app/layout.tsx`, `web/src/app/dashboard/layout.tsx`.
  - Feature hubs: `/dashboard/chat` (Industry-University collaboration), `/dashboard/open-board` (Contributor micro-tasks), `/apply/[challengeId]` (Mentor applications), `/whatsapp-intake` (Citizen intake simulation), `/dashboard/settings` (Profile & 2FA security).
  - Next.js Error boundaries: `not-found.tsx` and `error.tsx`.
- **Mobile Application (Kotlin Multiplatform, Compose Multiplatform, Voyager, Ktor, OpenJDK 17)**:
  - Compose UI screens in `mobile/shared/src/commonMain/kotlin/screens/`: `WelcomeScreen.kt`, `LoginScreen.kt`, `MainScreen.kt`, `HomeTab.kt`, `SubmitTab.kt`, `CitizenSubmitScreen.kt`, `SarpanchVerifyScreen.kt` (District Nodal Triage), `GovDashboardScreen.kt`, `ProfileTab.kt`, and `ChallengeDetailScreen.kt`.
  - Networking in `mobile/shared/src/commonMain/kotlin/network/`: `ApiClient.kt` and `Models.kt`.
  - Desktop JVM target (`desktopApp:assemble`) verifying Compose components and navigation graphs under JDK 17.
- **Verification Harness**:
  - Automated Route Crawler (`web/tests/test_route_crawler.ts` / `.mjs`) verifying HTTP 200, Content-Type, payload size, and zero server/hydration errors across all 25 major web routes (27 route variations tested).
  - Automated builds: `npm run build` and `gradlew.bat desktopApp:assemble`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Web Unauthorized Redirection Repair | Replace dynamic `/dashboard/${role}` in `gov/`, `university/`, `industry/` with safe fallback to prevent 404s for Citizen/Expert | M1 | Survey 1 (Obs 1.2.1) |
| 2 | Web Dashboard Layout Role Navigation | Update `dashboard/layout.tsx` to display role-appropriate links for Citizen/Expert without pointing to restricted dashboards | M1 | Survey 1 (Obs 1.5) |
| 3 | Web Orphan Routes Integration | Add navigation links for `/dashboard/chat` and `/dashboard/open-board` in `dashboard/layout.tsx`; link `/apply/[challengeId]` | M1 | Survey 1 (Obs 1.3), Survey 3 |
| 4 | Web Proposal & Fund Parameter Alignment | Fix `/dashboard/university/proposal/[id]` to distinguish new vs edit (`PUT /api/proposals/[id]`); fix `/dashboard/industry/fund/[id]` to inspect commitment vs pledge proposal | M1 | Survey 1 (Obs 1.4) |
| 5 | Web Next.js Fallback Pages | Implement branded `not-found.tsx` and `error.tsx` adhering to the Tailwind design system | M1 | Survey 3 (Obs 1.2) |
| 6 | Web Dead Buttons Wiring | Wire emoji, paperclip, camera, mic, and call buttons in `whatsapp-intake/page.tsx`; expose 2FA config card in `dashboard/settings/page.tsx`; make profile badge in `dashboard/layout.tsx` clickable | M1 | Survey 3 (Obs 1.1) |
| 7 | Mobile Screen Navigation & Role Rescue | Add Gov login button to reach `GovDashboardScreen`, update Sarpanch login to District Nodal Officer, add logout button on `ProfileTab.kt`, fix `CitizenSubmitScreen` back button in `SubmitTab` | M2 | Survey 2 (Obs 1.3) |
| 8 | Mobile Dead Buttons & API Wiring | In `SarpanchVerifyScreen.kt`, fetch real issues via `apiClient.getChallenges()`, wire "Verify & Route" and "Mark Duplicate" to `POST /api/mobile/verify` | M2 | Survey 2 (Obs 1.3, 1.4) |
| 9 | Mobile Challenge Tracking Screen | Create `ChallengeDetailScreen.kt` showing 5-stage timeline from `GET /api/track/{id}`; make cards in `HomeTab.kt` clickable to push detail screen | M2 | Survey 2 (Obs 1.3, 1.4) |
| 10 | Mobile ApiClient Methods | Add `verifyChallenge` (`POST /api/mobile/verify`) and `getTrackDetails` (`GET /api/track/{id}`) with data models in `ApiClient.kt` and `Models.kt` | M2 | Survey 2 (Obs 1.4) |
| 11 | Automated Web Route Crawler Test Suite | Implement and execute `web/tests/test_route_crawler.ts` testing all 25 public, dashboard, dynamic, and query routes for HTTP 200 and zero server/hydration errors | M3 | Acceptance Criteria & Survey 3 |
| 12 | Next.js Clean Production Build | Execute `npm run build` in `web/`, verifying 0 TypeScript and Turbopack errors across all routes | M3 | Acceptance Criteria |
| 13 | Mobile Desktop Clean Assemble Build | Execute `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"` in `mobile/`, verifying clean JVM compilation | M3 | Acceptance Criteria |
| 14 | Independent Verification Gate | Multi-agent review (2 Reviewers, 2 Challengers, 1 Forensic Auditor) verifying correctness, robustness, and authenticity | M3 | Workflow Protocol |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Web Flow & Routing Repair, Missing Pages & Dead Buttons | Implement F1–F6: 404 redirects, orphan route linking, proposal/fund params, not-found/error pages, whatsapp & settings dead buttons | Survey Complete | DONE |
| 2 | Mobile Navigation, Missing Screen & Dead Buttons | Implement F7–F10: GovDashboard rescue, Nodal triage live wiring, ChallengeDetailScreen, HomeTab clickable cards, ApiClient methods | Survey Complete | DONE |
| 3 | Automated Route Crawler & Acceptance Verification Gate | Implement F11–F14: route crawler execution, web build, mobile desktop assemble, multi-agent review, challenger stress tests, forensic audit | M1, M2 | DONE |

## Code Layout
- Web Application (`a:/Development/Antigravity/SIH26043/web/`):
  - `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/error.tsx`
  - `src/app/dashboard/layout.tsx`
  - `src/app/dashboard/gov/page.tsx`, `src/app/dashboard/university/page.tsx`, `src/app/dashboard/industry/page.tsx`
  - `src/app/dashboard/university/proposal/[id]/page.tsx`
  - `src/app/dashboard/industry/fund/[id]/page.tsx`
  - `src/app/challenge/[id]/page.tsx`, `src/app/apply/[challengeId]/page.tsx`
  - `src/app/whatsapp-intake/page.tsx`
  - `src/app/dashboard/settings/page.tsx`
  - `tests/test_route_crawler.mjs`, `tests/test_route_crawler.ts`
- Mobile Application (`a:/Development/Antigravity/SIH26043/mobile/`):
  - `shared/src/commonMain/kotlin/network/ApiClient.kt`
  - `shared/src/commonMain/kotlin/network/Models.kt`
  - `shared/src/commonMain/kotlin/screens/LoginScreen.kt`
  - `shared/src/commonMain/kotlin/screens/SarpanchVerifyScreen.kt`
  - `shared/src/commonMain/kotlin/screens/HomeTab.kt`
  - `shared/src/commonMain/kotlin/screens/SubmitTab.kt`
  - `shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt`
  - `shared/src/commonMain/kotlin/screens/ProfileTab.kt`
  - `shared/src/commonMain/kotlin/screens/ChallengeDetailScreen.kt`
  - `shared/src/commonMain/kotlin/screens/GovDashboardScreen.kt`
