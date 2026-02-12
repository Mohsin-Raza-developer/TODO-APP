# Tasks: Email Verification Access Control

**Input**: Design documents from `/specs/008-email-varification/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests were not explicitly mandated in the spec; this task list focuses on implementation + manual validation aligned to independent test criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story mapping label (`US1`, `US2`, `US3`)
- Every task includes an explicit file path

## Path Conventions

- Frontend: `frontend/`
- Backend: `backend/`
- Feature docs: `specs/008-email-varification/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding and implementation-safe defaults.

- [x] T001 Create verification feature module folder and page scaffold in `frontend/app/verify-email/page.tsx`
- [x] T002 [P] Add verification UI copy constants in `frontend/types/api.ts`
- [x] T003 [P] Add verification-related route metadata in `frontend/app/verify-email/page.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth and enforcement prerequisites required before all stories.

**CRITICAL**: No user-story completion until this phase is done.

- [x] T004 Enable required email verification and verification settings in `frontend/lib/auth.ts`
- [x] T005 Update shared auth types for verification access mode in `frontend/types/user.ts`
- [x] T006 Implement centralized verification-state helper for protected decisions in `frontend/lib/auth-helper.ts`
- [x] T007 Enforce unverified route redirect at middleware layer for protected routes in `frontend/middleware.ts`
- [x] T008 [P] Add verification-state guard utility for API proxy routes in `frontend/lib/auth-helper.ts`
- [x] T009 Add protected chatbot gating rule in `frontend/app/api/chatkit/route.ts`
- [x] T010 Add defensive unverified-access rejection dependency helper in `backend/api/deps.py`

**Checkpoint**: Foundation ready; user stories can now be implemented.

---

## Phase 3: User Story 1 - Verify New Account Before Access (Priority: P1)

**Goal**: New users must verify email before accessing protected task/chatbot areas.

**Independent Test**: Signup with new email -> pending screen -> protected routes blocked -> verify link -> access granted.

- [x] T011 [US1] Update signup flow redirect from dashboard to verify-email pending screen in `frontend/hooks/useAuth.ts`
- [x] T012 [P] [US1] Build verification pending screen UI with clear next actions in `frontend/app/verify-email/page.tsx`
- [x] T013 [P] [US1] Add reusable verification status panel component in `frontend/components/auth/VerificationPendingPanel.tsx`
- [x] T014 [US1] Wire pending screen with current session verification state in `frontend/app/verify-email/page.tsx`
- [x] T015 [US1] Enforce server-side verified check before dashboard render in `frontend/app/dashboard/page.tsx`
- [x] T016 [US1] Enforce verified check for todos list/create proxy in `frontend/app/api/todos/route.ts`
- [x] T017 [US1] Enforce verified check for todo item read/update/delete proxy in `frontend/app/api/todos/[id]/route.ts`
- [x] T018 [US1] Enforce verified check for todo completion toggle proxy in `frontend/app/api/todos/[id]/complete/route.ts`
- [x] T019 [US1] Integrate backend defensive verification gate on protected endpoints in `backend/api/tasks.py`

**Checkpoint**: US1 independently functional.

---

## Phase 4: User Story 2 - Resend Verification Email (Priority: P2)

**Goal**: Unverified users can resend verification email with enforced cooldown and daily cap.

**Independent Test**: Unverified user resend succeeds when eligible; blocked with correct message for cooldown and daily limit.

- [x] T020 [US2] Add resend action trigger and pending/loading UI state in `frontend/app/verify-email/page.tsx`
- [x] T021 [P] [US2] Add cooldown timer state and button-disable behavior in `frontend/components/auth/VerificationPendingPanel.tsx`
- [x] T022 [P] [US2] Add standardized resend outcome message mapping in `frontend/lib/error-handler.ts`
- [x] T023 [US2] Implement resend request call and response handling in `frontend/hooks/useAuth.ts`
- [x] T024 [US2] Enforce 60-second cooldown policy in resend handler logic in `frontend/hooks/useAuth.ts`
- [x] T025 [US2] Enforce max 5/day resend policy via auth/provider integration settings in `frontend/lib/auth.ts`
- [x] T026 [US2] Handle already-verified resend attempts with explicit user feedback in `frontend/app/verify-email/page.tsx`

**Checkpoint**: US2 independently functional.

---

## Phase 5: User Story 3 - Continue Existing Login Experience (Priority: P3)

**Goal**: Verified users keep current smooth login/dashboard behavior without regressions.

**Independent Test**: Verified user login and dashboard/task flow remains unchanged and performant.

- [x] T027 [US3] Preserve verified-user login success path and redirect behavior in `frontend/hooks/useAuth.ts`
- [x] T028 [P] [US3] Preserve verified-user navigation in header/account actions in `frontend/components/layout/Header.tsx`
- [x] T029 [P] [US3] Ensure dashboard user experience remains unchanged for verified sessions in `frontend/components/todo/DashboardClient.tsx`
- [x] T030 [US3] Ensure protected chat placeholder behavior is consistent for verified vs unverified users in `frontend/components/chat/LockedChatPlaceholder.tsx`
- [x] T031 [US3] Verify no regression in todo client service calls for verified sessions in `frontend/lib/api/todos.ts`

**Checkpoint**: US3 independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and end-to-end validation.

- [x] T032 [P] Update verification flow documentation and setup notes in `frontend/README.md`
- [x] T033 [P] Update backend auth behavior notes for verification enforcement in `backend/README.md`
- [x] T034 Run full lint and type checks, then record results in `specs/008-email-varification/quickstart.md`
- [x] T035 Execute manual validation matrix T1-T8 and record pass/fail notes in `specs/008-email-varification/quickstart.md`
- [x] T036 Final consistency sweep for auth comments and stale references in `frontend/lib/auth.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 3 baseline verification page/flow.
- **Phase 5 (US3)**: Depends on Phase 3 verification enforcement and can proceed with/after Phase 4.
- **Phase 6 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundations.
- **US2 (P2)**: Depends on US1 verify-email pending flow.
- **US3 (P3)**: Depends on US1 enforcement baseline, then regression polish.

### Suggested Story Completion Order

1. US1 (MVP)
2. US2
3. US3

### Parallel Opportunities

- Setup: T002, T003 parallel after T001.
- Foundational: T008 and T010 can run in parallel with other foundational tasks when base helpers exist.
- US1: T012 and T013 parallel; T016/T017/T018 can run in parallel once helper logic is finalized.
- US2: T021 and T022 parallel; T024 and T025 can proceed in parallel after T023 baseline.
- US3: T028 and T029 parallel.
- Polish: T032 and T033 parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel UI work
Task: "T012 [US1] Build verification pending screen UI in frontend/app/verify-email/page.tsx"
Task: "T013 [US1] Add panel component in frontend/components/auth/VerificationPendingPanel.tsx"

# Parallel protected API enforcement
Task: "T016 [US1] Enforce verified check in frontend/app/api/todos/route.ts"
Task: "T017 [US1] Enforce verified check in frontend/app/api/todos/[id]/route.ts"
Task: "T018 [US1] Enforce verified check in frontend/app/api/todos/[id]/complete/route.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 + Phase 2.
2. Complete Phase 3 (US1).
3. Validate independent test criteria for US1 before expanding scope.

### Incremental Delivery

1. Ship US1 (core enforcement).
2. Add US2 (resend reliability controls).
3. Validate regressions via US3 tasks.
4. Run polish validation matrix and docs updates.

### Team Parallel Strategy

- Engineer A: Core auth config + middleware + dashboard enforcement.
- Engineer B: Verify-email UI + resend UX.
- Engineer C: Todo/chatbot proxy gating + backend defensive checks.

---

## Notes

- All tasks follow strict checklist format with IDs, optional [P], optional [USx], and explicit file paths.
- No destructive DB migration is required by default in this scope; enforcement is auth/session behavior-first.
- If framework constraints require schema updates later, add them in follow-up tasks via migration workflow.
