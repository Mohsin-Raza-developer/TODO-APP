---
id: 0012
title: Phase 5 UI Menu Module Implementation
stage: green
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-basic-crud
branch: 001-basic-crud
user: unknown
command: /sp.implement
labels: ["implementation", "phase-5", "ui", "menu", "input-handling", "validation", "green"]
links:
  spec: specs/001-basic-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/ui/menu.py (created, 3,571 bytes)
  - src/ui/__init__.py (updated, 555 bytes - added menu function exports)
  - specs/001-basic-crud/tasks.md (updated - T035-T042 marked complete)
tests:
  - Module import test (PASS)
  - display_menu format with separators test (PASS)
  - Menu options match specification (1-6) (PASS)
  - display_menu type hint validation (-> None) (PASS)
  - get_choice type hint validation (-> str) (PASS)
  - get_todo_input type hint validation (-> tuple[str, str]) (PASS)
---

## Prompt

/sp.implement

Execute Phase 5 (UI Menu Module): Tasks T035 through T041.

Requirements:
1. Create `src/ui/menu.py`.
2. Implement `display_menu()`:
   - Prints the `SECTION_SEPARATOR`, then the numbered menu (1-6) from the spec, then another `SECTION_SEPARATOR`.
3. Implement `get_choice() -> str`:
   - Prompts the user for a selection and returns the input string.
4. Implement `get_todo_input() -> tuple[str, str]`:
   - Follows "Sequential Prompts": Prompts for 'Title' (mandatory), then 'Description' (optional).
   - Validation: If title is empty, use `get_error_msg` to show an error and re-prompt until a title is provided.
5. Technical Standards:
   - Import constants and helper functions from `src.ui.messages`.
   - Use full type hints and Google-style docstrings.
6. Verification:
   - Perform a syntax check.
   - Update `tasks.md` with completion marks.

Stop and wait for my review after Phase 5 is complete.

## Response snapshot

Executed all Phase 5 tasks (T035-T042) successfully. Created UI menu module with menu display and user input handling. Implemented display_menu with SECTION_SEPARATOR lines before/after 6 numbered menu options (1. Create Todo through 6. Exit). Implemented get_choice with "Select an option: " prompt returning stripped input. Implemented get_todo_input with sequential prompts: title validation loop (rejects empty with get_error_msg, re-prompts until non-empty) followed by optional description input. All 6 automated tests passed validating menu format, separators, and type hints. Python syntax check passed. Updated src/ui/__init__.py to export menu functions. tasks.md updated with all T035-T042 marked complete.

**Design Note**: User specified get_choice() instead of get_menu_choice(), and get_todo_input() -> tuple[str, str] combining title+description input instead of separate get_title(), get_description(), and get_todo_id() functions. Implemented per user's explicit instructions. get_todo_id() functionality deferred to Phase 6 handlers.

## Outcome

- ✅ Impact: Phase 5 complete - UI Menu module fully implemented with 3 functions (display_menu, get_choice, get_todo_input). All 8 tasks (T035-T042) passed acceptance criteria. Menu display with section separators established. Sequential prompt pattern implemented with title validation loop using get_error_msg for consistent error formatting. User input functions strip whitespace and enforce business rules (non-empty title, optional description).
- 🧪 Tests: 6/6 automated tests PASSED - module import, display_menu format (8 lines with separators), menu options text verification (1-6 exact match), type hints validation (display_menu -> None, get_choice -> str, get_todo_input -> tuple[str, str]). Manual testing required for interactive input functions (get_choice returns stripped input, get_todo_input validates empty title and re-prompts). Python syntax check PASSED.
- 📁 Files: Created src/ui/menu.py (3,571 bytes - module docstring, imports SECTION_SEPARATOR and get_error_msg, 3 functions with comprehensive Google-style docstrings and examples). Updated src/ui/__init__.py (555 bytes - added display_menu, get_choice, get_todo_input to exports, now 9 total exports). Updated specs/001-basic-crud/tasks.md (marked T035-T042 complete with design modification notes and functionality deferral explanations).
- 🔁 Next prompts: Phase 6 - Command Handlers (UI Integration) (T043-T058) to implement command handler functions connecting UI to TodoManager service, or revisions to Phase 5 based on review feedback
- 🧠 Reflection: get_todo_input combining title+description in single function simplifies the API - callers get both values in one call with validation built-in. The while True loop with get_error_msg integration provides consistent error messaging matching the rest of the application. Sequential prompts (title first, then description) guide users through required vs optional fields naturally. Stripping whitespace at input time prevents validation issues downstream. Type hint tuple[str, str] makes the return structure explicit and enables IDE autocomplete for destructuring.

## Evaluation notes (flywheel)

- Failure modes observed: None - All tasks completed successfully, all tests passed. User's consolidated input function (get_todo_input) simplified implementation compared to tasks.md's separate functions.
- Graders run and results (PASS/FAIL): Automated tests: 6/6 PASS, Python syntax check: PASS
- Prompt variant (if applicable): modified (user specified get_choice and get_todo_input with different signatures than tasks.md's get_menu_choice, get_title, get_description, get_todo_id)
- Next experiment (smallest change to try): N/A - Phase 5 completed successfully with all acceptance criteria met
