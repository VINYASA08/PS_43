# Progress — Worker 1 (Near-Production Transformation)

Last visited: 2026-09-04T14:13:30Z

## Status
Initializing implementation.

## Checklist
- [ ] 1. Dependencies & Environment
  - [ ] Install packages: `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`, `jose`, `qrcode`, `@types/qrcode`, `zod`, `tsx`
  - [ ] Create `.env` and `.env.example`
  - [ ] Configure HTTP security headers in `next.config.ts`
- [ ] 2. Database & Prisma Data Layer
  - [ ] Create `prisma/schema.prisma` with User, Challenge, Proposal, FundingCommitment, AuditLog
  - [ ] Create `src/lib/prisma.ts` with singleton and `$extends` soft-delete
  - [ ] Run `npx prisma generate` and `npx prisma db push`
  - [ ] Create `prisma/seed.ts` with comprehensive seed data matching existing mock IDs and personas
  - [ ] Run seed script and verify database contents
- [ ] 3. Security & Authentication Core
  - [ ] `src/lib/auth.ts`: bcrypt (cost >= 12), JWT signing/verification with jose, cookie handling, account lockout
  - [ ] `src/lib/totp.ts`: RFC 6238 TOTP generation & verification, QR code data URL
  - [ ] `src/lib/rateLimiter.ts`: Sliding-window IP rate limiting (10 req/min)
  - [ ] `src/lib/csrf.ts`: CSRF token generation & validation
  - [ ] `src/lib/validation.ts`: Zod schemas for all input validations
  - [ ] `src/lib/withAuth.ts`: Backend RBAC route wrapper with AuditLog recording
- [ ] 4. API Routes
  - [ ] Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/totp-setup`, `/api/auth/totp-verify`, `/api/auth/logout`, `/api/auth/me`
  - [ ] Admin: `/api/admin/pending-users`, `/api/admin/approve-user`
  - [ ] Core domain: `/api/challenges` (GET, POST), `/api/challenges/[id]` (GET, PUT, DELETE)
  - [ ] Proposals: `/api/proposals` (GET, POST), `/api/proposals/[id]` (GET, PUT)
  - [ ] Funds: `/api/funds` (GET, POST), `/api/funds/[id]` (GET)
  - [ ] Analytics & Tracking: `/api/analytics`, `/api/track/[id]`, `/api/audit-logs`, `/api/csrf`
- [ ] 5. Frontend Integration & UX
  - [ ] `src/stores/authStore.ts` (Zustand session state)
  - [ ] `src/lib/api-client.ts` (`apiFetch` with CSRF & 401 handling)
  - [ ] `src/components/auth/RoleGuard.tsx` in `src/app/dashboard/layout.tsx`
  - [ ] `src/components/ui/Skeletons.tsx`, `EmptyState.tsx`, `NetworkBanner.tsx`
  - [ ] Update `src/app/login/page.tsx` with authentic login flows
  - [ ] Replace static mock data across all 16 pages
- [ ] 6. Build, Verification & Handoff
  - [ ] Run `npm run build` with 0 errors
  - [ ] Verify test flows and write `changes.md` and `handoff.md`
