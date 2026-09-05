# Synthesis: Architectural Blueprint for Production Transformation

## 1. Executive Summary
The three Explorers have completed a comprehensive architectural investigation of the Jharkhand Societal Innovation Portal (`web`), providing a unified blueprint for:
1. **Database & Data Layer** (Explorer 1): PostgreSQL + Prisma ORM schema (`User`, `Challenge`, `Proposal`, `FundingCommitment`, `AuditLog`), soft delete extensions, ACID transactions, realistic seed matching all existing UI IDs, and OWASP Top 10 security hardening.
2. **Tiered Authentication & RBAC Middleware** (Explorer 2): 4-tier auth (Citizen Phone+OTP, University `.ac.in`+OTP, Industry Corporate+Gov Approval, Gov `.gov.in`/`.nic.in`+TOTP 2FA), HttpOnly cookie sessions, 5-attempt/30-min account lockout, rate limiting, and backend-enforced RBAC middleware with automated audit logging of 403 authorization failures.
3. **Frontend Mock Data Replacement & UX States** (Explorer 3): Full mapping of all 16 routes, global Zustand auth store, centralized `apiFetch` with CSRF & 401 handling, role-based route guards, skeleton loaders, empty states, and offline retry banners.

---

## 2. Cohesive System Architecture

### A. Database Schema & Prisma Configuration (`prisma/schema.prisma`)
- Models:
  - `User`: id, email, phone, passwordHash, role (`GOV`, `UNIVERSITY`, `INDUSTRY`, `CITIZEN`, `EXPERT`), status (`ACTIVE`, `PENDING`, `LOCKED`, `SUSPENDED`), profile details, emailVerified, phoneVerified, twoFactorEnabled, twoFactorSecret, failedLoginAttempts, lockoutUntil, createdAt, updatedAt, deletedAt.
  - `Challenge`: id, publicTrackingId, title, description, domain, district, location, urgency, status (`REPORTED`, `CITIZEN_VERIFIED`, `UNDER_REVIEW`, `OPEN_FOR_PROPOSALS`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), reportedById, assignedTo, evidence, citizenVerified, escalationLevel, slaDeadline, createdAt, updatedAt, deletedAt.
  - `Proposal`: id, proposalRef, challengeId, submittedById, universityId, title, abstract, methodology, budget, status (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `APPROVED`, `REJECTED`, `FUNDED`), createdAt, updatedAt.
  - `FundingCommitment`: id, escrowRef, proposalId, industryUserId, amount, type (`CSR`, `GRANT`, `EQUITY`), status (`PLEDGED`, `ESCROWED`, `DISBURSED`, `COMPLETED`), tranches (Json), createdAt, updatedAt.
  - `AuditLog`: id, userId, action, resource, resourceId, ipAddress, userAgent, createdAt.
- Soft Deletes: Implemented via Prisma `$extends` query extension filtering out `deletedAt != null` on queries and updating `deletedAt = new Date()` on delete operations.
- Transactions: All multi-record mutations (submitting proposals, pledging funds, status transitions with audit logs) wrap in `prisma.$transaction`.

### B. Tiered Authentication & Session Security
- **Citizen / Expert**: Phone number regex (`^(\+91)?[6-9]\d{9}$`) -> 6-digit OTP logged to server console (`[SMS/WhatsApp OTP to <phone>]: 123456`) -> verified via `/api/auth/verify-otp`.
- **University**: Institutional email (`.ac.in` domain validation) -> bcrypt password hash (cost factor >= 12) -> email OTP verification.
- **Industry**: Corporate email domain check -> bcrypt password hash -> account created with `status: "PENDING"` -> Gov admin approval required via `/api/admin/approve-user` before `/dashboard/industry` access is unlocked.
- **Government**: Strict `.gov.in` / `.nic.in` domain validation -> bcrypt password hash -> mandatory RFC 6238 TOTP 2FA (Google Authenticator / NIC GovKey with QR code & 6-digit code verification).
- **Session Security**: `sih_session` cookie with `HttpOnly`, `Secure`, `SameSite: "lax"` containing signed JWT (HS256).
- **Account Lockout**: 5 failed login attempts -> account locked for 30 minutes (`lockoutUntil`), returning HTTP 423.
- **Rate Limiting**: Sliding-window limiter on `/api/auth/*` enforcing max 10 requests/minute per client IP (HTTP 429).

### C. Backend RBAC Middleware (`withAuth`)
- Higher-order API route wrapper `withAuth(handler, { roles, requireOwnership })`:
  1. Validates `sih_session` JWT and active user status (401 if missing/invalid/expired).
  2. Validates user role against allowed roles list (403 if unauthorized).
  3. Validates resource ownership (Gov has administrative override).
  4. Automatically writes an immutable audit record to `AuditLog` on any 403 authorization failure.

### D. Security Hardening (OWASP Top 10)
- SQL Injection: 100% parameterized Prisma queries; 0 raw SQL.
- XSS: Content-Security-Policy (CSP) headers in `next.config.ts`.
- Clickjacking: `X-Frame-Options: DENY`, `frame-ancestors: 'none'`.
- Transport: Strict-Transport-Security (`HSTS`), `X-Content-Type-Options: nosniff`.
- CSRF: CSRF token generated and validated on all state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`).
- Input Validation: Zod schemas on all API request bodies and query parameters.
- Secrets: Managed exclusively via `.env` with a comprehensive `.env.example`. 0 hardcoded secrets in source files.

### E. Frontend Integration & UX
- Global auth store in Zustand (`useAuthStore`) syncing with `/api/auth/me`.
- Centralized `apiFetch` with automatic CSRF token inclusion and 401 redirect to `/login?expired=true`.
- Client-side `RoleGuard` in `/dashboard/layout.tsx` redirecting unauthorized roles to their authorized dashboard with an informative toast.
- Replacement of static mock arrays across all 16 routes with API calls (`/api/challenges`, `/api/proposals`, `/api/funds`, `/api/analytics`, `/api/track/[id]`, etc.).
- Skeleton screens (`MetricsSkeleton`, `TableSkeleton`, `DetailSkeleton`) for smooth loading.
- Empty states with CTAs and offline network status banner with retry queue.

---

## 3. Implementation Phasing for Milestone 2 (Worker Phase)
1. **Infrastructure & Dependencies**:
   - Install packages: `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`, `jose`, `qrcode`, `@types/qrcode`, `zod`, `tsx`.
   - Setup `.env` and `.env.example`.
   - Add security headers in `next.config.ts`.
2. **Database Setup**:
   - Create `prisma/schema.prisma`.
   - Setup `src/lib/prisma.ts` with soft delete query extensions.
   - Run Prisma migration / db push and generate Prisma client.
   - Implement `prisma/seed.ts` matching all existing UI IDs (`IN-GR-2026-9842`, `PR-102`, `JH-ESCROW-2026-CSR-9842`, and test personas).
   - Execute seed.
3. **Backend Auth & Security Core**:
   - Implement `src/lib/auth.ts`, `src/lib/totp.ts`, `src/lib/rateLimiter.ts`, `src/lib/csrf.ts`, `src/lib/validation.ts`.
   - Implement `src/lib/withAuth.ts` RBAC middleware with audit logging.
   - Implement `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/totp-setup`, `/api/auth/totp-verify`, `/api/auth/logout`, `/api/auth/me`.
   - Implement `/api/admin/pending-users` and `/api/admin/approve-user`.
4. **Data API Routes**:
   - Implement `/api/challenges` (GET, POST), `/api/challenges/[id]` (GET, PUT, DELETE).
   - Implement `/api/proposals` (GET, POST), `/api/proposals/[id]` (GET, PUT).
   - Implement `/api/funds` (GET, POST), `/api/funds/[id]` (GET).
   - Implement `/api/analytics` (GET) for Gov & public impact metrics.
   - Implement `/api/track/[id]` (GET) for public grievance tracking.
   - Implement `/api/audit-logs` (GET) for Gov compliance/accountability.
5. **Frontend State & Components**:
   - Implement `src/stores/authStore.ts` and `src/lib/api-client.ts`.
   - Implement `src/components/auth/RoleGuard.tsx`.
   - Implement `src/components/ui/Skeletons.tsx`, `EmptyState.tsx`, `NetworkBanner.tsx`.
6. **Page Integration**:
   - Update `login/page.tsx` with authentic tiered auth forms, OTP modal, TOTP 2FA modal, and error states.
   - Update `dashboard/layout.tsx` with `RoleGuard` and dynamic role-based navigation.
   - Wire database-driven data into `/`, `/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`, `/challenge/[id]`, `/submit`, `/track`, `/accountability`, `/whatsapp-intake`, `/dashboard/settings`, `/apply/[challengeId]`, `/dashboard/university/proposal/[id]`, `/dashboard/industry/fund/[id]`.
7. **Verification**:
   - Verify `npm run build` passes with 0 TypeScript errors.
   - Verify `npx prisma db seed` runs cleanly.
   - Verify secret scanner returns 0 hardcoded secrets.
