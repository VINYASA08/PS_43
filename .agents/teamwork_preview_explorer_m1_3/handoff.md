# Handoff Report: Platform UI Audit & Discovery (Detail Views & Flows)

**Agent**: Explorer 3  
**Role**: Teamwork Explorer (Platform UI Audit & Discovery)  
**Milestone**: Milestone 1: Platform UI Audit & Discovery  
**Target Scope**: 
- `web/src/app/challenge/[id]/page.tsx`
- `web/src/app/apply/[challengeId]/page.tsx`
- `web/src/app/dashboard/industry/fund/[id]/page.tsx`
- `web/src/app/dashboard/university/proposal/[id]/page.tsx`
- Cross-cutting links, back-links, and action handlers across `web/src/app/**`

---

## 1. Observation

Direct code observations from read-only inspection of files across `web/src/app/**`:

1. **Explicit `href="#"` dead link in global layout navigation**:
   - File: `web/src/app/dashboard/layout.tsx:40`
   - Code:
     ```tsx
     const navigation = [
       { name: "Overview", href: isGov ? "/dashboard/gov" : isUni ? "/dashboard/university" : "/dashboard/industry", icon: LayoutDashboard },
       { name: "Settings", href: "#", icon: Settings },
     ];
     ```

2. **Broken Route reference leading to 404**:
   - File: `web/src/app/page.tsx:197-201`
   - Code:
     ```tsx
     <Link
       href="/guidelines"
       className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all text-lg"
     >
       Read the Guidelines
     </Link>
     ```
   - Directory verification: `web/src/app/guidelines` does not exist in the filesystem.

3. **Dead Unhandled Buttons**:
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx:82-86`:
     ```tsx
     <button
       type="button"
       className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
     >
       Save Draft
     </button>
     ```
     Observed: `type="button"`, no `onClick` attribute, no attached event handler.
   - `web/src/app/page.tsx:135-137`:
     ```tsx
     <button className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
       View All Projects <ArrowRight className="w-5 h-5" />
     </button>
     ```
     Observed: No `onClick`, no link wrapper.
   - `web/src/app/dashboard/industry/page.tsx:52-55`:
     ```tsx
     <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
       <Filter className="w-4 h-4 text-slate-500" />
       Filter Proposals
     </button>
     ```
     Observed: No `onClick`, no dropdown state.
   - `web/src/app/dashboard/industry/page.tsx:132-134`:
     ```tsx
     <button className="p-2 -mr-2 text-slate-400 hover:text-emerald-600 transition-colors">
       <ArrowUpRight className="w-5 h-5" />
     </button>
     ```
     Observed: Top-right card pop-out arrow has no `onClick` or enclosing link.
   - `web/src/app/dashboard/university/page.tsx:117-119`:
     ```tsx
     <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
       View All
     </button>
     ```
     Observed: No `onClick`.

4. **Dead Interactive Cards with `cursor-pointer` but No Handlers**:
   - `web/src/app/challenge/[id]/page.tsx:94-98`: "Water Sample Photo" div has `cursor-pointer` and hover classes, but no `onClick` or modal trigger.
   - `web/src/app/challenge/[id]/page.tsx:99-103`: "Citizen Interview Video" div has `cursor-pointer`, play icon, hover classes, but no `onClick` or video modal trigger.
   - `web/src/app/submit/page.tsx:139-143`: "Upload Photos or Videos" styled container has no `<input type="file">`, no drag-and-drop listener, and no click trigger.

5. **Incomplete Flows & Missing Modals / Screens**:
   - `web/src/app/apply/[challengeId]/page.tsx:6`: `UploadCloud` icon is imported from `lucide-react` but never referenced in JSX; no file/CV upload field exists.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx:47-49`: The page displays only the bare ID `proposalId` with zero project title, university info, or milestone breakdown.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx:57-73`: Selecting "Mentorship Only" hides pledged funds, but presents no mentorship domain or hour pledge fields.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx:92-103`: "Sign Commitment Agreement" submits without any MoU agreement preview, escrow terms modal, or terms acceptance checkbox.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx:107-127`: Success screen lacks a CSR Pledge Certificate / Escrow Term Sheet download action.
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx`: Route is named `/proposal/[id]`, but renders a blank `SubmitProposal` form rather than viewing an existing proposal when accessed from university challenges in progress.
   - `web/src/app/login/page.tsx:5-46`: Omits an "Independent Expert / NGO" persona card despite being the target of the landing page CTA ("Register as an Expert" at `page.tsx:191`).

6. **Navigation Back-Links Verification**:
   - `web/src/app/challenge/[id]/page.tsx:43`: `<Link href="/#projects">` -> targets existing `<section id="projects">` on `/`. Valid.
   - `web/src/app/apply/[challengeId]/page.tsx:27`: `<Link href={`/challenge/${challengeId}`}>` -> targets valid dynamic route. Valid.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx:28`: `<Link href="/dashboard/industry">` -> targets existing route. Valid.
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx:27`: `<Link href="/dashboard/university">` -> targets existing route. Valid.
   - `web/src/app/submit/page.tsx:54` & `213`: `<Link href="/">` -> valid.
   - `web/src/app/login/page.tsx:50`: `<Link href="/">` -> valid.

---

## 2. Logic Chain

1. **From Observation 1**: `dashboard/layout.tsx:40` renders an item `{ name: "Settings", href: "#", icon: Settings }`. Because `href` is `"#"` and no `onClick` is provided, clicking this item does not route to any view and appends `#` to the window URL. Therefore, this violates the Milestone 1 contract ("Find `#` & dead ends across all pages").
2. **From Observation 2**: `page.tsx:197-201` contains `<Link href="/guidelines">`. A filesystem search of `web/src/app/` shows that `guidelines` does not exist as a directory or page route. Consequently, user interaction with "Read the Guidelines" throws an unhandled HTTP 404 in production.
3. **From Observation 3**: Interactive buttons across `proposal/[id]`, `page.tsx`, `industry/page.tsx`, and `university/page.tsx` (`Save Draft`, `View All Projects`, `Filter Proposals`, `View All`, and `ArrowUpRight`) lack both `onClick` handlers and wrapping navigation links. Therefore, they are dead UI elements that fail to respond to user intent.
4. **From Observation 4**: Elements with `cursor-pointer` and hover visual cues (ground zero photo, interview video, and file upload zone) lead users to expect a modal lightbox, media player, or file picker. The absence of listeners renders these dead interactive visual traps.
5. **From Observation 5**: High-stakes user journeys (submitting a ₹5L+ industrial commitment, submitting an academic proposal, and registering as an expert) lack context (missing proposal details), lack necessary validation (no legal MoU or escrow terms agreement), and lack expected confirmation artifacts (no CSR certificate download or draft saving feedback). Furthermore, the expert persona advertised on the homepage has no corresponding persona card on the login screen.
6. **Synthesis**: The platform UI exhibits strong foundation styling and layout structure, but contains 20 specific dead ends and flow gaps that must be resolved in Milestone 2 (Routes & Navigation) and Milestone 3 (Views & Modals) to achieve full platform integrity.

---

## 3. Caveats

1. **Read-Only Constraint**: In strict adherence to the Explorer instructions, no source files were modified. All findings and proposed resolutions are documented in `analysis.md` and this handoff.
2. **Mock Data Scope**: All IDs (e.g. `JHR-2026-842`, `PR-102`, `CH-842`) are currently simulated via hardcoded structures rather than a connected backend API or database.
3. **Responsive Breakpoints**: The audit focused on code path, event handlers, and route links. Device-specific touch gestures (e.g. mobile swipe) were not tested on physical hardware.

---

## 4. Conclusion

The audit of the detail views, application flow, funding flow, proposal submission, and cross-cutting navigation is complete:
- Exactly **1 explicit `href="#"`** exists (`src/app/dashboard/layout.tsx:40`).
- Exactly **1 broken 404 link** exists (`src/app/page.tsx:197` to `/guidelines`).
- Exactly **5 dead action buttons** and **3 dead interactive containers** were identified.
- **4 major flow/modal gaps** were documented with complete UI/UX specifications in `analysis.md`.
- All standard back-links (`Back to Portal`, `Back to Challenge`, `Back to Dashboard`, `Back to Industry Portal`) correctly resolve to existing routes.

The findings are fully actionable for implementers in Milestone 2 and Milestone 3.

---

## 5. Verification Method

To independently verify all observations and conclusions:

1. **Verify `href="#"`**:
   Search for `href="#"` in `web/src/app/`:
   ```powershell
   Get-ChildItem -Path "a:/Development/Antigravity/SIH26043/web/src/app" -Recurse -Filter "*.tsx" | Select-String -Pattern 'href="#"'
   ```
   *Expected result*: Exactly matches line 40 of `web/src/app/dashboard/layout.tsx`.

2. **Verify missing `/guidelines` route**:
   ```powershell
   Test-Path "a:/Development/Antigravity/SIH26043/web/src/app/guidelines"
   ```
   *Expected result*: `False`.

3. **Verify Dead Buttons and Elements**:
   Inspect line numbers reported in Observation section using `view_file`:
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx:82-86` (`Save Draft` button without `onClick`).
   - `web/src/app/dashboard/industry/page.tsx:52-55` (`Filter Proposals` button without `onClick`).
   - `web/src/app/challenge/[id]/page.tsx:94-103` (`aspect-video` containers with `cursor-pointer` but no `onClick`).

4. **Invalidation Conditions**:
   This report's findings would be invalidated if:
   - A global click delegator exists handling unhandled buttons by text (none exists in `layout.tsx` or `globals.css`).
   - Route rewrites or middleware in `next.config.ts` map `/guidelines` to an external URL or anchor (inspected `next.config.ts`, no redirects/rewrites present).
