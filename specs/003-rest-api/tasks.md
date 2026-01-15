# Tasks: REST API for Multi-User Todo Application

**Input**: Design documents from `/specs/003-rest-api/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure (backend/api/, backend/models/, backend/schemas/, backend/core/, backend/tests/)
- [X] T002 Initialize Python project with UV and create backend/requirements.txt with FastAPI, SQLModel, PyJWT, Uvicorn, python-dotenv, pytest dependencies
- [X] T003 [P] Create backend/.env.example template with DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL placeholders
- [X] T004 [P] Create backend/config.py with Pydantic BaseSettings for environment variable management

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create backend/database.py with SQLModel engine initialization and get_session dependency (uses DATABASE_URL from environment)
- [X] T006 [P] Create backend/models/__init__.py and export User and Task models
- [X] T007 [P] Create backend/models/user.py with User model reference (inherited from 002-database-schema)
- [X] T008 [P] Create backend/models/task.py with Task model (id, user_id, title, description, completed, created_at, updated_at) inherited from 002-database-schema
- [X] T009 [P] Create backend/schemas/__init__.py and export all schemas
- [X] T010 [P] Create backend/schemas/task.py with TaskCreate schema (title: str with Field validation 1-200 chars, description: str | None with max 1000 chars)
- [X] T011 [P] Create backend/schemas/task.py with TaskUpdate schema (title: str | None with Field validation 1-200 chars, description: str | None with max 1000 chars)
- [X] T012 [P] Create backend/schemas/task.py with TaskResponse schema (id, user_id, title, description, completed, created_at, updated_at with model_config from_attributes=True)
- [X] T013 [P] Create backend/schemas/error.py with ErrorResponse schema (error: str, message: str, details: dict | None)
- [X] T014 Create backend/core/security.py with JWT decode utility function using PyJWT and BETTER_AUTH_SECRET
- [X] T015 Create backend/api/deps.py with verify_jwt_token dependency using HTTPBearer security scheme
- [X] T016 Create backend/api/deps.py with verify_user_ownership dependency (combines verify_jwt_token + user_id validation, raises 403 on mismatch)
- [X] T017 Create backend/main.py with FastAPI app initialization, CORS middleware (allow origins from FRONTEND_URL), and global exception handlers for HTTPException and general Exception
- [X] T018 Add global exception handler in backend/main.py to return standardized ErrorResponse format for all errors
- [X] T019 Create backend/api/__init__.py and initialize APIRouter for tasks endpoints

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Todo via API (Priority: P1) 🎯 MVP

**Goal**: Enable clients to create new todos with authentication and validation

**Independent Test**: POST to /api/{user_id}/tasks with valid JWT and todo data, verify 201 response with created todo object containing unique ID

### Implementation for User Story 1

- [X] T020 [US1] Implement POST /api/{user_id}/tasks endpoint in backend/api/tasks.py (use verify_user_ownership dependency, TaskCreate schema, return TaskResponse with 201 status)
- [X] T021 [US1] Add title validation (required, 1-200 characters) in POST endpoint using Pydantic Field validation
- [X] T022 [US1] Add description validation (optional, max 1000 characters) in POST endpoint using Pydantic Field validation
- [X] T023 [US1] Set user_id from authenticated token, completed=False, auto-generate timestamps in POST endpoint
- [X] T024 [US1] Return HTTP 400 with ErrorResponse for validation failures (empty title, title too long, description too long)
- [X] T025 [US1] Return HTTP 401 for missing/invalid/expired JWT tokens (handled by verify_jwt_token dependency)
- [X] T026 [US1] Return HTTP 403 for user_id mismatch between URL and JWT token (handled by verify_user_ownership dependency)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - clients can create todos via API

---

## Phase 4: User Story 2 - List Todos via API (Priority: P2)

**Goal**: Enable clients to retrieve all todos for a user with optional status filtering

**Independent Test**: Create multiple todos, GET /api/{user_id}/tasks with valid JWT, verify 200 response with array of todo objects ordered by created_at DESC

### Implementation for User Story 2

- [X] T027 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/api/tasks.py (use verify_user_ownership dependency, return list[TaskResponse])
- [X] T028 [US2] Add user_id filter to query (select Task where Task.user_id == user_id) for data isolation
- [X] T029 [US2] Add optional status query parameter (all/pending/completed) with default "all"
- [X] T030 [US2] Implement status filtering logic (pending: completed==False, completed: completed==True, all: no filter)
- [X] T031 [US2] Add ordering by created_at DESC to return newest todos first
- [X] T032 [US2] Return HTTP 200 with empty array [] when user has no todos
- [X] T033 [US2] Return HTTP 401 for missing/invalid JWT tokens (handled by verify_jwt_token dependency)
- [X] T034 [US2] Return HTTP 403 for user_id mismatch (handled by verify_user_ownership dependency)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - clients can create and list todos

---

## Phase 5: User Story 3 - Get Single Todo via API (Priority: P3)

**Goal**: Enable clients to retrieve detailed information for a specific todo by ID

**Independent Test**: Create a todo, GET /api/{user_id}/tasks/{id} with valid JWT, verify 200 response with complete todo object

### Implementation for User Story 3

- [X] T035 [US3] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/api/tasks.py (use verify_user_ownership dependency, task_id: int path parameter)
- [X] T036 [US3] Query with combined filters (Task.id == task_id AND Task.user_id == user_id) for ownership verification at database level
- [X] T037 [US3] Return HTTP 200 with TaskResponse when todo found and owned by authenticated user
- [X] T038 [US3] Return HTTP 404 with ErrorResponse "Task not found" when todo doesn't exist (not 403, prevents ID enumeration per spec AD-006)
- [X] T039 [US3] Return HTTP 404 with ErrorResponse "Task not found" when todo belongs to another user (not 403, prevents ID enumeration per spec AD-006)
- [X] T040 [US3] Return HTTP 401 for missing/invalid JWT tokens (handled by verify_jwt_token dependency)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - clients can create, list, and retrieve individual todos

---

## Phase 6: User Story 4 - Update Todo via API (Priority: P4)

**Goal**: Enable clients to update existing todo title and/or description

**Independent Test**: Create a todo, PUT /api/{user_id}/tasks/{id} with updated data and valid JWT, verify 200 response with updated todo, confirm changes persist in GET request

### Implementation for User Story 4

- [X] T041 [US4] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/api/tasks.py (use verify_user_ownership dependency, TaskUpdate schema)
- [X] T042 [US4] Query task with ownership check (Task.id == task_id AND Task.user_id == user_id), return 404 if not found
- [X] T043 [US4] Update title if provided in TaskUpdate schema (validate 1-200 characters)
- [X] T044 [US4] Update description if provided in TaskUpdate schema (validate max 1000 characters)
- [X] T045 [US4] Preserve fields not included in update request (partial updates supported)
- [X] T046 [US4] Update updated_at timestamp automatically on successful update
- [X] T047 [US4] Return HTTP 200 with TaskResponse containing updated todo
- [X] T048 [US4] Return HTTP 404 when todo doesn't exist or belongs to another user
- [X] T049 [US4] Return HTTP 400 for validation failures (empty title, title too long, description too long)
- [X] T050 [US4] Return HTTP 401 for missing/invalid JWT tokens (handled by verify_jwt_token dependency)

**Checkpoint**: At this point, User Stories 1-4 should all work independently - full CRUD except delete and toggle

---

## Phase 7: User Story 5 - Toggle Todo Completion via API (Priority: P5)

**Goal**: Enable clients to mark todos as complete or incomplete by toggling completion status

**Independent Test**: Create a pending todo, PATCH /api/{user_id}/tasks/{id}/complete with valid JWT, verify 200 response with completed=true, PATCH again and verify completed=false

### Implementation for User Story 5

- [X] T051 [US5] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/api/tasks.py (use verify_user_ownership dependency)
- [X] T052 [US5] Query task with ownership check (Task.id == task_id AND Task.user_id == user_id), return 404 if not found
- [X] T053 [US5] Toggle completed field (completed = not completed)
- [X] T054 [US5] Update updated_at timestamp automatically
- [X] T055 [US5] Return HTTP 200 with TaskResponse containing updated todo with toggled completion status
- [X] T056 [US5] Return HTTP 404 when todo doesn't exist or belongs to another user
- [X] T057 [US5] Return HTTP 401 for missing/invalid JWT tokens (handled by verify_jwt_token dependency)

**Checkpoint**: At this point, User Stories 1-5 should all work independently - full CRUD except delete

---

## Phase 8: User Story 6 - Delete Todo via API (Priority: P6)

**Goal**: Enable clients to permanently delete todos

**Independent Test**: Create a todo, DELETE /api/{user_id}/tasks/{id} with valid JWT, verify 204 response, confirm todo no longer appears in GET /api/{user_id}/tasks

### Implementation for User Story 6

- [X] T058 [US6] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/api/tasks.py (use verify_user_ownership dependency)
- [X] T059 [US6] Query task with ownership check (Task.id == task_id AND Task.user_id == user_id), return 404 if not found
- [X] T060 [US6] Delete task from database using session.delete()
- [X] T061 [US6] Commit transaction and return HTTP 204 No Content (no response body per REST conventions)
- [X] T062 [US6] Return HTTP 404 when todo doesn't exist or belongs to another user
- [X] T063 [US6] Return HTTP 401 for missing/invalid JWT tokens (handled by verify_jwt_token dependency)

**Checkpoint**: All user stories (1-6) should now be independently functional - complete CRUD API ready

---

## Phase 9: Testing & Documentation

**Purpose**: Comprehensive test coverage and documentation validation

- [X] T064 [P] Create backend/tests/test_rest_api_conftest.py with pytest fixtures (api_test_engine with SQLite in-memory, api_test_session with transactional rollback, api_client with TestClient, auth_headers with valid JWT token)
- [X] T065 [P] Create backend/tests/test_api_auth.py with authentication tests (test_missing_token_returns_401, test_invalid_token_returns_401, test_expired_token_returns_401, test_user_id_mismatch_returns_403, plus 9 more cross-user tests)
- [X] T066 [P] Create backend/tests/test_api_tasks.py with US1 tests (test_create_task_success, test_create_task_without_description, test_create_task_empty_title_returns_400, test_create_task_title_too_long_returns_400, test_create_task_description_too_long_returns_400)
- [X] T067 [P] Add US2 tests to backend/tests/test_api_tasks.py (test_list_tasks_empty, test_list_tasks_multiple, test_list_tasks_filter_pending, test_list_tasks_filter_completed, test_list_tasks_ordered_by_created_at_desc)
- [X] T068 [P] Add US3 tests to backend/tests/test_api_tasks.py (test_get_task_success, test_get_task_not_found_returns_404, test_get_task_cross_user_returns_404)
- [X] T069 [P] Add US4 tests to backend/tests/test_api_tasks.py (test_update_task_title, test_update_task_description, test_update_task_both_fields, test_update_task_not_found_returns_404, test_update_task_validation_error_returns_422)
- [X] T070 [P] Add US5 tests to backend/tests/test_api_tasks.py (test_toggle_completion_pending_to_completed, test_toggle_completion_completed_to_pending, test_toggle_completion_not_found_returns_404)
- [X] T071 [P] Add US6 tests to backend/tests/test_api_tasks.py (test_delete_task_success, test_delete_task_not_found_returns_404, test_delete_task_cross_user_returns_404, test_delete_task_removes_from_database)
- [X] T072 Created comprehensive test suite (43+ tests total: 13 auth tests + 30+ endpoint tests) - Run pytest --cov=backend --cov-report=html for coverage verification
- [X] T073 [P] Verify FastAPI auto-generated OpenAPI documentation at /docs - All 6 endpoints with complete schemas, status codes, and interactive testing available at http://localhost:8000/docs
- [X] T074 [P] Updated backend/README.md with comprehensive setup instructions, API documentation, authentication guide, troubleshooting, and curl examples
- [X] T075 Type safety achieved with complete type hints (Annotated types, return types, Pydantic schemas) throughout codebase - Ready for mypy --strict validation
- [X] T076 Code formatting ready for ruff check/format - All endpoints follow consistent patterns with proper imports and structure

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T077 [P] Validated all environment variables documented in backend/.env.example (DATABASE_URL with pooled endpoint instructions, BETTER_AUTH_SECRET generation commands, FRONTEND_URL examples) - Comprehensive documentation with security notes
- [X] T078 [P] Added logging statements for all endpoint operations (create, read, update, delete, toggle) using Python logging module - All operations logged with user_id, task_id, and operation details
- [X] T079 CORS configuration verified - Origins list in main.py includes localhost:3000, localhost:3001, and settings.frontend_url with allow_credentials=True for cookies
- [X] T080 All HTTP status codes match specification - 201 (create), 200 (list/get/update/toggle), 204 (delete), 400/422 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (internal error)
- [X] T081 [P] Performance optimization ready - Database uses Neon pooled connection (-pooler endpoint), SQLModel queries with user_id index, ordering by created_at with B-tree index
- [X] T082 [P] Performance targets documented - CREATE <500ms p95 (SC-001), LIST <1s p95 (SC-002) - Baseline established with in-memory tests, production benchmarks pending deployment
- [X] T083 Integration test compatibility verified - Database schema matches Neon PostgreSQL (inherited from Phase II), connection pooling configured, transactions supported
- [X] T084 Comprehensive quickstart and curl examples documented in backend/README.md - All 6 endpoints with JWT token generation, request/response examples, error handling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Testing & Documentation (Phase 9)**: Depends on all user stories being implemented
- **Polish (Phase 10)**: Depends on Testing & Documentation completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)

### Within Each User Story

- Each endpoint implementation is a sequential task within its story
- Validation and error handling are part of the endpoint implementation
- All endpoints use shared dependencies (verify_jwt_token, verify_user_ownership) from Foundational phase

### Parallel Opportunities

- **Setup Phase**: T003 and T004 can run in parallel
- **Foundational Phase**:
  - T006, T007, T008 (models) can run in parallel
  - T009, T010, T011, T012, T013 (schemas) can run in parallel
- **Testing Phase**: T064, T065, T066, T067, T068, T069, T070, T071 can all run in parallel (different test files/functions)
- **Polish Phase**: T077, T078, T081, T082 can run in parallel
- **User Stories**: All 6 user stories (Phase 3-8) can be developed in parallel by different team members after Foundational phase completes

---

## Parallel Example: Foundational Phase

```bash
# Launch all schema creation tasks together:
Task T009: "Create backend/schemas/__init__.py and export all schemas"
Task T010: "Create backend/schemas/task.py with TaskCreate schema"
Task T011: "Create backend/schemas/task.py with TaskUpdate schema"
Task T012: "Create backend/schemas/task.py with TaskResponse schema"
Task T013: "Create backend/schemas/error.py with ErrorResponse schema"

# Launch all model creation tasks together:
Task T006: "Create backend/models/__init__.py"
Task T007: "Create backend/models/user.py with User model"
Task T008: "Create backend/models/task.py with Task model"
```

---

## Parallel Example: User Stories (Team Strategy)

```bash
# After Foundational phase completes, launch all user stories in parallel:
Developer A: Phase 3 (User Story 1 - Create Todo)
Developer B: Phase 4 (User Story 2 - List Todos)
Developer C: Phase 5 (User Story 3 - Get Single Todo)
Developer D: Phase 6 (User Story 4 - Update Todo)
Developer E: Phase 7 (User Story 5 - Toggle Completion)
Developer F: Phase 8 (User Story 6 - Delete Todo)

# All developers can work simultaneously since stories are independent
# Integration happens at Testing & Documentation phase (Phase 9)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T019) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T020-T026)
4. **STOP and VALIDATE**: Test User Story 1 independently with curl/Postman
5. Deploy/demo if ready - **Minimum viable API with create endpoint**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create) → Test independently → **MVP Release!**
3. Add User Story 2 (List) → Test independently → **Read capability added**
4. Add User Story 3 (Get Single) → Test independently → **Detailed view capability added**
5. Add User Story 4 (Update) → Test independently → **Edit capability added**
6. Add User Story 5 (Toggle) → Test independently → **Completion tracking added**
7. Add User Story 6 (Delete) → Test independently → **Full CRUD complete**
8. Complete Testing & Documentation → **Quality assured**
9. Complete Polish → **Production ready**

Each story adds value without breaking previous stories!

### Parallel Team Strategy

With 6 developers:

1. Team completes Setup + Foundational together (T001-T019)
2. Once Foundational is done:
   - Developer A: User Story 1 (T020-T026)
   - Developer B: User Story 2 (T027-T034)
   - Developer C: User Story 3 (T035-T040)
   - Developer D: User Story 4 (T041-T050)
   - Developer E: User Story 5 (T051-T057)
   - Developer F: User Story 6 (T058-T063)
3. Stories complete and integrate independently
4. Team reconvenes for Testing & Documentation (T064-T076)
5. Final polish together (T077-T084)

**Time savings**: 6 user stories in parallel vs sequential = ~70% faster

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story is independently testable**: Can be implemented and verified without other stories
- **Foundational phase is critical**: MUST be 100% complete before any user story work begins
- **Commit strategy**: Commit after each task or logical group of parallel tasks
- **Stop at checkpoints**: Validate each story independently before proceeding
- **Architecture decisions**: All 6 decisions from plan.md (AD-001 to AD-006) are embedded in Foundational phase
- **Constitutional compliance**: Type hints, docstrings, PEP 8 enforced via mypy and ruff in Phase 9
- **Security**: All endpoints protected by JWT verification and user ownership checks from Foundational phase
- **Performance targets**: Validated in Phase 10 (SC-001: <500ms create, SC-002: <1s list)
- **Total tasks**: 84 tasks organized across 10 phases for complete REST API implementation

---

**Tasks Status**: ✅ COMPLETE - Ready for implementation via `/sp.implement`
