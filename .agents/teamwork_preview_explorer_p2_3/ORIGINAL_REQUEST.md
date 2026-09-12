## 2026-09-04T14:08:05Z
You are Explorer 3 investigating Frontend Mock Data Replacement, Route Guards & UX States for the Jharkhand Societal Innovation Portal (web app at `a:\Development\Antigravity\SIH26043\web`).
Your working directory is: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_3`

Mission & Objectives:
1. Examine all existing pages across `a:\Development\Antigravity\SIH26043\web\src\app`:
   - `/` (Landing page: impact stats, open projects, expert ecosystem)
   - `/login` (Login cards, persona switcher, OTP modals, 2FA modals)
   - `/dashboard` (Multi-tenant router/overview)
   - `/dashboard/gov` (Gov dashboard: KPI metrics, domain distribution, challenges table, pending approvals)
   - `/dashboard/university` (University dashboard: live challenges, proposal tracking, submit proposal button)
   - `/dashboard/industry` (Industry dashboard: proposals open for funding, CSR tax receipts, commitments)
   - `/challenge/[id]` (Challenge detailed view: evidence photos, SLA countdown, apply button, verification badge)
   - `/whatsapp-intake` (WhatsApp conversational intake simulator)
   - `/accountability` (Public accountability index & grievance escalation)
   - `/submit` (Citizen problem submission wizard with category, district, file dropzone)
   - `/track` (Citizen issue tracker with tracking ID, timeline stages, telemetry)
   - `/guidelines` (Statutory guidelines, policy pillars, FAQ)
   - `/dashboard/settings` (Profile, Notifications, 2FA setup, Compliance)
   - `/apply/[challengeId]` (Application wizard)
   - `/dashboard/university/proposal/[id]` (Proposal drafting console)
   - `/dashboard/industry/fund/[id]` (Funding console with escrow terms)
2. Map every piece of hardcoded/mock data in these pages to corresponding database tables/fields and planned API endpoints (`/api/challenges`, `/api/proposals`, `/api/funds`, `/api/analytics`, `/api/audit-logs`, `/api/users/profile`, `/api/submit`, etc.).
3. Design frontend authentication state integration:
   - Global auth provider / store (Zustand or React Context) syncing with `/api/auth/me`.
   - Role-based route guards (`withRoleGuard` or Next.js middleware / layout guards): redirect unauthenticated users to `/login`, redirect wrong roles (e.g. university accessing `/dashboard/gov`) to their authorized dashboard with an informational toast/alert.
   - Expired/invalid session handling: clear state and redirect to `/login` with "Session expired" banner.
   - Dynamic UI element rendering: show/hide navigation links, action buttons (e.g., "Fund Project" only for Industry, "Approve" only for Gov, "Submit Proposal" only for University).
4. Design UX edge states:
   - Skeleton loading screens for all data tables, metrics cards, and detail pages (no blank screens, no raw spinners).
   - Empty data states with helpful messages and calls-to-action (CTAs).
   - Network failure and offline/retry components.
   - CSRF token handling in forms and fetch requests.

Write your page-by-page mapping, API client hooks specification, route guard design, and skeleton UI patterns to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_3\analysis.md` and your summary to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_3\handoff.md`.
Remember: You are a read-only exploration agent. Do NOT modify source code files. Deliver your handoff and communicate completion.
