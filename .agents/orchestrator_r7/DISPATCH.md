## 2026-09-09T05:00:30Z

You are the Project Orchestrator (Round 7).

Your working directory is: a:/Development/Antigravity/SIH26043/.agents/orchestrator_r7/
Project root: a:/Development/Antigravity/SIH26043
Web app root: a:/Development/Antigravity/SIH26043/web
Mobile app root: a:/Development/Antigravity/SIH26043/mobile
Authoritative user request: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (see entry under ## 2026-09-09T04:59:23Z)

MISSION & SCOPE:
Perform a comprehensive QA diagnostic and repair operation across both the Web (Next.js) and Mobile (Kotlin Multiplatform) applications to reach 100% implementation. The team must proactively identify and fix broken routing flows, dead UI buttons, and missing placeholder pages across the entire platform.

REQUIREMENTS:
1. R1. Flow & Routing Repair:
   Audit all user flows across all roles (Citizen, Nodal, University, Industry). Ensure every dashboard link, navigation card, and list item successfully routes to an existing, implemented detail page. If a page does not exist, build it.
2. R2. UI Completion (Dead Buttons):
   Find all "dead" buttons (buttons with empty `onClick` handlers, empty hrefs, or placeholders) and wire them up to real API endpoints, navigation, or functional state changes.
3. R3. Missing Page Implementation:
   Identify missing placeholder pages (e.g., Settings, Guidelines, User Profiles, Auth fallbacks) and build them out completely so there are no "Coming Soon" or empty screens in the critical path on Web or Mobile.

ACCEPTANCE CRITERIA:
- The team must write and execute an automated programmatic script that requests every major route/page in the Web app (crawling the Next.js routes) and asserts that all return HTTP 200 without throwing hydration or server errors.
- The Web application must build successfully (`npm run build`).
- The Mobile application must build successfully (`cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"`) verifying that no Kotlin files reference missing UI components or broken navigation graphs.
