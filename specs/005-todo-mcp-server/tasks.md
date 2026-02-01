# Tasks: Standalone Todo MCP Server

**Input**: Design documents from `/specs/005-todo-mcp-server/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: No test tasks included - testing will be done manually via MCP client integration tests and unit tests created during implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each MCP tool.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Project Location**: `/mnt/d/todo-mcp-server/` (standalone package, separate from main app)
- **Source**: `server.py` (single file for MVP)
- **Tests**: `tests/test_tools.py`, `tests/test_integration.py`
- **Config**: `.env`, `.env.example`, `pyproject.toml`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize standalone MCP server project at `/mnt/d/todo-mcp-server/` with UV package manager

- [X] T001 Create project directory at `/mnt/d/todo-mcp-server/`
- [X] T002 Initialize UV project with `uv init todo-mcp-server` in `/mnt/d/todo-mcp-server/`
- [X] T003 [P] Add production dependencies: `uv add mcp httpx python-dotenv` in `/mnt/d/todo-mcp-server/`
- [X] T004 [P] Add development dependencies: `uv add --dev pytest pytest-asyncio pytest-httpx mypy ruff` in `/mnt/d/todo-mcp-server/`
- [X] T005 [P] Create `.gitignore` file (ignore `.env`, `__pycache__`, `.venv`, `uv.lock`, `.pytest_cache`, `.mypy_cache`)
- [X] T006 [P] Create `.env.example` template with BACKEND_API_URL, MCP_SERVER_PORT, MCP_DEBUG, LOG_LEVEL
- [X] T007 [P] Create `.env` file with BACKEND_API_URL=http://localhost:8000, MCP_DEBUG=true
- [X] T008 Create `tests/` directory and `tests/__init__.py` file
- [X] T009 [P] Create README.md with setup instructions, usage examples, and MCP client configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core MCP server infrastructure with HTTP client setup that MUST be complete before ANY tool implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create `server.py` with imports (mcp.server.fastmcp.FastMCP, httpx, python-dotenv, os, typing)
- [X] T011 Add environment variable loading (load_dotenv() and BACKEND_API_URL configuration) in `server.py`
- [X] T012 Initialize FastMCP instance: `mcp = FastMCP("todo-mcp-server")` in `server.py`
- [X] T013 [P] Create shared async HTTP client helper function `_make_api_request()` with try-except error handling in `server.py`
- [X] T014 [P] Implement HTTP status code error mapping (400→ValidationError, 404→NotFound, 500→ServiceUnavailable) in `_make_api_request()`
- [X] T015 Add main entry point with `if __name__ == "__main__": mcp.run()` in `server.py`
- [X] T016 [P] Configure ruff settings in `pyproject.toml` (target Python 3.13+, line length 100)
- [X] T017 [P] Configure mypy settings in `pyproject.toml` (strict mode enabled)

**Checkpoint**: Foundation ready - MCP server can start, HTTP client configured, user story tool implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Task via MCP Tool (Priority: P1) 🎯 MVP

**Goal**: Implement `add_task` MCP tool that allows AI agents to create new tasks by calling backend POST /api/{user_id}/tasks endpoint

**Independent Test**: Call `add_task(user_id="test_user", title="Test Task", description="Optional")` and verify it returns task object with ID from backend API

### Implementation for User Story 1

- [X] T018 [US1] Define `add_task` tool function signature with type hints: `async def add_task(user_id: str, title: str, description: str | None = None) -> dict` in `server.py`
- [X] T019 [US1] Add `@mcp.tool()` decorator to `add_task` with docstring describing parameters and return value in `server.py`
- [X] T020 [US1] Implement HTTP POST request to `/api/{user_id}/tasks` endpoint with JSON payload `{"title": title, "description": description}` in `add_task()` using `_make_api_request()`
- [X] T021 [US1] Add parameter validation (user_id non-empty, title non-empty) before making API request in `add_task()`
- [X] T022 [US1] Handle backend API success response (201 Created) and return full Task object in `add_task()`
- [X] T023 [US1] Handle backend API error responses (400 validation, 500 server error) and return meaningful error messages in `add_task()`
- [X] T024 [US1] Add logging for task creation operations (info level for success, error level for failures) in `add_task()`

**Checkpoint**: At this point, `add_task` tool should be fully functional and callable by MCP clients

---

## Phase 4: User Story 2 - View Tasks via MCP Tool (Priority: P1)

**Goal**: Implement `list_tasks` MCP tool that allows AI agents to retrieve user's task list with optional status filtering via backend GET /api/{user_id}/tasks endpoint

**Independent Test**: Create sample tasks via `add_task`, then call `list_tasks(user_id="test_user", status="all")` and verify it returns array of task objects

### Implementation for User Story 2

- [X] T025 [US2] Define `list_tasks` tool function signature with type hints: `async def list_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all") -> list[dict]` in `server.py`
- [X] T026 [US2] Add `@mcp.tool()` decorator to `list_tasks` with docstring describing status filter options in `server.py`
- [X] T027 [US2] Implement HTTP GET request to `/api/{user_id}/tasks?status={status}` endpoint in `list_tasks()` using `_make_api_request()`
- [X] T028 [US2] Add parameter validation (user_id non-empty, status in allowed values) before making API request in `list_tasks()`
- [X] T029 [US2] Handle backend API success response (200 OK) and return array of Task objects in `list_tasks()`
- [X] T030 [US2] Handle empty task list scenario (return empty array []) in `list_tasks()`
- [X] T031 [US2] Handle backend API error responses (401 unauthorized, 404 not found) and return meaningful error messages in `list_tasks()`
- [X] T032 [US2] Add logging for list operations (info level with count of tasks returned) in `list_tasks()`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can create tasks and list them

---

## Phase 5: User Story 3 - Toggle Task Completion via MCP Tool (Priority: P2)

**Goal**: Implement `complete_task` MCP tool that allows AI agents to toggle task completion status via backend PATCH /api/{user_id}/tasks/{id}/complete endpoint

**Independent Test**: Create a task, call `complete_task(user_id="test_user", task_id=1)` twice and verify completed status toggles from false→true→false

### Implementation for User Story 3

- [X] T033 [US3] Define `complete_task` tool function signature with type hints: `async def complete_task(user_id: str, task_id: int) -> dict` in `server.py`
- [X] T034 [US3] Add `@mcp.tool()` decorator to `complete_task` with docstring explaining toggle behavior in `server.py`
- [X] T035 [US3] Implement HTTP PATCH request to `/api/{user_id}/tasks/{task_id}/complete` endpoint in `complete_task()` using `_make_api_request()`
- [X] T036 [US3] Add parameter validation (user_id non-empty, task_id positive integer) before making API request in `complete_task()`
- [X] T037 [US3] Handle backend API success response (200 OK) and return updated Task object with toggled completed status in `complete_task()`
- [X] T038 [US3] Handle backend API error responses (404 task not found, 403 access denied) and return meaningful error messages in `complete_task()`
- [X] T039 [US3] Add logging for completion toggle operations (info level with task_id and new status) in `complete_task()`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - can create, list, and toggle completion

---

## Phase 6: User Story 4 - Delete Task via MCP Tool (Priority: P2)

**Goal**: Implement `delete_task` MCP tool that allows AI agents to permanently remove tasks via backend DELETE /api/{user_id}/tasks/{id} endpoint

**Independent Test**: Create a task, call `delete_task(user_id="test_user", task_id=1)`, then call `list_tasks` and verify task is no longer present

### Implementation for User Story 4

- [X] T040 [US4] Define `delete_task` tool function signature with type hints: `async def delete_task(user_id: str, task_id: int) -> dict` in `server.py`
- [X] T041 [US4] Add `@mcp.tool()` decorator to `delete_task` with docstring in `server.py`
- [X] T042 [US4] Implement HTTP DELETE request to `/api/{user_id}/tasks/{task_id}` endpoint in `delete_task()` using `_make_api_request()`
- [X] T043 [US4] Add parameter validation (user_id non-empty, task_id positive integer) before making API request in `delete_task()`
- [X] T044 [US4] Handle backend API success response (204 No Content with no body) and return confirmation message `{"message": "Task deleted", "task_id": task_id}` in `delete_task()`
- [X] T045 [US4] Handle backend API error responses (404 task not found, 403 access denied) and return meaningful error messages in `delete_task()`
- [X] T046 [US4] Add logging for delete operations (info level with task_id) in `delete_task()`

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently - full CRUD except update

---

## Phase 7: User Story 5 - Update Task Details via MCP Tool (Priority: P3)

**Goal**: Implement `update_task` MCP tool that allows AI agents to modify task title/description via backend PUT /api/{user_id}/tasks/{id} endpoint

**Independent Test**: Create a task, call `update_task(user_id="test_user", task_id=1, title="Updated Title")` and verify task reflects new title

### Implementation for User Story 5

- [X] T047 [US5] Define `update_task` tool function signature with type hints: `async def update_task(user_id: str, task_id: int, title: str | None = None, description: str | None = None) -> dict` in `server.py`
- [X] T048 [US5] Add `@mcp.tool()` decorator to `update_task` with docstring explaining partial updates in `server.py`
- [X] T049 [US5] Implement HTTP PUT request to `/api/{user_id}/tasks/{task_id}` endpoint with JSON payload containing non-None fields in `update_task()` using `_make_api_request()`
- [X] T050 [US5] Add parameter validation (user_id non-empty, task_id positive integer, at least one of title/description provided) before making API request in `update_task()`
- [X] T051 [US5] Handle backend API success response (200 OK) and return updated Task object in `update_task()`
- [X] T052 [US5] Handle backend API error responses (400 validation, 404 task not found) and return meaningful error messages in `update_task()`
- [X] T053 [US5] Add logging for update operations (info level with task_id and updated fields) in `update_task()`

**Checkpoint**: All 5 user stories (all MCP tools) should now be independently functional - complete CRUD operations

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, validation, and quality improvements across all tools

- [ ] T054 [P] Create unit test file `tests/test_tools.py` with mock httpx client setup using pytest-httpx
- [ ] T055 [P] Add unit tests for `add_task` success and error scenarios (mock 201, 400, 500 responses) in `tests/test_tools.py`
- [ ] T056 [P] Add unit tests for `list_tasks` with different status filters (mock 200 with arrays) in `tests/test_tools.py`
- [ ] T057 [P] Add unit tests for `complete_task` toggle behavior (mock 200 with toggled status) in `tests/test_tools.py`
- [ ] T058 [P] Add unit tests for `delete_task` success (mock 204 No Content) in `tests/test_tools.py`
- [ ] T059 [P] Add unit tests for `update_task` partial updates (mock 200 with updated object) in `tests/test_tools.py`
- [ ] T060 [P] Add network error tests (connection refused, timeout) for all tools in `tests/test_tools.py`
- [ ] T061 Create integration test file `tests/test_integration.py` with real backend API dependency
- [ ] T062 Add integration test for full workflow (create→list→complete→list→delete) in `tests/test_integration.py`
- [ ] T063 [P] Add integration test for user data isolation (verify cross-user access returns 404) in `tests/test_integration.py`
- [X] T064 Run `mypy --strict server.py` and fix any type errors
- [X] T065 Run `ruff check server.py` and fix any linting issues
- [X] T066 Run `ruff format server.py` to ensure consistent formatting
- [ ] T067 Run `pytest tests/test_tools.py -v` and verify all unit tests pass
- [ ] T068 Run `pytest tests/test_integration.py -v` (requires backend API running) and verify integration tests pass
- [X] T069 [P] Update README.md with quickstart instructions (setup, run, test) and MCP client configuration examples
- [X] T070 [P] Create quickstart validation checklist in README.md (SC-001 through SC-008 from spec.md)
- [X] T071 Test MCP server startup with `uv run server.py` and verify FastMCP server starts without errors
- [ ] T072 Verify all 5 tools are discoverable by MCP client (test with MCP inspector or client)
- [ ] T073 Run complete workflow test (create→list→complete→delete) and verify completion within 10 seconds (SC-002)
- [X] T074 [P] Add docstring comments to `_make_api_request()` helper function explaining error handling strategy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T009) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion (T010-T017)
  - User Story 1 (T018-T024): Can start after Foundational
  - User Story 2 (T025-T032): Can start after Foundational (no dependency on US1, but builds on create capability)
  - User Story 3 (T033-T039): Can start after Foundational (requires tasks to exist for testing)
  - User Story 4 (T040-T046): Can start after Foundational (requires tasks to exist for testing)
  - User Story 5 (T047-T053): Can start after Foundational (requires tasks to exist for testing)
- **Polish (Phase 8)**: Depends on all user stories being complete (T018-T053)

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - implements `add_task` tool
- **User Story 2 (P1)**: Independent but benefits from US1 for testing - implements `list_tasks` tool
- **User Story 3 (P2)**: Independent but needs US1 to create tasks for testing - implements `complete_task` tool
- **User Story 4 (P2)**: Independent but needs US1 to create tasks for testing - implements `delete_task` tool
- **User Story 5 (P3)**: Independent but needs US1 to create tasks for testing - implements `update_task` tool

**Note**: All user stories are independently implementable since they wrap separate backend API endpoints. The backend API handles all interdependencies.

### Within Each User Story

- Tool function signature and decorator definition before implementation
- Parameter validation before API request
- Success response handling before error handling
- Core implementation before logging

### Parallel Opportunities

- **Setup Phase**: All tasks marked [P] can run in parallel (T003, T004, T005, T006, T007, T009)
- **Foundational Phase**: T013 (HTTP helper) and T014 (error mapping) can run in parallel with T016 (ruff config) and T017 (mypy config)
- **User Stories**: Once Foundational phase completes, all 5 user stories can be implemented in parallel by different developers (each story is a separate tool in the same `server.py` file - requires coordination)
- **Polish Phase**: All unit test tasks (T055-T060) can run in parallel, integration test tasks (T063) can run in parallel, documentation tasks (T069, T070) can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase is complete, implement User Story 1:
# These tasks must run sequentially within the story:
Task T018: Define add_task function signature
Task T019: Add @mcp.tool() decorator
Task T020: Implement HTTP POST request
Task T021: Add parameter validation
Task T022: Handle success response
Task T023: Handle error responses
Task T024: Add logging

# But you could parallelize across stories:
Developer A: User Story 1 (add_task tool) - T018-T024
Developer B: User Story 2 (list_tasks tool) - T025-T032
```

---

## Parallel Example: Polish Phase

```bash
# After all user stories complete, run these in parallel:
Task T055: Unit tests for add_task
Task T056: Unit tests for list_tasks
Task T057: Unit tests for complete_task
Task T058: Unit tests for delete_task
Task T059: Unit tests for update_task
Task T060: Network error tests

# And these in parallel:
Task T069: Update README.md
Task T070: Create quickstart checklist
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T017) - CRITICAL
3. Complete Phase 3: User Story 1 - add_task (T018-T024)
4. Complete Phase 4: User Story 2 - list_tasks (T025-T032)
5. **STOP and VALIDATE**: Test create and list workflow independently
6. Run basic integration test (create→list)
7. **MVP READY**: Can create and view tasks via MCP tools

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (add_task) → Test independently → MVP capability!
3. Add User Story 2 (list_tasks) → Test independently → Read capability!
4. Add User Story 3 (complete_task) → Test independently → Task completion!
5. Add User Story 4 (delete_task) → Test independently → Full lifecycle!
6. Add User Story 5 (update_task) → Test independently → Complete CRUD!
7. Add Polish Phase → Full testing and documentation → Production ready!

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T017)
2. Once Foundational is done:
   - Developer A: User Story 1 (add_task) - T018-T024
   - Developer B: User Story 2 (list_tasks) - T025-T032
   - Developer C: User Story 3 (complete_task) - T033-T039
   - Developer D: User Story 4 (delete_task) - T040-T046
   - Developer E: User Story 5 (update_task) - T047-T053
3. All developers merge tools into `server.py` (requires coordination since same file)
4. Team completes Polish Phase together (T054-T074)

**Note**: Since all tools are in a single `server.py` file, parallel development requires careful merge coordination or feature branches per tool.

---

## Notes

- **[P]** tasks = different files or independent concerns, no dependencies
- **[Story]** label maps task to specific user story for traceability (US1-US5)
- Each user story implements one MCP tool that wraps one backend API endpoint
- All tools use the shared `_make_api_request()` helper for consistent error handling
- No direct database access - all persistence delegated to backend API
- Backend API must be running on http://localhost:8000 for integration testing
- Each tool is independently testable via MCP client or integration tests
- Type hints required for all functions (mypy --strict validation)
- PEP 8 compliance enforced via ruff formatting and linting
- Constitutional Principle II (Pythonic Excellence) and IV (Type Safety) compliance verified in each task
