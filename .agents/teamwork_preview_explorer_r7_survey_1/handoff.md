# Comprehensive Web Flow & Routing Audit Handoff Report

**Agent**: Survey Explorer 1 (`teamwork_preview_explorer_r7_survey_1`)  
**Working Directory**: `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_1`  
**Application Root**: `a:/Development/Antigravity/SIH26043/web`  
**Date**: 2026-09-09  

---

## 1. Observation

### 1.1 Catalog of All Existing Route Pages
A complete scan of `web/src/app` using filesystem inspection (`find_by_name`) identified exactly **19 page endpoints**:

| # | Route | File Path | Role Scope |
|---|---|---|---|
| 1 | `/` | `web/src/app/page.tsx` | Public / All |
| 2 | `/accountability` | `web/src/app/accountability/page.tsx` | Public / All |
| 3 | `/apply/[challengeId]` | `web/src/app/apply/[challengeId]/page.tsx` | Expert / Mentor / Public |
| 4 | `/challenge/[id]` | `web/src/app/challenge/[id]/page.tsx` | Public / All |
| 5 | `/dashboard` | `web/src/app/dashboard/page.tsx` | Authenticated Gateway |
| 6 | `/dashboard/chat` | `web/src/app/dashboard/chat/page.tsx` | Industry & University |
| 7 | `/dashboard/gov` | `web/src/app/dashboard/gov/page.tsx` | Government Admin |
| 8 | `/dashboard/industry` | `web/src/app/dashboard/industry/page.tsx` | Industry Partner |
| 9 | `/dashboard/industry/fund/[id]` | `web/src/app/dashboard/industry/fund/[id]/page.tsx` | Industry Partner |
| 10 | `/dashboard/nodal` | `web/src/app/dashboard/nodal/page.tsx` | District Nodal Officer / Gov |
| 11 | `/dashboard/open-board` | `web/src/app/dashboard/open-board/page.tsx` | All / Contributors |
| 12 | `/dashboard/settings` | `web/src/app/dashboard/settings/page.tsx` | All Authenticated |
| 13 | `/dashboard/university` | `web/src/app/dashboard/university/page.tsx` | University PI |
| 14 | `/dashboard/university/proposal/[id]` | `web/src/app/dashboard/university/proposal/[id]/page.tsx` | University PI |
| 15 | `/guidelines` | `web/src/app/guidelines/page.tsx` | Public / All |
| 16 | `/login` | `web/src/app/login/page.tsx` | Public / Multi-tier Auth |
| 17 | `/submit` | `web/src/app/submit/page.tsx` | Citizen / Reporter |
| 18 | `/track` | `web/src/app/track/page.tsx` | Citizen / Public |
| 19 | `/whatsapp-intake` | `web/src/app/whatsapp-intake/page.tsx` | Public Simulation |

Layout definitions exist at:
- `web/src/app/layout.tsx` (Root layout)
- `web/src/app/dashboard/layout.tsx` (Authenticated dashboard sidebar & header wrapper)

---

### 1.2 Broken Routes & 404 Redirect Targets

#### Observation 1.2.1: Non-Existent `/dashboard/citizen` and `/dashboard/expert` 404 Targets
In `web/src/app/dashboard/gov/page.tsx` (Lines 58–63):
```typescript
58: const userRole = (user.role || "").toUpperCase();
59: if (userRole !== "GOV") {
60:   const target = (user.role || "").toLowerCase();
61:   showToast("Access restricted: Redirecting to your assigned dashboard...");
62:   router.replace(`/dashboard/${target}?error=unauthorized`);
63: }
```
In `web/src/app/dashboard/university/page.tsx` (Lines 48–53):
```typescript
48: const userRole = (user.role || "").toUpperCase();
49: if (userRole !== "UNIVERSITY") {
50:   const target = (user.role || "").toLowerCase();
51:   showToast("Access restricted: Redirecting to your assigned dashboard...");
52:   router.replace(`/dashboard/${target}?error=unauthorized`);
53: }
```
In `web/src/app/dashboard/industry/page.tsx` (Lines 64–69):
```typescript
64: const userRole = (user.role || "").toUpperCase();
65: if (userRole !== "INDUSTRY") {
66:   const target = (user.role || "").toLowerCase();
67:   showToast("Access restricted: Redirecting to your assigned dashboard...");
68:   router.replace(`/dashboard/${target}?error=unauthorized`);
69: }
```
**Observation**: When a user with `user.role === "CITIZEN"` or `user.role === "EXPERT"` navigates to `/dashboard/gov`, `/dashboard/university`, or `/dashboard/industry`, `target` evaluates to `"citizen"` or `"expert"`. The router replaces the path with `/dashboard/citizen?error=unauthorized` or `/dashboard/expert?error=unauthorized`.
Neither directory `web/src/app/dashboard/citizen` nor `web/src/app/dashboard/expert` exists in the filesystem. This triggers an unhandled **404 Not Found** page for valid authenticated users.

In contrast, `web/src/components/auth/RoleGuard.tsx` (Lines 40–50) contains the correct fallback logic:
```typescript
40: // Redirect to authorized home based on role
41: if (userRoleNormalized === "GOV") {
42:   router.replace("/dashboard/gov");
43: } else if (userRoleNormalized === "UNIVERSITY") {
44:   router.replace("/dashboard/university");
45: } else if (userRoleNormalized === "INDUSTRY") {
46:   router.replace("/dashboard/industry");
47: } else {
48:   router.replace("/submit");
49: }
```
The page-level `useEffect` in the three dashboard pages directly contradicts `RoleGuard.tsx` by attempting dynamic `/dashboard/${target}` interpolation.

---

### 1.3 Orphaned Pages (Implemented Pages Missing All Navigation Ingress)

#### Observation 1.3.1: `/dashboard/chat`
- **File**: `web/src/app/dashboard/chat/page.tsx` (152 lines)
- **Features**: Real-time polling chat hub for proposal collaboration between University PIs and Industry sponsors, connected to `GET/POST /api/chat` and `GET /api/proposals`.
- **Grep Result**: `grep_search` for `dashboard/chat` across `web/src` returned **0 references**.
- **Impact**: Neither `web/src/app/dashboard/layout.tsx` (navigation sidebar) nor any role dashboard contains a link to `/dashboard/chat`. The page is completely unreachable via standard UI navigation.

#### Observation 1.3.2: `/dashboard/open-board`
- **File**: `web/src/app/dashboard/open-board/page.tsx` (253 lines)
- **Features**: Open Contributor Board where community engineers and students can discover, filter, post, and apply for micro-tasks attached to challenges. Connected to `GET/POST/PATCH /api/micro-tasks` and `GET /api/challenges`.
- **Grep Result**: `grep_search` for `open-board` across `web/src` returned **0 references**.
- **Impact**: Missing from all navigation menus in `dashboard/layout.tsx`, landing page, and header. Unreachable via standard UI navigation.

#### Observation 1.3.3: `/apply/[challengeId]`
- **File**: `web/src/app/apply/[challengeId]/page.tsx` (176 lines)
- **Features**: Dedicated full-page application form for independent mentors, ISRO alumni, and NGOs to register technical oversight on a specific challenge, connected to `POST /api/challenges/[challengeId]/apply`.
- **Grep Result**: Only self-referential links exist inside `apply/[challengeId]/page.tsx` (Lines 51 and 162).
- **Impact**: In `web/src/app/challenge/[id]/page.tsx` Line 191–196:
```typescript
191: onClick={() => setShowCollabModal(true)}
192: className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
193: >
194:   <Users className="w-3.5 h-3.5" /> Collaborate / Mentor
```
`challenge/[id]/page.tsx` opens an inline popup modal (`setShowCollabModal(true)`) instead of routing to `/apply/${challengeId}`, leaving the dedicated `/apply/[challengeId]` route completely orphaned.

---

### 1.4 Workflow Parameter Ambiguities & Semantic Mismatches

#### Observation 1.4.1: `/dashboard/university/proposal/[id]` Dual Parameter Conflict
In `web/src/app/dashboard/university/page.tsx`:
- Line 346: `<Link href={`/dashboard/university/proposal/${p.id}`}>` -> Passes `p.id` (**Proposal ID**) for existing DPRs.
- Line 431: `<Link href={`/dashboard/university/proposal/${c.id}`}>` -> Passes `c.id` (**Challenge ID**) to draft a new DPR.
- In `web/src/app/challenge/[id]/page.tsx` Line 307: `<Link href={`/dashboard/university/proposal/${challenge.id}`}>` -> Passes `challenge.id` (**Challenge ID**).

In `web/src/app/dashboard/university/proposal/[id]/page.tsx` (Lines 180–193):
```typescript
180: const res = await apiFetch<any>("/api/proposals", {
181:   method: "POST",
182:   body: {
183:     challengeId: rawId, // rawId is passed from params.id
184:     title,
185:     abstract,
186:     methodology,
187:     budget: Number(budget),
...
```
When opened from an existing proposal (`/dashboard/university/proposal/${p.id}`):
1. `rawId` is `p.id` (Proposal ID).
2. The page loads existing proposal data via `apiFetch(/api/proposals/${rawId})` (Lines 83–94), but fails to store `challengeId` from the returned record.
3. On submission (Line 183), it calls `POST /api/proposals` with `challengeId: rawId` (i.e. `challengeId: p.id`).
4. `web/src/app/api/proposals/route.ts` (Lines 89–97) looks up the challenge:
```typescript
const challenge = await prisma.challenge.findFirst({
  where: { OR: [{ id: parsed.data.challengeId }, { publicTrackingId: parsed.data.challengeId }] },
});
if (!challenge) {
  return NextResponse.json({ error: "Associated challenge not found." }, { status: 404 });
}
```
5. Since `p.id` is a proposal ID, the challenge lookup fails, returning **HTTP 404 "Associated challenge not found."**
6. Furthermore, editing an existing proposal should send `PUT /api/proposals/${rawId}` (which is implemented in `api/proposals/[id]/route.ts`), not create a duplicate proposal via POST.

#### Observation 1.4.2: `/dashboard/industry/fund/[id]` Parameter Collision
In `web/src/app/dashboard/industry/page.tsx`:
- Line 242: `<Link href={`/dashboard/industry/fund/${f.id}`}>` -> Passes `f.id` (**FundingCommitment ID**) under "Our Corporate Escrow Commitments".
- Line 302: `<Link href={`/dashboard/industry/fund/${p.id}`}>` -> Passes `p.id` (**Proposal ID**) under "Academic Proposals Open for CSR Co-Financing".
- In `web/src/app/challenge/[id]/page.tsx` Line 337: `<Link href={`/dashboard/industry/fund/${p.id}`}>` -> Passes `p.id` (**Proposal ID**).

In `web/src/app/dashboard/industry/fund/[id]/page.tsx` (Lines 25, 61–69):
```typescript
25: const proposalId = params.id as string;
...
61: body: JSON.stringify({
62:   proposalId,
63:   corporateName: "Tata Steel CSR Division",
64:   amount: Number(pledgedAmount || 350000),
...
```
When clicked from Line 242 (`f.id`):
1. The user expects to view the details/tranches of an existing funding commitment `f`.
2. Instead, `fund/[id]/page.tsx` always displays a new funding pledge form.
3. Submitting sends `proposalId: f.id`.
4. `api/funds/route.ts` (Lines 94–101) checks `prisma.proposal.findUnique({ where: { id: targetProposalId } })`. Since `f.id` is a funding commitment ID, it fails with **HTTP 404 "Proposal not found."**
5. Additionally, `fund/[id]/page.tsx` never calls `GET /api/proposals/[id]` or `GET /api/funds/[id]` on mount to hydrate project details, instead rendering static mock defaults ("IIT ISM Dhanbad").

---

### 1.5 Role-Based Navigation Misconfigurations
In `web/src/app/dashboard/layout.tsx` (Lines 102–108):
```typescript
102: return [
103:   { name: "Portal Gateway", href: "/dashboard", icon: LayoutDashboard },
104:   { name: "Government", href: "/dashboard/gov", icon: Building2 },
105:   { name: "University", href: "/dashboard/university", icon: GraduationCap },
106:   { name: "Industry", href: "/dashboard/industry", icon: Briefcase },
107:   { name: "Settings", href: "/dashboard/settings", icon: Settings },
108: ];
```
When an authenticated user has `user.role === "CITIZEN"` or `"EXPERT"`, the fallback navigation in `DashboardLayout` presents links to `/dashboard/gov`, `/dashboard/university`, and `/dashboard/industry`. Clicking any of these links immediately triggers the unauthorized redirect in `gov/page.tsx:62` or `university/page.tsx:52`, redirecting the user to `/dashboard/citizen` (**404 Not Found**).

---

### 1.6 Placeholder and Empty Link Audit
- Running `grep_search` for `href="#"` yielded **0 results**.
- Running `grep_search` for `href=""` yielded **0 results**.
- All interactive button handlers across all pages have valid functional bindings (form submission, modal toggling, filter states, API calls, or clipboard copying). There are no empty `onClick={() => {}}` stubs.

---

## 2. Logic Chain

1. **Premise**: In Next.js App Router, any navigation to a route without a matching `page.tsx` directory causes a 404 error.
   - *Observation*: `gov/page.tsx:62`, `university/page.tsx:52`, and `industry/page.tsx:68` use `router.replace('/dashboard/' + user.role.toLowerCase() + '?error=unauthorized')`.
   - *Observation*: For `CITIZEN` and `EXPERT`, the destination URLs are `/dashboard/citizen` and `/dashboard/expert`.
   - *Observation*: Neither `/dashboard/citizen` nor `/dashboard/expert` exists in `web/src/app`.
   - *Deduction*: When any Citizen or Expert user lands on a restricted dashboard, or clicks any of the sidebar links presented to them by `dashboard/layout.tsx:104-106`, the application routes to an unhandled 404 page.

2. **Premise**: Features built into the application must have navigational pathways for users to discover and use them.
   - *Observation*: `/dashboard/chat` is a functional Industry-University Chat Hub with API backing (`/api/chat`).
   - *Observation*: `/dashboard/open-board` is a functional Open Contributor Board with API backing (`/api/micro-tasks`).
   - *Observation*: `grep_search` across `web/src` confirmed 0 inbound `<Link>` or `router.push` references to both routes.
   - *Deduction*: Both `/dashboard/chat` and `/dashboard/open-board` are completely isolated/orphaned dead-ends from a navigation perspective.

3. **Premise**: Dynamic route parameters (`[id]`) must represent a consistent domain entity, or the page must branch logic based on entity resolution.
   - *Observation*: `/dashboard/university/proposal/[id]` receives both proposal IDs (`p.id` from `university/page.tsx:346`) and challenge IDs (`c.id` from `university/page.tsx:431`).
   - *Observation*: The page always sends `challengeId: rawId` to `POST /api/proposals`.
   - *Observation*: `POST /api/proposals` queries `prisma.challenge.findFirst({ where: { id: challengeId } })`.
   - *Deduction*: Clicking "Edit / View DPR" on an existing proposal passes `p.id`, which the API tries to look up as a challenge, failing with 404. It also creates a duplicate instead of updating the existing proposal via `PUT /api/proposals/[id]`.

4. **Premise**: Escrow funding commitments require distinct workflows for pledging funds versus inspecting committed tranches.
   - *Observation*: `/dashboard/industry/fund/[id]` receives both funding commitment IDs (`f.id` from `industry/page.tsx:242`) and proposal IDs (`p.id` from `industry/page.tsx:302`).
   - *Observation*: The page treats `params.id` exclusively as `proposalId` in `POST /api/funds`.
   - *Deduction*: Clicking "View Escrow Tranches" on an existing funding commitment passes `f.id`, which the API attempts to look up as a proposal ID, failing with 404. The user is unable to view their active escrow tranches.

---

## 3. Caveats

1. **Read-Only Scope**: In strict accordance with explorer constraints, no source code files in `web/src` were modified during this investigation.
2. **Backend API Completeness**: The backend API endpoints (`/api/chat`, `/api/micro-tasks`, `/api/proposals/[id]`, `/api/funds/[id]`, etc.) exist and are functional. The defects identified are strictly frontend routing, navigation linking, and parameter passing mismatches.
3. **Database Population**: Certain views require active seeded data (e.g. at least one proposal to populate `/dashboard/chat` select dropdown).

---

## 4. Conclusion

The Next.js Web application contains a solid architecture of 19 functional pages and comprehensive API endpoints, but suffers from **five specific routing and flow defects**:

1. **404 Target Routes (`/dashboard/citizen` and `/dashboard/expert`)**: Unauthorized redirects in `gov/page.tsx`, `university/page.tsx`, and `industry/page.tsx` dynamically interpolate `user.role.toLowerCase()`, generating invalid routes that 404.
2. **Orphaned Functional Pages (`/dashboard/chat` and `/dashboard/open-board`)**: Fully implemented collaboration hub and contributor board pages have zero navigation links in the dashboard sidebar or main navigation.
3. **Orphaned Full Page (`/apply/[challengeId]`)**: The dedicated mentor/expert application page is bypassed by an inline modal in `challenge/[id]/page.tsx`.
4. **Dual Parameter Failure in Proposal Editing (`/dashboard/university/proposal/[id]`)**: Passing proposal IDs to the page causes `POST /api/proposals` to fail with 404 because it mistakes the proposal ID for a challenge ID and does not use `PUT /api/proposals/[id]`.
5. **Dual Parameter Failure in Escrow Inspection (`/dashboard/industry/fund/[id]`)**: Passing funding commitment IDs to the pledge page causes `POST /api/funds` to fail with 404 because it mistakes the commitment ID for a proposal ID.

### Proposed Solutions for Implementer:
1. **Fix Unauthorized Redirection in Dashboards**:
   - In `gov/page.tsx`, `university/page.tsx`, and `industry/page.tsx`, replace:
     `router.replace('/dashboard/' + target + '?error=unauthorized')`
     with a safe role router matching `RoleGuard.tsx`:
     ```typescript
     if (userRole === "GOV") router.replace("/dashboard/gov");
     else if (userRole === "UNIVERSITY") router.replace("/dashboard/university");
     else if (userRole === "INDUSTRY") router.replace("/dashboard/industry");
     else router.replace("/submit?error=unauthorized");
     ```
2. **Wire Up Orphaned Routes in `dashboard/layout.tsx`**:
   - Add `{ name: "Industry-University Chat", href: "/dashboard/chat", icon: MessageSquare }` to University and Industry navigation arrays.
   - Add `{ name: "Open Contributor Board", href: "/dashboard/open-board", icon: ListTodo }` to navigation arrays.
   - For Citizen/Expert roles in `dashboard/layout.tsx`, replace the links to restricted Gov/University/Industry dashboards with appropriate Citizen actions:
     `[ { name: "Report Problem", href: "/submit" }, { name: "Track Grievance", href: "/track" }, { name: "Contributor Tasks", href: "/dashboard/open-board" }, { name: "Public Accountability", href: "/accountability" }, { name: "Settings", href: "/dashboard/settings" } ]`.
3. **Resolve Parameter Ambiguity in Proposal Page (`proposal/[id]/page.tsx`)**:
   - When loading an existing proposal, store `proposal.challengeId` in state and set an `isEditing` flag.
   - On submission, if `isEditing`, call `PUT /api/proposals/${rawId}`; otherwise call `POST /api/proposals` with `challengeId: rawId`.
4. **Resolve Parameter Ambiguity in Fund Page (`fund/[id]/page.tsx`)**:
   - On mount, detect whether `params.id` is a funding commitment or a proposal by querying `/api/funds/${params.id}` or `/api/proposals/${params.id}`.
   - If it is an existing funding commitment, display the commitment's active escrow tranches, status, and milestone disbursement history.
   - If it is an open proposal, display the pledge form with actual proposal budget and title pre-filled.
5. **Link `/apply/[challengeId]`**:
   - In `challenge/[id]/page.tsx`, provide an explicit link: `<Link href={`/apply/${challenge.publicTrackingId || challenge.id}`}>` or preserve the modal while allowing the direct URL to be accessible via a "Full Application Form" button.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Search for Placeholder Links**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   grep -r 'href="#"' src/app/
   # Expected result: 0 matches
   ```
2. **Verify Next.js Production Build**:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npm run build
   # Expected result: Compiled successfully with 0 TypeScript/Turbopack errors
   ```
3. **Automated Route Crawl (Verify HTTP 200 on all routes)**:
   A lightweight verification script can verify all 19 routes against the running Next.js server (`npm run dev`):
   ```javascript
   const routes = [
     '/',
     '/accountability',
     '/guidelines',
     '/login',
     '/submit',
     '/track',
     '/whatsapp-intake',
     '/dashboard',
     '/dashboard/gov',
     '/dashboard/nodal',
     '/dashboard/university',
     '/dashboard/industry',
     '/dashboard/chat',
     '/dashboard/open-board',
     '/dashboard/settings',
   ];
   for (const route of routes) {
     const res = await fetch(`http://localhost:3000${route}`);
     console.log(`${route}: HTTP ${res.status}`);
   }
   ```
4. **Invalidation Conditions**:
   - If `/dashboard/citizen` or `/dashboard/expert` are visited and return 404, this finding is confirmed.
   - If `/dashboard/chat` or `/dashboard/open-board` cannot be reached from any click in `DashboardLayout`, this finding is confirmed.
   - If clicking "Edit / View DPR" on an existing proposal leads to a form that throws "Associated challenge not found", this finding is confirmed.
