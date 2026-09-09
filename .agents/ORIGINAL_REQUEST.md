# Original User Request

## 2026-09-04T12:37:16Z

Audit every single button and interactive card across the Next.js platform and implement any missing pages/endpoints with a well-researched, premium design.

Working directory: a:/Development/Antigravity/SIH26043/web

Integrity mode: development

## Requirements

### R1. Comprehensive UI Audit & Dead-End Elimination
Thoroughly scan all pages (Homepage, Dashboards, Detailed Views) and identify any buttons, links, or interactive cards that do not have a functional endpoint (e.g., dead ends, unclickable UI elements, or `#` links). Implement functional Next.js routing for all of them.

### R2. High-Quality Frontend Endpoints
For every identified dead-end, implement the corresponding frontend page or state (e.g., forms, settings pages, detail views, success modals). These should be high-quality, frontend-only UI mockups (no real backend connection needed) that complete the visual prototype journey and match the existing "government/critical" design aesthetic.

## Verification Resources
The user currently runs the app via `npm run dev`. You can programmatically verify completeness by searching for placeholder links.
```bash
grep -r "href=\"#\"" src/app/
```

## Acceptance Criteria

### Completeness & Visual Polish
- [ ] Running a `grep` for empty or placeholder links (`href="#"`) across the codebase yields 0 results.
- [ ] Every implemented endpoint adheres to the existing Tailwind CSS design system and color palette without introducing unstyled HTML.
- [ ] The app successfully builds via `npm run build` with no unresolved routing errors.

## 2026-09-04T14:06:00Z

Transform the existing Jharkhand Societal Innovation Portal (a Next.js 16 frontend prototype at `a:\Development\Antigravity\SIH26043\web`) into a near-production-grade single-page application with secure tiered authentication, PostgreSQL database, role-based access control, and OWASP Top 10 security hardening. Build ON TOP of the existing codebase — preserve all current UI pages (dashboards, WhatsApp intake, accountability index, challenge details, etc.) and add backend/auth/database layers underneath.

Working directory: a:\Development\Antigravity\SIH26043
Integrity mode: development

## Context

The existing codebase is a Next.js 16 app (TypeScript, Tailwind CSS, Framer Motion) with static mock data. It has pages for: Landing (`/`), Login (`/login`), Gov Dashboard (`/dashboard/gov`), University Dashboard (`/dashboard/university`), Industry Dashboard (`/dashboard/industry`), Challenge Details (`/challenge/[id]`), WhatsApp Intake (`/whatsapp-intake`), Accountability Index (`/accountability`), Submit Problem (`/submit`), Track (`/track`), Guidelines (`/guidelines`), Settings (`/dashboard/settings`), Apply (`/apply/[challengeId]`), University Proposal (`/dashboard/university/proposal/[id]`), Industry Fund (`/dashboard/industry/fund/[id]`).

Currently all data is hardcoded. Authentication is purely cosmetic. There is no backend or database. The goal is to make this real.

## Requirements

### R1. Tiered Authentication System
Implement a tiered authentication system appropriate for a government portal serving diverse user types:

- **Citizens/NGOs/Experts**: Phone number + OTP via SMS/WhatsApp (simulated OTP for development — use a mock SMS provider that logs OTP to console).
- **Universities**: Institutional email (`.ac.in` domain validation) + password + email OTP verification.
- **Industry**: Corporate email + password + admin approval workflow (account pending until a Gov admin approves).
- **Government Officials**: Government email (`.gov.in` / `.nic.in` domain validation) + password + TOTP-based 2FA (authenticator app).

All passwords must be hashed with bcrypt (cost factor >= 12) or Argon2. Sessions must use HttpOnly, Secure, SameSite cookies with JWT or session tokens. Implement account lockout after 5 failed login attempts (30-minute cooldown). Rate limit auth endpoints (max 10 requests/minute per IP).

### R2. PostgreSQL Database with Prisma ORM
Design and implement a production-grade data model:

- **Users**: id, email/phone, passwordHash, role (gov/university/industry/citizen/expert), status (active/pending/locked/suspended), profile fields, emailVerified, phoneVerified, twoFactorEnabled, twoFactorSecret, failedLoginAttempts, lockoutUntil, timestamps (createdAt, updatedAt, deletedAt for soft delete).
- **Challenges**: id, title, description, domain, district, location, urgency, status, reportedBy (FK to Users), assignedTo, evidence (photos/descriptions), citizenVerified, escalationLevel, slaDeadline, timestamps.
- **Proposals**: id, challengeId (FK), submittedBy (FK to Users), universityId, title, abstract, methodology, budget, status, timestamps.
- **Funding Commitments**: id, proposalId (FK), industryUserId (FK), amount, type (CSR/grant/equity), status, timestamps.
- **Audit Logs**: id, userId, action, resource, resourceId, ipAddress, userAgent, timestamps.

Use Prisma ORM with PostgreSQL. All migrations must be version-controlled. Implement soft deletes for Users and Challenges. Use database transactions for multi-table operations.

### R3. Role-Based Access Control (Backend-Enforced)
Every API route must check:
1. Is the user authenticated? (valid session/token)
2. Does the user's role permit this action?
3. Does the user own/have access to this specific resource?

Create middleware that enforces this on every API route. A user must NEVER be able to access another role's data by manipulating the frontend, URL, or API requests. Return 401 for unauthenticated, 403 for unauthorized. Log all authorization failures to the audit log.

### R4. Security Hardening (OWASP Top 10)
- SQL injection: Prisma ORM handles parameterized queries — never use raw SQL.
- XSS: Escape all user-generated output. Implement Content-Security-Policy headers.
- CSRF: Use CSRF tokens on all state-changing requests.
- Clickjacking: Set X-Frame-Options: DENY and CSP frame-ancestors: 'none'.
- Input validation: Validate and sanitize ALL user inputs on both frontend and backend (use Zod or similar).
- Security headers: Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Error handling: Generic error messages to users, detailed structured logs on server. No stack traces in production responses.
- Environment variables: All secrets (DB URL, JWT secret, OTP provider keys) in `.env` files, never in source code. Provide a `.env.example` with placeholder values.

### R5. Frontend Role-Based Routing & UX
- After login, redirect each role to their specific dashboard view.
- Show/hide UI elements (nav items, buttons, pages) based on the authenticated user's role.
- Protect frontend routes: if a user navigates to a URL they don't have access to, redirect them to their own dashboard with an appropriate message.
- Handle edge cases gracefully:
  - Expired/invalid tokens -> redirect to login with "Session expired" message.
  - Missing/invalid role -> logout and show error.
  - Network failure -> show offline/retry UI, never a blank white screen.
  - Loading states -> skeleton screens, never raw spinners.
  - Empty data states -> helpful messages with CTAs, never blank pages.

### R6. Replace All Mock Data with Database-Driven Data
Convert all existing hardcoded/mock data across every page to be fetched from the database via API routes. The existing UI must continue to work but now display real data. Seed the database with realistic sample data that matches the current mock data so the app looks fully populated on first run.

## Acceptance Criteria

### Authentication
- [ ] A citizen can sign up with phone number and receive a simulated OTP (logged to server console), enter it, and access citizen features.
- [ ] A university user can sign up with a `.ac.in` email, set a password, verify via email OTP, and access the university dashboard.
- [ ] An industry user can sign up and their account shows "Pending Approval" until a gov admin approves it.
- [ ] A government user can sign up with a `.gov.in`/`.nic.in` email, enable TOTP 2FA, and access the gov dashboard.
- [ ] After 5 failed login attempts, the account is locked for 30 minutes.
- [ ] `npm run build` completes with 0 TypeScript errors.

### Role-Based Access
- [ ] A university user cannot access `/dashboard/gov` — they are redirected to their own dashboard.
- [ ] An API request to a gov-only endpoint from a university user's session returns HTTP 403.
- [ ] Directly hitting a protected API route without a session returns HTTP 401.
- [ ] All authorization failures are logged in the audit_logs table.

### Security
- [ ] No secrets appear in any committed source file (check: `grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" src/` returns no hardcoded values).
- [ ] A `.env.example` file exists with all required environment variable names but no real values.
- [ ] Security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options) are present in HTTP responses.
- [ ] Form submissions include CSRF protection.
- [ ] All user inputs are validated with Zod schemas before database operations.

### Database
- [ ] `npx prisma migrate dev` runs without errors and creates all tables.
- [ ] `npx prisma db seed` populates realistic sample data.
- [ ] Soft delete: deleting a user sets `deletedAt` instead of removing the row.

### Frontend UX
- [ ] Every existing page still renders correctly with database-driven data.
- [ ] Loading states show skeleton screens (not blank pages or raw spinners).
- [ ] Error states show user-friendly messages (not stack traces).
- [ ] Navigation between role-specific dashboards works without any dead-end links.

## 2026-09-04T21:04:25Z

Develop a production-ready Societal Innovation Collaboration Portal for Jharkhand that connects citizens, academic institutions, and industry partners to collaboratively solve local challenges. The system must feature strict security and real AI categorization via external providers.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. Citizen Engagement
Provide an intuitive web interface for citizens to submit societal challenges complete with multimedia evidence, geographical location, and supporting information.

### R2. AI-Enabled Problem Management
Implement real AI categorization using an external provider (e.g., Gemini/OpenAI) to automatically categorize, prioritize, deduplicate, and route challenges to appropriate universities based on thematic domains.

### R3. Collaborative Ecosystem
Enable universities to review challenges, form multidisciplinary teams, and submit solution proposals. Facilitate industry participation for mentoring, funding, prototyping, and technology transfer. Provide robust workflow management for the entire project lifecycle.

### R4. System Stability & Innovation
Ensure the application is production-grade with strict security (OWASP top 10), robust backend components, and zero errors across frontend, backend, and API integrations.

## Acceptance Criteria

### Verification
- [ ] Programmatic Tests: Automated tests exist for the citizen challenge submission flow, handling multimedia and location inputs.
- [ ] AI Integration Tests: The categorization API successfully communicates with the external AI provider and accurately classifies a sample problem statement.
- [ ] RBAC & Security: Role-based access control (Gov, University, Industry) is strictly enforced on all API routes, verified by tests that attempt unauthorized access.
- [ ] End-to-End Build: The codebase compiles and runs with 0 errors, with no console errors or warnings during standard execution flows.

## 2026-09-05T11:04:25Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: The full team

Perform a comprehensive A-to-Z audit, refactor, and bug fix across the Next.js Web and Kotlin Mobile applications. Map out the full data flow between components and implement the newly defined 3-Track Problem Triage System into the backend APIs.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. End-to-End System Audit & Data Flow Mapping
The team must analyze the current state of both the Web and Mobile applications and produce a clear architectural document mapping how data flows between the frontends, API, and database.

### R2. Implement 3-Track Triage System
The backend APIs and database schema must be updated to enforce the "Track A (Innovation), Track B (Standard), Track C (Civic)" logic for all problem submissions.

### R3. Cross-Platform Bug Fixes & Refactor
Identify and resolve any build, runtime, or integration errors across the Next.js web platform and Kotlin mobile app to ensure a stable, production-ready baseline.

## Acceptance Criteria

### Verification
- [ ] Programmatic: A test script is created and run that successfully submits three mock problems (one for each track) and verifies they are routed and categorized correctly in the database.
- [ ] Programmatic: `npm run build` executes successfully with 0 errors in the `/web` directory.
- [ ] Programmatic: `cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew assembleDebug"` executes successfully with 0 errors in the `/mobile` directory.
- [ ] Objective: A detailed markdown architecture document (`architecture_flow.md`) is created in the workspace outlining the full data flow.

## 2026-09-08T13:53:26Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full standard team

Develop a Kotlin Multiplatform mobile application dedicated exclusively to problem submission for the Societal Innovation Collaboration Portal. The app should allow any user to submit local challenges with simulated multimedia and location data, sending the payload to the Next.js backend API.

Working directory: a:/Development/Antigravity/SIH26043/mobile
Integrity mode: development

## Requirements

### R1. Problem Submission Interface
Implement a Compose Multiplatform UI allowing users to input a problem title, description, district, and domain. The UI must include buttons to "attach" photos/videos and "get current location", which will inject simulated mock data into the payload.

### R2. Backend API Integration
Integrate Ktor to perform a `POST /api/mobile/challenges` request to the Next.js backend running at `http://10.0.2.2:3000`. The app must handle success and error states appropriately and provide feedback to the user.

## Acceptance Criteria

### Submission Verification
- [ ] An agent acting as a judge must be able to launch the app, navigate to the submission screen, fill out the form, and successfully submit a problem.
- [ ] The agent judge must verify via the Next.js backend (or database) that the submitted problem was accurately received and stored with the simulated location and media data.

## 2026-09-08T18:38:41Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full standard team

Implement a complete architectural pivot to replace the Sarpanch role with a District Nodal Officer routing system on the Next.js Web backend. The Nodal Officer Web Dashboard must be able to cancel issues, divert them to specific government bodies (e.g., PWD), or push them to the AI for 3-way university matching where the first university to claim the problem gets it. Use simulated mock services for AI matching and email sending.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: demo

## Requirements

### R1. Database & Schema Updates
Update the Prisma schema to remove Sarpanch verification data. Add fields necessary to support Nodal Officer triage (states: pending, rejected, diverted_to_gov, routed_to_academia). 

### R2. Web Nodal Dashboard
Implement a Next.js UI allowing the Nodal Officer to view pending citizen submissions. Provide action buttons to:
1. Reject (requires reason input).
2. Divert to Gov Body (select from a list like PWD, Municipal Corp).
3. Route to Academia.

### R3. AI Match & Claim Workflow
When routed to Academia, the backend must simulate matching 3 universities (logging mock emails to console). Provide a basic Next.js API or UI for those universities to "Claim" the challenge. The system must enforce a race condition: the first university to claim the challenge successfully locks it, preventing the other two from claiming it.

## Acceptance Criteria

### Workflow Verification
- [ ] An automated test script (or agent judge) must simulate a Nodal Officer routing a problem to Academia.
- [ ] The test must simulate University A calling the claim endpoint and assert a successful claim.
- [ ] The test must immediately simulate University B calling the claim endpoint for the same problem and assert that it is rejected/locked out.
- [ ] The Next.js web application must build successfully (`npm run build`) with zero type errors.

## 2026-09-09T04:59:23Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full standard team

Perform a comprehensive QA diagnostic and repair operation across both the Web (Next.js) and Mobile (Kotlin Multiplatform) applications to reach 100% implementation. The team must proactively identify and fix broken routing flows, dead UI buttons, and missing placeholder pages across the entire platform.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. Flow & Routing Repair
Audit all user flows across all roles (Citizen, Nodal, University, Industry). Ensure every dashboard link, navigation card, and list item successfully routes to an existing, implemented detail page. If a page does not exist, build it.

### R2. UI Completion (Dead Buttons)
Find all "dead" buttons (buttons with empty `onClick` handlers, empty hrefs, or placeholders) and wire them up to real API endpoints, navigation, or functional state changes.

### R3. Missing Page Implementation
Identify missing placeholder pages (e.g., Settings, Guidelines, User Profiles, Auth fallbacks) and build them out completely so there are no "Coming Soon" or empty screens in the critical path on Web or Mobile.

## Acceptance Criteria

### Workflow Verification
- [ ] The team must write and execute an automated programmatic script that requests every major route/page in the Web app (crawling the Next.js routes) and asserts that all return HTTP 200 without throwing hydration or server errors.
- [ ] The Web application must build successfully (`npm run build`).
- [ ] The Mobile application must build successfully (`cmd.exe /c "set JAVA_HOME=C:\Users\vinod\.jdks\jbr-17.0.14&& gradlew.bat desktopApp:assemble"`) verifying that no Kotlin files reference missing UI components or broken navigation graphs.

## 2026-09-09T09:48:37Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Implement an account handover portal within the settings page. This feature allows users leaving their position to transfer their account (including all history, data, and reports) to a new successor, ensuring continuity of work.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. Settings UI Integration
Add an "Account Handover" section to the `/dashboard/settings` page. The user must be able to input their successor's email address to initiate the transfer process.

### R2. Handover API & Token Generation
Implement backend logic to securely generate a handover token linked to the current user's account and the successor's email. A simulated email containing the invite link should be logged to the console.

### R3. Successor Claim Flow
Create a public route (e.g., `/handover/[token]`) where the successor can accept the invite, provide their name, and set their new password. This must securely overwrite the account's existing credentials while preserving the underlying user ID, history, and roles.

## Acceptance Criteria

### Workflow Verification
- [ ] Programmatic Tests: An automated script must simulate the full handover flow (generating a token as User A, and redeeming it as User B) and assert that User B can subsequently login to User A's account.
- [ ] UI Completeness: The settings page and the claim page must render without hydration errors.
- [ ] End-to-End Build: The web codebase compiles and runs with 0 errors (`npm run build`).

## 2026-09-09T14:19:46Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Review and audit the newly implemented Government Dashboard (`web/src/app/dashboard/gov/page.tsx`) and Industry Mentor Dashboard (`web/src/app/dashboard/industry/page.tsx`). Compare the implemented UI against the detailed specifications extracted from the provided `government page.pdf` and `mentor page.pdf` to identify missing features, visual misalignments, or structural defects, and actively implement the code to fix any identified issues.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. Government Dashboard Audit & Fix
Audit `gov/page.tsx` against the features listed in `government page.pdf` (Statewide Telemetry, Interactive GIS Map UI placeholders with hover tooltips, IP Compliance Queue, and Navigation Tabs). Implement missing UI components and remove generic placeholders.

### R2. Mentor Dashboard Audit & Fix
Audit `industry/page.tsx` against the features listed in `mentor page.pdf` (Home KPIs, Escrow Ledger, Lab Teams Directory, Kanban Task Board, TRL Audit Log, and the Interactive Mentor Review Screen with Dual Decision Gates and IP Royalty sliders). Implement missing UI components and remove generic placeholders.

## Acceptance Criteria

### Audit Verification
- [ ] Feature Completeness: An automated or manual inspection confirms that there are no "Module in development" placeholders remaining for any of the core features described in the PDFs (e.g., Royalty Sliders, Dual Decision Gates, Hover Tooltips).
- [ ] UI Build Validation: The Next.js web codebase compiles and runs with 0 errors (`npm run build`) after the UI additions are made.

## 2026-09-09T17:21:50Z

Update all markdown documentation files in the Jharkhand Societal Innovation Collaboration Portal (branded "PRAGATI") to accurately reflect the current state of the codebase, which now has 44+ compiled routes, 24 Jharkhand districts, and features built across 9 development rounds.

Working directory: a:/Development/Antigravity/SIH26043
Integrity mode: development

## Requirements

### R1. Master Project Documentation Update
Update the following 6 project markdown files to accurately describe the current codebase architecture, features, routes, and capabilities. Remove all references to the deprecated Sarpanch role (per `.agy/rules/nodal-routing-architecture.md`). Use the correct branding "PRAGATI" (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation) and "Jan-Aawaz" for the citizen mobile app.

Files to update:
1. `PROJECT.md` — Rewrite as a comprehensive Master Project Specification covering ALL modules (not just Account Handover). Include: Tri-Track Triage, Citizen Intake, AI Categorization, Nodal Officer Triage, University DPR & Proposals, Industry AI Matching & Escrow, Government GIS Dashboard, Industry Mentor Portal (Kanban/TRL/Escrow), Chat Hub, Open Contributor Board, WhatsApp Simulator, Account Handover Portal, Mobile App, and the complete 44+ route inventory.
2. `TEST_INFRA.md` — Update the feature coverage inventory and test file listing to reflect all 32+ test files across Rounds 1-9. Keep the existing 4-tier testing philosophy but expand the feature table beyond F19.
3. `TEST_READY.md` — Update to reflect the current 44+ route count and all test suites, not just the Round 5 mobile tests.
4. `architecture_flow.md` — Update to version 9.0.0. Remove all Sarpanch references. Add missing architectural components: Account Handover flow, Nodal Officer workflow, Government GIS Dashboard, Industry Mentor Portal (Kanban/TRL/Escrow), Chat Hub, Open Contributor Board, and the complete API route topology.
5. `mobile/README.md` — Rename from "Smart Study" to "Jan-Aawaz / PRAGATI Lens". Remove Sarpanch persona references. Document actual screens present in the Kotlin codebase.
6. `web/README.md` — Rename from "Smart Study" to "PRAGATI". Add the complete route inventory (44+ routes), all 6 dashboard personas (Citizen, Nodal, Gov, University, Industry, Contributor), and all major features.

### R2. Agent Context Files Update
Update `web/CLAUDE.md` to contain useful project context, build commands, test commands, and architectural overview instead of the current 2-line stub. Leave `web/AGENTS.md` as-is since it is auto-generated by Next.js.

### R3. Rules Files Reconciliation
Update `.agy/rules/collaboration-architecture.md` to mention the Industry Mentor TRL tracking linkage. Delete or archive `.agy/learning_proposal.md` since it proposes a Sarpanch-based rule that contradicts the active `nodal-routing-architecture.md` rule.

## Acceptance Criteria

### Documentation Accuracy
- [ ] No markdown file contains the string "Smart Study" (replaced with PRAGATI/Jan-Aawaz).
- [ ] No markdown file contains the string "Sarpanch" (deprecated per nodal-routing-architecture.md rule).
- [ ] `PROJECT.md` lists at least 40 API routes and all 6 dashboard types.
- [ ] `TEST_INFRA.md` lists at least 25 test files in the file structure section.
- [ ] `architecture_flow.md` version is updated to 9.0.0 and includes Account Handover, GIS, TRL/Kanban sections.
- [ ] `web/CLAUDE.md` contains at least 30 lines of useful project context (build commands, test commands, architecture overview).

### Build Verification
- [ ] `npm run build` in `web/` exits with code 0 after all changes (documentation changes should not break the build, but verify).
