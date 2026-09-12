# Project: Dashboard UI Specification Alignment & Feature Polish (Round 9)

## Architecture
Next.js 16.3.4 (App Router) + React 19.2.8 + Tailwind CSS v4 + Framer Motion 13.2.0 + Lucide-react 1.41.0.
All new features are built as modular, zero-dependency, self-contained client components under:
- `web/src/app/dashboard/gov/components/`
- `web/src/app/dashboard/industry/components/`

Due to strict Content Security Policy (`connect-src 'self'`) and React 19 compatibility, all map telemetry, circuit diagrams, and sparkline graphs are authored as responsive, accessible SVG + React + Tailwind components without external tile or charting libraries.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Gov Top KPIs | 4 KPI cards (Districts Monitored 24, Active Civic R&D 186, CSR Funds ₹4.2 Cr, Patents Logged 38) | M1 | government page.pdf p.1 |
| 2 | Gov Interactive GIS Map | Zoom +/- controls, fullscreen frame toggle, compass reset dial | M1 | government page.pdf p.4-5 |
| 3 | Gov GIS Map Layers | 3-layer switcher: Innovation Density, CSR Fund Deployment, Civic Problem Influx | M1 | government page.pdf p.5 |
| 4 | Gov GIS Department Filter | Filter by Drinking Water & Sanitation, Road Construction, Energy & Power, Urban Development | M1 | government page.pdf p.5 |
| 5 | Gov GIS Map Markers | 4 interactive pin types: Academic Hubs, Corporate Sponsors, Bench Trials, Amber Alert Zones | M1 | government page.pdf p.5-6 |
| 6 | Gov State Seed Grant Action | One-click seed grant allocation modal on Amber Alert pins | M1 | government page.pdf p.6 |
| 7 | Gov GIS Hover Tooltips | District name & Nodal officer, active builds, CSR funds locked, triage ratio | M1 | government page.pdf p.6 |
| 8 | Gov Funding Utilization Gauge | Progress meter showing 72% of projected target and ₹1.2 Cr CSR Deployed | M1 | government page.pdf p.6 |
| 9 | Gov IP Compliance Queue | Filterable table, digital verification badges (DSC, NISP), approval trigger | M1 | government page.pdf p.1-2 |
| 10 | Gov DigiLocker Certificate Modal | Auto-generation of tamper-evident State Innovation Certificate pushed to DigiLocker | M1 | government page.pdf p.2 |
| 11 | Gov Projects Tab | Master table for 186 active civic R&D projects with search and multi-filters (Univ, Sponsor, Domain, TRL) | M1 | government page.pdf p.2 |
| 12 | Gov Districts Tab | 24 DNO scorecards, triage resolution speeds, municipal vs academic routing ratios | M1 | government page.pdf p.2 |
| 13 | Gov IP Registry Tab | Summary counters (38 Agmt, 14 Lic, ₹1.8 Cr Royalties), audit ledger, SHA-256 hashes, PDF deed viewer | M1 | government page.pdf p.3-4 |
| 14 | Gov Reports Tab | Automated compliance CSV/PDF export engine for CM Office, Higher Ed, NITI Aayog/DST | M1 | government page.pdf p.3 |
| 15 | Gov Settings & Logout | DNO credential management across 24 districts and secure session sign-out | M1 | government page.pdf p.3 |
| 16 | Mentor Top KPIs & Calendar | Active Projects (3), Mentoring Hours (14), Pending Reviews (2), monthly calendar with active dates | M2 | mentor page.pdf p.1 |
| 17 | Mentor Technical Review Card | Milestone evaluation summary, CAD schematic thumbnail, decision buttons, threaded feedback chat | M2 | mentor page.pdf p.1 |
| 18 | Mentor Escrow Ledger Tab | CSR grant tracking, tranche release breakdowns (Tranche 1 ₹75k, Tranche 2 ₹1L), BOM invoices | M2 | mentor page.pdf p.2 |
| 19 | Mentor Lab Teams Tab | Faculty & researcher directory, degrees, roles, direct message, corporate talent flagging | M2 | mentor page.pdf p.2 |
| 20 | Mentor 4-Column Kanban Tab | 4 columns (To Do, In Lab Testing, Awaiting Mentor Review, Completed), ticket modal, transitions | M2 | mentor page.pdf p.2 |
| 21 | Mentor TRL Audit Trail Tab | Engineering changelog (schematics, firmware, tests) and formal TRL 1-9 progression audit | M2 | mentor page.pdf p.3 |
| 22 | Mentor Settings & Logout Tab | Office hours configuration (weekly slots), domain expertise tags, notifications, logout modal | M2 | mentor page.pdf p.3 |
| 23 | Mentor CAD & Circuit Viewer Modal | Interactive schematic viewer, zoom/pan, sticky note redlines on circuit components | M2 | mentor page.pdf p.4 |
| 24 | Mentor Test Points Telemetry | Nodes 1-4 voltage telemetry readings with real-time oscilloscope waveform sparklines | M2 | mentor page.pdf p.4 |
| 25 | Mentor Rubric Scoring Sliders | Sliders for Technical Feasibility, Component Durability, Cost-Efficiency dynamically computing TRL | M2 | mentor page.pdf p.4 |
| 26 | Mentor Dual Decision Gates | Functional decision buttons: "Send Revisions to Lab" (orange) and "Sign-Off & Authorize Escrow" (green) | M2 | mentor page.pdf p.4 |
| 27 | Mentor Bilateral IP Term Sheet | Linked interactive royalty sliders (University vs Industry Sponsor), NISP <30% guardrail warning | M2 | mentor page.pdf p.5 |
| 28 | Mentor IP DSC & Counter-Offer | Digital signature status (TTO & Legal), Counter-Offer proposal modal, DSC execution modal | M2 | mentor page.pdf p.5 |
| 29 | Zero Placeholders Audit | Ensure 0 occurrences of "Module in development" or dead stub views | M3 | User Acceptance Criteria |
| 30 | Zero Build Errors Validation | Next.js production build (`npm run build`) compiles with 0 errors across all routes | M3 | User Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Gov Dashboard Implementation & Fix | Features 1-15: Modular components under `web/src/app/dashboard/gov/` | Survey | IN_PROGRESS |
| 2 | Industry Mentor Dashboard Implementation & Fix | Features 16-28: Modular components under `web/src/app/dashboard/industry/` | Survey | IN_PROGRESS |
| 3 | Multi-Agent Verification Gate & Audit | Features 29-30: Build check, Reviewers x2, Challengers x2, Forensic Auditor | M1, M2 | PLANNED |

## Code Layout
- `web/src/app/dashboard/gov/page.tsx` - Main Government Dashboard page
- `web/src/app/dashboard/gov/components/`:
  - `GovNavbar.tsx` - Sub-navigation tabs & DNO status indicator
  - `GovGisMap.tsx` - Interactive SVG district map, zoom/pan, layers, pins, hover card, seed grant modal
  - `GovIpQueue.tsx` - IP compliance queue with DigiLocker certificate dialog
  - `GovProjectsView.tsx` - 186 projects table with multi-filters and search
  - `GovDistrictsView.tsx` - 24 DNO scorecards, resolution speeds, municipal/academic ratios
  - `GovIpRegistryView.tsx` - Legal audit ledger, counters, SHA-256 hashes, PDF deed viewer modal
  - `GovReportsView.tsx` - Automated CSV/PDF export generator
  - `GovSettingsModal.tsx` - Nodal credentials management & logout
  - `types.ts` & `mockData.ts` - Comprehensive typed datasets
- `web/src/app/dashboard/industry/page.tsx` - Main Industry Mentor Dashboard page
- `web/src/app/dashboard/industry/components/`:
  - `IndustryNavbar.tsx` - Sub-navigation tabs & mentor profile status
  - `IndustryHomeView.tsx` - KPIs, Active project card, calendar, review desk card, feedback chat
  - `IndustryEscrowView.tsx` - Pledged vs disbursed capital, escrow tranche ledger, BOM receipts
  - `IndustryTeamsView.tsx` - Lab researchers directory, expertise tags, messaging, talent flagging
  - `IndustryKanbanView.tsx` - 4 workflow columns, ticket creation modal, card state transitions
  - `IndustryTrlView.tsx` - Chronological engineering changelog, TRL 1-9 progression audit
  - `IndustrySettingsView.tsx` - Weekly office hours slots, expertise tags, notifications, logout confirmation
  - `MilestoneReviewModal.tsx` - CAD viewer, sticky redlines, test points, oscilloscope graphs, rubric sliders, dual decision gates
  - `BilateralIpModal.tsx` - Linked royalty sliders, NISP <30% guardrail, counter-offer modal, DSC execution
  - `types.ts` & `mockData.ts` - Comprehensive typed datasets
