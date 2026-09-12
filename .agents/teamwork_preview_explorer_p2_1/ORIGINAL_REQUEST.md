## 2026-09-04T14:08:05Z

You are Explorer 1 investigating the Database Architecture & Security Infrastructure for the Jharkhand Societal Innovation Portal (web app at `a:\Development\Antigravity\SIH26043\web`).
Your working directory is: `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1`

Mission & Objectives:
1. Examine `a:\Development\Antigravity\SIH26043\web` (package.json, next.config.ts, tsconfig.json, existing dependencies, database setup options).
2. Determine how PostgreSQL + Prisma ORM will be integrated (check Prisma packages, PostgreSQL database connection string configuration in .env and .env.example, verify migration and seeding capabilities).
3. Design the full production Prisma schema (`prisma/schema.prisma`):
   - Users: id, email/phone, passwordHash, role (enum: gov, university, industry, citizen, expert), status (enum: active, pending, locked, suspended), profile fields (name, organization, designation, district), emailVerified, phoneVerified, twoFactorEnabled, twoFactorSecret, failedLoginAttempts, lockoutUntil, createdAt, updatedAt, deletedAt (soft delete).
   - Challenges: id, title, description, domain, district, location, urgency, status (enum: reported, citizen_verified, under_review, open_for_proposals, in_progress, resolved, closed), reportedBy (FK to Users), assignedTo, evidence (json or string array), citizenVerified, escalationLevel, slaDeadline, createdAt, updatedAt, deletedAt.
   - Proposals: id, challengeId (FK), submittedBy (FK to Users), universityId, title, abstract, methodology, budget, status (enum: draft, submitted, under_review, shortlisted, approved, rejected, funded), createdAt, updatedAt.
   - FundingCommitments: id, proposalId (FK), industryUserId (FK to Users), amount, type (enum: CSR, grant, equity), status (enum: pledged, escrowed, disbursed, completed), createdAt, updatedAt.
   - AuditLogs: id, userId (FK to Users, nullable), action, resource, resourceId, ipAddress, userAgent, createdAt.
4. Design soft-delete mechanism (Prisma middleware / extensions / query helpers) and database transactions for multi-step mutations (e.g. submitting proposals, funding, status transitions with audit logging).
5. Plan a comprehensive, realistic seed script (`prisma/seed.ts`) that populates real data matching all existing mock data in the portal (matching current challenge names, districts, metrics, proposals, funding commitments, and test users for all 5 personas).
6. Plan OWASP Top 10 security hardening:
   - SQL injection prevention (pure Prisma parameterized queries).
   - Content-Security-Policy (CSP) headers, X-Frame-Options: DENY, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
   - CSRF protection for state-changing requests.
   - Zod input validation schemas for all incoming API payloads.
   - Rate limiting (e.g., in-memory or token bucket rate-limiter for auth and critical endpoints, max 10 req/min).
   - Sanitized generic user error responses vs structured server logs.
   - Environment variables layout (.env and .env.example with placeholders, 0 hardcoded secrets in source files).

Write your detailed findings, schema code, seed plan, and security architecture to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\analysis.md` and your summary to `a:\Development\Antigravity\SIH26043\.agents\teamwork_preview_explorer_p2_1\handoff.md`.
Remember: You are a read-only exploration agent. Do NOT modify source code files. Deliver your handoff and communicate completion.
