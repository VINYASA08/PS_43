# Comprehensive Codebase & UI Architecture Survey Report

**Project**: Jharkhand State Societal Innovation & Challenge Escalation Portal (SIH26043)  
**Surveyed By**: Explorer Survey 1 (Codebase & UI Architecture Explorer)  
**Date**: 2026-09-05  
**Target Codebase**: `a:\Development\Antigravity\SIH26043\web`  
**Reference Document**: `a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md`

---

## Executive Summary

An exhaustive, read-only architectural investigation was conducted on the web frontend repository located at `a:\Development\Antigravity\SIH26043\web`. The application is built on **Next.js 16.3.4** (App Router architecture with Turbopack), **React 19.2.8**, **Tailwind CSS v4**, **Framer Motion v13.2**, **Lucide React**, **Zustand v5**, **Prisma v7.10** with an embedded **SQLite** relational store, and **Jose v6.2 / bcryptjs / speakeasy / qrcode** for multi-persona security.

The frontend currently encompasses **16 distinct route pages**, two shared structural layouts, four dedicated reusable presentation/feedback components (`RoleGuard`, `Skeletons`, `EmptyState`, `NetworkBanner`), a centralized API client with automatic CSRF token replenishment, and a Zustand-based authentication store.

While the user interface delivers strong visual fidelity, sleek motion choreography, and high aesthetic polish across public and authenticated views, this survey has uncovered **critical architectural discrepancies and blockers** relative to the requirements stipulated in `ORIGINAL_REQUEST.md`:
1. **Critical Browser Blocker in `next.config.ts` (Line 45)**: The HTTP response header `Permissions-Policy: camera=(), microphone=(), geolocation=()` explicitly denies browser access to camera, microphone, and geolocation APIs, completely blocking any native web GPS acquisition or photo capture.
2. **Citizen Submission Flow Disconnection**: The 3-step citizen submission wizard (`/submit`) collects uploaded files in local React state, but **never transmits file binaries to the server or any object storage**. Instead, it generates a hardcoded mock JSON string referencing static `/evidence/${name}` paths alongside hardcoded water telemetry (`turbidity: 48 NTU`).
3. **Absence of Real AI Categorization Engine**: Despite requirements for an external AI provider (Gemini / OpenAI) to analyze grievances, cluster duplicates, and route to academic labs, **zero AI provider packages are installed in `package.json`**, and no prompt orchestration or external LLM API routes exist.
4. **Geo-Location Limitations**: Location inputs in `/submit` are unvalidated free-form text strings (`district: "Dhanbad"`, `location: "Block XYZ, Village 4"`), lacking both an authoritative 24-district dropdown for Jharkhand and any GPS coordinate extraction.

---

## 1. UI Architecture & Routing Map

### 1.1 Technology Stack & Build Tooling
Inspected directly in `web/package.json`:
- **Core Framework**: Next.js 16.3.4 (App Router)
- **Runtime & UI**: React 19.2.8, React DOM 19.2.8
- **Styling**: Tailwind CSS v4.2.1 (`@tailwindcss/postcss`)
- **Animation**: Framer Motion 13.2.0
- **Icons**: Lucide React 1.16.0
- **Client State**: Zustand 5.0.12
- **Validation**: Zod 4.5.1
- **Database & ORM**: Prisma Client 7.10.0, Prisma CLI 7.10.0 (SQLite provider)
- **Security & Cryptography**: Jose 6.2.2 (JWT), bcryptjs 3.0.3, speakeasy 2.0.0 (TOTP 2FA), qrcode 1.5.4
- **Testing**: Node.js test runner (`tsx --test tests/**/*.test.ts`, `node tests/routes.test.mjs`, `node tests/workflows.test.mjs`)

### 1.2 Layout & Navigation Hierarchy
- **Master Layout (`web/src/app/layout.tsx`)**:
  - Global `<html>` and `<body>` tags configuring Inter and JetBrains Mono fonts via CSS variables.
  - Mounts `<NetworkBanner />` at the root to monitor browser `online`/`offline` lifecycle events.
  - Injects global styling (`src/app/globals.css`).
- **Dashboard Layout (`web/src/app/dashboard/layout.tsx`)**:
  - Encapsulates all `/dashboard/*` child routes within a protected `<RoleGuard>` component.
  - Configures a responsive layout with a dynamic sidebar navigation pane and a fixed top bar.
  - Sidebar links adaptively reflect user role:
    - `CITIZEN`: Grievances, Track Status, Public Ledger
    - `UNIVERSITY`: Open RFPs, DPR Submissions, Active Grants
    - `INDUSTRY`: CSR Escrow, Proposal Matching, Mentorship Ledger
    - `GOVERNMENT` / `ADMIN`: State Triage Ledger, User Approvals, Escalation Engine, Audit Trail
  - Includes user profile badge, active role indicator, and sign-out handler calling `authStore.logout()`.

### 1.3 Comprehensive Catalog of All 16 Frontend Routes

| Route | File Path | Route Type | Primary Components & State | Access Control |
|---|---|---|---|---|
| `/` | `web/src/app/page.tsx` | Public Landing | Hero banner, live impact metrics, active societal challenge preview grid, persona access cards, call-to-action buttons | Public |
| `/submit` | `web/src/app/submit/page.tsx` | Public / Citizen | 3-step wizard (Problem Details → Location & Evidence → Review), drag-and-drop file dropzone, tracking ID generator | Public / Anonymous with default fallback |
| `/track` | `web/src/app/track/page.tsx` | Public Utility | Live search bar, 5-stage resolution pipeline, dynamic telemetry indicators, audit log timeline, SMS subscription modal | Public |
| `/login` | `web/src/app/login/page.tsx` | Public Auth | 4-tab persona selector (Citizen Phone OTP, University .ac.in, Industry Corporate, Gov .gov.in/.nic.in), TOTP 2FA challenge modal | Public |
| `/dashboard` | `web/src/app/dashboard/page.tsx` | Authenticated Gateway | Central role-based router that redirects users to their persona dashboard (`/gov`, `/university`, `/industry`) or displays quick links | Authenticated (Any Role) |
| `/dashboard/gov` | `web/src/app/dashboard/gov/page.tsx` | Government Portal | Top-level KPI metric cards, domain distribution bars, user approval gate, interactive triage ledger, CSV export, immutable audit trail | Gov / Admin |
| `/dashboard/university` | `web/src/app/dashboard/university/page.tsx` | Academic Hub | Open RFP search & priority filtering, research docket cards, submitted DPR list, grant tracker | University |
| `/dashboard/university/proposal/[id]` | `web/src/app/dashboard/university/proposal/[id]/page.tsx` | Academic R&D | Detailed Project Report (DPR) drafting console, TRL stage selector, budget & timeline inputs, PDF upload | University |
| `/dashboard/industry` | `web/src/app/dashboard/industry/page.tsx` | Industry CSR Hub | CSR funds committed metric, multi-criteria proposal filter modal, proposal matching cards, escrow ledger | Industry |
| `/dashboard/industry/fund/[id]` | `web/src/app/dashboard/industry/fund/[id]/page.tsx` | Industry Escrow | Funding & mentorship commitment console, tripartite MoU agreement modal, 80G tax receipt generator | Industry |
| `/dashboard/settings` | `web/src/app/dashboard/settings/page.tsx` | User Account | 5-tab settings: Profile update, notification toggles, 2FA TOTP QR setup & sessions, API tokens, compliance dockets | Authenticated |
| `/challenge/[id]` | `web/src/app/challenge/[id]/page.tsx` | Public Detail | Problem docket view, ground telemetry cards, linked university proposals, collaborative peer-review modal | Public |
| `/apply/[challengeId]` | `web/src/app/apply/[challengeId]/page.tsx` | Expert Application | Independent scientist / researcher application form, domain expertise selector, resume upload | Public / Expert |
| `/guidelines` | `web/src/app/guidelines/page.tsx` | Policy & Knowledge | 4 operational policy pillars, accordion FAQ, automated official directive download (`.txt`/PDF) | Public |
| `/whatsapp-intake` | `web/src/app/whatsapp-intake/page.tsx` | Low-Bandwidth Mockup | Simulated WhatsApp chat interface for zero-friction rural reporting, image attachment simulation, GPS simulation | Public |
| `/accountability` | `web/src/app/accountability/page.tsx` | Public Governance | GRAI institutional performance leaderboard, resolution SLA rankings, department vs university filtering | Public |

### 1.4 Client State Management Architecture
1. **Authentication Store (`web/src/stores/authStore.ts`)**:
   - Implemented with **Zustand v5**.
   - State properties: `user: UserProfile | null`, `isAuthenticated: boolean`, `isLoading: boolean`, `sessionExpired: boolean`.
   - Actions:
     - `initialize()`: Dispatches `GET /api/auth/me` on initial app hydration to recover active session from HTTP-only cookie.
     - `login(user)`: Sets active user and flips `isAuthenticated` to true.
     - `logout()`: Dispatches `POST /api/auth/logout`, clears user state, redirects to `/login`.
     - `setSessionExpired(boolean)`: Activates session-expiry modals when 401 Unauthorized responses occur.
2. **Local Component State**:
   - Extensive use of React `useState` and `useRef` for multi-step form progress (`step`), input bindings, file staging arrays, filter conditions, and modal visibility.
3. **URL State Synchronization**:
   - Next.js `useSearchParams()` and `useRouter()` are utilized in `/track?id=...`, `/dashboard/industry/fund/[id]?type=...`, and `/challenge/[id]` to ensure deep-linkable states and browser back-button compatibility.

### 1.5 Shared UI Components & Design System
- **`RoleGuard.tsx` (`web/src/components/RoleGuard.tsx`)**:
  - Intercepts unauthorized route access on client-side dashboard views.
  - Verifies user role against `allowedRoles` array. Shows full-screen loader (`RoleGuardSkeleton`) during auth hydration, and redirects unauthenticated or unauthorized users to `/login`.
- **`Skeletons.tsx` (`web/src/components/ui/Skeletons.tsx`)**:
  - Reusable shimmer loaders: `StatsSkeleton`, `CardSkeleton`, `TableSkeleton`, `DetailSkeleton`, and `SkeletonPage`.
- **`EmptyState.tsx` (`web/src/components/ui/EmptyState.tsx`)**:
  - Standardized empty-data presentation block featuring customizable Lucide icons, title, description, and primary CTA button.
- **`NetworkBanner.tsx` (`web/src/components/ui/NetworkBanner.tsx`)**:
  - Subscribes to window `online` and `offline` event listeners. Shows a sticky top banner warning citizens when offline, with an instant reconnect trigger.
- **API Client (`web/src/lib/api-client.ts`)**:
  - Encapsulates `window.fetch` with automatic CSRF synchronization.
  - Checks for `csrf_token` cookie or asynchronously fetches one from `/api/csrf`.
  - Injects `x-csrf-token` headers on mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`).
  - Automatically redirects to `/login?expired=true` upon receiving HTTP 401.

---

## 2. Citizen Challenge Submission Flow Deep Dive (`/submit`)

### 2.1 Wizard Architecture & Form Progression
The citizen submission interface is implemented as a 3-step progressive disclosure wizard inside `web/src/app/submit/page.tsx`:
- **Step 1: Problem Definition**:
  - `title` (string, required, min 5 chars)
  - `domain` (select dropdown, default "Water Management")
  - `urgency` (select dropdown: CRITICAL, HIGH, MEDIUM, LOW)
  - `description` (textarea, required, min 20 chars)
- **Step 2: Geographical & Evidence Context**:
  - `district` (text input, required, default "Dhanbad")
  - `location` (text input, required, default "Block XYZ, Village 4")
  - `files` (drag-and-drop dropzone supporting multiple file selection)
- **Step 3: Verification & Ground Truth Corroboration**:
  - Read-only review card summarizing Title, Domain, Urgency, Location, and File attachment count.
  - Corroboration disclaimer agreeing to state SLA tracking.
- **Confirmation State (`isSuccess === true`)**:
  - Replaces wizard with a confirmation card displaying the generated `publicTrackingId`.
  - One-click copy button with animated toast.
  - Direct CTA button linking to `/track?id=${trackingId}`.
  - "Submit Another" button to reset the wizard state.

### 2.2 Multimedia Evidence Handling Mechanics & Critical Gaps
- **Drag-and-Drop Implementation**:
  - Lines 34–66 of `web/src/app/submit/page.tsx` manage file drag enter/over/leave and drop events, alongside a hidden `<input type="file" multiple />`.
  - Selected files are mapped into an in-memory array:
    ```typescript
    interface UploadedFileItem {
      id: string;
      name: string;
      size: string;
    }
    ```
  - File chips display the filename, human-readable size (`f.size / (1024 * 1024)` MB), and an `X` delete button.
- **Critical File Upload Gap**:
  - In `handleSubmit` (lines 74–79 of `submit/page.tsx`):
    ```typescript
    const evidenceObj = {
      mediaUrls: files.map(f => `/evidence/${f.name}`),
      turbidity: "48 NTU",
      dissolvedIron: "6.2 mg/L",
      ph: "4.8",
    };
    ```
  - **No binary data or multipart form data is uploaded to the backend or storage bucket**. The frontend merely extracts `f.name` and constructs a fabricated path string `/evidence/${f.name}`.
  - No thumbnail preview exists for uploaded images.
  - If a citizen uploads a real photo from a mobile phone, that photo is discarded when the browser unloads.

### 2.3 Geo-Location Inputs & Critical Gaps
- **Current Input Fields**:
  - District is a free-text input: `<input type="text" value={district} onChange={...} placeholder="e.g. Dhanbad" />`.
  - Location is a free-text input: `<input type="text" value={location} onChange={...} placeholder="e.g. Block XYZ, Village 4" />`.
- **Gaps**:
  - No GPS extraction button calling `navigator.geolocation.getCurrentPosition()`.
  - No interactive map picker (Leaflet, Mapbox, or OpenStreetMap) allowing citizens to drop a pin.
  - No standardized dropdown containing Jharkhand's **24 statutory administrative districts** (Ranchi, Dhanbad, Bokaro, East Singhbhum, West Singhbhum, Hazaribagh, Deoghar, Giridih, Palamu, Dumka, Ramgarh, Saraikela Kharsawan, Chatra, Garhwa, Godda, Gumla, Jamtara, Khunti, Koderma, Latehar, Lohardaga, Pakur, Sahibganj, Simdega).
  - Schema (`prisma.schema`) lacks dedicated `latitude` and `longitude` numeric columns.

### 2.4 API Communication & Public Tracking ID Lifecycle
- **Submission Endpoint**: `POST /api/challenges`
- **CSRF Protection**: Handled transparently by `apiFetch` using the `x-csrf-token` header.
- **Anonymous Reporting Support**:
  - Lines 103–120 in `web/src/app/api/challenges/route.ts`: If no session cookie exists, the backend checks for a user with `role: "CITIZEN"`, creates a fallback citizen user if none exists (`name: "Citizen Contributor"`, `phone: "+919800000000"`), and assigns `reportedById`.
- **Tracking ID Generation**:
  - Backend generates: `IN-GR-2026-${Math.floor(1000 + Math.random() * 9000)}`.
  - Challenge is created with `status: "REPORTED"`, `citizenVerified: false`, `escalationLevel: 0`, and a 30-day `slaDeadline`.
  - Audit log is automatically created via `logAuditEvent`.
  - Returns JSON `{ success: true, challenge, trackingId }` which is rendered on the UI.

---

## 3. Dashboards & Workspaces Breakdown

### 3.1 Government Oversight & State Triage Dashboard (`/dashboard/gov`)
- **Metric Cards**:
  - Displays Total Challenges, Resolved Issues, Active Prototyping, and Escalated Grievances computed from `GET /api/analytics`.
  - Clicking any metric card acts as an interactive filter on the triage ledger below.
- **Domain Distribution Chart**:
  - Progress bars displaying the volume of challenges in Water Management, Agriculture, Healthcare, Energy, Education, and Urban Infrastructure.
  - Clicking any domain filters the triage table.
- **Pending User Approvals (Admin Gate)**:
  - Fetches pending HEI/Industry registrations from `GET /api/admin/pending-users`.
  - Displays user name, organization, designation, email, role badge, and registration timestamp.
  - Inline action buttons: `Approve` (green check) and `Reject` (red cross), calling `POST /api/admin/approve-user` with instant table re-fetching and feedback toasts.
- **State Innovation Triage Ledger**:
  - Displays all challenges with columns: Tracking ID, Title, Domain, District, Urgency badge, Status badge, Assigned Institute, SLA Countdown, and View Details link.
  - **CSV Export Feature**: Line 82 of `gov/page.tsx` features `handleExportSummary()`, which generates a RFC 4180-compliant CSV data URI containing all filtered ledger records and triggers an automatic browser download named `Jharkhand_State_Triage_Ledger_<date>.csv`.
- **Immutable Audit Trail**:
  - Displays the 8 most recent system events from `GET /api/audit-logs` (Resource, Action, Admin Actor, Timestamp).

### 3.2 Academic & R&D Innovation Workspace (`/dashboard/university`)
- **Key Metrics**:
  - Open RFPs for Lab Match, Submitted DPR Proposals, Active Grants & Escrow Pledges.
- **Open Societal Challenges Feed**:
  - Live search input matching title, domain, district, and public tracking ID.
  - Priority filter pill buttons (`All`, `CRITICAL`, `HIGH`).
  - Challenge cards display domain badge, district, urgency badge, description preview, and a high-visibility CTA button: **"Draft DPR Proposal"**, linking directly to `/dashboard/university/proposal/[id]`.
- **Submitted Detailed Project Reports (DPRs)**:
  - Table displaying Proposal Title, Target Challenge, Required Budget (formatted in INR `₹`), Review Status badge, Principal Investigator name, and action link.

### 3.3 Detailed Project Report (DPR) Drafting Console (`/dashboard/university/proposal/[id]`)
- **Form Controls**:
  - Proposal Title (text input)
  - Target Societal Challenge ID (pre-filled from route params)
  - Executive Abstract & Scientific Rationale (textarea)
  - Technical Methodology & IoT Telemetry Architecture (textarea)
  - Technology Readiness Level (TRL) / Development Stage dropdown:
    - *Concept / Lab Validated (TRL 3)*
    - *Prototype Ready (TRL 5)*
    - *Field Deployment Ready (TRL 7)*
  - Grant Budget Requirement in INR (`₹`) and Implementation Timeline in Months.
  - Accredited Research University / Lab Name.
  - PDF Document Upload Dropzone with file attachment state.
- **Submission Mechanics**:
  - Dispatches `POST /api/proposals`.
  - Generates official proposal reference `DPR-2026-XXXX`.
  - Displays success confirmation card with proposal reference and link back to workspace.

### 3.4 Corporate CSR & Mentorship Hub (`/dashboard/industry`)
- **Key Metrics**:
  - Total CSR Capital Committed (`₹` sum from commitments), Available University Proposals, Supported Prototypes.
- **Multi-Criteria Filter Modal**:
  - Triggered via the "Filter Proposals" button.
  - Allows filtering by Domain, TRL Stage, and Budget Bracket (*All, Under ₹5 Lakhs, Above ₹5 Lakhs, Mentorship Only*).
- **University Proposals Grid**:
  - Cards show Domain badge, TRL Stage badge, University name, Requested Budget in INR, proposal abstract, and action button **"Pledge CSR / Mentorship"**, routing to `/dashboard/industry/fund/[id]`.
- **Corporate CSR Escrow Ledger**:
  - Displays historical funding commitments with Transaction Reference, Target Proposal Title, Amount (`₹`), Status badge (`COMMITTED`, `HELD_IN_ESCROW`, `DISBURSED`), and Date.
  - Includes **"80G Receipt"** download trigger.

### 3.5 CSR Escrow Pledge & Tax Exemption Console (`/dashboard/industry/fund/[id]`)
- **Commitment Mode Selector**:
  - Toggle between *Financial Grant (CSR Escrow)*, *Technical Mentorship & Lab Support*, or *Combined Co-Development*.
- **Pledge Configuration**:
  - Pledged Grant Amount (`₹`), Corporate Governance Notes.
- **Tripartite MoU Agreement Modal**:
  - Interactive modal displaying the legal terms under Section 135 Companies Act 2013 and Section 80G Income Tax Act.
  - Digital sign-off toggle button.
- **Statutory 80G Tax Exemption Receipt Generator**:
  - Generates an official printable/downloadable plain text / ASCII tax certificate containing Government of Jharkhand seal, Corporate PAN, Escrow Ref, and authorized signatory sign-off.

### 3.6 Multi-Tenant User Settings Console (`/dashboard/settings`)
- **5 Configurable Tabs**:
  1. **Profile**: Full Name, Official Organization, Designation, Official Email, Phone Number, Administrative District, Executive Bio. Saves via `PUT /api/users/profile`.
  2. **Notifications**: Toggles for Critical Grievance Alerts, SMS Citizen Broadcast, Escrow Milestone Disbursements, Weekly Executive Digest.
  3. **Security & 2FA**:
     - Displays two-factor authentication status badge.
     - Interactive TOTP 2FA Setup Modal: calls `POST /api/auth/totp-setup`, generates and displays a real data URL QR code via `qrcode`, displays manual entry secret key, and validates 6-digit TOTP code via `POST /api/auth/totp-verify`.
     - Active Device Sessions table with current device detection and "Terminate Other Sessions" action.
  4. **API Integration**: Displays State Innovation API token with show/hide toggle, one-click copy, and token regeneration.
  5. **Compliance & Legal**: Displays statutory status under the Digital Personal Data Protection (DPDP) Act 2023, 21-day SLA compliance metrics, and digital signature status.

### 3.7 Citizen Real-Time Tracking & Telemetry Console (`/track`)
- **Live Search & URL Hydration**:
  - Parses query parameter `?id=...` on load; enables live search by any `IN-GR-2026-XXXX` tracking ID.
  - Fetches dynamic docket information from `/api/track/[id]` with seamless fallback to rich mock data.
- **5-Stage SLA Pipeline**:
  - Stage 1: Submitted by Citizen (Cryptographic GPS hash recorded)
  - Stage 2: AI Clustered & Triaged (NLP semantic deduplication)
  - Stage 3: Assigned to Accredited Research Lab (IIT ISM / BAU / NIT)
  - Stage 4: Industry Funded via Escrow (Tata Steel CSR / Coal India)
  - Stage 5: Field Deployment & Citizen Validation
- **Telemetry Indicators**:
  - Displays sensor and telemetry cards (e.g. pH Level, Turbidity NTU, Heavy Metal Index, Affected Population) dynamically extracted from challenge evidence.
- **Citizen SMS Updates Subscription Modal**:
  - Interactive dialog allowing citizens to register their 10-digit phone number for automated SMS notifications at each pipeline milestone transition.

### 3.8 Low-Bandwidth & Inclusive Citizen Channels
- **Simulated WhatsApp Intake (`/whatsapp-intake`)**:
  - High-fidelity smartphone mockup simulating the Jharkhand Govt WhatsApp Chatbot intake.
  - Supports multilingual welcome ("Johar! 🙏"), interactive multi-stage conversation, image upload simulation, GPS pin sharing simulation, and instant tracking ID generation.
- **Policy Guidelines (`/guidelines`)**:
  - Outlines the 4 institutional pillars: Eligibility Criteria, Intellectual Property & Technology Transfer (60-20-20 formula), Grant Disbursement & Escrow Protocols, and Ethical DPDP Compliance.
  - Accordion FAQ and one-click download of the official Directive Gazette (`.txt`).
- **Accountability Index (`/accountability`)**:
  - Public leaderboard ranking state departments and universities on resolved challenge volume, rejection rate, average resolution days, and citizen satisfaction rating.

---

## 4. Gap Analysis vs `ORIGINAL_REQUEST.md`

| Requirement Category | Requirement Specification in `ORIGINAL_REQUEST.md` | Current Implementation in `web/` | Gap / Defect Severity |
|---|---|---|---|
| **Browser Security Header** | Web portal must support native camera and geolocation access for field evidence capture. | `web/next.config.ts` line 45 configures `Permissions-Policy: camera=(), microphone=(), geolocation=()`. | **BLOCKER**: Explicitly disables browser camera, microphone, and geolocation APIs. |
| **Real AI Categorization (R2)** | Real AI categorization using external provider (Gemini / OpenAI) to automatically categorize, prioritize, deduplicate, and route challenges. | No AI provider packages in `package.json` (`@google/genai` or `openai` are absent). All categorization in `/submit` and `/api/challenges` is user-selected or static copy. | **CRITICAL**: Core SIH requirement for intelligent triage is missing in the implementation. |
| **Multimedia Upload Storage** | Ground-truth evidence (photos, documents) must be uploaded, stored, and viewable by university labs and government triage officers. | `/submit` stores file objects in React state, but extracts only filenames into `/evidence/${f.name}` without sending files to any backend endpoint or storage. | **HIGH**: Binary files are discarded; lab evaluators cannot inspect real evidence. |
| **Geo-Location & Spatial Validation** | Accurate location capture for challenges across Jharkhand districts, with coordinate mapping or standard administrative boundaries. | Free-form text inputs for `district` and `location`. No GPS extraction, no map picker, no 24-district dropdown. `Challenge` schema lacks lat/long columns. | **HIGH**: Prone to typos, prevents geospatial clustering and map visualization. |
| **End-to-End Submission Testing** | Automated end-to-end verification of the citizen submission workflow. | Current test suites (`tests/workflows.test.mjs`) test isolated JavaScript mock helper functions in Node.js, not real browser/API submission. | **MEDIUM**: No end-to-end integration test verifying HTTP `POST /api/challenges` with media evidence. |
| **Domain Selection Alignment** | Domain choices across forms must strictly align with backend validation schemas. | `web/src/lib/validation.ts` defines 10 domains; `/submit` select dropdown only provides 6 options (missing *Environment, Sanitation, Rural Livelihoods, Public Service Delivery*). | **LOW**: Citizens cannot submit challenges under 4 valid statutory domains. |

---

## 5. Comprehensive Frontend Feature Inventory

| Module / Feature | Route / Component | Implementation Status | Functional Capabilities & Limitations | Recommended Next Steps |
|---|---|---|---|---|
| **Homepage & Hero** | `/` | **Complete** | Impact metrics, active challenge cards, persona CTA links, responsive design | Connect metric counters to live `/api/analytics` endpoint |
| **Citizen Submission Wizard** | `/submit` | **Partial** | 3-step wizard, title, description, domain, urgency, tracking ID generation | 1. Add 24-district dropdown.<br>2. Add GPS acquisition button.<br>3. Connect real multipart upload. |
| **Evidence Dropzone** | `/submit` | **Partial** | Drag-and-drop file staging, chip deletion, size formatting | Implement server upload API and image thumbnail previews. |
| **Citizen Tracking Console** | `/track` | **Complete** | Search by ID, 5-stage SLA pipeline, telemetry display, SMS modal, fallback handling | Add map visualization showing problem pin and research lab pin. |
| **WhatsApp Intake Mockup** | `/whatsapp-intake` | **Complete** | Interactive chat simulation, low-bandwidth UX prototype | Connect to backend `/api/challenges` for live intake recording. |
| **Auth & Persona Login** | `/login` | **Complete** | Citizen OTP, University `.ac.in`, Industry, Gov tabs, TOTP 2FA modal | Operational with backend endpoints. |
| **Gov Oversight Dashboard** | `/dashboard/gov` | **Complete** | KPI metrics, domain charts, pending user approvals, triage table, CSV export, audit log | Add batch status update action for triage officers. |
| **University Workspace** | `/dashboard/university` | **Complete** | Search & priority filter, RFP matching cards, submitted DPR list | Add proposal revision tracking. |
| **DPR Drafting Console** | `/dashboard/university/proposal/[id]` | **Complete** | Abstract, methodology, budget, timeline, TRL stage, PDF upload trigger | Persist uploaded DPR PDFs to persistent storage. |
| **Industry CSR Hub** | `/dashboard/industry` | **Complete** | CSR metrics, multi-criteria filter modal, proposal matching cards, escrow ledger | Add Escrow milestone disbursement approval workflow. |
| **CSR Escrow & MoU** | `/dashboard/industry/fund/[id]` | **Complete** | Pledged grant amount, tripartite MoU agreement modal, 80G tax receipt download | Generate official signed PDF receipt instead of text download. |
| **User Settings & 2FA** | `/dashboard/settings` | **Complete** | Profile editing, notification toggles, real TOTP QR setup & verification, session management | Operational. |
| **Challenge Detail View** | `/challenge/[id]` | **Complete** | Problem docket, evidence telemetry, university proposals, peer review modal | Operational. |
| **Expert Application** | `/apply/[challengeId]` | **Complete** | Specialist application form, domain expertise, CV upload | Operational. |
| **Policy Guidelines** | `/guidelines` | **Complete** | 4 operational policy pillars, FAQ accordion, official directive download | Operational. |
| **Accountability Index** | `/accountability` | **Complete** | Department vs University SLA leaderboard, satisfaction ratings, search | Operational. |
| **Offline Resilience** | `<NetworkBanner />` | **Complete** | Real-time offline detection and alert banner | Operational. |
| **Role-Based Guards** | `<RoleGuard />` | **Complete** | Protects dashboard routes based on session role | Operational. |

---

## 6. Synthesis & Architectural Recommendations

To evolve the frontend application into a production-grade, hackathon-winning platform that fully satisfies `ORIGINAL_REQUEST.md`, the downstream implementation teams should prioritize the following actions:

1. **Unblock Browser Permissions in `web/next.config.ts`**:
   - Update line 45 from:
     ```typescript
     value: "camera=(), microphone=(), geolocation=()"
     ```
     to:
     ```typescript
     value: "camera=(self), microphone=(self), geolocation=(self)"
     ```
   - This single change immediately unblocks HTML5 `navigator.geolocation` and camera capture in client browsers.

2. **Upgrade `/submit` with Geolocation & Administrative Boundaries**:
   - Replace the plain text `district` input with a structured `<select>` dropdown populated with Jharkhand's 24 statutory districts.
   - Introduce a **"Use Current GPS Location"** button that invokes `navigator.geolocation.getCurrentPosition()`, capturing latitude and longitude coordinates.

3. **Integrate Real Evidence Storage & Previews**:
   - Implement a Next.js API route (e.g. `POST /api/upload`) supporting multipart form data, saving uploaded files to local disk (`public/uploads`) or S3-compatible bucket.
   - Update `/submit` to upload files prior to challenge registration, storing real accessible URLs in the `evidence` payload.
   - Render image thumbnails and document preview links in `/submit`, `/track`, and `/challenge/[id]`.

4. **Integrate External AI Categorization Engine**:
   - Install an official AI SDK (e.g., `@google/genai` or `openai`).
   - Create a backend utility or route (e.g., `POST /api/ai/categorize`) that accepts challenge title and description, runs prompt analysis to extract suggested domain, urgency score, duplicate similarity score, and recommended academic partner lab, and auto-populates or assists the citizen submission.

5. **Align Domain Constants Across Frontend & Backend**:
   - Synchronize the domain options in `/submit/page.tsx` with `validDomains` in `web/src/lib/validation.ts` so that all 10 state priority domains are selectable.
