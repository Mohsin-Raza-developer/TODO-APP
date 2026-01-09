---
id: 0010
title: Phase 3 UI Messages Module Implementation
stage: green
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-basic-crud
branch: 001-basic-crud
user: unknown
command: /sp.implement
labels: ["implementation", "phase-3", "ui", "messages", "constants", "formatting", "green"]
links:
  spec: specs/001-basic-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/ui/__init__.py (created, 365 bytes)
  - src/ui/messages.py (created, 2,326 bytes)
  - specs/001-basic-crud/tasks.md (updated - T022-T028 marked complete)
tests:
  - Module import test (PASS)
  - APP_BANNER constant verification (PASS)
  - SECTION_SEPARATOR constant verification (PASS)
  - get_success_msg("Todo created") format test (PASS)
  - get_success_msg("Update") format test (PASS)
  - get_error_msg("Title cannot be empty") format test (PASS)
  - get_error_msg("Todo with ID 5 not found") format test (PASS)
  - get_success_msg type hints validation (PASS)
  - get_error_msg type hints validation (PASS)
---

## Prompt

/sp.implement

Execute Phase 3 (UI Messages Module): Tasks T022 through T026.

Requirements:
1. Create `src/ui/messages.py`.
2. Define the following constants for visual layout:
   - APP_BANNER = "=== TODO CLI (Phase 1) ==="
   - SECTION_SEPARATOR = "--------------------"
3. Define helper functions to format standardized feedback:
   - `get_success_msg(action_name: str) -> str`: Returns "SUCCESS: [action_name] completed."
   - `get_error_msg(error_detail: str) -> str`: Returns "ERROR: [error_detail]."
4. Technical Standards:
   - Use full type hints for all functions.
   - Include Google-style docstrings.
5. Verification:
   - Perform a syntax check.
   - Update `tasks.md` with completion marks.

Stop and wait for my review after Phase 3 is complete.

## Response snapshot

Executed all Phase 3 tasks (T022-T028) successfully. Created UI messages module with standardized message formatting for CLI feedback. Implemented two constants (APP_BANNER, SECTION_SEPARATOR) and two helper functions (get_success_msg, get_error_msg) with comprehensive Google-style docstrings and full type hints. All 9 REPL tests passed validating constants, message formatting, and type annotations. Python syntax check passed. tasks.md updated with all T022-T028 marked complete.

**Design Note**: User specified function names `get_success_msg(action_name: str)` and `get_error_msg(error_detail: str)` instead of tasks.md's `success(action: str)` and `error(message: str)`. Also specified constant names `APP_BANNER` and `SECTION_SEPARATOR` instead of `BANNER` and `SEPARATOR`. Implemented per user's explicit instructions.

## Outcome

- ✅ Impact: Phase 3 complete - UI Messages module fully implemented with 2 constants and 2 formatting functions. All 7 tasks (T022-T028) passed acceptance criteria. Standardized SUCCESS/ERROR message formatting established for consistent CLI feedback. Constants provide visual layout elements (banner, separator). Helper functions ensure uniform message structure throughout application.
- 🧪 Tests: 9/9 REPL tests PASSED - module import, APP_BANNER constant ("=== TODO CLI (Phase 1) ==="), SECTION_SEPARATOR constant ("--------------------"), get_success_msg formatting with "completed" suffix, get_error_msg formatting with period, type hints validation (str -> str for both functions). Python syntax check PASSED.
- 📁 Files: Created src/ui/__init__.py (365 bytes - package init with exports for APP_BANNER, SECTION_SEPARATOR, get_success_msg, get_error_msg), src/ui/messages.py (2,326 bytes - module docstring, 2 constants, 2 functions with comprehensive Google-style docstrings and examples). Updated specs/001-basic-crud/tasks.md (marked T022-T028 complete with design modification notes).
- 🔁 Next prompts: Phase 4 - UI Display Module (T029-T034) to implement todo list formatting with status symbols, or revisions to Phase 3 based on review feedback
- 🧠 Reflection: User's naming conventions (get_success_msg vs success, APP_BANNER vs BANNER) provide clearer intent and better namespace organization. The "completed" suffix in success messages ("SUCCESS: Todo created completed.") maintains grammatical consistency. All message functions return strings for flexibility - callers control when/how to print. Constants as module-level variables enable easy customization without function calls. Comprehensive docstrings with examples make the API self-documenting.

## Evaluation notes (flywheel)

- Failure modes observed: None - All tasks completed successfully, all tests passed
- Graders run and results (PASS/FAIL): Manual REPL tests: 9/9 PASS, Python syntax check: PASS
- Prompt variant (if applicable): modified (user specified different function and constant names than tasks.md)
- Next experiment (smallest change to try): N/A - Phase 3 completed successfully with all acceptance criteria met
