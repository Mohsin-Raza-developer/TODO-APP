---
id: 0011
title: MCP Server Phase 7 Update Task Tool
stage: green
date: 2026-02-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-todo-mcp-server
branch: 005-todo-mcp-server
user: mohsin
command: /sp.implement
labels: ["implementation", "user-story-5", "phase-7", "update-task-tool", "mcp-tool", "crud-complete"]
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

/sp.implement phase 7.

## Response snapshot

Successfully completed Phase 7: User Story 5 - Update Task Details via MCP Tool (`update_task`).

**Tasks Completed (T047-T053)** - 7/7:

1. ✅ **T047**: Defined `update_task` function signature with complete type hints:
   - `async def update_task(user_id: str, task_id: int, title: str | None = None, description: str | None = None) -> dict[str, Any]`
   - Full Python 3.13+ type annotations with optional parameters
   - Union type syntax: `str | None` for optional fields
   - Async function compatible with MCP SDK

2. ✅ **T048**: Added `@mcp.tool()` decorator with comprehensive docstring:
   - FastMCP decorator registers tool automatically
   - Docstring explicitly explains: "This is a partial update - only the provided fields (title, description) will be modified"
   - Documents that completion status is not affected
   - Documentation auto-exposed to AI agents via MCP protocol

3. ✅ **T049**: Implemented HTTP PUT request with dynamic JSON payload:
   - Calls `_make_api_request("PUT", f"/api/{user_id}/tasks/{task_id}", json_data=update_data)`
   - Endpoint: `/api/{user_id}/tasks/{task_id}`
   - Builds `update_data` dict with only non-None fields:
     ```python
     update_data: dict[str, str] = {}
     if title is not None:
         update_data["title"] = title.strip()
     if description is not None:
         update_data["description"] = description
     ```
   - Strips whitespace from title before sending

4. ✅ **T050**: Added parameter validation:
   - `user_id` validation: non-empty string check with `user_id.strip()`
   - `task_id` validation: positive integer check (`task_id <= 0` raises error)
   - **At least one field validation**: `if title is None and description is None` raises error
   - Raises `ValueError` with descriptive messages on validation failure
   - Validation happens BEFORE API request to fail fast

5. ✅ **T051**: Handled backend API success response:
   - Expects 200 OK status code from backend
   - Returns full Task object with updated fields
   - Type cast to `dict[str, Any]` for mypy strict compliance
   - Extracts updated fields list for logging

6. ✅ **T052**: Handled backend API error responses:
   - 400 validation errors → `ValueError("Validation error: {backend_message}")`
   - 404 task not found → `ValueError("Resource not found")`
   - 500 server errors → `ValueError("Backend service unavailable")`
   - All error handling delegated to `_make_api_request()` helper
   - Re-raises `ValueError` exceptions with task_id context in logging

7. ✅ **T053**: Added logging for operations:
   - **Success**: `logger.info(f"Task updated successfully: user={user_id}, task_id={task_id}, fields={updated_fields}")`
   - **Validation errors**: `logger.error(f"update_task failed for user {user_id}, task_id={task_id}: no fields to update")`
   - **API errors**: `logger.error(f"update_task failed for user {user_id}, task_id={task_id}: {str(e)}")`
   - Logs which fields were updated (["title"], ["description"], or ["title", "description"])

**Code Structure**:
```python
# server.py:319-393 (75 lines total)
@mcp.tool()
async def update_task(
    user_id: str,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
) -> dict[str, Any]:
    # Parameter validation (16 lines)
    # Build endpoint and JSON payload (10 lines)
    # HTTP PUT request (3 lines)
    # Success logging and return (8 lines)
    # Error handling and logging (4 lines)
```

**Code Quality Validation**:
- ✅ `mypy --strict server.py`: Success (no issues found)
- ✅ `ruff check server.py`: All checks passed
- ✅ `ruff format server.py`: 1 file reformatted (auto-formatted)

**server.py Statistics**:
- **Total lines**: 394 (was 320 after Phase 6, added 74 lines)
- **MCP tools**: 5 registered (`add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`)
- **Functions**: 6 total (1 helper + 5 tools)
- **Type coverage**: 100% (mypy strict mode passing)

**Progress Checkpoint**: ✅ 5/5 MCP tools complete (100%)
- ✅ Phase 3: `add_task` (User Story 1 - P1)
- ✅ Phase 4: `list_tasks` (User Story 2 - P1)
- ✅ Phase 5: `complete_task` (User Story 3 - P2)
- ✅ Phase 6: `delete_task` (User Story 4 - P2)
- ✅ Phase 7: `update_task` (User Story 5 - P3)

**Key Implementation Decisions**:

1. **Optional Parameters Pattern**: Used `str | None = None` for partial updates:
   - Allows callers to update just title, just description, or both
   - Modern Python 3.10+ union type syntax
   - None values explicitly excluded from JSON payload

2. **Dynamic JSON Payload Construction**: Builds payload based on provided parameters:
   - Only includes non-None fields in request body
   - Prevents sending `null` values to backend
   - Backend receives only fields to be updated
   - Clean separation: validation → payload building → API call

3. **At Least One Field Validation**: Enforces meaningful updates:
   - `if title is None and description is None: raise ValueError(...)`
   - Prevents empty update requests
   - Clear error message guides AI agents

4. **Updated Fields Logging**: Tracks which fields changed:
   - `updated_fields = list(update_data.keys())`
   - Logs `["title"]`, `["description"]`, or `["title", "description"]`
   - Provides audit trail for partial updates

5. **Title Whitespace Stripping**: Consistent with `add_task`:
   - `update_data["title"] = title.strip()`
   - Maintains data quality
   - No stripping for description (preserves formatting)

**CRUD Coverage**: 100% complete ✅
- ✅ **C**reate: `add_task`
- ✅ **R**ead: `list_tasks`
- ✅ **U**pdate (partial - completion): `complete_task`
- ✅ **U**pdate (full - title/description): `update_task`
- ✅ **D**elete: `delete_task`

## Outcome

- ✅ Impact: Fifth and final MCP tool (`update_task`) complete and functional - AI agents can now perform full CRUD operations on tasks via backend API with partial update support, validation, error handling, and logging - 100% of core functionality achieved
- 🧪 Tests: Code quality validation - mypy strict PASS, ruff linting PASS, ruff formatting applied
- 📁 Files: Updated server.py (added 74 lines, now 394 lines total), marked Phase 7 tasks complete in tasks.md
- 🔁 Next prompts: Continue with Phase 8 (Testing & Polish) - implement unit tests, integration tests, and documentation (T054-T074)
- 🧠 Reflection: Partial update pattern most complex so far - optional parameters with `str | None`, dynamic payload construction, at-least-one-field validation. Ruff auto-format handled all formatting perfectly. Pattern consistency across all 5 tools makes codebase highly maintainable. All 5 user stories complete - MCP server provides full CRUD API for AI agents. Next phase focuses on testing, documentation, and polish.

## Evaluation notes (flywheel)

- Failure modes observed: None - implementation followed plan.md specifications exactly, ruff auto-format applied successfully
- Graders run and results (PASS/FAIL): mypy --strict PASS, ruff check PASS, ruff format applied
- Prompt variant (if applicable): Standard /sp.implement workflow with phase-specific execution (phase 7)
- Next experiment (smallest change to try): Proceed to Phase 8 (T054-T074) for testing and polish - unit tests with pytest, integration tests, README updates, code coverage
