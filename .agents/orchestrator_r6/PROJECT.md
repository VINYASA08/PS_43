# Project: District Nodal Officer Routing & University Claim System (SIH26043)

## Architecture
- **Framework**: Next.js 16.3.4 (App Router, Turbopack, React 19)
- **Database Engine**: SQLite via Prisma ORM 5.11.0 (`web/prisma/schema.prisma`, `web/prisma/dev.db`)
- **Triage Mechanism**: Replaces Sarpanch verification (`localVerified`) with District Nodal Officer triage (`nodalStatus`: `pending`, `rejected`, `diverted_to_gov`, `routed_to_academia`).
- **AI Matching**: Algorithmic scoring service in `web/src/lib/ai-matching.ts` matching 3 empanelled universities from `web/src/lib/routing.ts` based on domain, district, and thematic focus. Simulates email notifications via console logging.
- **Atomic Concurrency**: Prisma conditional update (`prisma.challenge.updateMany({ where: { id, nodalStatus: "routed_to_academia", claimedAt: null }, data: { claimedById, claimedInstitute, claimedAt: new Date() } })`) guaranteeing atomic mutual exclusion for university claims.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Remove Sarpanch Verification | Delete `localVerified` field from `Challenge` in `schema.prisma`, decommission/refactor `/api/mobile/verify`. | M1 | Survey DB/API |
| 2 | Nodal Officer Triage Schema | Add `nodalStatus` enum/string, `rejectionReason`, `divertedTarget`, `divertedAt`, `matchedUniversities`, `claimedById`, `claimedInstitute`, `claimedAt`, `nodalOfficerId`, `nodalReviewedAt`. | M1 | Survey DB |
| 3 | Database Push & Seed Data | Run `prisma db push`, update `prisma/seed.ts` with 3 university accounts and sample challenges in all nodal states. | M1 | Survey DB |
| 4 | Nodal Triage API | Implement `POST /api/nodal/triage` with `reject` (reason required), `divert_to_gov` (target required), `route_to_academia`. | M2 | Survey API |
| 5 | AI 3-Way Match & Mock Emails | Service scoring empanelled universities and logging structured mock emails to console upon routing to academia. | M2 | Survey API |
| 6 | Atomic Claim Race Condition API | Implement `POST /api/challenges/[id]/claim` with atomic `updateMany` locking (200 on first claim, 409 on subsequent). | M2 | Survey API |
| 7 | Nodal Officer Web Dashboard | Next.js UI in `/dashboard/nodal` and `/dashboard/gov` for pending citizen submissions with Reject, Divert, and Route actions. | M3 | Survey UI |
| 8 | University Claim UI | Next.js UI in `/dashboard/university` and `/challenge/[id]` displaying matched challenges and Claim button. | M3 | Survey UI |
| 9 | Next.js Build Integrity | Clean `npm run build` with zero TypeScript errors across all routes. | M3 | Survey UI |
| 10 | Automated Verification Suite | Test script `tests/test_nodal_triage_and_claim.ts` asserting routing, University A claim (200), University B rejection (409). | M4 | Survey Test |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database & Schema Updates | Remove `localVerified`, add nodal triage fields, `db push`, update seeds. | none | DONE |
| 2 | Backend APIs & Concurrency | Nodal triage API, AI 3-way match, console emails, atomic claim endpoint. | M1 | DONE |
| 3 | Frontend Dashboards & Claim UI | Nodal triage UI (`/dashboard/nodal`), university claim UI, Next.js build verification. | M2 | DONE |
| 4 | E2E Testing & Acceptance Verification | Test suite `tests/test_nodal_triage_and_claim.ts` executing end-to-end race condition assertions. | M2, M3 | DONE |

## Interface Contracts
### `POST /api/nodal/triage`
- **Request Body**:
  ```json
  {
    "challengeId": "string (cuid)",
    "action": "reject" | "divert_to_gov" | "route_to_academia",
    "rejectionReason": "string (mandatory if action == 'reject', min 5 chars)",
    "divertedTarget": "string (mandatory if action == 'divert_to_gov', e.g. 'PWD/RCD', 'RMC')",
    "nodalOfficerId": "string (optional, defaults to session user)"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true, "challengeId": "...", "nodalStatus": "...", "message": "..." }`
  - `400 Bad Request`: `{ "error": "Validation error: reason required for rejection" }`
  - `404 Not Found`: `{ "error": "Challenge not found" }`

### `POST /api/challenges/[id]/claim`
- **Request Body**:
  ```json
  {
    "universityId": "string (cuid)",
    "universityName": "string (e.g. 'IIT (ISM) Dhanbad')"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "challengeId": "...",
      "claimedBy": "...",
      "claimedInstitute": "...",
      "claimedAt": "2026-09-08T18:50:00.000Z",
      "message": "Challenge successfully claimed"
    }
    ```
  - `409 Conflict`:
    ```json
    {
      "error": "Challenge is already claimed by another university or not open for claiming",
      "claimedInstitute": "..."
    }
    ```
  - `400 Bad Request` / `404 Not Found`

## Code Layout
- `web/prisma/schema.prisma`: Database models (`User`, `Challenge`, etc.)
- `web/prisma/seed.ts`: Seed data for users, challenges, university accounts
- `web/src/lib/ai-matching.ts`: AI 3-way matching logic and console mock email dispatch
- `web/src/lib/routing.ts`: Empanelled universities and state line departments catalog
- `web/src/app/api/nodal/triage/route.ts`: Nodal triage action handler
- `web/src/app/api/challenges/[id]/claim/route.ts`: University claim handler with atomic race condition
- `web/src/app/dashboard/nodal/page.tsx`: Dedicated Nodal Officer Triage Dashboard
- `web/src/app/dashboard/gov/page.tsx`: Embedded Nodal Triage section in Gov Dashboard
- `web/src/app/dashboard/university/page.tsx`: University view with matched & claimed challenges
- `tests/test_nodal_triage_and_claim.ts`: Automated test suite for race condition & triage verification
