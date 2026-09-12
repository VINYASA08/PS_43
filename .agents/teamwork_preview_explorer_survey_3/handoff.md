# Handoff Report: Web Nodal Dashboard & Build/Test Infrastructure Survey

**Author**: Explorer Survey 3 (Web Nodal Dashboard & Build/Test Infra)  
**Working Directory**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_3`  
**Target Milestone**: Survey and Architectural Blueprint for District Nodal Officer Pivot  
**Date**: 2026-09-08T18:45:00Z  

---

## 1. Observation

### 1.1 Frontend Structure and Existing Dashboards
1. **Dashboard Route Structure** (`web/src/app/dashboard`):
   - `web/src/app/dashboard/page.tsx`: The multi-tenant gateway router. Defines three core operating portals:
     - `gov` (`/dashboard/gov`): Role badge `"State Nodal Authority"` (line 60).
     - `university` (`/dashboard/university`): Academic & R&D Innovation Hub.
     - `industry` (`/dashboard/industry`): Corporate CSR & Mentorship Hub.
   - `web/src/app/dashboard/layout.tsx`: Role-based navigation sidebar with `<RoleGuard allowedRoles={["GOV", "UNIVERSITY", "INDUSTRY", "CITIZEN", "EXPERT"]}>`.
     - Lines 74–84 define Gov navigation:
       ```tsx
       if (userRole === "GOV" || pathname.includes("/dashboard/gov")) {
         return [
           { name: "Overview", href: "/dashboard/gov", icon: LayoutDashboard },
           { name: "Challenges Ledger", href: "/dashboard/gov#ledger", icon: Briefcase },
           { name: "Pending Approvals", href: "/dashboard/gov#pending-users", icon: UserCheck },
           { name: "Accountability Index", href: "/accountability", icon: Building2 },
           { name: "Guidelines & Gazette", href: "/guidelines", icon: Building2 },
           { name: "Switch Portal", href: "/dashboard", icon: Menu },
           { name: "Settings", href: "/dashboard/settings", icon: Settings },
         ];
       }
       ```
   - `web/src/app/dashboard/gov/page.tsx`:
     - Serves as the "Government Oversight Dashboard / State Administrative Console".
     - Currently contains:
       - Export Triage Summary CSV (lines 109–120).
       - Pending Corporate Approvals (lines 241–295) for Section 135 CSR account approvals.
       - Domain Distribution & Audit Log Trail (lines 298–363).
       - State Challenge Ledger Table (lines 366–455).
     - **Missing in current UI**: A dedicated Nodal Officer Triage Queue with Reject, Divert to Gov Body, and Route to Academia actions.
   - `web/src/app/dashboard/university/page.tsx`:
     - Displays Open RFP Challenges (lines 229–311) and Submitted DPR Proposals (lines 172–226).
     - Currently has "View Details" linking to `/challenge/[id]` and "Draft Solution" linking to `/dashboard/university/proposal/[id]`.
     - **Missing in current UI**: Dedicated badge indicating AI matching status and a race-condition "Claim Challenge" action button.

### 1.2 Sarpanch References Across the Workspace
1. **Frontend**: Grep for `sarpanch` across `web/src/` returned **zero** frontend UI references.
2. **Backend API**: Exactly one endpoint contained Sarpanch verification logic:
   - `web/src/app/api/mobile/verify/route.ts` (lines 7–16, 28, 89):
     ```ts
     const { challengeId, sarpanchId } = await req.json();
     const sarpanch = await prisma.user.findUnique({ where: { id: sarpanchId } });
     if (!sarpanch || sarpanch.role !== "GOV") { ... }
     await prisma.challenge.update({
       where: { id: challengeId },
       data: { localVerified: true, status: "CITIZEN_VERIFIED" },
     });
     // Action logged: "SARPANCH_VERIFIED_AND_AI_ROUTED"
     ```
3. **Database Schema**:
   - `web/prisma/schema.prisma` line 84:
     ```prisma
     localVerified Boolean @default(false) // Verified by Local Gov / Sarpanch
     ```
4. **Login Persona**:
   - `web/src/app/login/page.tsx` line 324:
     ```ts
     setEmail("nodal.innovation@jharkhand.gov.in");
     ```
   - Demonstrates that the Government user persona is already designated as the State / District Innovation Nodal Officer.

### 1.3 Government Bodies & Empanelled Universities Directory
`web/src/lib/routing.ts` contains comprehensive, battle-tested directories ready for the Nodal triage dropdown and AI academic matching:
1. **Gov Line Departments & Municipal Bodies** (`web/src/lib/routing.ts` lines 293–446):
   - **PWD / Infrastructure**: `Road Construction Department (RCD) / Rural Development (RDD)` (`rcd-roads`, PMGSY PIU / State Highway Division).
   - **Municipal Corporations**:
     - `Ranchi Municipal Corporation (RMC)` (`rmc-ranchi`, Sanitation & Drain QRT).
     - `Dhanbad Municipal Corporation (DMC)` (`dmc-dhanbad`, Civic Works & Solid Waste).
     - `Jamshedpur Notified Area Committee (JNAC)` (`jnac-jamshedpur`).
     - `Chas Municipal Corporation` (`chas-mc-bokaro`).
     - `Deoghar Municipal Corporation` (`deoghar-mc`).
   - **Utilities & Departments**:
     - `Drinking Water & Sanitation Department (DWSD)` (`dwsd-water`).
     - `Jharkhand Urja Vikas Nigam Limited (JUVNL / JBVNL)` (`juvnl-energy`).
     - `Dept of Health, Medical Education & Family Welfare` (`health-dept`).
     - `Water Resources Department (WRD)` (`wrd-irrigation`).
     - `Dept of School Education & Literacy (DSE&L) / JEPC` (`dsel-education`).
2. **Empanelled Universities** (`web/src/lib/routing.ts` lines 22–103):
   - `IIT (ISM) Dhanbad` (`iit-ism-dhanbad-water`, `iit-ism-dhanbad-env`)
   - `Birsa Agricultural University (BAU), Ranchi/Gumla` (`bau-ranchi`)
   - `Rajendra Institute of Medical Sciences (RIMS) / BIT Mesra` (`rims-bit-health`)
   - `National Institute of Technology (NIT) Jamshedpur` (`nit-jamshedpur-energy`)
   - `Central University of Jharkhand (CUJ), Brambe` (`cuj-education`)
   - `BIT Mesra, Ranchi` (`bit-mesra-civil`)
   - `Xavier Institute of Social Service (XISS), Ranchi` (`xiss-governance`, `xiss-livelihood`)

### 1.4 Build Configuration Audit
1. **`web/package.json`**:
   - Next.js: `16.3.4` (App Router + Turbopack).
   - React: `19.2.8`.
   - Tailwind CSS: `@tailwindcss/postcss` `^4`.
   - Prisma: `5.11.0` (SQLite provider).
   - TypeScript: `^5`.
   - `tsx`: `^4.23.13` (enables direct standalone TypeScript execution for CLI tests).
2. **Build Execution (`npm run build`)**:
   - Command executed: `npm run build` in `web/`.
   - Result: **Exit Code 0 (Success)**.
   - Built 36 routes (`(Static)` and `ƒ (Dynamic)`), Turbopack compiled in 1335ms, static pages generated in 456ms.
3. **TypeScript Health (`npx tsc --noEmit`)**:
   - `web/next.config.ts` currently sets `typescript: { ignoreBuildErrors: true }`.
   - Running `npx tsc --noEmit` checks all `**/*.ts` and `**/*.tsx` (because of `web/tsconfig.json` include pattern).
   - All source code in `web/src/` passed with 0 errors.
   - 4 type errors were reported exclusively inside `web/tests/`:
     - `tests/judge_e2e_mobile.ts(33,13)`: Read-only `NODE_ENV` assignment.
     - `tests/stress_mobile_api.ts(29,13)`: Read-only `NODE_ENV` assignment.
     - `tests/test_3track_triage.ts(30,13)`: Read-only `NODE_ENV` assignment.
     - `tests/test_3track_triage.ts(98,31)`: Incompatible `AbortSignal | null` on `RequestInit`.

### 1.5 Testing Infrastructure Audit
1. **Current Test Execution Pattern**:
   - Automated tests are standalone TypeScript test runners located in `web/tests/`.
   - Executed via `npx tsx tests/<test-file>.ts`.
   - Examples:
     - `tests/test_3track_triage.ts` (647 lines): Programmatically invokes route handlers `POST /api/challenges` and `GET /api/challenges`, verifies database entries via Prisma, asserts CSRF and Zod rejection, and performs database teardown.
     - Execution time: **12 tests passed in ~1.5 seconds**.
   - Output log from `test_3track_triage.ts`:
     ```
     ===============================================================================
     3-TRACK TRIAGE TEST SUITE SUMMARY: 12 PASSED | 0 FAILED | 12 TOTAL
     ===============================================================================
     TEST SUITE PASSED: 100% assertions verified successfully (12/12).
     ```

---

## 2. Logic Chain

1. **Sarpanch Decommissioning Logic**:
   - Because Sarpanch verification was restricted to `POST /api/mobile/verify/route.ts` and `localVerified` in `schema.prisma`, removing `localVerified` and replacing that endpoint with a Nodal Officer triage pipeline cleanly achieves the architectural pivot without breaking any existing web UI pages.
2. **Nodal Officer Dashboard Integration Logic**:
   - Since `nodal.innovation@jharkhand.gov.in` is the primary `GOV` user persona, adding a prominent **"District Nodal Triage"** console directly inside `/dashboard/gov` (and providing a dedicated route `/dashboard/nodal` that navigates or renders this workspace) ensures zero dead ends and immediate role compatibility with existing `RoleGuard` and `authStore`.
3. **Triage State Machine & Action Buttons**:
   - Challenges ingested from citizens start with status `REPORTED` (or `PENDING_TRIAGE`).
   - Action 1 (**Reject**): Prompts for a mandatory reason string. Transitions challenge to `REJECTED`, sets `rejectionReason`, and appends an `AuditLog` entry.
   - Action 2 (**Divert to Gov Body**): Presents a selector with departments from `STATE_LINE_DEPARTMENTS` and `LOCAL_CIVIC_BODIES` (PWD, RMC, DMC, JNAC, DWSD, JUVNL, etc.). Transitions challenge to `DIVERTED_TO_GOV`, saves `divertedToGovBody`, and records SLA.
   - Action 3 (**Route to Academia**): Calls the AI matching engine, selects 3 matching universities, logs mock notification emails to the terminal (`[Mock Email to ...]`), sets status to `ROUTED_TO_ACADEMIA`, and saves `matchedUniversities: [u1, u2, u3]`.
4. **Atomic University Claim Race Condition Logic**:
   - To guarantee that the first university to claim locks the challenge and prevents the other two from claiming it:
     ```ts
     const result = await prisma.challenge.updateMany({
       where: {
         id: challengeId,
         status: "ROUTED_TO_ACADEMIA",
         assignedInstitute: null, // Atomic guard ensuring unassigned state
       },
       data: {
         assignedInstitute: claimingUniversityName,
         assignedToId: session.userId,
         status: "CLAIMED", // Or IN_PROGRESS
       },
     });
     if (result.count === 0) {
       return NextResponse.json(
         { error: "Challenge already claimed by another institution. Access locked." },
         { status: 409 }
       );
     }
     ```
   - `updateMany` with `count === 0` provides an atomic check-and-set in SQLite and PostgreSQL, completely preventing race conditions without needing explicit table locks.
5. **Build & Test Reliability Logic**:
   - In `web/tsconfig.json`, updating `"exclude": ["node_modules", "tests"]` (or fixing the 4 trivial test type errors) will allow `npx tsc --noEmit` to pass with 0 errors alongside `npm run build`.
   - A new test suite `tests/test_nodal_triage_and_claim.ts` can simulate the entire cycle: Nodal Officer routing -> University A claiming -> University B lockout (asserting 409) -> Nodal Reject/Divert flows.

---

## 3. Caveats

1. **Database Schema Migration**: The workspace currently uses SQLite (`file:./dev.db`). When altering `schema.prisma` (e.g., removing `localVerified` and adding fields like `rejectionReason`, `divertedToGovBody`, `matchedUniversities`), `npx prisma db push` or `npx prisma migrate dev` must be run.
2. **Mobile App Independence**: Mobile screens (`SarpanchVerifyScreen.kt`) reside in `mobile/`. Explorer Survey 3's mandate is restricted to the Next.js Web application; any mobile synchronization must be handled by the mobile explorer/team.
3. **No Caveats** regarding frontend feasibility or Next.js build viability: Turbopack compiles cleanly, dependencies are fully installed, and API route handlers are easily testable.

---

## 4. Conclusion

1. **Dashboard Placement**: Implement the District Nodal Officer Web Dashboard with dual entry points:
   - Primary: A prominent **"District Nodal Triage Console"** section on `/dashboard/gov` (with sub-navigation in `web/src/app/dashboard/layout.tsx`).
   - Direct: A dedicated page at `web/src/app/dashboard/nodal/page.tsx` that provides a focused queue for District Nodal Officers.
2. **Three Nodal Action Interfaces**:
   - **Reject Modal**: Requires reason input, calls `POST /api/nodal/triage` with `action: "REJECT"`, sets status to `REJECTED`.
   - **Divert to Gov Body Modal**: Dropdown with PWD, RMC, DMC, JNAC, DWSD, JUVNL, etc., calls `POST /api/nodal/triage` with `action: "DIVERT_TO_GOV"`.
   - **Route to Academia Trigger**: Triggers 3-university AI matching, logs mock email notifications to console, sets status to `ROUTED_TO_ACADEMIA`.
3. **University Claiming & Race Condition**:
   - Endpoint: `POST /api/challenges/[id]/claim` (enforcing `status: "ROUTED_TO_ACADEMIA"` and `assignedInstitute: null`).
   - UI: On `/dashboard/university` and `/challenge/[id]`, display active "Claim Challenge" button when open; display disabled "Claimed by [University]" when locked.
4. **Build & Test Infrastructure**:
   - Build is functional (`npm run build` completes with code 0).
   - Test script `web/tests/test_nodal_triage_and_claim.ts` should be built using `npx tsx` and `node:assert/strict` to programmatically verify:
     1. Nodal Officer routing problem to Academia.
     2. University A claiming problem -> HTTP 200/201 assertion.
     3. University B attempting claim on same problem -> HTTP 409 Conflict lockout assertion.
     4. Nodal Officer Reject and Divert actions.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Next.js Production Build**:
   ```bash
   cd web
   npm run build
   ```
   *Expected*: Zero build errors, all routes static/dynamic generated.

2. **TypeScript Strict Type Check**:
   ```bash
   cd web
   npx tsc --noEmit
   ```
   *Expected*: Passes with 0 errors once `tests` are excluded from `tsconfig.json` or test type casts are updated.

3. **Automated Triage & University Claim Race Condition Test**:
   ```bash
   cd web
   npx tsx tests/test_nodal_triage_and_claim.ts
   ```
   *Expected*:
   - Step 1: Citizen issue submitted (`REPORTED`).
   - Step 2: Nodal Officer routes to Academia (`ROUTED_TO_ACADEMIA`), 3 mock emails logged.
   - Step 3: University A claims successfully (`status: "CLAIMED"`, HTTP 200).
   - Step 4: University B attempts claim -> rejected with HTTP 409 Conflict ("Already claimed").
   - Step 5: Nodal Officer rejection test -> `status: "REJECTED"`.
   - Step 6: Nodal Officer divert test to PWD -> `status: "DIVERTED_TO_GOV"`.
   - Step 7: Teardown purges test rows, restoring clean DB state.

### 5.2 Key Files for Implementers to Reference
- `web/src/app/dashboard/gov/page.tsx`: Existing State Administrative Console.
- `web/src/app/dashboard/university/page.tsx`: Existing University Dashboard.
- `web/src/lib/routing.ts`: Empanelled universities and line departments.
- `web/tests/test_3track_triage.ts`: Reference architectural template for `test_nodal_triage_and_claim.ts`.
