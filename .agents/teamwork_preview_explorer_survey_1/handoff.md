# Handoff Report: Database & Schema Survey (Sarpanch to District Nodal Officer Pivot)

**Author**: Explorer Survey 1 (Database & Schema)  
**Date**: 2026-09-08T18:43:00Z  
**Target Milestone**: Architectural Pivot to District Nodal Officer Routing System  
**Working Directory**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_1`

---

## 1. Observation

### 1.1 Database Engine, Prisma Configuration, and File Locations
- **Prisma Schema Path**: `a:/Development/Antigravity/SIH26043/web/prisma/schema.prisma`
- **Database Engine**: SQLite (`provider = "sqlite"`, `url = env("DATABASE_URL")` pointing to `file:./dev.db` in `web/.env`).
- **Prisma Version**: `5.11.0` (validated via `npx prisma --version` with engine hash `efd2449663b3d73d637ea1fd226bafbcf45b3102`).
- **Schema Validation**: Verified valid via `npx prisma validate` on 2026-09-08T18:42:53Z.
- **Migration Directory**: There is **no `prisma/migrations` directory** in `web/prisma/`. The project utilizes direct schema synchronization via `npx prisma db push`.
- **Seed Script**: Configured in `web/package.json` as `"prisma": { "seed": "npx tsx prisma/seed.ts" }`, executable via `npx prisma db seed`.
- **Client Extensions**: `web/src/lib/prisma.ts` implements global `$extends` query extensions for soft deletes on `User`, `Challenge`, `Proposal`, and `FundingCommitment` (filtering `deletedAt: null`).

### 1.2 All Tables, Enums, and Fields Relating to Sarpanch, Citizens, Challenges, and Universities

#### A. Sarpanch Occurrences
1. `web/prisma/schema.prisma` (line 84):
   ```prisma
   localVerified        Boolean         @default(false) // Verified by Local Gov / Sarpanch
   ```
2. `web/src/app/api/mobile/verify/route.ts`:
   - Line 7: `const { challengeId, sarpanchId } = await req.json();`
   - Lines 14–17: Checks `sarpanch = await prisma.user.findUnique({ where: { id: sarpanchId } })` and `sarpanch.role !== "GOV"`.
   - Line 28: Executes `prisma.challenge.update({ where: { id: challengeId }, data: { localVerified: true, status: "CITIZEN_VERIFIED" } })`.
   - Line 89: Writes AuditLog with `action: "SARPANCH_VERIFIED_AND_AI_ROUTED"`.
3. `web/tests/mobile-pipeline.mjs` (lines 25–27): Calls `/api/mobile/verify` with `sarpanchId: "test-sarpanch-id"`.
4. `architecture_flow.md` (lines 48, 61, 186–218, 345, 512–514): References Sarpanch ground physical verification.
5. `mobile/` Kotlin Multiplatform app: `SarpanchVerifyScreen.kt`, `CitizenSubmitScreen.kt`, `LoginScreen.kt`, `LocalizationEngine.kt`.
*Note*: No frontend `.tsx` page in `web/src/` references `sarpanch` or `localVerified`.

#### B. Citizen Submissions (`model User` & `model Challenge`)
- `model User`:
  - `role`: String defaulting to `"CITIZEN"`.
  - `status`: String defaulting to `"ACTIVE"`.
  - `name`, `phone`, `email`, `organization`, `district`.
  - Back-relation: `reportedChallenges Challenge[] @relation("ReportedBy")`.
- `model Challenge`:
  - Primary Keys & Identifiers: `id String @id @default(cuid())`, `publicTrackingId String @unique` (e.g. `IN-GR-2026-9842`).
  - Problem Details: `title`, `description`, `domain`, `district`, `location`, `urgency` (default `"MEDIUM"`), `status` (default `"REPORTED"`).
  - 3-Track Triage: `track` (default `"TRACK_A_INNOVATION"`), `trackRouting`, `triageReasoning`, `triageConfidence`, `targetEntityLevel`.
  - Reporter FK: `reportedById String`, `reportedBy User @relation("ReportedBy", fields: [reportedById], references: [id])`.
  - Evidence: `evidence String?` (JSON serialized media URLs and sensor readings).
  - Citizen Verification: `citizenVerified Boolean @default(false)` (citizen upvote/confirmation).
  - Deduplication: `duplicateOfId String?`, `duplicates Challenge[]`, `verifiedByCount Int @default(0)`.
  - Escalation & AI: `escalationLevel Int @default(0)` (`0: Normal, 1: Nodal Officer, 2: District Collector, 3: Chief Secretary`), `slaDeadline DateTime?`, `aiConfidence Float?`, `aiReasoning String?`.
  - Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`.

#### C. Universities and Institutional Matching
- `model User`:
  - `role`: `"UNIVERSITY"`.
  - `organization`: University/Institute name (e.g., `"IIT (ISM) Dhanbad"`).
  - Back-relation: `submittedProposals Proposal[] @relation("SubmittedBy")`.
- `model Challenge`:
  - `assignedToId String?`, `assignedTo User? @relation("AssignedTo", fields: [assignedToId], references: [id])`.
  - `assignedInstitute String?` (e.g. `"IIT ISM Dhanbad"`).
- `model Proposal`:
  - `id String @id @default(cuid())`, `proposalRef String @unique` (e.g. `"PR-102"`).
  - `challengeId String`, `challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)`.
  - `submittedById String`, `submittedBy User @relation("SubmittedBy", ...)`.
  - `universityName String`.
  - `title`, `abstract`, `methodology`, `budget Float`, `timelineMonths Int`, `stage String`, `status String` (default `"SUBMITTED"`).
- `web/src/lib/routing.ts`:
  - `EMPANELLED_INSTITUTIONS`: Catalog of 10 Jharkhand institutions (`IIT_ISM_DHANBAD_WATER`, `IIT_ISM_DHANBAD_ENV`, `BAU_RANCHI`, `RIMS_BIT_HEALTH`, `NIT_JAMSHEDPUR_ENERGY`, `CUJ_EDUCATION`, `BIT_MESRA_CIVIL`, `XISS_GOVERNANCE`, `XISS_LIVELIHOOD`, `NIT_BIT_WASTE`).
- `web/src/lib/types.ts`:
  - `UserRole.UNIVERSITY = "UNIVERSITY"`.
  - `TargetEntityLevel.ACADEMIC_RESEARCH = "ACADEMIC_RESEARCH"`.

#### D. Government Bodies (for Track B / Diverted Issues)
- `web/src/lib/routing.ts`:
  - `STATE_LINE_DEPARTMENTS`: Contains canonical government bodies:
    - `RCD_INFRASTRUCTURE`: Road Construction Department (RCD) / State PWD & Rural Works Department.
    - `DWSD_WATER`: Drinking Water & Sanitation Department (PHED).
    - `JUVNL_ENERGY`: Jharkhand Urja Vikas Nigam Limited (Energy & Power).
    - `HEALTH_DEPARTMENT`: Dept of Health, Medical Education & Family Welfare.
    - `WRD_IRRIGATION`: Water Resources Department (Minor Irrigation & Dam Safety).
    - Municipal Corporations & Urban Local Bodies (ULBs).

---

## 2. Logic Chain

### 2.1 Why `localVerified` Must Be Removed and Its Impact
1. **Direct Mandate**: The authoritative request (`## 2026-09-08T18:38:41Z`) explicitly directs: *"Update the Prisma schema to remove Sarpanch verification data."*
2. **Current State**: Line 84 of `schema.prisma` contains `localVerified Boolean @default(false) // Verified by Local Gov / Sarpanch`.
3. **Downstream Callers**: Grep analysis across all TypeScript files revealed that `localVerified` is only referenced in `web/src/app/api/mobile/verify/route.ts` line 28. No frontend UI page or component consumes `localVerified`.
4. **Conclusion**: Removing `localVerified` from `model Challenge` in `schema.prisma` is safe for the web frontend. The mobile verification endpoint (`/api/mobile/verify`) must be decommissioned or adapted into the District Nodal Officer workflow.

### 2.2 Why a Dedicated `nodalStatus` Field is Superior to Overwriting `status`
1. **Existing Workflow States**: The existing `status` field on `Challenge` manages the macro lifecycle across the entire application: `REPORTED`, `CITIZEN_VERIFIED`, `UNDER_REVIEW`, `OPEN_FOR_PROPOSALS`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`. Multiple dashboards and analytical endpoints (`/api/analytics`, `/api/challenges`, `/dashboard/gov`, `/dashboard/university`) rely on these macro statuses.
2. **Nodal Triage Specificity**: The District Nodal Officer triage system introduces 4 distinct operational triage states:
   - `pending`: Newly submitted citizen grievance awaiting Nodal Officer review.
   - `rejected`: Canceled by Nodal Officer with mandatory rejection reason.
   - `diverted_to_gov`: Diverted to a specialized government body (e.g., PWD, Municipal Corp).
   - `routed_to_academia`: Pushed to AI matching for 3 universities to claim.
3. **Duality of State**: Adding `nodalStatus String @default("pending")` allows the Nodal Officer dashboard to filter directly on `nodalStatus == "pending"` without corrupting or breaking general challenge listing queries that filter on `status`. Simultaneously, when a challenge is routed to academia, `status` can transition to `OPEN_FOR_PROPOSALS`, and when claimed, to `IN_PROGRESS`.

### 2.3 Field Design for Triage Actions and AI 3-Way Claiming
1. **Rejection**: Requires `rejectionReason String?`.
2. **Diversion**: Requires `divertedTarget String?` (e.g., `"PWD"`, `"Municipal Corporation"`, `"Drinking Water & Sanitation Department"`) and `divertedAt DateTime?`.
3. **Academic Routing & AI Matching**:
   - SQLite does not support scalar lists (`String[]`). All array structures in this schema (`evidence`, `tranches`, `attachedDocs`) are stored as serialized JSON strings.
   - Therefore, `matchedUniversities String?` must store a JSON-serialized array of the 3 matched institutions (including name, department, match rationale, and contact).
4. **Race Condition & Concurrency Locking**:
   - The acceptance criteria require: *"The test must simulate University A calling the claim endpoint and assert a successful claim. The test must immediately simulate University B calling the claim endpoint for the same problem and assert that it is rejected/locked out."*
   - To guarantee this race condition at the database layer, `Challenge` must track:
     - `claimedById String?`: Foreign key to `User(id)` representing the claiming university PI.
     - `claimedInstitute String?`: Name of the claiming university.
     - `claimedAt DateTime?`: Timestamp when the claim was atomically established.
   - By querying and updating atomically in Prisma:
     ```ts
     const claimResult = await prisma.challenge.updateMany({
       where: {
         id: challengeId,
         nodalStatus: "routed_to_academia",
         claimedAt: null, // Critical atomic condition
       },
       data: {
         claimedById: universityUserId,
         claimedInstitute: universityName,
         claimedAt: new Date(),
         status: "IN_PROGRESS",
       },
     });
     if (claimResult.count === 0) {
       return NextResponse.json({ error: "Challenge already claimed or unavailable." }, { status: 409 });
     }
     ```
     If University A and University B make concurrent requests, SQLite executes write operations sequentially. University A sets `claimedAt`, returning `count = 1` (200 OK). University B evaluates `where: { claimedAt: null }`, finding 0 rows (`count = 0`), and is immediately locked out with 409 Conflict.
5. **Nodal Officer Auditability**:
   - `nodalOfficerId String?`: Foreign key to `User(id)`.
   - `nodalReviewedAt DateTime?`: Timestamp of review completion.

---

## 3. Caveats

1. **SQLite Scalar Array Constraint**:
   - PostgreSQL allows native `String[]` and native enum types. Because this project is deployed locally on SQLite (`dev.db`), Prisma will throw a validation error if `String[]` or `enum` is declared in `schema.prisma`.
   - `matchedUniversities` MUST remain `String?` (JSON string) rather than `String[]`.
2. **Prisma Client Regeneration Requirement**:
   - Modifying `schema.prisma` requires running `npx prisma db push` followed by `npx prisma generate`. If `npx prisma generate` is omitted, TypeScript will fail to compile in routes accessing `challenge.nodalStatus` or `challenge.claimedAt`.
3. **Mobile App Decoupling**:
   - The Kotlin mobile application (`mobile/`) has UI files named `SarpanchVerifyScreen.kt` and strings mentioning "Submit to Sarpanch". While the mobile app communicates via REST, the web backend will no longer support Sarpanch verification. The mobile app's verification screen should either target the District Nodal Officer API or be deprecated.
4. **Seed Script Dependency**:
   - Currently, `seed.ts` only seeds 1 university user (`pi.water@iitism.ac.in`). Testing the 3-way claim race condition between University A and University B requires at least 2 distinct university accounts in `seed.ts`.

---

## 4. Conclusion & Concrete Specification

### 4.1 Exact Prisma Schema Modification (`web/prisma/schema.prisma`)

#### In `model Challenge`:
1. **DELETE line 84**:
   ```prisma
   localVerified        Boolean         @default(false) // Verified by Local Gov / Sarpanch
   ```
2. **INSERT District Nodal Officer Triage & University Claim Fields**:
   ```prisma
     // District Nodal Officer Triage System Fields
     nodalStatus          String          @default("pending") // "pending", "rejected", "diverted_to_gov", "routed_to_academia"
     rejectionReason      String?         // Reason input required when nodalStatus == "rejected"
     divertedTarget       String?         // Target government body (e.g. "PWD", "Municipal Corporation", "DWSD")
     divertedAt           DateTime?       // Timestamp when diverted to government department
     matchedUniversities  String?         // JSON string: Array of 3 AI-matched universities with details
     claimedById          String?         // FK to User (university PI) who successfully claimed the challenge
     claimedBy            User?           @relation("ClaimedChallenges", fields: [claimedById], references: [id], onDelete: SetNull)
     claimedInstitute     String?         // Name of the university that won the claim race (e.g. "IIT ISM Dhanbad")
     claimedAt            DateTime?       // Timestamp when claim was locked (enforces single-claim race condition)
     nodalOfficerId       String?         // FK to User (District Nodal Officer who performed the triage)
     nodalOfficer         User?           @relation("NodalOfficerChallenges", fields: [nodalOfficerId], references: [id], onDelete: SetNull)
     nodalReviewedAt      DateTime?       // Timestamp when Nodal Officer completed triage
   ```
3. **ADD Indexes**:
   ```prisma
     @@index([nodalStatus])
     @@index([claimedById])
     @@index([nodalOfficerId])
   ```

#### In `model User`:
1. **INSERT back-relations**:
   ```prisma
     claimedChallenges   Challenge[]         @relation("ClaimedChallenges")
     nodalChallenges     Challenge[]         @relation("NodalOfficerChallenges")
   ```

### 4.2 Application Layer Types & Validation Additions

#### In `web/src/lib/types.ts`:
```ts
export enum NodalTriageStatus {
  PENDING = "pending",
  REJECTED = "rejected",
  DIVERTED_TO_GOV = "diverted_to_gov",
  ROUTED_TO_ACADEMIA = "routed_to_academia",
}
```

#### In `web/src/lib/validation.ts`:
```ts
export const validNodalStatus = [
  "pending",
  "rejected",
  "diverted_to_gov",
  "routed_to_academia",
] as const;

export const nodalTriageActionSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  action: z.enum(["reject", "divert", "route_academia"]),
  rejectionReason: z.string().min(5, "Rejection reason must be provided").optional(),
  divertedTarget: z.string().min(2, "Government target body must be selected").optional(),
});

export const claimChallengeSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
});
```

### 4.3 Database Synchronization and Seed Strategy
1. **Schema Push**: Run `npx prisma db push --skip-generate` to alter the SQLite tables non-destructively.
2. **Client Generation**: Run `npx prisma generate` to update the TypeScript types in `@prisma/client`.
3. **Seed Enhancements in `web/prisma/seed.ts`**:
   - Seed **3 distinct university accounts**:
     - `pi.water@iitism.ac.in` ("Dr. K. Banerjee", IIT ISM Dhanbad)
     - `pi.agri@bau.ac.in` ("Dr. S. K. Pathak", Birsa Agricultural University)
     - `pi.energy@nitjsr.ac.in` ("Dr. Anita Mahato", NIT Jamshedpur)
   - Seed challenges with realistic `nodalStatus` values:
     - 2 challenges with `nodalStatus: "pending"` (e.g., fresh citizen intake waiting for triage).
     - 1 challenge with `nodalStatus: "routed_to_academia"`, `matchedUniversities` JSON populated with 3 universities, and `claimedAt: null` (ready for race condition claim testing).
     - 1 challenge with `nodalStatus: "routed_to_academia"`, `claimedById: universityUser.id`, `claimedInstitute: "IIT ISM Dhanbad"`, `claimedAt: new Date()` (already claimed).
     - 1 challenge with `nodalStatus: "diverted_to_gov"`, `divertedTarget: "Public Works Department (PWD)"`, `divertedAt: new Date()`.
     - 1 challenge with `nodalStatus: "rejected"`, `rejectionReason: "Addressed under municipal ward maintenance budget."`.
   - Remove any `localVerified` reference in `seed.ts`.

---

## 5. Verification Method

### 5.1 Programmatic Schema Validation
Execute the following commands from `a:/Development/Antigravity/SIH26043/web`:

1. **Validate Syntax**:
   ```bash
   npx prisma validate
   ```
   *Expected Result*: Output ends with `The schema at ... is valid 🚀` with exit code 0.

2. **Push Schema to SQLite**:
   ```bash
   npx prisma db push
   ```
   *Expected Result*: Output shows `Your database is now in sync with your Prisma schema.`

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
   *Expected Result*: Output shows `✔ Generated Prisma Client` without errors.

4. **Seed Database**:
   ```bash
   npx prisma db seed
   ```
   *Expected Result*: Output logs creation of 8 users (including 3 universities), seeded challenges with nodal statuses, proposals, escrow, and audit logs.

5. **TypeScript Verification**:
   ```bash
   npm run build
   ```
   *Expected Result*: Zero type errors across the entire application.

### 5.2 Concurrency / Race Condition Verification Method
Run an automated test script (`tests/nodal-triage-claim.test.ts`) that executes:
1. Log in as District Nodal Officer (`nodal.innovation@jharkhand.gov.in`).
2. Post to triage endpoint: `{ challengeId, action: "route_academia" }`.
   - Assert `challenge.nodalStatus === "routed_to_academia"`.
   - Assert `challenge.matchedUniversities` contains 3 institutions.
3. Simulate concurrent claims:
   - Worker 1: University A calls `POST /api/challenges/[id]/claim` -> Asserts HTTP 200, returns `{ success: true, claimedBy: "IIT (ISM) Dhanbad" }`.
   - Worker 2: University B calls `POST /api/challenges/[id]/claim` -> Asserts HTTP 409 Conflict, returns `{ error: "Challenge has already been claimed and locked." }`.
4. Invalidation Condition: If Worker 2 succeeds (HTTP 200) or overrides University A's claim, the concurrency locking is broken.
