# ADR-0003: Global ID Counter - Encapsulated in TodoManager Class

> **Scope**: This decision clusters the ID generation strategy (counter vs calculation vs UUID) with the storage location (instance variable vs global vs derived), as they work together to provide unique, sequential IDs that never reset or reuse deleted IDs.

- **Status:** Accepted
- **Date:** 2026-01-08
- **Feature:** 001-basic-crud
- **Context:** The application requires generating unique integer IDs for todo items that are sequential (1, 2, 3...), never reset during the application session, and never reuse deleted IDs. The specification explicitly states "If a user deletes a task with ID 2, then creates a new task, the new task should receive ID 4 (not ID 2)." The Constitution mandates no global variables (Principle III: In-Memory State Management).

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Yes - Affects ID uniqueness guarantees, state management pattern, and Constitution compliance
     2) Alternatives: Yes - Considered 4 viable approaches with different tradeoffs
     3) Scope: Yes - Cross-cutting concern that impacts data model, service layer, and testing strategy
-->

## Decision

Store ID counter as private instance variable `_next_id: int` in `TodoManager` class, initialized to 1 and incremented after each todo creation.

**Components:**
- **Storage Location:** Private instance variable `_next_id` in `TodoManager` class
- **Initialization:** Set to `1` in `__init__` method
- **Increment Strategy:** Increment immediately after creating todo (in `create_todo` method)
- **Visibility:** Private (leading underscore) to prevent external modification
- **Type:** Simple `int` (no need for atomic operations in single-threaded CLI)

## Consequences

### Positive

- **Constitution Compliance:** Satisfies Principle III (no global variables) - counter is encapsulated in class instance
- **O(1) ID Generation:** Simple increment operation provides constant-time ID generation
- **Strong Encapsulation:** Private variable prevents accidental external modification
- **Clear Ownership:** TodoManager owns both the todo collection and ID counter (single responsibility)
- **Simple Initialization:** Single line in `__init__`: `self._next_id = 1`
- **No Edge Cases:** Unlike max calculation, works correctly even with empty todo list
- **Easy Testing:** Can test ID generation by passing TodoManager instance (no global state to mock)
- **Sequential Guarantee:** IDs are always sequential integers starting from 1

### Negative

- **Requires Instance:** Cannot generate IDs without TodoManager instance (not a concern - instance already required for state management)
- **Manual Increment:** Developer must remember to increment counter in `create_todo` (mitigated by comprehensive docstrings and code review)
- **No Thread Safety:** Simple int is not atomic (acceptable - CLI is single-threaded per specification)

## Alternatives Considered

### Alternative A: Global Module-Level Variable
- **Structure:** `_next_id = 1` at module level in `todo_manager.py`
- **Why Rejected:**
  - **Constitution Violation:** Directly violates Principle III (no global variables)
  - No encapsulation (any module can import and modify)
  - Harder to test (requires resetting global state between tests)
  - Not object-oriented (counter floating outside natural owner)

### Alternative B: Maximum ID Calculation
- **Structure:** Calculate `max(todos.keys()) + 1` when creating new todo
- **Why Rejected:**
  - O(n) performance for every creation (unacceptable for 10,000 items)
  - Edge case: empty list requires special handling (`max([])` raises ValueError)
  - More complex logic (requires try-except or conditional check)
  - Still need to store calculation somewhere (doesn't eliminate storage need)

### Alternative C: UUID/GUID Generation
- **Structure:** Use `uuid.uuid4()` to generate unique identifiers
- **Why Rejected:**
  - **Spec Violation:** Specification requires sequential integer IDs, not UUIDs
  - UUIDs are 128-bit values (not integers)
  - Non-sequential (IDs would be random, not 1, 2, 3...)
  - Overkill for single-process, non-distributed application
  - Harder to display in CLI (long strings vs simple integers)

## References

- Feature Spec: [specs/001-basic-crud/spec.md](../../specs/001-basic-crud/spec.md) (FR-014: "System assigns unique sequential integer IDs starting from 1")
- Implementation Plan: [specs/001-basic-crud/plan.md](../../specs/001-basic-crud/plan.md) (ADR-003 section, lines 274-348)
- Related ADRs:
  - ADR-0001: Todo Storage (counter provides keys for dictionary)
  - ADR-0002: Main Menu Loop (counter persists across loop iterations via TodoManager instance)
- Evaluator Evidence: N/A (planning phase, no graders run yet)
