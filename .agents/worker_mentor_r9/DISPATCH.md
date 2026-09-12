# Dispatch: Industry Mentor Dashboard Implementation Worker (M2)

You are a implementation worker (`teamwork_preview_worker`).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/worker_mentor_r9
The project root is: a:/Development/Antigravity/SIH26043

MANDATORY FIRST STEP:
Read the authoritative user request at:
a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md
Specifically review the latest section under timestamp 2026-09-09T14:19:46Z.

Read the project specification at:
a:/Development/Antigravity/SIH26043/.agents/orchestrator_r9/PROJECT.md
Read the detailed Industry Mentor Dashboard mining report and handoff at:
a:/Development/Antigravity/SIH26043/.agents/spec_miner_mentor_r9/report.md
a:/Development/Antigravity/SIH26043/.agents/spec_miner_mentor_r9/handoff.md
Read the architecture guidelines at:
a:/Development/Antigravity/SIH26043/.agents/explorer_arch_r9/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Write Boundaries (EXCLUSIVELY OWNED):
You own all files under:
`web/src/app/dashboard/industry/`
specifically:
- `web/src/app/dashboard/industry/page.tsx`
- `web/src/app/dashboard/industry/components/` (all subcomponents: `IndustryNavbar.tsx`, `IndustryHomeView.tsx`, `IndustryEscrowView.tsx`, `IndustryTeamsView.tsx`, `IndustryKanbanView.tsx`, `IndustryTrlView.tsx`, `IndustrySettingsView.tsx`, `MilestoneReviewModal.tsx`, `BilateralIpModal.tsx`, `types.ts`, `mockData.ts`, etc.)
DO NOT modify any files outside `web/src/app/dashboard/industry/`.

Your Mission:
1. Completely eliminate any and all `<p>Module in development.</p>` or generic placeholder text.
2. Build out all Navigation Tabs and sub-views matching `web/new page/mentor page.pdf`:
   - `home`:
     - Top metrics (Active Projects 3, Mentoring Hours Logged 14, Pending Milestone Reviews 2).
     - Active Projects card with TRL 5 badge and TRL 70% visual progress bar.
     - Scheduled Office Hours monthly calendar with `<` `>` month controls and highlighted active meeting days (11, 15, 17).
     - Milestone Evaluation & Technical Review Desk card with CAD schematic preview, decision buttons ("Approve Stage", "Request Revisions"), and live Threaded Technical Feedback chat with input area ("Type a message...", attachment, send).
   - `escrow`: Corporate CSR Grant & Escrow Ledger tracking pledged vs disbursed funds, milestone tranche breakdowns (Tranche 1 ₹75k released, Tranche 2 ₹1.00L locked in escrow), and university expenditure summaries with Bill of Materials sensor purchase receipts.
   - `teams`: Lab Teams & Faculty Directory displaying researcher profiles, academic degrees, department, roles (Faculty Guide, Embedded Systems Researcher, Machine Learning Specialist), direct message action, publications, and corporate talent flagging.
   - `tasks`: 4-column Technical Kanban Task Board ("To Do", "In Lab Testing", "Awaiting Mentor Review", "Completed") with ticket creation modal, priorities, assignees, and card progression.
   - `trl`: Active TRL & Revision History displaying chronological engineering changelog (schematics, firmware commits, test logs) and formal TRL 1-9 progression audit trail.
   - `settings`: Mentor Settings & Office Hours Configuration (weekly availability slots, domain expertise tags, notifications) and Logout confirmation dialog.
   - Interactive CAD & Circuit Review Desk Modal:
     - Interactive CAD schematic viewer with zoom (+/-), pan, and sticky note redline annotations.
     - Test Points panel: Test Point 1 (Node 1 14.8V), Test Point 2 (Node 2 15.5V), Test Point 3 (Node 3 12.3V), Test Point 4 (Node 4 19.8V).
     - Real-time voltage test graphs: oscilloscope waveform sparklines for each node.
     - Rubric scoring sliders (Technical Feasibility, Component Durability, Cost Efficiency) dynamically computing project TRL progress.
     - Lab video demo & test proof player (`Thermal_Stress_Test.mp4`).
     - Dual Decision Gates: Functional "Send Revisions to Lab" (orange) and "Sign-Off & Authorize Escrow Tranche" (green) buttons.
   - Bilateral IP Assignment & Royalty Term Sheet Modal:
     - "NISP Policy Compliant" verified badge.
     - Linked interactive royalty sliders (Host University / TTO Share vs Industry Sponsor Share) with bidirectional rebalancing and NISP guardrails (<30% academic equity warning).
     - Digital signature status (University TTO Sign-Off and Corporate Legal Sign-Off).
     - Counter-Offer proposal desk modal and Dual DSC Execution modal.
3. Clean UI Layout: Seamlessly integrate with the outer dashboard layout (do not render redundant outer sidebar; present navigation cleanly within the content workspace).
4. Run build verification:
   Execute `npm run build` in `web/` to confirm 0 compilation errors.
   Verify that `grep -rn "Module in development" web/src/app/dashboard/industry/` returns 0 results.

Output:
Write your implementation report to:
`a:/Development/Antigravity/SIH26043/.agents/worker_mentor_r9/report.md`
and handoff to:
`a:/Development/Antigravity/SIH26043/.agents/worker_mentor_r9/handoff.md`
Send a message when complete.

## 2026-09-09T14:33:39Z
You are assigned to implement Milestone 2: Industry Mentor Dashboard Implementation & Fix.
Your working directory: a:/Development/Antigravity/SIH26043/.agents/worker_mentor_r9
Project root: a:/Development/Antigravity/SIH26043
Implement all 7 navigation tabs, Home KPIs/calendar/review desk/chat, Escrow ledger, Lab teams directory, 4-column Kanban board with ticket creation, TRL audit trail, Settings & logout, CAD schematic viewer with test points and oscilloscope graphs, rubric sliders computing TRL, Dual Decision Gates, and Bilateral IP Term Sheet with linked royalty sliders (NISP guardrails) and DSC execution. Ensure 0 'Module in development' placeholders and verify npm run build passes with 0 errors. Report your findings and handoff when done.
