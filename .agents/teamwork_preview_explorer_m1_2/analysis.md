# Platform UI Audit & Discovery: Dashboard & Portals

**Date**: 2026-09-04  
**Auditor**: Explorer 2 (Milestone 1: Platform UI Audit & Discovery)  
**Assigned Scope**:
- `web/src/app/dashboard/layout.tsx` (Shared Dashboard Layout & Navigation)
- `web/src/app/dashboard/gov/page.tsx` (Government Portal Dashboard)
- `web/src/app/dashboard/industry/page.tsx` (Industry Partner Dashboard)
- `web/src/app/dashboard/university/page.tsx` (University Collaboration Hub)
- Related flow subpages: `web/src/app/dashboard/industry/fund/[id]/page.tsx`, `web/src/app/dashboard/university/proposal/[id]/page.tsx`

---

## 1. Executive Summary

A comprehensive, code-level inspection was conducted across all interactive elements (`<button>`, `<Link>`, `<a>`, `<input>`, tabs, filters, metric cards, progress bars, and timeline updates) in the Dashboard shared layout and the three persona-specific dashboards (Government, Industry, University).

### Key Audit Findings:
1. **Critical `href="#"` Dead Ends**:
   - In `dashboard/layout.tsx`, the primary sidebar navigation item **"Settings"** hardcodes `href="#"` (line 40). Clicking it alters browser history/scrolls to top without navigating to any settings panel.
2. **Missing Index Route (404 Error)**:
   - Direct navigation to `/dashboard` triggers a **404 Not Found** because `web/src/app/dashboard/page.tsx` does not exist in the codebase.
3. **Empty Button Handlers (Zero `onClick` / Uncontrolled Inputs)**:
   - `web/src/app/dashboard/industry/page.tsx:52-55`: The `"Filter Proposals"` button has **no `onClick` handler** or filter state.
   - `web/src/app/dashboard/industry/page.tsx:132-134`: The external link button (`<ArrowUpRight>`) in every proposal card is a `<button>` with **no `onClick` handler**.
   - `web/src/app/dashboard/university/page.tsx:49-56`: The `"Search assigned challenges..."` input has **no `value` or `onChange` handler** (typing text does not filter anything).
   - `web/src/app/dashboard/university/page.tsx:117-119`: The `"View All"` button on the Assigned Challenges panel has **no `onClick` handler** and does not navigate.
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx:81-86`: The `"Save Draft"` button has **no `onClick` handler** and does not persist drafts.
4. **Dead-End Unlinked Metric Cards & Data Visualizers**:
   - **Government Dashboard (`gov/page.tsx`)**: All 4 metric cards (1,248 Reported, 342 Resolved, 156 Prototyping, 14 Universities), all 5 domain breakdown progress bars, and all 3 timeline updates are static `motion.div` / `<div>` elements with **no click targets or drill-down links**.
   - **Industry Dashboard (`industry/page.tsx`)**: All 3 metric cards (24 Active Proposals, 3 Mentorships, ₹8.5L Total Funded) are static without links to catalog/portfolio views.
   - **University Dashboard (`university/page.tsx`)**: All 3 metric cards (12 Pending Review, 8 Active Teams, 4 Solutions Proposed) are static without drill-down routes.
5. **Contextual Action Link Disconnects**:
   - In `industry/page.tsx:150-155`, both the `"Mentor"` button and the `"Fund Project"` button link to `/dashboard/industry/fund/[id]` without query parameters, leaving the commitment modal at default `"both"`.
   - In `university/page.tsx:123-159`, clicking on a challenge row arrow routes directly to the submission form (`/dashboard/university/proposal/[id]`), completely bypassing the challenge details and field evidence (`/challenge/[id]`).

---

## 2. Complete Inventory of Elements by File

### A. `web/src/app/dashboard/layout.tsx` (Shared Dashboard Layout)

| # | Element Description | Code Type | Line(s) | Target / Handler | Status | Severity |
|---|---------------------|-----------|---------|------------------|--------|----------|
| 1 | Mobile Brand Logo | `<div className="flex items-center gap-2">` | 47-52 | None | Static (Mobile text) | Low |
| 2 | Mobile Menu Hamburger | `<button>` | 53-55 | `onClick={() => setSidebarOpen(!sidebarOpen)}` | Functional | Pass |
| 3 | Sidebar Brand Logo | `<Link>` | 66-71 | `href="/"` | Functional (Home) | Pass |
| 4 | Nav Item: "Overview" | `<Link>` | 39, 82-94 | `href={isGov ? "/dashboard/gov" : isUni ? "/dashboard/university" : "/dashboard/industry"}` | Functional | Pass |
| 5 | Nav Item: "Settings" | `<Link>` | 40, 82-94 | `href="#"` | **DEAD END (`href="#"`)** | **High** |
| 6 | Sign Out Action | `<Link>` | 100-106 | `href="/login"` | Functional | Pass |
| 7 | Mobile Backdrop Overlay | `<div>` | 114-119 | `onClick={() => setSidebarOpen(false)}` | Functional | Pass |
| 8 | Nav Item Auto-close on Mobile | `<Link>` | 82-94 | None | **UX Bug** (drawer stays open) | Medium |
| 9 | Role Navigation Depth | `navigation` array | 38-41 | Only 2 items (`Overview` & `#`) | **Architectural Gap** | High |

---

### B. `web/src/app/dashboard/gov/page.tsx` (Government Dashboard)

| # | Element Description | Code Type | Line(s) | Target / Handler | Status | Severity |
|---|---------------------|-----------|---------|------------------|--------|----------|
| 10 | Metric: "Total Challenges Reported" (1,248) | `motion.div` | 37-58 | None | **DEAD END (Unlinked Card)** | High |
| 11 | Metric: "Challenges Resolved" (342) | `motion.div` | 37-58 | None | **DEAD END (Unlinked Card)** | High |
| 12 | Metric: "Active Prototyping" (156) | `motion.div` | 37-58 | None | **DEAD END (Unlinked Card)** | High |
| 13 | Metric: "Participating Universities" (14) | `motion.div` | 37-58 | None | **DEAD END (Unlinked Card)** | High |
| 14 | Domain Row: "Water Management" (420) | `<div>` | 73-91 | None | **DEAD END (Unlinked Data Bar)** | Medium |
| 15 | Domain Row: "Agriculture" (310) | `<div>` | 73-91 | None | **DEAD END (Unlinked Data Bar)** | Medium |
| 16 | Domain Row: "Healthcare" (245) | `<div>` | 73-91 | None | **DEAD END (Unlinked Data Bar)** | Medium |
| 17 | Domain Row: "Education" (180) | `<div>` | 73-91 | None | **DEAD END (Unlinked Data Bar)** | Medium |
| 18 | Domain Row: "Urban Infrastructure" (93) | `<div>` | 73-91 | None | **DEAD END (Unlinked Data Bar)** | Medium |
| 19 | Activity: "IIT ISM Dhanbad solution" | `<div>` | 107-112 | None | **DEAD END (Unlinked Activity)** | Medium |
| 20 | Activity: "Tata Steel ₹5L funding" | `<div>` | 113-118 | None | **DEAD END (Unlinked Activity)** | Medium |
| 21 | Activity: "Ranchi Urban challenge cluster" | `<div>` | 119-124 | None | **DEAD END (Unlinked Activity)** | Medium |
| 22 | Filter / Export / Action Toolbar | Header area | 31-34 | Missing | **Missing Gov Controls** | Medium |

---

### C. `web/src/app/dashboard/industry/page.tsx` (Industry Dashboard)

| # | Element Description | Code Type | Line(s) | Target / Handler | Status | Severity |
|---|---------------------|-----------|---------|------------------|--------|----------|
| 23 | "Filter Proposals" Button | `<button>` | 52-55 | None (No `onClick`) | **DEAD END (Empty Handler)** | **High** |
| 24 | Metric: "Active Proposals" (24) | `motion.div` | 59-72 | None | **DEAD END (Unlinked Card)** | High |
| 25 | Metric: "Your Mentorships" (3) | `motion.div` | 74-88 | None | **DEAD END (Unlinked Card)** | High |
| 26 | Metric: "Total Funded" (₹8.5L) | `motion.div` | 90-104 | None | **DEAD END (Unlinked Card)** | High |
| 27 | Proposal Card Top-Right Arrow | `<button>` | 132-134 | None (No `onClick`) | **DEAD END (Empty Handler)** | **High** |
| 28 | Action: "Mentor" Button | `<Link>` | 150-152 | `/dashboard/industry/fund/[id]` | Partial Disconnect (no `?type`) | Medium |
| 29 | Action: "Fund Project" Button | `<Link>` | 153-155 | `/dashboard/industry/fund/[id]` | Functional | Pass |

---

### D. `web/src/app/dashboard/university/page.tsx` (University Dashboard)

| # | Element Description | Code Type | Line(s) | Target / Handler | Status | Severity |
|---|---------------------|-----------|---------|------------------|--------|----------|
| 30 | Search Input (`Search assigned...`) | `<input>` | 49-56 | Uncontrolled (no `onChange`) | **DEAD END (No Search Function)** | **High** |
| 31 | Metric: "Pending Review" (12) | `motion.div` | 60-74 | None | **DEAD END (Unlinked Card)** | High |
| 32 | Metric: "Active Teams" (8) | `motion.div` | 76-89 | None | **DEAD END (Unlinked Card)** | High |
| 33 | Metric: "Solutions Proposed" (4) | `motion.div` | 91-105 | None | **DEAD END (Unlinked Card)** | High |
| 34 | Assigned Challenges "View All" Button | `<button>` | 117-119 | None (No `onClick`) | **DEAD END (Empty Handler)** | **High** |
| 35 | Challenge Title Link | `<h3>` | 136 | None | **DEAD END (Unlinked Title)** | Medium |
| 36 | Challenge "2 Updates" Tag | `<span>` | 139-141 | None | **DEAD END (Unclickable Tag)** | Low |
| 37 | Challenge Action Arrow Link | `<Link>` | 154-156 | `/dashboard/university/proposal/[id]` | Functional (directly to proposal) | Pass |

---

### E. Flow Detail Subpages in Scope

| # | Element Description | File Path | Line(s) | Target / Handler | Status | Severity |
|---|---------------------|-----------|---------|------------------|--------|----------|
| 38 | "Save Draft" Button | `university/proposal/[id]/page.tsx` | 81-86 | None (No `onClick`) | **DEAD END (Empty Handler)** | **High** |
| 39 | Dashboard Root Route (`/dashboard`) | `src/app/dashboard/page.tsx` | Missing | 404 Route | **CRITICAL 404 DEAD END** | **Critical** |

---

## 3. Verbatim Dead-End Code Snippets & Diagnostics

### Dead End 1: `href="#"` in Dashboard Shared Sidebar
- **File**: `web/src/app/dashboard/layout.tsx`
- **Lines**: 38–41, 79–95
- **Exact Code Snippet**:
```tsx
38:   const navigation = [
39:     { name: "Overview", href: isGov ? "/dashboard/gov" : isUni ? "/dashboard/university" : "/dashboard/industry", icon: LayoutDashboard },
40:     { name: "Settings", href: "#", icon: Settings },
41:   ];
```
- **Diagnostic**: The `Settings` navigation item links to `#`. Clicking it modifies the URL fragment to `#`, resets scroll position, and fails to load any settings view.

---

### Dead End 2: Non-existent `/dashboard` Index Route
- **File**: `web/src/app/dashboard/page.tsx`
- **Diagnostic**: No file exists at this path. Visiting `/dashboard` directly results in Next.js 404 page.
- **Root Cause**: `PROJECT.md` documents role dashboards (`/dashboard/gov`, `/dashboard/industry`, `/dashboard/university`), but no base router or landing exists under `/dashboard`.

---

### Dead End 3: "Filter Proposals" Button Without Handler
- **File**: `web/src/app/dashboard/industry/page.tsx`
- **Lines**: 52–55
- **Exact Code Snippet**:
```tsx
52:         <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
53:           <Filter className="w-4 h-4 text-slate-500" />
54:           Filter Proposals
55:         </button>
```
- **Diagnostic**: Rendered as a clickable button, but lacks `onClick`. User clicks expect a filter drawer, domain dropdown, or query toggle, but nothing happens.

---

### Dead End 4: Proposal Card External Navigation Button Without Handler
- **File**: `web/src/app/dashboard/industry/page.tsx`
- **Lines**: 132–134
- **Exact Code Snippet**:
```tsx
132:                 <button className="p-2 -mr-2 text-slate-400 hover:text-emerald-600 transition-colors">
133:                   <ArrowUpRight className="w-5 h-5" />
134:                 </button>
```
- **Diagnostic**: Appears at top-right of every proposal card. It presents an affordance of opening or inspecting the proposal in a detail view, but has no `onClick` handler.

---

### Dead End 5: Uncontrolled Search Input
- **File**: `web/src/app/dashboard/university/page.tsx`
- **Lines**: 49–56
- **Exact Code Snippet**:
```tsx
49:         <div className="relative">
50:           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
51:           <input 
52:             type="text" 
53:             placeholder="Search assigned challenges..."
54:             className="w-full md:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
55:           />
56:         </div>
```
- **Diagnostic**: Text input lacks both `value` and `onChange` attributes. Typing into the field has zero effect on the rendered challenge cards.

---

### Dead End 6: "View All" Button Without Handler
- **File**: `web/src/app/dashboard/university/page.tsx`
- **Lines**: 117–119
- **Exact Code Snippet**:
```tsx
117:           <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
118:             View All
119:           </button>
```
- **Diagnostic**: Positioned as the header action for the "Assigned Challenges" card. User expects to view the full list of assigned challenges, but clicking produces no response.

---

### Dead End 7: "Save Draft" Button Without Handler
- **File**: `web/src/app/dashboard/university/proposal/[id]/page.tsx`
- **Lines**: 81–86
- **Exact Code Snippet**:
```tsx
81:                 <button
82:                   type="button"
83:                   className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
84:                 >
85:                   Save Draft
86:                 </button>
```
- **Diagnostic**: In the proposal submission form, "Save Draft" has `type="button"` with no `onClick`. The form can only be submitted (`type="submit"`), which forces premature submission without saving work-in-progress.

---

### Dead End 8: Entirely Non-Interactive Gov Dashboard
- **File**: `web/src/app/dashboard/gov/page.tsx`
- **Lines**: 37–126
- **Exact Code Snippet**:
```tsx
37:       {/* Stats Grid */}
38:       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
39:         {stats.map((stat, i) => (
40:           <motion.div ...>
...
60:       <div className="grid lg:grid-cols-3 gap-6">
...
73:             {domainDistribution.map((item) => {
...
107:             <div className="relative pl-6 border-l-2 border-slate-100">
```
- **Diagnostic**: There is not a single `<button>`, `<Link>`, or `<a>` in the entire 131 lines of `GovDashboard`. The official is presented with high-level statistics but has no navigation paths to inspect challenges, approve resolutions, or drill down into districts.

---

## 4. Proposed Route Architecture & Navigation Schema

To eliminate all dead ends while strictly honoring the existing "government/critical" dark slate/indigo/emerald aesthetic, the following route structure is specified for Milestone 2 implementation:

```
web/src/app/dashboard/
├── layout.tsx                                # Updated with dynamic role-based multi-item sidebar
├── page.tsx                                  # NEW: Base router redirecting to user persona
├── settings/
│   └── page.tsx                              # NEW: Global / Role-aware portal settings
├── notifications/
│   └── page.tsx                              # NEW: State notification feed
├── gov/
│   ├── page.tsx                              # Updated with interactive cards & filter modal
│   ├── analytics/
│   │   └── page.tsx                          # NEW: District heatmap & velocity metrics
│   ├── challenges/
│   │   └── page.tsx                          # NEW: State-wide challenge directory & moderation
│   └── partners/
│       └── page.tsx                          # NEW: Academic & industry directory
├── industry/
│   ├── page.tsx                              # Updated with working filter modal & search
│   ├── proposals/
│   │   └── page.tsx                          # NEW: Full proposals directory with TRL filters
│   ├── mentorships/
│   │   └── page.tsx                          # NEW: Active mentorship tracking
│   ├── grants/
│   │   └── page.tsx                          # NEW: Escrow funding & disbursements
│   └── fund/
│       └── [id]/page.tsx                     # Existing: Updated to parse ?type= query param
└── university/
    ├── page.tsx                              # Updated with live search & filter tabs
    ├── challenges/
    │   └── page.tsx                          # NEW: Full assigned challenges directory
    ├── teams/
    │   └── page.tsx                          # NEW: Research labs & multidisciplinary teams
    ├── proposals/
    │   └── page.tsx                          # NEW: Submitted solution proposals pipeline
    └── proposal/
        └── [id]/page.tsx                     # Existing: Updated with working "Save Draft"
```

---

## 5. Detailed Page & Component Specifications

### 5.1 Shared Dashboard Sidebar & Layout (`/dashboard/layout.tsx`)

#### A. Multi-Item Role Navigation Matrix
The hardcoded 2-item navigation array must be replaced by a role-specific configuration:

```typescript
// Government Navigation
const govNav = [
  { name: "Overview", href: "/dashboard/gov", icon: LayoutDashboard },
  { name: "State Analytics", href: "/dashboard/gov/analytics", icon: BarChart3 },
  { name: "Challenges & Approvals", href: "/dashboard/gov/challenges", icon: AlertCircle },
  { name: "Partner Network", href: "/dashboard/gov/partners", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings?role=gov", icon: Settings },
];

// Industry Navigation
const industryNav = [
  { name: "Overview", href: "/dashboard/industry", icon: LayoutDashboard },
  { name: "Browse Proposals", href: "/dashboard/industry/proposals", icon: Lightbulb },
  { name: "My Mentorships", href: "/dashboard/industry/mentorships", icon: Briefcase },
  { name: "Funded Grants & Escrow", href: "/dashboard/industry/grants", icon: BadgeIndianRupee },
  { name: "Settings", href: "/dashboard/settings?role=industry", icon: Settings },
];

// University Navigation
const uniNav = [
  { name: "Overview", href: "/dashboard/university", icon: LayoutDashboard },
  { name: "Assigned Challenges", href: "/dashboard/university/challenges", icon: Target },
  { name: "Research Teams", href: "/dashboard/university/teams", icon: Users },
  { name: "Submitted Proposals", href: "/dashboard/university/proposals", icon: FileText },
  { name: "Settings", href: "/dashboard/settings?role=university", icon: Settings },
];
```

#### B. Mobile Drawer Auto-Close
Add `onClick={() => setSidebarOpen(false)}` to all sidebar `<Link>` items so navigating on mobile automatically closes the drawer.

#### C. Universal Top Bar / Header Integration
Add a desktop top navigation strip containing:
- Breadcrumb navigation (`Dashboard / Gov / Overview`)
- Global Quick Search (triggering command palette modal)
- Notification Bell linking to `/dashboard/notifications` with unread count badge (`bg-rose-500`)
- User Profile Pill with Persona badge (`Government Official`, `State of Jharkhand`)

---

### 5.2 Base Router Page (`web/src/app/dashboard/page.tsx`)

- **Design Aesthetic**: Slate-900 background accents, high-contrast role launcher cards.
- **Route**: `/dashboard`
- **Behavior**:
  - Checks client-side localStorage/cookie for last selected persona.
  - If unset, renders a clean "Select Portal Workspace" selector presenting the 3 official tiers:
    1. **State Innovation Board (Government)** -> `/dashboard/gov`
    2. **Academic Research Hub (University)** -> `/dashboard/university`
    3. **Corporate & CSR Directorate (Industry)** -> `/dashboard/industry`

---

### 5.3 Settings Page (`web/src/app/dashboard/settings/page.tsx`)

- **Design Aesthetic**: Slate-50 background, white glassmorphism cards (`border-slate-200`), tabbed navigation matching role theme (Blue for Gov, Emerald for Industry, Indigo for University).
- **Route**: `/dashboard/settings` (or `/dashboard/gov/settings`, etc.)
- **Tabs**:
  1. **Profile & Department**: Official designation, nodal officer ID, department/firm name, district jurisdiction.
  2. **Security & Credentials**: Password update, 2FA status badge, active API session tokens.
  3. **Notification Preferences**: Toggles for Critical Severity alerts, University Proposal notifications, Escrow release warnings.
  4. **Audit Log**: Chronological record of portal approvals and commitments with "Export Audit Trail (CSV)" action.

---

### 5.4 State Analytics & Heatmap (`web/src/app/dashboard/gov/analytics/page.tsx`)

- **Design Aesthetic**: High-contrast dark visualizers (`bg-slate-900 text-white`) combined with crisp white cards (`border-slate-200`).
- **Route**: `/dashboard/gov/analytics`
- **Key Visualizers**:
  - **District Heatmap Table**: 24 Jharkhand districts (Ranchi, Dhanbad, Gumla, Hazaribagh, East Singhbhum, Bokaro, etc.) displaying Total Challenges, Active Prototyping, and Resolved Rate.
  - **Domain Velocity Chart**: Average days from citizen report to university assignment (target: < 7 days).
  - **Filter Bar**: District dropdown, Domain multiselect, Date Range picker.
  - **Export Toolbar**: "Download State Dossier (PDF)", "Export Raw Data (CSV)".

---

### 5.5 State Challenges & Moderation (`web/src/app/dashboard/gov/challenges/page.tsx`)

- **Design Aesthetic**: Data table with status pill badges (`bg-emerald-50 text-emerald-700`, `bg-amber-50 text-amber-700`, `bg-rose-50 text-rose-700`).
- **Route**: `/dashboard/gov/challenges`
- **Components**:
  - **Tabs**: `All (1,248)`, `Pending Review (182)`, `Active Prototyping (156)`, `Resolved (342)`, `Critical Urgency (98)`.
  - **Search Bar**: Query by Challenge ID, District, or Keyword.
  - **Action Column**:
    - "Inspect Brief" -> `/challenge/[id]`
    - "Assign University" -> Inline modal selecting participating universities
    - "Approve Resolution" -> Modal with state sign-off signature

---

### 5.6 Industry Proposals Catalog (`web/src/app/dashboard/industry/proposals/page.tsx`)

- **Design Aesthetic**: Emerald / Slate palette (`border-emerald-200`, `text-emerald-700`).
- **Route**: `/dashboard/industry/proposals`
- **Components**:
  - **Interactive Filter Drawer**:
    - Domains (Water Management, Agriculture, Clean Energy, Healthcare, Urban Infrastructure)
    - Technology Readiness Level (TRL 1-3 Research, TRL 4-6 Prototype, TRL 7-9 Pilot)
    - Funding Bracket (Mentorship Only, Under ₹5 Lakhs, ₹5L - ₹20L, Above ₹20L)
  - **Proposal Grid**: Card layout displaying university badges (IIT ISM Dhanbad, BIT Mesra, NIT Jsr), requested funding, and dual action buttons:
    - `"Offer Mentorship"` -> `/dashboard/industry/fund/[id]?type=mentorship`
    - `"Fund Prototype"` -> `/dashboard/industry/fund/[id]?type=funding`

---

### 5.7 Industry Mentorships & Grants (`web/src/app/dashboard/industry/mentorships/page.tsx` & `grants/page.tsx`)

- **Design Aesthetic**: Financial trust styling with Indian Rupee formatting (`₹`), escrow milestone trackers, and verified badge icons (`ShieldCheck`).
- **Routes**:
  - `/dashboard/industry/mentorships`: Active collaboration channels with student researchers, upcoming advisory sprint dates, and meeting link triggers.
  - `/dashboard/industry/grants`: Escrow disbursements table (Tranche 1: Prototype Inception, Tranche 2: Field Testing, Tranche 3: Deployment) with verified release triggers.

---

### 5.8 University Assigned Challenges & Team Hub (`web/src/app/dashboard/university/challenges/page.tsx` & `teams/page.tsx`)

- **Design Aesthetic**: Indigo / Slate academia styling (`bg-indigo-50 text-indigo-700`, `border-indigo-200`).
- **Routes**:
  - `/dashboard/university/challenges`: Full list of AI-routed problems with dual actions:
    - `"View Problem Brief"` -> `/challenge/[id]` (inspects full ground-zero evidence, images, and citizen statements)
    - `"Draft Solution Proposal"` -> `/dashboard/university/proposal/[id]`
  - `/dashboard/university/teams`: Multidisciplinary faculty-student team directory, assigning lab resources to open challenges.

---

### 5.9 Quick-Fix Inline Interactions for Existing Files (M2 Prerequisites)

1. **`web/src/app/dashboard/gov/page.tsx`**:
   - Wrap 4 Stat cards in `<Link href="/dashboard/gov/challenges?filter=...">`.
   - Wrap 5 Domain progress rows in `<Link href="/dashboard/gov/analytics?domain=...">`.
   - Wrap Recent Update items in `<Link>` pointing to the respective challenge or proposal.
   - Add a top action toolbar with "Export Brief" and "Filter by District" buttons.

2. **`web/src/app/dashboard/industry/page.tsx`**:
   - Implement `isFilterOpen` state and interactive modal for the "Filter Proposals" button (line 52).
   - Replace proposal card `<ArrowUpRight>` `<button>` with `<Link href={`/dashboard/industry/fund/${proposal.id}`}>`.
   - Pass `?type=mentorship` on Mentor link and `?type=funding` on Fund Project link.
   - Wrap 3 metric cards in Links to `/dashboard/industry/proposals`, `/dashboard/industry/mentorships`, `/dashboard/industry/grants`.

3. **`web/src/app/dashboard/university/page.tsx`**:
   - Connect `searchQuery` state with `onChange` handler to live-filter `assignedChallenges`.
   - Wire "View All" button to `<Link href="/dashboard/university/challenges">`.
   - Wrap Challenge title in `<Link href={`/challenge/${challenge.id}`}>` so users can view the full problem brief before writing a proposal.
   - Wrap 3 metric cards in Links to their respective views.

4. **`web/src/app/dashboard/university/proposal/[id]/page.tsx`**:
   - Wire "Save Draft" button to save form state to `localStorage` and trigger a confirmation toast/banner.

---

## 6. Verification Plan & Test Commands

### 1. Static Verification
- Run pattern search to ensure 0 instances of `href="#"` remain in `src/app/dashboard`:
  ```powershell
  Select-String -Path "src\app\dashboard\**\*.tsx" -Pattern 'href="#"'
  ```
- Run pattern search to verify all `<button>` elements have `onClick` or `type="submit"`:
  ```powershell
  Select-String -Path "src\app\dashboard\**\*.tsx" -Pattern '<button'
  ```

### 2. Next.js Build & Routing Validation
- Verify compilation of all existing and new routes:
  ```powershell
  npm run build
  ```
- All routes must appear in the App Router route tree output without 404 or compilation errors.

---
*End of Analysis Report.*
