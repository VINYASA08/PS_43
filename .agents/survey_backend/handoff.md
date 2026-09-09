# Specification Mining & Backend Survey Report: Next.js API & Database Architecture

## Executive Summary
This report provides a comprehensive architectural survey and specification mining of the Next.js backend located at `a:/Development/Antigravity/SIH26043/web` for Round 5 (Mobile & Backend Integration). The investigation reveals that the endpoint `POST /api/mobile/challenges` **already exists** along with `POST /api/mobile/verify`, but has a critical schema and foreign-key constraint on `reporterId` that must be accommodated or made optional for seamless anonymous/citizen mobile submission. The Next.js backend compiles cleanly (`npm run build` with 36/36 routes and 0 errors) and connects to an existing SQLite database with 189 users and 65 challenges.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Mobile Intake | `POST /api/mobile/challenges` | Mobile problem submission endpoint with multi-track AI triage and tracking ID generation | JSON body: `title`, `description`, `district`, `location`, `reporterId` (required), `evidenceUrl` (opt), `track` (opt), `domain` (opt), `urgency` (opt) | HTTP 200 `{ success: true, trackingId, challengeId, track, trackRouting, status }` | HTTP 400 on Zod schema invalidity; HTTP 500 if `reporterId` violates FK or Prisma failure | `web/src/app/api/mobile/challenges/route.ts` |
| 2 | Mobile Verification | `POST /api/mobile/verify` | Sarpanch/Local Gov verification endpoint triggering duplicate detection and AI routing update | JSON body: `{ challengeId, sarpanchId }` | HTTP 200 `{ success: true, verified: true, challengeId, trackingId, track, trackRouting, status, routing }` | HTTP 400 if missing IDs; HTTP 403 if `sarpanchId` not role GOV; HTTP 404 if challenge missing | `web/src/app/api/mobile/verify/route.ts` |
| 3 | Core Intake | `POST /api/challenges` | Web portal challenge submission with CSRF validation, AI triage, and automatic fallback citizen reporter | JSON body matching `createChallengeSchema`, CSRF header/token, optional session cookie | HTTP 201 `{ success: true, challenge, trackingId, ai, message }` | HTTP 403 on invalid CSRF; HTTP 400 on schema invalidity; HTTP 500 on server failure | `web/src/app/api/challenges/route.ts` |
| 4 | Challenge Query | `GET /api/challenges` | Public query endpoint for listing and filtering challenges | Query params: `track`, `domain`, `district`, `urgency`, `status`, `search`, `limit`, `page` | HTTP 200 `{ success: true, challenges: [...], total, page, limit }` | HTTP 500 on query error (completely unauthenticated, no CSRF) | `web/src/app/api/challenges/route.ts` |
| 5 | Challenge Detail | `GET /api/challenges/[id]` | Public retrieval of specific challenge by cuid or publicTrackingId | Path param `id` (cuid or publicTrackingId e.g. `IN-JH-2026-103`) | HTTP 200 `{ success: true, challenge }` with relations (`reportedBy`, `assignedTo`, `proposals`) | HTTP 400 if missing ID; HTTP 404 if not found; HTTP 500 on error | `web/src/app/api/challenges/[id]/route.ts` |
| 6 | Public Tracking Docket | `GET /api/track/[id]` | Public tracking endpoint returning live status, domain telemetry, track-specific 5-stage timeline, and audit logs | Path param `id` (cuid, `publicTrackingId`, or `CH-...`) | HTTP 200 `{ success: true, issue: { id, challengeId, title, domain, track, trackRouting, location, telemetry, timeline, logs }, challenge }` | HTTP 400 if missing ID; HTTP 404 if not found | `web/src/app/api/track/[id]/route.ts` |
| 7 | Media Upload | `POST /api/upload` | Multipart file upload endpoint saving evidence images/videos to `public/uploads/` | Multipart form-data with files (JPEG, PNG, WebP, PDF, MP4, WebM, <= 10MB) | HTTP 200 `{ success: true, files: [{ name, url, type, size }] }` | HTTP 400 on unsupported MIME/ext or file size > 10MB | `web/src/app/api/upload/route.ts` |
| 8 | AI Triage & Fallback | Heuristic AI Categorization | Offline rule-based triage classifying into Track A (Innovation), Track B (Standard), Track C (Civic) with SLA and institute routing | `CategorizeProblemInput` (`title`, `description`, `district`, `location`, `evidenceNotes`, `domain`, `urgency`, `track`) | `AiCategorizationResult` with domain, urgency, track, routing target, SLA, reasoning | Resilient fallback to `heuristic-engine` when API keys are absent | `web/src/lib/ai.ts`, `web/src/lib/routing.ts` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | `POST /api/mobile/challenges` | Missing `reporterId` in JSON payload | **HTTP 400 Bad Request**: Zod schema validation fails because `reporterId: z.string()` is non-optional. Response: `{ error: "Invalid data", details: [{ path: ["reporterId"], message: "Required" }] }`. |
| 2 | `POST /api/mobile/challenges` | Arbitrary `reporterId` (e.g. `"test-citizen-id"`) not in `User` table | **HTTP 500 Internal Server Error**: SQLite / Prisma foreign key constraint `P2003` fails (`Challenge.reportedById -> User.id`). Endpoint catches error and returns `{ error: "Failed to submit challenge" }`. |
| 3 | `POST /api/mobile/challenges` | Valid existing `reporterId` (e.g. `"cmtngm5010005ugsyunbe2ich"`) | **HTTP 200 OK**: Challenge is created with generated tracking ID (`IN-JH-2026-XXXX`), `status: "REPORTED"`, and `evidence` stored as `JSON.stringify({ media: evidenceUrl })`. |
| 4 | `POST /api/mobile/challenges` | Title < 5 chars or Description < 10 chars | **HTTP 400 Bad Request**: Zod validation rejects short strings. |
| 5 | `POST /api/mobile/challenges` | No auth headers or cookies provided | **Permitted**: Route does NOT check cookies, JWT, or CSRF tokens. Unauthenticated requests are accepted provided body validation passes. |
| 6 | `GET /api/challenges/[id]` | Public tracking ID passed instead of database cuid | **HTTP 200 OK**: Route searches `where: { OR: [{ id }, { publicTrackingId: id }] }` and successfully resolves either identifier. |
| 7 | `GET /api/track/[id]` | Public tracking ID with or without `CH-` prefix | **HTTP 200 OK**: Supports `id`, `publicTrackingId`, and regex replace `^CH-` lookup. Returns track-tailored 5-step timeline. |
| 8 | `POST /api/mobile/verify` | User with role `CITIZEN` or `UNIVERSITY` passed as `sarpanchId` | **HTTP 403 Forbidden**: Explicitly checks `sarpanch.role !== "GOV"`. Only government official IDs are permitted to verify. |

---

# 5-Component Handoff Report

## 1. Observation

### 1.1 Existing Mobile API Routes
- File: `web/src/app/api/mobile/challenges/route.ts`
  - Lines 6-16:
    ```typescript
    const mobileSubmitSchema = z.object({
      title: z.string().min(5),
      description: z.string().min(10),
      district: z.string(),
      location: z.string(),
      reporterId: z.string(), // Simulating auth session from mobile
      evidenceUrl: z.string().optional(),
      track: z.string().optional(),
      domain: z.string().optional(),
      urgency: z.string().optional(),
    });
    ```
  - Lines 18-25: Validates request body using `mobileSubmitSchema.safeParse(body)`. Returns HTTP 400 if invalid.
  - Lines 31-45: Executes `categorizeProblemWithAI(...)` to determine track, domain, urgency, and SLA.
  - Lines 56-59: Generates `trackingId = IN-JH-${new Date().getFullYear()}-${randomSuffix}`.
  - Lines 60-80: Persists `prisma.challenge.create` with `reportedById: reporterId` and `evidence: evidenceUrl ? JSON.stringify({ media: evidenceUrl }) : null`.
  - Lines 82-89: Returns HTTP 200 `{ success: true, trackingId, challengeId, track, trackRouting, status }`.
  - Lines 90-93: Catches any error and returns HTTP 500 `{ error: "Failed to submit challenge" }`.

- File: `web/src/app/api/mobile/verify/route.ts`
  - Lines 5-17: Checks `challengeId` and `sarpanchId`. Checks `prisma.user.findUnique({ where: { id: sarpanchId } })` and asserts `sarpanch.role === "GOV"`. Returns 403 if not GOV.
  - Lines 25-29: Updates challenge with `localVerified: true`, `status: "CITIZEN_VERIFIED"`.
  - Lines 33-65: Evaluates AI categorization & deduplication. If duplicate, sets `status: "CLOSED"`, links `duplicateOfId`, and increments `verifiedByCount`.
  - Lines 68-84: Updates challenge with track, routing, and sets `status: "UNDER_REVIEW"`.
  - Lines 86-101: Creates `AuditLog` entry `SARPANCH_VERIFIED_AND_AI_ROUTED`.

### 1.2 Web Challenges Route Comparison
- File: `web/src/app/api/challenges/route.ts`
  - Lines 90-93: Enforces CSRF via `validateCsrfRequest(req)`.
  - Lines 105-125: Authenticates session or automatically provides a default citizen fallback:
    ```typescript
    const session = await getSession(req);
    let reporterId = session?.userId;
    if (!reporterId) {
      let defaultCitizen = await prisma.user.findFirst({
        where: { role: "CITIZEN" },
      });
      if (!defaultCitizen) {
        defaultCitizen = await prisma.user.create({
          data: {
            name: "Citizen Contributor",
            phone: "+919800000000",
            role: "CITIZEN",
            status: "ACTIVE",
            passwordHash: "N/A",
          },
        });
      }
      reporterId = defaultCitizen.id;
    }
    ```

### 1.3 Prisma Schema & Foreign Key Constraints
- File: `web/prisma/schema.prisma`
  - Lines 5-8: `datasource db { provider = "sqlite", url = env("DATABASE_URL") }`.
  - Lines 56-109: Model `Challenge`:
    - `id`: String cuid
    - `publicTrackingId`: String unique
    - `title`: String
    - `description`: String
    - `domain`: String
    - `district`: String
    - `location`: String
    - `urgency`: String (default "MEDIUM")
    - `status`: String (default "REPORTED")
    - `track`: String (default "TRACK_A_INNOVATION")
    - `trackRouting`: String?
    - `triageReasoning`: String?
    - `triageConfidence`: Float?
    - `targetEntityLevel`: String?
    - `reportedById`: String (references `User.id`)
    - `evidence`: String? (JSON string storing media URLs / telemetry)
    - `citizenVerified`: Boolean (default false)
    - `localVerified`: Boolean (default false)
    - `slaDeadline`: DateTime?
  - Foreign key constraint directly observed when invoking `prisma.challenge.create` with non-existent `reporterId: "test-citizen-id"`:
    ```
    PrismaClientKnownRequestError: Foreign key constraint failed on the field: foreign key
    code: 'P2003', meta: { modelName: 'Challenge', field_name: 'foreign key' }
    ```

### 1.4 Database State & Existing Users
- File: `web/.env` defines `DATABASE_URL="file:./dev.db"`.
- SQLite file exists at `web/prisma/dev.db`.
- Database query result:
  - Total users: **189**
  - Total challenges: **65**
  - Seeded Citizen User: `id = "cmtngm5010005ugsyunbe2ich"`, name = "Pooja Murmu", role = "CITIZEN", phone = "+919708099999"
  - Seeded Gov User: `id = "cmtngm4zn0000ugsybs34av5c"`, name = "Dr. R. K. Soren, IAS", role = "GOV"

### 1.5 Build & Test Tool Results
- Tool command: `npm run build` in `web/`
  - Result: Exit code 0.
  - Next.js compiled 36 routes (both static and dynamic) with 0 errors.
  - Confirmed routes include `/api/mobile/challenges` and `/api/mobile/verify`.
- Tool command: `npx tsx tests/test_3track_triage.ts` in `web/`
  - Result: Exit code 0.
  - 12/12 test assertions passed.

### 1.6 Mobile Codebase State
- File: `mobile/shared/src/commonMain/kotlin/network/ApiClient.kt`:
  - Contains calls to `/api/analytics`, `/api/challenges`, `/api/proposals`, `/api/funds`, `/api/admin/pending-users`, `/api/audit-logs`.
  - Does NOT yet have a function calling `POST /api/mobile/challenges`.
- File: `mobile/shared/src/commonMain/kotlin/screens/CitizenSubmitScreen.kt`:
  - Contains fields for `title` and `description`.
  - Does NOT yet include `district` or `domain` dropdowns/inputs, nor does it have "get current location" or simulated photo/video attachment injection.
  - Line 85 has a placeholder `kotlinx.coroutines.delay(1000)`.

---

## 2. Logic Chain

1. **Endpoint Existence vs. Requirement Alignment**:
   - `ORIGINAL_REQUEST.md` (lines 203-215) asks for a mobile problem submission screen with fields (`title`, `description`, `district`, `domain`), simulated buttons ("attach photos/videos", "get current location"), and a `POST /api/mobile/challenges` Ktor integration to `http://10.0.2.2:3000`.
   - Inspection of `web/src/app/api/mobile/challenges/route.ts` confirms that `POST /api/mobile/challenges` is already implemented and functional.
   - However, `mobileSubmitSchema` in `route.ts` requires `reporterId: z.string()`.
   - In `ORIGINAL_REQUEST.md`, there is no requirement for citizen users to authenticate or enter a user ID on the mobile submission screen ("The app should allow any user to submit local challenges...").

2. **Foreign Key Risk in SQLite**:
   - The Prisma `Challenge` model specifies `reportedById String` referencing `User.id`.
   - SQLite enforces foreign keys in Prisma 5.11.0. When tested, passing a non-existent `reporterId` triggered a `P2003` constraint failure resulting in an HTTP 500 error from the endpoint.
   - Conversely, the web submission endpoint (`src/app/api/challenges/route.ts`) solves this by defaulting to an existing or auto-created `CITIZEN` record (`prisma.user.findFirst({ where: { role: "CITIZEN" } })`).
   - Therefore, to ensure robust zero-friction integration for any mobile user, the backend route `src/app/api/mobile/challenges/route.ts` should make `reporterId` optional with the same fallback pattern, OR the mobile client must pass the known default citizen ID (`cmtngm5010005ugsyunbe2ich`).

3. **Verification and Public Docket Access**:
   - Acceptance criteria require verifying that submissions are stored with simulated location and media data.
   - We observed that `POST /api/mobile/challenges` returns `{ success: true, trackingId, challengeId, track, trackRouting, status }`.
   - Submissions can be verified through three separate methods:
     a. Querying SQLite directly via Prisma (`prisma.challenge.findUnique({ where: { id: challengeId } })`).
     b. Public REST API query `GET /api/challenges/[id]` or `GET /api/challenges/[trackingId]` (no auth, no CSRF required).
     c. Public REST API query `GET /api/track/[trackingId]` (returns complete 5-stage timeline, telemetry, and audit trail).

---

## 3. Caveats

1. **Server Execution State**:
   - The Next.js dev server is not running continuously on port 3000 right now. For live E2E mobile testing, `npm run dev` (or `npm run start`) must be launched in `web/` before the mobile app connects.
2. **AI Provider Fallback**:
   - External LLM API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are optional; the backend automatically falls back to `evaluateHeuristicCategorization`, so no external internet connection or API credits are required for triage and routing to succeed.
3. **Evidence Storage Format**:
   - `evidenceUrl` passed to `POST /api/mobile/challenges` is stored in the database as a JSON string: `JSON.stringify({ media: evidenceUrl })` in the `evidence` column of `Challenge`. When querying via Prisma or `GET /api/challenges/[id]`, the evidence field will contain this JSON string.

---

## 4. Conclusion

1. **Endpoint Status**: `POST /api/mobile/challenges` is already implemented in `web/src/app/api/mobile/challenges/route.ts`.
2. **Payload Specification**:
   - `title`: string (min 5 characters)
   - `description`: string (min 10 characters)
   - `district`: string (e.g. "Ranchi", "Dhanbad", "Gumla", "Simdega")
   - `location`: string (e.g. "23.3441° N, 85.3096° E, Ranchi" or block/village description)
   - `domain`: string (e.g. "Water Management", "Agriculture", "Healthcare", "Urban Infrastructure", "Environment", "Energy", "Sanitation", "Rural Livelihoods", "Public Service Delivery")
   - `evidenceUrl`: string (optional, e.g. mock URL or uploaded image URL)
   - `reporterId`: string (currently required by backend schema; must be made optional or supplied as `"cmtngm5010005ugsyunbe2ich"`)
   - `track`: string (optional: "TRACK_A_INNOVATION", "TRACK_B_STANDARD", "TRACK_C_CIVIC")
   - `urgency`: string (optional: "CRITICAL", "HIGH", "MEDIUM", "LOW")
3. **Recommended Backend Optimization**:
   - In `web/src/app/api/mobile/challenges/route.ts`, update `mobileSubmitSchema` to `reporterId: z.string().optional()`, and fallback to `prisma.user.findFirst({ where: { role: "CITIZEN" } })` if not provided. This ensures that any mobile submission payload will succeed unconditionally.
4. **Backend Readiness**:
   - `npm run build` succeeds with 0 errors.
   - Database is fully migrated and seeded at `web/prisma/dev.db`.
   - REST verification endpoints (`GET /api/challenges/:id` and `GET /api/track/:id`) are fully functional and unauthenticated.

---

## 5. Verification Method

To independently verify these findings, execute the following commands in `a:/Development/Antigravity/SIH26043/web`:

1. **Verify Database Connection and Records**:
   ```pwsh
   node tests/test_prisma_connection.mjs
   ```
   *Expected result*: User count: 189, Challenge count: >= 65.

2. **Verify 3-Track Triage & Database Lifecycle**:
   ```pwsh
   npx tsx tests/test_3track_triage.ts
   ```
   *Expected result*: `12 PASSED | 0 FAILED | 12 TOTAL`.

3. **Verify Clean Next.js Build**:
   ```pwsh
   npm run build
   ```
   *Expected result*: Compiled successfully with 0 errors across all 36 routes.

4. **Verify Mobile Endpoint Code**:
   Inspect `web/src/app/api/mobile/challenges/route.ts` lines 6-27 to confirm schema rules, and lines 60-80 to inspect Prisma `create` parameters.

5. **Invalidation Conditions**:
   - If `POST /api/mobile/challenges` is invoked with `{ reporterId: "invalid-nonexistent-id" }`, it must fail with Prisma foreign key error `P2003` unless the route fallback is added.
   - If `npm run build` fails on type errors or missing dependencies, the findings would be invalidated.
