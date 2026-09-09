# Task Assignment: Worker M1 (Backend Handover Token Generation & DB Schema)

## Identity
- Archetype: teamwork_preview_worker
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_survey_2/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_survey_3/handoff.md`

## Scope & File Ownership
You exclusively own and may edit/create:
- `web/prisma/schema.prisma`
- `web/src/app/api/handover/initiate/route.ts`
- `web/src/app/api/handover/[token]/route.ts`
- `web/src/app/api/handover/[token]/claim/route.ts`
- `web/src/app/api/handover/cancel/route.ts`

## Specific Instructions

### 1. Database Schema (`web/prisma/schema.prisma`)
- Add `model HandoverToken`:
  ```prisma
  model HandoverToken {
    id             String    @id @default(cuid())
    token          String    @unique
    userId         String
    user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    successorEmail String
    expiresAt      DateTime
    usedAt         DateTime?
    createdAt      DateTime  @default(now())

    @@index([userId])
    @@index([token])
  }
  ```
- Add `handoverTokens HandoverToken[]` relation to `model User`.
- In `web/`, run:
  `npx prisma db push`
  `npx prisma generate`

### 2. Initiate Handover API (`web/src/app/api/handover/initiate/route.ts`)
- Use `withAuth` to protect the route (any authenticated user can initiate handover of their account).
- Read body: `{ successorEmail: string }`. Validate email format. Reject if successorEmail equals current user's email.
- Invalidate/delete or mark expired any prior unused handover tokens for this `userId`.
- Generate secure random 64-char token (e.g. `crypto.randomBytes(32).toString("hex")`).
- Set `expiresAt` to 48 hours from now (`new Date(Date.now() + 48 * 60 * 60 * 1000)`).
- Create `HandoverToken` in database.
- Log simulated email dispatch to console with the exact standard banner format:
  ```typescript
  console.log(`\n================================================================================`);
  console.log(`📧 [MOCK EMAIL DISPATCH] ACCOUNT HANDOVER INVITATION`);
  console.log(`   To: ${successorEmail}`);
  console.log(`   From: ${user.name} <${user.email}> (${user.role} - ${user.organization || "Gov"})`);
  console.log(`   Handover Claim Link: ${claimLink}`);
  console.log(`   Token Expiration: ${expiresAt.toISOString()} (48 Hours)`);
  console.log(`================================================================================\n`);
  ```
- Write audit log: `logAuditEvent(session.userId, "HANDOVER_INITIATED", "User", session.userId, req, null, { successorEmail, expiresAt })`.
- Return `{ success: true, message: "Handover invitation initiated successfully.", token, expiresAt, successorEmail }`.

### 3. Validate Handover Token API (`web/src/app/api/handover/[token]/route.ts`)
- Public GET endpoint: `export async function GET(req: NextRequest, context: { params: Promise<{ token: string }> })`.
- Query `HandoverToken` where `token = params.token`, include `user: true`.
- Validate:
  - Token exists.
  - `usedAt` is null.
  - `expiresAt > new Date()`.
  - User exists and is not deleted.
- If valid, return 200 OK:
  ```json
  {
    "valid": true,
    "successorEmail": handoverToken.successorEmail,
    "predecessor": {
      "name": handoverToken.user.name,
      "designation": handoverToken.user.designation,
      "organization": handoverToken.user.organization,
      "role": handoverToken.user.role,
      "district": handoverToken.user.district
    },
    "expiresAt": handoverToken.expiresAt
  }
  ```
- If invalid/expired/used, return 400 or 404 with `{ valid: false, error: "Handover invitation is invalid, has expired, or has already been claimed." }`.
- Also implement `POST` handler in this file or forward to claim so both `/api/handover/[token]` and `/api/handover/[token]/claim` work.

### 4. Claim Handover API (`web/src/app/api/handover/[token]/claim/route.ts`)
- Public POST endpoint.
- Accept `{ successorName: string, password: string }`.
- Validate token validity, expiry, and `usedAt === null`.
- Validate password meets requirements (min 8 chars, etc.) and successorName is non-empty.
- Hash new password using `hashPassword` (`bcryptjs` salt 12).
- Execute `prisma.$transaction`:
  1. Update `User`:
     - `email = handoverToken.successorEmail`
     - `name = successorName.trim()`
     - `passwordHash = newPasswordHash`
     - `twoFactorEnabled = false` (CRITICAL: prevents 2FA lockout)
     - `twoFactorSecret = null`
     - `failedLoginAttempts = 0`
     - `lockoutUntil = null`
     - `emailVerified = new Date()`
     - `updatedAt = new Date()`
     - (Note: `User.id`, `role`, `organization`, `designation`, `district`, `bio`, and all relational foreign keys like challenges, proposals, audit logs, chat messages REMAIN 100% PRESERVED!)
  2. Update `HandoverToken`:
     - `usedAt = new Date()`
  3. Create `AuditLog`:
     - `userId = user.id`, `action = "HANDOVER_CLAIMED"`, `resource = "User"`, `resourceId = user.id`, `newState = JSON.stringify({ successorName, successorEmail })`.
- Issue fresh session JWT cookie via `signSessionToken` and set `sih_session` cookie on response!
- Return `{ success: true, message: "Account claimed successfully.", user: { id, name, email, role }, redirectUrl: "/dashboard/" + role.toLowerCase() }`.

### 5. Cancel Handover API (`web/src/app/api/handover/cancel/route.ts`)
- Protected via `withAuth`.
- Deletes or sets `expiresAt = new Date()` on all pending unused `HandoverToken` records for `session.userId`.
- Return `{ success: true, message: "Pending handover invitation cancelled." }`.

### Verification Required
1. Run `npx prisma db push` and `npx prisma generate` without errors.
2. Run a small node script or curl test verifying token generation, validation, and claim.
3. Run `npm run build` in `web/` to ensure 0 TypeScript or compile errors.
4. Document all commands, tests, and outputs in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1/handoff.md`.
5. Message parent orchestrator when complete.
