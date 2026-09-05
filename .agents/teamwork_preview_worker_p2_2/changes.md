# Milestone 2 Implementation Changes

## 1. Security & Authentication Utilities (`src/lib/`)
- **`src/lib/totp.ts`**:
  - Implemented RFC 6238 Time-Based One-Time Password (TOTP) generator and validator using HMAC-SHA1 and standard Base32 decoding with bit shifting.
  - Generates Base32 secrets (20 bytes / 160-bit cryptographic entropy).
  - Validates 6-digit codes with ±1 time step (30s) drift tolerance.
  - Implemented QR code generator via `qrcode.toDataURL()` producing standard `otpauth://totp/JH-Portal:{email}?secret={secret}&issuer=Jharkhand%20Societal%20Innovation%20Portal` URI strings.
- **`src/lib/csrf.ts`**:
  - Implemented cryptographic CSRF token generation using HMAC-SHA256 (`crypto.randomBytes(32)` + HMAC signature).
  - Enforced Double-Submit Cookie pattern matching `X-CSRF-Token` header against `sih_csrf` cookie value with timing-safe comparison (`crypto.timingSafeEqual`).
- **`src/lib/rateLimiter.ts`**:
  - Sliding-window in-memory IP rate limiter (default: 10 requests / 60 seconds) with automatic cleanup of expired sliding-window timestamps.
- **`src/lib/otp.ts`**:
  - In-memory OTP store hashing 6-digit numeric verification codes with SHA-256 and salt, expiring after 10 minutes. Includes simulated SMS/WhatsApp and institutional email logging (`[SMS/WhatsApp OTP to +91...]: 123456`).
- **`src/lib/validation.ts`**:
  - Extended Zod validation schemas for all registration types (Citizen, University, Industry, Gov), login requests (with optional TOTP), challenge creation and update, DPR proposal submissions, and funding commitment / escrow pledges.
- **`src/lib/auth.ts`**:
  - Added `signTempToken` and `verifyTempToken` for multi-step two-factor authentication (GOV role TOTP verification).
- **`src/lib/api-client.ts`**:
  - Centralized `apiFetch` HTTP client wrapping `fetch` with `credentials: "include"`, automatic CSRF header injection (`X-CSRF-Token` from cookie), consistent error handling, and redirection on 401 unauthorized responses.

## 2. Global State & UI Components
- **`src/stores/authStore.ts`**:
  - Zustand store managing user authentication state, current session payload, loading status, `checkSession()`, `login()`, `logout()`, and `setUser()`.
- **`src/components/auth/RoleGuard.tsx`**:
  - Client-side role authorization guard. Verifies user role against allowed roles, redirecting unauthenticated users to `/login` and unauthorized users to their respective role dashboard.
- **`src/components/ui/Skeletons.tsx`**:
  - Modular loading skeletons: `StatsSkeleton`, `CardSkeleton`, `TableSkeleton`, `DetailSkeleton`, and full `SkeletonPage`.
- **`src/components/ui/EmptyState.tsx`**:
  - Reusable empty state component with customizable icons, title, description, and action CTA button.
- **`src/components/ui/NetworkBanner.tsx`**:
  - Offline / reconnecting network detection banner using `navigator.onLine` and `window.addEventListener("online" / "offline")`. Integrated in root `src/app/layout.tsx`.
- **`src/app/dashboard/layout.tsx`**:
  - Wrapped in `RoleGuard`, displaying authenticated user credentials, role badge, organization, and dynamic role-based navigation tabs.

## 3. Tiered Authentication & Admin API Routes (`src/app/api/`)
- **`/api/auth/register`**:
  - Handles tiered registration:
    - Citizen: Phone number validation, simulated SMS OTP dispatch.
    - University: `.ac.in` domain enforcement, bcrypt password hashing (cost factor 12), simulated email OTP.
    - Industry: Corporate email, bcrypt password, account created in `PENDING` status requiring government approval.
    - Government: `.gov.in` or `.nic.in` domain enforcement, bcrypt password, immediate activation.
- **`/api/auth/login`**:
  - Rate-limited (10 req/min).
  - Handles Citizen OTP login, University/Industry/Gov password verification.
    - 403 Forbidden for accounts in `PENDING` status.
    - 423 Locked for locked accounts with remaining lockout countdown.
    - 5 failed attempts locks account for 30 minutes.
    - Two-factor check for 2FA-enabled accounts: returns `{ requires2FA: true, tempToken }`.
    - TOTP code verification via `totp.ts`.
    - Session cookie generation via `attachSessionCookie()`.
- **`/api/auth/verify-otp`**:
  - Verifies registration or login OTPs, activates citizen/university accounts, and logs them in.
- **`/api/auth/totp-setup` & `/api/auth/totp-verify`**:
  - Setup returns QR code data URL and Base32 secret; verify confirms 6-digit code, sets `twoFactorEnabled: true`, and updates session.
- **`/api/auth/logout` & `/api/auth/me`**:
  - Clears `sih_session` cookie; returns current user session and Prisma profile.
- **`/api/admin/pending-users` & `/api/admin/approve-user`**:
  - Gov-only admin routes to review pending industrial registrations and approve them to `ACTIVE` status with audit logging.

## 4. Core Domain API Routes
- **`/api/challenges` & `/api/challenges/[id]`**:
  - Full CRUD with domain/district/urgency filters, public tracking ID generation (`JH-2026-XXXX`), evidence and proposal relation inclusion, soft deletion (`deletedAt`), and audit log entries.
- **`/api/challenges/[id]/apply`**:
  - Allows University faculty to submit DPR proposals against open challenges.
- **`/api/proposals` & `/api/proposals/[id]`**:
  - Creation, listing, filtering by challenge/status, and status updates (SUBMITTED, UNDER_REVIEW, SHORTLISTED, APPROVED, FUNDED).
- **`/api/funds` & `/api/funds/[id]`**:
  - Escrow pledge creation with `JH-ESCROW-XXXX` reference, validation, and listing.
- **`/api/analytics`**:
  - Aggregates challenge counts, resolution rates, escrowed funds, active proposals, and district breakdowns directly from Prisma.
- **`/api/track/[id]`**:
  - Public tracking lookup supporting either internal UUID or `publicTrackingId` (e.g. `IN-GR-2026-9842`), returning SLA timelines and audit events.
- **`/api/audit-logs`**:
  - Gov-protected audit trail inspection.
- **`/api/csrf`**:
  - Issues signed CSRF tokens.
- **`/api/users/profile`**:
  - Authenticated profile name and organization update endpoint.
- **`/api/intake/whatsapp-simulate`**:
  - Public citizen grievance intake endpoint creating database challenge records with tracking IDs.

## 5. End-to-End Database Wiring Across All Pages
- **`/` (Landing Page)**: Live metrics from `/api/analytics` and challenges from `/api/challenges`.
- **`/dashboard` (Overview)**: Real-time challenge and funding metrics.
- **`/dashboard/gov` (Government Portal)**: Live challenges, pending industry approvals with one-click approve, live domain stats, audit logs, and CSV export.
- **`/dashboard/university` (University Portal)**: Live open challenges and DPR proposals from DB.
- **`/dashboard/industry` (Industry Portal)**: Live proposals seeking CSR funding, active escrow commitments, and filter modal.
- **`/challenge/[id]` (Challenge Details)**: Dynamic challenge details, telemetry metrics, proposals, and collaboration modal.
- **`/whatsapp-intake`**: Real submission to `/api/intake/whatsapp-simulate` generating real tracking IDs.
- **`/accountability` (GRAI Index)**: Live SLA compliance, district metrics, and leaderboard.
- **`/submit` (Submit Challenge)**: Real POST to `/api/challenges` returning real tracking ID.
- **`/track` (Track Problem)**: Live status lookup against `/api/track/[id]`.
- **`/dashboard/settings`**: Dynamic profile update and interactive 2FA setup with QR code scanner.
- **`/apply/[challengeId]`**: Real DPR proposal submission to `/api/challenges/[id]/apply`.
- **`/dashboard/university/proposal/[id]`**: Dynamic proposal view and DPR submission.
- **`/dashboard/industry/fund/[id]`**: Dynamic funding pledge submission to `/api/funds`.
- **`/login`**: Multi-tiered authentication UI with Citizen OTP, University `.ac.in`, Industry pending approval notice, Gov 2FA TOTP modal, and quick demo persona buttons.
