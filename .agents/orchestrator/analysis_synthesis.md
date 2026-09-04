# Synthesis of Platform UI Audit & Discovery (Milestone 1)

## Consensus Findings

Across all 3 parallel Explorers (`teamwork_preview_explorer_m1_1`, `_m1_2`, `_m1_3`), the platform UI audit identified the following complete inventory of dead-ends, missing pages, and unhandled interactions:

### 1. Explicit `href="#"` Dead Ends
- `web/src/app/dashboard/layout.tsx:40`:
  `{ name: "Settings", href: "#", icon: Settings }`

### 2. Missing Routes (404 Triggers)
- `/guidelines`: Linked from homepage `web/src/app/page.tsx:197` ("Review Submission Guidelines & IP Terms"), but route does not exist.
- `/dashboard`: Direct navigation to `/dashboard` returns Next.js 404 because no `web/src/app/dashboard/page.tsx` exists.
- `/dashboard/settings`: Required target for sidebar Settings.
- `/track`: Referenced as logical post-submission endpoint for citizens after submitting issues on `/submit`.

### 3. Dead Buttons Without `onClick` or Routing
- `web/src/app/page.tsx:135`: "View All Projects" button has no `onClick` or href.
- `web/src/app/dashboard/industry/page.tsx:52`: "Filter Proposals" button has no `onClick`.
- `web/src/app/dashboard/industry/page.tsx:132`: Pop-out arrow on proposal cards has no `onClick`.
- `web/src/app/dashboard/university/page.tsx:117`: "View All" assigned challenges has no `onClick`.
- `web/src/app/dashboard/university/proposal/[id]/page.tsx:81`: "Save Draft" button has no `onClick`.

### 4. Inert / Uncontrolled Interactive Elements
- `web/src/app/dashboard/university/page.tsx:49`: Search input has no `value` or `onChange` handler.
- `web/src/app/submit/page.tsx:139`: File upload dropzone is a static `<div>` without `<input type="file">` or drop handler.
- `web/src/app/challenge/[id]/page.tsx`: Photo / Video ground-zero evidence has `cursor-pointer` but no lightbox or modal viewer.
- `web/src/app/dashboard/industry/fund/[id]/page.tsx`: "Escrow Terms & Draft MoU" and "Download CSR Receipt" lack interactive modal or receipt preview.
- `web/src/app/login/page.tsx`: Mentors & Independent Experts invited on landing page lack a login persona.

### 5. Static Dashboards
- `web/src/app/dashboard/gov/page.tsx` had 0 links or buttons. Metrics and domain breakdown should be interactive with filter controls or detailed drill-downs.

---

## Action Plan for Implementation (Milestones 2 & 3)
1. Implement missing pages:
   - `src/app/guidelines/page.tsx`
   - `src/app/dashboard/page.tsx`
   - `src/app/dashboard/settings/page.tsx`
   - `src/app/track/page.tsx`
2. Update navigation in `src/app/dashboard/layout.tsx`:
   - Replace `href="#"` with `/dashboard/settings`.
   - Add role-specific navigation menus (Overview, Challenges/Proposals, Analytics, Settings).
3. Wire all buttons and search inputs across:
   - `src/app/page.tsx`
   - `src/app/login/page.tsx`
   - `src/app/submit/page.tsx`
   - `src/app/dashboard/gov/page.tsx`
   - `src/app/dashboard/industry/page.tsx`
   - `src/app/dashboard/university/page.tsx`
   - `src/app/dashboard/university/proposal/[id]/page.tsx`
   - `src/app/challenge/[id]/page.tsx`
   - `src/app/dashboard/industry/fund/[id]/page.tsx`
4. Verify zero `href="#"` across `src/app/` and verify `npm run build` succeeds cleanly.
