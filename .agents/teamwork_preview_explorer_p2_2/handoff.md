# Handoff Report: Tiered Authentication & Backend RBAC Architecture

**Agent**: Explorer 2 (Tiered Auth & Backend RBAC Architecture)  
**Recipient**: Parent Orchestrator (`021672f4-f631-4dd9-a2fe-ee69813b8698`)  
**Workspace**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2`  
**Reference File**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\analysis.md`  

---

## 1. Observation

1. **Current Login Implementation (`web/src/app/login/page.tsx:98-104`)**:
   ```tsx
   const handleSeamlessLogin = (role: any) => {
     setSelectedRole(role);
     setIsLoggingIn(true);
     setTimeout(() => {
       router.push(role.href);
     }, 1200);
   };
   ```
   Directly pushes to `role.href` without verifying credentials, setting HTTP cookies, generating JWTs, or contacting any backend endpoint.
2. **Current Settings State (`web/src/app/dashboard/settings/page.tsx:49-55, 349-355`)**:
   - `twoFactorEnabled` is stored as an ephemeral React state: `const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);`.
   - Toggling 2FA merely flips boolean state (`setTwoFactorEnabled(!twoFactorEnabled)`) and displays a UI toast without generating an RFC 6238 Base32 secret, rendering a QR code, or verifying TOTP codes.
   - Active sessions (`sess-1`, `sess-2`) and API keys are mock data in React state.
3. **Current Role Determination (`web/src/app/dashboard/layout.tsx:25-27`)**:
   ```tsx
   const isGov = pathname.includes("/dashboard/gov");
   const isUni = pathname.includes("/dashboard/university");
   const isInd = pathname.includes("/dashboard/industry");
   ```
   Role routing is based entirely on URL string matching with zero server-side authentication or session validation.
4. **Dependencies in `web/package.json`**:
   Currently contains Next.js 16.3.4, React 19.2.8, Lucide React, Framer Motion, and Zustand. Does not yet include `bcryptjs` (or `bcrypt`), `jose`, `qrcode`, or `zod`.
5. **No Existing API Endpoints**:
   A scan of `web/src/app` reveals 0 route handlers under `src/app/api/`.

---

## 2. Logic Chain

1. **Vulnerability Assessment**:
   Because routing and role detection are strictly client-side and URL-based (Observation 1, 2, 3), any unauthenticated external entity can browse directly to `/dashboard/gov`, inspect sensitive state challenges, or simulate administrative actions. This directly violates government compliance mandates (DPDP Act 2023, ISO 27001).
2. **Four-Tiered Identity Model Derivation**:
   To reconcile government security requirements with accessibility for rural citizens and external researchers:
   - *Citizens/Experts (Tier 1)* require low-friction identity without passwords. A 6-digit cryptographic OTP sent via SMS/WhatsApp with console simulation (`[SMS/WhatsApp OTP to <phone>]: 123456`) meets ease-of-use and testing requirements.
   - *Universities (Tier 2)* require institutional legitimacy. Enforcing `.ac.in` domain verification via regex alongside bcrypt hashing (cost factor >= 12) and email OTP verification guarantees academic provenance.
   - *Industry (Tier 3)* handles CSR disbursements and escrow. Requiring corporate email domain checks, bcrypt password hashing, and a mandatory administrative gate (`status: "pending"` on signup; access blocked until approved by Gov Admin) prevents unverified commercial entities from entering the portal.
   - *Government Officials (Tier 4)* possess state nodal authority. Enforcing `.gov.in` / `.nic.in` domain validation, bcrypt hashing, and mandatory RFC 6238 TOTP 2FA (Google Authenticator / NIC GovKey) guarantees sovereign-grade access defense.
3. **Session Hardening & Defense-in-Depth**:
   Storing signed JWTs in `HttpOnly`, `Secure`, `SameSite: "lax"` cookies (`sih_session`) mitigates XSS token extraction and CSRF vulnerabilities. Tracking `failedLoginAttempts` and `lockoutUntil` enforces a 30-minute lockout after 5 consecutive failures. Sliding-window IP rate limiting (10 req/min) prevents brute-force credential stuffing.
4. **Backend-Enforced RBAC Middleware (`withAuth`)**:
   Client-side route guards can be bypassed; therefore, backend enforcement is mandatory. The higher-order API wrapper `withAuth` intercepts incoming requests in a 3-stage pipeline:
   - *Stage 1*: Authenticate JWT cookie & verify user is active.
   - *Stage 2*: Authorize role against endpoint whitelist.
   - *Stage 3*: Validate resource ownership (e.g., University PI can only modify their own proposal; Gov has administrative bypass).
   Any authorization failure writes an immutable security event to `AuditLogs` (recording `userId`, `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`) and returns HTTP 403 Forbidden.

---

## 3. Caveats

1. **SMS / WhatsApp Gateway Hardware**: In production, simulated console logging (`[SMS/WhatsApp OTP to <phone>]: 123456`) must be swapped with a live SMS gateway integration (e.g., NIC SMS Gateway, CDAC, or Twilio) via environment variables (`SMS_GATEWAY_API_KEY`).
2. **Single-Instance Rate Limiting**: The in-memory sliding window rate limiter (`rateLimiter.ts`) functions per container/instance. When scaling to multiple serverless lambdas or containers, this should be backed by Redis / Valkey.
3. **Edge Middleware vs App Router API Routes**: While Next.js `middleware.ts` can perform edge cookie verification and redirect unauthenticated browsers away from `/dashboard/*`, database lookups (Prisma) and audit logging must execute inside Node.js runtime API route handlers via `withAuth`.

---

## 4. Conclusion

A complete, production-ready architectural design for Tiered Authentication and Backend RBAC has been formulated and documented in `analysis.md`. The design includes:
1. **Tiered Auth Logic**: Clear rules, domain regexes, and workflows for Citizen (Phone+OTP), University (`.ac.in` + bcrypt + OTP), Industry (Corporate + pending approval), and Government (`.gov.in`/`.nic.in` + TOTP 2FA).
2. **Session & Security Controls**: Hardened `sih_session` cookie, 5-attempt / 30-minute account lockout, and 10 req/min IP rate limiting.
3. **Backend RBAC Middleware (`withAuth`)**: 3-stage validation pipeline with automated `AuditLogs` recording.
4. **API Endpoint Specifications**: Full request/response schemas for `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/totp-setup`, `/api/auth/totp-verify`, `/api/auth/logout`, `/api/auth/session`, `/api/admin/pending-users`, and `/api/admin/approve-user`.
5. **Implementation Code Blueprints**: Drop-in TypeScript code for `auth.ts`, `rateLimiter.ts`, `totp.ts`, and `withAuth.ts`.

---

## 5. Verification Method

1. **Inspect Architecture Deliverables**:
   - Verify `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\analysis.md` contains the full technical specifications, schemas, regex patterns, and code blueprints.
2. **Review Implementer Dependency Requirements**:
   - Implementers will need:
     ```bash
     npm install bcryptjs jose qrcode
     npm install --save-dev @types/bcryptjs @types/qrcode
     ```
3. **Validate Auth Flow Scenarios**:
   - *Citizen Phone Login*: Confirm simulated log output matches `[SMS/WhatsApp OTP to <phone>]: 123456`.
   - *University Registration*: Confirm rejection of `user@gmail.com` and acceptance of `prof@iitism.ac.in`.
   - *Industry Status Gate*: Confirm `status = "pending"` prevents dashboard login until Gov approval via `POST /api/admin/approve-user`.
   - *Government 2FA*: Confirm `POST /api/auth/totp-verify` evaluates 6-digit TOTP code against Base32 secret using RFC 6238.
   - *RBAC Guard*: Confirm unauthorized roles attempting administrative calls receive HTTP 403 and trigger `AuditLogs` entries.
