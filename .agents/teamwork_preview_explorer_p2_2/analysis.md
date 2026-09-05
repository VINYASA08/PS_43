# Technical Architecture & Analysis: Tiered Authentication System & Backend RBAC Middleware

**Project**: Jharkhand Societal Innovation Portal (`a:\Development\Antigravity\SIH26043\web`)  
**Investigator**: Explorer 2 (Authentication & RBAC Architecture)  
**Date**: September 2026  
**Status**: Complete Architectural Specification  

---

## 1. Executive Summary

The Jharkhand Societal Innovation Portal serves five distinct personas across four statutory operational tiers:
1. **Tier 1 (Citizens / NGOs / Independent Experts)**: Low-friction identity via Mobile Phone + OTP (SMS / WhatsApp).
2. **Tier 2 (Universities & Academic Labs)**: Institutional identity via `.ac.in` email validation + bcrypt password hashing + email OTP verification.
3. **Tier 3 (Industry & CSR Partners)**: Corporate email validation + bcrypt password hashing + mandatory Government administrative approval workflow (`pending` state).
4. **Tier 4 (Government Officials & Nodal Authorities)**: Official `.gov.in` / `.nic.in` domain validation + bcrypt password hashing + RFC 6238 TOTP Two-Factor Authentication (Authenticator apps).

Currently, the web frontend at `web/src/app/login/page.tsx` and `web/src/app/dashboard/settings/page.tsx` operates with purely simulated client-side mock credentials (`setTimeout` delay without session issuance or server verification).

This document specifies the end-to-end backend architecture, cryptographic security controls, session management, account lockout rules, sliding-window rate limiting, higher-order API middleware (`withAuth`), and 7 RESTful API route specifications necessary to transform the portal into a production-grade, secure, multi-tenant government platform.

---

## 2. Codebase Audit of Existing Auth & User State

### 2.1 Current Implementation in `src/app/login/page.tsx`
- **Persona Cards**: Five persona cards are rendered (`gov`, `university`, `industry`, `expert`, `citizen`).
- **Authentication Action**:
  ```tsx
  const handleSeamlessLogin = (role: any) => {
    setSelectedRole(role);
    setIsLoggingIn(true);
    setTimeout(() => {
      router.push(role.href);
    }, 1200);
  };
  ```
- **Vulnerabilities / Missing Controls**:
  - No HTTP request is dispatched to any backend route.
  - No session identifier, JWT, or cookie is generated or validated.
  - Zero password or credential verification.
  - Direct URL navigation (`/dashboard/gov`, `/dashboard/settings`, `/dashboard/industry`) succeeds unconditionally for any client.
  - No state persistence across browser tabs, reloads, or device restarts.

### 2.2 Current Implementation in `src/app/dashboard/settings/page.tsx`
- **Settings Tabs**: Five tabs (`profile`, `notifications`, `security`, `api`, `compliance`).
- **Security Tab (`security`)**:
  - Contains a cosmetic 2FA toggle button: `setTwoFactorEnabled(!twoFactorEnabled)` without generating an authenticator secret, QR code, or verifying TOTP codes.
  - Displays mock active sessions (`sess-1`, `sess-2`) in local React state. Revocation filters the in-memory array only.
  - Session timeout dropdown (15, 30, 60, 240 mins) modifies local state with no cookie max-age or backend TTL synchronization.
- **API Keys Tab (`api`)**:
  - Hardcoded public app ID: `JH_INNOV_APP_2026_PRODUCTION`
  - Hardcoded secret bearer key: `sic_live_948fbc29184a441e8c71987d602931` with in-memory `Math.random()` regeneration.

### 2.3 Current Implementation in `src/app/dashboard/layout.tsx`
- Role detection is exclusively derived from URL inspection:
  ```tsx
  const isGov = pathname.includes("/dashboard/gov");
  const isUni = pathname.includes("/dashboard/university");
  const isInd = pathname.includes("/dashboard/industry");
  ```
- Any unauthorized user can access privileged navigation links simply by typing the URL.

---

## 3. Tiered Authentication Architecture (4 User Tiers)

```
+---------------------------------------------------------------------------------------------------+
|                                 TIERED AUTHENTICATION ARCHITECTURE                                |
+-----------------------+-----------------------+-------------------------+-------------------------+
| Tier 1: Public/Experts| Tier 2: Universities  | Tier 3: Industry/CSR    | Tier 4: Government      |
+-----------------------+-----------------------+-------------------------+-------------------------+
| • Phone Number        | • Institutional Email | • Corporate Email       | • Gov Email             |
|   (Indian 10-digit)   |   (*.ac.in domain)    |   (No free webmail)     |   (*.gov.in / *.nic.in) |
| • Simulated OTP       | • Password (bcrypt)   | • Password (bcrypt)     | • Password (bcrypt)     |
|   (SMS / WhatsApp)    | • Email OTP Verify    | • Gov Admin Approval    | • RFC 6238 TOTP (2FA)   |
| • Instant Access      | • Instant Access once | • Status: "pending"     |   (Google Auth/GovKey)  |
|                       |   email verified      | • Blocked until Gov OK  | • Full Sovereign Access |
+-----------------------+-----------------------+-------------------------+-------------------------+
```

### 3.1 Tier 1: Citizens / NGOs / Independent Experts
- **Target Roles**: `citizen`, `expert`
- **Identifier**: Phone number in Indian format (`+91` followed by 10 digits starting with 6-9, or raw 10 digits).
- **Domain/Format Validation**:
  ```ts
  const INDIAN_PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
  ```
- **OTP Generation & Security**:
  - Numeric 6-digit cryptographic random code generated via `crypto.randomInt(100000, 1000000)`.
  - Expiry: Exactly 10 minutes (600,000 ms).
  - Storage: Stored in `OtpVerification` table with SHA-256 hash (`crypto.createHash('sha256').update(otp).digest('hex')`) to protect against DB read exposure.
  - Attempt Throttling: Maximum 5 verification attempts per OTP; invalidated immediately upon 5th failure.
- **Development Simulation**:
  - In development mode (`NODE_ENV !== "production"` or when external SMS provider keys are absent), OTP is printed to the terminal console with the mandatory standard prefix:
    ```
    [SMS/WhatsApp OTP to <phone>]: 123456
    ```
  - Allows full automated testing and manual verification without third-party telecommunication costs.
- **State Transition**:
  - First-time phone verification automatically creates User record with role `citizen` (or `expert` if requested with expert credentials).
  - Sets `phoneVerified = true`.
  - Issues signed session cookie and returns user session.

### 3.2 Tier 2: Universities (Higher Education Institutions & R&D Labs)
- **Target Role**: `university`
- **Identifier**: Institutional Email address + Password.
- **Domain Validation**:
  - Strict institutional domain check: Email must end in `.ac.in`.
  - Regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.ac\.in$`
  - Examples accepted: `pi.water@iitism.ac.in`, `hod.biotech@bitmesra.ac.in`, `dean.rnd@nitjsr.ac.in`.
  - Examples rejected: `prof.sharma@gmail.com`, `researcher@iitd.org`.
- **Password Security**:
  - Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).
  - Hashed using `bcrypt` with cost factor **12** (or `argon2id`).
- **Two-Step Email OTP Verification**:
  - Upon registration at `/api/auth/register`, account is created with `emailVerified: false`.
  - Server generates 6-digit email OTP and logs:
    ```
    [Email OTP to <email>]: 654321
    ```
  - User submits OTP to `/api/auth/verify-otp`.
  - Upon successful verification, `emailVerified = true`, `status = "active"`, and full university session cookie is issued.

### 3.3 Tier 3: Industry & Corporate Partners
- **Target Role**: `industry`
- **Identifier**: Corporate Email + Password + Company Metadata (Company Name, Corporate Identification Number [CIN], CSR Lead Designation).
- **Domain Validation**:
  - Blacklists free public email providers: `gmail.com`, `yahoo.com`, `yahoo.co.in`, `outlook.com`, `hotmail.com`, `icloud.com`, `proton.me`, `zoho.com`, `rediffmail.com`.
  - Must belong to a valid corporate domain (e.g. `@tatasteel.com`, `@jindalsteel.com`, `@ongc.co.in`).
- **Admin Approval Workflow**:
  - Upon signup via `/api/auth/register`, the account is created with status:
    `status = "pending"`
  - `emailVerified` is set to `true` (or verified via OTP), but access to `/dashboard/industry` and all `/api/industry/*` endpoints remains **STRICTLY BLOCKED**.
  - Login attempt behavior:
    - User authenticates with valid email and password.
    - Server verifies password hash.
    - Server inspects `user.status`. Since `status === "pending"`, the server returns HTTP 403 Forbidden with:
      ```json
      {
        "error": "Account Pending Approval",
        "message": "Your corporate profile is pending statutory verification by the Jharkhand State Innovation Council. An email notification will be dispatched once approved.",
        "status": "pending"
      }
      ```
  - Approval by Government Admin:
    - Government officials review pending industry applications at `GET /api/admin/pending-users`.
    - Government officials approve or reject at `POST /api/admin/approve-user`.
    - On approval, `user.status` transitions to `"active"`, and an entry is written to `AuditLogs`.
    - Once approved, industry users can log in and access proposal funding and CSR escrow workflows.

### 3.4 Tier 4: Government Officials (State Nodal Authorities & District Officers)
- **Target Role**: `gov`
- **Identifier**: Official Government Email + Password + TOTP 2FA.
- **Domain Validation**:
  - Strict government email validation: Must end in `.gov.in` or `.nic.in`.
  - Regex: `^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*(gov\.in|nic\.in)$`
  - Examples accepted: `nodal.innovation@jharkhand.gov.in`, `dc-ranchi@nic.in`, `secretary.it@jharkhand.gov.in`.
  - Examples rejected: `official@jharkhand.org`, `collector@gmail.com`.
- **Mandatory TOTP-based 2FA (RFC 6238)**:
  - Setup Flow (`/api/auth/totp-setup`):
    - Server generates cryptographically random 20-byte Base32 secret (`crypto.randomBytes(20)` converted to RFC 4648 Base32).
    - Constructs TOTP URI:
      `otpauth://totp/JharkhandInnovationPortal:<email>?secret=<BASE32_SECRET>&issuer=JharkhandStateInnovationCouncil&algorithm=SHA1&digits=6&period=30`
    - Returns QR code Data URL (generated using `qrcode` library) and textual manual entry secret.
    - Temporarily stores unconfirmed secret in `twoFactorSecret`.
  - Setup Verification (`/api/auth/totp-verify`):
    - Official enters 6-digit code from Google Authenticator, Microsoft Authenticator, or NIC GovKey app.
    - Server evaluates HMAC-SHA1 algorithm according to RFC 6238 with a clock drift window of ±1 (tolerates ±30 seconds drift).
    - If valid, sets `twoFactorEnabled = true` and `status = "active"`.
  - Two-Stage Login Authentication:
    - Stage 1: Official provides email + password at `POST /api/auth/login`.
    - Stage 2: Server checks password hash. If valid and `user.twoFactorEnabled === true`, server issues a short-lived (5-minute) signed `tempToken` with claim `{ sub: user.id, scope: "2fa_pending" }` and returns:
      ```json
      {
        "require2FA": true,
        "tempToken": "<short_lived_signed_token>",
        "message": "Enter 6-digit TOTP code from your authenticator app."
      }
      ```
    - Stage 3: Official submits `{ tempToken, token: "123456" }` to `POST /api/auth/totp-verify`.
    - Stage 4: Server validates `tempToken`, validates 6-digit TOTP code against `user.twoFactorSecret`, resets `failedLoginAttempts = 0`, and issues full `sih_session` HttpOnly cookie.

---

## 4. Session Management & Security Architecture

### 4.1 Cookie Specifications
The portal uses an encrypted, signed JWT session stored in a hardened browser cookie:
```ts
export const SESSION_COOKIE_OPTIONS = {
  name: "sih_session",
  httpOnly: true,                                      // Defends against XSS theft
  secure: process.env.NODE_ENV === "production",        // TLS only in production
  sameSite: "lax" as const,                            // CSRF defense while allowing direct link access
  path: "/",
  maxAge: 60 * 60 * 24,                                // 24 hours (86,400 seconds)
};
```

### 4.2 JWT Session Payload
Tokens are signed with HMAC-SHA256 (`HS256`) using `JWT_SECRET` (min 256-bit entropy):
```json
{
  "sub": "usr_clx982173491",
  "email": "nodal.innovation@jharkhand.gov.in",
  "role": "gov",
  "status": "active",
  "tier": 4,
  "name": "Dr. R. K. Soren, IAS",
  "dept": "Jharkhand State Innovation Council",
  "district": "Ranchi",
  "twoFactorVerified": true,
  "jti": "d7b2a3c1-9014-41e9-9a02-124b89e3fa11",
  "iat": 1788523200,
  "exp": 1788609600
}
```

### 4.3 Account Lockout Mechanism
To defeat credential stuffing and brute-force dictionary attacks against portal accounts:
- Database schema tracks two fields on `User`:
  - `failedLoginAttempts: Int @default(0)`
  - `lockoutUntil: DateTime?`
- **Lockout Rules**:
  1. On every login attempt: Check if `user.lockoutUntil` exists and `user.lockoutUntil > new Date()`.
     - If true: Reject immediately with HTTP 423 (Locked) or HTTP 403:
       ```json
       {
         "error": "Account Locked",
         "message": "Account temporarily locked due to 5 consecutive failed login attempts. Please retry after 30 minutes.",
         "lockoutUntil": "2026-09-04T15:12:00.000Z"
       }
       ```
  2. When an incorrect password is submitted:
     - Increment `failedLoginAttempts = failedLoginAttempts + 1`.
     - If `failedLoginAttempts >= 5`:
       - Set `lockoutUntil = new Date(Date.now() + 30 * 60 * 1000)` (current time + 30 minutes).
       - Automatically write to `AuditLogs`:
         `action: "ACCOUNT_LOCKOUT_TRIGGERED", resource: "auth", resourceId: user.id`.
       - Return HTTP 423 Locked.
     - Else: Return HTTP 401 Unauthorized:
       ```json
       {
         "error": "Invalid credentials",
         "attemptsRemaining": 5 - failedLoginAttempts
       }
       ```
  3. When correct password is provided:
     - Reset `failedLoginAttempts = 0` and `lockoutUntil = null`.

### 4.4 Sliding-Window Rate Limiter
- Applied to all endpoints under `/api/auth/*`.
- **Policy**: Maximum **10 requests per minute** per client IP address.
- **Architecture**:
  - Sliding-window timestamp log in memory (or Redis in clustered multi-node environments).
  - Every request checks timestamps within the last 60,000 ms.
  - If request count > 10:
    - Sets header `Retry-After: 60`.
    - Returns HTTP 429 Too Many Requests:
      ```json
      {
        "error": "Rate Limit Exceeded",
        "message": "Too many authentication requests from this IP. Please wait 1 minute before retrying."
      }
      ```
    - Writes security event to server logs and audit system.

---

## 5. Backend-Enforced Role-Based Access Control (RBAC)

### 5.1 RBAC Matrix & Access Boundaries

| Resource / Endpoint | `gov` | `university` | `industry` | `citizen` | `expert` |
|---|---|---|---|---|---|
| View Public Challenges | Read All | Read All | Read All | Read All | Read All |
| Submit Problem / Challenge | Full | Full | Read Only | Full (Own) | Full |
| Edit / Close Challenge | Full | Prototyping Only | Read Only | Edit Own Draft | Advisory |
| Submit Proposal | Oversee | Full (Own Uni) | Read Only | Denied | Advisory |
| Edit / Withdraw Proposal | Supervise | Full (Own Submission) | Read Only | Denied | Denied |
| Pledge CSR / Escrow Funds | Supervise | View Pledged | Full (Own Org) | Denied | Denied |
| Release Milestone Escrow | Full (Dual Key) | Request Release | Authorize Release | Denied | Denied |
| Approve Industry Users | Full | Denied | Denied | Denied | Denied |
| Security Audit Logs | Read All | Denied | Denied | Denied | Denied |

### 5.2 Higher-Order Route Wrapper: `withAuth`
Rather than relying on client-side routing or edge proxy rules alone, every API route handler is wrapped with a backend-enforced Higher-Order Component (`withAuth`) that executes a **Three-Stage Security Check**:

```
Client Request
      │
      ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: Authentication Check                          │
│ • Extract `sih_session` cookie                         │
│ • Verify JWT signature with `JWT_SECRET`               │
│ • Verify expiration (`exp > now`)                      │
│ • Verify DB User exists, `deletedAt == null`           │
│ • Verify `status === 'active'`                         │
└────────────────────────┬───────────────────────────────┘
                         │ Pass
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: Role Authorization Check                      │
│ • Check if `options.roles` contains `user.role`        │
│ • If `roles` specified and mismatch -> REJECT          │
│ • On failure: Write `AUTHZ_FAILURE_ROLE_MISMATCH` to  │
│   `AuditLogs` with IP, UserAgent, Resource             │
│ • Return HTTP 403 Forbidden                            │
└────────────────────────┬───────────────────────────────┘
                         │ Pass
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 3: Resource Ownership / Tenancy Check            │
│ • If `options.requireOwnership == true`:               │
│   - If `user.role === 'gov'`: BYPASS (Admin oversight) │
│   - Else: Invoke `resourceFetcher(req, ctx)`           │
│   - Check if `resource.ownerId === user.id` (or        │
│     `resource.universityId === user.orgId`)            │
│   - On failure: Write `AUTHZ_FAILURE_OWNERSHIP` to     │
│     `AuditLogs` table                                  │
│   - Return HTTP 403 Forbidden                          │
└────────────────────────┬───────────────────────────────┘
                         │ Pass
                         ▼
           Execute Target Route Handler
```

### 5.3 Automated Audit Logging on Authorization Failure
On any authorization failure (HTTP 403) or authentication lockout (HTTP 423), `withAuth` captures:
- `userId`: Authenticated user ID (or `null` if unauthenticated).
- `action`: Specific failure descriptor (e.g. `UNAUTHORIZED_ROLE_ACCESS_DENIED`, `UNAUTHORIZED_RESOURCE_TAMPER_ATTEMPT`).
- `resource`: API Route path (e.g. `/api/challenges/JHR-2026-842/assign`).
- `resourceId`: Extracted resource ID from URL parameters or payload.
- `ipAddress`: Client IP parsed from `x-forwarded-for` or socket.
- `userAgent`: Client User-Agent header.
- `createdAt`: ISO 8601 UTC timestamp.

This ensures comprehensive non-repudiation for statutory compliance under the **Digital Personal Data Protection (DPDP) Act 2023** and **ISO 27001**.

---

## 6. API Endpoint Specifications

### 6.1 `POST /api/auth/register`
- **Purpose**: Unified tiered user onboarding.
- **RBAC**: Public endpoint (Rate limited: 10 req/min).
- **Request Schemas by Tier**:
  - **Tier 1 (Citizen / Expert)**:
    ```json
    {
      "tier": "citizen",
      "phone": "+919876543210",
      "name": "Sunita Devi",
      "district": "Ranchi"
    }
    ```
  - **Tier 2 (University)**:
    ```json
    {
      "tier": "university",
      "email": "pi.water@iitism.ac.in",
      "password": "Password@2026",
      "name": "Dr. Anirban Mukherjee",
      "organization": "IIT (ISM) Dhanbad",
      "designation": "Associate Professor & PI",
      "district": "Dhanbad"
    }
    ```
  - **Tier 3 (Industry)**:
    ```json
    {
      "tier": "industry",
      "email": "csr.director@tatasteel.com",
      "password": "SecureCorporate#2026",
      "name": "Rajiv Tandon",
      "organization": "Tata Steel Foundation",
      "designation": "Head of Corporate Social Responsibility",
      "cinNumber": "L27100MH1907PLC000260"
    }
    ```
  - **Tier 4 (Government)**:
    ```json
    {
      "tier": "gov",
      "email": "nodal.innovation@jharkhand.gov.in",
      "password": "StateGovAdmin$2026",
      "name": "Dr. R. K. Soren, IAS",
      "organization": "Jharkhand State Innovation Council",
      "designation": "Principal Secretary & Nodal Officer",
      "district": "Ranchi"
    }
    ```
- **Responses**:
  - **Tier 1 / Tier 2**: HTTP 200 OK
    ```json
    {
      "success": true,
      "message": "Verification code dispatched successfully.",
      "requireOtp": true,
      "identifier": "+919876543210",
      "expiresInSeconds": 600
    }
    ```
  - **Tier 3**: HTTP 201 Created
    ```json
    {
      "success": true,
      "message": "Corporate registration submitted. Your account is pending Government Admin verification.",
      "status": "pending",
      "userId": "usr_ind_912384"
    }
    ```
  - **Tier 4**: HTTP 201 Created
    ```json
    {
      "success": true,
      "message": "Government official profile registered. TOTP 2FA configuration required.",
      "require2FA": true,
      "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

### 6.2 `POST /api/auth/login`
- **Purpose**: Authenticate existing users and initiate second-factor checks.
- **RBAC**: Public endpoint (Rate limited: 10 req/min).
- **Request Body**:
  - Tier 1: `{ "phone": "+919876543210" }`
  - Tiers 2-4: `{ "email": "pi.water@iitism.ac.in", "password": "Password@2026" }`
- **Processing Logic**:
  1. Check client IP rate limit.
  2. Lookup User by `phone` or `email`.
  3. Verify lockout status (`lockoutUntil > now` -> 423 Locked).
  4. If Tier 1: Generate 6-digit OTP, store in `OtpVerification`, log `[SMS/WhatsApp OTP to <phone>]: 123456`, return `{ requireOtp: true }`.
  5. If Tiers 2-4:
     - Compare password with `bcrypt.compare`.
     - If mismatch: Increment `failedLoginAttempts`. If 5th -> trigger lockout for 30 min, return 423. Else return 401.
     - If match:
       - Check `status`: If `"pending"`, return HTTP 403: `"Account pending administrative approval"`. If `"locked"` / `"suspended"`, return HTTP 403.
       - If Tier 4 (`role === 'gov'`): Issue temporary 5-min `tempToken` for 2FA, return `{ require2FA: true, tempToken }`.
       - If Tier 2 / 3: Reset `failedLoginAttempts = 0`, issue `sih_session` cookie, return user profile and dashboard URL.
- **Responses**:
  - Success (Session Issued): HTTP 200 OK + `Set-Cookie: sih_session=...`
    ```json
    {
      "success": true,
      "user": {
        "id": "usr_uni_8123",
        "email": "pi.water@iitism.ac.in",
        "role": "university",
        "name": "Dr. Anirban Mukherjee",
        "organization": "IIT (ISM) Dhanbad",
        "redirectUrl": "/dashboard/university"
      }
    }
    ```
  - Requires 2FA (Tier 4): HTTP 200 OK
    ```json
    {
      "require2FA": true,
      "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "message": "Enter the 6-digit code from your authenticator app."
    }
    ```
  - Account Pending (Tier 3): HTTP 403 Forbidden
    ```json
    {
      "error": "Account Pending Approval",
      "message": "Your corporate profile is awaiting verification by the Jharkhand State Innovation Council.",
      "status": "pending"
    }
    ```
  - Account Locked: HTTP 423 Locked
    ```json
    {
      "error": "Account Locked",
      "message": "Account locked for 30 minutes due to 5 consecutive failed login attempts.",
      "lockoutUntil": "2026-09-04T15:10:00.000Z"
    }
    ```

---

### 6.3 `POST /api/auth/verify-otp`
- **Purpose**: Verify 6-digit SMS / WhatsApp or Email OTP.
- **RBAC**: Public endpoint (Rate limited: 10 req/min).
- **Request Body**:
  ```json
  {
    "identifier": "+919876543210",
    "otp": "839201",
    "purpose": "login"
  }
  ```
- **Processing Logic**:
  1. Retrieve active `OtpVerification` record for `identifier` and `purpose`.
  2. If expired (`expiresAt < now`) -> return HTTP 400: `"OTP expired. Request a new code."`
  3. If `attempts >= 5` -> delete OTP, return HTTP 400: `"Maximum attempts exceeded. Request a new code."`
  4. Compare SHA-256 hash of provided OTP.
  5. If mismatch -> increment `attempts`, return HTTP 401: `"Invalid OTP code. Attempts remaining: X"`.
  6. If match -> delete OTP record, update user `phoneVerified: true` (or `emailVerified: true`), issue `sih_session` cookie, return HTTP 200.

---

### 6.4 `POST /api/auth/totp-setup`
- **Purpose**: Initialize RFC 6238 TOTP authenticator pairing for Government Officials.
- **RBAC**: Requires authenticated session with role `gov`, or valid `tempToken` from registration.
- **Request Body**: Empty or `{ "tempToken": "..." }`
- **Processing Logic**:
  1. Generate 20 cryptographically random bytes -> encode to RFC 4648 Base32 string.
  2. Form URI: `otpauth://totp/JharkhandGov:<email>?secret=<base32>&issuer=JharkhandStateInnovationCouncil&algorithm=SHA1&digits=6&period=30`.
  3. Generate QR code Data URL (`qrcode.toDataURL(uri)`).
  4. Store unconfirmed secret in `User.twoFactorSecret`.
- **Response**: HTTP 200 OK
  ```json
  {
    "success": true,
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "manualEntryKey": "JBSW Y3DP EHPK 3PXP",
    "issuer": "Jharkhand State Innovation Council"
  }
  ```

---

### 6.5 `POST /api/auth/totp-verify`
- **Purpose**: Verify 6-digit TOTP code during initial setup OR during multi-factor login.
- **RBAC**: Public endpoint with `tempToken`, or Authenticated user.
- **Request Body**:
  ```json
  {
    "token": "481920",
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Processing Logic**:
  1. Validate `tempToken` to extract `userId`.
  2. Retrieve user record and `twoFactorSecret`.
  3. Calculate TOTP code according to RFC 6238 for $T_{-1}, T_0, T_{+1}$ (30-second intervals).
  4. If match:
     - Set `twoFactorEnabled: true`.
     - Reset `failedLoginAttempts: 0`.
     - Issue full `sih_session` cookie.
     - Return HTTP 200 OK with session data.
  5. If mismatch:
     - Return HTTP 401 Unauthorized: `"Invalid TOTP 6-digit code. Check your authenticator app clock."`

---

### 6.6 `POST /api/auth/logout`
- **Purpose**: Clear session credentials and invalidate active session.
- **RBAC**: Authenticated (all roles).
- **Processing Logic**:
  1. Read `sih_session` cookie.
  2. Set-Cookie header with `sih_session=""`, `Expires=Thu, 01 Jan 1970 00:00:00 GMT`, `Max-Age=0`.
  3. Return HTTP 200 OK: `{ "success": true, "message": "Logged out successfully" }`.

---

### 6.7 `GET /api/auth/session` (or `/api/auth/me`)
- **Purpose**: Return current authenticated user identity and role for frontend UI synchronization.
- **RBAC**: Any client.
- **Processing Logic**:
  1. Extract `sih_session` cookie.
  2. If missing or invalid -> return HTTP 200 `{ "authenticated": false, "user": null }`.
  3. Query database to confirm user status (`deletedAt: null`).
  4. Return:
     ```json
     {
       "authenticated": true,
       "user": {
         "id": "usr_gov_001",
         "email": "nodal.innovation@jharkhand.gov.in",
         "role": "gov",
         "name": "Dr. R. K. Soren, IAS",
         "organization": "Jharkhand State Innovation Council & Planning Dept",
         "designation": "Principal Secretary & Nodal Officer",
         "district": "Ranchi",
         "twoFactorEnabled": true
       }
     }
     ```

---

### 6.8 `GET /api/admin/pending-users`
- **Purpose**: Fetch pending Industry partner accounts awaiting Government approval.
- **RBAC**: **RESTRICTED TO ROLE `gov`** (Enforced by `withAuth`).
- **Response**: HTTP 200 OK
  ```json
  {
    "success": true,
    "pendingUsers": [
      {
        "id": "usr_ind_912384",
        "email": "csr.director@tatasteel.com",
        "name": "Rajiv Tandon",
        "organization": "Tata Steel Foundation",
        "designation": "Head of Corporate Social Responsibility",
        "cinNumber": "L27100MH1907PLC000260",
        "createdAt": "2026-09-04T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 6.9 `POST /api/admin/approve-user`
- **Purpose**: Approve or reject a pending Industry account.
- **RBAC**: **RESTRICTED TO ROLE `gov`** (Enforced by `withAuth`).
- **Request Body**:
  ```json
  {
    "userId": "usr_ind_912384",
    "action": "approve",
    "reason": "Corporate CIN and CSR mandate verified against MCA database."
  }
  ```
- **Processing Logic**:
  1. Validate caller is `gov`.
  2. Find user by `userId`. Verify `role === "industry"` and `status === "pending"`.
  3. If action is `approve`:
     - Update `User.status = "active"`.
     - Write to `AuditLogs`:
       `{ userId: govUser.id, action: "APPROVE_INDUSTRY_USER", resource: "users", resourceId: userId }`.
     - Return HTTP 200 OK: `{ "success": true, "newStatus": "active" }`.
  4. If action is `reject`:
     - Update `User.status = "suspended"` or soft delete (`deletedAt = now`).
     - Write to `AuditLogs`:
       `{ userId: govUser.id, action: "REJECT_INDUSTRY_USER", resource: "users", resourceId: userId }`.
     - Return HTTP 200 OK: `{ "success": true, "newStatus": "suspended" }`.

---

## 7. Concrete TypeScript Architecture & Middleware Code Blueprint

The following modular architecture is designed for direct implementation in `web/src/lib/`:

### 7.1 `src/lib/auth.ts` (JWT, Cookie & Password Utilities)
```ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jharkhand_super_secret_jwt_key_min_32_bytes_2026"
);

export const SESSION_COOKIE_NAME = "sih_session";

export interface SessionPayload {
  sub: string;
  email?: string | null;
  phone?: string | null;
  role: "gov" | "university" | "industry" | "citizen" | "expert";
  status: "active" | "pending" | "locked" | "suspended";
  name: string;
  organization?: string | null;
  designation?: string | null;
  district?: string | null;
  tier: 1 | 2 | 3 | 4;
  twoFactorVerified?: boolean;
  jti?: string;
  [key: string]: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .setJti(crypto.randomUUID())
    .sign(JWT_SECRET);
}

export async function createTempToken(payload: { sub: string; scope: string; email?: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}
```

---

### 7.2 `src/lib/rateLimiter.ts` (Sliding-Window IP Rate Limiting)
```ts
interface RateLimitRecord {
  timestamps: number[];
}

const windowMs = 60 * 1000; // 1 minute window
const maxRequestsPerWindow = 10; // 10 requests per minute
const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      ipStore.delete(ip);
    }
  }
}, 30 * 1000);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = ipStore.get(ip) || { timestamps: [] };
  
  // Keep only timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequestsPerWindow) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.timestamps.push(now);
  ipStore.set(ip, record);

  return {
    allowed: true,
    remaining: maxRequestsPerWindow - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}
```

---

### 7.3 `src/lib/totp.ts` (RFC 6238 TOTP Engine)
```ts
import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const index = BASE32_ALPHABET.indexOf(clean[i]);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTOTP(secret: string, timeStep = 30, forTime = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(forTime / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (code % 1000000).toString().padStart(6, "0");
  return otp;
}

export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  if (!token || token.length !== 6) return false;
  const now = Date.now();
  const timeStep = 30;

  for (let i = -window; i <= window; i++) {
    const time = now + i * timeStep * 1000;
    if (generateTOTP(secret, timeStep, time) === token) {
      return true;
    }
  }
  return false;
}
```

---

### 7.4 `src/lib/withAuth.ts` (Backend-Enforced RBAC & Audit Middleware)
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SessionPayload } from "./auth";
// Note: In real setup, import prisma from "./prisma"
// import prisma from "./prisma";

export type UserRole = "gov" | "university" | "industry" | "citizen" | "expert";

export interface WithAuthOptions {
  roles?: UserRole[];
  requireOwnership?: boolean;
  resourceFetcher?: (req: NextRequest, ctx: any) => Promise<{ ownerId: string | null } | null>;
  action?: string;
  resource?: string;
}

export type AuthenticatedRouteHandler = (
  req: NextRequest,
  ctx: { params: any; user: SessionPayload }
) => Promise<NextResponse> | NextResponse;

async function recordAuditLog(log: {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    console.warn(`[AUDIT LOG] ${log.action} on ${log.resource} by User:${log.userId || "ANONYMOUS"} from ${log.ipAddress}`);
    // Example Prisma call:
    // await prisma.auditLog.create({ data: log });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}

export function withAuth(handler: AuthenticatedRouteHandler, options: WithAuthOptions = {}) {
  return async function (req: NextRequest, ctx: any = { params: {} }) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const resource = options.resource || req.nextUrl.pathname;

    // STAGE 1: Authentication Check
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthenticated", message: "Valid cryptographic session cookie required." },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== "active") {
      await recordAuditLog({
        userId: user.sub,
        action: `BLOCKED_NON_ACTIVE_STATUS_${user.status.toUpperCase()}`,
        resource,
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: "Account Inactive", message: `Account status is ${user.status}. Access denied.` },
        { status: 403 }
      );
    }

    // STAGE 2: Role Authorization Check
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(user.role)) {
        await recordAuditLog({
          userId: user.sub,
          action: options.action || "AUTHZ_FAILURE_ROLE_MISMATCH",
          resource,
          ipAddress: ip,
          userAgent,
        });
        return NextResponse.json(
          { 
            error: "Forbidden", 
            message: `Your role (${user.role}) does not have permission to access this resource.` 
          },
          { status: 403 }
        );
      }
    }

    // STAGE 3: Resource Ownership / Tenancy Check
    if (options.requireOwnership && options.resourceFetcher) {
      // Government nodal officials have sovereign oversight override
      if (user.role !== "gov") {
        const resourceObj = await options.resourceFetcher(req, ctx);
        if (!resourceObj || resourceObj.ownerId !== user.sub) {
          await recordAuditLog({
            userId: user.sub,
            action: options.action || "AUTHZ_FAILURE_RESOURCE_OWNERSHIP",
            resource,
            resourceId: ctx?.params?.id || null,
            ipAddress: ip,
            userAgent,
          });
          return NextResponse.json(
            { 
              error: "Forbidden", 
              message: "You do not hold administrative ownership of this specific resource." 
            },
            { status: 403 }
          );
        }
      }
    }

    // Pass validated session and context to route handler
    return handler(req, { ...ctx, user });
  };
}
```

---

## 8. Frontend Integration Blueprint (`login` and `settings`)

### 8.1 Updating `src/app/login/page.tsx`
To replace the cosmetic `setTimeout` mockup with actual cryptographic session issuance:
1. When a user clicks a persona card or fills in the phone/email form:
   - Call `POST /api/auth/login` with `{ email, password }` or `{ phone }`.
2. Handle the multi-step responses:
   - If response has `requireOtp: true`: Pop up the OTP verification modal, capture 6 digits, call `POST /api/auth/verify-otp`.
   - If response has `require2FA: true`: Pop up the TOTP 2FA modal, capture the 6-digit authenticator code, call `POST /api/auth/totp-verify`.
   - If response has `status: "pending"`: Display a specialized warning badge explaining that the Government Innovation Council must approve their corporate credentials before login is permitted.
   - If response returns `{ success: true, user }`: Route to `user.redirectUrl` (`/dashboard/gov`, `/dashboard/university`, `/dashboard/industry`, or `/submit`).

### 8.2 Updating `src/app/dashboard/settings/page.tsx`
1. **Security & 2FA Tab**:
   - Toggling 2FA triggers `POST /api/auth/totp-setup`.
   - Renders the returned QR code data URL (`qrCodeUrl`) and manual key inside a modal.
   - Prompts the user to enter the 6-digit confirmation code.
   - Dispatches `POST /api/auth/totp-verify` to activate `twoFactorEnabled: true`.
2. **Session Timeout**:
   - Calls `PATCH /api/users/profile` to update user session preferences and adjust cookie maxAge.
3. **Session Revocation**:
   - Calling revoke dispatches `POST /api/auth/revoke-session` with the session `jti`.

---

## 9. Verification & Testing Matrix

| Test Case | Method / Payload | Expected Result |
|---|---|---|
| **Tier 1 Phone OTP** | `POST /api/auth/login` with `{ phone: "+919876543210" }` | Console logs `[SMS/WhatsApp OTP to +919876543210]: XXXXXX`. Response returns `{ requireOtp: true }`. |
| **Tier 1 Invalid OTP** | `POST /api/auth/verify-otp` with `{ otp: "000000" }` | HTTP 401 Unauthorized (`attemptsRemaining: 4`). |
| **Tier 2 Non-.ac.in Domain** | `POST /api/auth/register` with `{ email: "pi@gmail.com", tier: "university" }` | HTTP 400 Bad Request (`Invalid institutional email: must end with .ac.in`). |
| **Tier 3 Pending State** | `POST /api/auth/login` with pending industry credentials | HTTP 403 Forbidden (`Account Pending Approval`). Cookie is NOT set. |
| **Tier 3 Gov Approval** | `POST /api/admin/approve-user` by `gov` user | HTTP 200 OK (`newStatus: "active"`). Industry user can now log in. |
| **Tier 4 Gov 2FA Enforcement** | `POST /api/auth/login` with gov credentials | HTTP 200 OK returning `{ require2FA: true, tempToken }`. Cookie NOT set until `totp-verify`. |
| **Account Lockout** | 5 consecutive wrong passwords | 5th failure triggers HTTP 423 Locked for 30 minutes. `AuditLogs` entry created. |
| **Rate Limiter** | 11 rapid requests to `/api/auth/login` | 11th request returns HTTP 429 Too Many Requests (`Retry-After: 60`). |
| **RBAC Role Guard** | University token requesting `GET /api/admin/pending-users` | HTTP 403 Forbidden. `AuditLogs` records `AUTHZ_FAILURE_ROLE_MISMATCH`. |
| **RBAC Ownership Guard** | University A attempting to edit Proposal of University B | HTTP 403 Forbidden. `AuditLogs` records `AUTHZ_FAILURE_RESOURCE_OWNERSHIP`. |
