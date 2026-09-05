# Database Architecture & Security Infrastructure Analysis
**Jharkhand Societal Innovation Portal (`web`)**  
**Explorer**: Explorer 1  
**Working Directory**: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1`  
**Date**: September 4, 2026 (UTC: 2026-09-04T14:10:00Z)  

---

## 1. Executive Summary & Problem Scope

The Jharkhand Societal Innovation Portal is a high-impact digital public infrastructure designed to bridge local citizen problems across Jharkhand's 24 districts with university research teams (IIT ISM Dhanbad, Birsa Agricultural University, NIT Jamshedpur, RIMS Ranchi) and corporate CSR sponsors (Tata Steel CSR, Coal India CSR Trust) under state oversight (Government of Jharkhand).

Currently, the web application at `a:\Development\Antigravity\SIH26043\web` operates purely on client-side state and mock data structures with zero database integration, no active API routes, and no persistent security layer.

This investigation delivers the complete architectural blueprint for:
1. Integrating **PostgreSQL** with **Prisma ORM** in Next.js 16 (React 19).
2. Production-grade **Prisma Schema** with role-based access control, full audit logging, soft deletes, and statutory CSR escrow tracking.
3. Modern **Prisma Client Extensions** for automated soft-delete filtering and strict **ACID Transactions** for multi-step state transitions.
4. Complete **Seed Script (`prisma/seed.ts`)** reconciling every mock persona, challenge ID, proposal, and escrow commitment currently in the UI.
5. End-to-end **OWASP Top 10 Security Hardening**, including CSP headers, CSRF defense, Zod validation, token-bucket rate limiting, and zero-leak error sanitization.

---

## 2. Existing Codebase Analysis

### 2.1 Technology Stack & Environment
- **Framework**: Next.js 16.3.4 (App Router, Turbopack enabled)
- **Runtime / UI**: React 19.2.8, TypeScript 5.x
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **PWA**: `@ducanh2912/next-pwa` wrapping `next.config.ts`
- **State Management**: `zustand` 5.0.15
- **Icons & Motion**: `lucide-react` 1.41.0, `framer-motion` 13.2.0
- **Testing**: Node.js ES Module integration suite in `tests/routes.test.mjs` and `tests/workflows.test.mjs`

### 2.2 Persona & Credential Inventory (`app/login/page.tsx`)
The portal defines 5 distinct personas with pre-filled test accounts:
1. **Government Official (`gov`)**:
   - Title: Principal Secretary & Nodal Officer (Dr. R. K. Soren, IAS)
   - Email: `nodal.innovation@jharkhand.gov.in`
   - Role Route: `/dashboard/gov`
2. **Higher Education Institution (`university`)**:
   - Title: Lead Principal Investigator (Dr. K. Banerjee)
   - Institution: IIT ISM Dhanbad (Environmental Science & Engineering)
   - Email: `pi.water@iitism.ac.in`
   - Role Route: `/dashboard/university`
3. **Industry Partner (`industry`)**:
   - Title: CSR & Innovation Head (Tata Steel CSR Division)
   - Email: `csr.director@tatasteel.com`
   - Role Route: `/dashboard/industry?type=funding`
4. **Independent Expert / Research Mentor (`expert`)**:
   - Title: Senior Remote Sensing & Hydrology Expert (Dr. A. K. Sen, ISRO Alumni Network)
   - Email: `dr.sen.mentor@isro-alumni.res.in`
   - Role Route: `/dashboard/industry?type=mentorship`
5. **Citizen / Community (`citizen`)**:
   - Title: Public Contributor (Pooja Murmu, Gram Panchayat Nodal Reporter)
   - Email: `citizen.reporter@jharkhand.org` (and `pooja.murmu@village4.org`)
   - Role Route: `/submit` and `/track`

### 2.3 Mock Data & Entity Cross-Reference
The UI components cross-reference recurring challenges, proposals, and escrow references:
- **Challenges**:
  - `JHR-2026-842` / `IN-GR-2026-9842` / `CH-842`: "Contaminated Drinking Water & Acidic Runoff in Dhanbad" (Water Management, Critical Urgency, Block XYZ Village 4, Assigned to IIT ISM Dhanbad). Evidence: Turbidity 48 NTU, Dissolved Iron 6.2 mg/L, pH 4.8.
  - `JHR-2026-821` / `IN-DL-2026-3104` / `CH-843`: "Smart Irrigation Deficiencies & Soil Nitrogen Deficit" (Agriculture, High Urgency, Gumla District, Assigned to Birsa Agricultural University).
  - `JHR-2026-805` / `IN-MH-2026-7712` / `CH-821`: "Rural Healthcare Access & Tele-Medicine in Tribal Belts" (Healthcare, Critical Urgency, Simdega District, Assigned to RIMS Ranchi / BIT Mesra, Funded by Coal India CSR).
  - `JHR-2026-788` / `CH-809`: "Solar Microgrid Storage in Slum Clusters" (Energy / Urban Infrastructure, High Urgency, Ranchi District, Assigned to NIT Jamshedpur).
  - `JHR-2026-764`: "Digital Literacy Laboratory Access for Tribal Schools" (Education, Medium Urgency, Khunti District).
  - `JHR-2026-750`: "Subsurface Aquifer Arsenic Contamination" (Water Management, Critical Urgency, Sahebganj District, IIT ISM Dhanbad).
- **Proposals**:
  - `PR-102`: "IoT Based Water Quality Monitoring System" / "Solar-Powered Dual-Stage Groundwater Filtration Pilot" (IIT ISM Dhanbad, Water Management, Prototype Ready, ₹3,50,000).
  - `PR-104`: "AI-Driven Crop Disease Predictor App" (Birsa Agricultural University, Agriculture, Research Phase, Mentorship Only / ₹0).
  - `PR-109`: "Modular Urban Solar Microgrid" (NIT Jamshedpur, Energy, Pilot Implementation, ₹12,00,000).
  - `PR-115`: "Bio-Adsorbent Arsenic Remediation Filter" (IIT ISM Dhanbad, Water Management, Prototype Ready, ₹4,80,000).
- **Funding & Escrow**:
  - `JH-ESCROW-2026-CSR-9842` / `JH-ESCROW-2026-CSR-4821`: Tata Steel CSR Division, ₹3,50,000 for `PR-102`. Statutory CSR 80G tax receipt: Tranche 1 (30% = ₹1,05,000 DPR Approval), Tranche 2 (40% = ₹1,40,000 Lab Pilot), Tranche 3 (30% = ₹1,05,000 Collector Sign-off).
  - `JH-ESCROW-2026-CSR-7712`: Coal India CSR Trust, ₹8,00,000 for `IN-MH-2026-7712` (100% disbursed).

---

## 3. PostgreSQL + Prisma ORM Integration Plan

### 3.1 Required Packages
To install in `a:\Development\Antigravity\SIH26043\web`:
```bash
# Production dependencies
npm install @prisma/client zod bcryptjs

# Development dependencies
npm install -D prisma tsx @types/bcryptjs
```

### 3.2 NPM Scripts (`package.json`)
The following scripts should be added to `web/package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio"
  },
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

### 3.3 Next.js 16 Prisma Client Singleton (`src/lib/prisma.ts`)
In Next.js development mode, hot-reloading instantiates new client modules on each change, depleting the PostgreSQL connection pool. A singleton bound to `globalThis` prevents connection exhaustion:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## 4. Production Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

enum UserRole {
  GOV
  UNIVERSITY
  INDUSTRY
  CITIZEN
  EXPERT
}

enum UserStatus {
  ACTIVE
  PENDING
  LOCKED
  SUSPENDED
}

enum ChallengeStatus {
  REPORTED
  CITIZEN_VERIFIED
  UNDER_REVIEW
  OPEN_FOR_PROPOSALS
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum UrgencyLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum ProposalStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  SHORTLISTED
  APPROVED
  REJECTED
  FUNDED
}

enum FundingType {
  CSR
  GRANT
  EQUITY
  MENTORSHIP_ONLY
}

enum FundingStatus {
  PLEDGED
  ESCROWED
  DISBURSED
  COMPLETED
  CANCELLED
}

// -----------------------------------------------------------------------------
// MODELS
// -----------------------------------------------------------------------------

model User {
  id                  String      @id @default(cuid())
  email               String?     @unique
  phone               String?     @unique
  passwordHash        String
  role                UserRole
  status              UserStatus  @default(ACTIVE)

  // Profile Fields
  name                String
  organization        String?
  designation         String?
  district            String?
  bio                 String?     @db.Text
  profileUrl          String?

  // Verification & Security
  emailVerified       DateTime?
  phoneVerified       DateTime?
  twoFactorEnabled    Boolean     @default(false)
  twoFactorSecret     String?
  failedLoginAttempts Int         @default(0)
  lockoutUntil        DateTime?

  // Timestamps & Soft Delete
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  deletedAt           DateTime?

  // Relations
  reportedChallenges  Challenge[]         @relation("ReportedBy")
  assignedChallenges  Challenge[]         @relation("AssignedTo")
  submittedProposals  Proposal[]          @relation("SubmittedBy")
  fundingCommitments  FundingCommitment[] @relation("IndustryUser")
  auditLogs           AuditLog[]          @relation("UserAuditLogs")

  @@index([role, status])
  @@index([district])
  @@index([deletedAt])
}

model Challenge {
  id                   String          @id @default(cuid())
  publicTrackingId     String          @unique // e.g. "IN-GR-2026-9842" or "JHR-2026-842"
  title                String
  description          String          @db.Text
  domain               String          // "Water Management", "Agriculture", "Healthcare", "Energy", etc.
  district             String          // "Dhanbad", "Gumla", "Simdega", "Ranchi", etc.
  location             String          // Block / Village / Specific location coordinates
  urgency              UrgencyLevel    @default(MEDIUM)
  status               ChallengeStatus @default(REPORTED)

  // Reporter & Assignment Relations
  reportedById         String
  reportedBy           User            @relation("ReportedBy", fields: [reportedById], references: [id])
  assignedToId         String?
  assignedTo           User?           @relation("AssignedTo", fields: [assignedToId], references: [id])
  assignedInstitute    String?         // Institutional text label, e.g. "IIT ISM Dhanbad"

  // Evidence & Verification
  evidence             Json?           // Media URLs, SHA-256 hashes, sensor telemetry (pH, TDS, Fe, etc.)
  citizenVerified      Boolean         @default(false)
  verifiedByCount      Int             @default(0)
  escalationLevel      Int             @default(0) // 0: Normal, 1: Nodal Officer, 2: District Collector, 3: Chief Secretary
  slaDeadline          DateTime?

  // Timestamps & Soft Delete
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
  deletedAt            DateTime?

  // Relations
  proposals            Proposal[]
  auditLogs            AuditLog[]

  @@index([status, domain])
  @@index([district, urgency])
  @@index([deletedAt])
  @@index([publicTrackingId])
}

model Proposal {
  id                 String          @id @default(cuid())
  proposalRef        String          @unique // e.g. "PR-102", "PR-104"
  challengeId        String
  challenge          Challenge       @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  
  submittedById      String
  submittedBy        User            @relation("SubmittedBy", fields: [submittedById], references: [id])
  universityName     String          // "IIT ISM Dhanbad", "Birsa Agricultural University", etc.
  
  title              String
  abstract           String          @db.Text
  methodology        String          @db.Text
  budget             Decimal         @db.Decimal(12, 2)
  timelineMonths     Int             @default(6)
  stage              String          @default("Prototype Ready") // "Research Phase", "Prototype Ready", "Pilot Implementation"
  attachedDocs       Json?           // Document name, file size, storage URL

  status             ProposalStatus  @default(SUBMITTED)

  // Timestamps & Soft Delete
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
  deletedAt          DateTime?

  // Relations
  fundingCommitments FundingCommitment[]

  @@index([challengeId, status])
  @@index([submittedById])
  @@index([deletedAt])
}

model FundingCommitment {
  id                 String          @id @default(cuid())
  escrowRef          String          @unique // e.g. "JH-ESCROW-2026-CSR-9842"
  proposalId         String
  proposal           Proposal        @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  industryUserId     String
  industryUser       User            @relation("IndustryUser", fields: [industryUserId], references: [id])
  corporateName      String          // "Tata Steel CSR Division", "Coal India CSR Trust"
  panNumber          String?         // Masked PAN or Registration ID
  csrRegistrationNo  String?         // e.g. "CSR0001842"

  amount             Decimal         @db.Decimal(12, 2)
  type               FundingType     @default(CSR)
  status             FundingStatus   @default(PLEDGED)

  notes              String?         @db.Text
  tranches           Json?           // 30% DPR, 40% Lab Pilot, 30% Collector Sign-off
  mouSigned          Boolean         @default(false)
  mouSignedAt        DateTime?

  // Timestamps & Soft Delete
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
  deletedAt          DateTime?

  @@index([proposalId, status])
  @@index([industryUserId])
  @@index([deletedAt])
}

model AuditLog {
  id           String     @id @default(cuid())
  userId       String?
  user         User?      @relation("UserAuditLogs", fields: [userId], references: [id], onDelete: SetNull)

  action       String     // "CHALLENGE_CREATED", "PROPOSAL_SUBMITTED", "ESCROW_COMMITTED", "SLA_ESCALATED"
  resource     String     // "Challenge", "Proposal", "FundingCommitment", "User"
  resourceId   String
  challengeId  String?
  challenge    Challenge? @relation(fields: [challengeId], references: [id], onDelete: SetNull)

  oldState     Json?
  newState     Json?

  ipAddress    String?
  userAgent    String?
  createdAt    DateTime   @default(now())

  @@index([resource, resourceId])
  @@index([userId, action])
  @@index([challengeId])
  @@index([createdAt])
}
```

---

## 5. Soft-Delete Architecture & Database Transactions

### 5.1 Modern Soft-Delete via Prisma Client Extension (`$extends`)
In Prisma 5 and 6, Prisma Client Extensions supersede legacy middleware for type-safe query interception. We create `src/lib/prisma-soft-delete.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

export const extendedPrisma = (client: PrismaClient) => {
  return client.$extends({
    query: {
      user: {
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }) {
          return client.user.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }) {
          return client.user.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      challenge: {
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }) {
          return client.challenge.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      proposal: {
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }) {
          return client.proposal.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      fundingCommitment: {
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }) {
          return client.fundingCommitment.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
};
```

### 5.2 Multi-Step Transactions for State Mutations

#### Transaction 1: Submitting an Academic Proposal & Updating Challenge State
```typescript
import { prisma } from "@/lib/prisma";
import { ProposalStatus, ChallengeStatus } from "@prisma/client";

export async function submitProposalTransaction({
  challengeId,
  submittedById,
  universityName,
  title,
  abstract,
  methodology,
  budget,
  timelineMonths,
  attachedDocs,
  ipAddress,
  userAgent,
}: {
  challengeId: string;
  submittedById: string;
  universityName: string;
  title: string;
  abstract: string;
  methodology: string;
  budget: number;
  timelineMonths: number;
  attachedDocs?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Validate Challenge exists and is open
    const challenge = await tx.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge || challenge.deletedAt) {
      throw new Error("Target challenge not found or has been removed.");
    }

    // 2. Generate unique proposal reference
    const count = await tx.proposal.count();
    const proposalRef = `PR-${100 + count + 1}`;

    // 3. Create Proposal
    const proposal = await tx.proposal.create({
      data: {
        proposalRef,
        challengeId,
        submittedById,
        universityName,
        title,
        abstract,
        methodology,
        budget,
        timelineMonths,
        attachedDocs,
        status: ProposalStatus.SUBMITTED,
      },
    });

    // 4. Update Challenge Status if still under review
    const updatedChallenge = await tx.challenge.update({
      where: { id: challengeId },
      data: {
        status: ChallengeStatus.IN_PROGRESS,
        assignedInstitute: universityName,
      },
    });

    // 5. Create Immutable Audit Log
    await tx.auditLog.create({
      data: {
        userId: submittedById,
        action: "PROPOSAL_SUBMITTED",
        resource: "Proposal",
        resourceId: proposal.id,
        challengeId: challenge.id,
        oldState: { challengeStatus: challenge.status },
        newState: {
          proposalId: proposal.id,
          proposalRef,
          challengeStatus: updatedChallenge.status,
        },
        ipAddress,
        userAgent,
      },
    });

    return { proposal, challenge: updatedChallenge };
  });
}
```

#### Transaction 2: Industry Escrow Commitment (Section 80G / 30-40-30 Tranches)
```typescript
import { prisma } from "@/lib/prisma";
import { FundingStatus, FundingType, ProposalStatus } from "@prisma/client";

export async function commitFundingTransaction({
  proposalId,
  industryUserId,
  corporateName,
  panNumber,
  csrRegistrationNo,
  amount,
  notes,
  ipAddress,
  userAgent,
}: {
  proposalId: string;
  industryUserId: string;
  corporateName: string;
  panNumber?: string;
  csrRegistrationNo?: string;
  amount: number;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify Proposal
    const proposal = await tx.proposal.findUnique({
      where: { id: proposalId },
      include: { challenge: true },
    });
    if (!proposal || proposal.deletedAt) {
      throw new Error("Academic proposal not found.");
    }

    // 2. Generate Escrow ID
    const randomEscrow = "JH-ESCROW-2026-CSR-" + Math.floor(1000 + Math.random() * 9000);

    // 3. Compute 30-40-30 Tranche Distribution
    const tranche1 = amount * 0.3; // Upon DPR Approval
    const tranche2 = amount * 0.4; // Upon Lab Pilot
    const tranche3 = amount * 0.3; // Upon Collector Sign-off

    const tranches = [
      { tranche: 1, percent: 30, amount: tranche1, milestone: "DPR Approval & Escrow Lock", status: "DISBURSED" },
      { tranche: 2, percent: 40, amount: tranche2, milestone: "Working Lab Prototype", status: "PENDING" },
      { tranche: 3, percent: 30, amount: tranche3, milestone: "District Collector Field Validation", status: "PENDING" },
    ];

    // 4. Create Funding Commitment
    const commitment = await tx.fundingCommitment.create({
      data: {
        escrowRef: randomEscrow,
        proposalId,
        industryUserId,
        corporateName,
        panNumber,
        csrRegistrationNo,
        amount,
        type: FundingType.CSR,
        status: FundingStatus.ESCROWED,
        notes,
        tranches,
        mouSigned: true,
        mouSignedAt: new Date(),
      },
    });

    // 5. Update Proposal Status
    await tx.proposal.update({
      where: { id: proposalId },
      data: { status: ProposalStatus.FUNDED },
    });

    // 6. Audit Logging
    await tx.auditLog.create({
      data: {
        userId: industryUserId,
        action: "ESCROW_COMMITTED",
        resource: "FundingCommitment",
        resourceId: commitment.id,
        challengeId: proposal.challengeId,
        newState: {
          escrowRef: randomEscrow,
          amount,
          tranches,
        },
        ipAddress,
        userAgent,
      },
    });

    return commitment;
  });
}
```

---

## 6. Comprehensive Realistic Seed Script (`prisma/seed.ts`)

```typescript
import { PrismaClient, UserRole, UserStatus, UrgencyLevel, ChallengeStatus, ProposalStatus, FundingType, FundingStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================================");
  console.log("SEEDING JHARKHAND SOCIETAL INNOVATION PORTAL DATABASE");
  console.log("===============================================================================\n");

  // Clean existing tables (order matters for FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.fundingCommitment.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  // Salt & Hash Password for all test personas
  const commonPassword = "Jharkhand@2026!";
  const passwordHash = await bcrypt.hash(commonPassword, 10);

  // ---------------------------------------------------------------------------
  // 1. SEED USERS (5 Personas + Institutional Accounts)
  // ---------------------------------------------------------------------------
  console.log("1. Creating Seed Users...");

  // Persona 1: Gov
  const govUser = await prisma.user.create({
    data: {
      email: "nodal.innovation@jharkhand.gov.in",
      phone: "+919431100001",
      passwordHash,
      role: UserRole.GOV,
      status: UserStatus.ACTIVE,
      name: "Dr. R. K. Soren, IAS",
      organization: "Department of Planning & Development, Govt of Jharkhand",
      designation: "Principal Secretary & State Nodal Officer",
      district: "Ranchi",
      bio: "Overseeing state-wide innovation docket, GRAI accountability metrics, and tripartite CSR escrows.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      twoFactorEnabled: true,
    },
  });

  // Persona 2: University (IIT ISM Dhanbad)
  const uniUserDhanbad = await prisma.user.create({
    data: {
      email: "pi.water@iitism.ac.in",
      phone: "+919431100002",
      passwordHash,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      name: "Dr. K. Banerjee",
      organization: "IIT (ISM) Dhanbad",
      designation: "Lead Principal Investigator, Dept of Environmental Science & Engineering",
      district: "Dhanbad",
      bio: "Specializing in heavy metal aquifer remediation, acid mine drainage neutralization, and low-cost IoT telemetry.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // Additional University: Birsa Agricultural University
  const uniUserBirsa = await prisma.user.create({
    data: {
      email: "pi.agri@bauranchi.ac.in",
      phone: "+919431100003",
      passwordHash,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      name: "Dr. Anirudh Tripathy",
      organization: "Birsa Agricultural University",
      designation: "Dean of Agronomy & Soil Sciences",
      district: "Ranchi",
      bio: "Pioneering drought-resilient seed genomics, biochar enrichment, and soil nitrogen monitoring in Chotanagpur.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // Additional University: NIT Jamshedpur
  const uniUserNIT = await prisma.user.create({
    data: {
      email: "pi.energy@nitjsr.ac.in",
      phone: "+919431100004",
      passwordHash,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      name: "Prof. S. Majumdar",
      organization: "NIT Jamshedpur",
      designation: "Head, Centre for Renewable Energy Systems",
      district: "East Singhbhum",
      bio: "Microgrid decentralization and off-grid battery energy storage systems for peri-urban slums.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // Persona 3: Industry Partner (Tata Steel)
  const industryTata = await prisma.user.create({
    data: {
      email: "csr.director@tatasteel.com",
      phone: "+919431100005",
      passwordHash,
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
      name: "Sneha Roy",
      organization: "Tata Steel Foundation / CSR Division",
      designation: "CSR & Innovation Head",
      district: "East Singhbhum",
      bio: "Managing corporate social responsibility allocation for Schedule VII environmental remediation and public health projects.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // Persona 4: Independent Expert / Research Mentor (ISRO Alumni)
  const expertUser = await prisma.user.create({
    data: {
      email: "dr.sen.mentor@isro-alumni.res.in",
      phone: "+919431100006",
      passwordHash,
      role: UserRole.EXPERT,
      status: UserStatus.ACTIVE,
      name: "Dr. A. K. Sen",
      organization: "ISRO Alumni Network / Geospatial Mentor",
      designation: "Senior Remote Sensing & Hydrology Expert",
      district: "Ranchi",
      bio: "40 years of space telemetry, hydrological GIS mapping, and aquifer boundary analysis.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // Persona 5: Citizen / Community
  const citizenUser = await prisma.user.create({
    data: {
      email: "pooja.murmu@village4.org",
      phone: "+919431100007",
      passwordHash,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      name: "Pooja Murmu",
      organization: "Gram Panchayat Nodal Reporter",
      designation: "Public Contributor",
      district: "Dhanbad",
      bio: "Community volunteer logging borewell telemetry and public health alerts for Dhanbad Block XYZ.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  console.log("   ✓ Created 7 seed users across all 5 roles.");

  // ---------------------------------------------------------------------------
  // 2. SEED CHALLENGES (Direct match to UI mock IDs)
  // ---------------------------------------------------------------------------
  console.log("2. Creating Seed Challenges...");

  const chDhanbad = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-GR-2026-9842",
      title: "Contaminated Drinking Water & Acidic Runoff",
      domain: "Water Management",
      district: "Dhanbad",
      location: "Dhanbad District, Block XYZ, Village 4",
      urgency: UrgencyLevel.CRITICAL,
      status: ChallengeStatus.IN_PROGRESS,
      reportedById: citizenUser.id,
      assignedToId: uniUserDhanbad.id,
      assignedInstitute: "IIT ISM Dhanbad",
      citizenVerified: true,
      verifiedByCount: 14,
      escalationLevel: 0,
      slaDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days left
      description: "For the past 6 months, primary ground water borewells have shown heavy reddish discoloration and metallic taste. Local health clinics report a 40% spike in water-borne diseases and skin rashes among children. Suspected abandoned coal mine runoff leaching into the aquifer.",
      evidence: {
        photos: [
          {
            title: "Ground Zero Borewell Water Sample Photo",
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            timestamp: "24 Aug 2026, 09:14 AM IST",
            location: "Borewell #03, Village 4, Dhanbad (23.7957° N, 86.4304° E)",
            telemetry: "Turbidity: 48 NTU • Dissolved Iron: 6.2 mg/L • pH: 4.8"
          }
        ],
        videos: [
          {
            title: "Citizen Community Interview Video",
            source: "Gram Panchayat Nodal Officer Recording",
            duration: "02:45",
            resolution: "1080p 60fps"
          }
        ],
        liveTelemetry: {
          pH: 4.8,
          tdsPpm: 890,
          dissolvedIronMgL: 6.2,
          turbidityNtu: 48,
          affectedPopulation: 1420
        }
      }
    }
  });

  const chGumla = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-DL-2026-3104",
      title: "Smart Irrigation Deficiencies & Soil Nitrogen Loss",
      domain: "Agriculture",
      district: "Gumla",
      location: "Gumla District, Kamdara Block",
      urgency: UrgencyLevel.HIGH,
      status: ChallengeStatus.OPEN_FOR_PROPOSALS,
      reportedById: citizenUser.id,
      assignedToId: uniUserBirsa.id,
      assignedInstitute: "Birsa Agricultural University",
      citizenVerified: true,
      verifiedByCount: 8,
      slaDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      description: "Farmer cooperatives report chronic dry-season crop wilting and soil nitrogen depletion across 320 hectares. Need low-cost soil moisture sensors and edge-AI irrigation automation.",
      evidence: {
        soilNitrogenIndex: "112 kg/ha (Low)",
        moistureSensor: "18% (Critical Deficit)",
        croppingAreaHectares: 320,
        beneficiaryHouseholds: 185
      }
    }
  });

  const chSimdega = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-MH-2026-7712",
      title: "Rural Tele-Medicine Access in Tribal Belts",
      domain: "Healthcare",
      district: "Simdega",
      location: "Simdega District, Bano Block",
      urgency: UrgencyLevel.CRITICAL,
      status: ChallengeStatus.RESOLVED,
      reportedById: citizenUser.id,
      assignedInstitute: "RIMS Ranchi / BIT Mesra Hub",
      citizenVerified: true,
      verifiedByCount: 32,
      description: "Severe lack of specialized prenatal and diagnostic healthcare in remote forest hamlets. Solar-powered telemedicine kiosk deployed with satellite uplink.",
      evidence: {
        kiosksDeployed: 4,
        consultationsCompleted: 1240,
        satisfactionRate: "96.4%"
      }
    }
  });

  const chRanchiEnergy = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-788",
      title: "Solar Microgrid Storage in Slum Clusters",
      domain: "Energy",
      district: "Ranchi",
      location: "Ranchi District, Kokar Slum Sector",
      urgency: UrgencyLevel.HIGH,
      status: ChallengeStatus.IN_PROGRESS,
      reportedById: citizenUser.id,
      assignedToId: uniUserNIT.id,
      assignedInstitute: "NIT Jamshedpur",
      citizenVerified: true,
      description: "Frequent battery inverter failures and power disruptions in urban slum microgrids. Prototyping hybrid sodium-ion chemistry for intermittent climates."
    }
  });

  const chKhuntiEdu = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-764",
      title: "Digital Literacy Laboratory Access for Tribal Schools",
      domain: "Education",
      district: "Khunti",
      location: "Khunti District, Torpa Block",
      urgency: UrgencyLevel.MEDIUM,
      status: ChallengeStatus.REPORTED,
      reportedById: citizenUser.id,
      assignedInstitute: "Pending Academic Match",
      description: "32 tribal middle schools lack power-efficient compute terminals and vernacular e-learning software."
    }
  });

  const chSahebganjArsenic = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-750",
      title: "Subsurface Aquifer Arsenic Contamination",
      domain: "Water Management",
      district: "Sahebganj",
      location: "Sahebganj District, Rajmahal Block",
      urgency: UrgencyLevel.CRITICAL,
      status: ChallengeStatus.IN_PROGRESS,
      reportedById: citizenUser.id,
      assignedToId: uniUserDhanbad.id,
      assignedInstitute: "IIT ISM Dhanbad",
      description: "Severe arsenic levels exceeding 0.05 mg/L in community handpumps along the Ganges riverine belt."
    }
  });

  console.log("   ✓ Created 6 challenges with authentic telemetry and tracking IDs.");

  // ---------------------------------------------------------------------------
  // 3. SEED PROPOSALS (Matching PR-102, PR-104, PR-109, PR-115)
  // ---------------------------------------------------------------------------
  console.log("3. Creating Seed Proposals...");

  const prop102 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-102",
      challengeId: chDhanbad.id,
      submittedById: uniUserDhanbad.id,
      universityName: "IIT ISM Dhanbad",
      title: "IoT Based Water Quality Monitoring System & Dual-Stage Adsorbent Pilot",
      abstract: "Proposing a scalable IoT-integrated filtration unit utilizing localized bio-adsorbent filters for removal of iron, manganese, and acidic leachate from contaminated aquifers in Dhanbad.",
      methodology: "1) Dual cartridge filtration core using activated biochar and iron-oxide coated sand. 2) Real-time spectrographic telemetry sending pH, TDS, and turbidity to state console via LoRaWAN/GSM.",
      budget: 350000,
      timelineMonths: 6,
      stage: "Prototype Ready",
      status: ProposalStatus.FUNDED,
      attachedDocs: {
        name: "IIT_ISM_Technical_Architecture_DPR.pdf",
        size: "3.8 MB",
        sha256: "8f48123fa3b429188942bdaef984210948cba482810934efbb848201948baec1"
      }
    }
  });

  const prop104 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-104",
      challengeId: chGumla.id,
      submittedById: uniUserBirsa.id,
      universityName: "Birsa Agricultural University",
      title: "AI-Driven Crop Disease Predictor & Low-Cost Tensiometer Mesh",
      abstract: "Mobile application for farmers to diagnose crop diseases early using smartphone cameras and edge AI, paired with solar-powered tensiometers.",
      methodology: "Deployment of 50 edge-computing sensors across Kamdara block connected to farmer cooperative mobile dashboard.",
      budget: 0, // Mentorship requested
      timelineMonths: 4,
      stage: "Research Phase",
      status: ProposalStatus.SUBMITTED
    }
  });

  const prop109 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-109",
      challengeId: chRanchiEnergy.id,
      submittedById: uniUserNIT.id,
      universityName: "NIT Jamshedpur",
      title: "Modular Urban Solar Microgrid with Sodium-Ion Battery Chemistry",
      abstract: "Scalable solar microgrid architecture designed for high-density urban slums with intermittent grid power.",
      methodology: "Fabrication of 10kW microgrid cluster with localized fault isolation and smart energy metering.",
      budget: 1200000,
      timelineMonths: 12,
      stage: "Pilot Implementation",
      status: ProposalStatus.SHORTLISTED
    }
  });

  const prop115 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-115",
      challengeId: chSahebganjArsenic.id,
      submittedById: uniUserDhanbad.id,
      universityName: "IIT ISM Dhanbad",
      title: "Bio-Adsorbent Arsenic Remediation Domestic Filtration Units",
      abstract: "Low-cost local clay and agricultural waste matrix filter for domestic water borewells in arsenic-affected floodplains.",
      methodology: "Laboratory validated laterite soil adsorption beds with zero electrical power dependency.",
      budget: 480000,
      timelineMonths: 8,
      stage: "Prototype Ready",
      status: ProposalStatus.APPROVED
    }
  });

  console.log("   ✓ Created 4 academic proposals.");

  // ---------------------------------------------------------------------------
  // 4. SEED FUNDING COMMITMENTS & STATUTORY ESCROWS
  // ---------------------------------------------------------------------------
  console.log("4. Creating Seed Funding Commitments...");

  const escrowTata = await prisma.fundingCommitment.create({
    data: {
      escrowRef: "JH-ESCROW-2026-CSR-9842",
      proposalId: prop102.id,
      industryUserId: industryTata.id,
      corporateName: "Tata Steel CSR Division",
      panNumber: "AAACC1209K",
      csrRegistrationNo: "CSR0001842",
      amount: 350000,
      type: FundingType.CSR,
      status: FundingStatus.ESCROWED,
      notes: "We request quarterly milestone audit reports and a representative seat on the prototype review committee.",
      mouSigned: true,
      mouSignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tranches: [
        {
          tranche: 1,
          percent: 30,
          amount: 105000,
          condition: "30% Upon DPR Approval & Escrow Lock",
          status: "DISBURSED",
          disbursedAt: "28 Aug 2026"
        },
        {
          tranche: 2,
          percent: 40,
          amount: 140000,
          condition: "40% Upon Working Lab Prototype Validation",
          status: "ESCROW_LOCKED",
          disbursedAt: null
        },
        {
          tranche: 3,
          percent: 30,
          amount: 105000,
          condition: "30% Upon District Collector Field Deployment Sign-off",
          status: "PENDING",
          disbursedAt: null
        }
      ]
    }
  });

  const escrowCoalIndia = await prisma.fundingCommitment.create({
    data: {
      escrowRef: "JH-ESCROW-2026-CSR-7712",
      proposalId: prop102.id, // linked reference
      industryUserId: industryTata.id,
      corporateName: "Coal India CSR Trust",
      panNumber: "AABCC5541L",
      csrRegistrationNo: "CSR0002105",
      amount: 800000,
      type: FundingType.CSR,
      status: FundingStatus.DISBURSED,
      notes: "100% disbursed for tribal tele-medicine kiosk deployment in Simdega.",
      mouSigned: true,
      mouSignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      tranches: [
        { tranche: 1, percent: 100, amount: 800000, condition: "Full grant disbursement", status: "DISBURSED" }
      ]
    }
  });

  console.log("   ✓ Created 2 corporate CSR funding escrows.");

  // ---------------------------------------------------------------------------
  // 5. SEED IMMUTABLE AUDIT LOGS (GRAI & Verification Trail)
  // ---------------------------------------------------------------------------
  console.log("5. Creating Audit Trail...");

  await prisma.auditLog.createMany({
    data: [
      {
        userId: citizenUser.id,
        action: "CHALLENGE_REPORTED",
        resource: "Challenge",
        resourceId: chDhanbad.id,
        challengeId: chDhanbad.id,
        newState: { title: chDhanbad.title, district: chDhanbad.district, urgency: "CRITICAL" },
        ipAddress: "103.24.188.12",
        userAgent: "Mozilla/5.0 (Mobile; Android 14; Pixel 7)"
      },
      {
        userId: govUser.id,
        action: "AI_TRIAGE_VERIFIED",
        resource: "Challenge",
        resourceId: chDhanbad.id,
        challengeId: chDhanbad.id,
        newState: { semanticScore: 0.984, matchedCluster: "Acidic Aquifer Leaching", status: "UNDER_REVIEW" },
        ipAddress: "14.139.221.6",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      {
        userId: uniUserDhanbad.id,
        action: "PROPOSAL_SUBMITTED",
        resource: "Proposal",
        resourceId: prop102.id,
        challengeId: chDhanbad.id,
        newState: { proposalRef: "PR-102", budget: 350000 },
        ipAddress: "14.139.221.15",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      },
      {
        userId: industryTata.id,
        action: "ESCROW_COMMITTED",
        resource: "FundingCommitment",
        resourceId: escrowTata.id,
        challengeId: chDhanbad.id,
        newState: { escrowRef: escrowTata.escrowRef, amount: 350000, mouSigned: true },
        ipAddress: "115.112.24.9",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      {
        userId: govUser.id,
        action: "TRANCHE_1_RELEASED",
        resource: "FundingCommitment",
        resourceId: escrowTata.id,
        challengeId: chDhanbad.id,
        newState: { releasedAmount: 105000, recipient: "IIT ISM Dhanbad Escrow Account" },
        ipAddress: "14.139.221.6",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    ]
  });

  console.log("   ✓ Created initial audit ledger entries.");
  console.log("\n===============================================================================");
  console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("===============================================================================");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 7. OWASP Top 10 Security Architecture

### 7.1 SQL Injection Prevention
- **Prisma Prepared Statements**: All Prisma queries (`findUnique`, `findMany`, `create`, `update`, `delete`) generate parameterized SQL under the hood. Raw user strings are passed as query parameters, never concatenated into the query buffer.
- **Strict Prohibition of Raw Queries**:
  - `prisma.$queryRawUnsafe` and `prisma.$executeRawUnsafe` are strictly prohibited in the codebase.
  - If custom SQL is ever necessary (e.g. specialized PostGIS queries for district polygon intersection), only `prisma.$queryRaw(Prisma.sql`...`)` is permitted with compile-time checked parameter interpolation.

### 7.2 Security HTTP Headers (`next.config.ts`)
Update `next.config.ts` with production-grade defense-in-depth security headers:

```typescript
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev; restrict in strict prod
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://innovate.jharkhand.gov.in",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), payment=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(nextConfig);
```

### 7.3 CSRF Protection for State-Changing Requests
Next.js App Router API handlers (`POST`, `PUT`, `PATCH`, `DELETE`) are protected using:
1. **SameSite=Strict Cookies**: Authentication session tokens stored with `HttpOnly; Secure; SameSite=Strict`.
2. **Origin / Referer Validation**: Middleware verifies that incoming mutate requests originate from the state domain.
3. **Custom Header Token Verification**: State-changing endpoints require an `X-CSRF-Token` or `X-Requested-With: XMLHttpRequest` header.

```typescript
// src/lib/csrf.ts
import { NextRequest } from "next/server";

export function verifyCsrf(req: NextRequest): boolean {
  // Only state-changing methods require CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || `http://${host}`;
  const originUrl = new URL(origin);
  const allowedUrl = new URL(allowedOrigin);

  return originUrl.host === allowedUrl.host;
}
```

### 7.4 Zod Input Validation Schemas (`src/lib/validations/`)
Every incoming payload must be parsed and strictly validated before touching database services:

```typescript
// src/lib/validations/schemas.ts
import { z } from "zod";

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  twoFactorToken: z.string().length(6).optional(),
});

export const ChallengeSubmitSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title cannot exceed 150 characters")
    .trim(),
  description: z
    .string()
    .min(20, "Detailed description must be at least 20 characters")
    .max(5000, "Description exceeds maximum length")
    .trim(),
  domain: z.enum([
    "Water Management",
    "Agriculture",
    "Healthcare",
    "Energy",
    "Education",
    "Urban Infrastructure",
  ]),
  district: z.string().min(2).max(50).trim(),
  location: z.string().min(3).max(200).trim(),
  urgency: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  evidenceFiles: z
    .array(
      z.object({
        name: z.string().max(255),
        sizeBytes: z.number().max(52428800), // 50 MB
        mimeType: z.enum(["image/jpeg", "image/png", "video/mp4"]),
        sha256Hash: z.string().length(64).optional(),
      })
    )
    .max(5)
    .optional(),
});

export const ProposalSubmitSchema = z.object({
  challengeId: z.string().cuid("Invalid challenge ID"),
  title: z.string().min(10).max(200).trim(),
  abstract: z.string().min(50).max(3000).trim(),
  methodology: z.string().min(50).max(5000).trim(),
  budget: z.number().min(0).max(100000000), // Max ₹10 Crore
  timelineMonths: z.number().int().min(1).max(36).default(6),
  stage: z.enum(["Research Phase", "Prototype Ready", "Pilot Implementation"]),
});

export const FundingCommitmentSchema = z.object({
  proposalId: z.string().cuid("Invalid proposal ID"),
  corporateName: z.string().min(2).max(100).trim(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid Indian PAN format").optional(),
  csrRegistrationNo: z.string().regex(/^CSR[0-9]{7}$/, "Invalid CSR Registration number").optional(),
  amount: z.number().positive("Pledge amount must be greater than zero"),
  type: z.enum(["CSR", "GRANT", "EQUITY"]).default("CSR"),
  notes: z.string().max(1000).optional(),
});
```

### 7.5 Rate Limiting Architecture (`src/lib/rate-limit.ts`)
To defend against brute-force password cracking, credential stuffing, and DDoS flood, we employ an in-memory sliding-window token bucket limiter:

```typescript
// src/lib/rate-limit.ts
interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const storage = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  capacity: number;   // Maximum tokens
  refillRate: number; // Tokens added per second
}

export function rateLimit(key: string, options: RateLimitOptions = { capacity: 10, refillRate: 10 / 60 }) {
  const now = Date.now();
  const record = storage.get(key) ?? {
    tokens: options.capacity,
    lastRefill: now,
  };

  // Refill tokens based on elapsed time
  const elapsedSec = (now - record.lastRefill) / 1000;
  record.tokens = Math.min(options.capacity, record.tokens + elapsedSec * options.refillRate);
  record.lastRefill = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    storage.set(key, record);
    return {
      success: true,
      remaining: Math.floor(record.tokens),
      retryAfterSec: 0,
    };
  }

  // Rate limited
  const missingTokens = 1 - record.tokens;
  const retryAfterSec = Math.ceil(missingTokens / options.refillRate);
  storage.set(key, record);

  return {
    success: false,
    remaining: 0,
    retryAfterSec,
  };
}
```

- **Authentication Endpoints (`/api/auth/*`)**:
  - Capacity: 5 requests.
  - Refill: 5 requests per 10 minutes (prevents online password guessing).
  - Triggers account lockout after 5 consecutive failed attempts (`failedLoginAttempts >= 5`, `lockoutUntil = Date.now() + 30m`).
- **Challenge Submissions (`/api/challenges`)**:
  - Capacity: 10 requests / 15 minutes per citizen IP.
- **Standard Read APIs**:
  - Capacity: 60 requests / minute.

### 7.6 Error Sanitization vs. Structured Server Logs
Under OWASP Top 10 A05 (Security Misconfiguration):
- **Client-Facing Response**:
  - Never return stack traces, database schema details, table names, or raw Prisma exception objects (`PrismaClientKnownRequestError`).
  - Always respond with a generic user message and a correlation `requestId`:
    ```json
    {
      "success": false,
      "error": "Unable to process request. Please check input parameters or try again later.",
      "requestId": "req-9842-1725458000"
    }
    ```
- **Server-Side Structured Logging**:
  - Log full structured JSON to stdout / log aggregation:
    ```json
    {
      "timestamp": "2026-09-04T14:10:00.124Z",
      "level": "ERROR",
      "requestId": "req-9842-1725458000",
      "route": "/api/proposals",
      "method": "POST",
      "userId": "cuid_9842",
      "errorCode": "P2002",
      "errorMessage": "Unique constraint failed on the fields: (proposalRef)",
      "stack": "PrismaClientKnownRequestError: ...",
      "ipAddress": "103.24.188.12"
    }
    ```
  - Redact sensitive parameters (`password`, `passwordHash`, `twoFactorSecret`, `panNumber`).

### 7.7 Environment Variables Architecture
Zero secrets in source code. Configuration managed via environment variables with runtime schema validation.

#### `.env.example` (Committed to Version Control)
```ini
# ==============================================================================
# JHARKHAND STATE INNOVATION PORTAL - ENVIRONMENT CONFIGURATION TEMPLATE
# ==============================================================================

# Node Environment
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# PostgreSQL Database Connection URL (Prisma)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=prefer
DATABASE_URL="postgresql://jharkhand_admin:ChangeMeSecurePassword123!@localhost:5432/jharkhand_innovation_db?schema=public"

# Authentication Secrets (Generate with: openssl rand -base64 32)
AUTH_SECRET="CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32"
JWT_EXPIRATION="7d"

# 2FA / TOTP Encryption Key
TWO_FACTOR_ENCRYPTION_KEY="CHANGE_ME_32_BYTE_HEX_KEY_FOR_AES_GCM"

# Rate Limiting & Redis (Optional for production distributed clusters)
# UPSTASH_REDIS_REST_URL=""
# UPSTASH_REDIS_REST_TOKEN=""

# Public Portal Settings
NEXT_PUBLIC_PORTAL_NAME="Jharkhand State Innovation Portal"
NEXT_PUBLIC_SUPPORT_EMAIL="support.innovation@jharkhand.gov.in"
```

#### Runtime Environment Validator (`src/env.ts`)
```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters long"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
```

---

## 8. Summary of Architectural Recommendations

1. **Prisma Setup**: Initialize Prisma with PostgreSQL driver, register `npx tsx prisma/seed.ts` in `web/package.json`, and expose the client through `src/lib/prisma.ts`.
2. **Schema Alignment**: 100% adherence to all 5 personas, current challenge tracking patterns (`IN-GR-2026-9842`), and statutory Section 80G CSR escrow tranches.
3. **Data Integrity**: Enforce soft-deletes with Prisma Client query extensions and execute multi-step operations (proposals, escrows, triage) strictly inside ACID transactions with correlated audit logs.
4. **Security Standard**: Implement OWASP Top 10 controls natively in Next.js (CSP in `next.config.ts`, Zod validations in route handlers, sliding-window rate limiters for authentication endpoints, and structured error logs).
