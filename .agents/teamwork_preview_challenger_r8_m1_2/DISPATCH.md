# Task Assignment: Challenger 2 (M1 Authentication & Security Verification)

## Identity
- Archetype: teamwork_preview_challenger
- Working Directory: a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_2
- Parent: orchestrator_r8 (Conv ID: 573b8730-6748-4db4-89af-0d71738c07b5)

## Mandatory Context Files
You MUST read:
- `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md` (under `## 2026-09-09T09:48:37Z`)
- `a:/Development/Antigravity/SIH26043/PROJECT.md`
- `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_worker_r8_m1/handoff.md`

## Mission
Empirically stress-test the authentication security of the Handover Claim flow.
Write an adversarial test script targeting:
1. Subsequent login: Assert that User B can subsequently log in using User B's new credentials and gain access to the account.
2. Old credentials revocation: Assert that the predecessor's old password CANNOT log in anymore.
3. 2FA state: Assert that predecessor's 2FA secret is neutralized so the successor is not locked out by old TOTP tokens.
4. Session cookies: Assert that session cookie issued upon claim is valid and authenticated.
5. Record results and verdict (`APPROVE` or `REJECT`) in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_2/handoff.md`.
6. Communicate back to parent orchestrator via send_message.


## 2026-09-09T10:32:10Z
You are Challenger 2 for Milestone M1 (Round 8).
Your working directory is `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_2`.
Read your task instructions in `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_2/DISPATCH.md` and `a:/Development/Antigravity/SIH26043/.agents/ORIGINAL_REQUEST.md`.
Stress-test authentication transfer, subsequent login with new credentials, old password rejection, and 2FA neutralization. Write your verdict (APPROVE / REJECT) to `a:/Development/Antigravity/SIH26043/.agents/teamwork_preview_challenger_r8_m1_2/handoff.md`, and report back via send_message.
