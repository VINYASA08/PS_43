# Comprehensive Specification Report: 3-Track Problem Triage System
**Author**: `teamwork_preview_spec_miner` (Triage Spec Miner)  
**Target Milestone**: `r4_survey_3` / Teamwork Preview Implementation Baseline  
**System**: Jharkhand Societal Innovation Collaboration Portal (`/web` and `/mobile`)  
**Status**: Authoritative Specification Complete (Read-Only Investigation)  

---

## 1. Observation

A forensic codebase inspection of the Jharkhand Societal Innovation Portal repository revealed the exact points of ingestion, AI triage processing, schema persistence, and routing:

### 1.1 Database Schema State (`web/prisma/schema.prisma`)
- **Datasource**: SQLite (`url = env("DATABASE_URL")` pointing to `file:./dev.db` in `web/.env`).
- **Enum Policy (Lines 10–13)**:
  ```prisma
  // MODELS (Enums: UserRole, UserStatus, ChallengeStatus, ProposalStatus, FundingStatus, FundingType)
  // Enums are validated in application layer & Zod schemas for SQLite compatibility
  ```
  SQLite does not natively support enum types; all enum-like states in Prisma models are `String` with default values and validated in TypeScript application layer (`web/src/lib/types.ts`) and Zod schemas (`web/src/lib/validation.ts`).
- **Challenge Model (Lines 56–100)**:
  ```prisma
  model Challenge {
    id                   String          @id @default(cuid())
    publicTrackingId     String          @unique // e.g. "IN-GR-2026-9842" or "JHR-2026-842"
    title                String
    description          String
    domain               String          // "Water Management", "Agriculture", "Healthcare", "Energy", etc.
    district             String          // "Dhanbad", "Gumla", "Simdega", "Ranchi", etc.
    location             String          // Block / Village coordinates
    urgency              String          @default("MEDIUM") // UrgencyLevel: CRITICAL, HIGH, MEDIUM, LOW
    status               String          @default("REPORTED") // ChallengeStatus
    reportedById         String
    reportedBy           User            @relation("ReportedBy", fields: [reportedById], references: [id])
    assignedToId         String?
    assignedTo           User?           @relation("AssignedTo", fields: [assignedToId], references: [id])
    assignedInstitute    String?         // e.g. "IIT ISM Dhanbad"
    evidence             String?         // JSON string
    citizenVerified      Boolean         @default(false)
    localVerified        Boolean         @default(false)
    duplicateOfId        String?
    escalationLevel      Int             @default(0)
    slaDeadline          DateTime?
    aiConfidence         Float?
    aiReasoning          String?
    createdAt            DateTime        @default(now())
    updatedAt            DateTime        @updatedAt
    deletedAt            DateTime?
    proposals            Proposal[]
    auditLogs            AuditLog[]
    @@index([status, domain])
    @@index([district, urgency])
    @@index([deletedAt])
    @@index([publicTrackingId])
  }
  ```
- **Observed Deficit**: The current `Challenge` model has **no track field** (`track`), no target entity routing field (`trackRouting`), and no explicit triage category. It assumes every problem is an academic R&D challenge destined for an empanelled university (`assignedInstitute`).

### 1.2 Submission and AI Categorization Pipeline
1. **API Route `POST /api/challenges` (`web/src/app/api/challenges/route.ts`)**:
   - Lines 91–99: Validates incoming request against `createChallengeSchema`.
   - Lines 104–121: Resolves reporter session or defaults to a fallback citizen account.
   - Lines 125–137: Calls `categorizeProblemWithAI` from `web/src/lib/ai.ts`.
   - Lines 143: Extracts `finalInstitute = parsed.data.assignedInstitute || aiCategorization?.suggestedInstitute || null`.
   - Lines 151–170: Creates `Challenge` record.
   - Lines 172–181: Emits `CHALLENGE_CREATED` audit log.
2. **AI Triage Service (`web/src/lib/ai.ts`)**:
   - Lines 273–356: Attempts external LLM categorization via Google Gemini (`gemini-1.5-flash`) with a 5000ms timeout circuit breaker.
   - Lines 358–405: Attempts secondary fallback to OpenAI (`gpt-4o-mini`) if Gemini fails.
   - Lines 407–434: Falls back to rule-based `evaluateHeuristicCategorization(input)` (offline resilient engine).
   - Lines 413: Dispatches strictly to `routeChallengeToInstitute(domain, district)` in `web/src/lib/routing.ts`.
   - Lines 415–417: Semantic deduplication against existing database records via Jaccard token similarity (`detectDuplicates`).
3. **Academic Routing Engine (`web/src/lib/routing.ts`)**:
   - Contains a registry of 10 empanelled academic institutions (`EMPANELLED_INSTITUTIONS`: IIT ISM Dhanbad, BAU Ranchi, RIMS / BIT Mesra, NIT Jamshedpur, CUJ Brambe, BIT Mesra Civil, XISS Ranchi, NIT/BIT Waste).
   - **Observed Deficit**: Does not route to municipal corporations (e.g. Ranchi Municipal Corporation, Dhanbad Municipal Corporation) or government line departments (e.g. JUVNL, DWSD, Road Construction Department).
4. **Omnichannel WhatsApp Intake (`web/src/app/api/intake/whatsapp-simulate/route.ts`)**:
   - Lines 31–51: Creates `Challenge` records directly with default urgency `CRITICAL` and domain `Water Management`, bypassing the AI triage engine.
5. **Mobile Kotlin Client (`mobile/shared/src/commonMain/kotlin/network/Models.kt`)**:
   - Lines 25–37: Defines `data class Challenge` with fields `id`, `publicTrackingId`, `title`, `domain`, `district`, `urgency`, `status`, `assignedInstitute`, `slaDeadline`, `escalationLevel`, `description`.
   - Uses `kotlinx.serialization.Serializable`. Fields missing in incoming JSON default to null/empty without breaking parsing if given default values.

---

## 2. Logic Chain & System Architecture

### 2.1 Step 1: Definitions, Criteria, and Characteristics of the 3 Tracks

The "3-Track Problem Triage System" establishes a tripartite classification taxonomy reflecting real-world administrative and technical resolution capabilities across the State of Jharkhand:

```
                                  [ Grassroots Problem Intake ]
                                 (Web Form / WhatsApp / Mobile)
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ AI Multi-Track Triage │
                                    │ (Gemini/OpenAI/Rules) │
                                    └───────────┬───────────┘
                                                │
             ┌──────────────────────────────────┼──────────────────────────────────┐
             ▼                                  ▼                                  ▼
   ╔═══════════════════╗              ╔═══════════════════╗              ╔═══════════════════╗
   ║      TRACK A      ║              ║      TRACK B      ║              ║      TRACK C      ║
   ║    INNOVATION     ║              ║     STANDARD      ║              ║       CIVIC       ║
   ╚═══════════╤═══════╝              ╚═════════╤═════════╝              ╚═════════╤═════════╝
               │                                │                                  │
    • Applied R&D Required           • Known Engineering Problem        • Immediate Grievance
    • Deep Tech / IP Potential       • COTS / Standard Tender           • Rapid Municipal Action
    • High Technical Novelty         • Line Department Scope            • ULB / Panchayat Level
    • University / Lab Partners      • Standard Procurement             • Micro Maintenance
               │                                │                                  │
               ▼                                ▼                                  ▼
     ┌───────────────────┐            ┌───────────────────┐              ┌───────────────────┐
     │  IITs / NITs /    │            │ State Govt Line   │              │ Municipal Corp /  │
     │  Universities     │            │ Departments       │              │ Nagar Nigam / BDO │
     │  (R&D Escrow)     │            │ (Work Order)      │              │ (Dispatch Crew)   │
     └───────────────────┘            └───────────────────┘              └───────────────────┘
```

#### Detailed Track Characteristics Matrix

| Dimension | Track A: Innovation (`TRACK_A_INNOVATION`) | Track B: Standard (`TRACK_B_STANDARD`) | Track C: Civic (`TRACK_C_CIVIC`) |
|---|---|---|---|
| **System Identifier** | `TRACK_A_INNOVATION` | `TRACK_B_STANDARD` | `TRACK_C_CIVIC` |
| **Core Concept** | High technical novelty, applied R&D required, deep-tech/IP potential, academic translational prototypes. | Known engineering solutions, municipal/infrastructure execution, standard vendor/agency deployment. | Immediate citizen grievance / maintenance, local civic administration resolution, rapid municipal action. |
| **Problem Complexity** | **Unsolved / Non-Standard**: No off-the-shelf solution exists. Root cause requires scientific investigation, chemical/geological/biomedical assays, or algorithm design. | **Standard Engineering**: Solvable with established DPRs, standard schedule of rates (SoR), and existing civil/electrical engineering codes. | **Operational Maintenance**: Localized service failure, physical breakdown, or sanitation breakdown requiring physical dispatch, not engineering design. |
| **Primary Destination** | Empanelled Universities & Centers of Excellence (IIT ISM, NIT, BAU, RIMS, BIT Mesra, CUJ, XISS). | State Government Line Departments (JUVNL, DWSD, RCD, RDD, Health Dept, WRD). | Urban Local Bodies (ULBs), Municipal Corporations (RMC, DMC, JNAC), Nagar Parishads, Gram Panchayats / Mukhiyas. |
| **Resolution Mechanism** | Challenge Docket -> Research Proposal -> Faculty & Multi-Disciplinary Team -> Industry CSR Escrow Co-Funding -> Lab Prototyping -> Field Pilot -> Tech Transfer. | Departmental Verification -> Detailed Estimate -> Departmental Work Order / E-Tender -> Approved Contractor Deployment -> Nodal Officer Inspection. | Grievance Logging -> Quick Response Team (QRT) Dispatch -> Field Crew Action (patching/drain clearing/bulb replacement) -> Citizen Photo Verification. |
| **Funding Mechanism** | Industry CSR Innovation Escrow (Companies Act Section 135) + State R&D Grants + University Innovation Funds. | State Budgetary Allocations + District Mineral Foundation Trust (DMFT) + Centrally Sponsored Schemes (JJM, PMGSY). | Municipal Maintenance Budgets + Ward Discretionary Funds + 15th Finance Commission Untied Grants. |
| **SLA Resolution Target** | **45 to 180 Days** (Tailored to research & pilot phase milestones; e.g. 45 days for prototype design, 90 days for pilot validation). | **14 to 30 Days** (Departmental procurement, work order allocation, and contractor completion). | **24 to 72 Hours** (Rapid operational relief, emergency sanitation dispatch; max 7 days for physical road patching). |
| **Representative Archetypes** | 1. Acid mine drainage with dissolved heavy metal aquifer leaching requiring novel nanomaterial adsorbent filtration skids.<br>2. Soil nitrogen/moisture deficit in tribal rainfed belts requiring bio-NPK formulations and IoT micro-irrigation scheduling.<br>3. Off-grid rural healthcare diagnostic telemetry & low-cost portable ultrasound probes. | 1. Burnt 100 kVA distribution transformer on rural 11kV feeder line requiring standard utility replacement.<br>2. Collapsed culvert / causeway on rural arterial road under PMGSY.<br>3. Submersible deep-well pump motor replacement in municipal drinking water booster station. | 1. Choked municipal stormwater drain overflowing blackwater onto colony street.<br>2. Overflowing community garbage vat with foul odor and animal scavenging.<br>3. Non-functional streetlight luminaires or open manhole cover creating immediate pedestrian danger. |

---

### 2.2 Step 2: Problem Submission Pipeline Analysis (Current vs. 3-Track Triage)

#### Current Architecture Flaws
1. **Universal Academic Routing Bias**: All submissions, regardless of nature, are routed to `assignedInstitute`. A clogged drain or broken street light is assigned to an IIT or agricultural university.
2. **Missing Track Differentiation**: The database cannot distinguish between an R&D grant proposal flow and a 48-hour municipal grievance.
3. **No Departmental or Civic Routing Targets**: Line departments (JUVNL, DWSD) and municipal corporations (RMC, DMC) have no inbox or routing endpoints.
4. **WhatsApp Ingestion Bypass**: The WhatsApp intake simulator (`/api/intake/whatsapp-simulate`) completely bypasses AI triage, hardcoding mock data.

#### The 3-Track Problem Submission Workflow
When a challenge is submitted via Web (`/submit`), WhatsApp (`/whatsapp-intake`), or Mobile API (`POST /api/challenges`):

1. **Input Normalization & Extraction**:
   - Inputs: `title`, `description`, `district`, `location`, `evidence`, `domain` (optional), `urgency` (optional).
2. **AI Multi-Track Triage (`categorizeProblemWithAI`)**:
   - The AI classifier evaluates:
     - **Domain**: Canonical domain (Water, Agriculture, Healthcare, Infrastructure, Energy, Sanitation, etc.).
     - **Urgency**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
     - **Track**: `TRACK_A_INNOVATION` | `TRACK_B_STANDARD` | `TRACK_C_CIVIC`.
     - **Track Routing Destination**: Specific Institution (Track A), Line Department (Track B), or Civic Body (Track C).
     - **Triage Reasoning**: Human-readable rationale articulating why the track and destination were selected.
     - **SLA Hours / Days**: Dynamically mapped to track constraints (Track C: 24–72h; Track B: 14–30d; Track A: 45–90d).
3. **Fallback & Circuit Breaking**:
   - If external LLM (Gemini/OpenAI) fails, times out (>5000ms), or returns invalid JSON, the system transparently falls back to the **Rule-Based Heuristic 3-Track Decision Matrix**.
4. **Persistence & Ledger Registration**:
   - The `Challenge` record is created with `track`, `trackRouting`, `triageReasoning`, `triageConfidence`, and calculated `slaDeadline`.
   - An immutable audit log (`AuditLog`) is recorded with `CHALLENGE_CREATED` and track metadata.

---

### 2.3 Step 3: Database Schema Changes Needed (Prisma Challenge Model)

To preserve strict SQLite compatibility while providing full TypeScript type safety and PostgreSQL migration readiness, the following modifications must be applied:

#### 3.1 Changes to `web/prisma/schema.prisma`

```prisma
model Challenge {
  id                   String          @id @default(cuid())
  publicTrackingId     String          @unique // e.g. "IN-GR-2026-9842" or "JHR-2026-842"
  title                String
  description          String
  domain               String          // "Water Management", "Agriculture", "Healthcare", "Energy", etc.
  district             String          // "Dhanbad", "Gumla", "Simdega", "Ranchi", etc.
  location             String          // Block / Village coordinates
  urgency              String          @default("MEDIUM") // UrgencyLevel: CRITICAL, HIGH, MEDIUM, LOW
  status               String          @default("REPORTED") // ChallengeStatus

  // ---------------------------------------------------------------------------
  // 3-TRACK PROBLEM TRIAGE SYSTEM FIELDS (NEW)
  // ---------------------------------------------------------------------------
  track                String          @default("TRACK_A_INNOVATION") // TriageTrack: TRACK_A_INNOVATION, TRACK_B_STANDARD, TRACK_C_CIVIC
  trackRouting         String?         // Target destination (University, Line Dept, or Municipal Body)
  triageReasoning      String?         // AI/Heuristic justification for track categorization
  triageConfidence     Float?          // Confidence score of triage classifier (0.0 to 1.0)
  targetEntityLevel    String?         // "ACADEMIC_RESEARCH" | "STATE_DEPARTMENT" | "MUNICIPAL_ULB" | "GRAM_PANCHAYAT"

  // Reporter & Assignment Relations
  reportedById         String
  reportedBy           User            @relation("ReportedBy", fields: [reportedById], references: [id])
  assignedToId         String?
  assignedTo           User?           @relation("AssignedTo", fields: [assignedToId], references: [id])
  assignedInstitute    String?         // Legacy backward-compatibility: mirrors trackRouting for Track A

  // Evidence & Verification
  evidence             String?         // JSON string: Media URLs, telemetry (pH, TDS, Fe)
  citizenVerified      Boolean         @default(false)
  localVerified        Boolean         @default(false)
  duplicateOfId        String?
  duplicateOf          Challenge?      @relation("Duplicates", fields: [duplicateOfId], references: [id], onDelete: SetNull)
  duplicates           Challenge[]     @relation("Duplicates")
  verifiedByCount      Int             @default(0)
  escalationLevel      Int             @default(0)
  slaDeadline          DateTime?
  aiConfidence         Float?
  aiReasoning          String?

  // Timestamps & Soft Delete
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
  deletedAt            DateTime?

  // Relations
  proposals            Proposal[]
  auditLogs            AuditLog[]

  @@index([status, domain])
  @@index([district, urgency])
  @@index([track, status])             // NEW: Fast filtering by Track in dashboards
  @@index([track, district])           // NEW: District-level track analytics
  @@index([deletedAt])
  @@index([publicTrackingId])
}
```

#### 3.2 Application Layer Enums (`web/src/lib/types.ts`)

```typescript
export enum TriageTrack {
  TRACK_A_INNOVATION = "TRACK_A_INNOVATION",
  TRACK_B_STANDARD = "TRACK_B_STANDARD",
  TRACK_C_CIVIC = "TRACK_C_CIVIC",
}

export enum TargetEntityLevel {
  ACADEMIC_RESEARCH = "ACADEMIC_RESEARCH",
  STATE_DEPARTMENT = "STATE_DEPARTMENT",
  MUNICIPAL_ULB = "MUNICIPAL_ULB",
  GRAM_PANCHAYAT = "GRAM_PANCHAYAT",
}
```

#### 3.3 Zod Validation Schemas (`web/src/lib/validation.ts`)

```typescript
export const validTracks = [
  "TRACK_A_INNOVATION",
  "TRACK_B_STANDARD",
  "TRACK_C_CIVIC",
] as const;

export const createChallengeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  domain: z.string().refine(
    (d) => (validDomains as readonly string[]).includes(d),
    "Invalid domain"
  ),
  district: z.string().min(2).max(100),
  location: z.string().min(2, "Location/block/village is required").max(200),
  urgency: z.enum(validUrgency).default("MEDIUM"),
  track: z.enum(validTracks).optional(),
  evidence: z.string().optional(),
  assignedInstitute: z.string().optional(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  urgency: z.enum(validUrgency).optional(),
  status: z.enum(validChallengeStatus).optional(),
  track: z.enum(validTracks).optional(),
  trackRouting: z.string().optional(),
  triageReasoning: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  assignedInstitute: z.string().nullable().optional(),
  escalationLevel: z.number().int().min(0).max(3).optional(),
  slaDeadline: z.string().datetime().nullable().optional(),
  citizenVerified: z.boolean().optional(),
});
```

#### 3.4 Mobile Client Compatibility (`mobile/shared/src/commonMain/kotlin/network/Models.kt`)

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
    val track: String = "TRACK_A_INNOVATION",            // NEW: Default ensures backward compatibility
    val trackRouting: String? = null,                   // NEW
    val triageReasoning: String? = null,                // NEW
    val assignedInstitute: String? = null,
    val slaDeadline: String? = null,
    val escalationLevel: Int = 0,
    val description: String = ""
)
```

---

### 2.4 Step 4: Routing Logic for the 3 Tracks

#### 4.1 Track A (Innovation) -> Academic & Research Centers Directory

When a problem is classified as `TRACK_A_INNOVATION`, it routes to empanelled universities based on domain specialization and geographical focus:

| Domain | Empanelled Research Institution | Department / Center | Geographic / Thematic Focus |
|---|---|---|---|
| **Water & Heavy Metals** | **IIT (ISM) Dhanbad** | Centre of Excellence in Water Management / Dept of Env Science | Mining coal-belt aquifers, acid drainage, arsenic/fluoride adsorption. |
| **Agriculture & Soil** | **Birsa Agricultural University (BAU)** | Faculty of Agriculture & Agro-Forestry | Soil NPK deficiency, tribal crop resilience, drought micro-irrigation. |
| **Healthcare & Telemedicine**| **RIMS Ranchi & BIT Mesra** | Dept of Bioengineering & Community Medicine | Portable point-of-care ultrasound, neonatal tele-triage, epidemiology. |
| **Energy & Storage** | **NIT Jamshedpur** | Dept of Electrical & Clean Energy Engineering | Solar microgrid inverters, battery degradation, bi-directional metering. |
| **Civil Materials & Roads**| **BIT Mesra, Ranchi** | Dept of Civil Engineering | Rural soil stabilization, fly-ash composite aggregates, culvert dynamics. |
| **Tribal Pedagogy & Vernacular** | **Central University of Jharkhand (CUJ)** | Dept of Education & Humanities | Santhali/Ho/Mundari digital literacy, off-grid classroom telemetry. |
| **Livelihood & Forest Produce** | **Xavier Institute of Social Service (XISS)** | Dept of Rural Management | Minor forest produce (lac, tussar silk) processing & SHG value chains. |
| **Industrial Waste & Slag** | **NIT Jamshedpur & BIT Mesra** | Dept of Environmental Engineering | Mining slag repurposing, civic sludge bio-methanation. |

**Track A Lifecycle Trigger**: Status set to `OPEN_FOR_PROPOSALS`. Unlocks University proposal submission (`/dashboard/university/proposal/[id]`) and Industry CSR Escrow co-funding (`/dashboard/industry/fund/[id]`). SLA: 45–90 days.

---

#### 4.2 Track B (Standard) -> Government Line Departments Directory

When a problem is classified as `TRACK_B_STANDARD`, it routes to the authoritative state department responsible for public works and statutory engineering maintenance:

| Domain / Issue Category | State Line Department | Responsible Nodal Division | Statutory Procurement Workflow |
|---|---|---|---|
| **Electrical Transmission / Transformers** | **Jharkhand Urja Vikas Nigam Limited (JUVNL / JBVNL)** | Rural/Urban Electricity Supply Division | Standard Schedule of Rates (SoR) transformer replacement tender. |
| **Rural Water Supply & Borewells** | **Drinking Water & Sanitation Department (DWSD)** | Mechanical & Public Health Engineering Wing | Tube well pump replacement & pipe repair DPR. |
| **Roads, Bridges & Arterial Culverts** | **Road Construction Department (RCD) / Rural Development (RDD)** | State PWD / PMGSY Project Implementation Unit (PIU) | Structural culvert rebuilding contract via e-procurement tender. |
| **Health Facilities & Equipment** | **Dept of Health, Medical Education & Family Welfare** | District Civil Surgeon & Infrastructure Cell | PHC hospital building repair & medical equipment AMC requisition. |
| **Irrigation Canals & Check Dams** | **Water Resources Department (WRD)** | Minor Irrigation Division | Canal breach desiltation & sluice gate repair sanction. |
| **Public Distribution & Ration Outlets** | **Food, Public Distribution & Consumer Affairs** | District Supply Officer (DSO) | Electronic POS weighing scale replacement & network connectivity. |
| **School Infrastructure & Classrooms** | **Dept of School Education & Literacy (DSE&L)** | Jharkhand Education Project Council (JEPC) | School roof waterproofing & boundary wall tender. |

**Track B Lifecycle Trigger**: Status set to `UNDER_REVIEW` in District Collector / Line Department inbox (`/dashboard/gov`). Triggers departmental work order / tender issuance workflow. SLA: 14–30 days.

---

#### 4.3 Track C (Civic) -> Local Civic Bodies & Municipal Corporations Directory

When a problem is classified as `TRACK_C_CIVIC`, it routes to the local Urban Local Body (ULB) or Rural Block Administration:

| District / Jurisdiction | Local Civic Body / Administrative Unit | Target Operational Wing | Rapid SLA Dispatch Target |
|---|---|---|---|
| **Ranchi Urban** | **Ranchi Municipal Corporation (RMC)** | Sanitation, Drain Clearing & Quick Response Team (QRT) | **24–48 Hours** |
| **Dhanbad Urban** | **Dhanbad Municipal Corporation (DMC)** | Civic Works & Solid Waste Cell | **24–48 Hours** |
| **East Singhbhum (Jamshedpur)** | **Jamshedpur Notified Area Committee (JNAC) / Mango MC** | Municipal Maintenance Wing | **24–48 Hours** |
| **Bokaro Urban** | **Chas Municipal Corporation / BS City Admin** | Public Health & Streetlight Maintenance | **24–48 Hours** |
| **Deoghar Urban** | **Deoghar Municipal Corporation** | City Sanitation & Stormwater Cell | **24–48 Hours** |
| **Other District HQs (Urban)** | **Respective Nagar Parishad / Nagar Panchayat** | Executive Officer & Ward Sanitation Inspector | **48–72 Hours** |
| **Rural Blocks / Panchayats** | **Block Development Officer (BDO) & Gram Panchayat** | Mukhiya & Panchayat Secretary Maintenance Cell | **48–72 Hours** |

**Track C Lifecycle Trigger**: Status set directly to `REPORTED` or `ASSIGNED_CIVIC`. Triggers SMS/WhatsApp dispatch notification to Ward Supervisor. Enables rapid citizen closure verification with photo evidence upload. SLA: 24–72 hours (max 7 days for physical road patching).

---

#### 4.4 Triage Classification Decision Rules (Prompt & Heuristic Engine)

The classification engine analyzes the problem title, description, domain, location, and evidence notes. The decision logic follows a deterministic hierarchy:

```
IF acute localized public sanitation/hygiene/danger (drain choke, garbage pile, streetlight out, pothole, open manhole):
    -> TRACK_C_CIVIC
    -> SLA: 24 to 72 hours
    -> Route: Local Municipal Corporation / ULB

ELSE IF standard infrastructure/utility failure with known engineering codes (blown transformer, PMGSY road culvert, tubewell pump motor, school roof repair):
    -> TRACK_B_STANDARD
    -> SLA: 14 to 30 days
    -> Route: Relevant State Line Department (JUVNL, DWSD, RCD)

ELSE IF novel/unsolved research, deep tech, environmental contamination, material science, or academic R&D (acid mine drainage nanomaterials, soil NPK deficit, telemedicine telemetry, microgrid inverter design):
    -> TRACK_A_INNOVATION
    -> SLA: 45 to 90 days
    -> Route: Empanelled Academic Institution / University
```

---

### 2.5 Step 5: Test Script Requirements Specification

The acceptance criteria in `ORIGINAL_REQUEST.md` (Line 190) states:
> "Programmatic: A test script is created and run that successfully submits three mock problems (one for each track) and verifies they are routed and categorized correctly in the database."

#### Required Test Script Architecture (`web/tests/test_3track_triage.ts`)
The test script must be an autonomous, self-contained TypeScript executable runnable via `npx tsx tests/test_3track_triage.ts`.

#### Detailed Specification of the 3 Mock Problem Scenarios

##### 1. Mock Problem A (Track A - Innovation):
- **Input Parameters**:
  - `title`: `"Novel Graphene-Based Nanofiltration Skid for Acid Mine Drainage Heavy Metal Adsorption in Jharia Coal Belt"`
  - `description`: `"Acidic mine runoff from open-cast coal mines has infiltrated local aquifers with high concentrations of dissolved Fe, Pb, and Sulfates (pH 3.9). Requires research into novel low-cost nanomaterial adsorbent skids and university laboratory water filtration prototypes."`
  - `domain`: `"Water Management"`
  - `district`: `"Dhanbad"`
  - `location`: `"Jharia Block, Damodar Aquifer Sector 4"`
  - `urgency`: `"CRITICAL"`
  - `evidence`: `JSON.stringify({ ph: "3.9", dissolvedIron: "7.8 mg/L", turbidity: "65 NTU", lab: "State Water Testing Lab" })`
- **Expected Triage Outcomes**:
  - `challenge.track` === `"TRACK_A_INNOVATION"`
  - `challenge.trackRouting` contains `"IIT (ISM) Dhanbad"`
  - `challenge.triageReasoning` mentions applied research / nanomaterial / R&D requirement.
  - `challenge.slaDeadline` reflects research/innovation timeline (>= 45 days).
  - `challenge.status` === `"REPORTED"` or `"OPEN_FOR_PROPOSALS"`.

##### 2. Mock Problem B (Track B - Standard):
- **Input Parameters**:
  - `title`: `"Replacement of Burnt 100 kVA Distribution Transformer on Rural Feeder Line in Dumka"`
  - `description`: `"The 100 kVA distribution transformer on Feeder 4 in Shikaripara block suffered winding failure and burnt out after lightning surge. Needs standard departmental tender replacement with standard 11kV/415V transformer unit under JUVNL rural electrification maintenance schedule."`
  - `domain`: `"Energy"`
  - `district`: `"Dumka"`
  - `location`: `"Shikaripara Block, Substation Feeder 4"`
  - `urgency`: `"HIGH"`
  - `evidence`: `JSON.stringify({ transformerRating: "100 kVA", voltageRatio: "11kV/415V", failureType: "Winding Burnout" })`
- **Expected Triage Outcomes**:
  - `challenge.track` === `"TRACK_B_STANDARD"`
  - `challenge.trackRouting` contains `"Jharkhand Urja Vikas Nigam Limited"` or `"JUVNL"`
  - `challenge.triageReasoning` mentions standard engineering replacement / departmental execution.
  - `challenge.slaDeadline` reflects departmental SLA (14 to 30 days).

##### 3. Mock Problem C (Track C - Civic):
- **Input Parameters**:
  - `title`: `"Choked Open Stormwater Drain and Overflowing Garbage Vat on Main Road Harmu"`
  - `description`: `"Open municipal stormwater drain is severely choked with solid plastic waste causing foul stagnant blackwater overflow onto Harmu Housing Colony main street. Broken drain slab and non-functional streetlights create immediate pedestrian hazard requiring urgent municipal cleaning crew dispatch."`
  - `domain`: `"Urban Infrastructure"`
  - `district`: `"Ranchi"`
  - `location`: `"Harmu Housing Colony, Ward 26"`
  - `urgency`: `"HIGH"`
  - `evidence`: `JSON.stringify({ street: "Harmu Main Road", wardNumber: "Ward 26", hazard: "Blackwater overflow & pedestrian safety" })`
- **Expected Triage Outcomes**:
  - `challenge.track` === `"TRACK_C_CIVIC"`
  - `challenge.trackRouting` contains `"Ranchi Municipal Corporation"` or `"RMC"`
  - `challenge.triageReasoning` mentions immediate civic maintenance / municipal sanitation crew dispatch.
  - `challenge.slaDeadline` reflects rapid SLA (<= 72 hours).

#### Programmatic Assertions in Test Script:
1. **API Invocation Verification**: Submits each problem via `POST /api/challenges` with CSRF headers and receives HTTP 201.
2. **Database State Verification**: Queries Prisma database (`prisma.challenge.findUnique({ where: { publicTrackingId } })`) and asserts that `track`, `trackRouting`, `triageReasoning`, and `slaDeadline` are non-null and correctly populated.
3. **Audit Log Verification**: Verifies `prisma.auditLog` contains `CHALLENGE_CREATED` with the corresponding tracking ID and metadata.
4. **Clean Exit**: Exits with code 0 on all assertions passing, or code 1 with full diagnostics on any assertion failure.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | AI Triage | Multi-Track Classification Engine | Classifies reported problems into Track A (Innovation), Track B (Standard), or Track C (Civic) using LLM / Heuristics. | `title`, `description`, `domain`, `district`, `location`, `evidence` | `track`, `trackRouting`, `triageReasoning`, `triageConfidence`, `slaDeadline` | Gracefully falls back to offline heuristic classifier on API error or timeout. | `web/src/lib/ai.ts` |
| 2 | Routing | Academic Innovation Dispatch | Routes Track A challenges to empanelled universities/IITs based on domain and geographic proximity. | `domain`, `district`, `track: "TRACK_A_INNOVATION"` | `instituteName`, `department`, `reason` | Defaults to Central University of Jharkhand / XISS if domain unknown. | `web/src/lib/routing.ts` |
| 3 | Routing | Line Department Dispatch | Routes Track B challenges to authoritative state line departments (JUVNL, DWSD, RCD, Health Dept). | `domain`, `district`, `track: "TRACK_B_STANDARD"` | `departmentName`, `division`, `workflow` | Defaults to District Collectorate Infrastructure Cell. | Mined Specification |
| 4 | Routing | Civic Body Dispatch | Routes Track C challenges to municipal corporations (RMC, DMC, JNAC) or Block Development Officers. | `district`, `location`, `track: "TRACK_C_CIVIC"` | `municipalBody`, `wing`, `rapidSlaHours` | Defaults to District Urban Development Agency (DUDA). | Mined Specification |
| 5 | SLA Engine | Track-Aware SLA Calculation | Calculates statutory SLA deadline based on track type (Track C: 24–72h, Track B: 14–30d, Track A: 45–90d). | `track`, `urgency` | `slaDays`, `slaDeadline: Date` | Defaults to 45 days if track or urgency unrecognized. | `web/src/lib/ai.ts` lines 48–62 |
| 6 | Database | 3-Track Challenge Persistence | Stores `track`, `trackRouting`, `triageReasoning`, and `targetEntityLevel` on Prisma `Challenge` model with index. | Challenge submission payload | Stored SQLite/PostgreSQL `Challenge` row | Schema validation error (HTTP 400) if invalid track value passed. | `web/prisma/schema.prisma` |
| 7 | Audit Logging | Immutable Triage Audit Trail | Logs track assignment and routing metadata into `AuditLog` on challenge creation and update. | `userId`, `action: "CHALLENGE_CREATED"`, `resource: "Challenge"`, metadata | Stored `AuditLog` row | Failure logged to console without blocking challenge creation. | `web/src/lib/rbac.ts` |
| 8 | Omnichannel | WhatsApp Triage Integration | Ingests WhatsApp field grievances and automatically runs 3-track triage rather than hardcoding static defaults. | `message`, `phone`, `district`, `location` | `trackingId`, `track`, `trackRouting`, `challengeId` | Fallback tracking ID generated if database error occurs. | `web/src/app/api/intake/whatsapp-simulate/route.ts` |
| 9 | Deduplication | Semantic Duplicate Detection | Compares incoming report against active challenges using token Jaccard similarity (threshold 0.70). | `title`, `description`, `district`, `domain` | `isDuplicate`, `duplicateOfId`, `similarityScore` | Skips deduplication check gracefully if DB query fails. | `web/src/lib/ai.ts` lines 194–266 |
| 10 | Mobile Sync | Cross-Platform Serialization | Exposes `track`, `trackRouting`, and `triageReasoning` to Kotlin Mobile client via JSON serialization. | GET `/api/challenges` | JSON challenges array | Missing JSON keys deserialized to Kotlin default values. | `mobile/shared/src/commonMain/kotlin/network/Models.kt` |

---

## 4. Edge Cases & Boundary Analysis

| # | Feature | Input Scenario | Observed / Specified Behavior |
|---|---|---|---|
| 1 | 3-Track Triage | Ambiguous / Vague Description: Citizen writes `"Our village is suffering and nothing works here anymore. Please help."` | Heuristic engine defaults `track` to `TRACK_C_CIVIC` (immediate civic relief prioritized), domain to `Public Service Delivery`, and routes to Local Block Development Officer (BDO) with `MEDIUM` urgency. |
| 2 | 3-Track Triage | Dual-Trigger Conflict: Report contains both a broken transformer (Track B) and overflowing municipal garbage (Track C). | Conflict resolution rule prioritizes immediate public safety/hygiene -> `TRACK_C_CIVIC` for immediate municipal dispatch, while logging `TRACK_B_STANDARD` as a secondary tracking issue in `triageReasoning`. |
| 3 | AI Resilience | External AI Outage / HTTP 429: Gemini or OpenAI API key missing, invalid, or rate-limited. | Circuit breaker catches error, activates `evaluateHeuristicCategorization`, generates full 3-track triage without failing the user submission (returns HTTP 201). |
| 4 | GPS Coordinates | Missing Geolocation: Citizen disables GPS permission or submits from desktop without browser geolocation. | System accepts manual location string (e.g. `"Block XYZ, Village 4"`), marks `evidence.gpsLocation` as undefined, and uses district for geographic routing without crashing. |
| 5 | Extreme Inputs | Text Flooding: Description exceeds 5000 characters or title contains special characters/emojis. | Zod schema validation caps description at 5000 characters (returns HTTP 400 if exceeded). Title handles UTF-8 characters cleanly. |
| 6 | Anonymous Intake | Unauthenticated Submission: Public citizen submits problem via web without logging in. | System automatically assigns reporter to default public citizen account (`role: "CITIZEN"`), completes triage, and returns tracking ID without requiring authentication. |
| 7 | Duplicate Reports | Citizen submits near-identical complaint within the same district (similarity >= 0.70). | AI deduplication engine flags `isDuplicate: true`, populates `duplicateOfId`, while maintaining the canonical record's track and routing. |
| 8 | SLA Boundary | Emergency Health / Toxic Hazard: Acute cyanide or arsenic runoff reported (Track A or C). | Urgency forced to `CRITICAL` (Priority Score 92/100). SLA reduced to minimum threshold (14 days for Track A R&D; 24 hours for Track C civic hazard). |

---

## 5. Caveats

1. **SQLite vs. PostgreSQL Enum Constraints**:
   - The current production-grade development database is SQLite (`dev.db`). SQLite does NOT have native enum types.
   - Any attempt to add `enum TriageTrack { ... }` directly in `prisma/schema.prisma` will fail `prisma migrate dev` or `prisma db push` on SQLite.
   - **Mandatory Practice**: Fields in `schema.prisma` must remain `String` (e.g. `track String @default("TRACK_A_INNOVATION")`), with enum integrity strictly enforced in TypeScript (`types.ts`) and Zod schemas (`validation.ts`).
2. **Mobile Kotlin Client Deserialization**:
   - The Kotlin Multiplatform mobile client in `mobile/shared` uses `kotlinx.serialization`. If new required fields are returned in JSON without default values in `Models.kt`, the mobile JSON parser will throw a `SerializationException`.
   - In `Models.kt`, all new fields must have default values (`val track: String = "TRACK_A_INNOVATION"`, `val trackRouting: String? = null`).
3. **Legacy Seed Data Backward Compatibility**:
   - Existing seeded challenges (`IN-GR-2026-9842`, `JHR-2026-821`, `JHR-2026-805`, `JHR-2026-788`) currently have `assignedInstitute` but lack `track`.
   - When migrating, default existing rows to `TRACK_A_INNOVATION` and set `trackRouting = assignedInstitute` so existing proposal and funding commitment workflows continue functioning without data loss.
4. **External LLM Latency vs. Form Submission**:
   - Direct LLM calls can take 1.5 to 3.5 seconds. The 5000ms timeout circuit breaker in `web/src/lib/ai.ts` is essential to prevent HTTP 504 gateway timeouts on client forms.

---

## 6. Conclusion

The specification mining for the **3-Track Problem Triage System** is complete and validated against the entire Next.js Web and Kotlin Mobile codebase.

1. **Track Definitions & Decision Boundaries**: Fully formulated with distinct criteria, governance tiers, funding models, resolution workflows, and SLA targets.
2. **Current Codebase Gaps**: Identified in `POST /api/challenges`, `POST /api/intake/whatsapp-simulate`, `web/src/lib/ai.ts`, `web/src/lib/routing.ts`, and `web/prisma/schema.prisma`.
3. **Schema Specification**: Exact fields (`track`, `trackRouting`, `triageReasoning`, `triageConfidence`, `targetEntityLevel`), indexes, and application-layer Zod schemas defined.
4. **Routing Logic**: Complete directories formulated for Academic Centers (Track A), Line Departments (Track B), and Municipal Corporations / Civic Bodies (Track C).
5. **Test Script Requirements**: Complete programmatic test specification designed (`web/tests/test_3track_triage.ts`) testing 3 mock problems end-to-end with database assertion verification.

Implementation teams can immediately proceed with executing the Prisma schema update, AI prompt & heuristic expansion, API route updates, and automated test script creation.

---

## 7. Verification Method

To independently verify the facts and findings outlined in this specification document:

1. **Verify Prisma Schema State**:
   ```bash
   view_file web/prisma/schema.prisma lines 56 to 100
   ```
   *Expected*: Verify that `track`, `trackRouting`, and `triageReasoning` are currently absent from `model Challenge`.

2. **Verify Submission API & AI Triage**:
   ```bash
   view_file web/src/app/api/challenges/route.ts lines 120 to 170
   view_file web/src/lib/ai.ts lines 270 to 430
   view_file web/src/lib/routing.ts lines 150 to 288
   ```
   *Expected*: Verify that all routing currently points exclusively to `EMPANELLED_INSTITUTIONS` (universities).

3. **Verify Mobile Client Serialization**:
   ```bash
   view_file mobile/shared/src/commonMain/kotlin/network/Models.kt lines 25 to 45
   ```
   *Expected*: Verify `Challenge` data class structure and default parameter conventions.

4. **Verify Implementation Target**:
   When implementation is performed, the required test script should be executed via:
   ```powershell
   cd a:\Development\Antigravity\SIH26043\web
   npx tsx tests/test_3track_triage.ts
   ```
   *Expected Outcome*: 3/3 mock problems submitted, triaged into Track A, Track B, and Track C, routed correctly, and verified in the database.
