import { PrismaClient } from "@prisma/client";
import fs from "fs";

// On Vercel, SQLite must live in /tmp (the only writable directory).
// We must set DATABASE_URL BEFORE PrismaClient is instantiated.
if (process.env.VERCEL) {
  process.env.DATABASE_URL = "file:/tmp/dev.db";
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CITIZEN',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "tier" TEXT DEFAULT 'DISTRICT',
  "name" TEXT NOT NULL,
  "organization" TEXT,
  "designation" TEXT,
  "district" TEXT,
  "bio" TEXT,
  "profileUrl" TEXT,
  "emailVerified" DATETIME,
  "phoneVerified" DATETIME,
  "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
  "twoFactorSecret" TEXT,
  "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockoutUntil" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status");
CREATE INDEX IF NOT EXISTS "User_district_idx" ON "User"("district");
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

CREATE TABLE IF NOT EXISTS "Challenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "publicTrackingId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'REPORTED',
  "track" TEXT NOT NULL DEFAULT 'TRACK_A_INNOVATION',
  "trackRouting" TEXT,
  "triageReasoning" TEXT,
  "triageConfidence" REAL,
  "targetEntityLevel" TEXT,
  "reportedById" TEXT NOT NULL,
  "assignedToId" TEXT,
  "assignedInstitute" TEXT,
  "evidence" TEXT,
  "citizenVerified" BOOLEAN NOT NULL DEFAULT false,
  "duplicateOfId" TEXT,
  "verifiedByCount" INTEGER NOT NULL DEFAULT 0,
  "escalationLevel" INTEGER NOT NULL DEFAULT 0,
  "slaDeadline" DATETIME,
  "aiConfidence" REAL,
  "aiReasoning" TEXT,
  "nodalStatus" TEXT NOT NULL DEFAULT 'pending',
  "rejectionReason" TEXT,
  "divertedTarget" TEXT,
  "divertedAt" DATETIME,
  "matchedUniversities" TEXT,
  "claimedById" TEXT,
  "claimedInstitute" TEXT,
  "claimedAt" DATETIME,
  "nodalOfficerId" TEXT,
  "nodalReviewedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME,
  CONSTRAINT "Challenge_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Challenge_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Challenge_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Challenge" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Challenge_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Challenge_nodalOfficerId_fkey" FOREIGN KEY ("nodalOfficerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Challenge_publicTrackingId_key" ON "Challenge"("publicTrackingId");
CREATE INDEX IF NOT EXISTS "Challenge_status_domain_idx" ON "Challenge"("status", "domain");
CREATE INDEX IF NOT EXISTS "Challenge_district_urgency_idx" ON "Challenge"("district", "urgency");
CREATE INDEX IF NOT EXISTS "Challenge_nodalStatus_idx" ON "Challenge"("nodalStatus");
CREATE INDEX IF NOT EXISTS "Challenge_deletedAt_idx" ON "Challenge"("deletedAt");

CREATE TABLE IF NOT EXISTS "Proposal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "proposalRef" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "submittedById" TEXT NOT NULL,
  "universityName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "abstract" TEXT NOT NULL,
  "methodology" TEXT NOT NULL,
  "budget" REAL NOT NULL DEFAULT 0.0,
  "timelineMonths" INTEGER NOT NULL DEFAULT 6,
  "stage" TEXT NOT NULL DEFAULT 'Prototype Ready',
  "attachedDocs" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "matchedIndustries" TEXT,
  "claimedIndustryId" TEXT,
  "claimedIndustryName" TEXT,
  "industryClaimStatus" TEXT NOT NULL DEFAULT 'OPEN',
  "industryClaimedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME,
  CONSTRAINT "Proposal_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Proposal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Proposal_proposalRef_key" ON "Proposal"("proposalRef");
CREATE INDEX IF NOT EXISTS "Proposal_challengeId_status_idx" ON "Proposal"("challengeId", "status");
CREATE INDEX IF NOT EXISTS "Proposal_deletedAt_idx" ON "Proposal"("deletedAt");

CREATE TABLE IF NOT EXISTS "FundingCommitment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "escrowRef" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "industryUserId" TEXT NOT NULL,
  "corporateName" TEXT NOT NULL,
  "panNumber" TEXT,
  "csrRegistrationNo" TEXT,
  "amount" REAL NOT NULL DEFAULT 0.0,
  "type" TEXT NOT NULL DEFAULT 'CSR',
  "status" TEXT NOT NULL DEFAULT 'PLEDGED',
  "notes" TEXT,
  "tranches" TEXT,
  "mouSigned" BOOLEAN NOT NULL DEFAULT false,
  "mouSignedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME,
  CONSTRAINT "FundingCommitment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FundingCommitment_industryUserId_fkey" FOREIGN KEY ("industryUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "FundingCommitment_escrowRef_key" ON "FundingCommitment"("escrowRef");
CREATE INDEX IF NOT EXISTS "FundingCommitment_deletedAt_idx" ON "FundingCommitment"("deletedAt");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "challengeId" TEXT,
  "oldState" TEXT,
  "newState" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME,
  CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ChatMessage_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MicroTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "skills" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "challengeId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "assignedToId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" DATETIME,
  CONSTRAINT "MicroTask_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MicroTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MicroTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "HandoverToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "successorEmail" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "usedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HandoverToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "HandoverToken_token_key" ON "HandoverToken"("token");
`;

let dbInitialized = false;

async function ensureDb(client: any) {
  if (!process.env.VERCEL || dbInitialized) return;
  if (!fs.existsSync("/tmp/dev.db")) {
    const statements = SCHEMA_SQL.split(";").filter((s) => s.trim());
    for (const stmt of statements) {
      try {
        await client.$executeRawUnsafe(stmt + ";");
      } catch {
        // Table/index already exists — safe to ignore
      }
    }
  }
  dbInitialized = true;
}

const prismaClientSingleton = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      user: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.user.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.user.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      challenge: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.challenge.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.challenge.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      proposal: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.proposal.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.proposal.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      fundingCommitment: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.fundingCommitment.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.fundingCommitment.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
  dbReady: boolean;
};

const prismaInstance = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

// Ensure DB tables exist on Vercel cold start (runs once)
if (process.env.VERCEL && !globalForPrisma.dbReady) {
  // Use the base PrismaClient for raw SQL (extensions don't support $executeRawUnsafe directly)
  const rawClient = new PrismaClient();
  ensureDb(rawClient).then(() => {
    globalForPrisma.dbReady = true;
    rawClient.$disconnect();
  }).catch((e) => console.error("DB init error:", e));
}

export const prisma = prismaInstance;
export default prisma;
