# Orchestrator R7 Master Execution Plan

## Objective
Execute a comprehensive QA diagnostic and repair operation across Web (Next.js) and Mobile (Kotlin Multiplatform) applications to reach 100% implementation, eliminating broken flows, dead buttons, and missing placeholder screens, validated by an automated route crawler, web build, and desktop mobile assemble build.

## Phase Breakdown

### Phase 0: Step 0 Comprehensive Codebase Survey
- Dispatch 3 parallel Explorers:
  - `explorer_survey_1`: Web App Route Mapping & Flow Audit (Citizen, Nodal, University, Industry dashboards, links, cards, list items). Identify broken/dead routes or missing pages.
  - `explorer_survey_2`: Mobile App (Kotlin Multiplatform) Screen & Navigation Graph Audit. Identify missing screens, dead buttons, incomplete actions, or broken navigation in Compose.
  - `explorer_survey_3`: Missing Pages, Dead Buttons (`onClick`, `href="#"`, empty handlers), and Automated Web Route Crawler Architecture.
- Synthesize findings into `PROJECT.md` Feature Inventory and Milestone Decomposition.

### Phase 1: Milestone Execution Loop
- **Milestone 1**: Web Flow & Routing Repair + Missing Placeholder Pages Implementation
  - Build out all missing pages across roles (e.g. Settings, Guidelines, User Profiles, Auth fallbacks, missing detail views).
  - Repair all broken links and cards across dashboards.
- **Milestone 2**: Web UI Completion & Dead Buttons Wiring
  - Wire up all dead buttons, empty `onClick` handlers, and unlinked actions to real API endpoints, navigation, or functional state changes.
- **Milestone 3**: Mobile UI & Navigation Graph Completion
  - Wire up mobile buttons, actions, and ensure all mobile navigation routes lead to fully implemented Compose screens.
- **Milestone 4**: Automated Route Crawler Harness & Cross-Platform Acceptance Gate
  - Author automated script to crawl all Next.js routes and verify HTTP 200 without hydration or server errors.
  - Run full web build (`npm run build`).
  - Run full mobile build (`cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"`).
  - Run multi-agent verification gate: 2 Reviewers, 2 Challengers, 1 Forensic Auditor.

### Phase 2: Completion Handoff
- Produce comprehensive handoff report to Sentinel with evidence from test runners, builds, and audit gate.
