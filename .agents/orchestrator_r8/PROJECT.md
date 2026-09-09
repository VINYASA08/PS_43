# Project: Account Handover Portal (Round 8)

## Architecture
- **Web Application Root**: `web/`
- **Database & ORM**: SQLite (`web/prisma/schema.prisma`) with Prisma Client.
- **Authentication**: JWT HS256 (`jose`) via HTTP-only `sih_session` cookie; password hashing via `bcryptjs` (cost factor 12).
- **Relational Model**: `User` table connects to 10 dependent models (`Challenge`, `Proposal`, `FundingCommitment`, `AuditLog`, `ChatMessage`, `MicroTask`). Preserving `User.id` ensures 100% data, history, and role continuity.
- **New Model**: `HandoverToken` in `prisma/schema.prisma` tracking token string, userId, successorEmail, expiresAt, usedAt, createdAt.
- **Backend Endpoints**:
  - `POST /api/handover/initiate` (Protected with `withAuth`)
  - `GET /api/handover/[token]` (Public)
  - `POST /api/handover/[token]/claim` (Public)
  - `POST /api/handover/cancel` (Protected with `withAuth`)
- **Frontend Pages**:
  - `/dashboard/settings` (Client component in `DashboardLayout`, new "Account Handover" tab)
  - `/handover/[token]` (Public client component for successor claim & credential setup)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | HandoverToken Schema | Prisma model and relation to User for handover tokens | M1 | Survey & ORIGINAL_REQUEST |
| 2 | Initiate Handover API | `POST /api/handover/initiate`: generates crypto token, 48h expiry, revokes pending, logs mock email | M1 | ORIGINAL_REQUEST §R2 |
| 3 | Validate Handover Token API | `GET /api/handover/[token]`: public validation returning predecessor metadata | M1 | Survey & ORIGINAL_REQUEST |
| 4 | Claim Handover API | `POST /api/handover/[token]/claim`: atomic transaction updating email, name, passwordHash, resets 2FA/lockout, preserves user ID | M1 | ORIGINAL_REQUEST §R3 |
| 5 | Cancel Handover API | `POST /api/handover/cancel`: cancels pending invite for logged-in user | M1 | Survey & UX |
| 6 | Settings UI Handover Section | Add Account Handover tab to `/dashboard/settings`, input successor email, display status/cancel | M2 | ORIGINAL_REQUEST §R1 |
| 7 | Successor Claim Public Route | `/handover/[token]` page with predecessor card, name & password input, client validation, auth redirect | M3 | ORIGINAL_REQUEST §R3 |
| 8 | Automated Programmatic Test | Script simulating full handover flow (User A token gen -> User B redemption -> User B login & ID check) | M4 | ORIGINAL_REQUEST §Acceptance |
| 9 | Hydration & Build Verification | Verify settings & claim page render with 0 hydration errors; `npm run build` completes with 0 errors | M4 | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Handover Token Generation & DB Schema | Schema migration, `POST /api/handover/initiate`, `GET /api/handover/[token]`, `POST /api/handover/[token]/claim`, console email simulation | none | PLANNED |
| M2 | Settings UI Handover Section Integration | "Account Handover" tab in `/dashboard/settings`, email input, pending status card, revoke action | M1 | PLANNED |
| M3 | Public Successor Claim Route | `/handover/[token]` page, predecessor verification card, credential setup form, error states | M1 | PLANNED |
| M4 | E2E Testing, Adversarial Hardening & Build Verification | Automated simulation script, security tests (expiry, replay, lockout), hydration verification, `npm run build` | M1, M2, M3 | PLANNED |

## Interface Contracts

### 1. `POST /api/handover/initiate`
- **Request Headers**: `Cookie: sih_session=...`, `x-csrf-token: ...`
- **Request Body**:
  ```json
  { "successorEmail": "successor@gov.in" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Handover invitation initiated successfully.",
    "token": "...",
    "expiresAt": "2026-09-11T15:20:00.000Z",
    "successorEmail": "successor@gov.in"
  }
  ```
- **Console Log Output**: Formatted console banner `📧 [MOCK EMAIL DISPATCH] ACCOUNT HANDOVER INVITATION`.

### 2. `GET /api/handover/[token]`
- **Response (200 OK)**:
  ```json
  {
    "valid": true,
    "successorEmail": "successor@gov.in",
    "predecessor": {
      "name": "Dr. R. K. Soren, IAS",
      "designation": "Principal Secretary",
      "organization": "Jharkhand State Innovation Council",
      "role": "GOV",
      "district": "Ranchi"
    },
    "expiresAt": "2026-09-11T15:20:00.000Z"
  }
  ```
- **Response (400 / 404 / 410)**:
  ```json
  { "valid": false, "error": "Handover token is invalid or has expired." }
  ```

### 3. `POST /api/handover/[token]/claim`
- **Request Body**:
  ```json
  {
    "successorName": "Ananya Sharma",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Account successfully claimed.",
    "user": {
      "id": "cuid...",
      "name": "Ananya Sharma",
      "email": "successor@gov.in",
      "role": "GOV"
    },
    "redirectUrl": "/dashboard/gov"
  }
  ```
- **Side Effects**: Sets `sih_session` cookie; updates user credentials; resets 2FA/lockouts; preserves `User.id`; marks token used; creates `AuditLog`.

## Code Layout
- `web/prisma/schema.prisma` -> `model HandoverToken` + relation in `model User`
- `web/src/app/api/handover/initiate/route.ts` -> Initiate handover endpoint
- `web/src/app/api/handover/[token]/route.ts` -> Token verification & claim endpoint
- `web/src/app/api/handover/[token]/claim/route.ts` -> Explicit claim subpath endpoint
- `web/src/app/api/handover/cancel/route.ts` -> Cancel pending handover endpoint
- `web/src/app/dashboard/settings/page.tsx` -> Settings UI with Account Handover tab
- `web/src/app/handover/[token]/page.tsx` -> Public successor claim page
- `web/tests/e2e-handover.test.ts` (or script `scripts/test-handover-flow.ts`) -> End-to-end programmatic verification script
