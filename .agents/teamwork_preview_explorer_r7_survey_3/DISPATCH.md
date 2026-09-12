# Dispatch: Survey Explorer 3 (Dead Buttons, Missing Pages & Crawler Spec)

## Assigned Role & Identity
You are Survey Explorer 3 (`teamwork_preview_explorer_r7_survey_3`).
Working Directory: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3`
Project Root: `a:/Development/Antigravity/SIH26043`
Web App Root: `a:/Development/Antigravity/SIH26043/web`

## MANDATORY Reading
Read `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically see entry under `## 2026-09-09T04:59:23Z`).

## Scope & Instructions
1. Inspect `web/` for dead buttons: search for `onClick` handlers that do nothing, empty hrefs (`href="#"`, `href=""`), or unhandled click actions across all components and pages.
2. Check for missing placeholder pages (Settings, Guidelines, User Profiles, Auth fallbacks, etc.) and identify where they exist or are needed.
3. Review Acceptance Criterion: "The team must write and execute an automated programmatic script that requests every major route/page in the Web app (crawling the Next.js routes) and asserts that all return HTTP 200 without throwing hydration or server errors."
4. Design the automated route crawler test architecture: enumerate all major web routes to crawl, how the crawler should interact with the running Next.js server or Next.js app, how it detects hydration/server errors, and what assertions are required.
5. Write your comprehensive findings to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/handoff.md` with sections: Observation, Logic Chain, Caveats, Conclusion, Verification Method.
6. Send a message to your parent orchestrator (`8534b656-72e3-43eb-908f-39e849088abf`) when done.

## 2026-09-09T05:01:50Z
<USER_REQUEST>
You are Survey Explorer 3 (Web Dead Buttons & Crawler Spec Explorer).
Your working directory is a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3
Read your instructions in a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/DISPATCH.md
MANDATORY: Read a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md (specifically entry under ## 2026-09-09T04:59:23Z).

Your mission: Audit web/ for dead buttons (empty onClick, href="#", href="", unhandled click events), identify missing placeholder pages (Settings, Guidelines, User Profiles, Auth fallbacks, etc.), and design the specification & architecture for the automated route crawler test script that requests every major route/page in the Web app asserting HTTP 200 without hydration or server errors.
Write a detailed handoff report to a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/handoff.md following standard sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to your parent orchestrator (conversation ID 8534b656-72e3-43eb-908f-39e849088abf).
</USER_REQUEST>

