# Handover Report: Database Schema, Authentication & Account Handover Architecture

**Agent**: Explorer 2 (Round 8 Survey)  
**Target Milestone**: Round 8 Account Handover Portal  
**Date**: 2026-09-09T09:55:00Z  

---

## 1. Observation

### 1.1 Database Schema & User Model (`web/prisma/schema.prisma`)
- **Database Provider**: SQLite (`provider = "sqlite"`, `url = env("DATABASE_URL")` with `DATABASE_URL="file:./dev.db"`).
- **User Model (`User`, lines 15–60)**:
  - Primary Key: `id String @id @default(cuid())`.
  - Core Identifiers & Credentials:
    - `email String? @unique`
    - `phone String? @unique`
    - `passwordHash String`
    - `role String @default("CITIZEN")` (Domain roles: `GOV`, `UNIVERSITY`, `INDUSTRY`, `CITIZEN`, `EXPERT`)
    - `status String @default("ACTIVE")` (`ACTIVE`, `PENDING`, `LOCKED`, `SUSPENDED`)
  - Profile Attributes:
    - `name String`, `organization String?`, `designation String?`, `district String?`, `bio String?`, `profileUrl String?`
  - Security & Lockout Fields:
    - `emailVerified DateTime?`, `phoneVerified DateTime?`
    - `twoFactorEnabled Boolean @default(false)`, `twoFactorSecret String?`
    - `failedLoginAttempts Int @default(0)`, `lockoutUntil DateTime?`
  - Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`.
- **Relational Integrity Across Dependent Models**:
  All dependent models link back to `User` strictly via `User.id`:
  1. `Challenge.reportedById` -> `User.reportedChallenges` (`schema.prisma:81–82`)
  2. `Challenge.assignedToId` -> `User.assignedChallenges` (`schema.prisma:83–84`)
  3. `Challenge.claimedById` -> `User.claimedChallenges` (`schema.prisma:105–106`)
  4. `Challenge.nodalOfficerId` -> `User.nodalReviewedChallenges` (`schema.prisma:109–110`)
  5. `Proposal.submittedById` -> `User.submittedProposals` (`schema.prisma:140–141`)
  6. `FundingCommitment.industryUserId` -> `User.fundingCommitments` (`schema.prisma:183–184`)
  7. `AuditLog.userId` -> `User.auditLogs` (`schema.prisma:210–211`)
  8. `ChatMessage.senderId` -> `User.sentMessages` (`schema.prisma:234–235`)
  9. `MicroTask.createdById` -> `User.createdMicroTasks` (`schema.prisma:259–260`)
  10. `MicroTask.assignedToId` -> `User.assignedMicroTasks` (`schema.prisma:262–263`)

### 1.2 Authentication & Credential Management (`web/src/lib/auth.ts`)
- **Password Hashing**:
  - Implementation uses `bcryptjs` with `BCRYPT_SALT_ROUNDS = 12` (`src/lib/auth.ts:8`).
  - Hashing function:
    ```typescript
    export async function hashPassword(password: string): Promise<string> {
      return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }
    ```
  - Password verification:
    ```typescript
    export async function verifyPassword(password: string, hash: string): Promise<boolean> {
      return bcrypt.compare(password, hash);
    }
    ```
- **Session Tokens & Cookies**:
  - JWT generation: `signSessionToken(payload: SessionPayload)` uses `jose.SignJWT`, signed with HS256 (`src/lib/auth.ts:50–57`), expiration `"7d"`.
  - Cookie configuration (`src/lib/auth.ts:9, 132–142`):
    - Cookie name: `"sih_session"`
    - Options: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: 7 * 24 * 60 * 60` (7 days).
  - Session payload interface (`src/lib/auth.ts:25–34`):
    ```typescript
    export interface SessionPayload {
      userId: string;
      email?: string | null;
      phone?: string | null;
      name: string;
      role: UserRole;
      status: UserStatus;
      organization?: string | null;
      district?: string | null;
    }
    ```
- **Account Lockout Management**:
  - 5 failed consecutive attempts trigger a 30-minute lockout (`LOCKOUT_DURATION_MS = 30 * 60 * 1000`, `src/lib/auth.ts:11–12`).
  - Handled via `recordFailedLogin(userId)` and `resetFailedLogins(userId)` (`src/lib/auth.ts:174–213`).

### 1.3 Authorization Middleware & Audit Logging (`web/src/lib/rbac.ts`)
- `withAuth(handler, allowedRoles?)` wraps Next.js App Router handlers, authenticates session via `getSession(req)`, and blocks inactive/unauthorized users (`src/lib/rbac.ts:23–74`).
- `logAuditEvent(userId, action, resource, resourceId, req, oldState, newState, challengeId)` creates immutable audit entries in `AuditLog` (`src/lib/rbac.ts:143–170`).

### 1.4 Existing Profile & Settings Architecture
- **Profile Updates (`web/src/app/api/users/profile/route.ts:34–80`)**:
  - Authenticated PUT route updates `name`, `organization`, `designation`, `district`, `bio`, `phone` via `prisma.user.update({ where: { id: session.userId } })` and logs `USER_PROFILE_UPDATED`.
- **Settings UI (`web/src/app/dashboard/settings/page.tsx:26–348`)**:
  - Currently contains tabs for Profile Details, Security (TOTP setup, active sessions), Notifications, and API Access.
  - Currently does NOT have an "Account Handover" section.

### 1.5 Mock Email Dispatch Patterns (`web/src/lib/ai-matching.ts:146–162`)
- The project convention for simulated email delivery outputs formatted banner logs to `console.log`:
  ```typescript
  console.log(`\n================================================================================`);
  console.log(`📧 [MOCK EMAIL DISPATCH] ...`);
  console.log(`================================================================================\n`);
  ```

---

## 2. Logic Chain

1. **Requirement R1 & R2 Analysis**: The portal requires that users leaving their position can transfer their account (including all history, data, and reports) to a designated successor by entering the successor's email in `/dashboard/settings`.
2. **Preservation of Account Identity & History**:
   - Because all 10 relational entities in the database (proposals, reported challenges, claimed challenges, nodal reviews, micro-tasks, messages, commitments, and audit logs) reference `User.id` as their foreign key (`reportedById`, `submittedById`, `nodalOfficerId`, etc.), preserving the existing `User.id` ensures **100% of historical data, jurisdiction, and reports remain attached without any manual data migration or re-linking**.
   - Overwriting `name`, `email`, and `passwordHash` in-place on the existing `User` record transfers complete operational control to the successor while retaining the exact same primary key (`id`), role, organization, and district.
3. **Database Schema Enhancement (`HandoverToken` Model)**:
   - Handover invitations must be cryptographically unguessable, time-bounded, single-use, and verifiable.
   - Creating a dedicated Prisma model `HandoverToken` with fields:
     - `id String @id @default(cuid())`
     - `token String @unique` (64-character hex string generated via `crypto.randomBytes(32).toString("hex")`)
     - `userId String` (foreign key to `User(id)` with `onDelete: Cascade`)
     - `successorEmail String` (the invited successor's target email)
     - `expiresAt DateTime` (e.g. 48 hours validity)
     - `usedAt DateTime?` (null when pending, populated upon claim to prevent replay)
     - `createdAt DateTime @default(now())`
   - In `User` model, add relation `handoverTokens HandoverToken[]`.
4. **Security & State Transition Logic**:
   - **Pre-invite Validation**: Check that `successorEmail` is not already used by another active account in `User` (to prevent duplicate `@unique` email collision on update). Also ensure successor email is not identical to current user's email.
   - **Invalidate Stale Tokens**: When generating a new token for a user, invalidate any existing unused tokens for that `userId` to prevent confusion or multiple valid invite links.
   - **Credential Overwrite**:
     - Hash new password via `await hashPassword(newPassword)`.
     - Update `User`:
       - `name = successorName`
       - `email = successorEmail`
       - `passwordHash = newPasswordHash`
       - `emailVerified = new Date()`
       - `status = "ACTIVE"`
       - `failedLoginAttempts = 0`
       - `lockoutUntil = null`
       - `twoFactorEnabled = false`, `twoFactorSecret = null` (essential: prevents the predecessor's 2FA authenticator app from locking out the successor).
       - Optional `phone`: either clear (`phone = null`) or update if provided by successor, avoiding sending OTPs to predecessor's phone.
     - Mark token as claimed: `usedAt = new Date()`.
     - Log `ACCOUNT_HANDOVER_COMPLETED` to `AuditLog`.
5. **Successor Claim & Session Issuance**:
   - Upon claiming at `/handover/[token]`, sign a fresh JWT session token via `signSessionToken(sessionPayload)` and attach cookie via `attachSessionCookie(response, token)`.
   - Redirect successor directly to their role-specific dashboard (`/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`, etc.).
   - Subsequent manual logins with successor email and new password will work identically through `/api/auth/login`.

---

## 3. Caveats

1. **Email Uniqueness Constraint**: SQLite enforces `@unique` on `User.email`. If the successor's email is already registered to another user (e.g. a citizen or student), updating `User.email` will throw a Prisma P2002 error. Mitigation: Both the invitation endpoint and the claim endpoint must explicitly verify that `successorEmail` does not conflict with an existing user.
2. **Predecessor Two-Factor Authentication**: Predecessors in government or university roles may have active TOTP 2FA enabled (`twoFactorEnabled: true`). If 2FA is not reset during the handover transaction, the successor will be prompted for a TOTP code they do not possess. Mitigation: Handover claim logic MUST explicitly reset `twoFactorEnabled: false` and `twoFactorSecret: null`.
3. **Predecessor Active Sessions**: Existing JWT sessions are signed with a 7-day expiration. When an account is transferred, the predecessor's browser may still hold a valid JWT token until expiration or logout. In high-assurance environments, adding a token revocation or checking user updated timestamp/version in `withAuth` is recommended.
4. **Phone Login Conflict**: If predecessor had phone authentication enabled, keeping the old phone number could lead to accidental SMS/WhatsApp OTP dispatches. Phone should be reset or updated by successor.
5. **Prisma Generation Required**: Modifying `prisma/schema.prisma` requires running `npx prisma db push` or `npx prisma generate` to refresh the Prisma Client types.

---

## 4. Conclusion

The existing architecture in `SIH26043/web` provides all foundational building blocks needed for a secure, continuous account handover system:
- **`prisma/schema.prisma`**: All 10 entity relationships cleanly reference `User.id`. Adding a `HandoverToken` model preserves the entire database graph without altering foreign keys or historical attribution.
- **`src/lib/auth.ts`**: Password hashing (`bcryptjs` cost 12), JWT creation (`jose`), and cookie management (`sih_session`) can be leveraged directly for token generation, password overwriting, and successor session creation.
- **Recommended Implementation Blueprint**:
  1. **Schema**: Add `model HandoverToken` and `handoverTokens HandoverToken[]` to `prisma/schema.prisma`.
  2. **API Routes**:
     - `POST /api/handover/invite`: Authenticated endpoint generating 64-char crypto token, expiring in 48h, logging mock email to console, logging audit event.
     - `GET /api/handover/[token]`: Public endpoint validating token, checking expiration/usage, and returning public predecessor details (Name, Role, Organization, District).
     - `POST /api/handover/[token]/claim`: Public endpoint updating `User` in-place, hashing password, resetting 2FA and lockout, marking token `usedAt`, issuing fresh session cookie.
  3. **UI Components**:
     - Add "Account Handover" tab in `/dashboard/settings/page.tsx` with email input, send invite button, and copy link action.
     - Build public claim page at `/handover/[token]/page.tsx` with predecessor context card and credential setup form.

---

## 5. Verification Method

To independently verify this architecture and the resulting implementation:

1. **Schema Compilation & DB Synchronization**:
   ```bash
   cd a:/Development/Antigravity/SIH26043/web
   npx prisma db push
   npx prisma generate
   ```
   *Expected*: Zero schema syntax errors; SQLite `dev.db` creates the `HandoverToken` table and updates `User` foreign keys.

2. **Full End-to-End Programmatic Test**:
   Execute automated test simulating user A generating handover token, user B redeeming it, and user B logging in:
   ```bash
   cd a:/Development/Antigravity/SIH26043/web
   npx tsx tests/test_account_handover.ts
   ```
   *Verification Assertions*:
   - Handover invitation generates token, records in `HandoverToken`, logs mock email to console.
   - Claim with token updates `User.email`, `User.name`, and `User.passwordHash` while asserting `User.id === originalUserId`.
   - All predecessor challenges (`reportedChallenges`, `nodalReviewedChallenges`) remain queryable under `User.id`.
   - Replay claim with the same token returns HTTP 410 / error.
   - Predecessor old credentials return HTTP 401.
   - Successor new credentials return HTTP 200 and successful session.

3. **Production Web Build**:
   ```bash
   cd a:/Development/Antigravity/SIH26043/web
   npm run build
   ```
   *Expected*: Zero TypeScript errors, zero routing errors, clean compilation of `/dashboard/settings` and `/handover/[token]`.

4. **Invalidation Conditions**:
   - If `User.id` is regenerated or changed during handover (violates history retention).
   - If predecessor 2FA locks out the successor on subsequent login.
   - If token can be redeemed more than once (replay vulnerability).
