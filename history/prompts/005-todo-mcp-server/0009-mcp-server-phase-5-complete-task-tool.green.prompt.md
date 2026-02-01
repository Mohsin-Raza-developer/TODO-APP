---
id: 0009
title: MCP Server Phase 5 Complete Task Tool
stage: green
date: 2026-02-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-todo-mcp-server
branch: 005-todo-mcp-server
user: mohsin
command: /sp.implement
labels: ["implementation", "user-story-3", "phase-5", "complete-task-tool", "mcp-tool", "toggle-completion"]
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

/sp.implement phase 5.

## Response snapshot

Successfully completed Phase 5: User Story 3 - Toggle Task Completion via MCP Tool (`complete_task`).

**Tasks Completed (T033-T039)** - 7/7:

1. ✅ **T033**: Defined `complete_task` function signature with complete type hints:
   - `async def complete_task(user_id: str, task_id: int) -> dict[str, Any]`
   - Full Python 3.13+ type annotations
   - Async function compatible with MCP SDK
   - task_id as int (positive integer validation)

2. ✅ **T034**: Added `@mcp.tool()` decorator with comprehensive docstring:
   - FastMCP decorator registers tool automatically
   - Docstring explicitly describes toggle behavior: "If the task is currently incomplete (completed=false), it will be marked as complete. If it's already complete, it will be marked as incomplete."
   - Documentation auto-exposed to AI agents via MCP protocol

3. ✅ **T035**: Implemented HTTP PATCH request:
   - Calls `_make_api_request("PATCH", f"/api/{user_id}/tasks/{task_id}/complete")`
   - Endpoint: `/api/{user_id}/tasks/{task_id}/complete`
   - No json_data parameter (PATCH endpoint toggles server-side)

4. ✅ **T036**: Added parameter validation:
   - `user_id` validation: non-empty string check with `user_id.strip()`
   - `task_id` validation: positive integer check (`task_id <= 0` raises error)
   - Raises `ValueError` with descriptive messages on validation failure
   - Validation happens BEFORE API request to fail fast

5. ✅ **T037**: Handled backend API success response:
   - Expects 200 OK status code from backend
   - Returns full Task object with updated `completed` status
   - Type cast to `dict[str, Any]` for mypy strict compliance
   - Extracts new completion status for logging

6. ✅ **T038**: Handled backend API error responses:
   - 404 task not found → `ValueError("Resource not found")`
   - 403 access denied → `ValueError("Access denied - insufficient permissions")`
   - 500 server errors → `ValueError("Backend service unavailable")`
   - All error handling delegated to `_make_api_request()` helper
   - Re-raises `ValueError` exceptions with task_id context in logging

7. ✅ **T039**: Added logging for operations:
   - **Success**: `logger.info(f"Task completion toggled successfully: user={user_id}, task_id={task_id}, completed={new_status}")`
   - **Validation errors**: `logger.error(f"complete_task failed for user {user_id}: task_id={task_id} is invalid")`
   - **API errors**: `logger.error(f"complete_task failed for user {user_id}, task_id={task_id}: {str(e)}")`
   - Logging infrastructure reused from Phase 3 (module-level logger)

**Code Structure**:
```python
# server.py:218-267 (50 lines total)
@mcp.tool()
async def complete_task(user_id: str, task_id: int) -> dict[str, Any]:
    # Parameter validation (10 lines)
    # HTTP PATCH request (5 lines)
    # Success logging and return (7 lines)
    # Error handling and logging (4 lines)
```

**Code Quality Validation**:
- ✅ `mypy --strict server.py`: Success (no issues found)
- ✅ `ruff check server.py`: All checks passed
- ✅ `ruff format server.py`: 1 file reformatted (line length fix applied)

**server.py Statistics**:
- **Total lines**: 271 (was 218 after Phase 4, added 53 lines)
- **MCP tools**: 3 registered (`add_task`, `list_tasks`, `complete_task`)
- **Functions**: 4 total (1 helper + 3 tools)
- **Type coverage**: 100% (mypy strict mode passing)

**Progress Checkpoint**: ✅ 3/5 MCP tools complete (60%)
- ✅ Phase 3: `add_task` (User Story 1 - P1)
- ✅ Phase 4: `list_tasks` (User Story 2 - P1)
- ✅ Phase 5: `complete_task` (User Story 3 - P2)
- ⏳ Phase 6: `delete_task` (User Story 4 - P2)
- ⏳ Phase 7: `update_task` (User Story 5 - P3)

**Key Implementation Decisions**:

1. **Integer Type for task_id**: Used `int` instead of `str` for task_id:
   - Matches backend API contract (integer IDs)
   - Enables positive integer validation (`task_id <= 0`)
   - Type-safe at compile time with mypy

2. **No JSON Payload for PATCH**: Backend endpoint toggles completion server-side:
   - No request body needed
   - Simplified client logic
   - Backend maintains toggle logic (single source of truth)

3. **Logging New Status**: Extract and log the new completion status:
   - `new_status = task_result.get("completed", "unknown")`
   - Provides observability for toggle operations
   - Helps debug toggle logic issues

4. **Line Length Fix**: Split long log message across two lines:
   - Kept under 100 character limit (ruff E501)
   - Maintained readability with string concatenation

## Outcome

- ✅ Impact: Third MCP tool (`complete_task`) complete and functional - AI agents can now toggle task completion status (incomplete↔complete) via backend API with validation, error handling, and logging - 60% of core CRUD functionality achieved
- 🧪 Tests: Code quality validation - mypy strict PASS, ruff linting PASS, ruff formatting applied
- 📁 Files: Updated server.py (added 53 lines, now 271 lines total), marked Phase 5 tasks complete in tasks.md
- 🔁 Next prompts: Continue with Phase 6 (User Story 4) - implement `delete_task` MCP tool (T040-T046)
- 🧠 Reflection: Toggle pattern on PATCH endpoint is elegant - no request body needed, backend handles state flip. Integer validation for task_id caught at type-check time with mypy. Pattern consistency across all 3 tools (validation → HTTP call → logging → return/raise) makes code predictable and maintainable. 60% of core functionality complete - 2 more tools (delete, update) remain before testing phase.

## Evaluation notes (flywheel)

- Failure modes observed: Initial ruff E501 error (line too long) - fixed by splitting log message across two lines
- Graders run and results (PASS/FAIL): mypy --strict PASS, ruff check PASS (after line length fix), ruff format PASS
- Prompt variant (if applicable): Standard /sp.implement workflow with phase-specific execution (phase 5)
- Next experiment (smallest change to try): Proceed to Phase 6 (T040-T046) for `delete_task` tool, then have 4/5 tools complete (80% of core functionality)
