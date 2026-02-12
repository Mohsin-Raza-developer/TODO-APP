# Verification Flow Contract

**Feature**: `008-email-varification`
**Date**: 2026-02-12
**Phase**: 1 (Design)

## Purpose

Defines behavior contracts for email verification access control across authentication, protected routing, and resend handling.

## Contract A: Signup Outcome

- When account signup succeeds:
  - Account starts as unverified.
  - Verification email is issued.
  - User lands on verification pending experience (not dashboard).

Expected behavior:
- Status messaging clearly instructs user to verify email.
- Resend action is available from pending experience.

## Contract B: Unverified Login Session

- Unverified users can authenticate.
- Session is limited to verification-related screens/actions.
- Access to dashboard, todo actions, and chatbot protected area is blocked.

Expected behavior:
- Attempts to open protected pages redirect to verification pending.
- Server-side checks must enforce same rule for protected handlers.

## Contract C: Verification Link Handling

- Link validity: 24 hours from issuance.
- Token use: single-use only.

Outcomes:
- Valid + unexpired + unused token => verification success and full access enabled.
- Expired/invalid/used token => explicit failure state + recovery path (resend).

## Contract D: Resend Verification

Rules:
- Cooldown: 60 seconds between requests.
- Cap: max 5 resend attempts per day per account.

Outcomes:
- Eligible request => accepted + success message.
- Cooldown blocked => cooldown message.
- Daily cap reached => daily limit message.
- Already verified => no resend; inform already verified.

## Contract E: Existing Unverified Accounts

- Same enforcement policy applies to old and new unverified accounts.
- No exemption for legacy unverified users.

## Error Contract

User-facing messages must be explicit for:
- pending verification
- verification success
- invalid/expired/used token
- resend success
- resend cooldown block
- resend daily-limit block
- already verified

## Acceptance Mapping

- FR-001..FR-004: protected access gating
- FR-005..FR-007: resend and token failure behavior
- FR-008..FR-011: verification completion and enforcement consistency
- FR-014..FR-017: TTL, throttling, legacy-account policy
