# PRAGATI Web Portal — Developer & Agent Context Guide

PRAGATI (Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation) is a Next.js 16 web application connecting citizens, district administrators, empanelled universities, and corporate industry mentors across Jharkhand's 24 districts.

## Quick Commands

### Development & Build
- `npm run dev`: Launch local development server at `http://localhost:3000`
- `npm run build`: Execute production Next.js compilation (validates all 56 routes and TypeScript types)
- `npm run start`: Run production build server
- `npm run lint`: Run ESLint checks

### Database & Prisma (SQLite / Dev)
- `npx prisma generate`: Regenerate Prisma Client types
- `npx prisma migrate dev`: Apply schema migrations to `prisma/dev.db`
- `npx prisma db seed`: Seed database with realistic sample challenges, users, proposals, and escrow funds
- `npx prisma studio`: Open GUI data browser

### Testing Suites
- `npx tsx tests/run-all-e2e.ts`: Run comprehensive E2E test suite across all modules
- `npx tsx tests/test_3track_triage.ts`: Verify Tri-Track Problem Ingestion (Track A, B, C)
- `npx tsx tests/test_nodal_triage_and_claim.ts`: Test District Nodal Officer triage & university 3-way claim race condition
- `npx tsx tests/test_handover_backend.ts`: Test Account Handover token generation and successor claim
- `npx tsx tests/auth-rbac-security.test.ts`: Verify tiered RBAC security across all 6 roles
- `npx tsx tests/adversarial-security-intake.test.ts`: Test OWASP input validation, CSRF, and boundary attacks

## Architecture Overview

- **Framework**: Next.js 16.3.4 App Router with React 19 and TypeScript 5
- **Styling**: Tailwind CSS v4 with Framer Motion animations
- **State Management**: Zustand 5.0 and React Context
- **Database & ORM**: SQLite (`prisma/dev.db`) managed via Prisma ORM 5.11.0 (with soft delete support)
- **Authentication**: Custom tiered authentication (`src/lib/auth.ts`, `src/lib/rbac.ts`) supporting:
  1. Citizen / Expert (Phone + SMS/WhatsApp OTP simulated)
  2. University (`.ac.in` domain + Email OTP)
  3. Industry (Corporate email + Admin approval workflow)
  4. Government Official (`.gov.in` / `.nic.in` + TOTP 2FA)
- **The 6 Dashboard Personas**:
  1. Citizen (`/dashboard`, `/submit`, `/track`, `/whatsapp-intake`)
  2. District Nodal Officer (`/dashboard/nodal`)
  3. Government Official (`/dashboard/gov`)
  4. University Researcher (`/dashboard/university`)
  5. Industry Mentor (`/dashboard/industry`)
  6. Open Contributor (`/dashboard/open-board`, `/dashboard/chat`)
- **Triage Engine**: Tri-Track Problem Ingestion (`src/lib/ai.ts`, `src/lib/routing.ts`):
  - Track A: Innovation & Applied R&D (Universities + CSR Escrow, 45-90d SLA)
  - Track B: Standard Public Works (State Line Departments, 14-30d SLA)
  - Track C: Civic Rapid Redressal (Urban Local Bodies, 24-72h SLA)
- **AI Categorization**: Google Gemini 1.5 Flash with fallback to OpenAI GPT-4o-mini and deterministic heuristic matching
- **Atomic Concurrency Control**: Database-enforced conditional `updateMany` operations preventing race conditions on academic research claims and corporate CSR escrow claims (HTTP 409 Conflict on collision)

## Directory Layout

```
web/
├── prisma/
│   ├── schema.prisma          # Data models (User, Challenge, Proposal, Funding, Handover, Chat)
│   └── seed.ts                # Realistic seeding for Jharkhand's 24 districts
├── public/                    # Static assets, uploads, and PWA manifest
├── src/
│   ├── app/                   # App Router (56 routes across 6 dashboard personas)
│   │   ├── api/               # 35 Next.js API Route Handlers
│   │   │   ├── admin/         # User approval and management
│   │   │   ├── ai/            # Categorization and 3-way matching
│   │   │   ├── auth/          # Login, register, OTP, TOTP, logout, me
│   │   │   ├── challenges/    # Challenge submission, claim, filter
│   │   │   ├── chat/          # University-Industry collaboration chat
│   │   │   ├── funds/         # CSR escrow commitments and MoUs
│   │   │   ├── handover/      # Account Handover token lifecycle
│   │   │   ├── micro-tasks/   # Open Contributor Board tasks
│   │   │   ├── mobile/        # Mobile ingestion and field verification
│   │   │   ├── nodal/         # District Nodal Officer triage
│   │   │   ├── proposals/     # University R&D proposals
│   │   │   └── track/         # Public 5-stage SLA tracking dossier
│   │   ├── dashboard/         # Role-specific dashboard portals
│   │   │   ├── gov/           # Statewide GIS telemetry & IP compliance
│   │   │   ├── industry/      # Mentor portal, Kanban board, TRL audit, Escrow ledger
│   │   │   ├── nodal/         # Nodal triage console and routing
│   │   │   ├── university/    # Research proposals and team dockets
│   │   │   ├── chat/          # Real-time collaboration chat hub
│   │   │   ├── open-board/    # Contributor micro-tasks
│   │   │   └── settings/      # Profile, security, and Account Handover portal
│   │   ├── apply/             # University challenge application
│   │   ├── challenge/         # Public challenge detail
│   │   ├── handover/          # Successor account claim UI
│   │   ├── login/             # Tiered authentication login
│   │   ├── submit/            # Citizen challenge intake wizard
│   │   ├── track/             # Citizen tracking search and timeline
│   │   └── whatsapp-intake/   # Omnichannel WhatsApp ingestion simulator
│   ├── components/            # Reusable UI components, modals, and RoleGuard
│   └── lib/                   # Core business logic (auth, rbac, ai, routing, prisma)
└── tests/                     # 32 automated test suites
```

## Environment Variables

Configure `.env` based on `.env.example`:
- `DATABASE_URL`: `"file:./dev.db"`
- `JWT_SECRET`: 32+ character cryptographic secret for session tokens
- `CSRF_SECRET`: 32+ character secret for double-submit cookie verification
- `GEMINI_API_KEY`: Optional Google AI provider API key for real LLM categorization
- `OPENAI_API_KEY`: Optional secondary fallback AI provider key
- `NODE_ENV`: `"development"` or `"production"`

## Security & Development Guidelines

- **OWASP Top 10 Compliance**: Never introduce raw SQL; use Prisma parameterized queries. Always validate request payloads with Zod schemas.
- **CSRF Protection**: All state-changing API routes (POST, PUT, DELETE) must validate CSRF tokens via `validateCsrfToken()` or double-submit cookies.
- **RBAC Enforcement**: Use `withAuth` route wrapper to enforce user authentication and role validation. Log all authorization failures to statutory audit logs.
- **Atomic Locking**: When handling contested resources (academic challenge claims, CSR funding claims, account handover claims), always use atomic database conditional updates to prevent race conditions.
- **Zero Dead Ends**: Ensure all interactive UI elements link to valid Next.js routes or open functional dialogs.
