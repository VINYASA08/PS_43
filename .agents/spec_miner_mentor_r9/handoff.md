# Handoff Report: Industry Mentor Dashboard Specification Mining

**Task:** Specification Mining and Gap Analysis for Industry Mentor Dashboard  
**Investigator:** Specification Miner (`spec_miner_mentor_r9`)  
**Timestamp:** 2026-09-09T14:26:00Z  
**Target File under Audit:** `web/src/app/dashboard/industry/page.tsx`  
**Authoritative Reference:** `web/new page/mentor page.pdf`  
**Report Location:** `a:/Development/Antigravity/SIH26043/.agents/spec_miner_mentor_r9/report.md`  

---

## 1. Observation

Direct examination of authoritative specification `web/new page/mentor page.pdf` (5 pages) and implementation `web/src/app/dashboard/industry/page.tsx` (453 lines) revealed the following concrete findings:

### 1.1. Authoritative Specification (`web/new page/mentor page.pdf`)
- **Page 1**:
  - 7-icon sidebar navigation.
  - Top metrics: Active Projects (3), Mentoring Hours Logged (14), Pending Milestone Reviews (2).
  - Active Projects card with TRL 5 badge and TRL 70% visual progress bar.
  - Scheduled Office Hours monthly calendar with `<` `>` month controls and highlighted active days (11, 15, 17).
  - Milestone Evaluation & Technical Review Desk card with CAD Schematic preview, direct decision buttons ("Approve Stage" - green, "Request Revisions" - orange), and live Threaded Technical Feedback chat with input area ("Type a message...", "Aa", attachment, send).
- **Page 2**:
  - Credit Card / Wallet Icon: "Corporate CSR Grant & Escrow Ledger", tracking pledged vs. disbursed funds, milestone payment breakdowns (Tranche 1: ₹75k released, Tranche 2: ₹1.00L locked in escrow), and university expenditure summaries (Bill of Materials receipts, sensor purchase invoices).
  - Group / People Icon: "Lab Teams & Faculty Directory", researcher profiles, academic degrees, department, roles (Faculty Guide, Embedded Systems Researcher, Machine Learning Specialist), direct message action, publications, and corporate talent flagging.
  - Clipboard / Briefcase Icon: "Kanban board / Task tracker" with 4 specific columns: "To Do", "In Lab Testing", "Awaiting Mentor Review", and "Completed", with actionable technical ticket creation.
  - Refresh / Sync Cycle Icon: "Active TRL & Revision History".
- **Page 3**:
  - "Project Version & Audit Log": Chronological engineering changelog (schematics, firmware commits, test logs) and formal TRL audit trail (TRL-3 Analytical PoC -> TRL-4 Lab Testing -> TRL-5 Component Validation).
  - Gear Icon: "Mentor Settings & Office Hours Configuration" with weekly availability slots (e.g. Fridays 3-5 PM), domain expertise tags (Embedded Firmware, Structural Engineering, Water Filtration), and notification preferences.
  - Exit Icon: "Bottom Exit / Logout Icon" with confirmation dialogue to save unsaved review drafts.
- **Page 4**:
  - "Milestone 2 Review: IoT Circuit Schematics & Thermal Logs" modal:
    - Interactive CAD & Circuit Viewer with zoom (+/-), pan, sticky note redlines on circuit components.
    - Test Points panel: Test Point 1 (Node 1 14.8V), Test Point 2 (Node 2 15.5V), Test Point 3 (Node 3 12.3V), Test Point 4 (Node 4 19.8V).
    - Real-Time Voltage Test Graphs: Oscilloscope waveform charts for each node.
    - Rubric Scoring Criteria: Sliders for Technical Feasibility (85%), Component Durability (90%), Cost-Efficiency, dynamically calculating project TRL progress.
    - Lab Video Demo & Test Proof player (`Thermal_Stress_Test.mp4`).
    - Dual Decision Gate: "Send Revisions to Lab" (orange) and "Sign-Off & Authorize Escrow Tranche" (green).
- **Page 5**:
  - "Bilateral IP Assignment & Royalty Term Sheet" modal:
    - "NISP Policy Compliant" verified badge.
    - Interactive linked royalty sliders (Host University / TTO Share vs. Industry Sponsor Share, 50%/50%) constrained by NISP policy guardrails (minimum 30% academic equity).
    - Digital Signature Status: University TTO Sign-Off (Pending DSC) and Corporate Legal Sign-Off (Verified).
    - Counter-Offer Desk ("Propose Counter-Offer" button).
    - Dual DSC Execution ("Execute Agreement with DSC" button).

### 1.2. Implementation State (`web/src/app/dashboard/industry/page.tsx`)
1. **Generic Placeholders & Missing Tabs**:
   - Lines 248–252:
     ```tsx
     {activeTab !== "home" && activeTab !== "tasks" && (
       <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500">
         <p>Module in development.</p>
       </div>
     )}
     ```
     Tabs `escrow`, `teams`, `trl`, and `settings` are completely unbuilt and render the forbidden placeholder.
2. **Dead Buttons**:
   - Line 60: `<button className="p-3 text-slate-400 hover:text-rose-500 transition-colors mt-auto" title="Logout"><LogOut className="w-5 h-5" /></button>` has no `onClick` handler.
   - Lines 145–146: `<ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-600" />` and `<ChevronRight ... />` have no `onClick`.
   - Lines 342–347: Both Dual Decision Gate buttons ("Send Revisions to Lab" and "Sign-Off & Authorize Escrow Tranche") have no `onClick` handlers.
   - Lines 430–435: Both IP modal action buttons ("Propose Counter-Offer" and "Execute Agreement with DSC") have no `onClick` handlers.
3. **Incomplete Kanban Implementation**:
   - Lines 227–246: Displays 3 columns ("To Do", "In Progress", "Done") instead of the 4 required by spec ("To Do", "In Lab Testing", "Awaiting Mentor Review", "Completed"). Task cards are static strings without assignees, priorities, or ticket creation mechanisms.
4. **CAD & Circuit Review Deficiencies**:
   - Lines 276–292: CAD viewer is a static dashed container with text `CAD_Schematic_v2.dwg` and 1 hardcoded static note. Zoom buttons do not change scale; Test Points and Voltage Waveform graphs are completely omitted.
   - Lines 297–315: Rubric scoring uses static `div` widths (`w-[85%]`, `w-[90%]`) rather than interactive sliders; "Cost-Efficiency" is omitted; TRL progress is not calculated.
5. **Royalty Sliders Deficiencies**:
   - Lines 401–404: The Industry Sponsor Share slider is hardcoded to `readOnly` and `cursor-not-allowed`. NISP policy guardrails (< 30% warning) are absent.

---

## 2. Logic Chain

1. **Step 1 (Authoritative Mandate)**: The latest requirement in `ORIGINAL_REQUEST.md` (2026-09-09T14:19:46Z) explicitly states:
   > "Feature Completeness: An automated or manual inspection confirms that there are no 'Module in development' placeholders remaining for any of the core features described in the PDFs (e.g., Royalty Sliders, Dual Decision Gates, Hover Tooltips)."
2. **Step 2 (Gap Identification)**: In `industry/page.tsx:248-252`, any tab other than `home` and `tasks` outputs `<p>Module in development.</p>`. Therefore, 4 core modules (`escrow`, `teams`, `trl`, `settings`) immediately fail the acceptance criteria.
3. **Step 3 (Functional Deficiencies)**: The remaining two implemented areas (`tasks` and modals) fail specification compliance:
   - `tasks` uses 3 generic columns instead of the 4 engineering workflow columns mandated by PDF Page 2.
   - Milestone Review modal lacks interactive circuit schematics, test points telemetry, voltage waveform sparklines, rubric sliders, and interactive decision buttons.
   - Bilateral IP modal has a disabled second slider, no NISP guardrail enforcement, and dead action buttons.
4. **Step 4 (Root Cause)**: The current `industry/page.tsx` is a monolithic early scaffold (~453 lines) that prioritized visual framing of the Home view while stubbing out all complex data-driven modules and sub-views.
5. **Step 5 (Solution Architecture)**: To satisfy the prompt's acceptance criteria, the dashboard must be refactored into modular subcomponents supporting all 7 navigation tabs, 2 primary modals, and secondary dialogs (New Ticket, Counter-Offer, DSC PIN, Logout Confirmation) with rich interactivity and zero placeholder text.

---

## 3. Caveats

- **Caveat 1**: The database schema (`prisma/schema.prisma`) contains models for `FundingCommitment`, `MicroTask`, `ChatMessage`, `Proposal`, and `Challenge`. While these models provide strong backend alignment for Escrow, Tasks, and Chat, certain fine-grained UI features (e.g. vector CAD coordinates and live oscilloscope streams) are best rendered via rich client-side SVG visualizations and simulated telemetry state.
- **Caveat 2**: Standalone test files under `tests/` currently contain TypeScript errors due to outdated mock definitions. However, `web/src/` itself compiles cleanly with zero TypeScript errors. Any implementation must ensure `web/src/` continues to build cleanly.

---

## 4. Conclusion

The current implementation in `web/src/app/dashboard/industry/page.tsx` is **substantially incomplete** relative to `web/new page/mentor page.pdf`:
- 4 of 7 sidebar tabs (`escrow`, `teams`, `trl`, `settings`) are blocked behind "Module in development."
- The `tasks` tab deviates from the 4-column engineering specification and lacks ticket creation.
- The CAD schematic viewer lacks circuit schematics, test point telemetry, and waveform sparklines.
- Both Dual Decision Gate buttons and IP execution buttons are dead ends with no event handling.

A full, modular component architecture has been specified in `a:/Development/Antigravity/SIH26043/.agents/spec_miner_mentor_r9/report.md` to guide the implementation agent to 100% specification compliance.

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Verify Placeholders in Source Code**:
   ```bash
   grep -n "Module in development" web/src/app/dashboard/industry/page.tsx
   # Expected output: Line 250 matches "<p>Module in development.</p>"
   ```
2. **Verify Dead Buttons in Source Code**:
   ```bash
   grep -n -E "Send Revisions to Lab|Sign-Off & Authorize Escrow Tranche|Propose Counter-Offer|Execute Agreement with DSC" web/src/app/dashboard/industry/page.tsx
   # Expected output: Lines 343, 346, 431, 434 contain buttons without onClick handlers.
   ```
3. **Verify ReadOnly Slider**:
   ```bash
   grep -n "readOnly" web/src/app/dashboard/industry/page.tsx
   # Expected output: Line 402 shows readOnly on Industry Sponsor Share slider.
   ```
4. **Verify PDF Specifications**:
   Inspect `web/new page/mentor page.pdf` pages 1 through 5 using `view_file` to confirm all 34 discovered features and 12 edge cases detailed in `report.md`.
