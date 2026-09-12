# Handoff Report: Database Architecture & Security Infrastructure Investigation

**Agent**: Explorer 1  
**Working Directory**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1`  
**Target Application**: `a:\Development\Antigravity\SIH26043\web`  
**Date**: September 4, 2026 (UTC: 2026-09-04T14:11:00Z)  
**Detailed Analysis Reference**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md`  

---

## 1. Observation

1. **Project Environment & Dependencies (`web/package.json:11-29`)**:
   ```json
   "dependencies": {
     "@ducanh2912/next-pwa": "^10.2.9",
     "framer-motion": "^13.2.0",
     "lucide-react": "^1.41.0",
     "next": "16.3.4",
     "react": "19.2.8",
     "react-dom": "19.2.8",
     "zustand": "^5.0.15"
   },
   "devDependencies": {
     "@tailwindcss/postcss": "^4",
     "@types/node": "^20",
     "@types/react": "^19",
     "@types/react-dom": "^19",
     "eslint": "^9",
     "eslint-config-next": "16.3.4",
     "tailwindcss": "^4",
     "typescript": "^5"
   }
   ```
   No ORM, database driver (`@prisma/client`, `pg`), or schema validation libraries (`zod`) are currently installed.
   No `.env` or `.env.example` files exist in `web/`.
   No backend API routes (`src/app/api/`) exist yet.

2. **Next.js Config & Turbopack (`web/next.config.ts:1-18`)**:
   `next.config.ts` wraps `withPWA` and enables Turbopack. It currently defines zero HTTP security headers (no CSP, no X-Frame-Options, no HSTS).

3. **Persona Definitions & Test Credentials (`web/src/app/login/page.tsx:25-96`)**:
   - `gov`: `nodal.innovation@jharkhand.gov.in`, "Principal Secretary & Nodal Officer"
   - `university`: `pi.water@iitism.ac.in`, "Lead Principal Investigator (IIT ISM Dhanbad)"
   - `industry`: `csr.director@tatasteel.com`, "CSR & Innovation Head (Tata Steel)"
   - `expert`: `dr.sen.mentor@isro-alumni.res.in`, "Senior Remote Sensing & Hydrology Expert"
   - `citizen`: `citizen.reporter@jharkhand.org`, "Public Contributor" (also referenced in `submit/page.tsx:285-291` as `pooja.murmu@village4.org`)

4. **Recurring Challenge & Proposal IDs**:
   - Challenges: `IN-GR-2026-9842` / `JHR-2026-842` / `CH-842` (Dhanbad, Water Management), `IN-DL-2026-3104` / `JHR-2026-821` / `CH-843` (Gumla, Agriculture), `IN-MH-2026-7712` / `JHR-2026-805` / `CH-821` (Simdega, Healthcare), `JHR-2026-788` / `CH-809` (Ranchi, Energy), `JHR-2026-764` (Khunti, Education), `JHR-2026-750` (Sahebganj, Water).
   - Proposals (`web/src/app/dashboard/industry/page.tsx:38-79`): `PR-102` (IIT ISM, ₹3,50,000), `PR-104` (Birsa Agri, Mentorship Only), `PR-109` (NIT Jamshedpur, ₹12,00,000), `PR-115` (IIT ISM Dhanbad, ₹4,80,000).
   - Funding Escrows (`web/src/app/dashboard/industry/fund/[id]/page.tsx:38-92`): `JH-ESCROW-2026-CSR-9842` (Tata Steel CSR, ₹3.5L, 30-40-30 tranches under Section 80G(5)(vi) and Section 35(1)(ii)), `JH-ESCROW-2026-CSR-7712` (Coal India CSR, ₹8.0L).

5. **Test Harness Findings (`web/tests/workflows.test.mjs:399-404`)**:
   Workflow 7 records a documented defect where proposal drafts are saved to `localStorage` but not rehydrated on mount due to missing `useEffect`. This highlights the need for persistent database-backed drafts.

---

## 2. Logic Chain

1. **Integration Pathway (from Observation 1 & 2)**:
   - Because Next.js 16 uses React 19 and hot module replacement, instantiating `new PrismaClient()` at module level would cause PostgreSQL connection exhaustion during development. Therefore, a global singleton pattern (`src/lib/prisma.ts`) must be established.
   - Prisma packages (`@prisma/client`, `prisma`) and execution helpers (`tsx` for seed execution) must be added to `package.json`.

2. **Schema & Model Design (from Observations 3 & 4)**:
   - The five UI personas map directly to the `UserRole` enum (`GOV`, `UNIVERSITY`, `INDUSTRY`, `CITIZEN`, `EXPERT`).
   - The UI distinguishes between citizen tracking identifiers (`IN-GR-2026-9842`), internal references (`CH-842`), and academic proposals (`PR-102`). The schema must provide indexed fields (`publicTrackingId`, `proposalRef`, `escrowRef`) to avoid slow table scans and ensure URL lookups resolve in $O(1)$ time.
   - The CSR escrow system in `fund/[id]/page.tsx` explicitly operates on a 3-tranche milestone (30% DPR approval, 40% lab prototype, 30% field collector sign-off) and Section 80G statutory tax receipts. The `FundingCommitment` model must store structured tranche definitions (`Json`) and enforce tripartite MoU signing states.

3. **Soft Delete & Transactions (from Observation 1 & 4)**:
   - Since challenges, proposals, and public funding commitments require auditability for Government of Jharkhand grievance redressal (GRAI index), records must never be hard-deleted from production tables.
   - Using modern Prisma Client Extensions (`$extends`) allows transparent intercept of `findMany`, `findFirst`, and `delete` operations without relying on deprecated middleware.
   - Submitting proposals and allocating escrow funds involve interdependent state changes (e.g. updating challenge status, creating proposal, creating audit log). These must execute within `prisma.$transaction` to guarantee ACID compliance.

4. **Security Hardening (from Observation 1 & 2)**:
   - Next.js currently serves pages without defensive HTTP headers. Inserting CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and HSTS via `next.config.ts` mitigates clickjacking, MIME-type sniffing, and cross-site scripting (XSS).
   - In Next.js App Router, incoming JSON payloads must be parsed with Zod schemas to reject unexpected fields, prevent prototype pollution, and sanitize types before hitting ORM logic.
   - Authentication and submission endpoints require token-bucket rate limiting (max 5-10 requests/minute) to stop credential stuffing and bot flooding.

---

## 3. Caveats

1. **PostgreSQL Instance Availability**: This analysis provides the schema, client extensions, transactions, and seed scripts. An actual running PostgreSQL database instance (local or hosted like Neon/Supabase) is required when executing `prisma migrate dev`.
2. **PostGIS Spatial Extensions**: The schema stores location coordinates and strings in standard PostgreSQL types. If polygon geofencing across Jharkhand's 24 district boundaries is needed later, PostGIS extension can be enabled in a subsequent migration.
3. **Storage for Uploaded Artifacts**: Media evidence (photos, video transcripts, DPR PDFs) currently references file metadata and hashes. Cloud blob storage (e.g. S3 or Cloudflare R2) integration will be required for binary persistence.

---

## 4. Conclusion

The database and security architecture is completely specified and fully synchronized with the portal's UI, mock data, and test workflows:
1. **Schema**: 5 core models (`User`, `Challenge`, `Proposal`, `FundingCommitment`, `AuditLog`) with complete enums, foreign keys, and indexes.
2. **Soft Deletes & Transactions**: Clean, type-safe Prisma `$extends` query extension and atomic multi-step mutations with audit trail generation.
3. **Seed Script**: Complete `prisma/seed.ts` script that deterministically populates 7 users across all 5 personas, 6 real challenges, 4 proposals, 2 CSR escrow agreements, and initial audit logs.
4. **OWASP Top 10 Hardening**: Hardened `next.config.ts` headers, CSRF validation, comprehensive Zod validation schemas, token-bucket rate limiting, and zero-secret environment separation.

All code and architectural specifications are documented in `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md`.

---

## 5. Verification Method

To independently verify this architectural specification:
1. **Inspect Schema & Analysis Files**:
   - View `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md`
   - Verify that all fields requested in the mission prompt are present in the `prisma/schema.prisma` specification.
2. **Cross-Check IDs with Existing Frontend**:
   - Compare `analysis.md` seed data against `web/src/app/login/page.tsx`, `web/src/app/track/page.tsx`, and `web/tests/workflows.test.mjs`.
   - Confirm that `IN-GR-2026-9842`, `PR-102`, `JH-ESCROW-2026-CSR-9842`, and all persona emails match verbatim.
3. **Dry-Run Syntax & Type Check (Upon Implementation)**:
   - When implementer applies Prisma setup:
     ```bash
     cd a:\Development\Antigravity\SIH26043\web
     npx prisma validate
     npx prisma format
     ```
   - Verify `next.config.ts` builds successfully with `npm run build`.
