## 2026-09-04T15:41:00Z

You are Worker 2 taking over and completing the near-production-grade transformation for the Jharkhand Societal Innovation Portal at `a:\Development\Antigravity\SIH26043\web`.
Your working directory is: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_2`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Reference Architecture & Plans:
- Orchestrator Synthesis: `a:\Development\Antigravity\SIH26043\.agents\orchestrator\analysis_synthesis.md`
- Explorer 1 (Database & Security): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md` and `handoff.md`
- Explorer 2 (Auth & RBAC): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\analysis.md` and `handoff.md`
- Explorer 3 (Frontend & UX): `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_3\analysis.md` and `handoff.md`
- Authoritative User Request: `a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md` (section 2026-09-04T14:06:00Z)

CURRENT STATE IN `a:\Development\Antigravity\SIH26043\web`:
- Dependencies already installed in `package.json`: `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`, `jose`, `qrcode`, `@types/qrcode`, `zod`, `tsx`, `zustand`.
- `.env` and `.env.example` already exist.
- `next.config.ts` already has security headers configured.
- `prisma/schema.prisma` already created with User, Challenge, Proposal, FundingCommitment, AuditLog.
- Core libraries already created in `src/lib/`: `prisma.ts`, `auth.ts`, `rbac.ts`, `types.ts`, `validation.ts`.

YOUR REQUIRED TASKS TO COMPLETE MILESTONE 2:

1. DATABASE CLIENT GENERATION & SEEDING:
   - Run `npx prisma generate` and `npx prisma db push` (with `DATABASE_URL="file:./dev.db"`).
   - Create `prisma/seed.ts` populating realistic sample data matching existing mock data and IDs (`IN-GR-2026-9842`, `JHR-2026-842`, `PR-102`, `JH-ESCROW-2026-CSR-9842`, and test personas: `nodal.innovation@jharkhand.gov.in`, `pi.water@iitism.ac.in`, `csr.director@tatasteel.com`, `dr.sen.mentor@isro-alumni.res.in`, `citizen.reporter@jharkhand.org` with bcrypt-hashed passwords).
   - Run `npx prisma db seed` (or `npx tsx prisma/seed.ts`) and ensure clean execution and populated database.

2. SECURITY & UTILITY LIBRARIES:
   - Verify or implement `src/lib/totp.ts` (RFC 6238 TOTP generation/verification, QR code data URL generation).
   - Implement `src/lib/rateLimiter.ts` (sliding window rate limiter: 10 req/min per IP).
   - Implement `src/lib/csrf.ts` (CSRF token generation & validation helper).

3. COMPLETE API ROUTES IN `src/app/api/`:
   - `/api/auth/register/route.ts` (tiered registration: citizen phone OTP, university .ac.in, industry pending approval, gov .gov.in/.nic.in)
   - `/api/auth/login/route.ts` (checks credentials, lockout, triggers 2FA or issues `sih_session` HttpOnly cookie)
   - `/api/auth/verify-otp/route.ts` (phone OTP & email OTP)
   - `/api/auth/totp-setup/route.ts` & `/api/auth/totp-verify/route.ts` (Gov 2FA setup & verify)
   - `/api/auth/logout/route.ts` (clears cookie)
   - `/api/auth/me/route.ts` (returns current user session & role)
   - `/api/admin/pending-users/route.ts` & `/api/admin/approve-user/route.ts` (Gov admin approval for Industry)
   - `/api/challenges/route.ts` (GET with query filters, POST for citizen submissions)
   - `/api/challenges/[id]/route.ts` (GET details, PUT updates, DELETE soft-delete)
   - `/api/proposals/route.ts` (GET, POST) and `/api/proposals/[id]/route.ts` (GET, PUT)
   - `/api/funds/route.ts` (GET, POST) and `/api/funds/[id]/route.ts` (GET)
   - `/api/analytics/route.ts` (GET KPI stats, district breakdown, domain distribution)
   - `/api/track/[id]/route.ts` (GET tracking timeline & telemetry)
   - `/api/audit-logs/route.ts` (GET audit logs for Gov)
   - `/api/csrf/route.ts` (GET fresh CSRF token)

4. FRONTEND INTEGRATION & UX:
   - Implement `src/stores/authStore.ts` using Zustand to manage reactive user session state.
   - Implement `src/lib/api-client.ts` (`apiFetch`) passing CSRF tokens and handling 401 session expiration (redirecting to `/login?expired=true`).
   - Implement `src/components/auth/RoleGuard.tsx` in `src/app/dashboard/layout.tsx` (redirecting unauthorized roles to their authorized dashboard with an informative toast).
   - Implement `src/components/ui/Skeletons.tsx`, `EmptyState.tsx`, `NetworkBanner.tsx`.
   - Update `src/app/login/page.tsx` with authentic login flows (OTP modal with console log hint, TOTP verification code input, pending approval notice for industry, account lockout alert).
   - Replace static mock data across all 16 pages (`/`, `/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`, `/challenge/[id]`, `/submit`, `/track`, `/accountability`, `/whatsapp-intake`, `/dashboard/settings`, `/apply/[challengeId]`, `/dashboard/university/proposal/[id]`, `/dashboard/industry/fund/[id]`).

5. BUILD & ACCEPTANCE VERIFICATION:
   - Run `npm run build` in `web` and ensure 0 TypeScript or build errors.
   - Verify `npx prisma db seed` runs cleanly.
   - Verify `grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" src/` returns 0 hardcoded secrets.
   - Document all changes in `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_2\changes.md` and deliver handoff report to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_p2_2\handoff.md`. Include test commands and outputs.
