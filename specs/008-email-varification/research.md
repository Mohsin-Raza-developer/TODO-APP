# Research Findings: Email Verification Access Control

**Feature**: `008-email-varification`
**Date**: 2026-02-12
**Phase**: 0 (Research)

## Decision 1: Verification Policy Scope

- **Decision**: Enforce verification restrictions for all unverified accounts (new and existing).
- **Rationale**: Prevent policy gaps and reduce security inconsistencies between legacy and new accounts.
- **Alternatives considered**:
  - New accounts only: rejected due to uneven enforcement.
  - Grace-period migration: rejected for avoidable complexity and temporary risk.

## Decision 2: Unverified Login Behavior

- **Decision**: Allow unverified users to sign in with limited session access.
- **Rationale**: Best UX for recovery while keeping protected data blocked.
- **Alternatives considered**:
  - Block sign-in entirely: rejected due to friction and support burden.
  - Time-limited full access: rejected due to security weakening.

## Decision 3: Verification Link Expiry

- **Decision**: 24-hour verification link validity.
- **Rationale**: Balanced user convenience and abuse exposure.
- **Alternatives considered**:
  - 15 minutes: rejected as too strict for delayed inbox delivery.
  - 72 hours: rejected as unnecessary risk window expansion.

## Decision 4: Resend Throttling Model

- **Decision**: 60-second cooldown and maximum 5 resend attempts per day per account.
- **Rationale**: Controls abuse while preserving successful self-service recovery.
- **Alternatives considered**:
  - Cooldown only: rejected (no daily cap).
  - Hourly cap: rejected in favor of simpler daily policy.

## Decision 5: Enforcement Layers

- **Decision**: Enforce verification at middleware, protected server routes/pages, and API proxy layers.
- **Rationale**: Defense in depth; avoids client-only bypass.
- **Alternatives considered**:
  - Client-only checks: rejected as bypass-prone.
  - Middleware-only checks: rejected as insufficient for all request paths.

## Decision 6: Protected Scope

- **Decision**: Block unverified access to dashboard, todos actions, and chatbot protected access.
- **Rationale**: Matches clarified spec and preserves private-data boundaries.
- **Alternatives considered**:
  - Tasks-only protection: rejected due to chatbot path inconsistency.

## Phase 0 Exit Check

- No unresolved NEEDS CLARIFICATION items remain.
- Decisions are testable and mapped to spec requirements FR-001..FR-017.
