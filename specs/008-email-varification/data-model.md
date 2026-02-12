# Data Model: Email Verification Access Control

**Feature**: `008-email-varification`
**Date**: 2026-02-12
**Phase**: 1 (Design)

## Entities

## 1) User Account

Represents a registered user identity.

Fields:
- `id` (string): unique user identifier.
- `email` (string): unique login identity.
- `name` (string | null): display name.
- `emailVerified` (boolean): verification state gate for protected access.

Rules:
- `emailVerified = false` => limited session access only.
- `emailVerified = true` => full protected access allowed.

## 2) Verification Token

Represents one verification attempt artifact.

Fields:
- `token` (string): one-time token.
- `userId` (string): owner account.
- `expiresAt` (datetime): validity deadline (24h from issue).
- `usedAt` (datetime | null): set on successful consumption.

Rules:
- Token is single-use.
- Expired or used token is invalid.

## 3) Verification Request Event

Represents send/resend attempt metadata.

Fields:
- `userId` (string)
- `requestedAt` (datetime)
- `status` (enum): `accepted`, `cooldown_blocked`, `daily_limit_blocked`, `already_verified`, `delivery_failed`.

Rules:
- Cooldown: minimum 60 seconds between accepted requests.
- Daily cap: maximum 5 accepted resend requests per account/day.

## 4) User Session

Represents authenticated session state.

Fields:
- `sessionId` (string)
- `userId` (string)
- `expiresAt` (datetime)
- `verificationAccessMode` (enum): `limited`, `full`

Derivation:
- `limited` if account unverified.
- `full` if account verified.

## Relationships

- User Account 1..* Verification Tokens
- User Account 1..* Verification Request Events
- User Account 1..* User Sessions

## State Transitions

1. **Signup Complete**
- Account created with `emailVerified=false`.
- Verification token issued.
- Session mode becomes `limited`.

2. **Verification Success**
- Valid token consumed (`usedAt` set).
- Account flips to `emailVerified=true`.
- Session mode transitions `limited -> full`.

3. **Resend Flow**
- If cooldown/day cap pass, issue new token and mark request `accepted`.
- Otherwise record blocked status and return clear message.

4. **Invalid/Expired Token Attempt**
- No state change to account verification.
- Return invalid/expired result and next-step guidance.

## Validation Mapping

- FR-014: token expiry 24h
- FR-015: resend cooldown 60s
- FR-016: resend max 5/day/account
- FR-017: all unverified accounts restricted (new + existing)
