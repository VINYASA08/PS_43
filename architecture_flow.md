# System Architecture & Cross-Platform Data Flow Specification
## Jharkhand Societal Innovation Collaboration Portal
**Document Version**: 4.0.0 (Production Architecture Baseline)  
**System Architecture Authority**: Teamwork Preview Core Architecture Group  
**Target Deployment**: Web (Next.js 16.3.4 App Router) & Mobile (Kotlin Multiplatform / Compose)  
**Persistence Layer**: SQLite (Prisma ORM 5.11.0) with Transparent Soft-Deletes & Immutable Audit Ledger  
**Triage System**: Tri-Track Problem Ingestion Engine (Track A: Innovation, Track B: Standard, Track C: Civic)  

---

## 1. Executive Summary & Core Architectural Principles

The **Jharkhand Societal Innovation Collaboration Portal** is a unified digital governance, research incubation, and rapid civic redressal ecosystem. It bridges the critical operational divide between grassroots citizens, frontline administrative officers, empanelled research universities, and corporate CSR entities across the State of Jharkhand.

### 1.1 The Tri-Track Triage Problem Space
Historically, citizen grievance mechanisms and societal problem collection in municipal and rural governance suffer from severe misallocation:
1. **Academic R&D Misallocation**: Complex scientific problems (e.g., acid mine drainage, fluoride/arsenic aquifer contamination, tribal vernacular pedagogical deficits) are treated as routine contractor work and languish unresolved for years.
2. **Civic Over-Engineering**: Mundane localized maintenance grievances (e.g., choked open drains, burnt streetlights, localized potholes) are either routed to high-level state secretariats or academic institutions where they stall without rapid field execution.
3. **Departmental Siloing**: Major civil and electrical infrastructure failures (e.g., blown 100 kVA feeder transformers, collapsed arterial culverts) lack standard DPR and procurement workflow tracking, leaving line departments uncoordinated.

To resolve these governance bottlenecks, the platform implements an authoritative **Tri-Track Problem Triage System**:
- **Track A (`TRACK_A_INNOVATION`)**: High-novelty, applied R&D problems routed to empanelled universities and centers of excellence (IIT ISM Dhanbad, BIT Mesra, BAU Ranchi, NIT Jamshedpur) funded via Corporate Social Responsibility (CSR) escrow accounts.
- **Track B (`TRACK_B_STANDARD`)**: Standard public works and engineering failures routed to State Government Line Departments (JUVNL, DWSD, RCD) with statutory e-tenders, work orders, and 14-30 day SLAs.
- **Track C (`TRACK_C_CIVIC`)**: Immediate municipal maintenance and sanitation hazards routed to Urban Local Bodies (RMC, DMC, JNAC) and Gram Panchayats with rapid 24-72 hour SLAs.

### 1.2 Core Architectural Principles
- **Defense in Depth**: Every API route enforces session validity, cryptographic CSRF validation, parameter sanitization via Zod schemas, and granular Role-Based Access Control (RBAC).
- **Dual-Engine AI Resiliency**: Problem classification executes against external LLMs (Google Gemini 1.5 Flash / OpenAI GPT-4o-mini) protected by a 5000ms timeout circuit breaker, falling back deterministically to an offline rule-based heuristic classifier.
- **Cross-Platform Contract Parity**: Data contracts between Next.js API Route Handlers and Kotlin Multiplatform (KMP) Mobile Clients use strict, backward-compatible JSON serialization schemas.
- **Immutable Public Accountability**: Every lifecycle mutation generates a cryptographically traceable audit record in the `AuditLog` ledger, powering the public Grievance Redressal & Accountability Index (GRAI).

---

## 2. End-to-End System Topology & Platform Architecture

The system operates across two client runtimes, a centralized serverless API gateway, an AI classification engine, and a hardened persistence tier.

```
+----------------------------------------------------------------------------------------------------+
|                                      CLIENT CONSUMPTION TIERS                                      |
|                                                                                                    |
|   +---------------------------------------+       +--------------------------------------------+   |
|   |         NEXT.JS 16 WEB PORTAL         |       |         KOTLIN MULTIPLATFORM (KMP)         |   |
|   |   (React 19 / Turbopack / Tailwind)   |       |       (Compose Multiplatform / Voyager)    |   |
|   |  - Public Landing & Track Tracker     |       |  - Android Native App (SDK 34)             |   |
|   |  - Citizen Intake Form (/submit)      |       |  - Koin Dependency Injection               |   |
|   |  - WhatsApp Ingestion Simulator       |       |  - Ktor HTTP Engine (AndroidClient)        |   |
|   |  - Gov/Univ/Industry Dashboards       |       |  - Field Sarpanch Physical Verification   |   |
|   +-------------------+-------------------+       +---------------------+----------------------+   |
+-----------------------|-------------------------------------------------|--------------------------+
                        | HTTPS (Fetch + CSRF)                            | HTTPS (Ktor HTTP / JSON)  
                        v                                                 v                           
+----------------------------------------------------------------------------------------------------+
|                              NEXT.JS 16 API ROUTE HANDLERS (/api/*)                                |
|                                                                                                    |
|  +-------------------------------------+  +-----------------------------------------------------+  |
|  |     AUTHENTICATION & RBAC TIER      |  |               PROBLEM INGESTION SUITE               |  |
|  |  - /api/auth/login (10 req/min)     |  |  - /api/challenges (POST: Intake, GET: Filter)      |  |
|  |  - /api/auth/register (Tiered Role) |  |  - /api/intake/whatsapp-simulate (Omnichannel)      |  |
|  |  - /api/auth/totp-verify (Gov 2FA)  |  |  - /api/mobile/challenges (Mobile Ingestion)        |  |
|  |  - withAuth() Route Middleware      |  |  - /api/mobile/verify (Sarpanch Ground Verification)|  |
|  +-------------------------------------+  +-----------------------------------------------------+  |
|                                                                                                    |
|  +-------------------------------------+  +-----------------------------------------------------+  |
|  |    COLLABORATION & ESCROW TIER      |  |               TRANSPARENCY & TELEMETRY              |  |
|  |  - /api/proposals (Academic RFP)    |  |  - /api/track/[id] (5-Stage Public Timeline)        |  |
|  |  - /api/funds (CSR Escrow & MoU)    |  |  - /api/analytics (State KPIs & SLA Telemetry)      |  |
|  |  - /api/admin/approve-user (Gov)    |  |  - /api/audit-logs (Security & Triage Ledger)       |  |
|  +-------------------------------------+  +-----------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
                        |                                                 |                           
                        | Internal Dispatch                               | Prisma Client 5.11.0      
                        v                                                 v                           
+----------------------------------------------------+  +--------------------------------------------+
|             AI MULTI-TRACK TRIAGE ENGINE           |  |          PERSISTENCE & DATA STORAGE        |
|                                                    |  |                                            |
|  +----------------------------------------------+  |  |  +--------------------------------------+  |
|  |  Google Gemini 1.5 Flash (Circuit Breaker)   |  |  |  |  SQLite Database (web/prisma/dev.db) |  |
|  +----------------------------------------------+  |  |  |  - Challenges (Track A/B/C Indexed)  |  |
|  |  OpenAI GPT-4o-mini (Secondary Fallback)     |  |  |  |  - Users (Tiered Roles & Passwords)  |  |
|  +----------------------------------------------+  |  |  |  - Proposals (University Research)   |  |
|  |  Deterministic Heuristic 3-Track Engine      |  |  |  |  - FundingCommitments (CSR Escrow)   |  |
|  +----------------------------------------------+  |  |  |  - AuditLogs (Immutable Audit Trail) |  |
|  |  Jaccard Semantic Deduplication (Thr: 0.70)  |  |  |  +--------------------------------------+  |
|  +----------------------------------------------+  |  |  |  Local Media Storage: public/uploads/|  |
+----------------------------------------------------+  +--------------------------------------------+
```

---

## 3. Multi-Channel Problem Ingestion & Data Flow Diagrams

The platform ingests societal challenges through three distinct channels, each tailored to specific citizen and administrative contexts:

### 3.1 Channel 1: Web Citizen Submission Flow
Citizens submit problems via the web wizard (`/submit`), capturing browser GPS coordinates, attaching telemetry (water pH, soil testing certificates), and uploading media evidence.

```
 Citizen Browser               Next.js Route Handler            AI Triage Service             Prisma / SQLite
  (/submit UI)               (POST /api/challenges)             (src/lib/ai.ts)              (prisma/dev.db)
       |                               |                              |                             |
       | 1. Geolocation & Media Upload |                              |                             |
       |------------------------------>|                              |                             |
       |    POST /api/upload           |                              |                             |
       |<------------------------------|                              |                             |
       |    { fileUrl: "/uploads/..." }|                              |                             |
       |                               |                              |                             |
       | 2. Submit Challenge Payload   |                              |                             |
       |    (with x-csrf-token)        |                              |                             |
       |------------------------------>|                              |                             |
       |                               | 3. Zod Schema Validation     |                             |
       |                               |    (createChallengeSchema)   |                             |
       |                               |---------------------------\  |                             |
       |                               |                           |  |                             |
       |                               |<--------------------------/  |                             |
       |                               |                              |                             |
       |                               | 4. Dispatch for Triage       |                             |
       |                               |----------------------------->|                             |
       |                               |                              | 5. Gemini / OpenAI LLM      |
       |                               |                              |    (5000ms Timeout)         |
       |                               |                              |    [Fallback to Heuristic]  |
       |                               |                              |---------------------------\ |
       |                               |                              |                           | |
       |                               |                              |<--------------------------/ |
       |                               |                              |                             |
       |                               |                              | 6. Jaccard Deduplication    |
       |                               |                              |    (Similarity >= 0.70)     |
       |                               |                              |---------------------------\ |
       |                               |                              |                           | |
       |                               |                              |<--------------------------/ |
       |                               |                              |                             |
       |                               | 7. Return Track & Routing    |                             |
       |<------------------------------|                              |                             |
       |                               |    { track: TRACK_A, ... }   |                             |
       |                               |                              |                             |
       |                               | 8. Execute Database Transaction                            |
       |                               |----------------------------------------------------------->|
       |                               |    - Insert Challenge with SLA deadline                    |
       |                               |    - Insert CHALLENGE_CREATED AuditLog                     |
       |                               |<-----------------------------------------------------------|
       |                               |    Challenge Record Created (IN-GR-2026-XXXX)              |
       |                               |                                                            |
       | 9. HTTP 201 Created           |                                                            |
       |<------------------------------|                                                            |
       |    { success: true,           |                                                            |
       |      publicTrackingId: "..." }|                                                            |
```

### 3.2 Channel 2: Omnichannel WhatsApp Intake Flow
Designed for citizens without high-speed internet or smartphones. A citizen sends a text, voice note, or photo via WhatsApp.

```
 Citizen WhatsApp           Mock WhatsApp Webhook            AI 3-Track Engine             Prisma / Database
     Client              (/api/intake/whatsapp-simulate)      (src/lib/ai.ts)               (dev.db SQLite)
       |                               |                              |                             |
       | 1. WhatsApp Inbound Message   |                              |                             |
       |    (Text, Photo, GPS pin)     |                              |                             |
       |------------------------------>|                              |                             |
       |                               | 2. Normalize Message Body    |                             |
       |                               |    & Extract Media Metadata  |                             |
       |                               |---------------------------\  |                             |
       |                               |                           |  |                             |
       |                               |<--------------------------/  |                             |
       |                               |                              |                             |
       |                               | 3. Call 3-Track Classifier   |                             |
       |                               |----------------------------->|                             |
       |                               |                              | 4. Track Evaluation:        |
       |                               |                              |    Track C (Sanitation/ULB) |
       |                               |                              |    Track B (Utility/Dept)   |
       |                               |                              |    Track A (Research/Univ)  |
       |                               |<-----------------------------|                             |
       |                               | 5. Persist Challenge & Track                               |
       |                               |----------------------------------------------------------->|
       |                               |    - Set status = REPORTED / ASSIGNED_CIVIC                |
       |                               |    - Calculate SLA (24h - 72h for Track C)                 |
       |                               |<-----------------------------------------------------------|
       |                               |                                                            |
       | 6. WhatsApp Outbound Reply    |                                                            |
       |<------------------------------|                                                            |
       |    "Grievance IN-GR-2026-9842 |                                                            |
       |     Logged. Track: CIVIC.     |                                                            |
       |     Assigned to: RMC Ward 26. |                                                            |
       |     SLA Resolution: 48 Hours" |                                                            |
```

### 3.3 Channel 3: Mobile Field Intake & Sarpanch Ground Verification
Enables rural field workers and Gram Panchayat Sarpanches to log issues on-site and physically verify reported problems.

```
 Rural Citizen / Field Worker          Local Sarpanch / Mukhiya              Backend Route Handler              Prisma Database
     (Kotlin Mobile App)                 (Kotlin Mobile App)               (POST /api/mobile/*)                 (dev.db SQLite)
              |                                   |                                  |                                 |
              | 1. Submit Local Issue             |                                  |                                 |
              |    POST /api/mobile/challenges    |                                  |                                 |
              |--------------------------------------------------------------------->|                                 |
              |                                   |                                  | 2. Create Unverified Challenge  |
              |                                   |                                  |-------------------------------->|
              |                                   |                                  |    localVerified = false        |
              |                                   |                                  |<--------------------------------|
              |<---------------------------------------------------------------------|                                 |
              |    { trackingId: "IN-GR-2026-4412", status: "REPORTED" }             |                                 |
              |                                   |                                  |                                 |
              |                                   | 3. On-Site Physical Inspection   |                                 |
              |                                   |    & Identity Confirmation       |                                 |
              |                                   |-------------------------------\  |                                 |
              |                                   |                               |  |                                 |
              |                                   |<------------------------------/  |                                 |
              |                                   |                                  |                                 |
              |                                   | 4. Physical Verification Call    |                                 |
              |                                   |    POST /api/mobile/verify       |                                 |
              |                                   |    { challengeId, sarpanchId }   |                                 |
              |                                   |--------------------------------->|                                 |
              |                                   |                                  | 5. RBAC Auth Check:             |
              |                                   |                                  |    Verify Sarpanch has GOV role |
              |                                   |                                  | 6. Run AI Triage & Dedup        |
              |                                   |                                  | 7. Update Challenge:            |
              |                                   |                                  |-------------------------------->|
              |                                   |                                  |    localVerified = true         |
              |                                   |                                  |    status = UNDER_REVIEW        |
              |                                   |                                  |    track = TRACK_A/B/C          |
              |                                   |                                  |    trackRouting = Target Org    |
              |                                   |                                  |<--------------------------------|
              |                                   |<---------------------------------|                                 |
              |                                   |    { success: true,              |                                 |
              |                                   |      verified: true,             |                                 |
              |                                   |      track: "TRACK_B_STANDARD" } |                                 |
```

---

## 4. The 3-Track Problem Triage System Architecture

The core innovation of Round 4 is the strict separation of incoming problems into three operational tracks based on technical complexity, statutory responsibility, and resolution velocity:

```
                                    +-----------------------------------+
                                    |     INCOMING PROBLEM STATEMENT    |
                                    |  (Title, Description, Telemetry)  |
                                    +-----------------+-----------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    |      MULTI-TRACK AI TRIAGE        |
                                    |     (Gemini / OpenAI / Rules)     |
                                    +-----------------+-----------------+
                                                      |
                 +------------------------------------+------------------------------------+
                 |                                    |                                    |
                 v                                    v                                    v
  +------------------------------+     +------------------------------+     +------------------------------+
  |           TRACK A            |     |           TRACK B            |     |           TRACK C            |
  |          INNOVATION          |     |           STANDARD           |     |            CIVIC             |
  +------------------------------+     +------------------------------+     +------------------------------+
  | - Novel scientific challenge |     | - Known engineering problem  |     | - Immediate public grievance |
  | - Applied R&D required       |     | - Standard civil/electrical  |     | - Local maintenance hazard   |
  | - Deep-tech / patentable IP  |     | - Line Department scope      |     | - Municipal / Panchayat crew |
  | - Empanelled Universities    |     | - Standard Tender / DPR      |     | - Direct physical dispatch   |
  | - CSR Escrow Co-Funding      |     | - State Budget / DMFT Fund   |     | - Ward Discretionary Fund    |
  | - SLA: 45 to 90 Days         |     | - SLA: 14 to 30 Days         |     | - SLA: 24 to 72 Hours        |
  +--------------+---------------+     +--------------+---------------+     +--------------+---------------+
                 |                                    |                                    |
                 v                                    v                                    v
  +------------------------------+     +------------------------------+     +------------------------------+
  |     ACADEMIC DIRECTORY       |     |   LINE DEPARTMENT DIRECTORY  |     |   CIVIC & ULB DIRECTORY      |
  |  - IIT (ISM) Dhanbad         |     |  - JUVNL (Electricity Board) |     |  - Ranchi Municipal Corp     |
  |  - Birsa Agricultural Univ   |     |  - DWSD (Drinking Water)     |     |  - Dhanbad Municipal Corp    |
  |  - RIMS Ranchi / BIT Mesra   |     |  - RCD / RDD (Roads/Bridges) |     |  - JNAC Jamshedpur           |
  |  - NIT Jamshedpur            |     |  - Minor Irrigation Dept     |     |  - Chas / Deoghar MC         |
  |  - Central Univ Jharkhand    |     |  - Dept of Health & Family   |     |  - Block Dev Officers (BDO)  |
  +------------------------------+     +------------------------------+     +------------------------------+
```

### 4.1 Track Characteristics & Operational Matrix

| Dimension | Track A: Innovation (`TRACK_A_INNOVATION`) | Track B: Standard (`TRACK_B_STANDARD`) | Track C: Civic (`TRACK_C_CIVIC`) |
|---|---|---|---|
| **System Code** | `TRACK_A_INNOVATION` | `TRACK_B_STANDARD` | `TRACK_C_CIVIC` |
| **Classification Rule** | Unsolved scientific/engineering bottlenecks requiring experimentation, material formulation, or novel algorithmic architectures. | Established public works/infrastructure failures solvable via standard civil/electrical engineering codes. | Localized public nuisance, sanitation hazard, or micro-breakdown requiring immediate physical dispatch. |
| **Target Destination** | Empanelled Universities & Centers of Excellence (IIT ISM, BAU, RIMS, NIT, BIT). | State Government Line Departments (JUVNL, DWSD, RCD, RDD, WRD). | Urban Local Bodies (ULBs) & Rural Gram Panchayats / Block Development Officers. |
| **Financial Mechanism** | Industry CSR Innovation Escrow (Companies Act ?135) + State R&D Grants. | State Budgetary Allocations + District Mineral Foundation Trust (DMFT) + Central Schemes. | Municipal Maintenance Funds + Ward Discretionary Funds + 15th Finance Commission Untied Grants. |
| **Operational Lifecycle** | Problem Docket -> Research RFP -> University Proposal -> CSR Escrow Pledge -> Prototype Milestone -> Pilot -> Tech Transfer. | Inspection Docket -> Technical Estimate -> E-Procurement Tender -> Work Order -> Contractor Execution -> Completion Audit. | Grievance Logging -> Quick Response Team (QRT) Dispatch -> Crew Action -> Citizen Verification Photo Upload. |
| **Resolution SLA** | **45 to 90 Days** (Tailored to research & pilot phase milestones). | **14 to 30 Days** (Statutory procurement & execution window). | **24 to 72 Hours** (Rapid operational hazard response; max 7 days for road patching). |
| **Exemplar Problems** | - Acid mine drainage nanomaterial adsorption in Jharia.<br>- Tribal rainfed soil bio-NPK deficit formulations in Gumla.<br>- Telemedicine diagnostic telemetry kits in Simdega. | - Blown 100 kVA feeder transformer replacement in Dumka.<br>- Collapsed causeway/culvert rebuild under PMGSY.<br>- Submersible drinking water booster pump replacement. | - Choked open stormwater drain overflowing on Harmu road.<br>- Overflowing community garbage vat with animal scavenging.<br>- Broken streetlights or uncovered manhole on main road. |

### 4.2 Triage Decision Logic & Deterministic Keyword Matrix

When an incoming payload is processed by `categorizeProblemWithAI()` (`web/src/lib/ai.ts`), the system applies the following prioritized heuristic rule cascade:

```
+----------------------------------------------------------------------------------------------------+
|                                    TRIAGE DECISION RULE CASCADE                                    |
|                                                                                                    |
|  1. EVALUATE TRACK C (CIVIC HAZARD & SANITATION):                                                  |
|     Match keywords: "pothole", "streetlight", "clogged drain", "choked drain", "overflowing vat",   |
|                     "garbage dump", "open manhole", "broken tap", "stagnant water", "sanitation".  |
|     ACTION: Assign TRACK_C_CIVIC, SLA = 48-72h, Route to Local Municipal Corp (RMC, DMC, JNAC)    |
|                                                                                                    |
|  2. EVALUATE TRACK B (STANDARD INFRASTRUCTURE & UTILITIES):                                        |
|     Match keywords: "transformer", "feeder line", "substation", "high tension wire", "pipeline",   |
|                     "borewell motor", "culvert", "causeway", "bridge repair", "canal breach",      |
|                     "school roof", "hospital bed AMC", "work order", "schedule of rates".          |
|     ACTION: Assign TRACK_B_STANDARD, SLA = 14-30d, Route to Line Dept (JUVNL, DWSD, RCD, WRD)       |
|                                                                                                    |
|  3. EVALUATE TRACK A (APPLIED INNOVATION & R&D):                                                   |
|     Match keywords: "acid mine", "heavy metal", "arsenic", "fluoride", "adsorbent", "nanomaterial",|
|                     "telemedicine", "point-of-care", "soil npk", "micro-irrigation", "inverter",   |
|                     "battery degradation", "vernacular pedagogy", "research", "novel prototype".   |
|     ACTION: Assign TRACK_A_INNOVATION, SLA = 45-90d, Route to Empanelled University (IIT, BAU, NIT)|
|                                                                                                    |
|  4. CONFLICT RESOLUTION:                                                                           |
|     If a report contains dual triggers (e.g. broken transformer near overflowing open drain):      |
|     - Priority is given to public hazard / sanitation -> TRACK_C_CIVIC for immediate crew dispatch.|
|     - Secondary infrastructure failure is recorded in triageReasoning for Line Department notice.  |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. Component Interactions, Database Schema Relations & State Machine

### 5.1 Entity-Relationship Architecture (`web/prisma/schema.prisma`)

```
+------------------------------------+              +------------------------------------+
|               USER                 |              |             CHALLENGE              |
+------------------------------------+              +------------------------------------+
| id: String (CUID) [PK]             |<-------+     | id: String (CUID) [PK]             |
| email: String [UQ]                 |        |     | publicTrackingId: String [UQ]      |
| phone: String                      |        |     | title: String                      |
| passwordHash: String               |        |     | description: String                |
| role: UserRole (GOV/UNIV/IND/CIT)  |        |     | domain: String                     |
| status: UserStatus (ACTIVE/PENDING)|        |     | district: String                   |
| organization: String?              |        |     | location: String                   |
| twoFactorEnabled: Boolean          |        |     | urgency: UrgencyLevel              |
| twoFactorSecret: String?           |        |     | status: ChallengeStatus            |
| failedLoginAttempts: Int           |        |     | track: TriageTrack [NEW]           |
| lockoutUntil: DateTime?            |        |     | trackRouting: String? [NEW]        |
| createdAt / updatedAt / deletedAt  |        |     | triageReasoning: String? [NEW]     |
+-----------------+------------------+        |     | triageConfidence: Float? [NEW]     |
                  |                           |     | targetEntityLevel: String? [NEW]   |
                  | 1:N                       |     | reportedById: String [FK] ---------+
                  v                           |     | assignedToId: String? [FK]         |
+------------------------------------+        |     | assignedInstitute: String?         |
|              PROPOSAL              |        |     | evidence: String? (JSON Telemetry) |
+------------------------------------+        |     | citizenVerified / localVerified    |
| id: String (CUID) [PK]             |        |     | duplicateOfId: String? [Self FK]   |
| challengeId: String [FK] ----------+--------+     | slaDeadline: DateTime?             |
| submitterId: String [FK]           | 1:N          | createdAt / updatedAt / deletedAt  |
| university: String                 |              +-----------------+------------------+
| title: String                      |                                |
| abstract: String                   |                                | 1:N
| methodology: String                |                                v
| budget: Float                      |              +------------------------------------+
| timelineMonths: Int                |              |             AUDIT_LOG              |
| stage: ProposalStage               |              +------------------------------------+
| status: ProposalStatus             |              | id: String (CUID) [PK]             |
+-----------------+------------------+              | userId: String? [FK]               |
                  |                                 | action: String                     |
                  | 1:N                             | resource: String                   |
                  v                                 | resourceId: String                 |
+------------------------------------+              | challengeId: String? [FK] ---------+
|         FUNDING_COMMITMENT         |              | details: String? (JSON Snapshot)   |
+------------------------------------+              | ipAddress: String?                 |
| id: String (CUID) [PK]             |              | userAgent: String?                 |
| proposalId: String [FK]            |              | timestamp: DateTime                |
| industryUserId: String [FK]        |              +------------------------------------+
| escrowRef: String [UQ]             |
| amount: Float                      |
| fundingType: CSR / GRANT / EQUITY  |
| status: PLEDGED / ESCROW / RELEASE |
+------------------------------------+
```

### 5.2 Challenge State Transition Machine Across Tracks

Each track follows a tailored state progression reflecting its operational workflow:

```
  +--------------------------------------------------------------------------------------------------+
  |                                 CHALLENGE LIFECYCLE STATE MACHINE                                |
  |                                                                                                  |
  |                           +-------------------------------------+                                |
  |                           |           REPORTED (Intake)         |                                |
  |                           +------------------+------------------+                                |
  |                                              |                                                   |
  |                                              v (AI Triage & Verification)                        |
  |                           +-------------------------------------+                                |
  |                           |             UNDER_REVIEW            |                                |
  |                           +------------------+------------------+                                |
  |                                              |                                                   |
  |                 +----------------------------+----------------------------+                      |
  |                 | (Track A: Innovation)      | (Track B: Standard)        | (Track C: Civic)     |
  |                 v                            v                            v                      |
  |   +---------------------------+  +---------------------------+  +---------------------------+    |
  |   |    OPEN_FOR_PROPOSALS     |  |       TENDER_ISSUED       |  |      ASSIGNED_CIVIC       |    |
  |   +-------------+-------------+  +-------------+-------------+  +-------------+-------------+    |
  |                 |                              |                              |                  |
  |                 v (Proposal Submitted)         v (Contractor Awarded)         v (QRT Dispatched) |
  |   +---------------------------+  +---------------------------+  +---------------------------+    |
  |   |    PROPOSAL_SUBMITTED     |  |     WORK_IN_PROGRESS      |  |      ACTION_TAKEN         |    |
  |   +-------------+-------------+  +-------------+-------------+  +-------------+-------------+    |
  |                 |                              |                              |                  |
  |                 v (CSR Escrow Funded)          |                              |                  |
  |   +---------------------------+                |                              |                  |
  |   |          FUNDED           |                |                              |                  |
  |   +-------------+-------------+                |                              |                  |
  |                 |                              |                              |                  |
  |                 v (Field Pilot Deployed)       v (Statutory Inspection)       v (Citizen Verify) |
  |   +-----------------------------------------------------------------------------------------+    |
  |   |                                         RESOLVED                                        |    |
  |   +--------------------------------------------+--------------------------------------------+    |
  |                                                |                                                 |
  |                                                v (Post-Resolution Audit)                         |
  |   +-----------------------------------------------------------------------------------------+    |
  |   |                                          CLOSED                                         |    |
  |   +-----------------------------------------------------------------------------------------+    |
  +--------------------------------------------------------------------------------------------------+
```

---

## 6. API Contracts & Interface Specifications

### 6.1 `POST /api/challenges` (Problem Ingestion)
- **RBAC**: Public (Anonymous submissions link to System Citizen account; Authenticated sessions link to `session.user.id`).
- **Security**: Requires signed CSRF token (`x-csrf-token` header or cookie).
- **Request Payload**:
  ```json
  {
    "title": "Novel Graphene Adsorbent Skid for Acid Mine Drainage in Jharia",
    "description": "Acidic runoff from coal pit 4 has acidified local aquifers with dissolved Fe (7.8 mg/L) and pH 3.9...",
    "domain": "Water Management",
    "district": "Dhanbad",
    "location": "Jharia Block, Sector 4",
    "urgency": "CRITICAL",
    "evidence": "{\"ph\":3.9,\"iron\":\"7.8mg/L\",\"mediaUrl\":\"/uploads/evidence-1.jpg\"}"
  }
  ```
- **Response Payload (HTTP 201)**:
  ```json
  {
    "success": true,
    "challenge": {
      "id": "cm7...x1",
      "publicTrackingId": "IN-GR-2026-9842",
      "title": "Novel Graphene Adsorbent Skid for Acid Mine Drainage in Jharia",
      "track": "TRACK_A_INNOVATION",
      "trackRouting": "IIT (ISM) Dhanbad",
      "triageReasoning": "Acid mine drainage and dissolved heavy metal contamination requires advanced material science R&D.",
      "triageConfidence": 0.94,
      "urgency": "CRITICAL",
      "status": "REPORTED",
      "slaDeadline": "2026-10-20T11:12:00.000Z",
      "createdAt": "2026-09-05T11:12:00.000Z"
    }
  }
  ```

### 6.2 `GET /api/challenges` (Filtered Challenge Query)
- **Query Parameters**:
  - `track`: `TRACK_A_INNOVATION` | `TRACK_B_STANDARD` | `TRACK_C_CIVIC`
  - `domain`: `Water Management`, `Agriculture`, `Healthcare`, `Energy`, `Urban Infrastructure`, etc.
  - `district`: `Dhanbad`, `Ranchi`, `Gumla`, `Dumka`, etc.
  - `urgency`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`
  - `status`: `REPORTED` | `UNDER_REVIEW` | `OPEN_FOR_PROPOSALS` | `RESOLVED`
  - `limit`: Integer (default: 20)
- **Response**: Array of challenge objects including `track`, `trackRouting`, `triageReasoning`, and proposal counts.

### 6.3 `POST /api/ai/categorize` (Standalone Triage & Deduplication)
- **Request Payload**: `{ title, description, district?, location?, evidenceNotes? }`
- **Response Payload (HTTP 200)**:
  ```json
  {
    "domain": "Water Management",
    "urgency": "CRITICAL",
    "priorityScore": 92,
    "track": "TRACK_A_INNOVATION",
    "trackRouting": "IIT (ISM) Dhanbad",
    "triageReasoning": "Requires nanomaterial adsorbent chemical engineering.",
    "slaDays": 45,
    "slaDeadline": "2026-10-20T11:12:00.000Z",
    "confidence": 0.94,
    "isDuplicate": false,
    "provider": "gemini-1.5-flash"
  }
  ```

### 6.4 `POST /api/mobile/challenges` (Mobile Field Submission)
- **Request Payload**:
  ```json
  {
    "title": "Replacement of Burnt 100 kVA Feeder Transformer in Dumka",
    "description": "The 100 kVA distribution transformer on Feeder 4 in Shikaripara burnt out after a lightning surge...",
    "district": "Dumka",
    "location": "Shikaripara Block, Substation 4",
    "reporterId": "usr_mobile_citizen_01",
    "evidenceUrl": "/uploads/transformer-burn.jpg"
  }
  ```
- **Response Payload (HTTP 201)**:
  ```json
  {
    "success": true,
    "trackingId": "IN-GR-2026-4412",
    "challengeId": "cm7...x2",
    "track": "TRACK_B_STANDARD",
    "trackRouting": "Jharkhand Urja Vikas Nigam Limited (JUVNL)",
    "status": "REPORTED"
  }
  ```

### 6.5 `POST /api/mobile/verify` (Sarpanch Ground Physical Verification)
- **RBAC**: Enforces `UserRole.GOV` on `sarpanchId`.
- **Request Payload**: `{ "challengeId": "cm7...x2", "sarpanchId": "usr_sarpanch_shikaripara" }`
- **Response Payload (HTTP 200)**:
  ```json
  {
    "success": true,
    "verified": true,
    "challengeId": "cm7...x2",
    "trackingId": "IN-GR-2026-4412",
    "track": "TRACK_B_STANDARD",
    "trackRouting": "Jharkhand Urja Vikas Nigam Limited (JUVNL)",
    "status": "UNDER_REVIEW",
    "verifiedAt": "2026-09-05T11:15:00.000Z"
  }
  ```

### 6.6 `GET /api/track/[id]` (Public Redressal & Telemetry Dossier)
- **Parameters**: `id` = UUID or `publicTrackingId` (e.g. `IN-GR-2026-9842`).
- **Response Payload (HTTP 200)**:
  ```json
  {
    "id": "cm7...x1",
    "publicTrackingId": "IN-GR-2026-9842",
    "title": "Novel Graphene Adsorbent Skid for Acid Mine Drainage",
    "track": "TRACK_A_INNOVATION",
    "trackRouting": "IIT (ISM) Dhanbad",
    "triageReasoning": "Advanced material R&D required for acidic heavy metal runoff.",
    "status": "OPEN_FOR_PROPOSALS",
    "urgency": "CRITICAL",
    "slaDeadline": "2026-10-20T11:12:00.000Z",
    "currentStage": 2,
    "timeline": [
      { "stage": 1, "name": "Submitted & AI Triaged", "status": "COMPLETED", "date": "2026-09-05T11:12:00Z" },
      { "stage": 2, "name": "Academic RFP Issued", "status": "IN_PROGRESS", "date": "2026-09-05T11:13:00Z" },
      { "stage": 3, "name": "CSR Escrow Pledged", "status": "PENDING" },
      { "stage": 4, "name": "Prototyping & Field Pilot", "status": "PENDING" },
      { "stage": 5, "name": "Citizen Verification & Redressal", "status": "PENDING" }
    ],
    "telemetry": { "ph": 3.9, "iron": "7.8 mg/L", "turbidity": "65 NTU" },
    "proposalsCount": 1,
    "fundingStatus": "PENDING_ESCROW"
  }
  ```

---

## 7. Security Architecture, RBAC & OWASP Top 10 Hardening

### 7.1 Tiered Authentication Matrix
The portal strictly differentiates four user personas with specialized onboarding, verification, and domain authorization controls:

| User Persona | Allowed Email / Identifier Domain | Credential Factor 1 | Credential Factor 2 | Account Status Workflow | Authorized Role |
|---|---|---|---|---|---|
| **Citizens & Field Experts** | Phone number (`+91...`) / Any standard email | Phone / SMS OTP Verification | Simulated Console OTP | Immediate `ACTIVE` upon OTP confirmation | `CITIZEN` / `EXPERT` |
| **University Faculty & PIs** | Institutional `.ac.in` domain (e.g. `iitism.ac.in`, `bitmesra.ac.in`) | Bcrypt hashed password (cost >= 12) | Mandatory Email OTP confirmation | Immediate `ACTIVE` upon institutional email verification | `UNIVERSITY` |
| **Industry CSR Partners** | Corporate domain (`.com`, `.org`, `.in`) | Bcrypt hashed password (cost >= 12) | Manual Gov Nodal Admin Approval | Initial `PENDING`; unlocked to `ACTIVE` by Nodal Officer | `INDUSTRY` |
| **Government Nodal Officers** | Official `.gov.in` / `.nic.in` domain | Bcrypt hashed password (cost >= 12) | Hardware/App TOTP 2FA (RFC 6238) | Immediate `ACTIVE` upon TOTP secret enrollment | `GOV` |

### 7.2 Backend RBAC Enforcement (`src/lib/rbac.ts`)
Every protected route handler wraps business logic within `withAuth(request, allowedRoles, handler)`:
1. **Cookie Decoding**: Reads `sih_session` cookie; validates signature and expiration (7-day rolling window).
2. **Account Status Verification**: Rejects locked (`lockoutUntil > now()`) or pending (`status == "PENDING"`) accounts with HTTP 403.
3. **Role Authorization**: Compares decoded `user.role` against `allowedRoles`. Rejection emits a security violation entry in `AuditLog`.
4. **Ownership Verification**: State-changing endpoints (e.g., proposal edits, fund pledges) verify that `resource.userId === session.user.id` or `session.user.role === "GOV"`.

### 7.3 OWASP Top 10 Hardening Summary
- **A01: Broken Access Control**: Server-side role enforcement on every API handler; UI-level navigation guards (`RoleGuard.tsx`) mirror backend permissions.
- **A02: Cryptographic Failures**: Passwords hashed with bcrypt cost 12. Session tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies. Sensitive TOTP secrets encrypted.
- **A03: Injection (SQL & Command)**: 100% of database interactions execute via Prisma ORM parameterized queries. No raw SQL concatenation.
- **A04: Insecure Design**: Account lockout after 5 consecutive failed attempts (30-minute cooling period). Rate limiting (10 req/min per IP) on `/api/auth/login`.
- **A05: Security Misconfiguration**: HTTP response headers hardened via Next.js middleware:
  - `Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline';`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **A07: Identification & Authentication Failures**: Strict domain validation for Government and University tiers.
- **A08: Software & Data Integrity Failures**: CSRF tokens enforced on all non-GET requests via double-submit cookie pattern (`x-csrf-token`).
- **A09: Security Logging & Monitoring Failures**: All authentication attempts, triage categorizations, approvals, and fund pledges write immutable rows to `AuditLog`.

---

## 8. Telemetry Tracking, Verification & Public Accountability Flow

### 8.1 Telemetry Ingestion & Parsing
The platform parses real-time physical sensor data submitted within challenge dockets:
- **Water Management Telemetry**: Acidity/Alkalinity (`pH`), Total Dissolved Solids (`TDS`), Heavy Metal Concentrations (Iron `Fe`, Arsenic `As`, Fluoride `F`), Turbidity (`NTU`).
- **Agricultural Telemetry**: Soil Moisture (`%`), Nitrogen-Phosphorus-Potassium (`NPK` ratio in mg/kg), Electrical Conductivity (`EC`).
- **Energy Telemetry**: Feeder Transformer Load (`kVA`), Battery State of Health (`SoH %`), Grid Frequency (`Hz`).

### 8.2 The Grievance Redressal & Accountability Index (GRAI)
Located at `/accountability`, GRAI continuously aggregates live data from the SQLite database:
- **Departmental Velocity Score**: Evaluates Line Departments (JUVNL, DWSD, RCD) on Track B resolution rates against statutory SLAs.
- **Academic Translation Score**: Ranks empanelled universities (IIT ISM, BAU, BIT Mesra) based on research proposals submitted, prototype milestones cleared, and field pilot deployments under Track A.
- **Civic QRT Score**: Ranks Municipal Corporations (RMC, DMC, JNAC) based on percentage of Track C maintenance tickets resolved within 48 hours.

---

## 9. Cross-Platform Parity & Mobile Client Integration

The Kotlin Multiplatform mobile application (`/mobile`) delivers field parity with the web platform:

### 9.1 Mobile Architecture Stack
- **Framework**: Compose Multiplatform 1.5.11 (Declarative UI in `commonMain`).
- **Navigation**: Voyager 1.0.0 navigation stack with `SlideTransition`.
- **Networking**: Ktor Client 2.3.7 with Android-specific HTTP engine (`io.ktor:ktor-client-android`).
- **Dependency Injection**: Koin 3.5.3 (`appModule`).
- **Serialization**: `kotlinx.serialization.json.Json` with lenient decoding and fallback defaults.

### 9.2 Android Permission & Network Hardening
- **Manifest (`androidApp/src/androidMain/AndroidManifest.xml`)**:
  ```xml
  <manifest xmlns:android="http://schemas.android.com/apk/res/android">
      <uses-permission android:name="android.permission.INTERNET" />
      <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
      <application
          android:label="@string/app_name"
          android:theme="@style/Theme.AppCompat.NoActionBar"
          android:usesCleartextTraffic="true">
          <activity android:name="com.myapplication.MainActivity" android:exported="true">
              <intent-filter>
                  <action android:name="android.intent.action.MAIN" />
                  <category android:name="android.intent.category.LAUNCHER" />
              </intent-filter>
          </activity>
      </application>
  </manifest>
  ```
  `usesCleartextTraffic="true"` permits local development loopback communication with `http://10.0.2.2:3000/api`.

### 9.3 Data Model Contract Parity (`network/Models.kt`)
To guarantee deserialization safety between Next.js JSON payloads and Kotlin objects, all models declare default parameters:
```kotlin
@Serializable
data class Challenge(
    val id: String = "",
    val publicTrackingId: String? = null,
    val title: String = "",
    val domain: String = "",
    val district: String = "",
    val urgency: String = "",
    val status: String = "",
    val track: String = "TRACK_A_INNOVATION",
    val trackRouting: String? = null,
    val triageReasoning: String? = null,
    val assignedInstitute: String? = null,
    val slaDeadline: String? = null,
    val escalationLevel: Int = 0,
    val description: String = ""
)

@Serializable
data class DomainDistribution(
    @SerialName("name") val domain: String = "",
    val count: Int = 0
)
```

---

## 10. Architectural Verification & Compliance Matrix

| Requirement Ref | Architectural Specification | Implementation Target | Verification Method |
|---|---|---|---|
| **R1: System Audit & Flow** | End-to-end data flow between Web, Mobile, API, AI, and Database documented with ASCII diagrams. | `architecture_flow.md` | Forensic audit inspection against codebase paths. |
| **R2: 3-Track Triage System** | Formal specification of Track A (Innovation), Track B (Standard), Track C (Civic) with SLA and routing directories. | Section 4 of `architecture_flow.md` | Validation against `prisma/schema.prisma` and `ai.ts`. |
| **R3: Cross-Platform Parity** | Kotlin Mobile Android manifest permissions, model serialization contracts, and build parameters documented. | Section 9 of `architecture_flow.md` | `gradlew assembleDebug` and Next.js `npm run build`. |
| **AC: Programmatic Verification** | Standalone automated 3-track triage test script asserting database state for 3 mock problems. | `web/tests/test_3track_triage.ts` | `npx tsx tests/test_3track_triage.ts` exits with code 0. |

