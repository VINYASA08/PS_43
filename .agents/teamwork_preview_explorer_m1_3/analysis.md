# Platform UI Audit & Route Discovery: Detail Views & Action Flows

**Explorer**: Explorer 3 (Detail Views & Action Flows Scope)  
**Milestone**: Milestone 1: Platform UI Audit & Discovery  
**Audit Target**:
- `web/src/app/challenge/[id]/page.tsx` (Challenge Detail View)
- `web/src/app/apply/[challengeId]/page.tsx` (Application Flow)
- `web/src/app/dashboard/industry/fund/[id]/page.tsx` (Funding Detail View)
- `web/src/app/dashboard/university/proposal/[id]/page.tsx` (Proposal Detail View)
- Cross-cutting links, back-links, and action handlers across `web/src/app/**`

---

## Executive Summary

A comprehensive, line-by-line audit was conducted across all detail views, flow pages, dashboard layouts, and cross-cutting navigation links in `web/src/app`. 

The application features high-quality visual aesthetics adhering to the "government/critical" theme with high-contrast visualizers, glassmorphism headers, and clear status badges. However, the audit revealed **14 critical UI dead ends, placeholder actions, missing modals, and broken routes**, including:
1. **1 Explicit `href="#"` link** in global dashboard navigation (`dashboard/layout.tsx`).
2. **1 Broken 404 Route Link** (`/guidelines` referenced in `page.tsx`).
3. **5 Dead Unhandled Buttons** (e.g. `Save Draft` on proposal submission, `Filter Proposals` on industry dashboard, `View All` on university hub, `View All Projects` on landing page, and top-right card pop-out buttons).
4. **3 Dead Interactive Visual Elements** with `cursor-pointer` but zero event handlers (Ground Zero photo modal, video interview player, and file upload dropzones).
5. **4 Missing Modals & Flow Confirmations** (Terms & MoU escrow agreement before funding commitment, CSR donation certificate download, proposal detail view vs. creation form bifurcation, and expert role differentiation in application flow).

All identified issues are cataloged below with exact file paths, line numbers, verbatim code snippets, problem classification, and precise design specifications matching the platform aesthetic.

---

## Detailed Findings by Page / Component

---

### 1. Challenge Detail View (`web/src/app/challenge/[id]/page.tsx`)

#### Finding 1.1: Dead Interactive Card — Ground Zero Evidence Photo Lightbox
- **File**: `web/src/app/challenge/[id]/page.tsx`
- **Lines**: 94–98
- **Code Snippet**:
  ```tsx
  <div className="aspect-video bg-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 relative group overflow-hidden cursor-pointer">
    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
    <Camera className="w-8 h-8 mb-2 opacity-50" />
    <span className="text-sm font-semibold">Water Sample Photo</span>
  </div>
  ```
- **Issue Type**: Dead Interactive Element / Missing Modal.
- **Defect Description**: The element features `cursor-pointer`, hover state transitions, and an action icon, inviting user interaction. However, clicking it produces no action. There is no `onClick` handler, no lightbox modal, and no image preview.
- **Recommended Specification**:
  - Implement an **Evidence Lightbox Modal** triggered by `onClick={() => setSelectedEvidence('photo')}`.
  - Modal UI: Dark glass backdrop (`backdrop-blur-md bg-slate-950/80`), high-resolution satellite or field sample image overlay, EXIF/audit metadata panel on the right (GPS coordinates: `23.7957° N, 86.4304° E`, capture timestamp `24 Aug 2026, 09:42 IST`, verified by local nodal officer badge, chemical turbidity test readout `48 NTU`).

---

#### Finding 1.2: Dead Interactive Card — Citizen Interview Video Player
- **File**: `web/src/app/challenge/[id]/page.tsx`
- **Lines**: 99–103
- **Code Snippet**:
  ```tsx
  <div className="aspect-video bg-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 relative group overflow-hidden cursor-pointer">
    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
    <PlaySquare className="w-8 h-8 mb-2 opacity-50" />
    <span className="text-sm font-semibold">Citizen Interview Video</span>
  </div>
  ```
- **Issue Type**: Dead Interactive Element / Missing Video Modal.
- **Defect Description**: Has `cursor-pointer` and play icon `PlaySquare`, but no `onClick` handler or video playback mechanism.
- **Recommended Specification**:
  - Implement a **Citizen Testimonial Video Modal** with embedded HTML5 video / mock video player, scrub bar, bilingual transcript toggle (Hindi / English / Ho dialect), and nodal interview verification stamp.

---

#### Finding 1.3: Role Context Loss in Ecosystem Join Links
- **File**: `web/src/app/challenge/[id]/page.tsx`
- **Lines**: 215–220
- **Code Snippet**:
  ```tsx
  <Link href={`/apply/${challenge.id}`} className="w-full py-3 bg-slate-50 border border-slate-200 rounded-lg text-left px-4 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors flex justify-between items-center group">
    Provide Technical Mentorship <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
  </Link>
  <Link href={`/apply/${challenge.id}`} className="w-full py-3 bg-slate-50 border border-slate-200 rounded-lg text-left px-4 font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors flex justify-between items-center group">
    Provide Local Field Context (NGO) <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
  </Link>
  ```
- **Issue Type**: Context Loss in Navigation.
- **Defect Description**: Both choices route to `/apply/${challenge.id}` identically without search params or role state. The application page receives no indication of whether the user wants to be a Technical Mentor or an NGO Field Partner.
- **Recommended Specification**:
  - Update link hrefs to pass role params:
    - Mentorship: `/apply/${challenge.id}?role=mentor`
    - NGO Partner: `/apply/${challenge.id}?role=ngo`
  - `/apply/[challengeId]/page.tsx` reads `searchParams.get('role')` to customize the form header, contribution prompts, and credential uploads.

---

#### Finding 1.4: Conflation of Challenge ID vs Proposal ID in Industry Funding Link
- **File**: `web/src/app/challenge/[id]/page.tsx`
- **Lines**: 192–194
- **Code Snippet**:
  ```tsx
  <Link href={`/dashboard/industry/fund/${challenge.id}`} className="w-full py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
    <Building className="w-4 h-4" /> Offer Industry Funding
  </Link>
  ```
- **Issue Type**: Semantic Routing Disconnect.
- **Defect Description**: Passes `challenge.id` (e.g. `JHR-2026-842`) to the funding route `/dashboard/industry/fund/[id]`. However, `fund/[id]/page.tsx` explicitly treats the parameter as a `proposalId` ("Pledging support for University Proposal: {proposalId}").
- **Recommended Specification**:
  - When accessed from a challenge, display the challenge's assigned university solution proposal (e.g., `PR-842-1` by IIT ISM Dhanbad) or adapt `/dashboard/industry/fund/[id]` to handle both `id` types gracefully (Challenge vs Proposal) with clear metadata display.

---

#### Finding 1.5: Missing Share and Download Actions
- **File**: `web/src/app/challenge/[id]/page.tsx`
- **Lines**: 40–52, 185–196
- **Issue Type**: Missing Core Action Buttons.
- **Defect Description**: Critical public challenge portals typically require sharing capabilities (e.g. copy link, WhatsApp, LinkedIn) and "Download Problem Brief (PDF)" for offline academic/field circulation. Neither action is currently present.
- **Recommended Specification**:
  - Add a "Share Challenge" button beside Project ID in the navbar with copy-to-clipboard toast.
  - Add a secondary action button in the sidebar: `<button className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download Problem Brief (PDF)</button>`.

---

### 2. Application Flow (`web/src/app/apply/[challengeId]/page.tsx`)

#### Finding 2.1: Dead / Unused Import for Upload Feature
- **File**: `web/src/app/apply/[challengeId]/page.tsx`
- **Line**: 6
- **Code Snippet**:
  ```tsx
  import { ArrowLeft, CheckCircle2, UploadCloud, Users, Briefcase } from "lucide-react";
  ```
- **Issue Type**: Incomplete Feature / Dead Import.
- **Defect Description**: `UploadCloud` is imported from `lucide-react` but never rendered in the JSX. Expert application requires credential verification (CV, portfolio, NGO registration 12A/80G, ID proof), which was clearly intended but left unimplemented.
- **Recommended Specification**:
  - Add an interactive file upload component:
    ```tsx
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">Upload Credentials / Portfolio (PDF)</label>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50 cursor-pointer transition-colors">
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
      </div>
    </div>
    ```

---

#### Finding 2.2: Missing Role-Specific Form Adapters
- **File**: `web/src/app/apply/[challengeId]/page.tsx`
- **Lines**: 47–51
- **Code Snippet**:
  ```tsx
  <h1 className="text-2xl font-black text-slate-900 mb-2">Join Project Ecosystem</h1>
  <p className="text-slate-500 font-medium">
    Applying as an independent expert or NGO for challenge <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">{challengeId}</span>
  </p>
  ```
- **Issue Type**: Missing Dynamic View Personalization.
- **Defect Description**: No role selector or URL parameter parsing exists. Whether an applicant is an NGO field worker, technical mentor, or scientific agency (e.g. ISRO/CSIR alumni), the form is identical and lacks role-specific validation.
- **Recommended Specification**:
  - Add a role selector toggle at the top of the form (Technical Mentor / Academic Expert vs NGO Field Partner vs Domain Specialist).
  - Conditionally render fields: NGO DARPAN / Registration ID for NGOs; Institution / Field of Expertise for mentors.

---

### 3. Industry Funding Flow (`web/src/app/dashboard/industry/fund/[id]/page.tsx`)

#### Finding 3.1: Missing Proposal & Financial Breakdown Context
- **File**: `web/src/app/dashboard/industry/fund/[id]/page.tsx`
- **Lines**: 47–50
- **Code Snippet**:
  ```tsx
  <h1 className="text-2xl font-black text-slate-900 mb-2">Commit to Project Ecosystem</h1>
  <p className="text-slate-500 font-medium">
    Pledging support for University Proposal: <span className="font-mono text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">{proposalId}</span>
  </p>
  ```
- **Issue Type**: Missing Critical Context / High-Stakes UX Defect.
- **Defect Description**: An industry executive pledging substantial capital (₹5,00,000+) is only shown a bare ID string `proposalId`. There is no summary of the university team (e.g., IIT ISM Dhanbad), proposal title, problem tackled, budget breakdown, or milestone deliverables.
- **Recommended Specification**:
  - Add a **Proposal Summary Card** above the form displaying:
    - Proposal Title (e.g. "IoT Based Real-Time Water Quality Monitoring System")
    - Research Institution ("IIT ISM Dhanbad — Dept of Environmental Engineering")
    - Funding Progress (e.g., ₹3,50,000 requested · ₹1,50,000 co-funded · ₹2,00,000 remaining)
    - Milestone schedule badge list (Milestone 1: Sensor Array Fabrication; Milestone 2: Field Deployment).

---

#### Finding 3.2: Incomplete Mentorship-Only Pledge Inputs
- **File**: `web/src/app/dashboard/industry/fund/[id]/page.tsx`
- **Lines**: 57–73, 75–84
- **Code Snippet**:
  ```tsx
  <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${commitmentType === "mentorship" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}>
    <input type="radio" name="type" className="sr-only" checked={commitmentType === "mentorship"} onChange={() => setCommitmentType("mentorship")} />
    <Briefcase className={`w-6 h-6 mb-2 ${commitmentType === "mentorship" ? "text-emerald-600" : "text-slate-400"}`} />
    <p className="font-bold text-slate-900">Mentorship Only</p>
  </label>
  ```
- **Issue Type**: Incomplete Form Logic.
- **Defect Description**: When the user selects "Mentorship Only", the financial pledge input correctly hides. However, zero mentorship-specific fields appear. The user is left with only a generic message box before submitting a legal commitment agreement.
- **Recommended Specification**:
  - When `commitmentType === 'mentorship'` or `'both'`, render:
    - Designated Corporate Mentor Name & LinkedIn
    - Mentorship Domain (e.g. Industrial Fabrication, Regulatory Approval, Patent Filing, Scalability)
    - Committed Hours per Month (e.g. 5 hrs/mo, 10 hrs/mo).

---

#### Finding 3.3: Missing Escrow MoU Agreement & Legal Terms Modal
- **File**: `web/src/app/dashboard/industry/fund/[id]/page.tsx`
- **Lines**: 92–103
- **Code Snippet**:
  ```tsx
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
  >
    {isSubmitting ? (
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>Sign Commitment Agreement</>
    )}
  </button>
  ```
- **Issue Type**: Missing Confirmation Modal & Legal Escrow Terms.
- **Defect Description**: Button action states "Sign Commitment Agreement", but submits the form immediately with no terms verification, no draft MoU display, and no escrow conditions checkbox.
- **Recommended Specification**:
  - Add a **Draft State-Industry MoU Modal** or embedded agreement drawer.
  - Include a mandatory checkbox: `[ ] I agree to the State Innovation Escrow Guidelines, Milestone-Based Tranche Release, and Non-Exclusive Public Health Licensing Terms`.
  - On submit, trigger an agreement signature modal with digital signature/OTP confirmation.

---

#### Finding 3.4: Missing CSR Pledge Certificate Download on Success Screen
- **File**: `web/src/app/dashboard/industry/fund/[id]/page.tsx`
- **Lines**: 107–127
- **Code Snippet**:
  ```tsx
  <h2 className="text-2xl font-black text-slate-900 mb-3">Partnership Initiated!</h2>
  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed font-medium">
    Thank you for supporting innovation in Jharkhand. The university team and the State Innovation Board have been notified of your commitment.
  </p>
  <Link
    href="/dashboard/industry"
    className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
  >
    Return to Portal
  </Link>
  ```
- **Issue Type**: Missing Action / Incomplete Success Flow.
- **Defect Description**: The confirmation view only provides a single button returning to the portal. In government CSR/industry funding workflows, users require immediate proof of commitment: a downloadable CSR Commitment Certificate and State Escrow Term Sheet.
- **Recommended Specification**:
  - Add a prominent primary button:
    ```tsx
    <button className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
      <Download className="w-4 h-4" /> Download CSR Pledge Certificate (PDF)
    </button>
    ```

---

### 4. University Proposal Flow (`web/src/app/dashboard/university/proposal/[id]/page.tsx`)

#### Finding 4.1: Dead Button — "Save Draft"
- **File**: `web/src/app/dashboard/university/proposal/[id]/page.tsx`
- **Lines**: 82–86
- **Code Snippet**:
  ```tsx
  <button
    type="button"
    className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
  >
    Save Draft
  </button>
  ```
- **Issue Type**: Dead Action Button (Unhandled).
- **Defect Description**: The "Save Draft" button is rendered with `type="button"` and has **NO `onClick` handler, NO state persistence, NO toast feedback**. Clicking it does nothing.
- **Recommended Specification**:
  - Implement an `onClick` handler:
    1. Persist current proposal form values to `localStorage.setItem('proposal_draft_' + challengeId, JSON.stringify(formData))`.
    2. Show a dynamic toast notification: "Draft saved locally at [Current Time]".
    3. Update button state to display a temporary checkmark icon and text "Saved!".

---

#### Finding 4.2: Missing Research Methodology & Technical Document Attachment
- **File**: `web/src/app/dashboard/university/proposal/[id]/page.tsx`
- **Lines**: 51–79
- **Issue Type**: Missing Input Flow for Platform Scope.
- **Defect Description**: Academic solution proposals submitted to the State Innovation Board and Industry partners require technical architecture diagrams, BOM (Bill of Materials), and research papers. The form currently consists purely of text inputs with no file attachment capability.
- **Recommended Specification**:
  - Add a multi-file upload dropzone accepting PDF, DOCX, and ZIP (max 25MB) for "Technical Blueprint, Research Literature & Budget Breakdown".

---

#### Finding 4.3: Architectural Route Ambiguity — Creation Form vs. Proposal Detail View
- **File**: `web/src/app/dashboard/university/proposal/[id]/page.tsx`
- **Lines**: 9–50
- **Code Snippet**:
  ```tsx
  export default function SubmitProposal() {
    const params = useParams();
    const challengeId = params.id as string;
  ```
- **Issue Type**: Structural Route & Concept Conflation.
- **Defect Description**: 
  The route is named `/dashboard/university/proposal/[id]`. 
  However, the page implementation is named `SubmitProposal` and renders a blank proposal *submission* form for an assigned challenge ID, rather than a proposal *detail/review* view.
  When linked from `web/src/app/dashboard/university/page.tsx` line 154 for challenges already in `"Team Formed"` or `"Prototyping"`, it always presents an empty submission form!
- **Recommended Specification**:
  - Bifurcate or add view state:
    - If proposal already exists (e.g. proposal ID `PR-102` or challenge status is `Prototyping`), display the **Proposal Detail & Review Dashboard**: Proposal title, PI & Faculty team, Prototype Milestone Timeline, Industry Funding Status, Peer Review Comments, and an "Update Milestone Progress" action.
    - If drafting a new proposal for an assigned challenge (e.g. `CH-842` in `Review Required`), display the submission form.

---

### 5. Dashboard Layout & Global Navigation (`web/src/app/dashboard/layout.tsx`)

#### Finding 5.1: Dead Link — Settings `href="#"`
- **File**: `web/src/app/dashboard/layout.tsx`
- **Line**: 40
- **Code Snippet**:
  ```tsx
  const navigation = [
    { name: "Overview", href: isGov ? "/dashboard/gov" : isUni ? "/dashboard/university" : "/dashboard/industry", icon: LayoutDashboard },
    { name: "Settings", href: "#", icon: Settings },
  ];
  ```
- **Issue Type**: Dead Link (`href="#"`).
- **Defect Description**: The Settings navigation link has `href="#"`. Clicking it jumps to the top of the window, appends `#` to the browser URL, and fails to load any settings view.
- **Recommended Specification**:
  - Create route `/dashboard/settings/page.tsx` providing user profile details, notification preferences (Email/SMS for challenge updates), district/domain filter subscriptions, and role switching.
  - Update `navigation` config to `href: "/dashboard/settings"`.

---

#### Finding 5.2: Missing Role Switcher / Multi-Persona Switcher
- **File**: `web/src/app/dashboard/layout.tsx`
- **Lines**: 73–76, 99–107
- **Code Snippet**:
  ```tsx
  <div className={`px-4 py-3 rounded-xl mb-6 flex items-center gap-3 ${roleInfo.bg}`}>
    {roleInfo.icon}
    <span className={`font-semibold text-sm ${roleInfo.color}`}>{roleInfo.title}</span>
  </div>
  ```
- **Issue Type**: Missing Navigation Capability.
- **Defect Description**: The sidebar displays the active portal badge but provides no mechanism to switch between Government, University, and Industry portals without signing out to `/login` and reselecting a persona.
- **Recommended Specification**:
  - Convert the role badge into an interactive dropdown menu allowing immediate switching between:
    - 🏛️ Government Portal (`/dashboard/gov`)
    - 🎓 University Portal (`/dashboard/university`)
    - 💼 Industry Portal (`/dashboard/industry`)

---

### 6. Cross-Page Links & Interactive Elements Across `web/src/app/**`

#### Finding 6.1: Dead 404 Route — `/guidelines` on Landing Page
- **File**: `web/src/app/page.tsx`
- **Lines**: 197–201
- **Code Snippet**:
  ```tsx
  <Link
    href="/guidelines"
    className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all text-lg"
  >
    Read the Guidelines
  </Link>
  ```
- **Issue Type**: Broken Route (404 Not Found).
- **Defect Description**: The CTA link points to `/guidelines`. No such route exists in `web/src/app/`. Clicking it generates a Next.js 404 page.
- **Recommended Specification**:
  - Create `web/src/app/guidelines/page.tsx` detailing platform participation guidelines for NGOs, independent scientists, universities, and industry CSR partners, or link to a Guidelines Modal.

---

#### Finding 6.2: Dead Button — "View All Projects" on Landing Page
- **File**: `web/src/app/page.tsx`
- **Lines**: 135–137
- **Code Snippet**:
  ```tsx
  <button className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
    View All Projects <ArrowRight className="w-5 h-5" />
  </button>
  ```
- **Issue Type**: Dead Action Button (Unhandled).
- **Defect Description**: The button in the Open Critical Challenges section has no `onClick` handler and is not wrapped in a `<Link>`.
- **Recommended Specification**:
  - Replace `<button>` with `<Link href="/challenges">` or `<Link href="#projects">` with stateful search/filter controls to display the complete repository of challenges.

---

#### Finding 6.3: Missing "Independent Expert / NGO" Persona on Login Page
- **File**: `web/src/app/login/page.tsx`
- **Lines**: 5–46
- **Issue Type**: Missing Persona / Broken User Journey.
- **Defect Description**: 
  On the homepage (`page.tsx` lines 183–195), a major section invites Independent Experts and NGOs:
  `<Link href="/login" ...>Register as an Expert</Link>`.
  However, when the user arrives at `/login`, the personas listed are only:
  1. Government Official (`/dashboard/gov`)
  2. Higher Education Institution (`/dashboard/university`)
  3. Industry Partner (`/dashboard/industry`)
  4. Citizen / Community (`/submit`)
  There is NO persona card for Independent Experts or NGOs!
- **Recommended Specification**:
  - Add an "Independent Expert / NGO" persona card in `login/page.tsx`:
    ```tsx
    {
      id: "expert",
      title: "Independent Expert / NGO",
      description: "Provide domain mentorship, field validation, and technical review on active state challenges.",
      icon: <Users className="w-8 h-8 text-violet-600" />,
      href: "/challenge/JHR-2026-842",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-100",
      hoverBorder: "hover:border-violet-300",
    }
    ```

---

#### Finding 6.4: Dead Button — "Filter Proposals" on Industry Dashboard
- **File**: `web/src/app/dashboard/industry/page.tsx`
- **Lines**: 52–55
- **Code Snippet**:
  ```tsx
  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
    <Filter className="w-4 h-4 text-slate-500" />
    Filter Proposals
  </button>
  ```
- **Issue Type**: Dead Action Button (Unhandled).
- **Defect Description**: "Filter Proposals" button has no `onClick` handler, no dropdown menu, and no filter drawer.
- **Recommended Specification**:
  - Implement a Filter Dropdown/Drawer with filters for Domain (Water Management, Agriculture, Energy, Healthcare), Prototype Stage, and Funding Range (<₹5L, ₹5L–₹15L, Mentorship Only).

---

#### Finding 6.5: Dead Buttons — Card Top-Right Arrows on Industry Dashboard
- **File**: `web/src/app/dashboard/industry/page.tsx`
- **Lines**: 132–134
- **Code Snippet**:
  ```tsx
  <button className="p-2 -mr-2 text-slate-400 hover:text-emerald-600 transition-colors">
    <ArrowUpRight className="w-5 h-5" />
  </button>
  ```
- **Issue Type**: Dead Action Button (Unhandled).
- **Defect Description**: Each proposal card in the grid contains an `ArrowUpRight` icon button designed to expand or navigate to proposal details, but it has no `onClick` or enclosing link.
- **Recommended Specification**:
  - Wrap in `<Link href={`/dashboard/university/proposal/${proposal.id}`}>` or open a Proposal Detail Modal with full project specs.

---

#### Finding 6.6: Dead Button — "View All" on University Dashboard
- **File**: `web/src/app/dashboard/university/page.tsx`
- **Lines**: 117–119
- **Code Snippet**:
  ```tsx
  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
    View All
  </button>
  ```
- **Issue Type**: Dead Action Button (Unhandled).
- **Defect Description**: "View All" button on Assigned Challenges table has no `onClick` or link.
- **Recommended Specification**:
  - Toggle list pagination/expansion or route to `/dashboard/university/challenges`.

---

#### Finding 6.7: Dead Upload Box on Citizen Submit Page
- **File**: `web/src/app/submit/page.tsx`
- **Lines**: 139–143
- **Code Snippet**:
  ```tsx
  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center">
    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
    <p className="text-sm font-medium">Upload Photos or Videos</p>
    <p className="text-xs text-slate-500 mt-1">JPEG, PNG, MP4 up to 50MB</p>
  </div>
  ```
- **Issue Type**: Dead Interactive Element.
- **Defect Description**: Renders as a dashed upload container with text, but has no `<input type="file">`, no click handler, and no drag-and-drop listener. Users cannot actually attach media to their problem submission.
- **Recommended Specification**:
  - Add hidden `<input type="file" accept="image/*,video/*" multiple />` triggered on box click, with file list preview chips and upload progress indicator.

---

## Complete Audit Matrix

| ID | File | Lines | UI Element | Issue Category | Proposed Resolution |
|---|---|---|---|---|---|
| **AUD-01** | `dashboard/layout.tsx` | 40 | `<Link href="#">Settings</Link>` | Dead `href="#"` | Implement `/dashboard/settings/page.tsx` or Settings modal |
| **AUD-02** | `page.tsx` | 197–201 | `<Link href="/guidelines">` | 404 Dead Route | Implement `web/src/app/guidelines/page.tsx` |
| **AUD-03** | `challenge/[id]/page.tsx` | 94–98 | Water Sample Photo Card | Dead Element (`cursor-pointer`) | Interactive Lightbox Modal with EXIF/test kit data |
| **AUD-04** | `challenge/[id]/page.tsx` | 99–103 | Citizen Interview Card | Dead Element (`cursor-pointer`) | Citizen Video Player Modal with transcript & translation |
| **AUD-05** | `challenge/[id]/page.tsx` | 215–220 | Modal Apply Links | Missing Query Parameters | Route to `/apply/${id}?role=mentor` and `?role=ngo` |
| **AUD-06** | `challenge/[id]/page.tsx` | 192–194 | Offer Funding Link | ID Conflation | Pass both challenge ID and university proposal ID |
| **AUD-07** | `apply/[challengeId]/page.tsx` | 6 | `UploadCloud` unused import | Incomplete Feature | Add document/credential upload zone |
| **AUD-08** | `industry/fund/[id]/page.tsx` | 47–50 | Pledged Proposal Header | Missing Proposal Specs | Render Proposal Summary Card (Title, Uni, Funding Gap) |
| **AUD-09** | `industry/fund/[id]/page.tsx` | 57–73 | "Mentorship Only" selector | Incomplete Form Logic | Add mentorship hours and domain expertise fields |
| **AUD-10** | `industry/fund/[id]/page.tsx` | 92–103 | "Sign Agreement" button | Missing Terms / MoU | Add MoU preview modal & mandatory Escrow checkbox |
| **AUD-11** | `industry/fund/[id]/page.tsx` | 107–127 | Success Screen | Missing Certificate | Add "Download CSR Contribution Certificate" action |
| **AUD-12** | `university/proposal/[id]/page.tsx` | 82–86 | `<button>Save Draft</button>` | Dead Unhandled Button | Add local storage draft persistence & saved toast |
| **AUD-13** | `university/proposal/[id]/page.tsx` | 51–79 | Proposal Inputs | Missing File Upload | Add Technical Blueprint & BOM PDF upload zone |
| **AUD-14** | `university/proposal/[id]/page.tsx` | 9–50 | Submission vs Detail view | Route Semantics Disconnect | Bifurcate between Proposal Review view and Create Form |
| **AUD-15** | `dashboard/industry/page.tsx` | 52–55 | `<button>Filter Proposals</button>` | Dead Unhandled Button | Implement interactive filter drawer / pill bar |
| **AUD-16** | `dashboard/industry/page.tsx` | 132–134 | `<button><ArrowUpRight /></button>` | Dead Unhandled Button | Link to proposal detail view / modal |
| **AUD-17** | `dashboard/university/page.tsx` | 117–119 | `<button>View All</button>` | Dead Unhandled Button | Implement pagination / filter expansion |
| **AUD-18** | `page.tsx` | 135–137 | `<button>View All Projects</button>` | Dead Unhandled Button | Link to `/challenges` or expanded project filter |
| **AUD-19** | `submit/page.tsx` | 139–143 | Upload container | Dead Visual Dropzone | Add HTML5 file input with preview thumbnail chips |
| **AUD-20** | `login/page.tsx` | 5–46 | Persona Grid | Missing Role Persona | Add "Independent Expert / NGO" role card |

---

## Verification Plan for Subsequent Milestones (M2 & M3)

1. **Grepping for 0 `href="#"`**:
   Execute ripgrep or AST check ensuring 0 occurrences of `href="#"` or `href=""` across `web/src/app/**`.
2. **Next.js Route Tree Validation**:
   Run `npm run build` in `web/` to confirm all referenced static and dynamic routes (`/guidelines`, `/dashboard/settings`, `/challenge/[id]`, `/apply/[challengeId]`, `/dashboard/industry/fund/[id]`, `/dashboard/university/proposal/[id]`) compile without 404s.
3. **Action Handler Coverage**:
   Ensure every `<button>` element has either an attached `onClick` handler, `type="submit"`, or is wrapped in a Next.js `<Link>`.
4. **Interactive Modal States**:
   Verify lightbox, video interview player, draft saving toast, and MoU signature flows trigger properly with Framer Motion transitions matching the platform design tokens.
