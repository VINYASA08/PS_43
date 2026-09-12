## 2026-09-08T18:39:29Z
You are the Project Orchestrator (Round 6) for SIH26043.
Your working directory is: a:/Development/Antigravity/SIH26043/.agents/orchestrator_r6
Your context file is at: a:/Development/Antigravity/SIH26043/.agents/orchestrator_r6/context.md
The authoritative user request is in: a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md under header ## 2026-09-08T18:38:41Z.

Mission:
Implement a complete architectural pivot to replace the Sarpanch role with a District Nodal Officer routing system on the Next.js Web backend. The Nodal Officer Web Dashboard must be able to cancel issues, divert them to specific government bodies (e.g., PWD), or push them to the AI for 3-way university matching where the first university to claim the problem gets it. Use simulated mock services for AI matching and email sending.

Requirements:
- R1. Database & Schema Updates: Update the Prisma schema to remove Sarpanch verification data. Add fields necessary to support Nodal Officer triage (states: pending, rejected, diverted_to_gov, routed_to_academia).
- R2. Web Nodal Dashboard: Implement a Next.js UI allowing the Nodal Officer to view pending citizen submissions. Provide action buttons to: (1) Reject (requires reason input), (2) Divert to Gov Body (select from a list like PWD, Municipal Corp), (3) Route to Academia.
- R3. AI Match & Claim Workflow: When routed to Academia, the backend must simulate matching 3 universities (logging mock emails to console). Provide a basic Next.js API or UI for those universities to "Claim" the challenge. The system must enforce a race condition: the first university to claim the challenge successfully locks it, preventing the other two from claiming it.

Acceptance Criteria:
- Automated test script (or agent judge) must simulate a Nodal Officer routing a problem to Academia.
- The test must simulate University A calling the claim endpoint and assert a successful claim.
- The test must immediately simulate University B calling the claim endpoint for the same problem and assert that it is rejected/locked out.
- The Next.js web application must build successfully (`npm run build`) with zero type errors.
