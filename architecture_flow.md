# System Architecture & Cross-Platform Data Flow Specification
## Jharkhand Societal Innovation Collaboration Portal ("PRAGATI")
**Document Version**: 9.0.0 (Master Production Architecture Baseline)  
**System Architecture Authority**: Teamwork Preview Core Architecture Group  
**Target Deployment**: Web (Next.js 16.3.4 App Router) & Mobile (Kotlin Multiplatform / Compose — Jan-Aawaz / PRAGATI Lens)  
**Persistence Layer**: SQLite (`web/prisma/dev.db` via Prisma ORM 5.11.0) with Transparent Soft-Deletes & Immutable Audit Ledger  
**Triage System**: Tri-Track Problem Ingestion Engine (Track A: Innovation, Track B: Standard, Track C: Civic)  
**Historical Scope**: Comprehensive Master Architectural Baseline integrating Rounds 1 through 9  

---

## 1. Executive Summary & Core Architectural Principles

The **Jharkhand Societal Innovation Collaboration Portal** (branded **PRAGATI** — *Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation*) is an integrated digital governance, research incubation, and rapid civic redressal ecosystem. It unifies grassroots citizens, frontline District Nodal Officers, empanelled academic institutions, corporate CSR mentors, and state government leadership across Jharkhand's 24 administrative districts.

### 1.1 The Tri-Track Triage Problem Space
Historically, municipal and rural problem collection systems suffered from systemic misallocation:
1. **Academic R&D Misallocation**: Complex scientific bottlenecks (e.g., acid mine drainage leaching, heavy metal fluoride/arsenic aquifer poisoning, indigenous lac resin synthesis) were treated as routine contractor repairs and languished unresolved for years.
2. **Civic Over-Engineering**: Acute localized maintenance grievances (e.g., choked open stormwater drains, burnt streetlights, localized potholes) were elevated into bureaucratic government secretariats or academic institutions where they stalled without rapid physical action.
3. **Departmental Siloing & Funding Fragmentation**: Standard engineering infrastructure breakdowns (e.g., blown 100 kVA feeder transformers, collapsed arterial culverts) lacked coordinated tracking between line departments, and academic researchers lacked corporate CSR funding channels governed under statutory escrow.

To resolve these governance bottlenecks, PRAGATI implements an authoritative **Tri-Track Problem Triage System**:
- **Track A (`TRACK_A_INNOVATION`)**: High-novelty, applied R&D problems routed to empanelled research universities (IIT ISM Dhanbad, BIT Mesra, BAU Ranchi, NIT Jamshedpur) funded via Section 135 Corporate Social Responsibility (CSR) 30-40-30 escrow accounts with a 45–90 day SLA.
- **Track B (`TRACK_B_STANDARD`)**: Standard public works and engineering infrastructure failures routed to State Government Line Departments (JUVNL, DWSD, RCD, WRD) with statutory e-tenders, work orders, and a 14–30 day SLA.
- **Track C (`TRACK_C_CIVIC`)**: Immediate municipal maintenance and sanitation hazards routed to Urban Local Bodies (RMC, DMC, JNAC) and Gram Panchayats with Rapid Response Teams and a 24–72 hour SLA.

### 1.2 Core Architectural Principles
- **Defense in Depth**: Every API route enforces session validity, cryptographic double-submit CSRF validation, parameter sanitization via Zod schemas, and granular Role-Based Access Control (RBAC).
- **Dual-Engine AI Resiliency**: Problem classification executes against external LLMs (Google Gemini 1.5 Flash / OpenAI GPT-4o-mini) protected by a 5000ms circuit breaker, falling back deterministically to an offline rule-based heuristic classifier.
- **Cross-Platform Contract Parity**: Data contracts between Next.js API Route Handlers and Kotlin Multiplatform (KMP) Mobile Clients use strict, backward-compatible JSON serialization schemas.
- **Atomic Database Concurrency Guarantees**: High-contention operations (academic challenge claiming, corporate CSR funding claims, account handover token redemption) employ atomic database test-and-set queries (`updateMany` with concurrency guards) preventing race conditions.
- **Immutable Public Accountability**: Every lifecycle mutation generates a cryptographically traceable audit record in the `AuditLog` ledger, powering the public Grievance Redressal & Accountability Index (GRAI).
- **In-Place Account Continuity**: When administrative officials or researchers transition out of their roles, the Account Handover Portal transfers user credentials in-place, preserving user UUIDs, history, and relational data integrity across 10 dependent tables.

---

## 2. End-to-End System Topology & Platform Architecture

The platform operates across two client runtimes, a centralized serverless Next.js 16 API gateway, a resilient AI classification engine, and a hardened persistence tier:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      CLIENT CONSUMPTION TIERS                                      │
│                                                                                                    │
│   ┌───────────────────────────────────────┐       ┌────────────────────────────────────────────┐   │
│   │         NEXT.JS 16 WEB PORTAL         │       │     JAN-AAWAZ / PRAGATI LENS MOBILE APP    │   │
│   │   (React 19 / Turbopack / Tailwind)   │       │       (Compose Multiplatform / Voyager)    │   │
│   │  - Public Landing & Track Tracker     │       │  - Android Native Host (SDK 34)            │   │
│   │  - Citizen Intake Form (/submit)      │       │  - Desktop JVM Preview Host                │   │
│   │  - Omnichannel WhatsApp Simulator     │       │  - Koin DI & Ktor HTTP Engine              │   │
│   │  - 6 Role-Based Dashboard Portals     │       │  - District Nodal Field Verification       │   │
│   │  - Handover Successor Portal          │       │  - Simulated GPS & Evidence Injection      │   │
│   └───────────────────┬───────────────────┘       └─────────────────────┬──────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────────────┼──────────────────────────┘
                        │ HTTPS (Fetch + CSRF Token)                      │ HTTPS (Ktor HTTP / JSON)  
                        ▼                                                 ▼                           
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS 16 API ROUTE HANDLERS (/api/*)                               │
│                                                                                                    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │     AUTHENTICATION & RBAC TIER      │  │               PROBLEM INGESTION SUITE               │  │
│  │  - /api/auth/login (Rate Limited)   │  │  - /api/challenges (POST: Intake, GET: Filter)      │  │
│  │  - /api/auth/register (Multi-Tier)  │  │  - /api/intake/whatsapp-simulate (Omnichannel)      │  │
│  │  - /api/auth/totp-setup & verify    │  │  - /api/mobile/challenges (Mobile Ingestion)        │  │
│  │  - /api/auth/me & verify-otp        │  │  - /api/mobile/verify (District Nodal Verification) │  │
│  │  - withAuth() Route Middleware      │  │  - /api/challenges/[id]/apply (Expert Collab)       │  │
│  └─────────────────────────────────────┘  └─────────────────────────────────────────────────────┘  │
│                                                                                                    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │     NODAL & ACADEMIC R&D TIER       │  │             INDUSTRY CSR & ESCROW TIER              │  │
│  │  - /api/nodal/triage (Review Gate)  │  │  - /api/proposals/[id]/claim-industry (Atomic Lock) │  │
│  │  - /api/challenges/[id]/claim (Lock)│  │  - /api/funds (30-40-30 Escrow Ledger & MoU)        │  │
│  │  - /api/proposals (DPR Submission)  │  │  - /api/funds/[id] (Tranche Verification)           │  │
│  └─────────────────────────────────────┘  └─────────────────────────────────────────────────────┘  │
│                                                                                                    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │    COLLABORATION & HANDOVER TIER    │  │               TRANSPARENCY & TELEMETRY              │  │
│  │  - /api/chat (Real-Time Polling Hub)│  │  - /api/track/[id] (Public Resolution Timeline)     │  │
│  │  - /api/micro-tasks (Open Board)    │  │  - /api/analytics (24-District Telemetry & GIS)     │  │
│  │  - /api/handover/initiate & cancel  │  │  - /api/audit-logs (Security & Audit Trail)         │  │
│  │  - /api/handover/[token]/claim      │  │  - /api/admin/approve-user (Corporate Clearances)   │  │
│  └─────────────────────────────────────┘  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────────────┬──────────────────────────┘
                        │ Internal Dispatch                               │ Prisma Client 5.11.0      
                        ▼                                                 ▼                           
┌────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────┐
│            AI MULTI-TRACK TRIAGE ENGINE            │  │          PERSISTENCE & DATA STORAGE        │
│                                                    │  │                                            │
│  ┌──────────────────────────────────────────────┐  │  │  ┌──────────────────────────────────────┐  │
│  │  Google Gemini 1.5 Flash (Circuit Breaker)   │  │  │  │  SQLite Database (web/prisma/dev.db) │  │
│  ├──────────────────────────────────────────────┤  │  │  │  - Challenges (Track A/B/C Indexed)  │  │
│  │  OpenAI GPT-4o-mini (Secondary Fallback)     │  │  │  │  - Users (6 Personas, Passwords, 2FA)│  │
│  ├──────────────────────────────────────────────┤  │  │  │  - Proposals (DPR Work Packages)     │  │
│  │  Deterministic Heuristic 3-Track Engine      │  │  │  │  - FundingCommitments (CSR Escrow)   │  │
│  ├──────────────────────────────────────────────┤  │  │  │  - HandoverTokens (48h Crypto Tokens)│  │
│  │  Jaccard Semantic Deduplication (Thr: 0.75)  │  │  │  │  - ChatMessages & MicroTasks         │  │
│  ├──────────────────────────────────────────────┤  │  │  │  - AuditLogs (Immutable Audit Trail) │  │
│  │  3-Way University & Industry Matcher Engine  │  │  │  └──────────────────────────────────────┘  │
│  └──────────────────────────────────────────────┘  │  │  Local Media Storage: public/uploads/      │
└────────────────────────────────────────────────────┘  └────────────────────────────────────────────┘
```

---

## 3. Multi-Channel Problem Ingestion & Data Flow Diagrams

The platform ingests societal challenges through three distinct channels:

### 3.1 Channel 1: Web Citizen Submission Flow
Citizens submit problems via the web wizard (`/submit`), capturing browser GPS coordinates, attaching sensor telemetry (water pH, soil testing parameters), and uploading media evidence.

```
 Citizen Browser               Next.js Route Handler            AI Triage Service             Prisma / SQLite
  (/submit UI)               (POST /api/challenges)             (src/lib/ai.ts)              (prisma/dev.db)
        │                               │                              │                             │
        │ 1. Geolocation & Media Upload │                              │                             │
        │──────────────────────────────>│                              │                             │
        │    POST /api/upload           │                              │                             │
        │<──────────────────────────────│                              │                             │
        │    { fileUrl: "/uploads/..." }│                              │                             │
        │                               │                              │                             │
        │ 2. Submit Challenge Payload   │                              │                             │
        │    (with x-csrf-token)        │                              │                             │
        │──────────────────────────────>│                              │                             │
        │                               │ 3. Zod Schema Validation     │                             │
        │                               │    (createChallengeSchema)   │                             │
        │                               │───────────────────────────┐  │                             │
        │                               │                           │  │                             │
        │                               │<──────────────────────────┘  │                             │
        │                               │                              │                             │
        │                               │ 4. Dispatch for Triage       │                             │
        │                               │─────────────────────────────>│                             │
        │                               │                              │ 5. Gemini / OpenAI LLM      │
        │                               │                              │    (5000ms Timeout)         │
        │                               │                              │    [Fallback to Heuristic]  │
        │                               │                              │───────────────────────────┐ │
        │                               │                              │                           │ │
        │                               │                              │<──────────────────────────┘ │
        │                               │                              │                             │
        │                               │                              │ 6. Semantic Deduplication   │
        │                               │                              │    (Similarity >= 0.75)     │
        │                               │                              │───────────────────────────┐ │
        │                               │                              │                           │ │
        │                               │                              │<──────────────────────────┘ │
        │                               │                              │                             │
        │                               │ 7. Return Track & Routing    │                             │
        │                               │<─────────────────────────────│                             │
        │                               │    { track: TRACK_A, ... }   │                             │
        │                               │                              │                             │
        │                               │ 8. Execute Database Transaction                            │
        │                               │───────────────────────────────────────────────────────────>│
        │                               │    - Insert Challenge with SLA deadline                    │
        │                               │    - Insert CHALLENGE_CREATED AuditLog                     │
        │                               │<───────────────────────────────────────────────────────────│
        │                               │    Challenge Record Created (IN-GR-2026-XXXX)              │
        │                               │                                                            │
        │ 9. HTTP 201 Created           │                                                            │
        │<──────────────────────────────│                                                            │
        │    { success: true,           │                                                            │
        │      publicTrackingId: "..." }│                                                            │
```

### 3.2 Channel 2: Omnichannel WhatsApp Intake Flow
Designed for rural citizens without high-speed internet. Citizens interact with a guided chatbot over WhatsApp.

```
 Citizen WhatsApp           Mock WhatsApp Webhook            AI 3-Track Engine             Prisma / Database
      Client              (/api/intake/whatsapp-simulate)      (src/lib/ai.ts)               (dev.db SQLite)
        │                               │                              │                             │
        │ 1. WhatsApp Inbound Message   │                              │                             │
        │    (Text, Photo, GPS pin)     │                              │                             │
        │──────────────────────────────>│                              │                             │
        │                               │ 2. Normalize Message Body    │                             │
        │                               │    & Auto-Provision User     │                             │
        │                               │───────────────────────────┐  │                             │
        │                               │                           │  │                             │
        │                               │<──────────────────────────┘  │                             │
        │                               │                              │                             │
        │                               │ 3. Call 3-Track Classifier   │                             │
        │                               │─────────────────────────────>│                             │
        │                               │                              │ 4. Track Evaluation:        │
        │                               │                              │    Track C (Sanitation/ULB) │
        │                               │                              │    Track B (Utility/Dept)   │
        │                               │                              │    Track A (Research/Univ)  │
        │                               │<─────────────────────────────│                             │
        │                               │ 5. Persist Challenge & Track                               │
        │                               │───────────────────────────────────────────────────────────>│
        │                               │    - Set status = REPORTED / ASSIGNED_CIVIC                │
        │                               │    - Calculate SLA (24h - 72h for Track C)                 │
        │                               │<───────────────────────────────────────────────────────────│
        │                               │                                                            │
        │ 6. WhatsApp Outbound Reply    │                                                            │
        │<──────────────────────────────│                                                            │
        │    "Grievance IN-GR-2026-9842 │                                                            │
        │     Logged. Track: CIVIC.     │                                                            │
        │     Assigned to: RMC Ward 26. │                                                            │
        │     SLA Resolution: 48 Hours" │                                                            │
```

### 3.3 Channel 3: Mobile Field Intake & District Nodal Ground Verification
Enables rural field workers to submit problems on-site and District Nodal Officers (DNO) to physically verify issues on the ground using the mobile client.

```
 Rural Citizen / Field Worker       District Nodal Officer            Backend Route Handler              Prisma Database
      (Kotlin Mobile App)             (Kotlin Mobile App)             (POST /api/mobile/*)               (dev.db SQLite)
               │                               │                                │                               │
               │ 1. Submit Local Issue         │                                │                               │
               │    POST /api/mobile/challenges│                                │                               │
               │───────────────────────────────────────────────────────────────>│                               │
               │                               │                                │ 2. Create Unverified Challenge│
               │                               │                                │──────────────────────────────>│
               │                               │                                │    citizenVerified = false    │
               │                               │                                │<──────────────────────────────│
               │<───────────────────────────────────────────────────────────────│                               │
               │    { trackingId: "IN-GR-2026-4412", status: "REPORTED" }       │                               │
               │                               │                                │                               │
               │                               │ 3. On-Site Physical Inspection │                               │
               │                               │    & Identity Confirmation     │                               │
               │                               │─────────────────────────────┐  │                               │
               │                               │                             │  │                               │
               │                               │<────────────────────────────┘  │                               │
               │                               │                                │                               │
               │                               │ 4. Official Verification Call  │                               │
               │                               │    POST /api/mobile/verify     │                               │
               │                               │    { challengeId,              │                               │
               │                               │      nodalOfficerId }          │                               │
               │                               │───────────────────────────────>│                               │
               │                               │                                │ 5. RBAC Auth Check:           │
               │                               │                                │    Verify Officer has GOV role│
               │                               │                                │ 6. Run AI Triage & Dedup      │
               │                               │                                │ 7. Update Challenge:          │
               │                               │                                │──────────────────────────────>│
               │                               │                                │    citizenVerified = true     │
               │                               │                                │    status = UNDER_REVIEW      │
               │                               │                                │    track = TRACK_A/B/C        │
               │                               │                                │    trackRouting = Target Org  │
               │                               │                                │<──────────────────────────────│
               │                               │<───────────────────────────────│                               │
               │                               │    { success: true,            │                               │
               │                               │      verified: true,           │                               │
               │                               │      track: "TRACK_B_STANDARD" }                               │
```

---

## 4. The 3-Track Problem Triage System Architecture

The platform partitions incoming problems into three operational tracks based on technical complexity, statutory responsibility, and resolution velocity:

```
                                    ┌───────────────────────────────────┐
                                    │     INCOMING PROBLEM STATEMENT    │
                                    │  (Title, Description, Telemetry)  │
                                    └─────────────────┬─────────────────┘
                                                      │
                                                      ▼
                                    ┌───────────────────────────────────┐
                                    │      MULTI-TRACK AI TRIAGE        │
                                    │     (Gemini / OpenAI / Rules)     │
                                    └─────────────────┬─────────────────┘
                                                      │
                 ┌────────────────────────────────────┼────────────────────────────────────┐
                 │                                    │                                    │
                 ▼                                    ▼                                    ▼
  ┌──────────────────────────────┐     ┌──────────────────────────────┐     ┌──────────────────────────────┐
  │           TRACK A            │     │           TRACK B            │     │           TRACK C            │
  │          INNOVATION          │     │           STANDARD           │     │            CIVIC             │
  ├──────────────────────────────┤     ├──────────────────────────────┤     ├──────────────────────────────┤
  │ - Novel scientific challenge │     │ - Known engineering problem  │     │ - Immediate public grievance │
  │ - Applied R&D required       │     │ - Standard civil/electrical  │     │ - Local maintenance hazard   │
  │ - Deep-tech / patentable IP  │     │ - Line Department scope      │     │ - Municipal / Panchayat crew │
  │ - Empanelled Universities    │     │ - Standard Tender / DPR      │     │ - Direct physical dispatch   │
  │ - CSR Escrow Co-Funding      │     │ - State Budget / DMFT Fund   │     │ - Ward Discretionary Fund    │
  │ - SLA: 45 to 90 Days         │     │ - SLA: 14 to 30 Days         │     │ - SLA: 24 to 72 Hours        │
  └──────────────┬───────────────┘     └──────────────┬───────────────┘     └──────────────┬───────────────┘
                 │                                    │                                    │
                 ▼                                    ▼                                    ▼
  ┌──────────────────────────────┐     ┌──────────────────────────────┐     ┌──────────────────────────────┐
  │     ACADEMIC DIRECTORY       │     │   LINE DEPARTMENT DIRECTORY  │     │   CIVIC & ULB DIRECTORY      │
  │  - IIT (ISM) Dhanbad         │     │  - JUVNL (Electricity Board) │     │  - Ranchi Municipal Corp     │
  │  - Birsa Agricultural Univ   │     │  - DWSD (Drinking Water)     │     │  - Dhanbad Municipal Corp    │
  │  - RIMS Ranchi / BIT Mesra   │     │  - RCD / RDD (Roads/Bridges) │     │  - JNAC Jamshedpur           │
  │  - NIT Jamshedpur            │     │  - Minor Irrigation Dept     │     │  - Chas / Deoghar MC         │
  │  - Central Univ Jharkhand    │     │  - Dept of Health & Family   │     │  - Block Dev Officers (BDO)  │
  └──────────────────────────────┘     └──────────────────────────────┘     └──────────────────────────────┘
```

---

## 5. District Nodal Officer Triage & University 3-Way Claim Race

### 5.1 Nodal Officer Decision Gate (`/dashboard/nodal` and `/api/nodal/triage`)
Operating at the district level, the District Nodal Officer executes statutory triage over unassigned grievances:

```
 DISTRICT NODAL OFFICER             NEXT.JS NODAL API               AI MATCH SERVICE              PRISMA / SQLITE
   (/dashboard/nodal)             (/api/nodal/triage)               (src/lib/ai.ts)               (dev.db SQLite)
           │                                │                              │                             │
           │ 1. Load Pending Triage Queue   │                              │                             │
           │───────────────────────────────>│                              │                             │
           │                                │ 2. Fetch Pending Challenges  │                             │
           │                                │───────────────────────────────────────────────────────────>│
           │                                │<───────────────────────────────────────────────────────────│
           │<───────────────────────────────│                                                            │
           │    Render Triage Dashboard     │                                                            │
           │                                │                                                            │
           │ 2. DNO Action Selection:       │                                                            │
           │    [A] REJECT (with Reason)    │                                                            │
           │    [B] DIVERT TO GOV DEPT      │                                                            │
           │    [C] ROUTE TO ACADEMIA       │                                                            │
           │───────────────────────────────>│                                                            │
           │                                │                                                            │
           │ [IF ACTION == REJECT]:         │                                                            │
           │                                │ Validate Reason (len >= 5)   │                             │
           │                                │ Update Challenge (status: CLOSED, nodalStatus: rejected)   │
           │                                │───────────────────────────────────────────────────────────>│
           │                                │                                                            │
           │ [IF ACTION == DIVERT_TO_GOV]:  │                                                            │
           │                                │ Set line dept (e.g. DWSD, JUVNL, PWD)                      │
           │                                │ Update Challenge (status: UNDER_REVIEW, diverted_to_gov)   │
           │                                │───────────────────────────────────────────────────────────>│
           │                                │                                                            │
           │ [IF ACTION == ROUTE_TO_ACADEMIA]:                                                           │
           │                                │ Call AI 3-Way Match          │                             │
           │                                │─────────────────────────────>│                             │
           │                                │                              │ Compute Top 3 Institutes    │
           │                                │<─────────────────────────────│ [IIT ISM, BIT, BAU]         │
           │                                │ Persist matchedUniversities  │                             │
           │                                │ Set nodalStatus = routed_to_academia                       │
           │                                │ Set status = OPEN_FOR_PROPOSALS                            │
           │                                │───────────────────────────────────────────────────────────>│
           │                                │ Log MOCK EMAIL DISPATCH to Candidate PIs                   │
           │<───────────────────────────────│                                                            │
           │    Triage Decision Committed   │                                                            │
```

### 5.2 Atomic Academic Race-Condition Claim Engine
When a Track A challenge enters `routed_to_academia`, the 3 matched universities race to claim it. Concurrency safety is enforced at the database level:

```
 UNIVERSITY A (BIT Mesra)         UNIVERSITY B (IIT ISM)          CLAIM API ENDPOINT               PRISMA DATABASE
   (/dashboard/university)        (/dashboard/university)      (/api/challenges/[id]/claim)        (dev.db SQLite)
           │                                │                              │                             │
           │ 1. Click "Claim Challenge"     │                              │                             │
           │──────────────────────────────────────────────────────────────>│                             │
           │                                │                              │ 2. Atomic Test-and-Set:     │
           │                                │                              │    updateMany(where: {      │
           │                                │                              │      id, claimedAt: null,   │
           │                                │                              │      nodalStatus: "..." })  │
           │                                │                              │────────────────────────────>│
           │                                │                              │<────────────────────────────│
           │                                │                              │    count == 1 (LOCK ACQUIRED)
           │                                │                              │                             │
           │                                │ 3. Click "Claim Challenge"   │                             │
           │                                │─────────────────────────────>│                             │
           │                                │                              │ 4. Atomic Test-and-Set:     │
           │                                │                              │    updateMany(where: {      │
           │                                │                              │      id, claimedAt: null }) │
           │                                │                              │────────────────────────────>│
           │                                │                              │<────────────────────────────│
           │                                │                              │    count == 0 (LOCK FAILED) │
           │                                │                              │                             │
           │ 5. HTTP 200 OK (Lock Won)      │                              │                             │
           │<──────────────────────────────────────────────────────────────│                             │
           │    RFP Locked to BIT Mesra     │                              │                             │
           │                                │ 6. HTTP 409 Conflict (Lost)  │                             │
           │                                │<─────────────────────────────│                             │
           │                                │    "Challenge already claimed│                             │
           │                                │     by another institution"  │                             │
```

---

## 6. University DPR Authoring, Industry Matching & Escrow Architecture

```
 CLAIMING UNIVERSITY PI            NEXT.JS PROPOSALS API           AI INDUSTRY MATCHER             STATE ESCROW NODE
(/dashboard/university/proposal)     (/api/proposals)            (src/lib/ai-matching.ts)             (/api/funds)
           │                                │                              │                             │
           │ 1. Submit DPR: Abstract,       │                              │                             │
           │    Methodology, Budget, PDF    │                              │                             │
           │───────────────────────────────>│                              │                             │
           │                                │ 2. Persist Proposal in DB    │                             │
           │                                │ 3. Trigger Industry Match    │                             │
           │                                │─────────────────────────────>│                             │
           │                                │                              │ Match Corporate CSR Domains │
           │                                │                              │ [Tata Steel, Coal India]    │
           │                                │<─────────────────────────────│                             │
           │                                │ 4. Log Mock CSR Notification │                             │
           │<───────────────────────────────│                                                            │
           │    DPR Published for Funding   │                                                            │
           │                                │                                                            │
           │                                │ 5. Corporate Partner Claims & Pledges Escrow               │
           │                                │<───────────────────────────────────────────────────────────│
           │                                │    POST /api/funds (Amount: ₹15,00,000)                    │
           │                                │    Tranche 1 (30%): ₹4,50,000  (DPR Baseline Approval)     │
           │                                │    Tranche 2 (40%): ₹6,00,000  (Lab Prototype Validation)  │
           │                                │    Tranche 3 (30%): ₹4,50,000  (Field Commissioning)       │
           │                                │───────────────────────────────────────────────────────────>│
           │                                │    State Escrow Reference: JH-ESCROW-2026-CSR-8812         │
```

---

## 7. Industry Mentor Portal, TRL Stage-Gate Tracking & Kanban Architecture

Operating on `/dashboard/industry`, the Industry Mentor Portal provides end-to-end technical and financial stewardship over funded projects:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INDUSTRY MENTOR STEWARDSHIP PORTAL                                 │
├───────────────────────────────┬───────────────────────────────────┬────────────────────────────────┤
│       HOME KPI CONSOLE        │        KANBAN TASK BOARD          │     TRL 1-9 AUDIT LEDGER       │
│  - Total CSR Capital Deployed │  - Column 1: Backlog              │  - TRL 1: Principles Observed  │
│  - Active Lab Dockets: 14     │  - Column 2: In Progress          │  - TRL 4: Lab Validation       │
│  - Pending Tranches: ₹1.2 Cr  │  - Column 3: Review / Gate Audit  │  - TRL 7: Field Demonstration  │
│  - Stage Velocity: 1.4 mo/TRL │  - Column 4: Field Commissioned   │  - TRL 9: Operational Transfer │
├───────────────────────────────┴───────────────────────────────────┴────────────────────────────────┤
│                            INTERACTIVE MILESTONE REVIEW MODAL                                      │
│  ┌──────────────────────────────────────────────┐ ┌──────────────────────────────────────────────┐ │
│  │ DUAL DECISION GATES                          │ │ 3-AXIS RUBRIC SCORING                        │ │
│  │ [Gate 1: Technical Feasibility Clearance]    │ │ • Technical Rigor:      [ 9 / 10 ]           │ │
│  │ [Gate 2: Commercial Viability Authorization] │ │ • Field Durability:     [ 8 / 10 ]           │ │
│  │ Action: Authorize ₹6,00,000 Tranche 2        │ │ • Cost Efficiency:      [ 9 / 10 ]           │ │
│  └──────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ BILATERAL IP ROYALTY SPLIT SLIDERS                                                           │  │
│  │ University Retained IP: [ 88% ] ◄═══════════════════○═════════════════► Corporate: [ 12% ]  │  │
│  │ Range Enforced: 5% to 15% Corporate Royalty │ Status: Bilateral DSC Digitally Locked         │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Statewide Government GIS Telemetry & Compliance Architecture

The executive government console (`/dashboard/gov`) provides comprehensive oversight across Jharkhand's 24 districts:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                STATEWIDE GOVERNMENT GIS CONSOLE                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  NAVBAR: [ Overview ]  [ Projects Ledger ]  [ 24-District GIS Map ]  [ IP Queue ]  [ Reports ]     │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  INTERACTIVE 24-DISTRICT SVG VECTOR MAP                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  DIVISION FILTERS: [ North Chotanagpur ] [ South Chotanagpur ] [ Santhal Pargana ]           │  │
│  │                    [ Kolhan ] [ Palamu ] [ All 24 Districts ]                                │  │
│  │                                                                                              │  │
│  │   [Palamu Div]        [North Chotanagpur]               [Santhal Pargana]                    │  │
│  │    • Garhwa            • Chatra    • Hazaribagh          • Deoghar   • Dumka                 │  │
│  │    • Palamu            • Koderma   • Giridih             • Godda     • Jamtara               │  │
│  │    • Latehar           • Ramgarh   • Bokaro  • Dhanbad   • Pakur     • Sahibganj             │  │
│  │                                                                                              │  │
│  │   [South Chotanagpur]                    [Kolhan Division]                                   │  │
│  │    • Ranchi (Capital Hub)                 • East Singhbhum (Jamshedpur)                      │  │
│  │    • Lohardaga • Gumla                    • West Singhbhum (Chaibasa)                        │  │
│  │    • Simdega   • Khunti                   • Seraikela Kharsawan                              │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  HOVER TOOLTIP: "Dhanbad District: 42 Active Challenges | ₹1.85 Cr CSR Allocated | SLA: 94.2%"     │
│  SEED GRANT MODAL: Allocate ₹25 Lakhs State Innovation Seed Fund directly to Selected Pin          │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  INTELLECTUAL PROPERTY (IP) COMPLIANCE QUEUE (`GovIpQueue`)                                        │
│  • Tracks Tripartite Filings (University + Industry Mentor + Govt of Jharkhand)                   │
│  • Bilateral Digital Signature Certificate (DSC) Verification                                     │
│  • Official Digital Patent Certificate Generation & Registry Vault                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Collaboration Hub & Open Contributor Board

### 9.1 Interdisciplinary Chat Hub (`/dashboard/chat`)
- Operates via lightweight 3-second polling over `GET /api/chat?proposalId=...` and `POST /api/chat`.
- Enforces strict RBAC: only authorized project team members (submitting university faculty, funding industry mentor, assigned government nodal officer) can read or post messages.
- Threaded conversation history with role badges and timestamped delivery receipts.

### 9.2 Open Contributor Micro-Task Board (`/dashboard/open-board`)
- University research teams break down complex problem packages into accessible micro-tasks (`/api/micro-tasks`).
- Tasks display required skill badges (*CAD Modeling*, *React Native*, *Embedded C*, *Water Chemistry Testing*, *Santhali Translation*).
- Students, independent developers, and civic contributors claim open tasks (`PATCH /api/micro-tasks`).
- Completed deliverables are reviewed by faculty PIs to award verified academic micro-credits.

---

## 10. Account Handover Portal Architecture

The Account Handover Portal (`/dashboard/settings` and `/handover/[token]`) facilitates institutional succession without breaking relational database integrity.

```
 INCUMBENT PREDECESSOR               NEXT.JS HANDOVER API            PRISMA / SQLITE DATABASE           DESIGNATED SUCCESSOR
  (/dashboard/settings)             (/api/handover/*)                    (dev.db)                       (/handover/[token])
           │                                │                                │                                    │
           │ 1. Initiate Transfer           │                                │                                    │
           │    Enter successorEmail        │                                │                                    │
           │───────────────────────────────>│                                │                                    │
           │                                │ 2. Check per-user Mutex Lock   │                                    │
           │                                │ 3. Generate 64-char crypto tok │                                    │
           │                                │ 4. Set expiresAt = now() + 48h │                                    │
           │                                │ 5. Insert HandoverToken record │                                    │
           │                                │───────────────────────────────>│                                    │
           │                                │ 6. Log mock email to console   │                                    │
           │<───────────────────────────────│                                │                                    │
           │    Show Pending Handover Card  │                                │                                    │
           │                                │                                │                                    │
           │                                │ 7. Access /handover/[token]    │                                    │
           │                                │<────────────────────────────────────────────────────────────────────│
           │                                │ 8. Validate token & expiry     │                                    │
           │                                │───────────────────────────────>│                                    │
           │                                │<───────────────────────────────│                                    │
           │                                │ 9. Return predecessor profile  │                                    │
           │                                │────────────────────────────────────────────────────────────────────>│
           │                                │                                │    Display Predecessor Dossier     │
           │                                │                                │                                    │
           │                                │ 10. Submit Claim:              │                                    │
           │                                │     successorName, password    │                                    │
           │                                │<────────────────────────────────────────────────────────────────────│
           │                                │ 11. Atomic Test-and-Set:       │                                    │
           │                                │     updateMany where usedAt=nil│                                    │
           │                                │ 12. Hash Password (bcrypt 12)  │                                    │
           │                                │ 13. Overwrite User Credentials │                                    │
           │                                │     (Preserving User.id)       │                                    │
           │                                │ 14. Reset 2FA & Lockouts       │                                    │
           │                                │ 15. Invalidate Old Sessions    │                                    │
           │                                │ 16. Write HANDOVER_CLAIMED Log │                                    │
           │                                │───────────────────────────────>│                                    │
           │                                │ 17. Issue New Session Cookie   │                                    │
           │                                │────────────────────────────────────────────────────────────────────>│
           │                                │                                │    Redirect to Role Dashboard      │
```

---

## 11. Database Schema Relations & State Machine

```
┌─────────────────────────────────────────┐               ┌─────────────────────────────────────────┐
│                  USER                   │               │                CHALLENGE                │
├─────────────────────────────────────────┤               ├─────────────────────────────────────────┤
│ id: String (CUID) [PK]                  │◄────────┐     │ id: String (CUID) [PK]                  │
│ email: String [UQ]                      │         │     │ publicTrackingId: String [UQ]           │
│ phone: String                           │         │     │ title: String                           │
│ passwordHash: String                    │         │     │ description: String                     │
│ role: UserRole (GOV/UNIV/IND/CIT/EXPERT)│         │     │ domain: String                          │
│ status: UserStatus (ACTIVE/PENDING)     │         │     │ district: String                        │
│ organization: String?                   │         │     │ location: String                        │
│ designation: String?                    │         │     │ urgency: UrgencyLevel                   │
│ district: String?                       │         │     │ status: ChallengeStatus                 │
│ twoFactorEnabled: Boolean               │         │     │ track: TriageTrack                      │
│ twoFactorSecret: String?                │         │     │ trackRouting: String?                   │
│ failedLoginAttempts: Int                │         │     │ triageReasoning: String?                │
│ lockoutUntil: DateTime?                 │         │     │ nodalStatus: String?                    │
│ createdAt / updatedAt / deletedAt       │         │     │ nodalReason: String?                    │
└────────────────────┬────────────────────┘         │     │ claimedAt: DateTime?                    │
                     │                              │     │ claimedById: String?                    │
                     │ 1:N                          │     │ matchedUniversities: String?            │
                     ▼                              │     │ evidence: String? (JSON Telemetry)      │
┌─────────────────────────────────────────┐         │     │ citizenVerified: Boolean                │
│             HANDOVER_TOKEN              │         │     │ duplicateOfId: String? [Self-FK]        │
├─────────────────────────────────────────┤         │     │ slaDeadline: DateTime?                  │
│ id: String (CUID) [PK]                  │         │     │ reportedById: String [FK] ──────────────┘
│ token: String [UQ]                      │         │     │ createdAt / updatedAt / deletedAt       │
│ userId: String [FK] ────────────────────┘         │     └────────────────────┬────────────────────┘
│ successorEmail: String                            │                          │
│ expiresAt: DateTime                               │                          │ 1:N
│ usedAt: DateTime?                                 │                          ▼
│ createdAt: DateTime                               │     ┌─────────────────────────────────────────┐
└─────────────────────────────────────────┘         │     │                PROPOSAL                 │
                                                    │     ├─────────────────────────────────────────┤
                                                    │     │ id: String (CUID) [PK]                  │
                                                    │     │ challengeId: String [FK] ───────────────┘
                                                    │     │ submitterId: String [FK] ───────────────┐
                                                    │     │ university: String                      │
                                                    │     │ title: String                           │
                                                    │     │ abstract / methodology: String          │
                                                    │     │ budget: Float                           │
                                                    │     │ timelineMonths: Int                     │
                                                    │     │ stage: ProposalStage                    │
                                                    │     │ status: ProposalStatus                  │
                                                    │     │ industryClaimStatus: String             │
                                                    │     │ industryClaimedById: String?            │
                                                    │     │ createdAt / updatedAt                   │
                                                    │     └────────────────────┬────────────────────┘
                                                    │                          │
                                                    │                          │ 1:N
                                                    │                          ▼
                                                    │     ┌─────────────────────────────────────────┐
                                                    │     │           FUNDING_COMMITMENT            │
                                                    │     ├─────────────────────────────────────────┤
                                                    │     │ id: String (CUID) [PK]                  │
                                                    │     │ proposalId: String [FK] ────────────────┘
                                                    │     │ industryUserId: String [FK] ────────────┐
                                                    │     │ escrowRef: String [UQ]                  │
                                                    │     │ amount: Float                           │
                                                    │     │ tranche1Amount / tranche2 / 3           │
                                                    │     │ status: FundingStatus                   │
                                                    │     │ mouSigned: Boolean                      │
                                                    │     │ createdAt / updatedAt                   │
                                                    │     └─────────────────────────────────────────┘
                                                    │
                                                    │ 1:N (Audit Trail)
                                                    ▼
                                      ┌─────────────────────────────────────────┐
                                      │                AUDIT_LOG                │
                                      ├─────────────────────────────────────────┤
                                      │ id: String (CUID) [PK]                  │
                                      │ userId: String? [FK] ───────────────────┘
                                      │ action: String                          │
                                      │ resource: String                        │
                                      │ resourceId: String                      │
                                      │ challengeId: String?                    │
                                      │ details: String? (JSON Snapshot)        │
                                      │ ipAddress: String?                      │
                                      │ userAgent: String?                      │
                                      │ timestamp: DateTime                     │
                                      └─────────────────────────────────────────┘
```

---

## 12. Complete API Route Topology (All 35 Backend Endpoints)

The Next.js backend implements 35 dedicated API route handlers structured across 9 functional subsystems:

### 12.1 Authentication & Security (7 Endpoints)
1. `POST /api/auth/login`: Tiered authentication supporting Phone+OTP for Citizens and Email+Password for Universities, Industry, and Gov. Enforces 5-attempt lockout (30-min window).
2. `POST /api/auth/register`: Role-specific onboarding with `.ac.in` email verification for academia and corporate domain checks for industry.
3. `POST /api/auth/logout`: Revokes active session, clears `auth_token` cookie, and logs session termination.
4. `GET /api/auth/me`: Validates session token, returns rehydrated user profile with fresh RBAC permissions.
5. `POST /api/auth/verify-otp`: Consumes 6-digit SMS/email OTP; provisions citizen accounts automatically.
6. `POST /api/auth/totp-setup`: Generates Base32 TOTP secret and QR code URL for mandatory government 2FA.
7. `POST /api/auth/totp-verify`: Verifies 6-digit TOTP code, enables 2FA flag, resets lockout counter.

### 12.2 Account Handover Subsystem (4 Endpoints)
8. `POST /api/handover/initiate`: Generates secure 64-char token expiring in 48 hours for designated successor. Enforces per-user mutex and logs mock invite email.
9. `GET /api/handover/initiate`: Returns status of active pending handover invitations for the authenticated user.
10. `POST /api/handover/cancel`: Revokes pending handover tokens prior to redemption.
11. `POST /api/handover/[token]/claim` (and `GET /api/handover/[token]`): Successor claim handler validating token, collecting credentials, overwriting user record in-place, resetting 2FA, and rotating sessions.

### 12.3 Challenge Intake & Public Dossier (4 Endpoints)
12. `GET /api/challenges`: Filterable challenge query engine (domain, district, urgency, track, status, search).
13. `POST /api/challenges`: Public citizen intake endpoint with CSRF verification, AI triage, and evidence persistence.
14. `GET /api/challenges/[id]` (also `PUT`, `DELETE`): Retrieves full challenge dossier with telemetry; supports statutory edits and soft deletes.
15. `POST /api/challenges/[id]/apply`: Expert application endpoint allowing independent scientists to join challenge teams.

### 12.4 District Nodal Triage (1 Endpoint)
16. `GET /api/nodal/triage` & `POST /api/nodal/triage`: Authoritative review gate for District Nodal Officers to Reject (with mandatory reason), Divert to 10 line departments, or Route to Academia with 3-way AI matching.

### 12.5 Mobile Ingestion & Field Verification (2 Endpoints)
17. `POST /api/mobile/challenges`: Ingests title, description, district, and simulated GPS telemetry from Kotlin mobile client.
18. `POST /api/mobile/verify`: Field inspection endpoint for District Nodal Officers to verify issues on the ground and route into the Tri-Track engine.

### 12.6 University Proposals & Academic Claim (3 Endpoints)
19. `POST /api/challenges/[id]/claim`: Atomic race-condition claim engine for universities (`updateMany` with `claimedAt: null`).
20. `GET /api/proposals` & `POST /api/proposals`: Lists proposals; authors Detailed Project Reports (DPR) and triggers corporate CSR matching.
21. `GET /api/proposals/[id]` & `PUT /api/proposals/[id]`: Detailed proposal view and milestone updates.

### 12.7 Industry Corporate CSR & Escrow (2 Endpoints)
22. `POST /api/proposals/[id]/claim-industry`: Atomic industry sponsorship claim lock.
23. `GET /api/funds` & `POST /api/funds` (and `GET /api/funds/[id]`): Pledges CSR funds into State Escrow Node with 30-40-30 tranche milestones and digital MoU execution.

### 12.8 Collaboration & Micro-Tasks (2 Endpoints)
24. `GET /api/chat` & `POST /api/chat`: Interdisciplinary proposal chat with 3-second polling and RBAC participant gating.
25. `GET /api/micro-tasks`, `POST /api/micro-tasks`, `PATCH /api/micro-tasks`: Open Contributor Board task authoring and claiming engine.

### 12.9 Administration, Telemetry & AI Utilities (10 Endpoints)
26. `GET /api/admin/pending-users`: Lists pending corporate industry registrations awaiting government clearance.
27. `POST /api/admin/approve-user`: Government admin endpoint to approve or reject corporate registrations.
28. `GET /api/users/profile` & `PUT /api/users/profile`: User profile management with Zod validation.
29. `POST /api/ai/categorize`: Standalone AI triage and semantic deduplication engine.
30. `GET /api/analytics`: Statewide aggregate metrics covering 24 Jharkhand districts.
31. `GET /api/track/[id]`: Public tracking dossier with sensor telemetry and track-tailored resolution timelines.
32. `GET /api/audit-logs`: Paginated, filterable immutable security and operational audit trail.
33. `POST /api/intake/whatsapp-simulate`: Omnichannel WhatsApp chatbot grievance simulator.
34. `POST /api/upload`: Multipart file uploader with 10MB limit and MIME validation.
35. `GET /api/csrf`: Cryptographic double-submit CSRF token generator.

---

## 13. Security Architecture, RBAC & OWASP Top 10 Hardening

### 13.1 Tiered Authentication Matrix
The portal strictly differentiates user personas with specialized verification workflows:

| User Persona | Allowed Domain / Identifier | Primary Factor | Secondary Factor | Account Status Workflow | Authorized Role |
|---|---|---|---|---|---|
| **Citizens & Field Experts** | Phone (`+91...`) / Any standard email | SMS / Phone OTP | Simulated Console OTP | Immediate `ACTIVE` upon OTP confirmation | `CITIZEN` / `EXPERT` |
| **University Faculty & PIs** | Institutional `.ac.in` domain | Bcrypt hashed password (cost >= 12) | Mandatory Email OTP confirmation | Immediate `ACTIVE` upon email confirmation | `UNIVERSITY` |
| **Industry CSR Partners** | Corporate domain (`.com`, `.org`, `.in`) | Bcrypt hashed password (cost >= 12) | Government Admin Clearance | Initial `PENDING`; unlocked to `ACTIVE` by Admin | `INDUSTRY` |
| **District Nodal Officers** | Official `.gov.in` / `.nic.in` domain | Bcrypt hashed password (cost >= 12) | Optional TOTP 2FA | Immediate `ACTIVE` upon verification | `GOV` |
| **State Government Leadership**| Official `.gov.in` / `.nic.in` domain | Bcrypt hashed password (cost >= 12) | Mandatory TOTP 2FA Authenticator | Immediate `ACTIVE` upon 2FA enrollment | `GOV` |

### 13.2 Server-Side RBAC Enforcement (`src/lib/rbac.ts`)
Protected route handlers wrap business logic within `withAuth(request, allowedRoles, handler)`:
1. Validates `sih_session` cookie signature and expiration.
2. Checks account status (`ACTIVE` vs `LOCKED` vs `PENDING`).
3. Evaluates role permissions; emits `UNAUTHORIZED_ACCESS_ATTEMPT` audit log upon violation.
4. Enforces resource ownership before permitting state mutations.

### 13.3 OWASP Top 10 Protections
- **A01 Broken Access Control**: Strict server-side RBAC and frontend `RoleGuard` wrappers.
- **A02 Cryptographic Failures**: Bcrypt password hashing (cost factor 12), HttpOnly SameSite session cookies, Base32 TOTP secrets.
- **A03 Injection**: 100% parameterized Prisma ORM queries; zero raw SQL strings.
- **A04 Insecure Design**: Account lockout after 5 consecutive failed attempts; sliding-window rate limiting (10 req/min).
- **A05 Security Misconfiguration**: Strict HTTP security headers (`CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- **A07 Identification & Authentication**: Institutional domain validation (`.ac.in`, `.gov.in`).
- **A08 Data Integrity**: Cryptographic double-submit CSRF protection on all mutating requests.
- **A09 Logging & Monitoring**: Immutable `AuditLog` records for all authentication, triage, claim, and escrow events.

---

## 14. Mobile Client Architecture: Jan-Aawaz / PRAGATI Lens

The mobile client is implemented in Kotlin Multiplatform (KMP) using Compose Multiplatform 1.5.11 (`mobile/shared`):
- **Navigation Stack**: Managed via Voyager 1.0.0 (`Navigator`, `TabNavigator`, and `SlideTransition`).
- **Networking**: Ktor Client 2.3.7 configured for Android (`http://10.0.2.2:3000`) and Desktop (`http://localhost:3000`).
- **Dependency Injection**: Koin 3.5.3 (`appModule`).
- **Offline Caching**: In-memory Room/SQLite DAO mock (`db/OfflineDatabase.kt`) providing reactive `StateFlow` streams.
- **Serialization Safety**: `kotlinx.serialization` models declare default arguments to guarantee backward compatibility with backend JSON responses.

---

## 15. Architectural Verification & Compliance Matrix

| Requirement | Architectural Specification | Verification Method |
|---|---|---|
| **R1: System Topology & Branding** | Full PRAGATI architecture documented across Web, Mobile, AI, and Database tiers. | Forensic documentation audit. |
| **R2: Tri-Track Triage System** | Specification of Track A (45–90d), Track B (14–30d), and Track C (24–72h). | Validated against `prisma/schema.prisma` and `ai.ts`. |
| **R3: District Nodal Triage** | Deprecation of legacy village gatekeeping; institutional DNO review gate with 3 action pathways. | Validated against `/api/nodal/triage` and `/dashboard/nodal`. |
| **R4: Atomic Claim Concurrency** | Race-condition claim engine for academia and industry using Prisma `updateMany`. | Validated by `tests/test_nodal_triage_and_claim.ts`. |
| **R5: Account Handover** | In-place credential transfer preserving `User.id` and historical relations across 10 tables. | Validated by `tests/test_handover_backend.ts`. |
| **R6: Government GIS Dashboard** | 24-District interactive SVG vector map, division filtering, IP compliance queue, seed grant modal. | Validated against `/dashboard/gov` components. |
| **R7: Industry Mentor Portal** | Kanban task board, TRL 1–9 audit ledger, dual decision gates, 5%–15% royalty split sliders. | Validated against `/dashboard/industry` components. |
| **R8: Collaboration Hub** | Polling chat hub and Open Contributor micro-task board. | Validated against `/dashboard/chat` and `/dashboard/open-board`. |
| **R9: Complete Route Inventory** | Full 35 API routes (45 method endpoints) and 21 page routes documented. | Validated against Next.js production build (`npm run build`). |

---

*System Architecture & Data Flow Specification v9.0.0 officially approved for PRAGATI — Government of Jharkhand.*
