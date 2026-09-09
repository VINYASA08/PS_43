# Dispatch: Government Dashboard Implementation Worker (M1)

You are a implementation worker (`teamwork_preview_worker`).
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/worker_gov_r9
The project root is: a:/Development/Antigravity/SIH26043

MANDATORY FIRST STEP:
Read the authoritative user request at:
a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md
Specifically review the latest section under timestamp 2026-09-09T14:19:46Z.

Read the project specification at:
a:/Development/Antigravity/SIH26043/.agents/orchestrator_r9/PROJECT.md
Read the detailed Government Dashboard mining report and handoff at:
a:/Development/Antigravity/SIH26043/.agents/spec_miner_gov_r9/report.md
a:/Development/Antigravity/SIH26043/.agents/spec_miner_gov_r9/handoff.md
Read the architecture guidelines at:
a:/Development/Antigravity/SIH26043/.agents/explorer_arch_r9/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Write Boundaries (EXCLUSIVELY OWNED):
You own all files under:
`web/src/app/dashboard/gov/`
specifically:
- `web/src/app/dashboard/gov/page.tsx`
- `web/src/app/dashboard/gov/components/` (all subcomponents: `GovGisMap.tsx`, `GovIpQueue.tsx`, `GovProjectsView.tsx`, `GovDistrictsView.tsx`, `GovIpRegistryView.tsx`, `GovReportsView.tsx`, `GovSettingsModal.tsx`, `types.ts`, `mockData.ts`, etc.)
DO NOT modify any files outside `web/src/app/dashboard/gov/`.

Your Mission:
1. Completely eliminate any and all `<p>Module in development.</p>` or generic placeholder text.
2. Build out all 5 Navigation Tabs (`dashboard`, `projects`, `districts`, `ip`, `reports`, plus settings modal) with rich, complete, interactive views matching `web/new page/government page.pdf`:
   - `dashboard`:
     - 4 Top KPI cards (Districts Monitored 24, Active Civic R&D 186, CSR Funds ₹4.2 Cr, Patents 38).
     - Interactive GIS Telemetry Map: SVG-based map of Jharkhand with responsive zoom (+/-), pan/reset, edge-to-edge fullscreen toggle, 3-layer switcher (Innovation Density, CSR Fund Deployment, Civic Problem Influx), Department flag filters (Drinking Water, Roads, Energy, Urban Development), 4 pin markers (Academic Hubs, Corporate Sponsors, Bench Trials, Amber Alert Civic Distress Zones with One-Click State Seed Grant modal), 4-data-point Hover Telemetry Tooltips, and Funding Utilization progress gauge (72% target, ₹1.2 Cr deployed).
     - State IP Compliance Queue: Filterable/searchable table, digital verification badges (DSC sign-offs, NISP alignment), "Approve & Issue" action that launches the tamper-evident State Government Innovation Certificate auto-generation dialog with DigiLocker credentials push.
   - `projects`: Master table of 186 active civic R&D projects with search and multi-filters (University, Corporate Sponsor, Technology Domain, TRL 1-9).
   - `districts`: Management portal for 24 District Nodal Officers (DNOs) with performance scorecards, triage resolution speeds, and municipal vs academic routing ratios.
   - `ip`: IP Registry summary counters (38 Agreements, 14 Licenses, ₹1.8 Cr Royalties), tripartite legal audit ledger, contract splits (e.g. 50/50, 40/60) with Registered & Locked badges, SHA-256 cryptographic hashes, and interactive [View Verified Legal Deed] PDF viewer modal.
   - `reports`: Compliance and export engine generating CSV/PDF downloads for CM Office, Dept of Higher Education, and NITI Aayog/DST.
   - `settings`: DNO credential management modal across 24 districts and secure session sign-out.
3. Clean UI Layout: Seamlessly integrate with the outer dashboard layout (do not render an awkward duplicate dark outer sidebar; present navigation cleanly within the content workspace).
4. Run build verification:
   Execute `npm run build` in `web/` to confirm 0 compilation errors.
   Verify that `grep -rn "Module in development" web/src/app/dashboard/gov/` returns 0 results.

Output:
Write your implementation report to:
`a:/Development/Antigravity/SIH26043/.agents/worker_gov_r9/report.md`
and handoff to:
`a:/Development/Antigravity/SIH26043/.agents/worker_gov_r9/handoff.md`
Send a message when complete.
