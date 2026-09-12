# Task Assignment: Challenger 1 (M1 Empirical Stress Test & Correctness)

## Identity
- Archetype: teamwork_preview_challenger
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_1
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1/handoff.md`

## Mission
Empirically stress-test the backend Handover Token Generation and Claim APIs.
Write an adversarial test script targeting:
1. Replay attacks: Trying to claim the same token twice concurrently or sequentially.
2. Expired tokens: Fast-forwarding or setting token expiry in the past and testing claim rejection.
3. Tampered / malformed tokens: Testing fuzzing/invalid tokens.
4. Preserved entities: Asserting that user data, existing challenges, and proposals remain intact and linked to the same user ID after claim.
5. Record results and verdict (`APPROVE` or `REJECT`) in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_1/handoff.md`.
6. Communicate back to parent orchestrator via send_message.
