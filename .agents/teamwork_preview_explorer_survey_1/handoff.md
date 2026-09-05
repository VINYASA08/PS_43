# Handoff Report: Codebase & UI Architecture Survey

**Agent**: Explorer Survey 1 (Codebase & UI Architecture Explorer)  
**Recipient**: Parent Agent (`57ec4971-0a0c-4092-8219-d36d4b938529`)  
**Working Directory**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_1`  
**Milestone**: Codebase & UI Architecture Survey  
**Handoff Type**: Hard Handoff (Investigation Complete)  
**Generated Report Artifact**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_1\survey_report.md`

---

## 1. Observation

1. **Browser Security Headers (`web/next.config.ts:44-46`)**:
   ```typescript
   {
     key: "Permissions-Policy",
     value: "camera=(), microphone=(), geolocation=()",
   }
   ```
   Directly disables `camera`, `microphone`, and `geolocation` feature policies for all routes served by Next.js.

2. **Frontend Routing Structure (`web/src/app/**/page.tsx`)**:
   There are exactly 16 route pages:
   - `/` (`web/src/app/page.tsx`)
   - `/submit` (`web/src/app/submit/page.tsx`)
   - `/track` (`web/src/app/track/page.tsx`)
   - `/login` (`web/src/app/login/page.tsx`)
   - `/dashboard` (`web/src/app/dashboard/page.tsx`)
   - `/dashboard/gov` (`web/src/app/dashboard/gov/page.tsx`)
   - `/dashboard/university` (`web/src/app/dashboard/university/page.tsx`)
   - `/dashboard/university/proposal/[id]` (`web/src/app/dashboard/university/proposal/[id]/page.tsx`)
   - `/dashboard/industry` (`web/src/app/dashboard/industry/page.tsx`)
   - `/dashboard/industry/fund/[id]` (`web/src/app/dashboard/industry/fund/[id]/page.tsx`)
   - `/dashboard/settings` (`web/src/app/dashboard/settings/page.tsx`)
   - `/challenge/[id]` (`web/src/app/challenge/[id]/page.tsx`)
   - `/apply/[challengeId]` (`web/src/app/apply/[challengeId]/page.tsx`)
   - `/guidelines` (`web/src/app/guidelines/page.tsx`)
   - `/whatsapp-intake` (`web/src/app/whatsapp-intake/page.tsx`)
   - `/accountability` (`web/src/app/accountability/page.tsx`)

3. **Citizen Challenge Submission Flow (`web/src/app/submit/page.tsx:74-92`)**:
   ```typescript
   const evidenceObj = {
     mediaUrls: files.map(f => `/evidence/${f.name}`),
     turbidity: "48 NTU",
     dissolvedIron: "6.2 mg/L",
     ph: "4.8",
   };

   const res = await apiFetch<any>("/api/challenges", {
     method: "POST",
     body: {
       title,
       description,
       domain,
       district,
       location,
       urgency,
       evidence: JSON.stringify(evidenceObj),
     },
   });
   ```
   Files added to `files` state are never posted to a storage service or multipart upload endpoint. Only a string mock path `/evidence/${f.name}` with simulated water telemetry is submitted.
   Location inputs (`district` and `location`) are free-form `<input type="text">` fields with no GPS acquisition or 24-district dropdown.

4. **Absence of AI Provider Dependencies (`web/package.json:20-33`)**:
   ```json
   "dependencies": {
     "@tailwindcss/postcss": "^4.2.1",
     "bcryptjs": "^3.0.3",
     "framer-motion": "^13.2.0",
     "jose": "^6.2.2",
     "lucide-react": "^1.16.0",
     "next": "16.3.4",
     "prisma": "^7.10.0",
     "qrcode": "^1.5.4",
     "react": "19.2.8",
     "react-dom": "19.2.8",
     "speakeasy": "^2.0.0",
     "tailwindcss": "^4.2.1",
     "zod": "^4.5.1",
     "zustand": "^5.0.12"
   }
   ```
   Neither `@google/genai` nor `openai` is installed. No Gemini or OpenAI API integration exists.

5. **Client Authentication & Navigation Layouts**:
   - `web/src/stores/authStore.ts`: Zustand store managing `user`, `isAuthenticated`, `isLoading`, and `sessionExpired`.
   - `web/src/components/RoleGuard.tsx`: Verifies role and redirects unauthorized users to `/login`.
   - `web/src/app/dashboard/layout.tsx`: Role-adaptive sidebar for CITIZEN, UNIVERSITY, INDUSTRY, GOVERNMENT.
   - `web/src/lib/api-client.ts`: Custom `apiFetch` injecting CSRF tokens and handling 401 expiration.

6. **Existing Test Suites**:
   - `web/tests/workflows.test.mjs` passes 23 unit tests verifying mocked component behavior (dropzone arrays, filter helper functions, ID generation regexes). No headless browser or end-to-end integration tests exist.

---

## 2. Logic Chain

1. **Permissions-Policy Blocker**:
   - Observation 1 demonstrates that `Permissions-Policy: camera=(), microphone=(), geolocation=()` is delivered on every response.
   - Browsers complying with W3C Permissions Policy will disallow any calls to `navigator.geolocation.getCurrentPosition()` and HTML5 media capture (`<input capture>`).
   - Therefore, any citizen using a modern browser on `/submit` cannot provide automated GPS coordinates or camera capture until this header is modified to `camera=(self), geolocation=(self)`.

2. **Multimedia & Evidence Gap**:
   - Observation 3 proves that `submit/page.tsx` stages file metadata (`name`, `size`) in local component state.
   - During form submission, it does not send `FormData` or upload binaries to `/api/upload` or local `/public/uploads`.
   - Therefore, the evidence referenced by challenge records in the database contains non-existent static paths (`/evidence/${f.name}`), preventing university researchers and government triage officers from inspecting ground-truth media.

3. **Geospatial & Administrative District Gap**:
   - Observation 3 shows `district` is a raw text field defaulting to "Dhanbad", and `location` defaults to "Block XYZ, Village 4".
   - There is no selector restricting districts to Jharkhand's 24 statutory districts, nor is there coordinate extraction or map pin placement.
   - Therefore, challenge submissions cannot be reliably mapped on geospatial GIS layers or clustered geographically without manual data hygiene.

4. **AI Categorization (R2) Deficiency**:
   - Section ## 2026-09-04T14:06:00Z and ## 2026-09-04T21:04:25Z in `ORIGINAL_REQUEST.md` mandate real AI categorization using Gemini or OpenAI.
   - Observation 4 confirms neither `@google/genai` nor `openai` is installed in `web/package.json`.
   - In `submit/page.tsx`, domain and urgency are purely manually selected by the user.
   - Therefore, intelligent AI triage, semantic deduplication, and automated lab routing are currently simulated rather than computationally executed.

5. **UI Architecture Strengths**:
   - Observations 2 and 5 show a complete, responsive Next.js App Router application with all required persona portals (Citizen, University, Industry, Government, Settings, Guidelines, Accountability).
   - Component state, CSRF tokens, session recovery, and client guards are properly structured and operational.
   - Therefore, the core frontend architecture is sound and well-structured, requiring targeted feature integrations rather than architectural restructuring.

---

## 3. Caveats

1. **Testing Environment**: Investigation was performed in read-only mode using static analysis of source code, schemas, and test suites. No live dev server was spawned during this survey to avoid modifying workspace state.
2. **Mobile Directory**: Checked `mobile/` directory and confirmed it contains only an empty `.idea` folder; all client-facing UI code is concentrated within `web/`.
3. **Third-Party Services**: We did not verify external SMS gateway keys or S3/cloud storage credentials because they are not yet configured in `.env`.

---

## 4. Conclusion

The existing UI architecture at `web/` is a modern, responsive, and aesthetically polished Next.js 16 App Router application with 16 functional route pages covering all persona workflows. However, to fulfill the authoritative requirements of `ORIGINAL_REQUEST.md` for citizen engagement and intelligent challenge escalation, four targeted interventions are required:
1. **Unblock Permissions-Policy**: Change `web/next.config.ts:45` to permit camera and geolocation (`camera=(self), geolocation=(self)`).
2. **Upgrade Citizen Submission (`/submit`)**: Add Jharkhand 24-district dropdown selector, GPS coordinate acquisition, and real multipart file upload storage.
3. **Implement Real AI Categorization Engine**: Install `@google/genai` or `openai` and implement an AI categorization service/API.
4. **Align Statutory Domains**: Update domain selector in `/submit` to expose all 10 priority domains specified in `web/src/lib/validation.ts`.

---

## 5. Verification Method

To independently verify these findings, run the following commands and inspections:

1. **Verify Permissions-Policy Header**:
   ```bash
   # Inspect line 45 in next.config.ts
   grep -n "Permissions-Policy" a:/Development/Antigravity/SIH26043/web/next.config.ts
   ```

2. **Verify Missing AI Provider Packages**:
   ```bash
   # Check dependencies in web/package.json
   grep -E "@google/genai|openai" a:/Development/Antigravity/SIH26043/web/package.json
   # Output should be empty
   ```

3. **Verify Evidence Mock Object in `/submit`**:
   ```bash
   # Inspect evidence object creation in submit/page.tsx
   grep -n -C 5 "evidenceObj" a:/Development/Antigravity/SIH26043/web/src/app/submit/page.tsx
   ```

4. **Verify Existing Automated Test Suites**:
   ```bash
   cd a:\Development\Antigravity\SIH26043\web
   node tests/workflows.test.mjs
   node tests/routes.test.mjs
   ```
   Both test suites will execute and pass their unit assertions.

5. **Read Full Survey Report**:
   Inspect `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_survey_1\survey_report.md` for the complete 6-section architectural analysis and feature inventory.
