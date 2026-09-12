# Handoff Report — Explorer 3: Frontend Mock Data Replacement, Route Guards & UX States

**Date:** 2026-09-04  
**Agent:** Explorer 3 (`teamwork_preview_explorer_p2_3`)  
**Recipient:** Orchestrator / Parent Agent (`021672f4-f631-4dd9-a2fe-ee69813b8698`)  
**Mission:** Audit all 16 web pages, map all hardcoded mock data to database models/API endpoints, design global auth state & RBAC route guards, and specify UX edge states (skeletons, empty states, offline retry, CSRF handling).

---

## 1. Observation

Direct examination of the frontend codebase in `a:\Development\Antigravity\SIH26043\web` revealed the following concrete facts:

1. **Package & Dependencies (`web/package.json`):**
   - Next.js: `16.3.4` (App Router)
   - React / React-DOM: `19.2.8`
   - State Management: `"zustand": "^5.0.15"` is already present in `dependencies`.
   - UI & Animations: `"lucide-react": "^1.41.0"`, `"framer-motion": "^13.2.0"`, `"tailwindcss": "^4"`.
   - Missing frontend utilities: `web/src` currently contains only `app/` (no `components/`, `lib/`, `hooks/`, or `stores/` exist yet).

2. **Hardcoded Mock Data Across All 16 Routes:**
   - `web/src/app/page.tsx` (lines 10–19, 118–134): Defines static arrays `baseChallenges` and `additionalChallenges` (e.g. `JHR-2026-842`, `JHR-2026-821`), and static impact numbers (`1,248 Submissions`, `156 Prototypes`, `342 Resolved`, `89 Experts`).
   - `web/src/app/login/page.tsx` (lines 25–96, 98–104): Roles array hardcodes test emails (`nodal.innovation@jharkhand.gov.in`, `pi.water@iitism.ac.in`, etc.); `handleSeamlessLogin` executes a static `setTimeout` without calling any API or saving session tokens.
   - `web/src/app/dashboard/layout.tsx` (lines 24–28): Persona detection is implemented via client URL substring check:
     ```typescript
     const isGov = pathname.includes("/dashboard/gov");
     const isUni = pathname.includes("/dashboard/university");
     const isInd = pathname.includes("/dashboard/industry");
     ```
     There are zero authentication checks or role restrictions. Anyone can navigate directly to `/dashboard/gov` regardless of identity.
   - `web/src/app/dashboard/gov/page.tsx` (lines 37–59): Static KPI metrics (`1,248`, `342`, `156`, `42`), domain distribution counts (`Water Management: 420`, `Agriculture: 310`), and 6 static challenges in `allChallenges`.
   - `web/src/app/dashboard/university/page.tsx` (lines 33–70, 145–177): Static assigned challenges (`CH-842`, `CH-843`, `CH-821`, `CH-809`) and KPI counts (`12`, `8`, `4`).
   - `web/src/app/dashboard/industry/page.tsx` (lines 38–79, 157–189): Static proposals (`PR-102`, `PR-104`, `PR-109`, `PR-115`), metrics (`24`, `3`, `₹8.5L`).
   - `web/src/app/challenge/[id]/page.tsx` (lines 32–49): Uses `const isWater = challengeId === "JHR-2026-842" || challengeId.includes("842")` to conditionally render mock water contamination text; modal actions are static.
   - `web/src/app/whatsapp-intake/page.tsx` (lines 33–115): Hardcoded message sequence; simulated submission generates a static `JHR-2026-842`.
   - `web/src/app/accountability/page.tsx` (lines 35–43): Hardcoded 7-entity GRAI leaderboard and state average (`85.4%`).
   - `web/src/app/submit/page.tsx` (lines 176–212): Form inputs are prefilled with Dhanbad water challenge text; submission uses `setTimeout` and local random ID generation.
   - `web/src/app/track/page.tsx` (lines 63–230): `SAMPLE_ISSUES` dictionary with static records `IN-GR-2026-9842`, `IN-DL-2026-3104`, `IN-MH-2026-7712`.
   - `web/src/app/guidelines/page.tsx` (lines 31–72): Concatenates in-memory string and creates local `Blob` for download.
   - `web/src/app/dashboard/settings/page.tsx` (lines 29–60): Static IAS officer details, static active sessions (`sess-1`, `sess-2`), fake API key.
   - `web/src/app/apply/[challengeId]/page.tsx` (lines 15–22): Form submission executes simulated `setTimeout`.
   - `web/src/app/dashboard/university/proposal/[id]/page.tsx` (lines 18–28, 35–51): Prefilled draft fields, saves draft only to browser `localStorage`.
   - `web/src/app/dashboard/industry/fund/[id]/page.tsx` (lines 38–41, 64–105): Static `pledgedAmount` (`350000`), simulated receipt download text blob.

---

## 2. Logic Chain

1. **State Independence & Backend Requirements:**
   Because all data is hardcoded in client components, replacing mock data requires connecting each component to corresponding backend REST API endpoints matching the database schema designed by Explorer 1 (`Users`, `Challenges`, `Proposals`, `FundingCommitments`, `AuditLogs`).
2. **Global Session & Cookie Security:**
   Since Explorer 2 is implementing HttpOnly session cookies holding signed JWTs and backend RBAC middleware, the frontend cannot read the raw token from `document.cookie`. Therefore:
   - A single global Zustand store (`useAuthStore`) initialized via `/api/auth/me` on app load with `credentials: 'include'` provides reactive user and role state.
   - A centralized HTTP client (`apiFetch`) intercepts `401 Unauthorized` responses to clear auth state and redirect to `/login?expired=true` with a clear user banner.
3. **Route Protection & UX Continuity:**
   Because Next.js App Router renders layout shells on navigation, relying only on server middleware can cause layout flashes or blank screens on client transitions.
   - A client-side `RoleGuard` component wrapped inside `web/src/app/dashboard/layout.tsx` guarantees that unauthenticated users are redirected to `/login`, and users attempting to access unauthorized roles (e.g., University accessing `/dashboard/gov`) are redirected to their own designated dashboard (`/dashboard/university`) with an informational toast.
4. **Resilience & Production Hardening:**
   Raw spinners or blank screens degrade user trust during network latency or rural connectivity drops.
   - Pre-designed skeleton screens (`MetricsSkeleton`, `TableSkeleton`, `DetailSkeleton`) prevent cumulative layout shifts (CLS).
   - An offline listener (`useOnlineStatus`) alerts rural citizens when disconnected and queues problem submissions locally until connectivity resumes.
   - Mutation requests automatically extract and transmit the `X-CSRF-Token` header for OWASP CSRF protection.

---

## 3. Caveats

1. **Backend Endpoints in Development:** The planned REST endpoints (`/api/challenges`, `/api/auth/*`, `/api/proposals`, etc.) are currently being specified and implemented by Explorer 1 and Explorer 2; mock data replacement in source files must be performed once the endpoint contracts are deployed.
2. **File Storage Architecture:** Ground zero photo/video evidence in `/submit` and technical DPR attachments in `/dashboard/university/proposal/[id]` currently assume a multipart upload handler or presigned URL generator (`/api/upload`).
3. **Read-Only Explorer Mandate:** In strict adherence to our read-only explorer archetype, no source files under `web/src/app` have been edited. All code structures, TypeScript interfaces, and component architectures are fully documented in `analysis.md`.

---

## 4. Conclusion

The frontend codebase is cleanly modularized with Next.js App Router and Tailwind CSS, making it straightforward to swap static state variables with standard React hooks (`useGovDashboard`, `useAuth`, `useTrackIssue`, etc.).

By introducing:
1. `src/stores/authStore.ts` (Zustand auth store syncing with `/api/auth/me`)
2. `src/lib/api-client.ts` (Centralized `apiFetch` with CSRF headers and 401 session expiration handling)
3. `src/components/auth/RoleGuard.tsx` (Client-side RBAC route guard)
4. `src/components/ui/Skeletons.tsx`, `EmptyState.tsx`, and `NetworkBanner.tsx`

the portal will transition from a static mockup to a production-grade, secure, multi-tenant digital governance platform. Detailed specifications, code listings, and page-by-page mapping tables are cataloged in `analysis.md`.

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Verify Mock Data Locations:**
   - Inspect `web/src/app/page.tsx` lines 10–19: Confirm static challenge objects.
   - Inspect `web/src/app/dashboard/layout.tsx` lines 24–28: Confirm `pathname.includes("/dashboard/gov")` logic.
   - Inspect `web/src/app/challenge/[id]/page.tsx` line 32: Confirm ternary `challengeId.includes("842")`.
   - Inspect `web/src/app/track/page.tsx` lines 63–230: Confirm `SAMPLE_ISSUES` dictionary.
2. **Verify Dependencies:**
   - Run `cat web/package.json` to confirm `"zustand": "^5.0.15"` is installed.
3. **Verify Build Health:**
   - In `web` directory, execute `npm run build` or `npm run lint` to verify that existing pages compile cleanly without syntax errors.
4. **Invalidation Conditions:**
   - If any page is refactored to fetch from an API route before Phase 2 implementation, verify whether mock datasets have been deprecated.
