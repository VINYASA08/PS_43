# Context for Orchestrator Round 6

## Working Directory
`a:/Development/Antigravity/SIH26043/.agents/orchestrator_r6`

## Original Request Location
`a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (specifically header `## 2026-09-08T18:38:41Z`)

## Task Overview
Implement a complete architectural pivot to replace the Sarpanch role with a District Nodal Officer routing system on the Next.js Web backend.
1. Prisma schema updates: Remove Sarpanch verification data. Add fields necessary for Nodal Officer triage (`pending`, `rejected`, `diverted_to_gov`, `routed_to_academia`).
2. Web Nodal Dashboard: Next.js UI allowing the Nodal Officer to view pending citizen submissions. Provide action buttons to:
   - Reject (requires reason input).
   - Divert to Gov Body (select from a list like PWD, Municipal Corp).
   - Route to Academia.
3. AI Match & Claim Workflow:
   - When routed to Academia, the backend must simulate matching 3 universities (logging mock emails to console).
   - Provide a basic Next.js API or UI for those universities to "Claim" the challenge.
   - The system must enforce a race condition: the first university to claim the challenge successfully locks it, preventing the other two from claiming it.
4. Acceptance Criteria & Automated Verification:
   - Automated test script (or agent judge) simulating Nodal Officer routing problem to Academia.
   - Test simulating University A calling claim endpoint -> assert successful claim.
   - Test immediately simulating University B calling claim endpoint for same problem -> assert rejected/locked out.
   - Next.js web application must build successfully (`npm run build`) with zero type errors.
