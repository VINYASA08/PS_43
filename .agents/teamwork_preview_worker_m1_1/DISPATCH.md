## 2026-09-04T21:15:09Z
You are Worker M1 (Citizen Intake & Evidence Hardening).
Your working directory is: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m1_1
Authoritative request file: a:\Development\Antigravity\SIH26043\.agents\ORIGINAL_REQUEST.md (read all sections, especially ## 2026-09-04T21:04:25Z and ## 2026-09-04T14:06:00Z)
Project master spec: a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_orchestrator_r3\PROJECT.md
Survey reports to consult: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_1\survey_report.md` and `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_2\survey_report.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You exclusively own:
- `web/src/app/api/upload/route.ts` (create new)
- `web/src/app/submit/page.tsx` (modify)
- `web/src/lib/constants.ts` (create new)
- `web/next.config.ts` (modify)
Do NOT edit other API routes or other pages.

Objective:
Implement Milestone 1 (Citizen Intake & Evidence Hardening):
1. In `web/next.config.ts` line 45: Update Permissions-Policy from `camera=(), microphone=(), geolocation=()` to `camera=(self), microphone=(), geolocation=(self)`. Also fix the Turbopack PWA `_ssgManifest.js` build issue if applicable (e.g., ensure `build` does not fail on PWA manifest generation).
2. Create `web/src/lib/constants.ts`:
   - Export `JHARKHAND_DISTRICTS`: Array of all 24 statutory districts of Jharkhand ("Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Saraikela Kharsawan", "Simdega", "West Singhbhum").
   - Export `PRIORITY_DOMAINS`: 10 canonical domains matching validation schema ("WATER_SANITATION", "HEALTHCARE", "AGRICULTURE", "EDUCATION", "ENERGY", "INFRASTRUCTURE", "ENVIRONMENT", "GOVERNANCE", "LIVELIHOOD", "WASTE_MANAGEMENT") with human-readable labels.
3. Create `web/src/app/api/upload/route.ts`:
   - Handles `POST` multipart/form-data uploads.
   - Validates file types (images: jpeg, png, webp; docs: pdf; video: mp4, webm).
   - Validates max file size (10MB per file).
   - Saves uploaded files to `web/public/uploads/` (create directory if it doesn't exist) with timestamped sanitized unique filenames.
   - Returns JSON: `{ success: true, files: [{ name, url: "/uploads/" + filename, type, size }] }`.
4. Update `web/src/app/submit/page.tsx`:
   - Replace free-text district input with a dropdown `<select>` populated from `JHARKHAND_DISTRICTS`.
   - Add a GPS capture button ("Capture GPS Coordinates") using `navigator.geolocation.getCurrentPosition`, auto-filling latitude, longitude, and formatted location string (with graceful error handling if denied).
   - Update file dropzone to actually upload dropped files via `FormData` to `/api/upload` (either immediately upon drop or upon submit) and store the real returned URLs in `evidenceObj.mediaUrls`.
   - Align domain selector with the 10 canonical domains.
5. Verify your work by running:
   - TypeScript checks / build (`cmd /c npm run build`)
   - Existing test suites (`cmd /c node tests/workflows.test.mjs`, `cmd /c npx tsx tests/auth-rbac-security.test.ts`)
   Ensure 0 build errors and passing tests.

Deliverables:
Write a comprehensive report to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_worker_m1_1\worker_report.md` and a 5-component `handoff.md`.
Message parent with a summary of changes and verification results.
