# Project: Platform UI Audit & Route Implementation

## Architecture
- Next.js 16.3.4 (App Router, Turbopack) + React 19.2.8 + Tailwind CSS v4 + Framer Motion + Lucide React + Zustand.
- Design aesthetic: "government/critical" dark slate/indigo/emerald theme with high-contrast data visualizers, glassmorphism cards, clear status badges, and responsive layouts.
- Complete Entry Points & Routes (15 routes):
  - `○ /` (Homepage with Live Impact, Open Projects, Expert Ecosystem, and Guidelines link)
  - `○ /_not-found` (Custom 404 handler)
  - `ƒ /apply/[challengeId]` (Challenge application flow)
  - `ƒ /challenge/[id]` (Challenge detailed view with interactive photo/video lightboxes and share action)
  - `○ /dashboard` (Multi-tenant portal router and central command overview)
  - `○ /dashboard/gov` (Government portal with metric filters, domain bars, and CSV export)
  - `○ /dashboard/industry` (Industry portal with proposal filters and commitment routing)
  - `ƒ /dashboard/industry/fund/[id]` (Funding console with Escrow Terms MoU modal and CSR 80G tax receipt download)
  - `○ /dashboard/settings` (Enterprise 5-tab settings console: Profile, Notifications, 2FA, API Keys, Compliance)
  - `○ /dashboard/university` (University portal with live challenge search and proposal submission links)
  - `ƒ /dashboard/university/proposal/[id]` (Proposal drafting console with local draft save and document upload)
  - `○ /guidelines` (Statutory guidelines: 4 policy pillars, interactive FAQ accordion, official PDF download)
  - `○ /login` (Authentication portal with 5 pre-filled persona cards including Independent Expert)
  - `○ /submit` (Citizen problem submission wizard with interactive dropzone, file chips, and tracking ID generation)
  - `○ /track` (Citizen issue tracker with 5-stage timeline, telemetry cards, and SMS subscription)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | UI Audit & Discovery | Audit all buttons, links, cards, find `#` & dead ends across all pages | none | DONE |
| 2 | Navigation & Missing Routes | Implement missing routes (/guidelines, /dashboard, /dashboard/settings, /track) & eliminate href="#" | M1 | DONE |
| 3 | Detailed Views & Modals | Wire all unhandled buttons, search inputs, dropzones, draft saves, and action modals | M2 | DONE |
| 4 | Verification & Acceptance | Grep 0 `href="#"`, pass `npm run build`, full audit, review, and challenge | M3 | DONE |

## Acceptance Criteria Status
- [x] Running a search for `href="#"` across the codebase yields 0 results.
- [x] Every implemented endpoint adheres to the existing Tailwind CSS design system and color palette without introducing unstyled HTML.
- [x] The app successfully builds via `npm run build` with no unresolved routing errors (Exit code 0, 15 routes compiled).
- [x] Reviewer 1 & 2 Verdicts: PASS (APPROVE).
- [x] Challenger 1 & 2 Verdicts: CONFIRMED.
- [x] Forensic Auditor Verdict: CLEAN.
