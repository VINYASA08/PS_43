# Project: Societal Innovation Collaboration Portal for Jharkhand

## Architecture
- **Framework**: Next.js 16.3.4 (App Router, Turbopack) + React 19.2.8 + Tailwind CSS v4 + Zustand + Framer Motion.
- **Database & Persistence**: Prisma ORM with comprehensive models (`User`, `Challenge`, `Proposal`, `FundingCommitment`, `AuditLog`), client query extension for automated soft delete, SQLite development database (`dev.db`) with PostgreSQL schema compatibility.
- **Security & RBAC**: Tiered auth (Citizen Phone+OTP, University `.ac.in`+OTP, Industry pending approval, Gov RFC 6238 TOTP 2FA), bcrypt (12 rounds), JWT HTTP-only cookie sessions (`sih_session`), sliding-window rate limiter (10 req/min), HMAC-SHA256 CSRF protection, OWASP Top 10 security headers (CSP, HSTS, X-Frame-Options: DENY).
- **AI Problem Management**: External AI provider (`@google/genai` Gemini 1.5 Flash / OpenAI GPT-4o-mini) for automated categorization across 10 canonical domains, 4 urgency levels, SLA deadline calculation, semantic deduplication, and intelligent routing to 6 empanelled Jharkhand academic institutions, with resilient keyword/regex heuristic fallback.
- **Collaborative Ecosystem**: 7-stage challenge lifecycle (Submitted -> AI Categorized & Routed -> University Review & DPR Proposal -> Gov/Industry CSR Escrow Funding -> Prototyping -> Deployment -> Impact Verification) with 30-40-30 milestone tranche disbursement and Section 80G tax receipt generation.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Permissions-Policy Update | Enable camera and geolocation in `next.config.ts` (`camera=(self), geolocation=(self)`) | M1 | Survey 1 & 2 |
| F2 | Citizen Multimedia Evidence Upload | Real multipart file upload endpoint (`/api/upload`) with file validation (types, size limits) | M1 | Survey 1 |
| F3 | Citizen Geolocation & Administrative Selection | 24 statutory Jharkhand districts dropdown selector and GPS coordinate capture (`navigator.geolocation`) on `/submit` | M1 | Survey 1 |
| F4 | Challenge Submission Domain Alignment | Align `/submit` domain options with all 10 priority domains in validation schema | M1 | Survey 1 |
| F5 | Security Patches (CSRF) | Enforce CSRF token validation on `PUT /api/users/profile` and `POST /api/challenges/[id]/apply` | M3 | Survey 2 |
| F6 | Frontend Subpage RBAC Protection | Route protection/redirects on `/dashboard/gov`, `/dashboard/university`, `/dashboard/industry` to prevent cross-role dashboard access | M3 | Survey 2 |
| F7 | Database Soft-Delete Integrity | Verify soft-deleted user unique constraints (phone/email) and Prisma client extension | M3 | Survey 2 |
| F8 | Database Migration Compatibility | PostgreSQL migration definitions and schema hardening | M3 | Survey 2 |
| F9 | External AI Categorization API | `/api/ai/categorize` using external SDK (Gemini/OpenAI) for domain classification, urgency, priority scoring, and SLA calculation | M2 | Survey 3 |
| F10 | Intelligent University Routing | Rule-based mapping connecting classified domain and district to empanelled Jharkhand universities (IIT ISM, BAU, BIT Mesra, NIT Jamshedpur, RIMS, XISS, CUJ) | M2 | Survey 3 |
| F11 | Semantic Deduplication | Challenge similarity detection against active database challenges | M2 | Survey 3 |
| F12 | Resilient AI Fallback Engine | Keyword/regex heuristic categorization engine for handling HTTP 429, timeouts, and offline scenarios | M2 | Survey 3 |
| F13 | AI Integration in Challenge Intake | Wire `/api/challenges` to invoke AI categorization & routing on submission, persisting AI metadata | M2 | Survey 3 |
| F14 | Collaborative Lifecycle & Proposal Hydration | Fix `proposal/[id]/page.tsx` draft rehydration defect with `useEffect`, verify 30-40-30 CSR escrow and Section 80G receipts | M3 | Survey 3 |
| F15 | Turbopack PWA Build Stabilization | Fix `_ssgManifest.js` ENOENT build conflict in `next.config.ts` to ensure 0-error build | M3 | Survey 3 |
| F16 | Programmatic Tests: Citizen Intake | Automated tests verifying citizen submission flow, multimedia handling, and location inputs | M4 / E2E Track | ORIGINAL_REQUEST § Acceptance Criteria |
| F17 | AI Integration Tests | Automated tests verifying external AI provider communication, classification accuracy, and fallback | M4 / E2E Track | ORIGINAL_REQUEST § Acceptance Criteria |
| F18 | RBAC & Security Tests | Automated tests verifying strict Gov, University, Industry role boundaries and 401/403 rejection | M4 / E2E Track | ORIGINAL_REQUEST § Acceptance Criteria |
| F19 | End-to-End Build Verification | Test suite and build execution verifying 0 errors and 0 warnings | M4 / E2E Track | ORIGINAL_REQUEST § Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Citizen Intake & Evidence Hardening | Permissions-Policy header, multipart file upload API, GPS capture, 24-district selector, 10 domains | none | PLANNED |
| M2 | External AI Problem Management & Routing | AI provider integration, `/api/ai/categorize`, university routing, deduplication, offline fallback, intake wiring | none | PLANNED |
| M3 | Collaborative Ecosystem & Security Hardening | Proposal draft rehydration, CSR escrow 30-40-30, Section 80G receipts, CSRF patches, frontend RBAC redirects, Turbopack PWA build fix | none | PLANNED |
| M4 | Final Milestone: 100% E2E Test Suite Pass | Run and pass 100% of E2E test suite (Tiers 1-4) and Tier 5 adversarial coverage hardening | M1, M2, M3, TEST_READY | PLANNED |
| E2E | Independent E2E Testing Track | Independent opaque-box test runner and test cases (Tiers 1-4) covering all 19 features | none | PLANNED |

## Interface Contracts
### Citizen Intake (`/submit`) ↔ Upload API (`/api/upload`)
- Method: `POST /api/upload`
- Request: `multipart/form-data` with `files` (images/videos/docs, max 10MB each)
- Response: `{ success: true, files: [{ name, url: "/uploads/...", type, size }] }`

### Challenge Intake (`/api/challenges`) ↔ AI Categorization (`/api/ai/categorize`)
- Method: `POST /api/ai/categorize`
- Request: `{ title: string, description: string, district?: string, location?: string }`
- Response: `{ domain: string, urgency: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", priorityScore: number, suggestedInstitute: string, reasoning: string, slaDays: number, isDuplicate: boolean, duplicateOfId?: string }`
- Fallback: Deterministic regex/keyword heuristics if external provider API fails or times out.

### Frontend Dashboards ↔ RBAC Session Guard
- Session check: `sih_session` cookie verified on route load
- Unauthorized role access to `/dashboard/<role>`: Redirects to `/dashboard/<user.role.toLowerCase()>` with query `?error=unauthorized`

## Code Layout
- `web/src/app/api/upload/route.ts`: Multipart evidence upload endpoint
- `web/src/app/api/ai/categorize/route.ts`: External AI categorization Route Handler
- `web/src/lib/ai.ts`: AI client integration (Gemini/OpenAI) + offline heuristic fallback
- `web/src/lib/routing.ts`: Academic institute mapping rules
- `web/src/app/submit/page.tsx`: Citizen submission wizard with dropzone & GPS
- `web/src/app/dashboard/university/proposal/[id]/page.tsx`: Proposal authoring console with hydrated draft
- `web/src/app/dashboard/[role]/page.tsx`: Role-guarded dashboard views
- `web/next.config.ts`: Security headers and PWA build configuration
- `web/tests/`: Automated unit, integration, and E2E test suites
