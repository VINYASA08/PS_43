# Execution Plan: Near-Production Grade Transformation of Jharkhand Societal Innovation Portal

## Objective
Transform the existing Next.js 16 frontend prototype at `a:\Development\Antigravity\SIH26043\web` into a near-production-grade application with:
1. Tiered Authentication System (Citizens OTP, University .ac.in + email OTP, Industry + admin approval, Gov .gov.in/.nic.in + TOTP 2FA, bcrypt/argon2 hashing, HttpOnly secure cookies, 5-attempt account lockout, rate limiting).
2. PostgreSQL Database with Prisma ORM (Users, Challenges, Proposals, FundingCommitments, AuditLogs, soft deletes, transactions, migrations, seed script with realistic data matching current mock data).
3. Role-Based Access Control (backend-enforced middleware on API routes, 401/403, audit logging of authorization failures).
4. OWASP Top 10 Security Hardening (SQL injection prevention via Prisma, XSS/CSP, CSRF tokens on state-changing requests, X-Frame-Options/clickjacking, Zod input validation on frontend & backend, security headers, generic user error messages + structured server logs, .env and .env.example with no hardcoded secrets).
5. Frontend Role-Based Routing & UX (role-based redirects, show/hide UI, protected route guards, expired token handling, network failure & empty states, skeleton loading screens).
6. Replace all mock data with database-driven data across all pages while preserving all current UI pages and aesthetic.
7. Verification: `npm run build` completes with 0 TypeScript errors, `npx prisma migrate dev`, `npx prisma db seed`, audit logging, and no secrets in source files.

## Milestones & Work Items
1. **Milestone 1: Architectural Exploration & Blueprinting (3 Explorers)**
   - **Explorer 1**: Database Architecture & Security Infrastructure
     - Database environment analysis, Prisma schema design (Users, Challenges, Proposals, FundingCommitments, AuditLogs, soft deletes, relations, indexes).
     - Migrations, seeding strategy matching existing mock data.
     - OWASP Top 10 security specification (headers, CSP, CSRF, Zod validation, rate limiting, .env/.env.example).
   - **Explorer 2**: Tiered Authentication & RBAC Middleware
     - 4-tier auth specifications (Citizen SMS/WhatsApp OTP, University .ac.in + email OTP, Industry corporate + Gov approval, Gov .gov.in/.nic.in + TOTP 2FA).
     - Password hashing, session cookies (HttpOnly, Secure, SameSite), account lockout, rate limiting.
     - Backend RBAC middleware enforcing authentication, role check, resource ownership, 401/403 responses, and audit logging.
   - **Explorer 3**: Frontend Data Integration, Route Guards & UX
     - Page-by-page mapping of all 15 routes to database-driven API routes.
     - Frontend auth state management (Zustand/Context), role-based route guards and redirects.
     - UX enhancements: skeleton loading states, empty data states, error handling boundaries, offline/network failure UI.

2. **Milestone 2: Implementation (Worker Phase)**
   - Package installation (prisma, @prisma/client, bcryptjs/argon2, zod, otplib/speakeasy, etc.).
   - Prisma schema setup, database migration, and comprehensive seed script (`prisma/seed.ts`).
   - Security infrastructure (headers, CSP, CSRF, rate-limiter, Zod schemas, error sanitizers).
   - Auth endpoints (`/api/auth/...`) with 4-tier authentication, lockout, and sessions.
   - RBAC middleware protecting all API endpoints with audit logging.
   - Database API routes for challenges, proposals, funding, users, analytics, audit logs, intake, etc.
   - Frontend integration: hook all 15 pages to live API routes, implement role-based guards, skeleton loaders, and error states.
   - Verify `npm run build` passes with 0 TS errors, `npx prisma migrate dev` and `npx prisma db seed` succeed.

3. **Milestone 3: Independent Review & Adversarial Stress Testing**
   - **Reviewer 1**: Backend, Database & Security Review (Prisma schema, migrations, transactions, soft delete, OWASP Top 10, no hardcoded secrets, rate limiting).
   - **Reviewer 2**: Auth, RBAC & Frontend UX Review (4-tier auth, session cookies, route guards, mock data replacement, skeleton loaders, error states).
   - **Challenger 1**: Empirical Auth & RBAC Adversarial Testing (simulate attacks, unauthorized role access, account lockout, CSRF bypass attempts).
   - **Challenger 2**: Empirical Database, API & Edge-Case Testing (soft delete verification, migration validity, seed execution, build pass, network edge cases).

4. **Milestone 4: Forensic Integrity Audit & Acceptance Verification**
   - **Forensic Auditor**: Comprehensive integrity verification against cheating, hardcoding, dummy facades, and mock bypasses. Confirm clean verdict.
   - Final orchestrator synthesis, handoff, and victory report.
