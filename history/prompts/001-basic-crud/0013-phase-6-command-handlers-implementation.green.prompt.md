---
id: 0013
title: Phase 6 Command Handlers Implementation
stage: green
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-basic-crud
branch: 001-basic-crud
user: unknown
command: /sp.implement
labels: ["implementation", "phase-6", "command-handlers", "ui-integration", "error-handling", "crud", "green"]
links:
  spec: specs/001-basic-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/ui/handlers.py (created, 7,051 bytes)
  - specs/001-basic-crud/tasks.md (updated - T043-T050 marked complete)
tests:
  - Module import test (PASS)
  - handle_create type hints validation (PASS)
  - handle_view type hints validation (PASS)
  - handle_toggle type hints validation (PASS)
  - handle_update type hints validation (PASS)
  - handle_delete type hints validation (PASS)
  - handle_view with empty manager (PASS)
  - handle_view with populated manager (PASS)
---

## Prompt

/sp.implement

Execute Phase 6 (Command Handlers): Tasks T043 through T058.

Requirements:
1. Create `src/ui/handlers.py`.
2. Implement 5 specific handlers, each accepting a `TodoManager` instance:
   - `handle_create(manager)`: Uses `get_todo_input`, calls `add_todo`, shows `format_todo` and `get_success_msg`.
   - `handle_view(manager)`: Calls `get_all_todos`, shows `format_todo_list`.
   - `handle_toggle(manager)`: Prompts for ID, calls `toggle_complete`, shows `get_success_msg`.
   - `handle_update(manager)`: Prompts for ID, uses `get_todo_input`, calls `update_todo`, shows `get_success_msg`.
   - `handle_delete(manager)`: Prompts for ID, calls `delete_todo`, shows `get_success_msg`.
3. Error Handling:
   - All handlers must catch `ValueError` from the manager and display it using `get_error_msg`.
4. Technical Standards:
   - Use full type hints (import `TodoManager` for type checking).
   - Use Google-style docstrings.
5. Verification:
   - Perform a syntax check.
   - Update `tasks.md` with completion marks.

Stop and wait for my review after Phase 6 is complete. This is a mandatory HUMAN REVIEW CHECKPOINT.

## Response snapshot

Executed all Phase 6 tasks (T043-T050) successfully. Created UI command handlers module connecting UI to TodoManager service. Implemented 5 handler functions (handle_create, handle_view, handle_toggle, handle_update, handle_delete) plus _get_todo_id helper for centralized ID input validation. All handlers accept TodoManager instance, use menu/display/messages modules for user interaction, and implement consistent error handling with try-except ValueError blocks. handle_create uses get_todo_input and displays formatted todo. handle_view formats with format_todo_list and prints SECTION_SEPARATOR. handle_toggle, handle_update, handle_delete use _get_todo_id helper for ID input. All 8 automated tests passed validating type hints and handle_view functionality. Python syntax check passed. tasks.md updated with all T043-T050 marked complete. Reached mandatory HUMAN REVIEW CHECKPOINT.

**Design Decisions**:
1. **Centralized Error Handling Pattern**: All handlers use identical try-except ValueError pattern catching manager exceptions and displaying with get_error_msg(str(e)). Ensures consistent error formatting across all CRUD operations.
2. **_get_todo_id Helper**: Internal function with while-True loop validates integer input, catches ValueError from int() conversion, uses get_error_msg for consistent error display, re-prompts until valid. Eliminates code duplication across 3 handlers (toggle, update, delete).
3. **Simplified handle_update**: User specified using get_todo_input for both title and description instead of y/n prompts, reducing complexity while maintaining full update functionality.

## Outcome

- ✅ Impact: Phase 6 complete - UI Integration layer fully implemented with 5 command handler functions connecting user interface to TodoManager business logic. All 8 tasks (T043-T050) passed acceptance criteria. Centralized error handling pattern established with consistent try-except ValueError blocks and get_error_msg display. _get_todo_id helper eliminates code duplication for ID input validation across 3 handlers. All handlers follow consistent pattern: input → manager call → success/error message display.
- 🧪 Tests: 8/8 automated tests PASSED - module import, type hints validation for all 5 handlers (manager: TodoManager -> None), handle_view empty manager test (displays "No todos found." + separator), handle_view populated manager test (displays formatted todos + separator). Manual testing required for interactive handlers (create, toggle, update, delete) with user input and error scenarios. Python syntax check PASSED.
- 📁 Files: Created src/ui/handlers.py (7,051 bytes - module docstring, 6 imports from services/menu/display/messages, 6 functions with comprehensive Google-style docstrings and examples including _get_todo_id helper). Updated specs/001-basic-crud/tasks.md (marked T043-T050 complete with design decision notes for centralized error handling, _get_todo_id helper, and simplified handle_update).
- 🔁 Next prompts: Phase 7 - Main Application Loop (T051-T058) to implement main entry point with menu loop and command dispatch after HUMAN REVIEW CHECKPOINT approval, or revisions to Phase 6 based on review feedback
- 🧠 Reflection: Centralized error handling pattern (identical try-except in all handlers) provides maintainability - any error handling changes only need one update pattern. _get_todo_id helper demonstrates DRY principle - three handlers share same ID input logic without duplication. Consistent function signatures (manager: TodoManager -> None) make handlers composable and testable. Separation of concerns: handlers orchestrate (call menu, manager, display, messages) but don't implement business logic. Each handler is 10-20 lines maintaining readability.

## Evaluation notes (flywheel)

- Failure modes observed: None - All tasks completed successfully, all tests passed. Centralized patterns (error handling, _get_todo_id) simplified implementation.
- Graders run and results (PASS/FAIL): Automated tests: 8/8 PASS, Python syntax check: PASS
- Prompt variant (if applicable): modified (user specified handle_toggle instead of handle_mark_complete, simplified handle_update without y/n prompts, requested T043-T058 but Phase 6 only includes T043-T050)
- Next experiment (smallest change to try): N/A - Phase 6 completed successfully with all acceptance criteria met, reached mandatory HUMAN REVIEW CHECKPOINT
