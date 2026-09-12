# PRAGATI — Jharkhand Societal Innovation Collaboration Portal

**PRAGATI** (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation) is a state-level, production-grade societal problem resolution and innovation platform built for the Government of Jharkhand. 

Connecting citizens across all 24 Jharkhand districts with District Nodal Officers, empanelled universities, corporate industry mentors, and state executive authorities, PRAGATI orchestrates the full lifecycle of grassroots problem ingestion, AI-powered multi-track triage, academic research proposals, and Section 135 CSR escrow funding.

---

## Architecture & Technology Stack

- **Framework**: Next.js 16.3.4 (App Router, Turbopack, React 19, TypeScript 5)
- **Styling & UI**: Tailwind CSS v4, Framer Motion animations, Lucide React icons
- **State Management**: Zustand 5.0 and React Context
- **Database & ORM**: PostgreSQL / SQLite (`prisma/dev.db`) managed via Prisma ORM 5.11.0 (with soft deletes and atomic conditional transactions)
- **Authentication**: Multi-tier authentication engine (`src/lib/auth.ts`, `src/lib/rbac.ts`)
  - *Citizens & Public Experts*: Mobile phone number + simulated SMS/WhatsApp OTP
  - *Universities*: Institutional email (`.ac.in` domain validation) + password + email OTP
  - *Industry Partners*: Corporate email + password + mandatory State Government admin approval workflow
  - *Government Officials*: Official email (`.gov.in` / `.nic.in` domain validation) + password + mandatory TOTP 2FA (RFC 6238 authenticator app)
  - *Security Policies*: Bcrypt password hashing (cost factor 12), account lockout after 5 consecutive failures (30-minute cooldown), rate limiting on authentication routes (10 req/min per IP)
- **Security Hardening (OWASP Top 10)**:
  - Double-submit CSRF cookie protection (`/api/csrf`) on state-changing requests
  - Strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS)
  - Zero raw SQL queries; 100% parameterized queries via Prisma ORM
  - Zod schema validation across all API route payloads and frontend forms
- **AI Categorization & Deduplication Engine** (`src/lib/ai.ts`):
  - Primary: Google Gemini 1.5 Flash
  - Secondary Fallback: OpenAI GPT-4o-mini
  - Deterministic Rule Fallback: Heuristic keyword classification
  - Semantic Deduplication: Multi-factor vector cosine overlap and token similarity (threshold >= 0.75 flags duplicates and links to canonical dockets)

---

## The 6 Dashboard Personas

PRAGATI provides tailored, secure workspaces for 6 distinct stakeholder personas:

### 1. Citizen Persona
- **Primary Routes**: `/submit`, `/track`, `/dashboard`, `/whatsapp-intake`
- **Capabilities**:
  - 3-step reporting wizard with photo/video proof upload and live browser GPS coordinate locking.
  - Omnichannel WhatsApp intake simulator allowing zero-barrier grievance filing.
  - Public grievance tracking engine searching by unique tracking IDs (`IN-GR-2026-XXXX`).
  - Real-time IoT/ground sensor telemetry review (water pH, turbidity, TDS, soil NPK) and SLA countdown indicators.

### 2. District Nodal Officer (DNO) Persona
- **Primary Route**: `/dashboard/nodal`
- **Capabilities**:
  - Serves as the authoritative administrative gatekeeper for district submissions, replacing deprecated legacy village-level gatekeeping.
  - Triage decision queues: Pending, Routed to Academia, Diverted to Gov, and Rejected.
  - Rejection gate requiring mandatory official justification (minimum 5 characters).
  - Public works diversion to 10 state line departments (Road Construction Dept/PWD, Drinking Water & Sanitation Dept, JUVNL, Municipal Corporations).
  - Academia routing triggering automated 3-way university matching and simulated email notifications.

### 3. Government Official / State Nodal Authority Persona
- **Primary Route**: `/dashboard/gov`
- **Capabilities**:
  - Statewide executive administration with 24-district telemetry aggregation.
  - Interactive SVG Vector GIS Map covering all 24 Jharkhand districts with live choropleth density shading, division filtering, hover tooltips, and ₹25 Lakhs Seed Grant Allocation modals.
  - Intellectual Property (IP) Compliance & Registration Queue (`GovIpQueue`) with bilateral DSC verification and patent certificate generation.
  - Statutory exportable reporting suite and statewide challenge ledger.

### 4. University / Academic Researcher Persona
- **Primary Routes**: `/dashboard/university`, `/dashboard/university/proposal/[id]`
- **Capabilities**:
  - Review AI 3-way matched societal challenge dockets.
  - Atomic race-condition claim locking (`POST /api/challenges/[id]/claim`): the first empanelled university to claim secures exclusive research rights (HTTP 200), while competing claims receive HTTP 409 Conflict.
  - Detailed Project Report (DPR) authoring studio with abstract, methodology, milestones, budget allocation (INR), and PDF upload.
  - Automated 3-way matching to corporate industry sponsors upon DPR submission.

### 5. Industry Partner / Corporate Mentor Persona
- **Primary Routes**: `/dashboard/industry`, `/dashboard/industry/fund/[id]`
- **Capabilities**:
  - Section 135 CSR escrow fund commitment with 30-40-30 tranches (Tranche 1: DPR Approval; Tranche 2: Lab Pilot Validation; Tranche 3: Field Sign-off).
  - Atomic CSR claim locking (`POST /api/proposals/[id]/claim-industry`).
  - Interactive 4-column Kanban task board (Backlog, In Progress, Review, Done).
  - Technology Readiness Level (TRL 1 through TRL 9) stage-gate tracking engine.
  - Milestone Review Studio with Dual Decision Gates (Technical Feasibility Gate and Commercial Viability Gate), 3-axis rubric scoring, schematic annotation, and live test point telemetry.
  - Bilateral IP Royalty slider calibration (5% to 15% revenue share) with digital DSC execution.

### 6. Open Contributor / Independent Expert Persona
- **Primary Routes**: `/dashboard/open-board`, `/dashboard/chat`, `/apply/[challengeId]`
- **Capabilities**:
  - Open Contributor Micro-Task Board: explore technical challenges posted by universities and claim tasks filtered by required skills.
  - Real-time collaboration Chat Hub (`/dashboard/chat`) with 3-second polling for interdisciplinary discussions between PIs, industry mentors, and government administrators.
  - Expert application portal for independent scientists and civil society organizations.

---

## Major Features Across Development Rounds 1–9

1. **Round 1 — UI Audit & Dead-End Elimination**: Complete platform crawl eliminating all broken navigation, unlinked buttons, and empty `href="#"` links across all landing pages and dashboard views.
2. **Round 2 — Tiered Authentication & Database Hardening**: Full Prisma ORM data model with soft deletes, bcrypt password hashing, 5-attempt account lockout, TOTP 2FA onboarding for government officials, and OWASP Top 10 security headers.
3. **Round 3 — AI-Enabled Problem Management & Multimedia Intake**: Integration with Google Gemini 1.5 Flash and OpenAI GPT-4o-mini with deterministic heuristic fallback, semantic deduplication, and coverage of all 24 Jharkhand districts.
4. **Round 4 — Tri-Track Triage System**: Automated multi-track categorization:
   - *Track A (Innovation / Applied R&D)*: 45–90 day SLA, routed to accredited universities (e.g. IIT ISM Dhanbad, BIT Mesra, BAU Ranchi) for 9-stage lifecycle research.
   - *Track B (Standard Public Works)*: 14–30 day SLA, routed to state line departments (PWD, DWSD, JUVNL) for 5-stage e-procurement tender execution.
   - *Track C (Civic Rapid Redressal)*: 24–72 hour rapid SLA, routed to Urban Local Bodies (RMC, DMC, JNAC) for 5-stage QRT dispatch and on-site remediation.
5. **Round 5 — Mobile Companion Integration**: Dedicated Kotlin Multiplatform mobile application (Jan-Aawaz / PRAGATI Lens) for grassroots problem ingestion (`POST /api/mobile/challenges`) with simulated GPS geotagging and photo/video evidence.
6. **Round 6 — District Nodal Officer Routing & Atomic Claim Race**: Complete architectural replacement of legacy local body verification with District Nodal Officer triage, AI 3-way academic matching, and database-level conditional atomic claim locking returning HTTP 409 on race conditions.
7. **Round 7 — Interdisciplinary Collaboration Hub & Open Contributor Board**: Polling-based Chat Hub (`/dashboard/chat`, `/api/chat`) and Open Contributor Board (`/dashboard/open-board`, `/api/micro-tasks`) enabling community micro-task contributions.
8. **Round 8 — Account Handover Continuity Portal**: Seamless transfer of government and institutional accounts from departing officers to designated successors (`/dashboard/settings` and `/handover/[token]`), utilizing cryptographically secure 64-character tokens with 48-hour expiration and atomic credential takeover.
9. **Round 9 — Statewide Government GIS Dashboard & Industry Mentor Portal**: Interactive 24-district SVG GIS map with Seed Grant allocation modals, IP Compliance Queue with bilateral DSC verification, Industry Mentor Kanban board, NASA/DoD-standard TRL 1–9 stage-gate tracking, Dual Decision Gates, 30-40-30 CSR Escrow ledger, and bilateral IP royalty sliders (5–15%).

---

## Complete Route Inventory (56 Routes Total)

The Next.js web application consists of **21 Frontend Pages** and **35 Backend API Route Handlers**, producing **44/44 statically prerendered units** during production compilation (`npm run build`).

### Frontend Pages (21 Routes)

| # | Route | File Path | Type | Functional Purpose |
|---|---|---|---|---|
| 1 | `/` | `src/app/page.tsx` | Static | Platform landing page with hero, live metrics counters, problem showcase, multi-track explainer, and entry CTAs. |
| 2 | `/_not-found` | `src/app/_not-found.tsx` | Static | Global 404 handler adhering to Jharkhand government design palette. |
| 3 | `/accountability` | `src/app/accountability/page.tsx` | Static | Statewide Accountability Index: SLA resolution rates, district rankings, transparent governance metrics. |
| 4 | `/apply/[challengeId]` | `src/app/apply/[challengeId]/page.tsx` | Dynamic | Application page for independent experts, scientists, and civil society organizations to join project teams. |
| 5 | `/challenge/[id]` | `src/app/challenge/[id]/page.tsx` | Dynamic | Comprehensive challenge detail dossier with field evidence, telemetry, matched universities, proposals, and claim CTAs. |
| 6 | `/dashboard` | `src/app/dashboard/page.tsx` | Static | Central Multi-Tenant Gateway & Citizen Dashboard overview with quick stats and portal routing cards. |
| 7 | `/dashboard/chat` | `src/app/dashboard/chat/page.tsx` | Static | Real-time Chat Hub for interdisciplinary communication between University PIs, Industry Mentors, and Gov Admins. |
| 8 | `/dashboard/gov` | `src/app/dashboard/gov/page.tsx` | Static | Statewide Government Administration Console with interactive 24-district GIS map, telemetry, and IP compliance queue. |
| 9 | `/dashboard/industry` | `src/app/dashboard/industry/page.tsx` | Static | Industry Mentor Dashboard: Home KPIs, Escrow Ledger, Lab Teams Directory, Kanban Task Board, TRL 1-9 Audit Log. |
| 10 | `/dashboard/industry/fund/[id]` | `src/app/dashboard/industry/fund/[id]/page.tsx` | Dynamic | CSR Funding Commitment Portal: Tranche schedules (30-40-30), digital MoU signing, and escrow ledger allocation. |
| 11 | `/dashboard/nodal` | `src/app/dashboard/nodal/page.tsx` | Static | District Nodal Officer Triage Console: Authoritative review gate (Reject, Divert to Gov Body, Route to Academia). |
| 12 | `/dashboard/open-board` | `src/app/dashboard/open-board/page.tsx` | Static | Open Contributor Board: Listing of micro-tasks across societal challenges for students, developers, and civic contributors. |
| 13 | `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` | Static | User Profile, Security (TOTP 2FA), Notification Preferences, API Keys, and the Account Handover Portal. |
| 14 | `/dashboard/university` | `src/app/dashboard/university/page.tsx` | Static | Academic R&D Portal: Open RFPs, AI 3-Way Match Queue with race-condition claim locks, and proposal tracking. |
| 15 | `/dashboard/university/proposal/[id]` | `src/app/dashboard/university/proposal/[id]/page.tsx` | Dynamic | Detailed Project Report (DPR) authoring tool: Abstract, technical methodology, budget breakdown, milestone tranches, and PDF upload. |
| 16 | `/guidelines` | `src/app/guidelines/page.tsx` | Static | Statutory policy framework: Tripartite IP ownership, Section 135 CSR compliance, DPDP Act adherence, and TRL standards. |
| 17 | `/handover/[token]` | `src/app/handover/[token]/page.tsx` | Dynamic | Successor account claim portal: Token validation, predecessor metadata review, password setting, and credential takeover. |
| 18 | `/login` | `src/app/login/page.tsx` | Static | Multi-tier portal login: Phone + OTP for citizens; Institutional email + password for University, Industry, Gov, and Experts. |
| 19 | `/submit` | `src/app/submit/page.tsx` | Static | Citizen Intake Portal: 3-step reporting wizard with photo/video upload, live GPS coordinate locking, domain/urgency selection. |
| 20 | `/track` | `src/app/track/page.tsx` | Static | Public Grievance Tracking Engine: Live search by tracking ID, real-time telemetry, track-tailored 5-stage or 9-stage timeline. |
| 21 | `/whatsapp-intake` | `src/app/whatsapp-intake/page.tsx` | Static | Omnichannel WhatsApp Grievance Simulator with simulated mobile phone UI, photo sharing, GPS pin drop, and auto-registration. |

### Backend API Route Handlers (35 Endpoints)

| # | Route Relative Path | Methods | RBAC / Auth | Description & Functionality |
|---|---|---|---|---|
| 1 | `api/admin/approve-user` | `POST` | `GOV` (Admin) | CSRF-protected endpoint for Government administrators to approve or reject pending corporate/industry registrations. |
| 2 | `api/admin/pending-users` | `GET` | `GOV` (Admin) | Fetches all user registrations currently in `PENDING` status awaiting statutory government clearance. |
| 3 | `api/ai/categorize` | `POST` | Public / Auth | AI categorization engine calling Gemini 1.5 Flash / GPT-4o-mini with fallback; classifies domain, urgency, track, and SLA. |
| 4 | `api/analytics` | `GET` | Public / Auth | Calculates statewide aggregate telemetry: total grievances, active prototypes, resolved challenges, and district breakdown. |
| 5 | `api/audit-logs` | `GET` | `GOV` | Fetches filtered, paginated system audit trails supporting filtering by resource, action, and user ID. |
| 6 | `api/auth/login` | `POST` | Public (Rate Limited) | Multi-tier authentication: citizen phone + OTP or email + password; enforces 5-failure lockout and issues JWT cookies. |
| 7 | `api/auth/logout` | `POST` | Public / Auth | Clears the session cookie (`auth_token`) and terminates active user session. |
| 8 | `api/auth/me` | `GET` | Authenticated | Validates incoming JWT session token and rehydrates active user profile with fresh permissions and 2FA status. |
| 9 | `api/auth/register` | `POST` | Public (Rate Limited) | Multi-tier registration: Citizen OTP, University `.ac.in`, Industry pending approval, Government `.gov.in`/`.nic.in`. |
| 10 | `api/auth/totp-setup` | `POST` | Authenticated (`GOV`) | Generates Base32 TOTP secret and QR code data URL for mandatory government 2FA onboarding. |
| 11 | `api/auth/totp-verify` | `POST` | Auth / Temp Token | Verifies 6-digit TOTP code, activates 2FA on account, resets failed login counter, and completes login. |
| 12 | `api/auth/verify-otp` | `POST` | Public (Rate Limited) | Validates 6-digit OTP for citizen login/registration or university account verification. |
| 13 | `api/challenges` | `GET`, `POST` | `GET`: Public<br>`POST`: Public/Auth | Query challenges with multi-criteria filters or submit new citizen challenge with CSRF validation and AI categorization. |
| 14 | `api/challenges/[id]` | `GET`, `PUT`, `DELETE` | `GET`: Public<br>`PUT`: Gov/Owner/Uni<br>`DELETE`: Gov/Owner | Retrieve detailed challenge dossier, update problem metadata, or perform soft deletion (`deletedAt`). |
| 15 | `api/challenges/[id]/apply` | `POST` | Public / Auth | Endpoint for independent experts, scientists, and mentors to apply to collaborate on an open challenge docket. |
| 16 | `api/challenges/[id]/claim` | `GET`, `POST` | `GET`: Public<br>`POST`: `UNIVERSITY`, `GOV` | University atomic race-condition claim lock using conditional update. First claimant locks (HTTP 200); competitors get HTTP 409. |
| 17 | `api/chat` | `GET`, `POST` | Authenticated | Fetch conversation messages or dispatch new chat message with RBAC validation on project membership. |
| 18 | `api/csrf` | `GET` | Public | Generates cryptographically secure CSRF double-submit token and cookie. |
| 19 | `api/funds` | `GET`, `POST` | `GET`: Public<br>`POST`: `INDUSTRY`, `GOV` | Query funding commitments or lock corporate CSR funding into State Escrow Node with 30-40-30 tranches and digital MoU. |
| 20 | `api/funds/[id]` | `GET` | Public / Auth | Fetches individual funding commitment by UUID or `escrowRef`, including proposal, challenge, and sponsor metadata. |
| 21 | `api/handover/initiate` | `GET`, `POST` | Authenticated (`withAuth`) | Initiates account handover: generates 64-char crypto token expiring in 48h for successor email with console invite log. |
| 22 | `api/handover/cancel` | `POST` | Authenticated (`withAuth`) | Revokes and deletes any pending/unused handover invitation tokens for the authenticated user. |
| 23 | `api/handover/[token]` | `GET`, `POST` | Public | Validates handover token expiration/status and returns predecessor metadata for display on claim page. |
| 24 | `api/handover/[token]/claim` | `POST` | Public | Successor claim execution: atomic test-and-set lock updates credentials in-place preserving UUID, history, and roles. |
| 25 | `api/intake/whatsapp-simulate` | `POST` | Public | Omnichannel grievance simulator: parses simulated chat payload, auto-provisions user, and generates tracking ID. |
| 26 | `api/micro-tasks` | `GET`, `POST`, `PATCH` | `GET`: Public<br>`POST`: Auth<br>`PATCH`: Auth | Powers Open Contributor Board: list tasks, create tasks with required skills, or claim an open micro-task. |
| 27 | `api/mobile/challenges` | `POST` | Public / Mobile App | Endpoint for Kotlin mobile app: ingests problem with GPS, media, runs AI triage, and generates tracking ID. |
| 28 | `api/mobile/verify` | `POST` | `GOV` (Nodal Officer) | Official on-site field verification: updates verification status, runs AI categorization, and routes to track entity. |
| 29 | `api/nodal/triage` | `GET`, `POST` | `GET`: Public/Auth<br>`POST`: `GOV` (Nodal) | District Nodal Officer decision gate: reject with reason, divert to line department, or route to academia. |
| 30 | `api/proposals` | `GET`, `POST` | `GET`: Public<br>`POST`: `UNIVERSITY`, `GOV` | Query research proposals or submit Detailed Project Report (DPR) with budget, milestones, and 3-way industry matching. |
| 31 | `api/proposals/[id]` | `GET`, `PUT` | `GET`: Public<br>`PUT`: Gov / Submitter | Detailed proposal view with challenge and funding commitments, or update proposal abstract, stage, or status. |
| 32 | `api/proposals/[id]/claim-industry` | `GET`, `POST` | `GET`: Public<br>`POST`: `INDUSTRY`, `GOV` | Industry atomic race-condition claim lock: first corporate partner locks funding rights (HTTP 200); competitors receive HTTP 409. |
| 33 | `api/track/[id]` | `GET` | Public | Public grievance tracker: returns challenge docket, sensor telemetry (pH, turbidity, NPK), SLA status, and track timeline. |
| 34 | `api/upload` | `POST` | Public / Auth | Multipart file upload handler with 10MB limit and MIME type validation (JPEG, PNG, WebP, PDF, MP4, WebM). |
| 35 | `api/users/profile` | `GET`, `PUT` | Authenticated (`withAuth`) | Returns current user profile or updates profile details with CSRF protection and Zod validation. |

---

## Setup & Development Guide

### Prerequisites
- Node.js 18.18+ or 20.x
- npm 9+
- SQLite (default embedded for development) or PostgreSQL

### Installation

Clone the repository and install dependencies:

```bash
cd web
npm install
```

### Environment Configuration

Create a `.env` file in the `web` root directory (refer to `.env.example`):

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="pragati-dev-jwt-secret-minimum-32-characters-required-for-security"
CSRF_SECRET="pragati-dev-csrf-secret-minimum-32-characters-required-for-security"
NODE_ENV="development"

# Optional external AI providers (falls back to deterministic heuristics if omitted)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

### Database Initialization & Seeding

Initialize the database schema and seed realistic sample data covering Jharkhand's 24 districts:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

To browse and inspect data via the Prisma visual GUI:

```bash
npx prisma studio
```

### Running Development Server

Launch the local development server:

```bash
npm run dev
```

The portal will be available at [http://localhost:3000](http://localhost:3000).

### Production Compilation & Build

To validate TypeScript types, ESLint rules, and compile the application for production:

```bash
npm run build
```

To run the production build server:

```bash
npm run start
```

### Automated Testing Suite

The repository includes comprehensive automated test suites exercising end-to-end flows:

```bash
# Run full E2E test suite across all modules
npx tsx tests/run-all-e2e.ts

# Verify Tri-Track Problem Ingestion (Track A, Track B, Track C)
npx tsx tests/test_3track_triage.ts

# Test District Nodal Officer triage & university 3-way claim race condition
npx tsx tests/test_nodal_triage_and_claim.ts

# Test Account Handover token lifecycle and successor claim flow
npx tsx tests/test_handover_backend.ts

# Test tiered RBAC security across all 6 roles
npx tsx tests/auth-rbac-security.test.ts

# Test OWASP input validation, CSRF, and boundary attacks
npx tsx tests/adversarial-security-intake.test.ts
```
