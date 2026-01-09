---
id: 0009
title: Phase 2 TodoManager Service Implementation
stage: green
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-basic-crud
branch: 001-basic-crud
user: unknown
command: /sp.implement
labels: ["implementation", "phase-2", "todomanager", "crud", "validation", "id-counter", "green"]
links:
  spec: specs/001-basic-crud/spec.md
  ticket: null
  adr: history/adr/0001-todo-storage-todoitem-dataclass-with-dictionary-index.md, history/adr/0003-global-id-counter-encapsulated-in-todomanager-class.md
  pr: null
files:
  - src/services/__init__.py (created)
  - src/services/todo_manager.py (created)
  - specs/001-basic-crud/tasks.md (updated - T010-T021 marked complete)
tests:
  - TodoManager initialization test (PASS)
  - Create 3 todos with sequential IDs (PASS)
  - get_all_todos returns sorted list (PASS)
  - get_todo retrieves by ID (PASS)
  - toggle_complete flips boolean (PASS)
  - update_todo modifies fields (PASS)
  - delete_todo removes item (PASS)
  - ID reuse prevention: new todo gets ID 4 after deleting ID 2 (PASS)
  - Empty title validation (PASS)
  - Title >200 chars validation (PASS)
  - Non-existent ID validation (PASS)
  - Python syntax check (PASS)
---

## Prompt

/sp.implement

Execute Phase 2 (Todo Manager Service): Tasks T010 through T021.

Requirements:
1. Create `src/services/todo_manager.py`.
2. Implement the `TodoManager` class based on ADR-003 and ADR-001.
3. State Management:
   - Initialize a private `_todos: dict[int, TodoItem]` to empty.
   - Initialize a private `_next_id: int` starting at 1.
4. Business Logic Methods:
   - `add_todo(title: str, description: str = "") -> TodoItem`: Validates title is not empty, creates item, increments ID.
   - `get_all_todos() -> list[TodoItem]`: Returns list of all stored tasks.
   - `get_todo(todo_id: int) -> TodoItem`: Returns the task or raises a ValueError if not found.
   - `update_todo(todo_id: int, title: str = None, description: str = None) -> TodoItem`: Updates fields if provided.
   - `delete_todo(todo_id: int) -> bool`: Removes task or raises ValueError.
   - `toggle_complete(todo_id: int) -> TodoItem`: Flips the 'completed' boolean.
5. Verification:
   - Perform a syntax check.
   - Ensure `tasks.md` is updated as each task (T010-T021) completes.

Stop and wait for my review once all Phase 2 tasks are marked as completed. This is a mandatory HUMAN REVIEW CHECKPOINT.

## Response snapshot

Executed all Phase 2 tasks (T010-T021) successfully. Created TodoManager service with 6 CRUD methods (add_todo, get_all_todos, get_todo, update_todo, delete_todo, toggle_complete). Implemented comprehensive validation for title (non-empty, ≤200 chars) and description (≤1000 chars). Encapsulated ID counter in TodoManager class starting at 1, incrementing with each creation, never resetting or reusing deleted IDs. Comprehensive REPL testing verified ID reuse prevention: created IDs 1,2,3, deleted 2, new todo got ID 4 (not 2). All 12 tasks marked complete in tasks.md. Python syntax check passed. Reached mandatory HUMAN REVIEW CHECKPOINT.

## Outcome

- ✅ Impact: Phase 2 complete - TodoManager service fully implemented with 6 CRUD methods, comprehensive validation, and ID counter that never resets or reuses deleted IDs. All 12 tasks (T010-T021) passed acceptance criteria. Critical ID reuse prevention verified: deleted ID 2, next ID was 4 (not 2). ADR-001 (dict storage) and ADR-003 (encapsulated ID counter) fully implemented. 11/11 REPL tests passed. tasks.md updated with all completions. Mandatory HUMAN REVIEW CHECKPOINT reached.
- 🧪 Tests: 11/11 REPL tests PASSED - initialization, create 3 todos, get_all_todos sorted, get_todo by ID, toggle_complete, update_todo, delete_todo, ID reuse prevention (critical), empty title validation, title >200 validation, non-existent ID validation. Python syntax check PASSED.
- 📁 Files: Created src/services/__init__.py (282 bytes - TodoManager export), src/services/todo_manager.py (9,167 bytes - full implementation with docstrings). Updated specs/001-basic-crud/tasks.md (marked T010-T021 complete with modification notes).
- 🔁 Next prompts: Phase 3 - UI Messages Module (T022-T028) after user approval from HUMAN REVIEW CHECKPOINT, or revisions to Phase 2 based on review feedback
- 🧠 Reflection: ID reuse prevention is the most critical feature - verified with explicit test (delete ID 2, verify next is 4 not 2). User's design modifications (add_todo vs create_todo, toggle_complete vs mark_complete, bool vs Literal) simplify the API while maintaining functionality. Comprehensive Google-style docstrings with examples make the code self-documenting. All validation raises ValueError consistently for predictable error handling. The encapsulated ID counter in TodoManager (ADR-003) ensures no global state pollution.

## Evaluation notes (flywheel)

- Failure modes observed: None - All tasks completed successfully, all tests passed, ID reuse prevention verified
- Graders run and results (PASS/FAIL): Manual REPL tests: 11/11 PASS, Python syntax check: PASS
- Prompt variant (if applicable): modified (user specified method names and return types different from spec)
- Next experiment (smallest change to try): N/A - Phase 2 completed successfully with all acceptance criteria met
