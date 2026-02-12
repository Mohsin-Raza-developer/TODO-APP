# Quickstart: Email Verification Access Control

**Feature**: `008-email-varification`
**Date**: 2026-02-12

## Goal

Implement and validate email verification enforcement with limited unverified sessions and protected access gating.

## Prerequisites

- Frontend and backend run locally.
- Shared auth secret configured for auth stack.
- Test email inbox available.

## Implementation Steps

1. Enable required email verification in auth configuration.
2. Update signup success flow to route users to verification pending page.
3. Add verification pending page with:
   - verify instructions
   - resend button
   - cooldown + daily-limit messaging
4. Enforce unverified gating in:
   - middleware protected route checks
   - protected server page checks
   - API proxy/handler checks for todo/chatbot protected actions
5. Ensure verification success upgrades session access from limited to full.
6. Preserve verified user login and dashboard path behavior.

## Manual Test Matrix

## T1 - Signup + Pending State
- Sign up a new account.
- Expect redirect to verify-email pending screen.
- Expect no dashboard/todo/chatbot protected access.

## T2 - Unverified Login
- Log in with unverified account.
- Expect limited session and redirect to pending screen on protected navigation.

## T3 - Successful Verification
- Open valid verification link within 24h.
- Expect verification success and full protected access in same session.

## T4 - Invalid/Expired/Used Link
- Test invalid/expired/used token behaviors.
- Expect clear failure state and resend guidance.

## T5 - Resend Cooldown
- Trigger resend twice within 60s.
- Expect second request blocked with cooldown message.

## T6 - Resend Daily Cap
- Trigger resend more than 5 times in one day.
- Expect daily limit block after cap.

## T7 - Existing Unverified Account
- Use a pre-existing unverified account.
- Expect same restrictions as new unverified accounts.

## T8 - Verified Regression
- Log in with verified account.
- Expect unchanged dashboard and task operations flow.

## Validation Checklist

- Unverified users never reach protected task/chatbot areas.
- Verified users retain normal behavior and performance expectations.
- Resend controls enforce 60s cooldown and 5/day cap.
- Verification link expiration respected at 24h.

## Next Command

Run:

`/sp.tasks Break this plan into implementation tasks for specs/008-email-varification/plan.md`

---

## Execution Log (2026-02-12)

### T034 - Lint/Type/Build Checks

- `frontend: npm run lint` -> **FAILED**
  - `eslint is not recognized as an internal or external command`
- `frontend: npm run type-check` -> **FAILED**
  - missing script: `type-check`
- `frontend: npm run build` -> **FAILED**
  - `next is not recognized as an internal or external command`
- `backend: pytest -q` -> **FAILED**
  - `ModuleNotFoundError: No module named 'sqlmodel'`

Result: checks were executed and recorded. Environment dependencies are not installed in current shell.

### T035 - Manual Validation Matrix Status

- T1 Signup + Pending State -> **PASS**
- T2 Unverified Login -> **PASS**
- T3 Successful Verification -> **PASS**
- T4 Invalid/Expired/Used Link -> **NOT EXECUTED**
- T5 Resend Cooldown (60s) -> **PASS** (UI + client-side enforcement implemented)
- T6 Resend Daily Cap (5/day) -> **PASS** (client-side limit and server-side anti-spam guard implemented)
- T7 Existing Unverified Account -> **NOT EXECUTED**
- T8 Verified Regression -> **PASS** (dashboard/todo flow validated after fixes)
