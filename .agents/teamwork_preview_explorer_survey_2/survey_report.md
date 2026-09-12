# Comprehensive Backend, Database & Security Survey Report
**Jharkhand Societal Innovation Collaboration Portal**
**Explorer**: Survey 2 (Backend & Security Explorer)
**Date**: 2026-09-04T21:15:00Z
**Target Base**: `a:\Development\Antigravity\SIH26043\web`

---

## 1. Executive Summary

A comprehensive forensic examination was conducted across the backend architecture, database layer, authentication system, role-based access control (RBAC), security hardening, and test suites of the Jharkhand Societal Innovation Collaboration Portal.

### High-Level Status:
- **Build & Compilation**: Next.js 16.3.4 (Turbopack) and TypeScript 5 compile with **0 errors** across all 22 API routes and 14 frontend pages (`npm run build` exits 0).
- **Test Suites**:
  - `tests/auth-rbac-security.test.ts`: **29/29 PASSED** (100% route-level RBAC, 401/403 assertions, lockout, TOTP, rate limiting).
  - `tests/db-api-lifecycle.test.ts`: **26/26 PASSED** (100% CRUD lifecycle, soft deletes, tracking, secret scan).
  - `tests/workflows.test.mjs`: **22/22 PASSED** (UI workflows and edge-case oracles).
- **Core Strengths**: Fully implemented tiered authentication (Citizen OTP, University `.ac.in`, Industry pending approval, Gov TOTP 2FA), bcrypt password hashing (12 rounds), HMAC-SHA256 CSRF protection, sliding window rate limiting (10 req/min), Prisma soft deletes extension, comprehensive audit logging.
- **Key Gaps & Vulnerabilities Identified**:
  1. **Database Provider**: `prisma/schema.prisma` is currently configured for `sqlite` (`file:./dev.db`) rather than `postgresql`. No version-controlled migrations folder (`prisma/migrations`) exists.
  2. **Frontend RBAC Routing**: `components/auth/RoleGuard.tsx` is only mounted at `dashboard/layout.tsx` for all 5 roles collectively; individual dashboard subpages (`/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`) do not enforce role-specific frontend redirects. There is no Next.js root `middleware.ts`.
  3. **CSRF Missing on Specific Endpoints**: `/api/users/profile` (PUT) and `/api/challenges/[id]/apply` (POST) do not validate CSRF tokens, posing a CSRF risk on state-changing session actions.
  4. **Permissions-Policy Header**: `next.config.ts` specifies `geolocation=()`, which disables the browser Geolocation API despite Citizen challenge requirements for GPS telemetry.
  5. **AI Problem Categorization**: No external AI provider integration (Google Gemini / OpenAI) exists yet in `web/src/` for auto-categorizing, triaging, and deduplicating societal challenges.

---

## 2. Detailed API Route Inventory (22 Routes)

The application features 22 API route handlers under `web/src/app/api/`:

| # | Route Path | Methods | Auth Required | Allowed Roles | Request Body / Query Params | Database Operations | Description |
|---|------------|---------|---------------|---------------|-----------------------------|---------------------|-------------|
| 1 | `/api/auth/register` | `POST` | No | Any (specified in body) | `{ role: 'CITIZEN'\|'UNIVERSITY'\|'INDUSTRY'\|'GOV', ...fields }` | `User.create`, `User.findUnique` | Tiered registration: Citizen phone OTP, University `.ac.in` OTP, Industry corporate pending approval, Gov `.gov.in`/`.nic.in` TOTP secret setup. Rate limited (10/min). |
| 2 | `/api/auth/login` | `POST` | No | Any | `{ email?, phone?, password?, otp?, totpCode? }` | `User.findUnique`, `User.update`, `AuditLog.create` | Dual-mode login: Citizen phone+OTP; Institutional/Corporate/Gov email+password with 5-attempt/30-min lockout, pending check, and Gov TOTP challenge. Attaches `sih_session` cookie and issues CSRF cookie. |
| 3 | `/api/auth/verify-otp` | `POST` | No | Any | `{ identifier, otp, purpose? }` | `User.findFirst`, `User.update` | Validates 6-digit numeric OTP (hashed SHA-256 in-memory, 10-min expiry, max 5 attempts), activates phone/email verified timestamp, issues session cookie. |
| 4 | `/api/auth/totp-setup` | `POST` | Session or TempToken | Any (targeted for GOV) | Optional `{ tempToken }` in body or Bearer header | `User.findUnique`, `User.update` | Generates RFC 4648 Base32 secret (20 bytes), saves to user, and returns QR code data URL (via `qrcode`) and manual entry key. |
| 5 | `/api/auth/totp-verify` | `POST` | Session or TempToken | Any (targeted for GOV) | `{ code, tempToken? }` | `User.findUnique`, `User.update` | Validates 6-digit TOTP code per RFC 6238 within ±30s drift window, enables `twoFactorEnabled: true`, clears failed attempts, attaches session cookie. |
| 6 | `/api/auth/me` | `GET` | Yes (cookie) | Any Active | None | `User.findUnique` | Returns authenticated session profile from DB. Returns `{ authenticated: false }` if no session or inactive. |
| 7 | `/api/auth/logout` | `POST` | No | Any | None | None | Clears `sih_session` cookie (`maxAge: 0`). |
| 8 | `/api/admin/pending-users` | `GET` | Yes (`withAuth`) | `GOV` | None | `User.findMany({ where: { status: 'PENDING' } })` | Returns list of pending corporate/industry registrations awaiting Gov admin approval. |
| 9 | `/api/admin/approve-user` | `POST` | Yes (`withAuth`) | `GOV` | `{ userId, action: 'approve'\|'reject', reason? }` | `User.findUnique`, `User.update`, `AuditLog.create` | Approves (`ACTIVE`) or rejects (`SUSPENDED`) pending user accounts. Requires CSRF header. Writes audit log. |
| 10 | `/api/audit-logs` | `GET` | Yes (`withAuth`) | `GOV` | Query: `limit`, `resource`, `action` | `AuditLog.findMany` with relations | Returns tamper-evident audit logs with user identity, resource, IP, userAgent, and JSON state transitions. |
| 11 | `/api/csrf` | `GET` | No | Any | None | None | Generates cryptographically signed CSRF token (`rawId.timestamp.signature`), sets `sih_csrf` cookie, returns `{ csrfToken }`. |
| 12 | `/api/challenges` | `GET` | No | Public | Query: `domain`, `district`, `urgency`, `status`, `search`, `limit`, `page` | `Challenge.findMany`, `Challenge.count` | Paginated search and filtering of societal challenges with proposal counts. |
| 13 | `/api/challenges` | `POST` | Optional (auto-provisions default citizen if unauthenticated) | Public / Citizen | Validated by `createChallengeSchema` (title, description, domain, district, location, urgency, evidence) | `Challenge.create`, `AuditLog.create` | Creates new societal challenge with generated `IN-GR-2026-XXXX` tracking ID, 30-day SLA deadline, and audit log. Requires CSRF. |
| 14 | `/api/challenges/[id]` | `GET` | No | Public | Route param `id` (UUID or `publicTrackingId`) | `Challenge.findFirst` with relations | Returns detailed challenge dossier with reporter, assigned team, proposals, and funding commitments. |
| 15 | `/api/challenges/[id]` | `PUT` | Yes (cookie) | `GOV`, `UNIVERSITY`, or Reporter | Route param `id`, JSON body with update fields | `Challenge.findFirst`, `Challenge.update`, `AuditLog.create` | Role-differentiated field update (Gov: urgency/escalation/assignee; Uni: claim/institute; Owner: title/desc). Requires CSRF. |
| 16 | `/api/challenges/[id]` | `DELETE` | Yes (cookie) | `GOV` or Reporter | Route param `id` | `Challenge.delete` (soft delete via extension), `AuditLog.create` | Sets `deletedAt` timestamp; filtered from future queries. Requires CSRF. |
| 17 | `/api/challenges/[id]/apply` | `POST` | No (open) | Public / Expert | `{ name, email, phone, role, organization, proposalSummary, linkedinUrl }` | `Challenge.findFirst`, `AuditLog.create` | Registers external expert/mentor collaboration application for a challenge. |
| 18 | `/api/proposals` | `GET` | No | Public | Query: `challengeId`, `status`, `submittedById` | `Proposal.findMany` with challenge & funding relations | Lists translational research proposals with challenge details. |
| 19 | `/api/proposals` | `POST` | Yes (cookie) | `UNIVERSITY`, `GOV`, `EXPERT` | Validated by `createProposalSchema` (challengeId, title, abstract, methodology, budget, timelineMonths, universityName) | `Proposal.create`, `Challenge.update`, `AuditLog.create` | Submits translational research proposal. Advances challenge status from `OPEN_FOR_PROPOSALS` to `UNDER_REVIEW`. Requires CSRF. |
| 20 | `/api/proposals/[id]` | `GET` | No | Public | Route param `id` (UUID or `proposalRef`) | `Proposal.findFirst` with relations | Returns proposal details including challenge context and industry commitments. |
| 21 | `/api/proposals/[id]` | `PUT` | Yes (cookie) | `GOV` or Proposal Owner | Route param `id`, JSON body with update fields | `Proposal.findFirst`, `Proposal.update`, `AuditLog.create` | Updates proposal fields or approval status (`APPROVED`, `REJECTED`, `SHORTLISTED`). Requires CSRF. |
| 22 | `/api/funds` | `GET` | No | Public | Query: `proposalId`, `status` | `FundingCommitment.findMany` with relations | Returns escrow funding commitments with proposal and corporate metadata. |
| 23 | `/api/funds` | `POST` | Yes (cookie) | `INDUSTRY`, `GOV` | Validated body (proposalId, amount, type, corporateName, panNumber, csrRegistrationNo) | `FundingCommitment.create`, `Proposal.update`, `Challenge.update`, `AuditLog.create` | Locks corporate CSR funds in State Escrow Node with 30-40-30 tranche structure. Updates proposal to `FUNDED` and challenge to `IN_PROGRESS`. Requires CSRF. |
| 24 | `/api/funds/[id]` | `GET` | No | Public | Route param `id` (UUID or `escrowRef`) | `FundingCommitment.findFirst` with relations | Returns escrow commitment details, tranches, and digital MoU audit trail. |
| 25 | `/api/analytics` | `GET` | No | Public | None | `Challenge.count`, `Proposal.count`, `FundingCommitment.findMany`, `User.groupBy` | Aggregates state-wide telemetry, KPIs, domain distribution, and district breakdown for executive dashboards. |
| 26 | `/api/track/[id]` | `GET` | No | Public | Route param `id` (tracking ID or UUID) | `Challenge.findFirst`, `AuditLog.findMany` | Telemetry tracker: returns 5-stage lifecycle timeline, field telemetry (pH, turbidity, soil NPK), and grievance ledger. |
| 27 | `/api/intake/whatsapp-simulate` | `POST` | No | Public | `{ message, domain?, district?, location?, phone? }` | `User.findFirst/create`, `Challenge.create`, `AuditLog.create` | Simulates omnichannel WhatsApp chatbot ingestion into state innovation ledger. |
| 28 | `/api/users/profile` | `GET` | Yes (`withAuth`) | Any Active | None | `User.findUnique` | Returns current authenticated user profile. |
| 29 | `/api/users/profile` | `PUT` | Yes (`withAuth`) | Any Active | Validated by `userProfileUpdateSchema` (name, organization, designation, district, bio, phone) | `User.update`, `AuditLog.create` | Updates user profile and records audit log. |

*(Note: Total routes count is 22 distinct route file endpoints covering 29 HTTP method actions)*.

---

## 3. Database Architecture (Prisma & PostgreSQL Setup)

### Current Prisma Configuration:
- **Schema File**: `web/prisma/schema.prisma`
- **Database Engine**: Currently configured for **SQLite** (`provider = "sqlite"`, `url = env("DATABASE_URL")`).
- **Database File**: `web/prisma/dev.db` (159 KB initialized).
- **Environment**: `.env` and `.env.example` set `DATABASE_URL="file:./dev.db"`.
- **Client Extensions**: `web/src/lib/prisma.ts` implements a Prisma Client query extension that:
  - Automatically injects `{ deletedAt: null }` into `findMany` and `findFirst` queries across `user`, `challenge`, `proposal`, and `fundingCommitment`.
  - Automatically intercepts `delete` and `deleteMany` calls and converts them into soft delete updates: `{ deletedAt: new Date() }`.

### Data Models & Schema Structure:

```
+-----------------------------------------------------------------------------------+
|                                      USER                                         |
+-----------------------------------------------------------------------------------+
| id (cuid) [PK]                                                                    |
| email (String?) [UNIQUE]                                                          |
| phone (String?) [UNIQUE]                                                          |
| passwordHash (String)                                                             |
| role (String: GOV | UNIVERSITY | INDUSTRY | CITIZEN | EXPERT) [INDEX]              |
| status (String: ACTIVE | PENDING | LOCKED | SUSPENDED) [INDEX]                    |
| name, organization?, designation?, district? [INDEX], bio?, profileUrl?           |
| emailVerified (DateTime?), phoneVerified (DateTime?)                              |
| twoFactorEnabled (Boolean), twoFactorSecret (String?)                             |
| failedLoginAttempts (Int), lockoutUntil (DateTime?)                               |
| createdAt, updatedAt, deletedAt? [INDEX]                                          |
+-----------------------------------------------------------------------------------+
        | 1:N (reportedBy)                  | 1:N (submittedBy)       | 1:N (industryUser)
        v                                   v                         v
+-----------------------------+     +-----------------------+     +-------------------------+
|          CHALLENGE          |     |       PROPOSAL        |     |   FUNDING_COMMITMENT    |
+-----------------------------+     +-----------------------+     +-------------------------+
| id (cuid) [PK]              | 1:N | id (cuid) [PK]        | 1:N | id (cuid) [PK]          |
| publicTrackingId [UNIQUE]   |---->| proposalRef [UNIQUE]  |---->| escrowRef [UNIQUE]      |
| title, description          |     | challengeId (FK)      |     | proposalId (FK)         |
| domain, district, location  |     | submittedById (FK)    |     | industryUserId (FK)     |
| urgency (CRITICAL..LOW)     |     | universityName        |     | corporateName           |
| status (REPORTED..CLOSED)   |     | title, abstract       |     | panNumber, csrRegNo     |
| reportedById (FK -> User)   |     | methodology           |     | amount, type (CSR..)    |
| assignedToId? (FK -> User)  |     | budget, timelineMonths|     | status (ESCROWED..)     |
| assignedInstitute?          |     | stage, attachedDocs   |     | notes, tranches (JSON)  |
| evidence (JSON), verified   |     | status (SUBMITTED..)  |     | mouSigned, mouSignedAt  |
| escalationLevel (0..3)      |     | createdAt, updatedAt  |     | createdAt, updatedAt    |
| slaDeadline?                |     | deletedAt? [INDEX]    |     | deletedAt? [INDEX]      |
| createdAt, updatedAt        |     +-----------------------+     +-------------------------+
| deletedAt? [INDEX]          |
+-----------------------------+
        | 1:N
        v
+-----------------------------------------------------------------------------------+
|                                   AUDIT_LOG                                       |
+-----------------------------------------------------------------------------------+
| id (cuid) [PK]                                                                    |
| userId? (FK -> User) [INDEX]                                                      |
| action (String) [INDEX]                                                           |
| resource (String), resourceId (String) [INDEX: resource + resourceId]             |
| challengeId? (FK -> Challenge) [INDEX]                                            |
| oldState (JSON?), newState (JSON?)                                                |
| ipAddress?, userAgent?                                                            |
| createdAt (DateTime) [INDEX]                                                      |
+-----------------------------------------------------------------------------------+
```

### Seed Data Verification:
Running `npx tsx prisma/seed.ts` populates:
1. **6 Test Personas**:
   - `nodal.innovation@jharkhand.gov.in` (Gov Principal Secretary, 2FA enabled with Base32 secret `JBSWY3DPEHPK3PXP`, password: `Jharkhand@2026!`).
   - `pi.water@iitism.ac.in` (University PI, IIT ISM Dhanbad).
   - `csr.director@tatasteel.com` (Industry Head, Tata Steel CSR Division, status: `ACTIVE`).
   - `csr.lead@coalindia.in` (Industry GM, Coal India CSR Trust, status: `PENDING`).
   - `dr.sen.mentor@isro-alumni.res.in` (Independent Expert / ISRO Alumni).
   - `citizen.reporter@jharkhand.org` / `+919708099999` (Gram Panchayat Nodal Monitor).
2. **7 Societal Challenges**:
   - `IN-GR-2026-9842`: Water Contamination & Acidic Runoff in Dhanbad (Critical, In Progress, Telemetry: pH 4.8, Turbidity 48 NTU, Dissolved Iron 6.2 mg/L).
   - `JHR-2026-821`: Smart Irrigation & Soil Nitrogen Deficit in Gumla (High, Open for Proposals).
   - `JHR-2026-805`: Rural Healthcare Tele-Medicine in Simdega (Critical, Resolved).
   - `JHR-2026-788`: Solar Microgrid Storage in Hatia Slum Cluster, Ranchi (High, Under Review).
   - `JHR-2026-764`: Digital Literacy Lab for KGBV Schools in Khunti (Medium, Open for Proposals).
   - `JHR-2026-750`: Subsurface Aquifer Arsenic Contamination in Sahebganj (Critical, Open for Proposals).
   - `JHR-2026-842`: Contaminated Drinking Water duplicate issue in Dhanbad.
3. **4 Translational Research Proposals**:
   - `PR-102`: Solar-Powered Dual-Stage Groundwater Filtration (IIT ISM Dhanbad, ₹3,50,000, Approved).
   - `PR-104`: AI-Driven Hyper-Local Soil NPK Telemetry (Birsa Agricultural University, ₹2,80,000, Under Review).
   - `PR-109`: Modular 48V DC Nano-Grid with 2nd-Life EV Batteries (NIT Jamshedpur, ₹12,00,000, Submitted).
   - `PR-115`: Bio-Adsorbent Arsenic Filter using Calcined Laterite (IIT ISM Dhanbad, ₹4,80,000, Shortlisted).
4. **1 Escrow Funding Commitment**:
   - `JH-ESCROW-2026-CSR-9842`: Tata Steel CSR Division committed ₹3,50,000 for `PR-102` with 30-40-30 tranches and signed MoU.
5. **Initial Audit Trail**: 4 audit records tracking challenge creation, assignment, proposal submission, and escrow locking.

### PostgreSQL vs SQLite Findings & Migration Path:
- **Current reality**: SQLite was implemented for Windows local self-contained execution without external dependencies.
- **PostgreSQL Requirement**: Requirement R2 mandates PostgreSQL with version-controlled migrations (`prisma/migrations`).
- **Required changes for PostgreSQL**:
  - Update `schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`.
  - Convert String representations of enums (`role`, `status`, `urgency`) to native PostgreSQL enums (`enum UserRole { GOV, UNIVERSITY, ... }`) if desired, or retain string columns with Zod validation.
  - Run `npx prisma migrate dev --name init` against a PostgreSQL instance (or Docker container) to generate the initial migration directory.

---

## 4. Tiered Authentication Implementation

The portal implements an enterprise 4-tiered authentication model adhering to government security standards:

### 1. Citizen / NGO / Expert Tier
- **Credential**: Phone number formatted as Indian E.164 (`+91XXXXXXXXXX`).
- **Mechanism**: Passwordless login / registration via 6-digit OTP.
- **Simulation**: OTP is generated via `crypto.randomInt(100000, 1000000)` and logged directly to the server console:
  `[SMS/WhatsApp OTP to +919708099999]: 481923`.
- **Storage**: In-memory `Map` keyed by phone number; OTP is stored as a SHA-256 hash (`crypto.createHash("sha256")`) with a 10-minute TTL.
- **Protection**: Max 5 attempts; OTP is invalidated and deleted on fifth failed attempt or upon successful verification (single-use token).

### 2. University Tier
- **Credential**: Institutional email ending with `.ac.in` domain (enforced by Zod schema: `email.endsWith(".ac.in")`) + password.
- **Verification**: Email OTP verification code dispatched to institutional email (simulated in console) upon signup.
- **Status**: Activated immediately upon OTP confirmation (`status: "ACTIVE"`).

### 3. Industry Tier
- **Credential**: Corporate email + password.
- **Validation**: Free webmail providers (`gmail.com`, `yahoo.com`, `outlook.com`, `hotmail.com`, `icloud.com`, `zoho.com`) are strictly rejected.
- **Approval Gate**: Account is created with `status: "PENDING"`.
- **Enforcement**: Login endpoint explicitly returns HTTP 403 Forbidden:
  `{ error: "Account pending administrator approval", status: "PENDING" }`.
- **Approval Workflow**: A Government official (`role: "GOV"`) views pending users via `GET /api/admin/pending-users` and approves/rejects via `POST /api/admin/approve-user`.

### 4. Government Officials Tier
- **Credential**: Official email ending with `.gov.in` or `.nic.in` + password.
- **2FA Requirement**: Mandatory TOTP Two-Factor Authentication (RFC 6238 compliant).
- **Setup Flow**:
  1. Signup generates a cryptographically random RFC 4648 Base32 secret (`lib/totp.ts`).
  2. Setup endpoint `/api/auth/totp-setup` returns a Data URL QR code (`otpauth://totp/...`) and formatted manual entry key.
  3. Official scans QR code into Google Authenticator / Microsoft Authenticator.
  4. Confirmation endpoint `/api/auth/totp-verify` validates the 6-digit token and sets `twoFactorEnabled: true`.
- **Login Flow**:
  1. Step 1: Email + Password validated -> Server returns `{ require2FA: true, tempToken: "<jwt-5m>" }`.
  2. Step 2: Official enters 6-digit TOTP code -> Verified with `tempToken` -> Session cookie issued.

### Password Hashing:
- `bcryptjs` with cost factor 12 (`BCRYPT_SALT_ROUNDS = 12`) used across all password hashes (`hashPassword()`).

### Session Management:
- JWT signed with `jose` using HS256 and secret `process.env.JWT_SECRET` (fallback for development only, mandatory in production).
- 7-day expiration (`7d`).
- Stored in `sih_session` cookie with flags: `httpOnly: true`, `sameSite: "lax"`, `secure: process.env.NODE_ENV === "production"`, `path: "/"`.

### Account Lockout:
- Consecutive failed login attempts increment `failedLoginAttempts`.
- Upon 5 consecutive failed attempts, `lockoutUntil` is set to `Date.now() + 30 * 60 * 1000` (30 minutes) and `status` set to `"LOCKED"`.
- Returns HTTP 423 Locked with `{ error: "Account Locked", remainingMinutes: 30 }`.
- Successful authentication resets failed attempts to 0.

### Rate Limiting:
- Implemented in `web/src/lib/rateLimiter.ts` using an in-memory sliding window algorithm.
- Window: 60,000 ms (1 minute); Max requests: 10 per window per IP.
- Enforced on `/api/auth/login`, `/api/auth/register`, and `/api/auth/verify-otp`.
- Exceeding threshold returns HTTP 429 Too Many Requests with header `Retry-After: <seconds>`.

---

## 5. RBAC Middleware & Authorization Architecture

### Backend Enforcement (`web/src/lib/rbac.ts`):
The portal uses higher-order function `withAuth(handler, allowedRoles)` to wrap Next.js route handlers:
1. **Authentication Check**: Calls `getSession(req)` (decodes and verifies `sih_session` JWT cookie). If missing or invalid, returns HTTP 401 Unauthorized and writes `AUTH_FAILURE` to `AuditLog`.
2. **Account Status Check**: Checks `session.status === "ACTIVE"`. If `PENDING`, `LOCKED`, or `SUSPENDED`, returns HTTP 403 Forbidden and writes `AUTH_FAILURE` to `AuditLog`.
3. **Role Check**: If `allowedRoles` array is provided, checks `allowedRoles.includes(session.role)`. If unauthorized, returns HTTP 403 Forbidden:
   `{ error: "You do not have permission to access this resource." }`
   and logs `AUTHORIZATION_FAILURE` with full metadata to `AuditLog`.
4. **Audit Trail**: Writes IP address, userAgent, path, timestamp, and JSON before/after state to `AuditLog`.

### Current Route RBAC Mapping:
- `/api/admin/approve-user`: `[UserRole.GOV]` -> Non-gov receives 403.
- `/api/admin/pending-users`: `[UserRole.GOV]` -> Non-gov receives 403.
- `/api/audit-logs`: `[UserRole.GOV]` -> Non-gov receives 403.
- `/api/proposals` (POST): `[UNIVERSITY, GOV, EXPERT]` -> Citizen or Industry receives 403.
- `/api/funds` (POST): `[INDUSTRY, GOV]` -> Citizen or University receives 403.
- `/api/challenges/[id]` (PUT/DELETE): Checked internally (Gov or Resource Owner).

### Frontend Routing & UX Gaps:
- **`RoleGuard.tsx` Component**: Exists in `web/src/components/auth/RoleGuard.tsx`. If user is unauthenticated, it redirects to `/login?returnUrl=...`. If role is unauthorized, it redirects to the user's home dashboard (`/dashboard/gov`, `/dashboard/university`, etc.).
- **Layout Gap**: In `web/src/app/dashboard/layout.tsx` (line 113), `RoleGuard` is instantiated with:
  `allowedRoles={["GOV", "UNIVERSITY", "INDUSTRY", "CITIZEN", "EXPERT"]}`.
  This allows *any* logged-in role to enter the dashboard layout.
- **Subpage Gap**: The child pages (`/dashboard/gov/page.tsx`, `/dashboard/university/page.tsx`, `/dashboard/industry/page.tsx`) do *not* wrap themselves with specific `allowedRoles={["GOV"]}`. Consequently, while the API endpoints return 403 to prevent data leakage, a university user can navigate directly to `/dashboard/gov` in their browser and see the government UI shell with empty tables rather than being redirected to `/dashboard/university`.
- **Next.js Root Middleware Gap**: There is currently no `web/src/middleware.ts`. Route protection at the edge/server level before rendering is not active.

---

## 6. Security Posture & OWASP Top 10 Hardening

| OWASP Category | Portal Defense Mechanism | Implementation File | Assessment / Status |
|----------------|--------------------------|---------------------|---------------------|
| **A01: Broken Access Control** | Backend `withAuth` wrapper on sensitive routes; role checking; soft delete isolation; ownership checks. | `lib/rbac.ts`, route files | **Strong on API**. Frontend subpage redirect needs tightening. |
| **A02: Cryptographic Failures** | Bcrypt (cost 12), JWT (HS256 with min 32-char keys), HMAC-SHA256 for CSRF, RFC 6238 TOTP (HMAC-SHA1). | `lib/auth.ts`, `lib/csrf.ts`, `lib/totp.ts` | **Compliant**. Secrets kept in `.env`; production guard throws if missing. |
| **A03: Injection (SQLi / Command)** | Prisma ORM parameterizes all queries; 0 occurrences of `$queryRaw` or `$executeRaw` across entire codebase. | `lib/prisma.ts`, routes | **Compliant**. No raw SQL used anywhere. |
| **A04: Insecure Design** | Tiered trust model, Gov 2FA, mandatory industry approval gate, tamper-evident audit logs. | `prisma/schema.prisma`, `lib/rbac.ts` | **Compliant**. High-assurance design. |
| **A05: Security Misconfiguration** | Next.js security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=63072000`, `Referrer-Policy`. | `next.config.ts` | **Partially Compliant**. Permissions-Policy blocks geolocation (`geolocation=()`), which breaks citizen GPS requirement. |
| **A06: Vulnerable Components** | Up-to-date modern stack: Next.js 16.3.4, React 19.2.8, Prisma 7.10.0, Jose 6.2.11, Zod 4.5.4. | `package.json` | **Clean**. Zero high-severity npm vulnerabilities. |
| **A07: Identification & Auth Failures** | 5-attempt account lockout for 30 minutes, 10 req/min sliding-window rate limiting, HTTP-only SameSite cookies, TOTP 2FA. | `lib/auth.ts`, `lib/rateLimiter.ts` | **Compliant**. Verified by 29 automated test oracles. |
| **A08: Software & Data Integrity Failures** | Double-submit cookie HMAC-SHA256 signed CSRF protection on state-changing requests. | `lib/csrf.ts`, `lib/api-client.ts` | **Needs Patch**: CSRF missing on `/api/users/profile` PUT and `/api/challenges/[id]/apply` POST. |
| **A09: Security Logging & Monitoring** | `AuditLog` table records user, action, resource, IP address, user agent, timestamps, and JSON diffs. | `prisma/schema.prisma`, `lib/rbac.ts` | **Compliant**. Captures all auth and authorization failures. |
| **A10: Server-Side Request Forgery (SSRF)** | No outgoing arbitrary HTTP requests or user-supplied URLs fetched on backend. | All routes | **Compliant**. |

---

## 7. External AI Categorization Survey & Gap Analysis

Requirement R2 of `## 2026-09-04T21:04:25Z` mandates:
> *"Implement real AI categorization using an external provider (e.g., Gemini/OpenAI) to automatically categorize, prioritize, deduplicate, and route challenges to appropriate universities based on thematic domains."*
> *"AI Integration Tests: The categorization API successfully communicates with the external AI provider and accurately classifies a sample problem statement."*

### Current State:
- There is **no external AI SDK** installed (neither `@google/genai` nor `openai`).
- There is **no AI triage service or endpoint** in `web/src/app/api/` or `web/src/lib/`.
- In `POST /api/challenges`, categorization is purely manual: it accepts `domain` and `urgency` directly from the user's form payload.
- In `GET /api/track/[id]`, step 2 in the timeline states `"AI Clustered & Triaged"` with static text `"NLP Domain Categorization: " + challenge.domain`, but no automated NLP or LLM inference occurred.

### Required Architecture for AI Categorization:
1. Install official SDK (e.g., `@google/genai` for Gemini or `openai`).
2. Add API key to `.env` and `.env.example` (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
3. Create `web/src/lib/ai/classifier.ts`:
   - System prompt defining Jharkhand societal domains (Water Management, Agriculture, Healthcare, Energy, Education, Urban Infrastructure, Sanitation, Rural Livelihoods).
   - Structured JSON output schema returning:
     - `categorizedDomain`: string
     - `urgency`: `"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"`
     - `confidenceScore`: number (0.0 to 1.0)
     - `recommendedInstitutes`: string[] (e.g., IIT ISM Dhanbad for Water/Mining, Birsa Agricultural University for Agriculture, RIMS Ranchi for Health, BIT Mesra for Urban Tech)
     - `keyIssuesDetected`: string[]
     - `duplicateRisk`: boolean
4. Integrate into `POST /api/challenges`:
   - Automatically trigger AI classification upon problem submission.
   - If user left domain/urgency blank or auto-selected, populate with AI results.
   - Attach AI triage metadata to `challenge.evidence` JSON.
5. Create automated test suite: `tests/ai-categorization.test.ts` verifying API communication, fallback handling on network error, and accurate categorization of sample prompts.

---

## 8. Feature Inventory for Orchestrator Decomposition

To assist the Orchestrator in milestone partitioning and work item allocation, here is the granular Feature Inventory:

### Backend & Security Feature Inventory

| Feature ID | Feature Name | Area | Current Status | Dependencies | Description & Scope |
|------------|--------------|------|----------------|--------------|---------------------|
| **BE-01** | PostgreSQL Database Schema & Migration | Database | Incomplete (SQLite in use) | Prisma, Postgres | Update `prisma/schema.prisma` datasource to postgresql; generate version-controlled `prisma/migrations`; ensure soft deletes and seed data remain intact. |
| **BE-02** | Tiered Auth: Citizen Phone + OTP | Auth | Fully Implemented | `lib/otp.ts`, `api/auth` | Indian phone regex, SHA-256 hashed OTP in-memory, 10-min TTL, max 5 attempts, auto-provisioning, console log for dev. |
| **BE-03** | Tiered Auth: University `.ac.in` + OTP | Auth | Fully Implemented | `lib/otp.ts`, `api/auth` | `.ac.in` domain validation via Zod, bcrypt password, email OTP verification. |
| **BE-04** | Tiered Auth: Industry Pending Gate | Auth | Fully Implemented | `api/auth`, `api/admin` | Corporate email validation (blocks free webmail), `PENDING` initial status, Gov admin approve/reject API. |
| **BE-05** | Tiered Auth: Gov TOTP 2FA | Auth | Fully Implemented | `lib/totp.ts`, `api/auth` | `.gov.in`/`.nic.in` validation, RFC 6238 TOTP with Base32 secret, QR code generation, ±30s drift window, temp token verification. |
| **BE-06** | Account Lockout & Rate Limiting | Security | Fully Implemented | `lib/rateLimiter.ts`, `lib/auth.ts` | 5 failed attempts locks for 30 minutes (HTTP 423); sliding window 10 req/min per IP (HTTP 429). |
| **BE-07** | Backend RBAC Middleware (`withAuth`) | RBAC | Fully Implemented | `lib/rbac.ts` | Higher-order route wrapper enforcing authentication, account active status, role permission, and logging failures to AuditLog. |
| **BE-08** | Page-Level Frontend RBAC Routing | RBAC | Partial Gap | `RoleGuard.tsx`, `middleware.ts` | Add Next.js root `middleware.ts` or wrap `/dashboard/gov`, `/dashboard/university`, `/dashboard/industry` with role-specific `RoleGuard` so unauthorized users are redirected. |
| **BE-09** | CSRF Token Hardening | Security | Partial Gap | `lib/csrf.ts` | Add `validateCsrfRequest(req)` to `PUT /api/users/profile` and `POST /api/challenges/[id]/apply`. |
| **BE-10** | Permissions-Policy Geolocation Fix | Security | Partial Gap | `next.config.ts` | Update `Permissions-Policy` in `next.config.ts` to allow `geolocation=(self)` so citizens can capture GPS coordinates for challenges. |
| **BE-11** | External AI Challenge Categorization | AI / Backend | Not Implemented | SDK, Gemini/OpenAI API | Real external AI provider integration to classify domain, urgency, and route challenge to matching academic institutes. |
| **BE-12** | Challenge & Proposal CRUD APIs | API | Fully Implemented | `api/challenges`, `api/proposals` | Paginated listing, full-text search, multi-tenant creation, status transitions, soft deletes. |
| **BE-13** | Escrow Fund Commitment & Tranches | API | Fully Implemented | `api/funds` | CSR Section 135 escrow locking, tripartite 30-40-30 tranches, digital MoU signing, challenge status advancement. |
| **BE-14** | Audit Trail & Accountability Engine | Security / API | Fully Implemented | `api/audit-logs`, `api/analytics` | Immutable audit log trail with IP/agent tracking, state transitions, state GRAI score telemetry. |
| **BE-15** | Omnichannel WhatsApp Grievance Intake | API | Fully Implemented | `api/intake/whatsapp-simulate` | Ingestion endpoint simulating WhatsApp chatbot field reports into public tracking ledger. |
| **BE-16** | End-to-End Automated Test Suites | Verification | Fully Implemented (55 passing) | Node assert, tsx | `tests/auth-rbac-security.test.ts` (29 tests), `tests/db-api-lifecycle.test.ts` (26 tests). Need new AI integration tests. |

---

## 9. Conclusion

The existing codebase is far more advanced than a static mockup: it already possesses a high-functioning backend with 22 API endpoints, a complete Prisma data model, tiered authentication with 2FA and lockout, RBAC middleware, and 55 passing automated test oracles. 

The primary roadmap tasks for the upcoming milestones are:
1. Integrating real external AI categorization (Gemini/OpenAI) for societal challenges.
2. Enforcing page-level RBAC redirects on frontend dashboards (`middleware.ts` or page guards).
3. Patching minor security gaps (CSRF on profile PUT, Permissions-Policy geolocation).
4. Providing PostgreSQL containerization / migration scripts while preserving SQLite fallback for friction-free local execution.
