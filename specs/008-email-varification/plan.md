# Implementation Plan: Email Verification Access Control

**Branch**: `008-email-varification` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-email-varification/spec.md`

## Summary

Implement email verification enforcement for signup and login flows using the existing Next.js + Better Auth stack, with strict protected-access gating until verification is complete. Unverified users receive limited sessions (verification-only), protected task/chatbot routes are blocked, resend verification supports cooldown and daily caps, and existing unverified accounts are included in the policy.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.13+ (backend)
**Primary Dependencies**: Next.js 16, Better Auth 1.x, FastAPI, SQLModel, PostgreSQL (Neon)
**Storage**: Existing Better Auth user/session tables + session data in Neon PostgreSQL
**Testing**: ESLint + TypeScript checks (frontend), pytest (backend), manual end-to-end verification flow tests
**Target Platform**: Web application (desktop + mobile browsers)
**Project Type**: Web (separate frontend and backend)
**Performance Goals**: Verification state checks and redirects should feel immediate; login-to-dashboard for verified users remains under 10s median (SC-005)
**Constraints**: Verification link TTL 24 hours, resend cooldown 60 seconds, max 5 resend attempts/day/account, unverified users blocked from task/chatbot protected areas
**Scale/Scope**: Existing multi-user todo app auth hardening for all unverified accounts (new + existing)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. SDD-RI Methodology**: PASS. Spec and clarify completed before planning.
- **II. Pythonic Excellence**: PASS. Backend updates (if any) remain Python 3.13+ and style-compliant.
- **III. Persistent Relational State**: PASS. Existing Better Auth + PostgreSQL data model used; no direct bypass.
- **IV. Type Safety & Documentation**: PASS. Frontend TypeScript strict typing and backend type hints maintained.
- **V. Terminal-Based Verification**: PASS. Flow testable via browser + API route checks and backend logs.
- **VI. Reusable Intelligence**: PASS. Existing auth/error patterns reused; no duplicate architectural invention.
- **VII. Stateless Security**: PASS. Access control remains session/token validated with strict ownership checks.

**Gate Result (Pre-Research)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/008-email-varification/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- verification-flow.md
`-- tasks.md              # generated later by /sp.tasks
```

### Source Code (repository root)

```text
frontend/
|-- app/
|   |-- api/auth/[...all]/route.ts
|   |-- dashboard/page.tsx
|   |-- login/page.tsx
|   |-- signup/page.tsx
|   `-- verify-email/            # new route
|-- components/auth/
|-- hooks/useAuth.ts
|-- lib/auth.ts
|-- middleware.ts
`-- app/api/todos/...            # enforce verification check consistency

backend/
|-- api/deps.py                  # optional defensive verification check
|-- api/tasks.py                 # existing protected task endpoints
|-- models/user.py
`-- tests/
```

**Structure Decision**: Keep current web split architecture. Primary implementation in frontend auth/session flow and route protection, with optional backend defensive checks to prevent bypass.

## Phase 0: Research Output

Phase 0 decisions are documented in `research.md`:
- Better Auth email verification mode and lifecycle behavior
- Redirect/gating strategy for unverified sessions
- Resend throttling model (60s cooldown + 5/day)
- Enforcement strategy for existing unverified users
- Security consistency across middleware, server components, and API handlers

## Phase 1: Design & Contracts Output

Phase 1 artifacts:
- `data-model.md`: verification state model and transitions
- `contracts/verification-flow.md`: route and behavior contracts for verification scenarios
- `quickstart.md`: implementation + test validation flow

## Implementation Strategy (Phase 2 Planning Scope)

1. Enable verification requirement in Better Auth config.
2. Update signup and login flows to support limited unverified sessions.
3. Add dedicated verification pending page and resend actions.
4. Enforce route protection for dashboard, todos, and chatbot areas when unverified.
5. Add server-side gating in protected routes/API proxies for defense in depth.
6. Ensure existing unverified accounts follow same restrictions.
7. Preserve verified user UX and performance baseline.

## Risks & Mitigations

- **Risk**: Users stuck due to delayed emails.
  - **Mitigation**: clear pending UI + resend + cooldown messaging.
- **Risk**: Inconsistent enforcement across layers.
  - **Mitigation**: middleware + server component + API proxy checks.
- **Risk**: Regression for verified users.
  - **Mitigation**: focused regression tests for existing login/dashboard/task flows.
- **Risk**: Verification bypass through direct API calls.
  - **Mitigation**: server-side verification checks on protected handlers.

## Post-Design Constitution Re-check

- **All constitutional gates remain PASS after design artifacts creation.**
- No justified violations required.

## Complexity Tracking

No constitutional violations to justify.
