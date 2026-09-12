# Government Dashboard Specification & Audit Report

**Author**: Specification Miner (`teamwork_preview_spec_miner`)  
**Target Specification**: `web/new page/government page.pdf` (6 Pages)  
**Target Implementation**: `web/src/app/dashboard/gov/page.tsx`  
**Date**: 2026-09-09  

---

## 1. Executive Summary

This report delivers an exhaustive audit and specification mining analysis of the Jharkhand State Government Innovation Registry & Telemetry Dashboard ("Government Dashboard"). The authoritative specification is derived from the high-fidelity specification document `web/new page/government page.pdf` (covering 6 annotated design pages) and the user requirements documented in `ORIGINAL_REQUEST.md`.

### Key Finding
The current implementation in `web/src/app/dashboard/gov/page.tsx` is an incomplete skeleton. While it renders basic KPI cards and a rudimentary 4-row table on the default "Dashboard" tab, **all other navigation tabs ("Projects", "Districts", "IP Registry", "Reports") display a generic placeholder:**
```tsx
<div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 bg-white shadow-sm">
  <p>Module in development.</p>
</div>
```
Furthermore, the Regional GIS Telemetry Map on the "Dashboard" tab is completely non-functional: it displays an empty beige box with an SVG icon, static mock text, disabled mock buttons (`+`, `-`, `Maximize`, `Layers`, `Compass`), hardcoded fake tooltip text, zero clickable pins (Graduation Cap, Industrial Building, Flask, Amber Alert), and no Funding Utilization progress meter.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Header | Departmental Subtitle & Badging | Displays official banner "State Innovation Registry & Telemetry Dashboard - Higher & Technical Education Dept" and "High-Fidelity Modern UI Web Dashboard" | Active auth session | Rendered header brand | Fallback to default state header | PDF Page 1 & 2 |
| 2 | Header | Top Navigation Quick Controls | Quick Access menu, Recent Activity feed button, Alert Bell with notification count badge, and User Profile avatar | User click events | Dropdown menus / drawer displays | Closed on outside click | PDF Page 1 & 2 |
| 3 | Sidebar | Tab Navigation Switcher | Allows switching between 5 primary views: Dashboard, Projects, Districts, IP Registry, Reports, plus Settings and Sign-Out | Tab click (`activeTab` state) | Swapped view container without full-page reload | Keeps current tab active if invalid id | PDF Page 1, 2, 3 |
| 4 | Telemetry | Districts Monitored KPI Card | Metric card displaying total monitored administrative districts in Jharkhand (24 districts) | District query count | Formatted number (`24`), icon, status label | Displays `--` if data unavailable | PDF Page 1 & 2 |
| 5 | Telemetry | Active Civic R&D Projects KPI Card | Metric card displaying active university lab builds tackling municipal challenges (186 projects) | Projects count | Formatted number (`186`), beaker icon, status label | Displays `0` if empty | PDF Page 1 & 2 |
| 6 | Telemetry | CSR Milestone Funds Deployed KPI Card | Financial metrics showing corporate capital moving through milestone escrow into academic research (₹4.2 Cr) | Escrow sum | Formatted currency string (`₹4.2 Cr`), icon, label | Displays `₹0` if empty | PDF Page 1 & 2 |
| 7 | Telemetry | Patents & Commercial Licenses Logged KPI Card | Verifiable count of intellectual property created within the state ecosystem (38 logged) | IP registry count | Formatted number (`38`), scroll/patent icon, label | Displays `0` if empty | PDF Page 1 & 2 |
| 8 | GIS Map | Map Zoom In/Out (`+` / `-`) Controls | Top-left map controls allowing granular zoom into district clusters (Ranchi/Dhanbad wards/campuses) or reset to macro 24-district view | Click on `+` or `-` button | Updates SVG viewbox scale / coordinates | Clamped between min (1x statewide) and max (3x cluster) | PDF Page 4 |
| 9 | GIS Map | Fullscreen / Frame Toggle (`⛶`) | Expands the map from dashboard widget into edge-to-edge situational command wall for presentations | Click on fullscreen toggle | Full viewport modal / CSS expanded view | Pressing Escape or toggle collapses map | PDF Page 4 |
| 10 | GIS Map | Map Layer Switcher (Stacked Layers) | Toggles between 3 distinct visualization overlays: 1) Innovation Density, 2) CSR Fund Deployment, 3) Civic Problem Influx | Layer dropdown/button selection | Re-shades district polygons and updates data metrics | Defaults to Layer 1 (Innovation Density) | PDF Page 5 |
| 11 | GIS Map | Department Flag Filter (🇮🇳 / Building) | Filters map markers and pins by state departments (Drinking Water & Sanitation, Road Construction, Energy & Power, Urban Development, All) | Department select input | Filters visible markers on map canvas | Shows all markers if "All" is selected | PDF Page 5 |
| 12 | GIS Map | Compass / Orientation Dial | Resets map geographic rotation and tilt to true North | Click on compass dial | Smooth transition reset to 0° rotation | No-op if already at North | PDF Page 5 |
| 13 | GIS Map | District Polygon Choropleth Heatmap | Interactive SVG polygons for all 24 Jharkhand districts shaded by selected layer metric (e.g. Dark Green: 20+, Medium Teal: 5-15, Pale Mint: 1-5, Amber: High Backlog) | District hover / select, active layer | Dynamic SVG fill color & highlight stroke | Fallback neutral fill if district metric missing | PDF Page 4, 5, 6 |
| 14 | GIS Map | Interactive Hover Telemetry Tooltip | Instant floating tooltip displaying 4 data points: 1. District name & Nodal Officer, 2. Total active builds, 3. Total CSR funds deployed, 4. Triage Ratio (% routine vs deep-tech R&D) | Mouse enter / move over district polygon | Positioned tooltip card with live telemetry | Dismissed on mouse leave | PDF Page 4 & 6 |
| 15 | GIS Map | Graduation Cap Pin (Academic Lab Hubs) | Interactive pin indicating accredited university/research lab (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad) building funded prototypes | Pin click | Modal/Card popup showing: Active Teams, Available Facilities, Deployed PoCs | Dismissible modal | PDF Page 5 |
| 16 | GIS Map | Industrial Building Pin (Corporate Sponsors) | Interactive pin indicating corporate sponsor facility / testing grounds (Tata Steel Jamshedpur, Coal India / BCCL Dhanbad) | Pin click | Modal/Card popup showing: Pledged CSR Capital, Active Mentors, Testing Facilities Opened | Dismissible modal | PDF Page 5 |
| 17 | GIS Map | Flask Pin (Bench Trials / Prototyping) | Interactive pin indicating active TRL 4/5 hardware/chemical testing inside campus laboratory | Pin click | Modal/Card popup showing: Project name, TRL stage, bench parameters | Dismissible modal | PDF Page 5 & 6 |
| 18 | GIS Map | Amber Alert Marker (Unclaimed Civic Distress) | Warning marker indicating critical verified civic problem without university or industry claim | Marker click | Modal popup with problem details and one-click [Allocate State Seed Grant] action | Dismissible modal | PDF Page 6 |
| 19 | GIS Map | One-Click State Seed Grant Allocation | Action button inside Amber Alert modal to allocate seed grant (e.g. ₹25,00,000) from state reserve | Button click with confirmation | Updates problem to funded/incentivized, increments CSR/Govt deployed funds | Disables button while processing, shows toast | PDF Page 6 |
| 20 | GIS Map | Map Legend & TRL Indicators | Bottom-right visual guide mapping map colors to build counts (Dark Green = 20+, Teal = 5-15, Pale Mint = 1-5, Amber = High Backlog) | Visual render | Legend swatch container | Always visible in widget | PDF Page 4 & 6 |
| 21 | GIS Map | Funding Utilization Progress Gauge | Live progress meter displaying statewide budget utilization against annual targets (`72% of projected target`, ₹4.2 Cr deployed) | Target and deployed fund values | Animated progress bar with percentage and amount | Clamped between 0% and 100% | PDF Page 4 & 6 |
| 22 | IP Queue | Search & Status Filter Controls | Search bar for filtering pending agreements by project name or university, plus filter toggle (All / Pending / DSC Verified) | Text input, filter dropdown | Filtered table row list | Shows empty state if 0 matches | PDF Page 1 & 2 |
| 23 | IP Queue | Compliance Status Badges | Status pill displaying "Bilateral DSC Verified" (green) or "Pending" (amber) | Item status string | Formatted badge with check/clock icon | Default to Pending if unknown | PDF Page 1 & 2 |
| 24 | IP Queue | NISP Policy Alignment Verification | Automatic verification badge that bilateral agreements adhere to National Innovation and Startup Policy (NISP) | Compliance boolean | Green "NISP Policy Compliant" badge | Red "Policy Review Required" if false | PDF Page 1 & 2 |
| 25 | IP Queue | Action Gate: "Approve & Register" | Action button to approve bilateral agreement and archive into official State Innovation Registry | Button click | Archives agreement, opens Certificate Issuance Modal | Disabled if compliance not verified | PDF Page 1, 2, 4 |
| 26 | IP Queue | DigiLocker Certificate Auto-Issuance Modal | Triggers auto-generation of tamper-evident State Government Innovation Certificate pushed directly to student/faculty DigiLocker | Triggered on agreement approval | Modal dialog displaying certificate details, SHA-256 hash, and DigiLocker push confirmation | Error alert if issuance fails | PDF Page 2 & 4 |
| 27 | IP Queue | Pagination Controls | Pagination footer showing item count ("Showing 2 of 4") and navigation controls (`<` `1` `2` `>`) | Page click | Displays corresponding page slice | Disables previous/next at boundaries | PDF Page 1 & 2 |
| 28 | Projects Tab | Master Civic R&D Projects Table | Comprehensive table displaying all 186 active civic R&D projects across all 24 districts | Active tab = "projects" | Master data table with full project records | Empty state if no matching filters | PDF Page 2 |
| 29 | Projects Tab | Multi-Parameter Search & Filters | Search bar and dropdown filters for University, Lead Corporate Sponsor, Technology Domain, and TRL level | Filter selections / text input | Real-time filtered project list | Clear filters button resets | PDF Page 2 |
| 30 | Projects Tab | TRL Progress Visualization | Visual Technology Readiness Level badge and step indicator (TRL 1 to TRL 9) for each project | Project TRL integer | Color-coded TRL badge (e.g. TRL 4: Lab Validated, TRL 7: Field Tested) | N/A | PDF Page 2 |
| 31 | Districts Tab | All 24 DNO Performance Scorecards | Dedicated management portal showing performance cards for all 24 District Nodal Officers (DNOs) | Active tab = "districts" | Grid/Table of district scorecards | Empty state if no districts found | PDF Page 2 |
| 32 | Districts Tab | Triage Metrics & Municipal vs Academic Ratio | Displays total complaints logged, triage resolution speeds, and percentage routed to municipal desks vs academic labs | District metrics | Progress bars / ratio display (e.g. 65% Municipal / 35% Academic Labs) | Handled safely if 0 complaints | PDF Page 2 |
| 33 | Districts Tab | DNO Contact & Credentials Card | Displays assigned Nodal Officer name, designation, email, phone, and active status | DNO record | Contact badge with credential status | Shows "Unassigned" if vacant | PDF Page 2 |
| 34 | IP Registry Tab | Cumulative Royalty & License Counters | Top summary cards: 1. Total Agreements Registered (38), 2. Active Commercial Licenses (14), 3. Cumulative Royalties Distributed (₹1.8 Cr) | Active tab = "ip" | 3 high-impact summary metric cards | Shows 0 / ₹0 if empty | PDF Page 3 |
| 35 | IP Registry Tab | Tripartite Legal Audit Ledger Table | Master legal ledger table: Project ID & Name, Host University, Corporate Sponsor, Agreed Split, Digital Signature Hash, Action, Status | Ledger query | Interactive ledger rows with cryptographic hashes | Filterable by sponsor/university | PDF Page 3 & 4 |
| 36 | IP Registry Tab | Contract Percentage Split & Security Badge | Displays negotiated royalty split (e.g. 50/50 or 40/60) with immutable green `[Registered & Locked]` badge | Royalty split string | Badged split cell with lock icon | Shows `Pending Negotiation` if unverified | PDF Page 3 & 4 |
| 37 | IP Registry Tab | View Verified Legal Deed (PDF) Action | Action button on each ledger row opening a tamper-evident Tripartite Legal Deed document modal | Button click | Modal preview with government seal, parties, terms, SHA-256 hash, and download PDF button | Error state if document unavailable | PDF Page 3 & 4 |
| 38 | Reports Tab | Automated Compliance & Export Engine | Compliance generation center for Chief Minister's office, Department of Higher Education, and NITI Aayog / DST | Active tab = "reports" | Report template selector & live preview | Validation error on empty selections | PDF Page 3 |
| 39 | Reports Tab | CSV Dataset Export | Generates and triggers download of comprehensive CSV dataset matching selected criteria | Click "Export CSV" | Browser file download (.csv) with telemetry and IP records | Disabled during generation | PDF Page 3 |
| 40 | Reports Tab | Official PDF Report Generation | Generates formatted executive PDF report with official state insignia, charts, and summary statistics | Click "Download PDF Report" | Printable PDF document modal / download | Shows loading spinner while preparing | PDF Page 3 |
| 41 | Settings | DNO Admin-Level Credential Management | Admin panel to grant or reassign District Nodal Officer credentials across all 24 districts | Settings tab click / button | Officer assignment table with edit/grant credential modal | Validates official `.gov.in` / `.nic.in` email | PDF Page 3 |
| 42 | Settings | Secure Session Sign-Out | Session termination button with confirmation dialog | Click "Sign Out" | Clears session cookie/store, redirects to login | Logs sign-out audit event | PDF Page 3 |

---

## 3. Edge Cases

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|------------------------------|
| 1 | GIS Map Zoom Controls | User clicks Zoom In (`+`) repeatedly beyond max zoom level | Clamps zoom scale to 3.0x max; disables `+` button visually to prevent disorienting viewbox distortion. |
| 2 | GIS Map Zoom Reset | User clicks Zoom Out (`-`) while at statewide 1.0x view | Clamps zoom scale to 1.0x macro view; centers Jharkhand state polygon with all 24 districts visible. |
| 3 | GIS Map Layer Switching | User toggles from "Innovation Density" to "Civic Problem Influx" | District polygon fills smoothly transition from Emerald/Teal scale to Amber/Rose scale, and legend dynamically updates to reflect civic backlog levels. |
| 4 | GIS Map Department Filter | User filters by "Drinking Water & Sanitation" in a district with no water projects | Map markers for unrelated departments are hidden; district polygon remains visible with an indicator showing 0 matching department pins. |
| 5 | GIS Map Tooltip Positioning | User hovers over an edge district (e.g. Sahibganj at top-right or Simdega at bottom-left) | Tooltip calculates bounding box and flips horizontally/vertically to ensure it remains fully visible within the map container. |
| 6 | Seed Grant Allocation | User clicks [Allocate State Seed Grant] on an Amber Alert pin twice in rapid succession | Mutex lock disables the button immediately on first click with a loading state, preventing duplicate seed grant disbursements. |
| 7 | IP Compliance Approval | User attempts to click "Approve & Register" on an item with "Pending" compliance status | Button is disabled with `disabled:cursor-not-allowed opacity-50` and tooltip explains: "Requires Bilateral DSC Sign-offs from University TTO and Corporate Legal Officer". |
| 8 | DigiLocker Certificate Issuance | State officer approves agreement; network delay occurs | Modal shows progressive status: "Verifying DSC Hashes" -> "Generating Tamper-Evident State Seal" -> "Pushed to DigiLocker (SHA-256: 3a7f8e...)" with copyable reference ID. |
| 9 | Projects Tab Filter Combo | User selects University: "IIT ISM Dhanbad" and Domain: "Clean Energy" resulting in 0 matches | Master table displays an informative EmptyState with a "Reset Filters" action button instead of blank space. |
| 10 | IP Registry Deed Modal | User clicks "View Verified Legal Deed" for a project | Modal renders the legal deed with official Government of Jharkhand header, bilateral parties, agreed split, digital signature hashes, and a print/download trigger. |
| 11 | Double Sidebar Conflict | Government portal rendered inside existing `/dashboard/layout.tsx` | The inner sidebar in `gov/page.tsx` must either integrate seamlessly or replace the nested layout so users do not see two conflicting navigation sidebars simultaneously. |

---

## 4. Detailed Gap Analysis: Specification vs. Implementation

### Summary Table of Discrepancies

| Area | PDF Specification | Current Implementation (`gov/page.tsx`) | Status | Severity |
|------|-------------------|------------------------------------------|--------|----------|
| **Navigation Tabs** | 5 distinct views (Dashboard, Projects, Districts, IP Registry, Reports) + Settings | Only Dashboard has partial content. Projects, Districts, IP Registry, Reports render `<p>Module in development.</p>`. | **MISSING** | **CRITICAL** |
| **GIS Map Interactivity** | Full interactive SVG map of 24 districts, zoom (+/-), fullscreen, hover tooltips with 4 telemetry items, 4 pin types with popups, seed grant button | Static beige box with text placeholder "Interactive District Heatmap (GIS Telemetry)..." and mock buttons with zero handlers | **MISSING** | **CRITICAL** |
| **Map Layer Switcher** | 3 layers: Innovation Density, CSR Fund Deployment, Civic Problem Influx | Non-functional icon button with no dropdown or layer state | **MISSING** | **HIGH** |
| **Department Filter** | Filters markers by state departments (Water, Roads, Energy, Urban, All) | Completely missing from map toolbar | **MISSING** | **HIGH** |
| **Map Pin Markers** | 4 pin types: Academic Lab Hub, Corporate Sponsor, Flask Bench Trial, Amber Alert with click modals | Zero pins rendered; no click events or modal popups | **MISSING** | **CRITICAL** |
| **Seed Grant Action** | One-click button inside Amber Alert popup to allocate state seed grant to unassigned problems | Completely missing | **MISSING** | **HIGH** |
| **Funding Utilization Gauge** | Progress meter showing `72% of projected target` and `₹4.2 Cr CSR Deployed` | Completely missing from map widget | **MISSING** | **HIGH** |
| **IP Compliance Action** | "Approve & Register" archives to registry & pops DigiLocker certificate issuance modal | Button has no onClick handler; no modal or DigiLocker integration | **MISSING** | **HIGH** |
| **IP Compliance Search** | Working search bar and filter for pending agreements | Dummy `<input>` with no state binding or filtering logic | **MISSING** | **MEDIUM** |
| **Projects Master View** | Search & filter builds across 186 projects by university, sponsor, domain, and TRL | Generic placeholder: `<p>Module in development.</p>` | **MISSING** | **CRITICAL** |
| **Districts Portal** | 24 DNO performance scorecards, triage speeds, complaints count, municipal vs academic ratio | Generic placeholder: `<p>Module in development.</p>` | **MISSING** | **CRITICAL** |
| **IP Registry Ledger** | 3 KPI counters, tripartite ledger table with agreed split, SHA-256 hash, and PDF deed modal | Generic placeholder: `<p>Module in development.</p>` | **MISSING** | **CRITICAL** |
| **Reports Engine** | Automated CSV/PDF generator for CM, Higher Ed, NITI Aayog with preview and downloads | Generic placeholder: `<p>Module in development.</p>` | **MISSING** | **CRITICAL** |
| **Settings / DNO Admin** | Admin credential management for granting Nodal Officer access across 24 districts | Inert button with no modal or handler | **MISSING** | **MEDIUM** |
| **Layout Hierarchy** | Admin portal layout | Inner dark sidebar inside the outer dashboard layout causes layout nesting issues | **DEFECT** | **MEDIUM** |

---

## 5. Architectural Recommendations & Implementation Plan

To eliminate all "Module in development" placeholders and deliver 100% feature parity with `government page.pdf`, we recommend the following modular component architecture under `web/src/app/dashboard/gov/`:

```
web/src/app/dashboard/gov/
├── page.tsx                     # Main container orchestrating activeTab & global header
├── components/
│   ├── GovSidebar.tsx           # Dark sidebar with tabs, settings, and sign-out
│   ├── GovHeader.tsx            # Header with breadcrumbs, quick access, notifications, profile
│   ├── tabs/
│   │   ├── DashboardTab.tsx     # Executive home: 4 KPI cards + GIS Map + IP Queue
│   │   ├── ProjectsTab.tsx      # 186 projects master table with multi-filter (Univ, Sponsor, Domain, TRL)
│   │   ├── DistrictsTab.tsx     # 24 DNO scorecards with triage ratio and resolution speed
│   │   ├── IpRegistryTab.tsx    # 3 summary counters + Tripartite Legal Audit Ledger + Deed Modal
│   │   └── ReportsTab.tsx       # Compliance & export engine with live preview, CSV, and PDF actions
│   ├── gis/
│   │   ├── JharkhandGisMap.tsx  # Interactive SVG map of 24 districts with zoom, pan, fullscreen
│   │   ├── MapLayerSwitcher.tsx # Layer selector (Innovation, CSR Funds, Civic Influx)
│   │   ├── DepartmentFilter.tsx # State department filter dropdown
│   │   ├── DistrictTooltip.tsx  # 4-data-point hover telemetry readout
│   │   ├── PinModal.tsx         # Universal modal for Academic Hub, Corporate Sponsor, Bench Trial
│   │   ├── SeedGrantModal.tsx   # Amber Alert popup with [Allocate State Seed Grant] action
│   │   └── FundingGauge.tsx     # Live 72% budget utilization progress meter & legend
│   ├── ip/
│   │   ├── IpComplianceQueue.tsx# Searchable compliance queue with DSC & NISP badges
│   │   ├── DigiLockerModal.tsx  # State Innovation Certificate issuance & SHA-256 hash modal
│   │   └── LegalDeedModal.tsx   # Tripartite legal deed viewer with government seal
│   └── settings/
│       └── DnoCredentialsModal.tsx # DNO credential allocation & permissions manager
└── data/
    └── govMockData.ts           # Rich datasets for 24 districts, 186 projects, IP registry, and audit ledger
```

---

## 6. Verification Plan for Developer Agent

When implementing the dashboard, the developer agent must verify:
1. **Zero Placeholders**: Programmatic check verifying that no string matching `"Module in development"` or `"Under development"` remains anywhere in `web/src/app/dashboard/gov`.
2. **Interactive GIS Map**:
   - Hovering over Ranchi, Dhanbad, East Singhbhum, etc., triggers the 4-data-point telemetry tooltip.
   - Clicking `+` and `-` adjusts SVG zoom; clicking `⛶` toggles full-screen mode.
   - Switching layers alters map shading and updates the legend.
   - Clicking the Graduation Cap, Building, and Flask pins displays their respective detail cards.
   - Clicking the Amber Alert marker opens the seed grant modal and clicking `[Allocate State Seed Grant]` executes without error.
3. **IP Compliance & DigiLocker**:
   - Clicking "Approve & Register" opens the DigiLocker certificate generation dialog with cryptographic hash.
4. **Navigation Tabs**:
   - Clicking "Projects" renders the master projects table with search and TRL filters.
   - Clicking "Districts" renders all 24 DNO performance scorecards with triage ratio meters.
   - Clicking "IP Registry" renders the 3 counters, legal audit ledger, and functional [View Verified Legal Deed] modals.
   - Clicking "Reports" renders the export engine with CSV and PDF generation actions.
5. **Build Cleanliness**:
   - `npm run build` executes in `/web` with 0 TypeScript and 0 lint errors.
