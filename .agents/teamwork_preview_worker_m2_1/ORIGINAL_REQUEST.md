## 2026-09-04T12:42:08Z

You are the Implementation Worker for Milestones 2 & 3: Platform Navigation, Missing Routes, and Interactive Dead-End Elimination.
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_m2_1
Project root: a:/Development/Antigravity/SIH26043/web
Scope documents:
- a:/Development/Antigravity/SIH26043/PROJECT.md
- a:/Development/Antigravity/SIH26043/.agents/orchestrator/analysis_synthesis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks to implement:
1. Create Missing Pages with Premium Government/Critical Dark Slate & Indigo Aesthetic:
   - `src/app/guidelines/page.tsx`:
     Complete guidelines page covering Eligibility Criteria (Institutes, Startups, NGOs), IP & Technology Transfer Policies (Joint IP framework), Funding & Grant Disbursement Rules (Phase 1/2/3 milestones), Ethics & Citizen Privacy Standards, Interactive FAQ Accordion, and "Download Official Guidelines PDF" action button.
   - `src/app/dashboard/page.tsx`:
     Central dashboard router / portal selector that seamlessly routes to `/dashboard/gov`, `/dashboard/industry`, or `/dashboard/university`, with quick stats, active challenges summary, and role badges.
   - `src/app/dashboard/settings/page.tsx`:
     Comprehensive enterprise settings view (Institution/Department Profile, Notification & Alert Rules, Security & 2FA, API & Integration Keys, Compliance Status) matching the dashboard layout aesthetic.
   - `src/app/track/page.tsx`:
     Citizen issue tracking portal where users can enter a Tracking ID (or load from ?id= query param) to view interactive timeline stages (Submitted -> AI Clustered -> Assigned to IIT Madras -> Industry Funded -> Solved), status badges, and ground reality logs.

2. Eliminate All `href="#"` and Broken Navigation:
   - In `src/app/dashboard/layout.tsx`:
     Replace `{ name: "Settings", href: "#", icon: Settings }` with `href: "/dashboard/settings"`.
     Expand navigation per role (e.g. Overview, Challenges/Proposals, Analytics, Settings).
   - In `src/app/page.tsx`:
     Wire "View All Projects" button to cleanly navigate or scroll to the projects section (`/#projects`).
     Verify the `/guidelines` link works with the new page.
   - In `src/app/login/page.tsx`:
     Add a 4th persona card for "Independent Expert / Research Mentor" with pre-filled mock credentials and seamless login.

3. Wire Unhandled Buttons, Forms, Dropzones, and Modals:
   - `src/app/submit/page.tsx`:
     Make the file upload dropzone interactive with `<input type="file">`, selected files display chip, drag & drop handlers.
     On submission success, display generated Tracking ID (e.g., `IN-GR-2026-9842`), copy tracking ID button, and link to `/track?id=IN-GR-2026-9842`.
   - `src/app/dashboard/gov/page.tsx`:
     Make metric cards and domain breakdown bars interactive (clickable filters or drilldown states).
     Add quick action buttons ("Export Triage Summary", "Filter by Domain").
   - `src/app/dashboard/industry/page.tsx`:
     Wire "Filter Proposals" button with interactive filter modal/dropdown (domain, stage, budget).
     Wire proposal card arrow buttons to `/dashboard/industry/fund/[id]`.
     Pass commitment type query param (`?type=funding` vs `?type=mentorship`).
   - `src/app/dashboard/university/page.tsx`:
     Wire "Search assigned challenges" input with live filtering of the challenge list.
     Wire "View All" button to clear or toggle filters.
     Ensure challenge cards link to `/challenge/[id]` or `/dashboard/university/proposal/[id]`.
   - `src/app/dashboard/university/proposal/[id]/page.tsx`:
     Wire "Save Draft" button with interactive toast/feedback.
     Add document upload selector for technical proposals.
   - `src/app/challenge/[id]/page.tsx`:
     Wire Ground Zero photo and video evidence cards to interactive modal/lightbox preview.
     Add "Share Challenge" button with copy-to-clipboard toast.
   - `src/app/dashboard/industry/fund/[id]/page.tsx`:
     Add interactive "Escrow Terms & Draft MoU" modal with signature preview.
     Wire "Download CSR Receipt" or confirmation state.

4. Build & Verify Acceptance Criteria:
   - Verify that running a search for `href="#"` across `src/app/` returns 0 results:
     `Get-ChildItem -Path "src\app" -Recurse -Filter "*.tsx" | Select-String -Pattern 'href="#"'`
   - Run `npm run build` in `a:/Development/Antigravity/SIH26043/web` and verify that the build succeeds with exit code 0 and no TypeScript/routing errors.
   - Document all changes in `changes.md` and complete `handoff.md` in your working directory.
   - Send a message to the orchestrator when finished.
