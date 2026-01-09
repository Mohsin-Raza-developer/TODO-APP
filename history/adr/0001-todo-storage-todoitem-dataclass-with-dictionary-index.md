# ADR-0001: Todo Storage - TodoItem Dataclass with Dictionary Index

> **Scope**: This decision clusters the data structure choice (dataclass vs dict/tuple) with the storage indexing strategy (dict vs list), as they work together to provide type safety and efficient lookup.

- **Status:** Accepted
- **Date:** 2026-01-08
- **Feature:** 001-basic-crud
- **Context:** The CLI todo application requires storing todo items in memory with the ability to quickly lookup, update, and delete items by ID. The application must support up to 10,000 todos with sub-second response times for CRUD operations. The Constitution mandates type safety with full type hints and no global variables.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Yes - Affects all data access patterns, performance characteristics, and type safety throughout the application
     2) Alternatives: Yes - Considered 4 viable options with different tradeoffs
     3) Scope: Yes - Cross-cutting concern that impacts models, services, and UI layers
-->

## Decision

Use Python 3.13 `@dataclass` for `TodoItem` definition and store todos in `dict[int, TodoItem]` indexed by ID.

**Components:**
- **Data Structure:** Python `@dataclass` with type hints
- **Storage Container:** `dict[int, TodoItem]` (ID as key)
- **Ownership:** Encapsulated in `TodoManager` class as private instance variable `_todos`
- **Type Safety:** Full type hints with `Literal["Pending", "Completed"]` for status

## Consequences

### Positive

- **O(1) Lookup Performance:** Dictionary provides constant-time access for update, delete, and mark_complete operations by ID
- **Full Type Safety:** Dataclass with type hints enables mypy --strict validation and excellent IDE support (autocomplete, type checking)
- **Mutable Fields:** Allows in-place status updates without object recreation, reducing memory allocations
- **Pythonic & Idiomatic:** Dataclasses are the standard Python 3.13 approach for data classes, widely understood by Python developers
- **Constitution Compliance:** Satisfies type safety requirements and encapsulation (no global variables)
- **Memory Efficiency:** Negligible overhead (~240KB for 10,000 items) compared to list alternative

### Negative

- **Memory Overhead:** Dictionary has ~240 bytes base overhead + 24 bytes per entry compared to list
- **Iteration Order:** While dict maintains insertion order in Python 3.7+, we must explicitly sort by ID for consistent display
- **Learning Curve:** Developers unfamiliar with dataclasses may need brief learning time (mitigated by comprehensive docstrings)

## Alternatives Considered

### Alternative A: List of Dictionaries (`list[dict[str, Any]]`)
- **Structure:** `todos: list[dict[str, Any]]` where each dict has keys "id", "title", "description", "status"
- **Why Rejected:**
  - No type safety (defeats Constitution requirement IV)
  - O(n) lookup for update/delete operations
  - Limited IDE support (no autocomplete)
  - Discouraged pattern in modern Python

### Alternative B: TodoItem Dataclass + List (`list[TodoItem]`)
- **Structure:** `todos: list[TodoItem]` with linear search by ID
- **Why Rejected:**
  - O(n) lookup for update/delete operations (unacceptable for 10,000 items)
  - Would require maintaining separate index for performance
  - List indexing doesn't match todo ID (after deletions, indices shift but IDs don't)

### Alternative C: NamedTuple + Dictionary (`dict[int, TodoItem]`)
- **Structure:** NamedTuple for TodoItem, dict for storage
- **Why Rejected:**
  - Immutable fields require object recreation for status updates
  - NamedTuple is legacy pattern (dataclass supersedes it in Python 3.7+)
  - More verbose field updates (must create new tuple)

## References

- Feature Spec: [specs/001-basic-crud/spec.md](../../specs/001-basic-crud/spec.md)
- Implementation Plan: [specs/001-basic-crud/plan.md](../../specs/001-basic-crud/plan.md) (Data Structures section, lines 148-206)
- Related ADRs:
  - ADR-0002: Main Menu Loop (uses TodoManager with this storage structure)
  - ADR-0003: Global ID Counter (increments keys for this dictionary)
- Evaluator Evidence: N/A (planning phase, no graders run yet)
