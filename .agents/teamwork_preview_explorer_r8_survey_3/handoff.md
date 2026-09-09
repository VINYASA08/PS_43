# Explorer 3 Handoff Report: Handover APIs, Public Claim Flow & Email Simulation

**Investigator**: Explorer 3 (teamwork_preview_explorer_r8_survey_3)  
**Parent Orchestrator**: orchestrator_r8 (`573b8730-6748-4db4-89af-0d71738c07b5`)  
**Date**: 2026-09-09T15:23:45Z  
**Workspace**: `a:/Development/Antigravity/SIH26043/web`  

---

## 1. Observation

### 1.1 Middleware and Route Protection Status
1. **Absence of `middleware.ts`**:
   - A filesystem query across `web/` and `web/src/` confirms that no file named `middleware.ts` or `proxy.ts` exists in the repository.
   - Command: `find_by_name(Pattern: "*middleware*.ts", SearchDirectory: "web")` returned only files under `node_modules/`.
   - Inspection of `web/next.config.ts` (lines 13-51) demonstrates only security response headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`), with no Next.js rewrites or route redirects configured.

2. **Frontend Route Protection Mechanism**:
   - Client-side route protection for dashboards is enforced by `DashboardLayout` in `src/app/dashboard/layout.tsx` (lines 22-36) and `RoleGuard` in `src/components/auth/RoleGuard.tsx` (lines 14-53):
     ```typescript
     // src/components/auth/RoleGuard.tsx:25-30
     if (!isAuthenticated || !user) {
       if (typeof window !== "undefined") {
         const currentPath = window.location.pathname;
         router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
       }
       return;
     }
     ```
   - Public pages such as `/`, `/login`, `/track`, `/accountability`, `/guidelines`, `/whatsapp-intake`, `/submit`, and `/challenge/[id]` live outside `src/app/dashboard/` and are accessible to unauthenticated visitors by default.
   - Consequently, placing the public claim page at `src/app/handover/[token]/page.tsx` makes it immediately accessible without requiring authentication or session cookies.
   - **Crucial Rule**: If any team member introduces a global `src/middleware.ts` in the future, `/handover/:path*` and `/api/handover/:path*` (validation and claim) must be explicitly included in the public route matcher/allowlist alongside `/login` and `/api/auth/*`.

3. **Backend API Route Authentication Mechanism**:
   - Protected API routes wrap their handlers with `withAuth` from `src/lib/rbac.ts` (lines 23-74):
     ```typescript
     // src/lib/rbac.ts:23-26
     export function withAuth(
       handler: AuthenticatedHandler,
       allowedRoles?: UserRole[]
     )
     ```
   - Public API endpoints (such as `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/csrf`, `GET /api/challenges/[id]`) do NOT use `withAuth`.
   - Dynamic route parameters in Route Handlers under Next.js 15/16 App Router are asynchronous Promises:
     ```typescript
     // src/app/api/challenges/[id]/route.ts:8-13
     export async function GET(
       _req: NextRequest,
       context: { params: Promise<{ id: string }> }
     ) {
       const { id } = await context.params;
     ```
     or using `await Promise.resolve(context.params)` as seen in `src/app/api/challenges/[id]/claim/route.ts` (lines 6-17).

4. **CSRF Protection Pattern**:
   - Enforced on mutation methods (`POST`, `PUT`, `DELETE`) across authenticated internal routes via `validateCsrfRequest(req)` in `src/lib/csrf.ts` (lines 65-90).
   - In `src/lib/api-client.ts` (lines 12-30), the client automatically attaches the `x-csrf-token` header from cookies or fetches it via `GET /api/csrf`.
   - Note: For unauthenticated/public claim submissions (`POST /api/handover/[token]/claim`), the token itself serves as the high-entropy shared secret (bearer token), but attaching the CSRF token via `apiFetch` is already transparently supported by the frontend.

### 1.2 Email Simulation and Console Logging Patterns
1. **Existing Implementations**:
   - In `src/lib/otp.ts` (lines 56, 93) and `src/app/api/auth/register/route.ts`:
     ```typescript
     console.log(`[Email OTP to ${email}]: ${otp}`);
     ```
   - In `src/lib/ai-matching.ts` (lines 146-162 and 342-358):
     ```typescript
     console.log(`\n================================================================================`);
     console.log(`📧 [MOCK EMAIL DISPATCH] AI 3-WAY UNIVERSITY MATCH NOTIFICATION`);
     console.log(`   Challenge ID: ${challenge.id} | Tracking ID: ${challenge.publicTrackingId || "N/A"}`);
     console.log(`   Title: "${challenge.title}"`);
     console.log(`================================================================================`);
     console.log(`[Mock Email to ${uni.email}] You have been matched to Challenge "${challenge.title}". Claim link: ${claimLink}`);
     console.log(`================================================================================\n`);
     ```
2. **Standardized Handover Invite Log Pattern**:
   - To align with the established banner style:
     ```typescript
     console.log(`\n================================================================================`);
     console.log(`📧 [MOCK EMAIL DISPATCH] ACCOUNT HANDOVER INVITATION`);
     console.log(`   From (Predecessor): ${user.name} (${user.email || user.phone})`);
     console.log(`   Designation / Org: ${user.designation || "N/A"} | ${user.organization || "N/A"}`);
     console.log(`   Portal Role: ${user.role}`);
     console.log(`   To (Successor): ${successorEmail}`);
     console.log(`   Claim Link: ${claimUrl}`);
     console.log(`   Token Expiration: ${expiresAt.toISOString()} (48 Hours)`);
     console.log(`   Action: The recipient can claim full control of this official account by`);
     console.log(`           navigating to the link above, entering their name, and setting a password.`);
     console.log(`================================================================================\n`);
     ```

### 1.3 Public Next.js Route Structure & Hydration Patterns
1. **Design System & Layout**:
   - Layout is defined in `src/app/layout.tsx` using Inter font, `globals.css` variables (`bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-900`), and `NetworkBanner`.
   - Pages use Tailwind CSS, Lucide icons (`CheckCircle2`, `AlertCircle`, `ShieldCheck`, `ArrowRight`, `Lock`, `Mail`, `User`, `ArrowLeft`), and Framer Motion (`motion.div`, `AnimatePresence`).
2. **Hydration Error Preventions**:
   - Date formatting must be executed in `useEffect` or conditioned on `isMounted` state rather than in direct SSR render to prevent client-server timezone divergence.
   - Dynamic route parameters should be extracted via `useParams()` from `next/navigation` in `"use client"` components.
   - No `useSearchParams` is required on `/handover/[token]`, completely avoiding Next.js `<Suspense>` boundary bailout requirements.
   - Clear loading skeleton states prevent blank screens while fetching `/api/handover/[token]`.

---

## 2. Logic Chain

```
[Requirement R1: Settings UI Integration]
      │
      ├─► User enters successor's email in /dashboard/settings
      │   Calls POST /api/handover/initiate with { successorEmail }
      │
[Requirement R2: Handover API & Token Generation]
      │
      ├─► Validate user is authenticated (withAuth)
      ├─► Validate successorEmail format and ensure != predecessor email
      ├─► Generate cryptographically secure token: crypto.randomBytes(32).toString("hex")
      ├─► Store in HandoverToken table with status="PENDING", expiresAt = now + 48h
      ├─► Log structured banner: 📧 [MOCK EMAIL DISPATCH] ACCOUNT HANDOVER INVITATION
      ├─► Write AuditLog: action="HANDOVER_INITIATED"
      └─► Return JSON: { success: true, token, claimUrl, expiresAt }
            │
            ▼
[Requirement R3: Successor Claim Flow]
      │
      ├─► Successor opens public URL: /handover/[token]
      │   (Public route, no middleware or RoleGuard blockage)
      │
      ├─► Client fetches GET /api/handover/[token] (Public endpoint)
      │   ├─ If not found / expired / claimed ──► Render Error Card (404/410/409)
      │   └─ If valid ──► Render Verification Card with Predecessor Info & Successor Form
      │
      ├─► Successor submits Form: { name, password, confirmPassword }
      │   Calls POST /api/handover/[token]/claim (or POST /api/handover/[token])
      │
      ├─► Server executes atomic transaction (prisma.$transaction):
      │   1. Re-verify token status === "PENDING" and expiresAt > now
      │   2. Mark token status = "CLAIMED", claimedAt = now
      │   3. Hash new password with bcrypt (salt rounds = 12)
      │   4. Update User row:
      │      - name = successorName
      │      - email = successorEmail
      │      - passwordHash = newPasswordHash
      │      - twoFactorEnabled = false (allows successor to setup their own 2FA)
      │      - failedLoginAttempts = 0, lockoutUntil = null, status = "ACTIVE"
      │      - PRESERVED: id (PK), role, organization, district, all relational FKs
      │   5. Create AuditLog: action="ACCOUNT_HANDOVER_CLAIMED"
      │   6. Issue new session token via signSessionToken() and attach cookie
      │
      └─► Successor is authenticated and redirected to role dashboard or login
```

---

## 3. Detailed Specifications

### 3.1 Endpoint 1: `POST /api/handover/initiate`
- **Location**: `src/app/api/handover/initiate/route.ts` (also alias `POST /api/handover/route.ts`)
- **Access Control**: Protected via `withAuth(handler)` — requires active session.
- **CSRF**: Enforced via `validateCsrfRequest(req)`.
- **Rate Limit**: Enforced via `checkRateLimit(ip)`.
- **Request Body**:
  ```json
  {
    "successorEmail": "successor.name@gov.in"
  }
  ```
- **Validation**:
  - `successorEmail` must be a valid email string.
  - `successorEmail.toLowerCase() !== session.email?.toLowerCase()` (cannot handover to oneself).
- **Token Generation**:
  ```typescript
  const token = crypto.randomBytes(32).toString("hex"); // 64-char hex string
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  ```
- **Database Action**:
  - Invalidate any previous `PENDING` tokens for this user (`updateMany({ where: { userId, status: "PENDING" }, data: { status: "REVOKED" } })`).
  - Create new `HandoverToken` record.
  - Record `AuditLog`: `action = "HANDOVER_INITIATED"`, `resource = "User"`.
- **Console Log**: Output the mock email dispatch banner.
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "message": "Handover invitation generated and dispatched to successor.",
    "token": "4f8a3c...",
    "claimUrl": "http://localhost:3000/handover/4f8a3c...",
    "expiresAt": "2026-09-11T15:30:00.000Z",
    "successorEmail": "successor.name@gov.in"
  }
  ```

### 3.2 Endpoint 2: `GET /api/handover/[token]`
- **Location**: `src/app/api/handover/[token]/route.ts`
- **Access Control**: **Public endpoint** (No `withAuth`).
- **Route Parameters**:
  ```typescript
  export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ token: string }> }
  ) {
    const { token } = await context.params;
  ```
- **Validation Rules**:
  - Token not found: Return HTTP 404 (`{ error: "Handover token not found" }`).
  - Token already claimed: Return HTTP 409 (`{ error: "This handover invite has already been claimed", claimedAt }`).
  - Token expired (`expiresAt < new Date()`): Return HTTP 410 (`{ error: "This handover invite has expired. Please request a new invite from your predecessor." }`).
  - Predecessor account inactive or deleted: Return HTTP 403 (`{ error: "Predecessor account is no longer active." }`).
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "valid": true,
    "successorEmail": "successor.name@gov.in",
    "expiresAt": "2026-09-11T15:30:00.000Z",
    "predecessor": {
      "name": "Dr. R. K. Soren, IAS",
      "designation": "Principal Secretary & Nodal Officer",
      "organization": "Jharkhand State Innovation Council",
      "district": "Ranchi",
      "role": "GOV"
    }
  }
  ```

### 3.3 Endpoint 3: `POST /api/handover/[token]/claim` (and `POST /api/handover/[token]`)
- **Location**: `src/app/api/handover/[token]/claim/route.ts` (with matching handler in `src/app/api/handover/[token]/route.ts` for route flexibility)
- **Access Control**: **Public endpoint** (No `withAuth`).
- **Rate Limit**: Enforced via `checkRateLimit(ip)`.
- **Request Body**:
  ```json
  {
    "name": "A. K. Sharma",
    "password": "Jharkhand@2026New!",
    "confirmPassword": "Jharkhand@2026New!"
  }
  ```
- **Validation**:
  - `name`: Non-empty string (min 2 characters).
  - `password`: Min 8 characters.
  - `password === confirmPassword`.
- **Transactional Execution (`prisma.$transaction`)**:
  ```typescript
  const result = await prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.handoverToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error("NOT_FOUND");
    }
    if (tokenRecord.status !== "PENDING" || tokenRecord.claimedAt !== null) {
      throw new Error("ALREADY_CLAIMED");
    }
    if (new Date() > tokenRecord.expiresAt) {
      throw new Error("EXPIRED");
    }

    // 1. Mark token as claimed
    await tx.handoverToken.update({
      where: { id: tokenRecord.id },
      data: {
        status: "CLAIMED",
        claimedAt: new Date(),
      },
    });

    // 2. Hash successor password
    const newHash = await hashPassword(password);

    // 3. Overwrite predecessor credentials and identity while preserving account ID & history
    const updatedUser = await tx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        name: name.trim(),
        email: tokenRecord.successorEmail,
        passwordHash: newHash,
        emailVerified: new Date(),
        twoFactorEnabled: false,
        twoFactorSecret: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        status: "ACTIVE",
      },
    });

    // 4. Log statutory audit trail
    await tx.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "ACCOUNT_HANDOVER_CLAIMED",
        resource: "User",
        resourceId: updatedUser.id,
        newState: JSON.stringify({
          predecessorEmail: tokenRecord.user.email,
          successorEmail: tokenRecord.successorEmail,
          successorName: name.trim(),
          claimedAt: new Date().toISOString(),
        }),
      },
    });

    return updatedUser;
  });
  ```
- **Session Issuance**:
  - Automatically sign a session JWT for the successor and attach cookie:
    ```typescript
    const sessionPayload: SessionPayload = {
      userId: result.id,
      email: result.email,
      phone: result.phone,
      name: result.name,
      role: result.role as UserRole,
      status: result.status as UserStatus,
      organization: result.organization,
      district: result.district,
    };
    const sessionToken = await signSessionToken(sessionPayload);
    const res = NextResponse.json({
      success: true,
      message: "Account handover successfully completed.",
      user: sessionPayload,
      redirectUrl: getRoleRedirect(result.role),
    });
    attachSessionCookie(res, sessionToken);
    return res;
    ```

### 3.4 Public Claim UI: `/handover/[token]` (`src/app/handover/[token]/page.tsx`)
- **Component Archetype**: `"use client"` Next.js Page.
- **State Flow**:
  1. `isLoading`: Fetches `GET /api/handover/[token]` on mount.
  2. `error`: Displays high-contrast error card (with `AlertCircle`, title, description, and link back to Home or Login).
  3. `tokenData`: Shows verified handover banner:
     - Predecessor badge: Name, designation, organization, district, portal role.
     - Successor email field: Read-only badge displaying the assigned successor email.
  4. Input Fields:
     - Successor Full Name (`type="text"`, icon `User`).
     - New Account Password (`type="password"`, icon `Lock`, toggle show/hide).
     - Confirm Password (`type="password"`, icon `Lock`).
     - Statutory Handover Checkbox: "I accept administrative ownership and statutory responsibility for this account."
  5. Action Button:
     - "Claim Account & Access Portal" (gradient button with `ArrowRight`, spinner during submission).
  6. Success State:
     - Card displaying `CheckCircle2`, summary of updated account, and direct button "Proceed to Dashboard" (or auto-redirect).
- **Hydration Safety**:
  - All token loading and date formatting is contained strictly inside `useEffect`.
  - No references to `window` or `document` during the initial render.
  - Wraps in standard clean layout with `Link href="/"` navigation.

---

## 4. Caveats

1. **Email Verification on Claim**:
   - The handover token itself serves as cryptographic verification of email ownership (it was sent to the successor's email). Therefore, `emailVerified` is automatically stamped as verified upon claim.
2. **Two-Factor Authentication (2FA) Reset**:
   - If the predecessor had TOTP 2FA enabled, the claim flow must set `twoFactorEnabled: false` and `twoFactorSecret: null`. If not reset, the successor would immediately be locked out on next login because they wouldn't possess the predecessor's authenticator app secret.
3. **Database Model Dependency**:
   - Explorer 1 is defining the `HandoverToken` schema in Prisma. The API routes will interact with `prisma.handoverToken`. If the model name is singular (`HandoverToken`), Prisma Client creates `prisma.handoverToken`. Ensure naming parity.
4. **Dual Path Claim Support**:
   - Both `POST /api/handover/[token]/claim` and `POST /api/handover/[token]` should be supported to prevent any subtle discrepancies in test runners.

---

## 5. Conclusion

1. **Middleware Verdict**:
   - There is no existing `middleware.ts`. All routes outside `/dashboard` are public by default.
   - The public route `/handover/[token]` and API routes `GET /api/handover/[token]`, `POST /api/handover/[token]/claim` will function publicly out of the box.
   - If a global middleware is created, `/handover` must be added to the whitelist.
2. **Email Simulation**:
   - Follow the `[MOCK EMAIL DISPATCH]` multi-line box banner established in `src/lib/ai-matching.ts`.
3. **Account Preservation**:
   - Account handover strictly mutates the existing `User` row (`name`, `email`, `passwordHash`), preserving the primary key `id`, relations (challenges, proposals, funding commitments, microtasks), and historical audit logs.
4. **Implementation Readiness**:
   - The route structures, parameters, error codes, and transactional flows are fully mapped out and ready for immediate implementation by Builder agents.

---

## 6. Verification Method

### 6.1 Programmatic Test Script
Run the automated test runner verifying the handover lifecycle:
```powershell
cd a:\Development\Antigravity\SIH26043\web
npx tsx tests/test_account_handover.ts
```
The test script must:
1. Log in or create User A (predecessor).
2. Call `POST /api/handover/initiate` with successor email `successor@example.com` and obtain `token`.
3. Call `GET /api/handover/[token]` and assert `valid: true` and predecessor metadata.
4. Call `POST /api/handover/[token]/claim` with successor credentials (`name: "Successor User"`, `password: "NewPass@2026!"`).
5. Assert User B can log in via `POST /api/auth/login` using `successor@example.com` and `NewPass@2026!`.
6. Assert User B's `userId` matches User A's original `userId` and past challenges/proposals remain linked.
7. Call `GET /api/handover/[token]` again and assert HTTP 409 Conflict / Already Claimed.

### 6.2 Next.js Build Verification
Verify clean build with zero TypeScript and zero route errors:
```powershell
cd a:\Development\Antigravity\SIH26043\web
npm run build
```

### 6.3 Invalidation Conditions
- If `GET /api/handover/[token]` returns HTTP 401 Unauthorized (indicates accidental auth wrapping).
- If claiming the account creates a new `User` record instead of updating the existing record (violating history and relation preservation).
- If `/handover/[token]` throws React hydration mismatch errors in the browser console.
