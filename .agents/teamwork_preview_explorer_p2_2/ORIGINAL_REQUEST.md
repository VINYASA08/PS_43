## 2026-09-04T14:08:05Z

You are Explorer 2 investigating the Tiered Authentication System & Backend RBAC Middleware for the Jharkhand Societal Innovation Portal (web app at `a:\Development\Antigravity\SIH26043\web`).
Your working directory is: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2`

Mission & Objectives:
1. Examine `a:\Development\Antigravity\SIH26043\web` (especially `src/app/login/page.tsx`, `src/app/dashboard/settings/page.tsx`, and how user state is currently represented).
2. Design the Tiered Authentication System for the 4 distinct user tiers:
   - Tier 1: Citizens / NGOs / Experts: Phone number + OTP via SMS/WhatsApp (simulated OTP for development, logged to console with standard prefix e.g. `[SMS/WhatsApp OTP to <phone>]: 123456`).
   - Tier 2: Universities: Institutional email (`.ac.in` domain validation) + password (bcrypt hash, cost factor >= 12) + email OTP verification.
   - Tier 3: Industry: Corporate email + password + admin approval workflow (account status set to `pending` on signup; cannot access industry dashboard until a Gov admin approves).
   - Tier 4: Government Officials: Government email (`.gov.in` / `.nic.in` domain validation) + password + TOTP-based 2FA (RFC 6238 authenticator app setup with QR/secret and 6-digit verification code).
3. Design session management:
   - HttpOnly, Secure, SameSite (Strict or Lax) cookies holding signed JWT or secure session token.
   - Account lockout: Track `failedLoginAttempts` and `lockoutUntil`. After 5 consecutive failed attempts, lock account for 30 minutes.
   - Rate limiting on auth endpoints (max 10 req/min per IP).
4. Design Backend-Enforced Role-Based Access Control (RBAC):
   - Middleware or higher-order API route wrapper (`withAuth(handler, { roles: [...], requireOwnership?: boolean })`) that intercepts every request.
   - Three-stage check: (1) Is user authenticated? (2) Does user role permit this action? (3) Does user own/have access to the specific resource?
   - Return HTTP 401 for unauthenticated requests, HTTP 403 for unauthorized requests.
   - Automatically write an entry to `AuditLogs` on every authorization failure (recording userId, action, resource, resourceId, IP, user agent).
5. Specify API endpoints needed:
   - `/api/auth/register` (tiered registration supporting citizen, university, industry, gov)
   - `/api/auth/login` (initiates auth or checks password + lockout)
   - `/api/auth/verify-otp` (for citizen phone OTP and university email OTP)
   - `/api/auth/totp-setup` & `/api/auth/totp-verify` (for government 2FA)
   - `/api/auth/logout`
   - `/api/auth/session` or `/api/auth/me` (returns current user session & role)
   - `/api/admin/pending-users` & `/api/admin/approve-user` (for Gov admins to approve Industry accounts)

Write your detailed findings, auth state flow, API specifications, and middleware code architecture to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\analysis.md` and your summary to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_2\handoff.md`.
Remember: You are a read-only exploration agent. Do NOT modify source code files. Deliver your handoff and communicate completion.
