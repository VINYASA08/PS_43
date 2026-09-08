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

