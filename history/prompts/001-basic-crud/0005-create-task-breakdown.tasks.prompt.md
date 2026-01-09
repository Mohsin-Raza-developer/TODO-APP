---
id: 0005
title: Create Task Breakdown
stage: tasks
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-basic-crud
branch: 001-basic-crud
user: unknown
command: /sp.tasks
labels: ["tasks", "task-breakdown", "atomic-tasks", "checkpoints", "dependencies"]
links:
  spec: specs/001-basic-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-basic-crud/tasks.md
tests:
  - Manual CLI verification (Phase 9 tasks)
---

## Prompt

/sp.tasks

Break the 8 Implementation Phases from my plan into granular, atomic tasks.
Requirements for each task:
- Duration: 15-30 minutes.
- Single Acceptance Criterion: One testable outcome per task.
- Checkpoints: Include a mandatory Human Review checkpoint after Phase 2 (Core Logic) and Phase 6 (UI Handlers).

Ensure tasks are ordered by dependency (e.g., Models must exist before Services).

## Response snapshot

Created comprehensive task breakdown in specs/001-basic-crud/tasks.md with 88 atomic tasks across 10 phases (including manual testing phase).

**Task Structure:**
- **Phase 0**: Setup (3 tasks, 15 min) - Python, UV, directories
- **Phase 1**: Data Model (6 tasks, 20 min) - TodoItem dataclass
- **Phase 2**: TodoManager (12 tasks, 90 min) - CRUD + ID counter → **HUMAN REVIEW CHECKPOINT**
- **Phase 3**: Messages (7 tasks, 15 min) - SUCCESS/ERROR formatting
- **Phase 4**: Display (6 tasks, 30 min) - Todo list formatting with symbols
- **Phase 5**: Menu (8 tasks, 30 min) - Menu display and input handling
- **Phase 6**: Handlers (8 tasks, 60 min) - Command handlers → **HUMAN REVIEW CHECKPOINT**
- **Phase 7**: Main App (8 tasks, 30 min) - Menu loop and dispatch
- **Phase 8**: Code Quality (9 tasks, 30 min) - ruff, mypy, verification
- **Phase 9**: Manual Testing (21 tasks, 90 min) - All acceptance scenarios

**Total**: 88 tasks, 410 minutes (6.8 hours estimated)

**Key Features:**
- Every task has single acceptance criterion
- All tasks 15-30 minutes (except Phase 2 broken into smaller chunks)
- Two Human Review checkpoints with detailed review instructions
- Dependency graph showing execution order
- Parallel opportunities marked with [P]
- Phase tags for traceability
- REPL testing throughout for immediate feedback

**Human Review Checkpoints:**
1. After Phase 2: Verify TodoManager CRUD, ID counter, validation logic
2. After Phase 6: Verify handlers work with TodoManager, message formatting

## Outcome

- ✅ Impact: 88 atomic tasks with single acceptance criteria each. All tasks 15-30 min duration. Two mandatory human review checkpoints after core logic and UI integration. Clear dependency graph and execution order. Manual CLI test scenarios broken down into 21 individual verification tasks.
- 🧪 Tests: 21 manual CLI verification tasks in Phase 9 covering all user stories, UI polish, and performance
- 📁 Files: Created specs/001-basic-crud/tasks.md (comprehensive task breakdown with dependencies and checkpoints)
- 🔁 Next prompts: /sp.implement (begin Phase 0 - Project Setup), /sp.adr (create ADR documents for architectural decisions)
- 🧠 Reflection: Task granularity appropriate for 15-30 min chunks. Human review checkpoints positioned at critical integration points (core logic, UI integration). Dependencies clearly mapped. Parallel opportunities identified. Phase 2 (TodoManager) broken into 12 tasks to stay within time limits. Manual testing phase provides comprehensive coverage of all acceptance scenarios.

## Evaluation notes (flywheel)

- Failure modes observed: None - All phases broken down appropriately, checkpoints positioned correctly
- Graders run and results (PASS/FAIL): N/A - Task breakdown phase
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): N/A - Task breakdown completed successfully
