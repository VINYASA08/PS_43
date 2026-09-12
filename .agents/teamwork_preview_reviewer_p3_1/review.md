# Backend, Database & Security Review Report

**Target**: Jharkhand Societal Innovation Portal (`web`)  
**Reviewer**: Reviewer 1 (Backend, Database & Security)  
**Date**: 2026-09-04  
**Verdict**: **FAIL / REQUEST_CHANGES**

---

## 1. Executive Summary

An exhaustive independent quality and adversarial security review of the Jharkhand Societal Innovation Portal backend, database architecture, and security defenses was conducted. 

While the majority of the backend architecture exhibits high engineering craftsmanship (100% parameterized Prisma queries, strong OWASP security response headers, strict Zod schemas, RFC 6238 TOTP, and account lockout policies), **the review issues a verdict of FAIL / REQUEST_CHANGES due to a blocking Next.js build compilation failure and security gaps in CSRF coverage and error handling**.

### Summary of Verdict Dimensions
| Dimension | Status | Notes |
|---|---|---|
| **Prisma Schema & Relations** | **PASS** | All 5 models (User, Challenge, Proposal, FundingCommitment, AuditLog) present with appropriate relations and indexes. |
| **Soft Delete Handling** | **PASS with Caveat** | `$extends` intercepts `findMany`, `findFirst`, `delete`, `deleteMany`. Does not intercept `findUnique`. |
| **SQL Injection Prevention** | **PASS** | 100% parameterized queries via Prisma Client; zero raw SQL. |
| **Security Headers** | **PASS** | CSP, X-Frame-Options: DENY, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy configured in `next.config.ts`. |
| **Zod Request Validation** | **PASS** | Robust schemas in `src/lib/validation.ts` with strict email domain refinement (`.ac.in`, `.gov.in`, corporate). |
| **Rate Limiting & Lockout** | **PASS** | Sliding-window 10 req/min and 5-attempt / 30-min account lockout. |
| **Secret Scanning** | **PASS** | No hardcoded production keys; fail-closed guards in `auth.ts` and `csrf.ts`. `.env.example` provided. |
| **CSRF Protection** | **REQUEST_CHANGES** | Double-submit HMAC token implemented, but missing on `PUT /api/users/profile` and `POST /api/challenges/[id]/apply`, plus unhandled buffer length mismatch crash in `verifyCsrfToken`. |
| **Next.js Production Build** | **FAIL** | `npm run build` fails with exit code 1 due to `TS2344` in `/api/challenges/[id]/apply/route.ts` and Turbopack/PWA manifest contention. |

---

## 2. Detailed Findings

### [Critical] Finding 1: Next.js Route Context Type Mismatch Breaks Production Build
- **Location**: `src/app/api/challenges/[id]/apply/route.ts:8`
- **Issue**: The route handler declares context as:
  ```typescript
  export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
  )
  ```
  In Next.js 15+ / 16, the internal route type generation validates handlers against `ParamCheck<RouteContext>` which strictly expects `params: Promise<{ id: string }>`.
- **Impact**: `npm run build` fails with:
  ```
  .next/types/app/api/challenges/[id]/apply/route.ts(172,7): error TS2344: Type '{ __tag__: "POST"; __param_position__: "second"; __param_type__: { params: Promise<{ id: string; }> | { id: string; }; }; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.
    Type 'Promise<{ id: string; }> | { id: string; }' is not assignable to type 'Promise<any>'.
  ```
- **Required Fix**: Change signature to:
  ```typescript
  export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  )
  ```

---

### [Critical] Finding 2: Turbopack Build Conflict with `@ducanh2912/next-pwa`
- **Location**: `web/next.config.ts:14` & `web/package.json:7`
- **Issue**: `next.config.ts` wraps the Next configuration with `withPWA` from `@ducanh2912/next-pwa` while `nextConfig` specifies `turbopack: {}`. Next.js 16 defaults to Turbopack for `next build`. `@ducanh2912/next-pwa` relies on Webpack compilation hooks and manifest files. When built via `next build`, it throws:
  ```
  Error: Cannot find module '.../web/.next/server/middleware-manifest.json'
  Error: ENOENT: no such file or directory, open '.../.next/server/pages-manifest.json'
  ```
- **Impact**: Default `npm run build` fails completely unless Webpack is explicitly targeted or PWA is configured for Turbopack.
- **Required Fix**: Update `package.json` build script to `"build": "next build --webpack"` or configure `next-pwa` to disable during Turbopack builds.

---

### [Major] Finding 3: Missing CSRF Validation on State-Changing Endpoints
- **Location**:
  1. `src/app/api/users/profile/route.ts:33` (`PUT` handler)
  2. `src/app/api/challenges/[id]/apply/route.ts:6` (`POST` handler)
- **Issue**: While `/api/challenges` (POST/PUT/DELETE), `/api/proposals` (POST/PUT), `/api/funds` (POST), and `/api/admin/approve-user` (POST) strictly enforce `validateCsrfRequest(req)`, `PUT /api/users/profile` and `POST /api/challenges/[id]/apply` omit this validation.
- **Impact**: An authenticated user could have their profile details (name, district, phone, bio) updated via cross-site attacks if CORS or sameSite policies are bypassed.
- **Required Fix**: Insert `const csrf = validateCsrfRequest(req); if (!csrf.valid) return NextResponse.json({ error: csrf.reason }, { status: 403 });` at the top of these handlers.

---

### [Major] Finding 4: Unhandled Exception in `crypto.timingSafeEqual` in `src/lib/csrf.ts`
- **Location**: `src/lib/csrf.ts:56-59`
- **Issue**:
  ```typescript
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
  ```
  If an incoming `X-CSRF-Token` header contains a signature whose hex-decoded byte length does not equal exactly 32 bytes (the length of `expectedSignature`), Node.js `crypto.timingSafeEqual` throws an unhandled `RangeError: Input buffers must have the same byte length`.
- **Impact**: Malformed or truncated CSRF tokens cause a 500 Internal Server Error crash rather than gracefully rejecting with `false` / 403.
- **Required Fix**: Add a length check before `timingSafeEqual`:
  ```typescript
  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
  ```

---

### [Minor] Finding 5: Artificial Telemetry Metric Facade in Analytics API
- **Location**: `src/app/api/analytics/route.ts:59-64`
- **Issue**: 
  ```typescript
  totalSubmissions: Math.max(1248, totalChallenges * 156),
  resolvedCount: Math.max(342, resolvedChallenges * 57),
  prototypesActive: Math.max(156, totalProposals * 39),
  totalEscrowCommitted: Math.max(850000, totalEscrow),
  ```
  The endpoint calculates real database counts into `kpis.raw`, but top-level KPI metrics return simulated inflated multipliers for presentation.
- **Impact**: While understandable for demo seeding, this creates discrepancies between aggregate counters and the underlying Prisma database records.
- **Suggestion**: Use genuine DB aggregates directly or clearly isolate simulated metrics into a separate `simulation` block.

---

### [Minor] Finding 6: `.env.example` Gitignored by Pattern
- **Location**: `web/.gitignore:34` (`.env*`)
- **Issue**: The `.env*` wildcard in `.gitignore` causes `.env.example` to be gitignored.
- **Impact**: Collaborators cloning the repository will not see `.env.example` unless explicitly forced.
- **Required Fix**: Add `!.env.example` in `web/.gitignore`.

---

## 3. Verified Security & Database Claims

### Database & Prisma Verification
1. **Models Verified**:
   - `User`: id, email (unique), phone (unique), passwordHash, role, status, twoFactorEnabled, failedLoginAttempts, lockoutUntil, deletedAt.
   - `Challenge`: id, publicTrackingId (unique), title, description, domain, district, urgency, status, reportedById, assignedToId, evidence, citizenVerified, escalationLevel, slaDeadline, deletedAt.
   - `Proposal`: id, proposalRef (unique), challengeId, submittedById, budget, timelineMonths, stage, status, deletedAt.
   - `FundingCommitment`: id, escrowRef (unique), proposalId, industryUserId, corporateName, amount, type, status, tranches, mouSigned, deletedAt.
   - `AuditLog`: id, userId, action, resource, resourceId, challengeId, oldState, newState, ipAddress, userAgent, createdAt.
2. **Soft Delete Extensions**:
   - Verified that `user`, `challenge`, `proposal`, `fundingCommitment` extend `findMany` and `findFirst` to automatically filter `deletedAt: null`.
   - Verified that `delete` and `deleteMany` are intercepted and rewritten to `update({ data: { deletedAt: new Date() } })`.
   - *Caveat*: Prisma `$extends` query extensions do not hook into `findUnique`. Calls to `findUnique` will not filter `deletedAt` unless `findFirst` or explicit `deletedAt: null` is used.
3. **Indexes**:
   - `User`: `@@index([role, status])`, `@@index([district])`, `@@index([deletedAt])`.
   - `Challenge`: `@@index([status, domain])`, `@@index([district, urgency])`, `@@index([deletedAt])`, `@@index([publicTrackingId])`.
   - `Proposal`: `@@index([challengeId, status])`, `@@index([submittedById])`, `@@index([deletedAt])`.
   - `FundingCommitment`: `@@index([proposalId, status])`, `@@index([industryUserId])`, `@@index([deletedAt])`.
   - `AuditLog`: `@@index([resource, resourceId])`, `@@index([userId, action])`, `@@index([challengeId])`, `@@index([createdAt])`.
4. **Cascades**:
   - Proposal has `onDelete: Cascade` to Challenge.
   - FundingCommitment has `onDelete: Cascade` to Proposal.
   - AuditLog has `onDelete: SetNull` on User and Challenge relations.

### Security Hardening (OWASP Top 10) Verification
1. **SQL Injection**: 0 raw SQL queries exist in `src/`. 100% of database queries use Prisma's parameterized query builder.
2. **Security Headers**:
   - `Content-Security-Policy`: `"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"`
   - `X-Frame-Options`: `"DENY"`
   - `X-Content-Type-Options`: `"nosniff"`
   - `Strict-Transport-Security`: `"max-age=63072000; includeSubDomains; preload"`
   - `Referrer-Policy`: `"strict-origin-when-cross-origin"`
   - `Permissions-Policy`: `"camera=(), microphone=(), geolocation=()"`
3. **Double-Submit HMAC CSRF**:
   - Token structure: `<randomHex>.<timestamp>.<hmacSignature>`.
   - Cookie `sih_csrf` set with `sameSite: "lax"`, validated against `X-CSRF-Token` header.
4. **Zod Validation**:
   - All input data validated via strict Zod schemas in `src/lib/validation.ts`.
   - University registrations require `.ac.in`.
   - Government registrations require `.gov.in` or `.nic.in`.
   - Industry registrations reject free webmail domains.
5. **Rate Limiting & Brute Force Prevention**:
   - Sliding-window in-memory rate limiter configured for 10 req/min.
   - Account lockout enforces 5 failed attempts -> 30-minute lockout with countdown.
6. **Authentication & Session Tokens**:
   - Jose `SignJWT` HS256 with 7-day expiration.
   - Cookies set with `httpOnly: true`, `sameSite: "lax"`, `secure: production`.
   - TOTP 2FA implemented with standard RFC 6238 and QR code provisioning.

---

## 4. Build & Compilation Verification Results

1. **TypeScript Standalone Check**:
   - Command: `node ./node_modules/typescript/bin/tsc --noEmit`
   - Result: **PASS** (Exit code 0, zero errors across entire codebase).
2. **Next.js Production Build**:
   - Command: `npm run build`
   - Result: **FAIL** (Exit code 1).
   - Error trace: `TS2344` route context type error in `src/app/api/challenges/[id]/apply/route.ts` and Turbopack manifest crash with `@ducanh2912/next-pwa`.

---

## 5. Required Action Items for Approval

1. Fix `src/app/api/challenges/[id]/apply/route.ts` line 8 signature to `context: { params: Promise<{ id: string }> }`.
2. Update `package.json` build script to `"build": "next build --webpack"` to ensure webpack-based `@ducanh2912/next-pwa` builds cleanly.
3. Add `validateCsrfRequest(req)` to `PUT /api/users/profile` and `POST /api/challenges/[id]/apply`.
4. Fix `crypto.timingSafeEqual` buffer length check in `src/lib/csrf.ts`.
5. Add `!.env.example` to `web/.gitignore`.
