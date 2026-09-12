# Explorer Fix 1 Investigation Report: Claim Route Concurrency & Atomic Locking

**Milestone**: M1 (Round 8)  
**Agent**: Explorer Fix 1 (`teamwork_preview_explorer_r8_fix_1`)  
**Parent Orchestrator**: `orchestrator_r8` (`573b8730-6748-4db4-89af-0d71738c07b5`)  
**Target File**: `web/src/app/api/handover/[token]/claim/route.ts`  
**Date**: 2026-09-09T10:45:00Z  

---

## 1. Observation

### 1.1 Concurrency Failure Reproduction
When running the concurrency test script `web/tests/test_concurrency_handover.ts`:
- **Command**: `npx tsx tests/test_concurrency_handover.ts`
- **Verbatim Error**:
  ```text
  Firing 2 simultaneous claims with Promise.all...
  thread 'tokio-runtime-worker' panicked at libs\user-facing-errors\src\quaint.rs:167:18:
  internal error: entered unreachable code
  note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
  prisma:error 
  Invalid `tx.handoverToken.update()` invocation in
  A:\Development\Antigravity\SIH26043\web\src\app\api\handover\[token]\claim\route.ts:86:30

    83 }
    84 
    85 // 1. Mark token as claimed
  → 86 await tx.handoverToken.update(
  Transaction API error: Transaction already closed: Could not perform operation.

  [Handover Claim Error]: PrismaClientKnownRequestError: 
  Invalid `tx.handoverToken.update()` invocation in
  A:\Development\Antigravity\SIH26043\web\src\app\api\handover\[token]\claim\route.ts:86:30
  Transaction API error: Transaction already closed: Could not perform operation. {
    code: 'P2028',
    clientVersion: '5.11.0',
    meta: {
      modelName: 'HandoverToken',
      error: 'Transaction already closed: Could not perform operation.'
    }
  }

  Response 1: status=500, body= {
    success: false,
    error: 'Failed to claim account handover due to an internal server error.'
  }
  Response 2: status=500, body= {
    success: false,
    error: 'Failed to claim account handover due to an internal server error.'
  }
  ```

### 1.2 Root Cause Inspection in `web/src/app/api/handover/[token]/claim/route.ts`
At lines 51–132:
```ts
const updatedUser = await prisma.$transaction(async (tx) => {
  const handoverToken = await tx.handoverToken.findUnique({
    where: { token },
    include: { user: true },
  });
  ...
  await tx.handoverToken.update({
    where: { id: handoverToken.id },
    data: { usedAt: new Date() },
  });
  const userResult = await tx.user.update({
    where: { id: handoverToken.userId },
    data: { ... },
  });
  await tx.auditLog.create({ ... });
  return userResult;
});
```
The handler relies on an interactive transaction callback `prisma.$transaction(async (tx) => ...)`. In SQLite (`file:./dev.db`), multiple concurrent interactive transactions attempt to upgrade read locks to write locks simultaneously, causing `SQLITE_BUSY`. Prisma's underlying Rust SQL engine (`quaint`) panics at `quaint.rs:167:18` with `internal error: entered unreachable code`, and Prisma throws error code `P2028` (`Transaction API error: Transaction already closed`). Both HTTP requests receive `HTTP 500`.

### 1.3 Reference Architecture in `web/src/app/api/challenges/[id]/claim/route.ts`
In `web/src/app/api/challenges/[id]/claim/route.ts` (lines 149–195), concurrency mutual exclusion is implemented using a single atomic conditional update:
```ts
const result = await prisma.challenge.updateMany({
  where: {
    id: challengeId,
    nodalStatus: "routed_to_academia",
    claimedAt: null, // Strict atomic lock predicate
  },
  data: {
    claimedById: effectiveUniversityId,
    claimedInstitute: effectiveUniversityName,
    claimedAt: claimTimestamp,
    assignedToId: effectiveUniversityId,
    assignedInstitute: effectiveUniversityName,
    status: "IN_PROGRESS",
  },
});

if (result.count === 1) {
  await prisma.auditLog.create({ ... });
  return NextResponse.json({ success: true, ... }, { status: 200 });
}

return NextResponse.json({ error: "Challenge has already been claimed...", ... }, { status: 409 });
```

### 1.4 Empirical Verification of Atomic `handoverToken.updateMany`
Testing `updateMany` under 2 racers and 10 simultaneous racers in SQLite:
- **2 Racers**: `Results: [{"racer":1,"count":1},{"racer":2,"count":0}]`
- **10 Racers**: `Results summary: racer 1: count=1, racer 2: count=0, racer 3: count=0, racer 4: count=0, racer 5: count=0, racer 6: count=0, racer 7: count=0, racer 8: count=0, racer 9: count=0, racer 10: count=0`
- **5 Consecutive Simulated Claim Rounds**:
  - `Round 1: PASS (200 & 409)`
  - `Round 2: PASS (200 & 409)`
  - `Round 3: PASS (200 & 409)`
  - `Round 4: PASS (200 & 409)`
  - `Round 5: PASS (200 & 409)`
- **Result**: Zero panics, zero P2028 errors, zero 500 responses. Exactly 1 winner (200) and N losers (409).

---

## 2. Logic Chain

1. **Transaction Contention (Observation 1.1, 1.2)**:
   Prisma interactive transactions (`prisma.$transaction(async (tx) => ...)`) are stateful connection sessions held across asynchronous JavaScript event ticks. In SQLite's file-based locking architecture, two concurrent transactions trying to execute `UPDATE` concurrently encounter lock conflicts (`SQLITE_BUSY`), crashing Quaint with `unreachable code` and closing the transaction (`P2028`).
2. **Atomic Single-Statement Execution (Observation 1.3, 1.4)**:
   A single SQL `UPDATE` statement with a conditional predicate (`WHERE id = ? AND usedAt IS NULL AND expiresAt > ?`) is inherently atomic in SQLite autocommit mode. SQLite acquires the write lock, performs the test-and-set operation, updates the row, returns `changes()`, and releases the lock immediately.
3. **Execution Sequencing (Winner vs. Loser)**:
   To ensure clean error status codes and avoid burning tokens:
   - **Phase 1: Pre-flight Verification**:
     1. Retrieve token and predecessor user via `prisma.handoverToken.findUnique({ where: { token }, include: { user: true } })`.
     2. If token does not exist -> return `HTTP 404` (`"Handover invitation token not found."`).
     3. If token was already claimed (`usedAt !== null`) -> return `HTTP 409` (`"This handover invitation has already been claimed."`).
     4. If token expired (`new Date() > expiresAt`) -> return `HTTP 410` (`"This handover invitation has expired. Please request a new invitation from your predecessor."`).
     5. If predecessor account is soft-deleted (`deletedAt !== null`) -> return `HTTP 403` (`"Predecessor account is no longer active."`).
     6. If successor email conflicts with an existing active account -> return `HTTP 400` (`"An active account with this successor email already exists in the system."`).
   - **Phase 2: Atomic Conditional Lock**:
     Execute `prisma.handoverToken.updateMany({ where: { id: handoverToken.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } })`.
   - **Phase 3: Branching**:
     - **Losing Racer (`claimLock.count === 0`)**:
       Another racer won the race condition during the microsecond interval between Phase 1 and Phase 2. The losing racer immediately returns `HTTP 409 Conflict` (`"This handover invitation has already been claimed."`).
     - **Winning Racer (`claimLock.count === 1`)**:
       The winning racer is guaranteed exclusive ownership.
   - **Phase 4: Winner Mutations & Issuance**:
     1. Update user credentials in-place via `prisma.user.update`: updates name, email, passwordHash; resets 2FA (`twoFactorEnabled: false`, `twoFactorSecret: null`); clears lockout (`failedLoginAttempts: 0`, `lockoutUntil: null`); preserves `User.id` and all 10 dependent relational foreign keys.
     2. Insert statutory audit log via `prisma.auditLog.create`.
     3. Generate authenticated JWT session via `signSessionToken`.
     4. Attach `sih_session` HttpOnly cookie and return `HTTP 200` with user details and `redirectUrl: "/dashboard/<role>"`.
   - **Phase 5: Error Compensation**:
     Wrap Phase 4 in a `try / catch`. If `prisma.user.update` or `prisma.auditLog.create` encounters an unexpected error, execute `prisma.handoverToken.updateMany({ where: { id: handoverToken.id, usedAt: { not: null } }, data: { usedAt: null } })` before throwing, ensuring the token is not orphaned in an unclaimable state.

---

## 3. Caveats

1. **Pre-flight Check vs. Atomic Lock**:
   Checking `emailCollision` and `predecessor.deletedAt` before acquiring the lock is optimal because it avoids burning the token or needing compensation if the claim is invalid. The atomic `updateMany` guarantees that even if two valid requests race, only one will ever reach the mutation phase.
2. **Dual-Path Interoperability**:
   `web/src/app/api/handover/[token]/route.ts` imports and re-exports `handleClaimHandover` for its `POST` handler. Modifying `web/src/app/api/handover/[token]/claim/route.ts` automatically fixes both `/api/handover/[token]/claim` and `/api/handover/[token]`.

---

## 4. Conclusion

The claim route concurrency flaw is completely resolved by replacing the interactive `prisma.$transaction(async (tx) => ...)` with an atomic conditional `prisma.handoverToken.updateMany` lock.

### Proposed Code Implementation for Worker M1

Worker M1 should apply the following implementation to `web/src/app/api/handover/[token]/claim/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signSessionToken, attachSessionCookie, SessionPayload } from "@/lib/auth";
import { UserRole, UserStatus } from "@/lib/types";

/**
 * Shared implementation for claiming a handover token.
 * Uses atomic conditional locking (test-and-set via updateMany) to guarantee mutual exclusion
 * under high-concurrency conditions in SQLite without interactive transaction lock contention.
 */
export async function handleClaimHandover(
  req: NextRequest,
  token: string
): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON with successorName and password." },
        { status: 400 }
      );
    }

    const successorName = (body.successorName || body.name || "").toString().trim();
    const password = (body.password || "").toString();
    const confirmPassword = body.confirmPassword ? body.confirmPassword.toString() : null;

    if (!successorName || successorName.length < 2) {
      return NextResponse.json(
        { error: "Successor name is required and must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword !== null && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt cost factor 12 before DB operations
    const newPasswordHash = await hashPassword(password);

    // 1. Initial lookup of token and predecessor user
    const handoverToken = await prisma.handoverToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!handoverToken) {
      return NextResponse.json(
        { success: false, error: "Handover invitation token not found." },
        { status: 404 }
      );
    }

    if (handoverToken.usedAt !== null) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has already been claimed." },
        { status: 409 }
      );
    }

    if (new Date() > handoverToken.expiresAt) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has expired. Please request a new invitation from your predecessor." },
        { status: 410 }
      );
    }

    if (!handoverToken.user || handoverToken.user.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: "Predecessor account is no longer active." },
        { status: 403 }
      );
    }

    // 2. Ensure no conflicting active user exists with the successor email
    const emailCollision = await prisma.user.findFirst({
      where: {
        email: handoverToken.successorEmail,
        id: { not: handoverToken.userId },
      },
    });

    if (emailCollision) {
      return NextResponse.json(
        { success: false, error: "An active account with this successor email already exists in the system." },
        { status: 400 }
      );
    }

    // 3. Strict Atomic Test-and-Set Lock on the HandoverToken
    // Single atomic SQL update statement: eliminates SQLite lock contention & Rust Quaint panic
    const claimLock = await prisma.handoverToken.updateMany({
      where: {
        id: handoverToken.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        usedAt: new Date(),
      },
    });

    // If count === 0: Another concurrent racer claimed it first -> HTTP 409 Conflict
    if (claimLock.count === 0) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has already been claimed." },
        { status: 409 }
      );
    }

    // 4. Guaranteed exclusive winner: Overwrite User credentials & personal identity in-place
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: handoverToken.userId },
        data: {
          name: successorName,
          email: handoverToken.successorEmail,
          passwordHash: newPasswordHash,
          twoFactorEnabled: false, // Reset 2FA to prevent successor lockout
          twoFactorSecret: null,
          failedLoginAttempts: 0,
          lockoutUntil: null,
          emailVerified: new Date(),
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      // 5. Create statutory AuditLog entry
      await prisma.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: "HANDOVER_CLAIMED",
          resource: "User",
          resourceId: updatedUser.id,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          oldState: JSON.stringify({
            predecessorName: handoverToken.user.name,
            predecessorEmail: handoverToken.user.email,
          }),
          newState: JSON.stringify({
            successorName,
            successorEmail: handoverToken.successorEmail,
            claimedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (mutationError: any) {
      // Rollback claim lock if mutation failed unexpectedly to prevent orphaning the token
      await prisma.handoverToken.updateMany({
        where: { id: handoverToken.id, usedAt: { not: null } },
        data: { usedAt: null },
      }).catch(() => {});
      throw mutationError;
    }

    // 6. Generate authenticated JWT session for the successor
    const sessionPayload: SessionPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      name: updatedUser.name,
      role: updatedUser.role as UserRole,
      status: updatedUser.status as UserStatus,
      organization: updatedUser.organization,
      district: updatedUser.district,
    };

    const sessionToken = await signSessionToken(sessionPayload);
    const roleLower = updatedUser.role.toLowerCase();
    const redirectUrl = `/dashboard/${roleLower}`;

    const response = NextResponse.json({
      success: true,
      message: "Account claimed successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      redirectUrl,
    });

    // Attach HttpOnly cookie
    attachSessionCookie(response, sessionToken);

    return response;
  } catch (error: any) {
    console.error("[Handover Claim Error]:", error);

    return NextResponse.json(
      { success: false, error: "Failed to claim account handover due to an internal server error." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/handover/[token]/claim
 * Public endpoint: allows a designated successor to claim an account using their token.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const token = resolvedParams.token;
  return handleClaimHandover(req, token);
}
```

### Reference Artifacts Prepared in Explorer Working Directory
- **Patch file**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_1/claim_route_concurrency.patch`
- **Drop-in replacement**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r8_fix_1/proposed_route.ts`

---

## 5. Verification Method

Once Worker M1 applies the fix, verify using:

1. **Concurrency Verification Script**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npx tsx tests/test_concurrency_handover.ts
   ```
   *Expected Result*:
   - Exactly one response receives `status=200` with `body.success = true`.
   - The other response receives `status=409` with `body.error = "This handover invitation has already been claimed."`.
   - 0 Quaint panics (`quaint.rs:167:18`), 0 Prisma `P2028` errors, 0 `HTTP 500` errors.

2. **Baseline Backend Test Suite**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npx tsx tests/test_handover_backend.ts
   ```
   *Expected Result*: All 14/14 tests pass cleanly with exit code 0.

3. **Adversarial Isolation Stress Suite**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npx tsx tests/test_isolation_handover.ts
   ```
   *Expected Result*: All 5 test categories pass cleanly with exit code 0.

4. **Next.js Production Build**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npm run build
   ```
   *Expected Result*: Exit code 0, 0 TypeScript errors, 44/44 routes generated.
