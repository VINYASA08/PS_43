# Architecture & Build Exploration Report

**Agent**: `explorer_arch_r9`  
**Date**: 2026-09-09  
**Milestone**: Round 9 Government & Industry Mentor Dashboard Specification Alignment  
**Target Codebase**: `a:/Development/Antigravity/SIH26043/web`

---

## 1. Executive Summary

This investigation analyzed the Next.js web application architecture, build status, installed dependencies, design system conventions, and current implementations of both the **Government Dashboard** (`web/src/app/dashboard/gov/page.tsx`) and the **Industry Mentor Dashboard** (`web/src/app/dashboard/industry/page.tsx`) against the authoritative user requirements and reference specifications in `government page.pdf` and `mentor page.pdf`.

### Core Findings
1. **Build Health**: `npm run build` compiles cleanly with **exit code 0** across all 44 routes in **3.6 seconds**. `web/src/` has zero TypeScript errors.
2. **Ecosystem & Constraints**: The frontend runs on modern **Next.js 16.3.4 (Turbopack)**, **React 19.2.8**, **Tailwind CSS v4**, **Framer Motion 13.2.0**, and **Lucide-react 1.41.0**. Strict CSP headers enforce `connect-src 'self'`. No external charting or mapping libraries are installed.
3. **Double Sidebar & Layout Conflict**: `web/src/app/dashboard/layout.tsx` wraps all dashboard subroutes in a global authenticated sidebar. Both `gov/page.tsx` and `industry/page.tsx` redundantly render internal sidebars and fixed-screen containers (`h-screen overflow-hidden`), creating visual conflicts and clipping issues.
4. **Placeholders & Omissions in `gov/page.tsx`**:
   - The GIS telemetry map is currently a static, non-interactive visual mockup with disabled pointer events and a static dummy tooltip.
   - Four out of five sub-tabs (`Projects`, `Districts`, `IP Registry`, `Reports`) render a generic `"Module in development."` placeholder.
5. **Placeholders & Omissions in `industry/page.tsx`**:
   - Four sub-tabs (`Escrow & Funding`, `Lab Teams`, `TRL History`, `Settings`) render `"Module in development."`.
   - The Kanban board only has 3 static columns instead of the required 4 (`To Do`, `In Lab Testing`, `Awaiting Mentor Review`, `Completed`), lacks ticket creation, and cannot transition items.
   - The Milestone Review modal contains non-functional CAD placeholders and static test graphs.
   - The Bilateral IP Assignment modal lacks interactive counter-offer flows and realistic legal deed linkages.

---

## 2. Dependency & Package Ecosystem Analysis

Analysis of `web/package.json`:

| Package | Version | Architectural Assessment & Role |
|---|---|---|
| `next` | `16.3.4` | Next.js App Router with Turbopack bundler. High performance, fast static rendering. |
| `react` / `react-dom` | `19.2.8` | React 19. **Caution**: Third-party chart/map libraries (e.g. `recharts`, `react-leaflet`) frequently suffer from React 19 peer dependency conflicts and SSR hydration bugs. |
| `tailwindcss` | `^4` | Tailwind CSS v4 using modern CSS engine and `@theme inline` in `globals.css`. |
| `@tailwindcss/postcss` | `^4` | Tailwind PostCSS plugin. |
| `framer-motion` | `^13.2.0` | Production animation engine; fully compatible with React 19. Ideal for modals, drawer animations, and tab transitions. |
| `lucide-react` | `^1.41.0` | Comprehensive icon suite providing all required icons for navigation, status, GIS pins, and CAD controls. |
| `zustand` | `^5.0.15` | Global client-side session store (`authStore.ts`). |
| `zod` | `^4.5.4` | Schema validation for forms and API payloads. |
| `@prisma/client` / `prisma` | `5.11.0` | Database ORM layer. |
| `jose` / `bcryptjs` / `qrcode` | Various | Cryptographic tokens, password hashing, and TOTP generation. |

### Critical Architectural Finding: Charts & Maps
- **No charting library** (`recharts`, `chart.js`) and **no map library** (`leaflet`, `mapbox-gl`) are installed.
- **CSP Constraint**: `next.config.ts` configures:
  ```ts
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  ```
  `connect-src 'self'` prevents client-side fetching of external map vector tiles (e.g. Mapbox, OpenStreetMap tiles) or external chart CDNs.
- **Strategic Recommendation**: Implement both the **Regional GIS Telemetry Map** and the **Interactive Circuit CAD & Sensor Stress Sparklines** using **custom, fully self-contained SVG + Tailwind + Framer Motion components**. This approach:
  1. Guarantees 100% compliance with React 19 without peer dependency mismatches.
  2. Bypasses CSP network tile restrictions (completely offline-compatible).
  3. Eliminates SSR hydration mismatches.
  4. Provides instant, sub-millisecond interaction speeds.

---

## 3. Build Health & TypeScript Verification

### 1. Production Build Output (`npm run build`)
```
▲ Next.js 16.3.4 (Turbopack)
- Environments: .env
✓ Running next.config.ts took 1582ms
✓ Compiled successfully in 3.6s
✓ Generating static pages using 15 workers (44/44) in 585ms
Finalizing page optimization ...
Exit code: 0
```
All 44 routes prerendered / dynamic compiled without warnings or failures.

### 2. TypeScript Typecheck (`npx tsc --noEmit`)
- In `next.config.ts`, `typescript: { ignoreBuildErrors: true }` is present because test runner scripts in `web/tests/` have historical test harness type mismatches (such as direct `NODE_ENV` assignments and `AbortSignal | null` parameter types).
- Inspection of `web/src/` confirmed that **zero application code errors exist in the source directory**.
- All newly implemented components and data types for Gov and Industry must adhere to strict TypeScript typings.

---

## 4. Design System & UI Conventions

1. **Global Palette (`web/src/app/globals.css`)**:
   - Background: `--background: #f8fafc` (light) / `#020817` (dark)
   - Foreground: `--foreground: #0f172a` (light) / `#f8fafc` (dark)
   - Primary: `--primary: #2563eb` (Blue-600)
   - Secondary: `--secondary: #f1f5f9` (Slate-100)
   - Accent: `--accent: #3b82f6` (Blue-500)
   - Glassmorphism: `.glass` (white with blur), `.glass-dark` (slate-900 with blur)
2. **Domain-Specific Color Semantics**:
   - **Government**: Slate-900 headers/sidebars, Emerald-600 badges and approval buttons, Blue-600 telemetry accents, Amber-500 civic backlog alerts.
   - **Industry / Mentor**: Slate-100 background, Emerald-600 sign-off actions, Amber/Orange revision buttons, Blue-600 IP actions, Purple-600 mentoring hour metrics.
3. **Shared Components Available**:
   - `web/src/components/ui/Skeletons.tsx`: `StatsSkeleton`, `TableSkeleton`, `CardSkeleton`.
   - `web/src/components/ui/EmptyState.tsx`: Accessible empty state cards with CTAs.
   - `web/src/components/auth/RoleGuard.tsx`: Client-side role protection wrapper.

---

## 5. Detailed Audit: Government Dashboard (`web/src/app/dashboard/gov/page.tsx`)

### 1. Existing State vs. PDF Specification (`government page.pdf`)

| Section / Feature | PDF Specification | Current Implementation | Status |
|---|---|---|---|
| **Layout & Navigation** | Unified portal header, 5 primary tabs (Dashboard, Projects, Districts, IP Registry, Reports), Admin settings. | Nested dark sidebar inside layout, broken sub-tabs displaying `"Module in development."`. | ❌ Major Defect |
| **Top KPIs** | 4 cards: Districts Monitored (24), Active Civic R&D Projects (186), CSR Funds Deployed (₹4.2 Cr), Patents & Licenses Logged (38). | 4 cards implemented with static values. | ⚠️ Exists, needs dynamic integration |
| **Regional GIS Telemetry Map** | Interactive map of 24 Jharkhand districts, zoom in/out, fullscreen toggle, layer switcher (Density, CSR, Civic), department filter, orientation compass, 4 pin types (Academic Hubs, Corporate Sponsors, Lab Prototyping, Amber Alert Distress Zones). | Static placeholder box with `opacity-20` Map icon, dummy text, static tooltip, disabled pointer events. | ❌ Broken / Missing |
| **Interactive Hover Tooltip** | Displays District Name, Nodal Officer, Active Builds, CSR Deployed, Triage Ratio (% routine vs deep tech). | Fixed dummy div positioned at `top-1/2 left-1/2` with hardcoded Ranchi text. | ❌ Defect |
| **GIS Map Legend & Progress** | Color palette guide (Dark Green 20+, Teal 5-15, Mint 1-5, Amber) + Live Funding Utilization Gauge (e.g. 72% of target). | Static legend box, missing interactive gauge and department filter logic. | ⚠️ Incomplete |
| **State IP Compliance Queue** | Table with columns: Project Name, Compliance Status (Bilateral DSC Verified, Pending), Policy Alignment (NISP Compliant), Action (`Approve & Register`). Triggers DigiLocker certificate auto-generation. | Basic 4-row table. Action button is non-interactive dummy; does not trigger DigiLocker modal or certificate issuance. | ⚠️ Superficial |
| **Tab: Projects** | Master table displaying all 186 active civic R&D projects across 24 districts with search/filters by university, sponsor, domain (IoT, Clean Energy, Water Treatment), and TRL level. | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: Districts** | Management portal for all 24 District Nodal Officers (DNOs) with performance scorecards (complaints logged, triage resolution speeds, % local issues routed to municipal desks vs academic labs). | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: IP Registry** | Legal audit ledger showing every approved Tripartite Agreement, digital signature hashes, royalty distribution records, 3 counters (38 agreements, 14 commercial licenses, ₹1.8 Cr royalties), [View Verified Legal Deed] button. | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: Reports** | Compliance & export engine for CM's Office, Higher Education Dept, NITI Aayog/DST tracking CSR utilization and patent yields with CSV/PDF download buttons. | `"Module in development."` placeholder. | ❌ Missing |

---

## 6. Detailed Audit: Industry Mentor Dashboard (`web/src/app/dashboard/industry/page.tsx`)

### 1. Existing State vs. PDF Specification (`mentor page.pdf`)

| Section / Feature | PDF Specification | Current Implementation | Status |
|---|---|---|---|
| **Layout & Navigation** | Unified portal header, 6 sub-navigation items: Home, Escrow & Funding, Lab Teams, Assignments, TRL History, Settings, Logout. | Nested icon sidebar inside outer sidebar; tabs 2, 3, 5, 6 render `"Module in development."`. | ❌ Major Defect |
| **Top KPIs** | Active Projects (3), Mentoring Hours Logged (14), Pending Milestone Reviews (2). | 3 cards implemented. | ✅ Good |
| **Home Overview Widgets** | Active projects list with TRL progress bar, Scheduled Office Hours calendar with active slots, Review Desk quick launcher. | Partially implemented with hardcoded mockup items. | ⚠️ Needs interactive wiring |
| **Milestone Review Modal** | Interactive CAD & circuit viewer (zoom/pan, clickable components, redlined sticky notes), real-time voltage test graphs (Node 1-4), Rubric scoring criteria informing TRL, Lab video demo player (`Thermal_Stress_Test.mp4`), Dual Decision Gate (`Send Revisions to Lab` [Orange] vs `Sign-Off & Authorize Escrow Tranche` [Green]). | Modal exists but CAD viewer is a static dashed box with text label. Video is a static image. Dual decision buttons have no state effect or feedback. Sticky notes cannot be added. | ⚠️ Superficial |
| **Bilateral IP Modal** | Interactive linked royalty sliders (Host Univ share vs Industry Sponsor share), NISP Policy Compliant badge, Digital Signature Status (Univ TTO Sign-Off: Pending DSC, Corporate Legal Sign-Off: Verified), Dual Actions (`Propose Counter-Offer` [Orange] vs `Execute Agreement with DSC` [Blue]). | Basic slider exists. Counter-offer is dummy button. No feedback or state persistence. | ⚠️ Needs polish & feedback |
| **Tab: Escrow & Funding** | Corporate CSR Grant & Escrow Ledger: total pledged vs released vs locked in escrow, milestone payment breakdowns (Tranche 1, 2, 3), university expenditure summaries (BOM receipts, sensor purchase invoices). | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: Lab Teams** | Directory of researchers and professors working on assigned projects, qualifications, department, specific project roles, quick contacts (direct message, publications, flag for corporate hiring). | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: Assignments (Kanban)** | Kanban board with 4 columns: `To Do`, `In Lab Testing`, `Awaiting Mentor Review`, `Completed`. Mentors can create actionable technical tickets and move tasks. | Rudimentary 3-column static view (`To Do`, `In Progress`, `Done`), missing `In Lab Testing` and `Awaiting Mentor Review`. No ticket creation, no task movement. | ❌ Defect |
| **Tab: TRL History** | Active TRL & Revision History / Project Version & Audit Log: chronological engineering changelog, formal TRL audit trail (TRL-3 to TRL-4 to TRL-5). | `"Module in development."` placeholder. | ❌ Missing |
| **Tab: Settings** | Mentor Settings & Office Hours Configuration: weekly availability calendar (recurring slots), domain expertise tags, notification preferences. | `"Module in development."` placeholder. | ❌ Missing |

---

## 7. Recommended Component Architecture

To achieve 100% feature completeness without cluttering single files or introducing type errors, adopt a **modular co-located directory structure** for both dashboards:

### Government Dashboard (`web/src/app/dashboard/gov/`)
```
web/src/app/dashboard/gov/
├── page.tsx                           # Clean orchestrator with tab routing & layout integration
├── types.ts                           # Comprehensive TypeScript types for districts, telemetry, IP registry, reports
├── mockData.ts                        # Realistic, rich Jharkhand datasets (24 districts, 186 projects, IP deeds, DNO scorecards)
└── components/
    ├── GovNavbar.tsx                  # Clean sub-tab navigation bar (Dashboard, Projects, Districts, IP Registry, Reports)
    ├── GovGisMap.tsx                  # Interactive SVG vector map of Jharkhand (zoom, pan, layers, pins, hover card)
    ├── GovIpQueue.tsx                 # Interactive IP compliance table with DSC verification & certificate issuance modal
    ├── GovProjectsView.tsx            # Master searchable & filterable table of 186 civic R&D projects
    ├── GovDistrictsView.tsx           # 24 District Nodal Officers management portal & scorecards
    ├── GovIpRegistryView.tsx          # Legal audit ledger with cumulative counters, SHA hashes & legal deed viewer
    └── GovReportsView.tsx             # Compliance export engine (CSV/PDF simulation, NITI Aayog/DST metrics)
```

### Industry Mentor Dashboard (`web/src/app/dashboard/industry/`)
```
web/src/app/dashboard/industry/
├── page.tsx                           # Main orchestrator managing tab selection and modal triggers
├── types.ts                           # Strict types for projects, escrow tranches, team members, Kanban tasks, TRL audit entries
├── mockData.ts                        # Rich datasets for CSR grants, escrow milestones, lab teams, Kanban tickets, changelogs
└── components/
    ├── IndustryNavbar.tsx             # Clean sub-tab navigation (Home, Escrow, Lab Teams, Tasks, TRL History, Settings)
    ├── IndustryHomeView.tsx           # Home KPIs, active projects list, calendar, and review desk launcher
    ├── IndustryEscrowView.tsx         # Corporate CSR Grant & Escrow Ledger with tranches & expenditure summaries
    ├── IndustryTeamsView.tsx          # Lab Teams & Faculty Directory with profile cards & direct actions
    ├── IndustryKanbanView.tsx         # 4-Column Kanban Task Board with ticket creation modal and stage transitions
    ├── IndustryTrlView.tsx            # Interactive TRL scale (1-9) and chronological engineering audit log
    ├── IndustrySettingsView.tsx       # Office hours recurring schedule, domain tags & notification preferences
    ├── MilestoneReviewModal.tsx       # Interactive CAD circuit viewer with sticky notes, sparkline graphs, rubric, dual decision gates
    └── BilateralIpModal.tsx           # Linked royalty sliders with NISP guardrails, dual DSC status & counter-offer flow
```

---

## 8. Technical Blueprint for Key Interactive Components

### 1. Interactive Jharkhand GIS Map (`GovGisMap.tsx`)
- **Rendering**: Render Jharkhand administrative district polygons using an SVG coordinate grid (`viewBox="0 0 800 600"`).
- **Interactive Layers**:
  - `Layer 1: Innovation Density`: District fill calculated by project count (Dark Green `#047857` for 20+ builds, Medium Teal `#10b981` for 5-15, Mint `#a7f3d0` for 1-5, Amber `#f59e0b` for high backlog).
  - `Layer 2: CSR Fund Deployment`: Shading reflects corporate capital flow (₹ Cr).
  - `Layer 3: Civic Problem Influx`: Shading reflects citizen complaint volume.
- **Department Filter**: Dropdown to filter markers by Drinking Water & Sanitation, Road Construction, Energy & Power, Urban Development.
- **Pin Markers**:
  - Graduation Cap icon for Academic Lab Hubs (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad). Click opens institution detail card.
  - Industrial Building icon for Corporate Sponsors (Tata Steel, BCCL/Coal India). Click opens CSR commitment card.
  - Flask icon for Active Bench Trials (TRL 4/5).
  - Amber Alert icon for Unclaimed Civic Distress Zones. Click triggers one-click `[Allocate State Seed Grant]` action.
- **Interactive Hover Tooltip**: Dynamic floating card that tracks mouse movements over any district boundary, displaying:
  1. District Name and DNO in charge.
  2. Total Active Builds currently in development.
  3. Total CSR/Gov Funds locked in escrow.
  4. Triage Ratio (% routine repairs solved vs. % deep-tech R&D underway).
- **Controls**: Smooth zoom in (`+`), zoom out (`-`), reset to north (`Compass`), and fullscreen toggle (`Maximize`).

### 2. Interactive CAD Circuit Viewer & Dual Decision Gates (`MilestoneReviewModal.tsx`)
- **Vector Circuit Diagram**: SVG circuit layout showing MCU (ESP32/STM32), Power Regulation Stage, Analog Front-End, Turbidity Sensor Interface, and ADC lines.
- **Redlined Sticky Notes**: Mentors can click anywhere on the circuit or select components to place sticky notes with instant visual feedback (e.g. "Verify resistor R4 thermal tolerance").
- **Real-Time Sensor Stress Sparklines**: SVG waveform graphs for Node 1 (3.3V stable), Node 2 (5.0V ripple), Node 3 (12.0V load), Node 4 (1.8V core).
- **Rubric Scoring Engine**: Interactive sliders for Technical Feasibility, Component Durability, and Cost-Efficiency. Adjusting sliders dynamically recalculates the project's TRL readiness bar.
- **Lab Video Demo Player**: Embedded interactive video player mockup with play/pause, scrub bar, and duration for `Thermal_Stress_Test.mp4`.
- **Dual Decision Gate**:
  - Option A: "Send Revisions to Lab" (Orange) -> Sets milestone status to Revision Required, logs feedback, sends notification.
  - Option B: "Sign-Off & Authorize Escrow Tranche" (Green) -> Approves milestone, releases escrow funds, updates TRL.

### 3. Bilateral IP Assignment & Royalty Term Sheet (`BilateralIpModal.tsx`)
- **Linked Dual Sliders**: Adjusting Host University share (`uniShare`) automatically updates Corporate Sponsor share (`100 - uniShare`), bounded by NISP policy rules (10% - 90%).
- **Policy Compliance**: Verified green `NISP Policy Compliant` badge.
- **Dual DSC Sign-Off**: Clear status indicators for University TTO Sign-Off (Pending DSC) and Corporate Legal Sign-Off (Verified).
- **Counter-Offer Desk**: Dialog for adjusting terms and submitting formal counter-proposals.

---

## 9. Verification & Quality Assurance Strategy

1. **Build Verification**: Run `npm run build` in `web/` after any additions to confirm exit code 0 and 0 route generation errors.
2. **Type Safety**: Run TypeScript validation to confirm all new components in `web/src/` adhere strictly to types.
3. **Placeholder Elimination**: Grep search for any remaining `"Module in development"`, `"Under development"`, or placeholder strings across `web/src/app/dashboard/gov` and `web/src/app/dashboard/industry` to ensure 0 matches.
4. **Interactive Audit**: Verify all tabs, modals, sliders, and filters respond dynamically to user input.

---

*Report prepared by `explorer_arch_r9`. Handoff documentation provided in `handoff.md`.*
