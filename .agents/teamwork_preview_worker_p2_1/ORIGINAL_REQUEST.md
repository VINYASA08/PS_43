## 2026-09-04T14:12:15Z

You are Worker 1 implementing the near-production-grade transformation for the Jharkhand Societal Innovation Portal at `a:\Development\Antigravity\SIH26043\web`.
Your working directory is: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_1`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Reference Architecture & Plans:
- Orchestrator Synthesis: `a:\Development\Antigravity\SIH26043\.agents\orchestrator\analysis_synthesis.md`
- Explorer 1 (Database & Security): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md` and `handoff.md`
- Explorer 2 (Auth & RBAC): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\analysis.md` and `handoff.md`
- Explorer 3 (Frontend & UX): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_3\analysis.md` and `handoff.md`
- Authoritative User Request: `a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md` (section 2026-09-04T14:06:00Z)

Your implementation duties in `a:\Development\Antigravity\SIH26043\web`:

1. DEPENDENCIES & ENVIRONMENT:
   - Install required packages: `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`, `jose`, `qrcode`, `@types/qrcode`, `zod`, `tsx`.
   - Create `.env` and `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `CSRF_SECRET`, `NODE_ENV`. Ensure zero hardcoded secrets in source files.
   - Configure HTTP security headers in `next.config.ts` (CSP, X-Frame-Options: DENY, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

2. DATABASE & PRISMA DATA LAYER:
   - Create `prisma/schema.prisma` with `User`, `Challenge`, `Proposal`, `FundingCommitment`, `AuditLog`, enums (`UserRole`, `UserStatus`, `ChallengeStatus`, `ProposalStatus`, `FundingStatus`, `FundingType`), indexes, and soft-delete field (`deletedAt`).
   - Create `src/lib/prisma.ts` with singleton and modern Prisma `$extends` query extensions to intercept soft-deletes (`deletedAt != null` filter and `deletedAt = new Date()` update on soft-delete).
   - Generate client and apply migration/push (`npx prisma generate`, `npx prisma db push` or `migrate dev`).
   - Create `prisma/seed.ts` populating realistic sample data matching existing mock data and IDs (`IN-GR-2026-9842`, `JHR-2026-842`, `PR-102`, `JH-ESCROW-2026-CSR-9842`, and test personas: `nodal.innovation@jharkhand.gov.in`, `pi.water@iitism.ac.in`, `csr.director@tatasteel.com`, `dr.sen.mentor@isro-alumni.res.in`, `citizen.reporter@jharkhand.org` with bcrypt hashed passwords).
   - Run seed script and verify data population.

3. SECURITY & AUTHENTICATION CORE:
   - Implement `src/lib/auth.ts`: bcrypt hashing (cost factor >= 12), JWT signing/verification with `jose`, `sih_session` HttpOnly/Secure/SameSite cookie handling, account lockout (5 failed attempts -> 30-minute lockout).
   - Implement `src/lib/totp.ts`: RFC 6238 TOTP generation and verification, QR code data URL generation.
   - Implement `src/lib/rateLimiter.ts`: Sliding-window IP rate limiting (10 req/min).
   - Implement `src/lib/csrf.ts`: CSRF token generation and validation.
   - Implement `src/lib/validation.ts`: Zod schemas for all input validations.
   - Implement `src/lib/withAuth.ts`: Higher-order backend RBAC route wrapper checking (1) authentication, (2) role whitelist, (3) resource ownership, returning 401/403, and automatically recording authorization failures to `AuditLog`.

4. API ROUTES:
   - `/api/auth/register` (tiered registration: citizen phone OTP, university .ac.in, industry pending approval, gov .gov.in/.nic.in)
   - `/api/auth/login` (checks credentials, lockout, triggers 2FA or issues session)
   - `/api/auth/verify-otp` (for phone & email verification)
   - `/api/auth/totp-setup` & `/api/auth/totp-verify` (Gov 2FA setup & validation)
   - `/api/auth/logout` (clears cookie)
   - `/api/auth/me` (returns current user session & role)
   - `/api/admin/pending-users` & `/api/admin/approve-user` (Gov administrative gate for Industry)
   - `/api/challenges` (GET with filters, POST for citizen submissions)
   - `/api/challenges/[id]` (GET details, PUT updates, DELETE soft-delete)
   - `/api/proposals` (GET, POST) and `/api/proposals/[id]` (GET, PUT)
   - `/api/funds` (GET, POST) and `/api/funds/[id]` (GET)
   - `/api/analytics` (GET KPI stats, district breakdown, domain distribution)
   - `/api/track/[id]` (GET tracking timeline & telemetry)
   - `/api/audit-logs` (GET audit logs)
   - `/api/csrf` (GET fresh CSRF token)

5. FRONTEND INTEGRATION & UX:
   - Implement `src/stores/authStore.ts` using Zustand to manage reactive session state.
   - Implement `src/lib/api-client.ts` (`apiFetch`) passing CSRF tokens and handling 401 session expiration (redirecting to `/login?expired=true`).
   - Implement `src/components/auth/RoleGuard.tsx` in `src/app/dashboard/layout.tsx` (redirecting unauthorized roles to their authorized dashboard with an informative toast).
   - Implement `src/components/ui/Skeletons.tsx`, `EmptyState.tsx`, `NetworkBanner.tsx`.
   - Update `src/app/login/page.tsx` with authentic login flows (OTP modal with console log hint, TOTP verification code input, pending approval notice for industry, account lockout alert).
   - Replace static mock data across all 16 pages (`/`, `/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`, `/challenge/[id]`, `/submit`, `/track`, `/accountability`, `/whatsapp-intake`, `/dashboard/settings`, `/apply/[challengeId]`, `/dashboard/university/proposal/[id]`, `/dashboard/industry/fund/[id]`).

6. BUILD & ACCEPTANCE VERIFICATION:
   - Run `npm run build` in `web` and ensure 0 TypeScript or build errors.
   - Verify `npx prisma db seed` runs cleanly.
   - Verify no hardcoded secrets appear in source files.
   - Document all changes in `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_1\changes.md` and provide a comprehensive handoff in `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_1\handoff.md`. Include test commands and outputs.
