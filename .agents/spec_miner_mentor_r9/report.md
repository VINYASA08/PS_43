# Comprehensive Specification & Gap Analysis Report: Industry Mentor Dashboard

**Target Domain:** Industry Mentor Portal / Dashboard  
**Authoritative Reference:** `web/new page/mentor page.pdf`  
**Current Implementation:** `web/src/app/dashboard/industry/page.tsx`  
**Related APIs & Data:** `web/src/app/api/funds`, `web/src/app/api/micro-tasks`, `web/src/app/api/chat`, `web/prisma/schema.prisma`  
**Date:** 2026-09-09  
**Investigator:** Specification Miner (`spec_miner_mentor_r9`)

---

## 1. Executive Summary

A comprehensive specification audit was conducted on the Industry Mentor Dashboard by examining the multi-page specification artifact `web/new page/mentor page.pdf` and cross-referencing it with the Next.js frontend implementation in `web/src/app/dashboard/industry/page.tsx`.

The specification outlines an advanced, enterprise-grade industrial mentoring portal tailored for corporate CSR directors, technical mentors, and industry sponsors overseeing university-led translational R&D. The portal contains 7 primary navigation modules and 2 complex modal evaluation environments:
1. **Home Overview**: Top-level KPIs, Active Projects progress monitor, interactive Office Hours scheduler, and Technical Review Desk with live threaded feedback.
2. **Corporate CSR Grant & Escrow Ledger**: Financial tranche verification, milestone disbursals, and university expenditure/BOM audits.
3. **Lab Teams & Faculty Directory**: Academic stakeholder contacts, skill sets, researcher profiles, direct messaging, and corporate talent acquisition flags.
4. **Milestone Deliverables & Technical Kanban Task Board**: 4-stage engineering task pipeline (To Do, In Lab Testing, Awaiting Mentor Review, Completed) with actionable ticket creation.
5. **Project Version & Active TRL Audit Trail**: Formal TRL-1 to TRL-9 progression timeline with changelogs, schematic revisions, firmware commits, and municipal compliance gates.
6. **Mentor Settings & Availability Preferences**: Recurring office hours calendar, domain expertise tags, and notification rules.
7. **Secure Session Exit / Logout**: Draft preservation confirmation and confidentiality sign-out.
8. **Interactive CAD & Circuit Review Modal**: Multi-layered circuit schematic viewer with zoom/pan, redlined sticky-note annotations, real-time voltage test point graphs, rubric scoring sliders linked to TRL, video proof review, and Dual Decision Gates (Send Revisions vs. Sign-Off & Authorize Escrow).
9. **Bilateral IP Assignment & Royalty Term Sheet Modal**: National Innovation and Startup Policy (NISP) compliant linked royalty sliders, institutional vs. corporate Digital Signature Certificate (DSC) tracking, and a Counter-Offer desk.

### Key Finding:
While `web/src/app/dashboard/industry/page.tsx` introduces high-level scaffolding for the Home view and static shells for the two modals, **over 65% of the specification is missing or blocked by generic placeholders**:
- Tabs `escrow`, `teams`, `trl`, and `settings` currently render the forbidden placeholder: `<p>Module in development.</p>`.
- The `tasks` tab contains a rudimentary 3-column mock lacking required columns ("In Lab Testing", "Awaiting Mentor Review"), missing ticket generation, and without task metadata or drag-and-drop transitions.
- The Interactive CAD Viewer lacks actual schematic rendering, test point telemetry, voltage waveform graphs, and redline annotation creation.
- Rubric scoring controls are static CSS progress bars instead of interactive sliders and do not dynamically drive TRL calculations.
- Decision gate buttons, counter-offer desk triggers, DSC execution buttons, and logout actions are completely inert (dead buttons with no `onClick` handlers).

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | 7-Destination Mentor Sidebar | Persistent sidebar featuring 7 role-specific icons (Home, Escrow, Teams, Tasks, TRL, Settings, Logout) with active indicator and hover tooltips | Icon click (`home`, `escrow`, `teams`, `tasks`, `trl`, `settings`, `logout`) | State change to selected view / modal trigger | Reverts to default or retains current tab if invalid | PDF Pages 1-3 |
| 2 | Home KPIs | Top-Level Summary Metrics | 3 summary cards displaying Active Projects (3), Mentoring Hours Logged (14), and Pending Milestone Reviews (2) with icon accents | Project/session/review database records | Formatted KPI numbers, descriptions, and icon badges | Displays 0 or skeleton loader when data unavailable | PDF Page 1 |
| 3 | Home Overview | Active Projects Progress Card | Card highlighting current active challenge ("IoT Water Quality Monitor - BIT Mesra"), TRL level badge ("TRL 5"), and Visual Progress bar ("TRL 70%") | Project ID, milestone completion percentage | Progress bar graphic, TRL badge, project metadata | Displays "No active projects" empty state | PDF Page 1 |
| 4 | Home Overview | Scheduled Office Hours Widget | Monthly interactive calendar showing mentoring availability days (11, 15, 17) with `<` `>` month navigation and slot detail cards | Month navigation click, date click | Highlighted calendar grid, scheduled slot details (e.g. Fri 3-5 PM) | Disables navigation past calendar bounds | PDF Page 1, 3 |
| 5 | Home Overview | Technical Review Desk Card | Quick-access review card displaying CAD schematic thumbnail, "Current Reviewable: CAD Schematic", quick decision buttons, and threaded feedback | Zoom/Inspect click, message input, decision click | Schematic preview, quick review action, chat message display | Validates non-empty chat messages | PDF Page 1 |
| 6 | Home Overview | Threaded Technical Feedback | Live threaded feedback conversation between Junior Mentor/PI and Senior Mentor with timestamps, text formatting ("Aa"), and attachment buttons | Text input, file attachment, submit | Chronological message bubbles with sender avatars and timestamps | Disables send button when text is empty | PDF Page 1 |
| 7 | Escrow Ledger | Corporate CSR Grant & Escrow Ledger | Dedicated financial view tracking CSR funds pledged vs. disbursed to university labs | Filter by project, tranche status | Financial summary cards (Total Pledged, Disbursed, Locked in Escrow) | Handles 0 balance or currency formatting errors | PDF Page 2 |
| 8 | Escrow Ledger | Milestone Payment Tranche Breakdown | Table/cards displaying tranche details (e.g., Tranche 1: ₹75k / ₹1.05L Released; Tranche 2: ₹1.00L / ₹1.40L Locked in Escrow pending Field Test) | Tranche records, release action trigger | Tranche status badges (Disbursed, Escrowed, Pending), dates, amounts | Restricts early release without prerequisite milestone approval | PDF Page 2 |
| 9 | Escrow Ledger | University Expenditure & BOM Auditing | Mentor viewing of university-uploaded Bill of Materials (BOM) receipts and sensor purchase invoices (turbidity probes, microcontrollers) | Document view/inspect click | Modal/drawer preview of invoice PDF, itemized line items, vendor details | Displays "Receipt missing" warning if unattached | PDF Page 2 |
| 10 | Lab Directory | Lab Teams & Faculty Directory | Directory of all researchers, professors, and student engineers assigned to active challenges | Search by name/skill, filter by department/project | Roster of researcher cards with photos, qualifications, and department | Empty state when search returns no matches | PDF Page 2 |
| 11 | Lab Directory | Academic Profile & Role Inspection | Profile details displaying academic degrees (Ph.D., M.Tech), department, and project roles (Faculty Guide, Embedded Systems Researcher, ML Specialist) | Click on team member card | Detailed profile view with publications and assigned subsystem | Graceful fallback for missing bio or publications | PDF Page 2 |
| 12 | Lab Directory | Quick-Contact & Talent Flagging | Direct actions to send a direct message, view academic publications, or flag standout researchers for corporate internship/hiring | Click "Send Message", "View Publications", or "Flag for Corporate Hiring" | Opens chat drawer, launches publication link, or toggles talent bookmark | Confirms talent flag with toast notification | PDF Page 2 |
| 13 | Kanban Board | 4-Column Technical Task Board | Engineering task tracker with 4 mandatory columns: "To Do", "In Lab Testing", "Awaiting Mentor Review", "Completed" | Drag-and-drop or card move button | Column counts, re-ordered task cards | Prevents moving review tasks without required test proof | PDF Page 2 |
| 14 | Kanban Board | Actionable Technical Ticket Creation | Modal or form allowing mentors to create actionable technical tickets (e.g., "Re-test voltage regulator under 45°C ambient temperature") | Title, description, assignee, priority (Critical/High/Med), milestone | New task card added to "To Do" or "In Lab Testing" column | Validates required title, assignee, and priority | PDF Page 2 |
| 15 | TRL Audit | Formal TRL Progression Timeline | Visual scale from TRL-1 to TRL-9 tracking milestone progression (TRL-3 Analytical PoC -> TRL-4 Lab Testing -> TRL-5 Component Validation) | Project selection, milestone audit record | Interactive step indicator with criteria checklists and status badges | Flags incomplete verification gates before advance | PDF Page 3 |
| 16 | TRL Audit | Chronological Engineering Changelog | Comprehensive changelog tracking schematic updates, firmware commits, and lab test failure/success logs submitted by university | Filter by type (Schematic, Firmware, Test Log) | Timeline items with timestamps, commit SHAs, test metrics, diffs | Displays "No updates logged" for new milestones | PDF Page 3 |
| 17 | Settings | Office Hours & Availability Config | Configuration interface for weekly mentoring availability calendar (e.g., recurring slots: Fridays 3:00 PM – 5:00 PM) | Day selector, start/end time, recurring toggle | Saved schedule, syncs to home calendar widget | Validates end time > start time; prevents overlaps | PDF Page 3 |
| 18 | Settings | Domain Expertise Tags | Tag selection and management for mentor skills (Embedded Firmware, Structural Engineering, Water Filtration, IoT Telemetry) | Add/remove tag inputs | Active expertise badges; pairs mentor with relevant challenges | Requires at least 1 primary expertise domain | PDF Page 3 |
| 19 | Settings | Notification Alert Preferences | Toggle alert channels (Email, SMS, In-App) for lab milestone submissions, chat messages, and escrow tranche requests | Toggle switches per event type | Saved alert preferences object | Persists notification settings with success toast | PDF Page 3 |
| 20 | Authentication | Secure Session Sign-Out Dialogue | Modal triggered by logout icon prompting to save any unsaved review drafts before ending the session | Logout click, "Save & Exit" or "Discard & Exit" | Clears session cookie/store, redirects to `/login` | Prevents data loss on accidental logout click | PDF Page 3 |
| 21 | Review Desk | Interactive CAD & Circuit Viewer | Zoomable, pannable circuit schematic viewport displaying schematics, microcontroller blocks, and wiring without downloading raw files | Zoom In (+), Zoom Out (-), Reset, Pan | Scaled SVG/Canvas circuit rendering | Bounds zoom between 50% and 300% | PDF Page 4 |
| 22 | Review Desk | Redlined Sticky-Note Annotations | Interactive tool allowing mentors to click specific circuit components to leave redlined sticky-note annotations | Click on canvas coordinate, enter note text | Persistent yellow/red sticky note pin with expandable text | Requires note text; allows deletion/resolution | PDF Page 4 |
| 23 | Review Desk | Test Points & Voltage Telemetry | Dedicated panel listing critical circuit test points: Test Point 1 (14.8V), Test Point 2 (15.5V), Test Point 3 (12.3V), Test Point 4 (19.8V) | Test point selection | Live voltage reading, tolerance status (Normal/Warning) | Highlights out-of-spec voltage in red | PDF Page 4 |
| 24 | Review Desk | Real-Time Voltage Waveform Graphs | Mini sparkline/oscilloscope graphs for each test point showing voltage stability and ripple under thermal stress | Voltage stream data / sensor logs | Rendered SVG sparkline with min/max bounds | Displays flat line / error if sensor disconnected | PDF Page 4 |
| 25 | Review Desk | Rubric Scoring Criteria Sliders | Multi-parameter rubric sliders for Technical Feasibility (85%), Component Durability (90%), and Cost-Efficiency (80%) | Slider input (0% to 100% in step increments) | Percentage display, updates project TRL score dynamically | Restricts input range [0, 100] | PDF Page 4 |
| 26 | Review Desk | Dynamic TRL Calculation Engine | Calculates composite Technology Readiness Level score dynamically based on weighted rubric scores | Feasibility, Durability, Cost scores | Live TRL score percentage and stage progression bar | Falls back to baseline TRL if scores unset | PDF Page 4 |
| 27 | Review Desk | Lab Video Demo & Test Proof | Embedded video player previewing university-uploaded prototype bench tests (e.g. `Thermal_Stress_Test.mp4`) | Play/Pause click, fullscreen toggle | Video playback stream, test proof verification badge | Handles missing video format or playback error | PDF Page 4 |
| 28 | Review Desk | Dual Decision Gate: Revisions | "Send Revisions to Lab" (Orange Button) reopening ticket, locking funds, and notifying faculty guide with flagged flaws | Revision notes, checklist of failed criteria | Updates milestone status to `REVISION_REQUESTED`, triggers notification | Requires mentor feedback notes before submission | PDF Page 4 |
| 29 | Review Desk | Dual Decision Gate: Escrow Sign-Off | "Sign-Off & Authorize Escrow Tranche" (Green Button) digitally approving milestone and triggering CSR escrow tranche release | Digital sign-off confirmation | Disburses tranche, updates status to `APPROVED`, logs audit trail | Prompts for confirmation; prevents duplicate release | PDF Page 4, 5 |
| 30 | IP Royalty | Interactive Linked Royalty Sliders | Linked percentage sliders for Host University / TTO Share vs Industry Sponsor Share ensuring 100% total | Slider drag on either slider | Synchronized percentage display (e.g., 50% / 50%) | Enforces sum = 100%; warns if university < 30% | PDF Page 5 |
| 31 | IP Royalty | NISP Policy Compliance Badge | Verified badge certifying compliance with National Innovation and Startup Policy guardrails | Current royalty split percentage | "NISP Policy Compliant" green badge or "Non-Compliant" warning | Displays violation warning if university share < 30% | PDF Page 5 |
| 32 | IP Royalty | Dual DSC Execution Status Indicators | Real-time status indicators tracking University TTO DSC sign-off (Pending DSC) and Corporate Legal Sign-Off (Verified) | DSC verification data / token | Certificate status badge, CA authority, timestamp | Warns if DSC certificate expired or untrusted | PDF Page 5 |
| 33 | IP Royalty | Counter-Offer Desk | Interactive dialog allowing industry mentor or university to adjust royalty terms, add stipulations, and submit counter-offers | Proposed university %, sponsor %, justification | Recorded counter-proposal entry in audit log, notifies TTO | Validates non-empty justification | PDF Page 5 |
| 34 | IP Royalty | Execute Agreement with DSC | Action button executing the bilateral IP term sheet using Digital Signature Certificate PIN and cryptographic signing | DSC PIN input, agreement confirmation | Signed IP agreement record, downloads signed MoA PDF | Errors on invalid DSC token or incorrect PIN | PDF Page 5 |

---

## 3. Edge Cases Table

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Linked Royalty Sliders | User drags Host University slider down to 15% | Violates NISP policy guidelines (minimum 30% academic equity). The NISP Compliance badge should turn red/amber with a warning ("University royalty share cannot fall below 30% per NISP 2019 guidelines"). In current code, slider allows 10% without warning. |
| 2 | Linked Royalty Sliders | User tries to drag Industry Sponsor slider directly | In current code, the second slider is hardcoded to `readOnly` and `cursor-not-allowed`. In the PDF, both sliders are live and linked so dragging either slider dynamically rebalances the other (Sum = 100%). |
| 3 | Dual Decision Gate | Mentor clicks "Sign-Off & Authorize Escrow Tranche" without completing rubric scores | Should prompt the mentor: "All 3 rubric criteria (Feasibility, Durability, Cost) must be evaluated before authorizing tranche disbursement." Current code has no validation. |
| 4 | Dual Decision Gate | Mentor clicks "Send Revisions to Lab" with an empty recommendations box | System should prevent submission and flag: "Please provide specific revision instructions for the university lab." Current code has no click handler. |
| 5 | CAD Sticky Notes | Mentor clicks on circuit canvas outside component boundaries | System should place annotation pin at exact (x,y) click coordinates and immediately open an inline text editor. Current code only displays a single static hardcoded note. |
| 6 | CAD Sticky Notes | Zoom level changed from 100% to 250% | Annotation pins and test point callouts must scale and remain anchored to their respective circuit components. |
| 7 | Escrow Ledger | University submits expenditure with no attached invoice PDF | Expenditure entry should display a yellow "Voucher Unverified" flag and disable the "Approve Disbursement" action until receipt is attached. |
| 8 | Technical Kanban Board | Mentor drags task from "In Lab Testing" directly to "Completed" | Workflow rule should require task to transition through "Awaiting Mentor Review" before completion. |
| 9 | TRL Audit Trail | Lab attempts to claim TRL-6 when municipal deployment criteria are unmet | TRL audit engine should block stage transition and highlight failing criteria ("Operational environmental test logs missing"). |
| 10 | Logout Confirmation | Mentor has modified rubric scores or typed recommendations without submitting | Clicking the Logout button must open a confirmation dialogue: "You have unsaved review drafts. Would you like to save draft before exiting?" |
| 11 | Office Hours Scheduler | Mentor navigates across month boundaries (< or > buttons) | Calendar should smoothly transition month/year and recalculate days grid while preserving scheduled recurring mentoring slots. |
| 12 | Threaded Feedback Chat | User presses Enter with whitespace or blank text | Chat input should ignore empty submissions and keep cursor focused. |

---

## 4. Discrepancy & Gap Analysis

### 4.1. Navigation & Sidebar
- **Specification:** 7 navigation icons:
  1. Home (Dashboard Overview)
  2. Credit Card / Wallet (Escrow & Funding Milestones)
  3. Group / People (Lab Teams & Faculty Directory)
  4. Clipboard / Briefcase (Assignments & Technical Tasks)
  5. Refresh / Sync Cycle (Active TRL & Revision History)
  6. Gear (Settings & Availability Preferences)
  7. Bottom Exit / Logout (Secure Session Sign-Out with Draft Protection)
- **Current Implementation:**
  - Sidebar renders icons for 6 items in `nav` and 1 logout button.
  - Clicking `escrow`, `teams`, `trl`, or `settings` displays:
    ```tsx
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500">
      <p>Module in development.</p>
    </div>
    ```
    This directly violates acceptance criterion: *"Feature Completeness: An automated or manual inspection confirms that there are no 'Module in development' placeholders remaining for any of the core features described in the PDFs"*.
  - Logout button has no `onClick` handler (`<button className="..."><LogOut className="w-5 h-5" /></button>`), completely inert.

### 4.2. Home Dashboard Overview
- **Metrics KPIs:** Currently renders 3 cards (Active Projects: 3, Mentoring Hours Logged: 14, Pending Milestone Reviews: 2). Layout is clean and matches PDF metrics.
- **Active Projects Card:** Shows 1 project "IoT Water Quality Monitor - BIT Mesra" with TRL 5 and 70% progress. Missing ability to toggle or select among the 3 active projects.
- **Scheduled Office Hours Widget:**
  - PDF specifies an interactive monthly calendar with `<` `>` month navigation and highlighted dates (11, 15, 17) showing scheduled mentoring slots.
  - Current implementation renders a static 30-day loop without month name/year, `<` and `>` buttons have no click handlers, and clicking a date does not show slot details or booking actions.
- **Milestone Evaluation & Technical Review Desk Card:**
  - PDF Page 1 screenshot shows:
    - Schematic preview image/canvas with "Current Reviewable: CAD Schematic".
    - Action buttons directly on the desk: "Approve Stage" (green) and "Request Revisions" (orange).
    - Threaded feedback widget with message history, timestamps, and an input box with "Type a message...", "Aa" button, attachment button, and send button.
  - Current implementation:
    - Renders a dashed box with `CAD Schematic - Preview.pdf`.
    - Chat contains 2 static hardcoded message bubbles with NO input field, NO timestamps, NO formatting buttons, and NO send action.
    - Replaces the direct review actions with generic buttons ("Open Milestone Review Desk" and "Configure Bilateral IP Agreement").

### 4.3. Escrow & Funding Ledger Tab (`escrow`)
- **Specification:**
  - Total Corporate CSR Pledged vs Disbursed to university lab.
  - Milestone payment breakdown (e.g. Tranche 1: ₹75,000 / ₹1,05,000 Released upon Prototype Approval; Tranche 2: ₹1,00,000 / ₹1,40,000 Locked in Escrow pending Field Test).
  - University expenditure summaries and Bill of Materials receipts / sensor purchase invoices.
  - Release Tranche / Authorize Escrow Disbursal controls.
- **Current Implementation:** **100% Missing** (Shows generic "Module in development.").

### 4.4. Lab Teams & Faculty Directory Tab (`teams`)
- **Specification:**
  - Directory of all researchers and professors working on assigned projects.
  - Team member profiles, academic qualifications (Ph.D., M.Tech), university department, and specific project roles (Faculty Guide, Embedded Systems Researcher, Machine Learning Specialist).
  - Quick-contact options: "Send Direct Message", "View Researcher Publications", "Flag Standout Researcher for Corporate Internship / Hiring".
- **Current Implementation:** **100% Missing** (Shows generic "Module in development.").

### 4.5. Technical Kanban Task Board Tab (`tasks`)
- **Specification:**
  - 4 workflow columns: "To Do", "In Lab Testing", "Awaiting Mentor Review", "Completed".
  - Actionable technical tickets (e.g. "Re-test voltage regulator under 45°C ambient temperature", "Provide calibration curve for turbidity sensor").
  - Rich task metadata (priority, milestone, assignee, due date).
  - "+ Create Technical Ticket" modal.
- **Current Implementation:**
  - Renders 3 columns ("To Do", "In Progress", "Done") — missing "In Lab Testing" and "Awaiting Mentor Review".
  - 4 static text strings with zero metadata.
  - No ticket creation button or modal.
  - No drag/drop or move controls.

### 4.6. Active TRL & Revision History Tab (`trl`)
- **Specification:**
  - Project Version & Audit Log.
  - Formal TRL audit trail: TRL-3 (Analytical PoC) -> TRL-4 (Lab Testing) -> TRL-5 (Component Validation) -> TRL-6 / 7 (Municipal Deployment).
  - Chronological engineering changelog: schematic updates, firmware commits, and lab test failure/success logs.
- **Current Implementation:** **100% Missing** (Shows generic "Module in development.").

### 4.7. Mentor Settings & Office Hours Configuration (`settings`)
- **Specification:**
  - Weekly availability calendar configuration (recurring mentoring slots: Fridays 3:00 PM – 5:00 PM).
  - Domain expertise tags (Embedded Firmware, Structural Engineering, Water Filtration, IoT Telemetry).
  - Notification preferences (Email / SMS alerts when lab submits milestone).
- **Current Implementation:** **100% Missing** (Shows generic "Module in development.").

### 4.8. Interactive CAD & Circuit Review Modal (Modal 1)
- **Specification:**
  - Left side: Interactive CAD & Circuit Viewer:
    - Schematic viewport rendering actual circuit schematic (microcontroller, regulators, sensors, capacitors).
    - Zoom (+), Zoom (-), Pan, and Reset controls.
    - Click on circuit components to place redlined sticky-note annotations.
    - Test Points panel: Test Point 1 (Node 1: 14.8V), Test Point 2 (Node 2: 15.5V), Test Point 3 (Node 3: 12.3V), Test Point 4 (Node 4: 19.8V).
    - Real-Time Voltage Test Graphs: Waveform oscilloscope graphs for each node.
  - Top right: Rubric Scoring Criteria:
    - Interactive sliders for Technical Feasibility (85%), Component Durability (90%), and Cost-Efficiency (80%).
    - Automatically updates project's TRL progress bar.
    - Mentor Recommendations textarea.
  - Middle right: Lab Video Demo & Test Proof:
    - Video thumbnail/player for "University lab video demo" / `Thermal_Stress_Test.mp4`.
  - Bottom right: Dual Decision Gate:
    - Option A: "Send Revisions to Lab" (Orange Button) - Re-opens ticket, locks funding, notifies faculty guide.
    - Option B: "Sign-Off & Authorize Escrow Tranche" (Green Button) - Approves milestone and triggers CSR escrow tranche release.
- **Current Implementation:**
  - Schematic viewer is a static dashed rectangle with text `CAD_Schematic_v2.dwg`.
  - Zoom buttons have no state effect.
  - No interactive click-to-annotate functionality (only 1 static fake yellow box).
  - Test Points panel is **completely missing**.
  - Real-Time Voltage Test Graphs are **completely missing**.
  - Rubric scoring uses static `div` progress bars (`w-[85%]`, `w-[90%]`), NOT interactive sliders.
  - "Cost-Efficiency" parameter is missing.
  - TRL score is not calculated dynamically.
  - Decision buttons have no `onClick` handlers.

### 4.9. Bilateral IP Assignment & Royalty Term Sheet Modal (Modal 2)
- **Specification:**
  - Title: "Bilateral IP Assignment & Royalty Term Sheet".
  - NISP Policy Compliant verified badge with policy tooltip.
  - Interactive linked royalty sliders (Host University / TTO Share vs Industry Sponsor Share, e.g., 50% / 50%).
  - National NISP policy guardrails (warns if university share drops below 30%).
  - Digital Signature Status: University TTO Sign-Off (Pending DSC) and Corporate Legal Sign-Off (Verified).
  - Option 1: "Propose Counter-Offer" (Orange Button) opening counter-offer desk.
  - Option 2: "Execute Agreement with DSC" (Blue Button) triggering digital signature flow.
- **Current Implementation:**
  - Host University slider exists, but Industry Sponsor slider is `readOnly` and `cursor-not-allowed`.
  - No NISP guardrails enforcement or minimum threshold validation.
  - Digital Signature section is static text with no DSC token details.
  - "Propose Counter-Offer" button is dead (no `onClick`).
  - "Execute Agreement with DSC" button is dead (no `onClick`).

### 4.10. Logout Flow
- **Specification:** Prompts a confirmation dialogue to save any unsaved review drafts before logging out.
- **Current Implementation:** Button has no `onClick` handler.

---

## 5. Catalog of Generic Placeholders & Dead Ends

| Location in `page.tsx` | Code Snippet | Issue Description |
|------------------------|--------------|-------------------|
| Line 248–252 | `{activeTab !== "home" && activeTab !== "tasks" && (<div ...><p>Module in development.</p></div>)}` | Generic placeholder replacing 4 core modules: `escrow`, `teams`, `trl`, and `settings`. Directly violates acceptance criteria. |
| Line 60–62 | `<button className="... mt-auto" title="Logout"><LogOut className="w-5 h-5" /></button>` | Completely dead logout button; no click handler, no draft confirmation modal, no auth logout. |
| Line 145–146 | `<ChevronLeft className="w-4 h-4 cursor-pointer ..." /><ChevronRight ... />` | Dead buttons; calendar month navigation has no state or handler. |
| Line 172–173 | `<button ...><ZoomIn className="w-3.5 h-3.5" /></button><button ...><Maximize ... /></button>` | Dead buttons on schematic preview card. |
| Line 188–203 | Threaded technical feedback card | Chat displays 2 static messages; missing message input field, formatting tools, attachment icon, and send button shown in PDF Page 1. |
| Line 230–245 | `activeTab === "tasks"` | Hardcoded 3-column stub lacking required 4th column ("Awaiting Mentor Review"), missing ticket creation, missing metadata, and unmovable tasks. |
| Line 279–282 | `<button ...><ZoomIn ... /></button><button ...><ZoomOut ... /></button>` in CAD modal | Zoom buttons do not update viewport zoom state or scale. |
| Line 283–290 | CAD Schematic Viewport | Dashed box with text `CAD_Schematic_v2.dwg`; missing SVG circuit schematic, test points table, and voltage waveforms. |
| Line 305, 313 | Rubric Scoring Criteria | Fixed `w-[85%]` and `w-[90%]` divs; not interactive sliders; missing "Cost-Efficiency" parameter; does not compute TRL. |
| Line 329–335 | Lab Video Demo container | Static black box with play icon; no video preview or playback modal. |
| Line 342–347 | Dual Decision Gate buttons | Both "Send Revisions to Lab" and "Sign-Off & Authorize Escrow Tranche" have no `onClick` handlers. |
| Line 402–404 | Industry Sponsor Share slider | Marked `readOnly` and `cursor-not-allowed` instead of being an interactive linked slider. |
| Line 430–435 | IP Term Sheet action buttons | Both "Propose Counter-Offer" and "Execute Agreement with DSC" have no `onClick` handlers. |

---

## 6. Recommended Architecture & Implementation Plan

To achieve 100% feature completeness and eliminate all placeholders while adhering to the Next.js App Router and Tailwind CSS design system, the Industry Mentor Dashboard should be structured into clean, modular subcomponents:

```
web/src/app/dashboard/industry/
├── page.tsx                               # Main coordinator page with tab state & modal controllers
└── components/
    ├── MentorSidebar.tsx                  # 7-item navigation sidebar with active badges & logout trigger
    ├── tabs/
    │   ├── HomeTab.tsx                    # KPIs, Active Projects, Interactive Calendar, Review Desk & Chat
    │   ├── EscrowLedgerTab.tsx            # Corporate CSR Grant & Escrow Ledger with BOM/invoices & tranche actions
    │   ├── LabTeamsTab.tsx                # Researcher directory, academic qualifications, direct message & talent flag
    │   ├── KanbanTasksTab.tsx             # 4-column Jira-style board with actionable ticket creation
    │   ├── TrlAuditTab.tsx                # TRL-1 to TRL-9 audit trail & engineering changelog
    │   └── MentorSettingsTab.tsx          # Office hours availability, domain tags, alert preferences
    └── modals/
        ├── MilestoneReviewModal.tsx       # Interactive CAD viewer, redline sticky notes, test points, waveforms, rubric sliders, video proof, Dual Decision Gate
        ├── BilateralIPModal.tsx           # Linked royalty sliders, NISP policy validation, DSC status, counter-offer desk
        ├── NewTaskModal.tsx               # Modal to create actionable technical ticket
        ├── CounterOfferModal.tsx          # Dialog to formulate counter-proposal for IP terms
        ├── DscSignModal.tsx               # Digital Signature PIN & certificate confirmation
        └── LogoutConfirmModal.tsx         # Draft preservation prompt before session termination
```

### Key Technical Implementation Details:
1. **Interactive CAD & Circuit Viewer (`MilestoneReviewModal.tsx`)**:
   - Render a high-fidelity vector circuit schematic with interactive SVG components (MCU, LM317 voltage regulator, LoRa transceiver, ADC sensors, decoupling capacitors).
   - Zoom/pan controls manipulating SVG viewBox or CSS transform scale.
   - Click-to-annotate: clicking any node adds an interactive redline sticky note pin; clicking a pin expands the note text with delete/resolve actions.
   - Test Points Table: Render 4 test points with live voltage readings (14.8V, 15.5V, 12.3V, 19.8V) and thermal tolerance badges.
   - Real-Time Voltage Waveforms: Render mini SVG sparkline graphs for each node simulating voltage stability under load.
2. **Dynamic Rubric Scoring & TRL Engine**:
   - Provide 3 interactive sliders: Technical Feasibility (0-100%), Component Durability (0-100%), Cost-Efficiency (0-100%).
   - Dynamic formula: $\text{TRL Progress} = \text{round}(0.4 \times \text{Feasibility} + 0.35 \times \text{Durability} + 0.25 \times \text{Cost})$.
   - Update TRL progress bar dynamically as sliders move.
3. **Dual Decision Gate Execution**:
   - Option A ("Send Revisions"): Prompts for revision notes, transitions milestone to `REVISION_REQUESTED`, locks escrow tranche, shows confirmation toast.
   - Option B ("Sign-Off & Authorize Escrow Tranche"): Digitally approves milestone, releases next tranche (e.g. ₹1,40,000) directly to university lab account, updates escrow ledger, logs audit event.
4. **Interactive Linked Royalty Sliders & NISP Guardrails (`BilateralIPModal.tsx`)**:
   - Both University and Industry sliders are interactive. Moving one dynamically computes $100 - \text{val}$.
   - NISP Guardrail: If University Share $< 30\%$, badge changes to red "NISP Policy Violation (< 30% academic share)", disabling the DSC agreement button until terms comply.
5. **Full Tab Implementations**:
   - **Escrow Ledger**: Real data integration with `FundingCommitment` records, tranche tables, and mock BOM receipts.
   - **Lab Teams**: Multi-disciplinary researcher roster with skills, publications, direct messaging trigger, and corporate hiring bookmark.
   - **Kanban Board**: 4 columns ("To Do", "In Lab Testing", "Awaiting Mentor Review", "Completed"), task cards with priority badges, and "+ Create Technical Ticket" modal.
   - **TRL Audit**: Step-by-step TRL-1 to TRL-9 audit bar with criteria checkboxes and chronological commit/test history.
   - **Settings**: Weekly recurring office hours slot picker, expertise tags manager, and notification toggles.
   - **Logout**: Confirmation modal protecting review drafts before logging out.
