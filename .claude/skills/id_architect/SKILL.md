---
name: "id-architect"
description: "Sequential ID generation with immutable counter ensuring deleted IDs are never reused"
---

## Context

**Active State**: Data Modeling and State Management

This subagent logic MUST be triggered whenever:
- Creating new entities that require unique identification
- Implementing CRUD operations on collections
- Designing data storage with lookup requirements
- Migrating from stateless to stateful systems

## Requirements

### ID Counter Initialization
- Counter MUST start at 1 (human-friendly, one-based indexing)
- Counter MUST be encapsulated as private instance variable (`_next_id`)
- Counter MUST be initialized in `__init__` method
- Counter MUST NOT be exposed as public attribute

### ID Assignment
- Each new entity MUST receive current counter value as its ID
- Counter MUST increment AFTER assignment (post-increment pattern)
- ID assignment MUST occur before storing entity in collection
- ID MUST be immutable once assigned to an entity

### ID Reuse Prevention
- Counter MUST NEVER decrement
- Counter MUST NEVER reset during application lifetime
- Deleted entity IDs MUST NEVER be recycled for new entities
- Counter MUST persist across all CRUD operations (create, delete, update)

### Lookup Structure
- Entities MUST be stored in dictionary/map with ID as key
- Dictionary MUST provide O(1) lookup performance
- Dictionary key type MUST match ID type (typically `int`)
- Dictionary MUST be encapsulated as private instance variable

## Examples

### ✅ Good (Phase I Reference)

```python
# From src/services/todo_manager.py:41-48, 88-99
class TodoManager:
    def __init__(self) -> None:
        """Initialize empty todo list and ID counter."""
        self._todos: dict[int, TodoItem] = {}  # O(1) lookup
        self._next_id: int = 1  # Starts at 1, never resets

    def add_todo(self, title: str, description: str = "") -> TodoItem:
        # Create new todo with current ID
        todo = TodoItem(
            id=self._next_id,  # Assign current counter value
            title=title.strip(),
            description=description.strip(),
            completed=False,
        )

        # Store and increment ID counter
        self._todos[self._next_id] = todo
        self._next_id += 1  # Post-increment, never decrements

        return todo
```

**Why This Satisfies Constitution v1.1.0**:
- Encapsulation (Principle III): Counter is private (`_next_id`)
- Type Safety (Principle IV): Explicit type hints (`dict[int, TodoItem]`, `int`)
- Reusable Intelligence (Principle VI): Pattern extracted for horizontal reuse

**Test Case Validation (from T082)**:
```
Create todos 1, 2, 3 → Delete 2 → Create new todo → Gets ID 4 (NOT 2)
Result: PASS - ID reuse prevention working correctly
```

### ❌ Bad (Anti-Pattern)

```python
# ANTI-PATTERN 1: Random/UUID IDs (not sequential)
import uuid

class TodoManager:
    def add_todo(self, title: str) -> TodoItem:
        todo_id = uuid.uuid4()  # ❌ Non-sequential, user-unfriendly
        # User must remember "3f2a-9b1c-..." instead of "1", "2", "3"
```

**Architectural Risk**:
- User experience degradation (UUIDs not human-readable)
- No natural ordering for display/iteration
- Higher cognitive load for CLI interaction
- Violates Terminal-Based Verification (Principle V)

```python
# ANTI-PATTERN 2: ID Reuse (recycling deleted IDs)
class TodoManager:
    def __init__(self):
        self._todos = {}
        self._available_ids = []  # ❌ Queue of recycled IDs

    def add_todo(self, title: str) -> TodoItem:
        if self._available_ids:
            todo_id = self._available_ids.pop()  # ❌ Reuses deleted ID
        else:
            todo_id = len(self._todos) + 1
        # ... rest of implementation

    def delete_todo(self, todo_id: int) -> None:
        del self._todos[todo_id]
        self._available_ids.append(todo_id)  # ❌ Adds to reuse queue
```

**Architectural Risk**:
- **Data Integrity**: External references (logs, bookmarks, URLs) to deleted ID become ambiguous
- **Audit Trail**: Cannot distinguish "never existed" from "deleted and reused"
- **User Confusion**: "Why does my new todo have ID 2 when I deleted it yesterday?"
- **Concurrency Hazards**: Race conditions in multi-threaded environments

```python
# ANTI-PATTERN 3: Global Mutable Counter
next_id = 1  # ❌ Global variable

class TodoManager:
    def add_todo(self, title: str) -> TodoItem:
        global next_id
        todo = TodoItem(id=next_id, title=title)
        self._todos[next_id] = todo
        next_id += 1  # ❌ Mutates global state
```

**Architectural Risk**:
- Violates In-Memory State Management (Principle III: "Zero global variables")
- Multiple TodoManager instances share same counter (unintended coupling)
- Difficult to test (global state persists between tests)
- Impossible to have isolated instances (e.g., for multi-tenant systems)

## Rationale

**Horizontal Intelligence for Phase II (Web) and Phase III (AI Chatbot)**:

### Phase II: Web Application with REST API
- **URL Routing**: `/todos/{id}` becomes human-readable: `/todos/1`, `/todos/2`
  (vs UUIDs: `/todos/3f2a-9b1c-...`)
- **Database Migration**: Sequential IDs translate directly to `SERIAL` or `AUTO_INCREMENT` columns
- **Bookmarking**: Users can bookmark `/todos/5` knowing it's stable (not recycled)
- **API Pagination**: `GET /todos?start_id=100&limit=20` uses numeric ranges naturally
- **Analytics**: Time-series analysis ("IDs 1-1000 created in January") becomes trivial

### Phase III: AI Chatbot Integration
- **Natural Language**: User says "Delete todo 3" - chatbot parses integer easily
  (vs "Delete todo 3f2a-9b1c-..." requiring clipboard/copy-paste)
- **Voice Interfaces**: "Show me todo number five" works with speech recognition
  (vs UUIDs: incomprehensible when spoken)
- **Conversational Context**: "The todo you created (ID 7) is now complete" - clear reference
- **Multi-Turn Dialogue**: "Update todo 3... now delete it" - IDs persist in conversation

### Cross-Platform Consistency
- **Offline-First Mobile**: Local SQLite uses same sequential ID pattern
- **Cache Keys**: Redis keys `todo:1`, `todo:2` are predictable and debuggable
- **Export Formats**: CSV/JSON exports have stable IDs for re-import
- **Sync Protocols**: Conflict resolution uses IDs as immutable anchors

### Engineering Benefits
- **Debugging**: Log entry "Error in todo ID 42" is instantly meaningful
- **Performance**: Integer IDs use 4-8 bytes vs 36-byte UUID strings
- **Database Indexing**: B-tree indexes on sequential integers are highly efficient
- **Caching**: ID-based cache keys (`"todo:123"`) are simple and collision-free

This pattern is **portable** (works in Python, JavaScript, SQL), **testable** (deterministic IDs), and **maintainable** (no hidden state). It forms the foundation for all entity management across phases.
