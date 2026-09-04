# Handoff Report — Explorer 1 (Milestone 1)

## 1. Observation

Direct examination of assigned files (`web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/login/page.tsx`, and `web/src/app/submit/page.tsx`) via `view_file` and directory inspection revealed the following exact lines and behaviors:

1. **Non-Existent Target Route (`/guidelines`)**:
   - **Path**: `web/src/app/page.tsx:196-201`
   - **Snippet**:
     ```tsx
     <Link
       href="/guidelines"
       className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all text-lg"
     >
       Read the Guidelines
     </Link>
     ```
   - **Inspection**: Directory search in `web/src/app` confirmed no directory or file matching `guidelines` exists. Clicking this route in Next.js serves an HTTP 404.

2. **Inert Button without Handler or Navigation**:
   - **Path**: `web/src/app/page.tsx:135-137`
   - **Snippet**:
     ```tsx
     <button className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
       View All Projects <ArrowRight className="w-5 h-5" />
     </button>
     ```
   - **Inspection**: The element is a native `<button>` with no `onClick`, no `type`, and no wrapper link. Clicking causes no action.

3. **Inert File Upload Dropzone in Submission Form**:
   - **Path**: `web/src/app/submit/page.tsx:139-143`
   - **Snippet**:
     ```tsx
     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center">
       <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
       <p className="text-sm font-medium">Upload Photos or Videos</p>
       <p className="text-xs text-slate-500 mt-1">JPEG, PNG, MP4 up to 50MB</p>
     </div>
     ```
   - **Inspection**: The element possesses dashed borders and upload iconography simulating an upload target, but lacks any `<input type="file">`, click handlers, or drag-and-drop listener functions.

4. **Persona Role Disconnect Between Homepage and Login**:
   - **Path 1**: `web/src/app/page.tsx:190-195` invites users to "Register as an Expert" with `href="/login"`.
   - **Path 2**: `web/src/app/login/page.tsx:5-46` defines `roles` with only 4 IDs: `gov` (Government Official), `university` (Higher Education Institution), `industry` (Industry Partner), and `citizen` (Citizen / Community). No expert card exists.

5. **Post-Submission Dead End**:
   - **Path**: `web/src/app/submit/page.tsx:200-220`
   - **Snippet**:
     ```tsx
     <h2 className="text-2xl font-bold mb-3">Submission Received!</h2>
     <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
       Thank you for bringing this to our attention. Our AI has categorized this as <span className="font-semibold text-slate-900">"Water Management"</span> and routed it to IIT ISM Dhanbad.
     </p>
     <Link
       href="/"
       className="inline-flex items-center justify-center px-8 py-3 rounded-full font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200"
     >
       Return Home
     </Link>
     ```
   - **Inspection**: No state tracking reference token is produced, no link to track progress is offered, and only an exit back to `/` is presented.

6. **Inert Header Brand**:
   - **Path**: `web/src/app/page.tsx:19-27` contains the portal logo and title as an unlinked `<div>`.

7. **Root Layout Omission of Global Header & Footer**:
   - **Path**: `web/src/app/layout.tsx:21-27` renders solely `{children}` without standard statutory government footer or accessibility utility strip.

---

## 2. Logic Chain

1. **Step 1 (Route 404)**: Observation #1 shows a standard Next.js `<Link>` pointing to `/guidelines`. Because `src/app/guidelines` is absent from the filesystem, clicking this link will trigger a 404 error during client execution. A target page or modal is necessary to resolve the broken route.
2. **Step 2 (Inert Button)**: Observation #2 shows a button rendered with visual callout styling and an icon. Because React requires an `onClick` prop or parent anchor/link for event execution, this element is a dead end.
3. **Step 3 (Citizen Upload Dead End)**: Observation #3 demonstrates that users cannot attach ground-zero photographic or video evidence despite explicit UI prompts. Without an underlying `<input type="file">` and state management, the user cannot fulfill the form's stated purpose.
4. **Step 4 (Role Mismatch)**: Observation #4 demonstrates that the marketing copy on the landing page promises an onboarding path for independent domain experts, yet routes them to a gateway lacking that option. This produces a dead end for expert users.
5. **Step 5 (Workflow Severance)**: Observation #5 demonstrates that a user who successfully files a societal issue cannot view their submission status, obtain an acknowledgment slip, or track resolution, breaking the citizen lifecycle.
6. **Step 6 (Structural Inconsistency)**: Observation #6 and #7 show that the absence of a global footer and layout standards results in fragmented branding and abrupt page terminations across the application.

---

## 3. Caveats

1. **Other Dashboard Scopes**: This audit was strictly constrained to `layout.tsx`, `page.tsx`, `login/page.tsx`, and `submit/page.tsx`. Sub-routes such as `dashboard/gov`, `dashboard/university`, and `dashboard/industry` are audited under Explorer 2.
2. **Backend / Database Integration**: The current application is a frontend Next.js prototype with mock latency and local storage simulation. File uploads and tracking IDs can be implemented using client-side state / mock data without requiring active S3/storage buckets.
3. **Alternative Implementation for Guidelines**: `/guidelines` can be implemented either as a standalone Next.js route (`src/app/guidelines/page.tsx`) or as an interactive slide-over/modal triggered directly from the homepage. A dedicated route is preferable for SEO and direct bookmarking by government agencies.

---

## 4. Conclusion

The assigned platform entry pages are visually polished but suffer from **two critical dead-end interactions** (`/guidelines` 404, inert "View All Projects" button), **one broken input component** (media dropzone), **one role mismatch** (missing expert persona), and **structural omissions** (no statutory footer, no submission tracking receipt). 

Resolving these items in Milestone 2 and Milestone 3 will establish a complete, uninterrupted, government-grade frontend flow from landing to submission to authentication.

---

## 5. Verification Method

To independently verify all findings:

1. **Verify `/guidelines` 404**:
   - Inspect route existence:
     ```powershell
     Test-Path "a:/Development/Antigravity/SIH26043/web/src/app/guidelines"
     ```
     *Expected result: `False`.*
   - Inspect `page.tsx:197`: Confirm `<Link href="/guidelines">`.

2. **Verify inert "View All Projects" button**:
   - Open `web/src/app/page.tsx` lines 135–137.
   - Confirm `<button>` has no `onClick`, `type`, or parent link.

3. **Verify inert file upload box**:
   - Open `web/src/app/submit/page.tsx` lines 139–143.
   - Confirm lack of `<input type="file">`, click handlers, or drag events.

4. **Verify missing expert persona**:
   - Open `web/src/app/login/page.tsx` lines 5–46.
   - Confirm `roles` contains only `gov`, `university`, `industry`, `citizen`.
