# Handoff Report: Web Dead Buttons, Missing Pages & Automated Route Crawler Architecture

**Author**: Survey Explorer 3 (`teamwork_preview_explorer_r7_survey_3`)  
**Target Milestone**: `r7_survey`  
**Date**: 2026-09-09T05:08:30Z  
**Project Root**: `a:/Development/Antigravity/SIH26043`  
**Web App Root**: `a:/Development/Antigravity/SIH26043/web`  

---

## 1. Observation

A systematic codebase inspection across `web/src/app` (19 page components, 2 layouts) and `web/src/components` was conducted using dedicated static AST/regex scripts (`audit_buttons.cjs`, `audit_icons.cjs`, `check_routes.cjs`), ripgrep searches, and Next.js route compilation manifests (`.next/app-path-routes-manifest.json`).

### 1.1 Dead Buttons & Unhandled Interactive Elements Directly Observed

1. **Dead WhatsApp Simulation Buttons (`web/src/app/whatsapp-intake/page.tsx`)**:
   - **Line 285**:
     ```tsx
     <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors">
       <span className="text-xl">😀</span>
     </button>
     ```
     *Observation*: Has neither `onClick` nor `type="submit"`. Clicking does nothing.
   - **Line 317**:
     ```tsx
     <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors">
       <Paperclip className="w-5 h-5 -rotate-45" />
     </button>
     ```
     *Observation*: Generic paperclip attachment button has no `onClick` handler.
   - **Line 321**:
     ```tsx
     {!inputValue && stage !== 1 && stage !== 2 && (
       <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors">
         <Camera className="w-5 h-5" />
       </button>
     )}
     ```
     *Observation*: Camera button rendered in default state has no `onClick` handler.
   - **Lines 192–194**:
     ```tsx
     <div className="flex items-center gap-4">
       <Video className="w-5 h-5 cursor-pointer" />
       <Phone className="w-5 h-5 cursor-pointer" />
       <MoreVertical className="w-5 h-5 cursor-pointer" />
     </div>
     ```
     *Observation*: Header icons display `cursor-pointer` but have no `onClick` handlers or wrapping interactive elements.
   - **Line 184**:
     ```tsx
     <div className="leading-tight cursor-pointer">
       <h2 className="font-semibold text-[17px]">Jharkhand Sahayata</h2>
       <p className="text-[13px] text-emerald-100 flex items-center gap-1">
         <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Online
       </p>
     </div>
     ```
     *Observation*: Profile title header has `cursor-pointer` but no `onClick` handler.
   - **Lines 327–336**:
     ```tsx
     <button 
       onClick={handleSend}
       className="w-[44px] h-[44px] rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0 hover:bg-[#008f6f] transition-colors shadow-sm"
     >
       {inputValue ? (
         <Send className="w-5 h-5 ml-1" />
       ) : (
         <Mic className="w-5 h-5" />
       )}
     </button>
     ```
     *Observation*: When `!inputValue`, the button renders a `<Mic>` icon. Clicking it calls `handleSend()`, which begins with `if (!inputValue.trim()) return;`. Therefore, clicking the microphone does nothing and provides no feedback.

2. **Incomplete Security Tab in Settings (`web/src/app/dashboard/settings/page.tsx`)**:
   - **Lines 51–56 & 114–142**:
     ```tsx
     const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? true);
     const [showTotpSetupModal, setShowTotpSetupModal] = useState(false);
     const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
     const [totpSecret, setTotpSecret] = useState<string | null>(null);
     const [verifyCode, setVerifyCode] = useState("");
     const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);

     const handleStartTotpSetup = async () => { ... };
     const handleConfirmTotp = async (e: React.FormEvent) => { ... };
     ```
   - **Lines 274–314**: The JSX rendered for `{activeTab === "security"}` renders *only* the `Active Cryptographic Sessions` table and revoke buttons. It omits the 2FA toggle button, QR code modal trigger, and `handleStartTotpSetup` invocation. Users cannot manage or setup 2FA from the settings page.

3. **Unclickable Profile Badge in Dashboard Layout (`web/src/app/dashboard/layout.tsx`)**:
   - **Lines 145–160**:
     ```tsx
     {user && (
       <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
         <div className="flex items-center justify-between mb-1">
           <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
             {user.name}
           </span>
           <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
             <ShieldCheck className="w-3 h-3" />
             {user.role}
           </span>
         </div>
         <p className="text-[11px] text-slate-500 truncate">
           {user.organization || user.email || user.phone}
         </p>
       </div>
     )}
     ```
     *Observation*: The user profile card in the sidebar is static unclickable markup. It does not route to `/dashboard/settings` or any profile view.

---

### 1.2 Missing Placeholder Pages, Orphan Routes & Next.js Conventions

1. **Orphan Implemented Pages (Unlinked from Navigation)**:
   - `/dashboard/open-board` (`web/src/app/dashboard/open-board/page.tsx`):
     - Fully implemented page containing micro-task browsing, creation modal, and application flow connected to `/api/micro-tasks`.
     - *Observation*: `grep` across `web/src` reveals **0 incoming links**. Neither `dashboard/layout.tsx` nor any dashboard links to it.
   - `/dashboard/chat` (`web/src/app/dashboard/chat/page.tsx`):
     - Fully implemented Industry-University Real-Time Chat Hub connected to `/api/chat` and `/api/proposals`.
     - *Observation*: `grep` across `web/src` reveals **0 incoming links**. It is unreachable via navigation.

2. **Missing Next.js App Router Standard Convention Pages**:
   - **`web/src/app/not-found.tsx`**: Does not exist. Unmatched paths render Next.js's raw default 404 screen rather than the branded Jharkhand State Innovation Portal design system.
   - **`web/src/app/error.tsx`**: Does not exist. Client or SSR runtime crashes have no UI boundary and trigger raw Next.js error fallback.
   - **`web/src/app/loading.tsx`**: Does not exist. Top-level route transitions lack instant streaming suspense fallback.

3. **Missing Auth Fallback Pages**:
   - **No `/unauthorized` or `/access-denied` page**: `web/src/components/auth/RoleGuard.tsx` (lines 40–50) silently redirects users to their role dashboard without visual feedback explaining why access was rejected.
   - **No dedicated `/auth/pending-approval` page**: When an industry user logs in while their account is pending, the message is displayed only inside the login card. There is no standalone status page providing verification contact details or submission status tracking.

---

### 1.3 Link Integrity Analysis

Running `check_routes.cjs` across all 58 `href` and `router.push/replace` targets:
- `href="#"` count: **0** (no placeholder hashes)
- `href=""` count: **0**
- Dead-end broken links: **0** (all link targets match either an existing static route, dynamic parameter route, or anchor section).

---

## 2. Logic Chain

1. **Dead Button Identification**:
   - *Premise*: Any interactive tag (`<button>` or element with `cursor-pointer`) that neither triggers an event handler (`onClick`), submits a form (`type="submit"`), nor navigates (`<Link>`) presents a broken UX expectation to users and fails R2 of the QA prompt.
   - *Evidence*: `whatsapp-intake/page.tsx` lines 184, 192–194, 285, 317, 321, 334 contain `<button>` or `cursor-pointer` elements with null/unreachable action handlers.
   - *Inference*: These elements must either be wired to realistic simulation actions (e.g., triggering modal toasts, opening simulated media selectors) or have misleading cursor classes removed.

2. **Feature Parity in Settings**:
   - *Premise*: Backend endpoints `/api/auth/totp-setup` and `/api/auth/totp-verify` exist, and state logic is implemented in `dashboard/settings/page.tsx`.
   - *Evidence*: `dashboard/settings/page.tsx` lines 51–56 implement state, but lines 274–314 omit the component from JSX.
   - *Inference*: Adding a 2FA management card into the Security tab directly restores feature accessibility without requiring new backend endpoints.

3. **Orphan Routes Reconciliation**:
   - *Premise*: Pages `/dashboard/open-board` and `/dashboard/chat` represent significant collaborative features (micro-tasks and R&D chat hub).
   - *Evidence*: Neither route appears in `web/src/app/dashboard/layout.tsx:getNavigation()`.
   - *Inference*: Linking `/dashboard/open-board` in University/Gov navigation and `/dashboard/chat` in University/Industry navigation fulfills R1 (Flow & Routing Repair) and eliminates orphan UI screens.

4. **Automated Route Crawler Requirement Analysis**:
   - *Premise*: Acceptance Criterion demands an automated programmatic script that requests every major route/page in the Web app, asserting HTTP 200 without hydration or server errors.
   - *Evidence*: The existing test harness (`web/tests/routes.test.mjs`) contains only 13 routes, hardcodes port 3005, omits `/accountability`, `/whatsapp-intake`, `/dashboard/nodal`, `/dashboard/open-board`, `/dashboard/chat`, and does not inspect response HTML for Next.js error digests or React hydration failure patterns.
   - *Inference*: A robust crawler architecture must be specified that dynamically resolves the running port, inventories all 25 public/dashboard/dynamic/query routes, tests both unauthenticated and authenticated sessions, and asserts both HTTP status and payload content integrity (server digests, React errors #418/#423/#425).

---

## 3. Caveats

1. **Runtime Server Requirement**: The route crawler script requires an active Next.js server (either dev or production `next start`). If run in standalone mode, it must auto-detect or spawn the server.
2. **Dynamic Route Identifiers**: Dynamic routes (`/challenge/[id]`, `/apply/[challengeId]`, `/dashboard/industry/fund/[id]`, `/dashboard/university/proposal/[id]`) rely on seeded database IDs (`JHR-2026-842`, `JHR-2026-821`, `PR-102`, `CH-842`). The database must be seeded (`npx prisma db seed`) for database-driven detail pages to populate.
3. **Client-Side-Only Hydration Mismatches**: An HTTP crawler script inspects the server-rendered HTML stream for SSR error markers and hydration bailouts. Catching dynamic DOM client-side hydration mismatches during React's `hydrateRoot` phase in a real browser requires a headless browser (such as Playwright). Since Playwright is not currently in `package.json`, the primary crawler must use Node `fetch` with deep HTML pattern matching, while the architecture provides the optional Playwright harness specification.
4. **Mobile Scope**: Mobile application audit was scoped to Survey Explorer 1 & 2; this investigation focused strictly on `web/`.

---

## 4. Conclusion & Architectural Specification

### 4.1 UI & Routing Repair Recommendations (For Implementation Agents)

| Priority | File Path | Location | Recommended Action |
|---|---|---|---|
| **P1** | `web/src/app/whatsapp-intake/page.tsx` | Lines 285, 317, 321 | Wire emoji button to insert `😊`, paperclip to `sendAttachment("photo")`, and camera to simulated intake photo. |
| **P1** | `web/src/app/whatsapp-intake/page.tsx` | Lines 192–194 | Wrap `Video`, `Phone`, `MoreVertical` in buttons that trigger a toast notification (`"Voice/Video calling active on WhatsApp helpline 1800-JH-INNOV"`). |
| **P1** | `web/src/app/whatsapp-intake/page.tsx` | Lines 327–336 | If `!inputValue`, wire Mic button to simulate voice input (`setInputValue("Road collapse reported at Sector 4")`). |
| **P1** | `web/src/app/dashboard/settings/page.tsx` | Lines 274–314 | Add the 2FA Configuration Card and modal in the Security tab using the existing `handleStartTotpSetup` and `handleConfirmTotp` functions. |
| **P1** | `web/src/app/dashboard/layout.tsx` | Lines 73–109 | Add `/dashboard/open-board` ("Contributor Board") and `/dashboard/chat` ("R&D Chat Hub") to sidebar navigation for University and Industry roles. |
| **P2** | `web/src/app/dashboard/layout.tsx` | Lines 145–160 | Wrap user profile badge in `<Link href="/dashboard/settings">` so clicking user info opens profile settings. |
| **P2** | `web/src/app/not-found.tsx` | New File | Implement a branded 404 page adhering to the Tailwind design system with a "Return to Portal" CTA. |
| **P2** | `web/src/app/error.tsx` | New File | Implement a branded client error boundary page with "Retry" CTA. |

---

### 4.2 Automated Route Crawler Test Architecture Specification

#### Architectural Diagram & Data Flow
```
┌────────────────────────────────────────────────────────┐
│               Automated Route Crawler                  │
│       (tests/crawl-routes.test.mjs / .ts)             │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 1. Port Auto-Discovery & Health Check                  │
│    - Scan [3000, 3005, 3001] or process.env.PORT       │
│    - Assert 200 OK on GET / health check               │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Session Cookie Engine                               │
│    - Programmatic login: POST /api/auth/login          │
│    - Capture Set-Cookie ('auth_token')                 │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Comprehensive Route Execution (25 Routes)           │
│    ├─ Static Public Routes (7)                         │
│    ├─ Protected Dashboard Routes (8)                   │
│    ├─ Dynamic Detail Routes (7)                        │
│    └─ Query Parameter Variations (3)                   │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Multi-Layer Response Assertion Engine               │
│    ├─ HTTP Status === 200                              │
│    ├─ Content-Type includes 'text/html'                │
│    ├─ Body Length >= 500 bytes                         │
│    ├─ Server Exception Regex Checks (No digest / 500)  │
│    └─ Hydration Mismatch Regex Checks (No React #418)  │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 5. Structured Reporting & CI Exit Code                 │
│    - Latency (ms), payload size (KB), pass/fail status │
│    - Exit code 0 (All passed) or 1 (Failures present)  │
└────────────────────────────────────────────────────────┘
```

#### Route Inventory Catalog (25 Routes)
1. **Public Static Pages (7)**:
   - `/` (Landing Page)
   - `/submit` (Citizen Intake Form)
   - `/track` (Citizen Issue Tracker)
   - `/guidelines` (Gazette Regulatory Framework & FAQs)
   - `/accountability` (Accountability & GRAI Leaderboard Index)
   - `/whatsapp-intake` (WhatsApp Omnichannel Intake)
   - `/login` (Tiered Multi-Role Authentication)
2. **Protected Dashboard Pages (8)**:
   - `/dashboard` (Central Multi-Tenant Gateway)
   - `/dashboard/gov` (Government Oversight Console)
   - `/dashboard/nodal` (Nodal Officer Triage Queue)
   - `/dashboard/university` (University R&D Portal)
   - `/dashboard/industry` (Industry CSR Portal)
   - `/dashboard/open-board` (Open Contributor Board)
   - `/dashboard/chat` (Collaboration Chat Hub)
   - `/dashboard/settings` (Platform & Security Settings)
3. **Dynamic Seeded Record Pages (7)**:
   - `/challenge/JHR-2026-842` (Challenge Details - Water Contamination)
   - `/challenge/JHR-2026-821` (Challenge Details - Solar Microgrid)
   - `/challenge/JHR-2026-789` (Challenge Details - Tribal Tele-Medicine)
   - `/apply/JHR-2026-842` (Expert / Mentor Application Form)
   - `/apply/JHR-2026-821` (Expert / Mentor Application Form)
   - `/dashboard/university/proposal/CH-842` (University Proposal Submission)
   - `/dashboard/industry/fund/PR-102` (Industry CSR Escrow Pledge Form)
4. **Query Parameter & State Variations (3)**:
   - `/track?id=IN-GR-2026-9842` (Tracker with Ground Zero ID)
   - `/dashboard/industry/fund/PR-102?type=mentorship` (CSR Mentorship Pledge View)
   - `/login?returnUrl=%2Fdashboard%2Fgov` (Auth returnUrl redirect fallback)

#### Assertion Engine Specification
For each route crawled:
1. `res.status === 200`
2. `res.headers.get("content-type").includes("text/html")`
3. `res.text().length >= 500`
4. Rejection patterns for server errors:
   - `/Application error: a server-side exception has occurred/i`
   - `/<title>500: Internal Server Error<\/title>/i`
   - `/<title>Application Error<\/title>/i`
   - `/Unhandled Runtime Error/i`
   - `/digest:\s*["']\d+["']/i`
5. Rejection patterns for React hydration failures:
   - `/Hydration failed because the initial UI does not match/i`
   - `/Text content does not match server-rendered HTML/i`
   - `/Minified React error #(?:418|423|425)/i`
   - `/There was an error while hydrating/i`

*Prototype script created and verified*:  
`a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_r7_survey_3/crawler_spec_prototype.mjs`

---

## 5. Verification Method

To independently verify the observations and specifications documented in this report:

1. **Verify Dead Buttons Audit via Static Analysis**:
   Run the button and icon audit scripts:
   ```bash
   node a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_r7_survey_3\audit_buttons.cjs
   node a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_r7_survey_3\audit_icons.cjs
   ```
   *Expected Result*: Confirms 3 buttons and 4 icon elements in `whatsapp-intake/page.tsx` lacking `onClick` handlers.

2. **Verify Route Link Integrity**:
   ```bash
   node a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_r7_survey_3\check_routes.cjs
   ```
   *Expected Result*: Confirms 0 broken links across all 58 internal destinations.

3. **Verify Clean Next.js Build**:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   npm run build
   ```
   *Expected Result*: Build completes with 0 type errors, generating Turbopack artifacts across all 19 pages.

4. **Verify Route Crawler Execution**:
   Start the Next.js server:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   npx next start -p 3005
   ```
   In a separate terminal, execute the crawler prototype:
   ```bash
   node a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_r7_survey_3\crawler_spec_prototype.mjs
   ```
   *Expected Result*: All 25 routes return HTTP 200 OK with >500 bytes and 0 server/hydration error markers.

---
*End of Report.*
