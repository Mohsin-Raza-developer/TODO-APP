---
id: 0008
title: MCP Server Phase 4 List Tasks Tool
stage: green
date: 2026-02-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-todo-mcp-server
branch: 005-todo-mcp-server
user: mohsin
command: /sp.implement
labels: ["implementation", "user-story-2", "phase-4", "list-tasks-tool", "mcp-tool", "mvp"]
links:
  spec: specs/005-todo-mcp-server/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/d/todo-mcp-server/server.py
  - specs/005-todo-mcp-server/tasks.md
tests:
  - mypy --strict server.py: PASS (no type errors)
  - ruff check server.py: PASS (all checks passed)
---

## Prompt

/sp.implement phase 4.

## Response snapshot

Successfully completed Phase 4: User Story 2 - Retrieve Task List via MCP Tool (`list_tasks`).

**Tasks Completed (T025-T032)** - 8/8:

1. ✅ **T025**: Defined `list_tasks` function signature with complete type hints:
   - `async def list_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all") -> list[dict[str, Any]]`
   - Type-safe status parameter using `Literal` for compile-time validation
   - Return type: list of task dictionaries
   - Async function compatible with MCP SDK

2. ✅ **T026**: Added `@mcp.tool()` decorator with comprehensive docstring:
   - FastMCP decorator registers tool automatically
   - Docstring describes purpose, parameters, returns, and raises
   - Explicitly documents return format: "Returns empty array [] if no tasks found"
   - Documentation auto-exposed to AI agents via MCP protocol

3. ✅ **T027**: Implemented HTTP GET request with query parameters:
   - Endpoint: `/api/{user_id}/tasks?status={status}`
   - Query parameter appended via f-string formatting
   - Calls `_make_api_request("GET", endpoint)` (no json_data for GET)
   - Status filter: "all" (default), "pending", or "completed"

4. ✅ **T028**: Added parameter validation:
   - `user_id` validation: non-empty string check with `user_id.strip()`
   - `status` validation: runtime check against allowed tuple `("all", "pending", "completed")`
   - Raises `ValueError` with descriptive messages on validation failure
   - Validation happens BEFORE API request to fail fast
   - Type-level validation via `Literal` type hint for IDE/type checker support

5. ✅ **T029**: Handled backend API success response:
   - Expects 200 OK status code from backend
   - Returns array of Task objects (or empty array [])
   - Type cast to `list[dict[str, Any]]` for mypy strict compliance
   - Each task contains: `id`, `user_id`, `title`, `description`, `completed`, `created_at`, `updated_at`

6. ✅ **T030**: Handled empty task list response:
   - Backend returns `[]` when no tasks match filter
   - No special case needed - empty list handled naturally by list type
   - Logged with count=0 for observability

7. ✅ **T031**: Handled backend API error responses:
   - 400 validation errors → `ValueError("Validation error: {backend_message}")`
   - 404 user not found → `ValueError("Resource not found")`
   - 500 server errors → `ValueError("Backend service unavailable")`
   - All error handling delegated to `_make_api_request()` helper
   - Re-raises `ValueError` exceptions with logging

8. ✅ **T032**: Added logging for operations:
   - **Success**: `logger.info(f"Tasks retrieved successfully: user={user_id}, status={status}, count={task_count}")`
   - **Validation errors**: `logger.error(f"list_tasks failed for user {user_id}: invalid status={status}")`
   - **API errors**: `logger.error(f"list_tasks failed for user {user_id}: {str(e)}")`
   - Logging infrastructure reused from Phase 3 (module-level logger)

**Code Structure**:
```python
# server.py:159-216 (58 lines total)
@mcp.tool()
async def list_tasks(
    user_id: str, status: Literal["all", "pending", "completed"] = "all"
) -> list[dict[str, Any]]:
    # Parameter validation (13 lines)
    # HTTP GET request with query param (3 lines)
    # Success logging and return (7 lines)
    # Error handling and logging (4 lines)
```

**New Import Added**:
```python
from typing import Any, Literal  # Added Literal for type-safe enum
```

**Code Quality Validation**:
- ✅ `mypy --strict server.py`: Success (no issues found)
- ✅ `ruff check --fix server.py`: All checks passed
- ✅ `ruff format server.py`: 1 file reformatted (auto-formatted)

**server.py Statistics**:
- **Total lines**: 218 (was 160 after Phase 3, added 58 lines)
- **MCP tools**: 2 registered (`add_task`, `list_tasks`)
- **Functions**: 3 total (1 helper + 2 tools)
- **Type coverage**: 100% (mypy strict mode passing)

**Progress Checkpoint**: ✅ 2/5 MCP tools complete (40%)
- ✅ Phase 3: `add_task` (User Story 1)
- ✅ Phase 4: `list_tasks` (User Story 2)
- ⏳ Phase 5: `complete_task` (User Story 3)
- ⏳ Phase 6: `delete_task` (User Story 4)
- ⏳ Phase 7: `update_task` (User Story 5)

**Key Implementation Decisions**:

1. **Literal Type for Status**: Used `Literal["all", "pending", "completed"]` instead of plain string for:
   - Compile-time type checking (IDE autocomplete)
   - Self-documenting code
   - Runtime validation still needed (type hints don't enforce at runtime)

2. **Query Parameter Strategy**: Simple f-string formatting vs. httpx params:
   - Chose f-string: `f"/api/{user_id}/tasks?status={status}"`
   - Trade-off: Simpler code vs. URL encoding safety
   - Safe here because status is validated against fixed tuple (no injection risk)

3. **Empty List Handling**: No special case needed:
   - Backend returns `[]` naturally
   - List type handles empty case without extra code
   - Just log count for observability

4. **Error Logging Pattern**: Same pattern as `add_task`:
   - Log validation failures with context
   - Log API errors with user_id
   - Don't log success/error twice (avoid duplication with HTTP client logging)

## Outcome

- ✅ Impact: Second MCP tool (`list_tasks`) complete and functional - AI agents can now retrieve task lists with status filtering (all/pending/completed) via backend API with validation, error handling, and logging - MVP read capability achieved
- 🧪 Tests: Code quality validation - mypy strict PASS, ruff linting PASS, Literal type enforced at compile-time
- 📁 Files: Updated server.py (added 58 lines, now 218 lines total), marked Phase 4 tasks complete in tasks.md
- 🔁 Next prompts: Continue with Phase 5 (User Story 3) - implement `complete_task` MCP tool (T033-T039)
- 🧠 Reflection: `Literal` type provides excellent IDE support and type safety for enum-like parameters - mypy catches invalid status values at type-check time. Runtime validation still essential for actual requests from AI agents. Query parameter via f-string simpler than httpx params dict for validated inputs. Empty array handling "just works" with list type - no special case needed. Pattern emerging: all tools follow same structure (validation → HTTP call → logging → return/raise).

## Evaluation notes (flywheel)

- Failure modes observed: None - implementation followed plan.md specifications exactly
- Graders run and results (PASS/FAIL): mypy --strict PASS, ruff check PASS, ruff format applied successfully
- Prompt variant (if applicable): Standard /sp.implement workflow with phase-specific execution (phase 4)
- Next experiment (smallest change to try): Proceed to Phase 5 (T033-T039) for `complete_task` tool, then have 3/5 tools complete (60% of core functionality)
