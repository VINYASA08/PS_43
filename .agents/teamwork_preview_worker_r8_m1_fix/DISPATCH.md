# Task Assignment: Worker M1 Fix (Concurrency & Security Remediation)

## Identity
- Archetype: teamwork_preview_worker
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1_fix
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_1/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_1/proposed_route.ts`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_2/handoff.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_3/handoff.md`

## Scope & File Ownership
You exclusively own:
- `web/src/app/api/handover/[token]/claim/route.ts`
- `web/src/app/api/handover/initiate/route.ts`
- `web/src/app/api/handover/cancel/route.ts`
- `web/tests/test_concurrency_handover.ts`
- `web/tests/test_handover_backend.ts`

## Specific Remediation Instructions

### 1. Fix Concurrency Lock Contention in Claim Route (`web/src/app/api/handover/[token]/claim/route.ts`)
- Replace the interactive `prisma.$transaction(async (tx) => ...)` with the atomic test-and-set conditional update pattern detailed by Explorer Fix 1:
  1. Validate token existence, expiration, and initial non-claimed status.
  2. Validate successorName and password.
  3. Validate successorEmail collision.
  4. Perform atomic conditional lock:
     ```typescript
     const updateResult = await prisma.handoverToken.updateMany({
       where: {
         id: handoverToken.id,
         usedAt: null,
         expiresAt: { gt: new Date() },
       },
       data: {
         usedAt: new Date(),
       },
     });
     if (updateResult.count === 0) {
       return NextResponse.json(
         { valid: false, error: "This handover invitation has already been claimed or has expired." },
         { status: 409 }
       );
     }
     ```
  5. The winning racer updates `User` and creates `AuditLog`:
     ```typescript
     const updatedUser = await prisma.user.update({
       where: { id: handoverToken.userId },
       data: {
         name: successorName.trim(),
         email: handoverToken.successorEmail,
         passwordHash: newPasswordHash,
         twoFactorEnabled: false,
         twoFactorSecret: null,
         failedLoginAttempts: 0,
         lockoutUntil: null,
         emailVerified: new Date(),
         updatedAt: new Date(),
       },
     });
     await prisma.auditLog.create({
       data: {
         userId: updatedUser.id,
         action: "HANDOVER_CLAIMED",
         resource: "User",
         resourceId: updatedUser.id,
         newState: JSON.stringify({
           successorName: updatedUser.name,
           successorEmail: updatedUser.email,
         }),
       },
     });
     ```
  6. Sign fresh session token and attach `sih_session` cookie to the 200 OK response.

### 2. Fix Session Validation & Initiate Race Condition in `initiate/route.ts` & `cancel/route.ts`
- In `initiate/route.ts`:
  - Check that `user.email === session.email`. If the user's email in DB has changed (e.g. account already transferred to successor), reject with HTTP 403 / 401 Forbidden so old predecessor sessions cannot initiate a new handover.
  - Serialize initiate per userId or clean up prior unused tokens atomically without interactive transaction lock contention.
- In `cancel/route.ts`:
  - Verify `user.email === session.email`.

### 3. Upgrade Test Suite
- Upgrade `web/tests/test_concurrency_handover.ts` with strict assertions (status 200 for winner, 409 for loser, valid cookie on winner).
- Integrate concurrency test into `web/tests/test_handover_backend.ts`.
- Run:
  `npx tsx tests/test_concurrency_handover.ts`
  `npx tsx tests/test_handover_backend.ts`
  `npm run build`
- Verify 100% tests pass and compilation succeeds with 0 errors.
- Document results in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1_fix/handoff.md`.
- Message parent orchestrator when complete.

## 2026-09-09T10:47:16Z
<USER_REQUEST>
You are Worker M1 Fix for Round 8.
Your working directory is `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1_fix`.
Read your task instructions in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1_fix/DISPATCH.md` and `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md`.
Implement the atomic test-and-set locking in `claim/route.ts`, stale session check in `initiate/route.ts` & `cancel/route.ts`, upgrade `test_concurrency_handover.ts`, and verify all tests and `npm run build` pass cleanly.
Write your completion report to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1_fix/handoff.md` and notify parent (orchestrator_r8) via send_message.
</USER_REQUEST>
