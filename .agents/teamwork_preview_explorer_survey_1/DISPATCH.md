# Dispatch for Explorer Survey 1 (Database & Schema)

## 2026-09-08T18:40:00Z
Investigate the database, Prisma schema, migrations, seed scripts, and codebase references to Sarpanch.
Detail:
1. All tables, enums, fields relating to Sarpanch, citizen submissions, challenges, and universities.
2. The exact Prisma schema changes needed to remove Sarpanch verification data and add District Nodal Officer triage fields (states: pending, rejected, diverted_to_gov, routed_to_academia, rejection reason, diverted target, matched universities, claimedBy university, claimedAt, etc.).
3. How migrations/db push and seed scripts currently work.
4. Any potential breaking changes or foreign keys.

Write your comprehensive findings and recommendations to:
a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_explorer_survey_1/handoff.md
Once done, send a message back to parent with a concise summary and reference to your handoff file.
