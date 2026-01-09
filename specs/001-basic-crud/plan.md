# Implementation Plan: Basic Todo CRUD Operations

**Branch**: `001-basic-crud` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-basic-crud/spec.md`

## Summary

Implement an interactive CLI todo list application with full CRUD operations (Create, Read, Update, Delete, Mark Complete) using in-memory storage. The application features a menu-driven interface with visual polish (startup banner, horizontal separators, standardized feedback messages) and supports up to 10,000 todo items with sub-second response times.

**Technical Approach**: Single-module Python CLI application using a `TodoItem` dataclass for type safety and a `TodoManager` class encapsulating the todo list and global ID counter. The main loop presents an interactive menu, dispatches operations, and maintains state in memory throughout the session.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (standard library only)
**Storage**: In-memory only (list + dictionary data structures)
**Testing**: Manual CLI verification against acceptance scenarios
**Target Platform**: Cross-platform CLI (Linux, macOS, Windows)
**Project Type**: Single module CLI application
**Performance Goals**: <1 second for create/update/delete operations, <2 seconds for viewing up to 10,000 items
**Constraints**: No file I/O, no database, no external APIs, no persistence, no global variables
**Scale/Scope**: Up to 10,000 todo items in memory, 5 CRUD operations, 1 interactive menu loop

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. SDD-RI Methodology**: Following sequence - specification complete → planning (this document) → task breakdown → implementation
✅ **II. Pythonic Excellence**: Will use PEP 8, type hints, dataclasses (Python 3.13+ features), meaningful names
✅ **III. In-Memory State Management**: No persistence - all data in memory (list/dict), no file I/O, no databases
✅ **IV. Type Safety & Documentation**: All functions will have type hints and Google-style docstrings
✅ **V. Terminal-Based Verification**: CLI-only interface, all operations verifiable via terminal output

**Quality Standards**: Code will pass `ruff check`, type check with `mypy --strict`, format with `black`
**Zero Violations**: No global variables (state encapsulated in `TodoManager` class), no persistence layer

## Project Structure

### Documentation (this feature)

```text
specs/001-basic-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file - implementation plan
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
src/
├── todo_app.py          # Main application entry point
├── models/
│   └── todo_item.py     # TodoItem dataclass definition
├── services/
│   └── todo_manager.py  # TodoManager class (CRUD operations + state)
└── ui/
    ├── menu.py          # Menu display and input handling
    ├── display.py       # Todo display formatting
    └── messages.py      # Standardized SUCCESS/ERROR messages

tests/
└── manual_test_plan.md  # Manual CLI verification checklist
```

**Structure Decision**: Single project structure selected (Option 1 from template). Simple CLI application requires minimal organization: models for data structures, services for business logic, UI for display/input, and manual testing. No web/mobile components needed.

## Complexity Tracking

> This section intentionally left empty - no Constitution violations requiring justification.

All requirements can be met with simple, direct implementations:
- Single Python module organization
- Standard library only (no external dependencies)
- Direct class-based state management (no repository pattern needed)
- Manual CLI testing (no test framework overhead for Phase I)

## Architecture Overview

### Core Design Principles

1. **Separation of Concerns**: Models (data), Services (logic), UI (presentation)
2. **Encapsulation**: `TodoManager` owns the todo list and ID counter (no global state)
3. **Type Safety**: Use Python 3.13 dataclasses and type hints throughout
4. **Single Responsibility**: Each class/function has one clear purpose
5. **Fail-Fast Validation**: Validate inputs before state changes

### System Components

```text
┌─────────────────────────────────────────────────────────┐
│                    todo_app.py (main)                   │
│  • Display startup banner                               │
│  • Initialize TodoManager                               │
│  • Run main menu loop                                   │
│  • Dispatch user commands                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              ui/menu.py (User Interface)                │
│  • Display numbered menu                                │
│  • Get user menu selection                              │
│  • Display horizontal separators                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│         services/todo_manager.py (Business Logic)       │
│  • Maintain todo list (dict[int, TodoItem])             │
│  • Manage global ID counter                             │
│  • CRUD operations: create, read, update, delete        │
│  • mark_complete operation                              │
│  • Input validation (title/description length)          │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│        models/todo_item.py (Data Structure)             │
│  @dataclass TodoItem:                                   │
│    • id: int                                            │
│    • title: str                                         │
│    • description: str                                   │
│    • status: Literal["Pending", "Completed"]            │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│           ui/display.py (Formatting)                    │
│  • Format todo list with status symbols                │
│  • Format individual todo items                         │
│  • Handle empty list display                            │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│         ui/messages.py (Feedback Messages)              │
│  • success(action: str) -> str                          │
│  • error(message: str) -> str                           │
│  • Constants: SEPARATOR, BANNER                         │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### ADR-001: Todo Storage - TodoItem Dataclass with Dictionary Index

**Decision**: Use Python 3.13 `@dataclass` for `TodoItem` and store todos in `dict[int, TodoItem]`

**Context**: Need to store todos with fast lookup by ID, type safety, and immutability guarantees.

**Options Considered**:
1. **TodoItem dataclass + dict[int, TodoItem]** (SELECTED)
2. List of dictionaries: `list[dict[str, Any]]`
3. TodoItem dataclass + list[TodoItem]
4. NamedTuple + dict[int, TodoItem]

**Rationale**:

| Criterion | Dataclass + Dict | List of Dicts | Dataclass + List | NamedTuple + Dict |
|-----------|------------------|---------------|------------------|-------------------|
| Type Safety | ✅ Full | ❌ None | ✅ Full | ✅ Full |
| ID Lookup Speed | ✅ O(1) | ❌ O(n) | ❌ O(n) | ✅ O(1) |
| Mutability | ✅ Mutable fields | ✅ Mutable | ✅ Mutable fields | ❌ Immutable |
| IDE Support | ✅ Excellent | ❌ Limited | ✅ Excellent | ✅ Good |
| Python 3.13 Idiomatic | ✅ Yes | ❌ Discouraged | ✅ Yes | ⚠️ Legacy |
| Constitution Compliance | ✅ Type hints required | ❌ No types | ✅ Type hints required | ✅ Type hints |

**Selected**: **Option 1 - TodoItem dataclass + dict[int, TodoItem]**

**Benefits**:
- O(1) lookup by ID for update/delete/mark_complete operations
- Full type safety with `@dataclass` decorator and type hints
- Mutable fields allow status updates without object recreation
- Excellent IDE autocomplete and type checking
- Pythonic and idiomatic for Python 3.13+

**Tradeoffs**:
- Slightly more memory than list (dict overhead ~240 bytes + 24 bytes per entry)
- For 10,000 todos: ~240KB overhead (negligible for in-memory app)

**Implementation**:

```python
# models/todo_item.py
from dataclasses import dataclass
from typing import Literal

@dataclass
class TodoItem:
    """Represents a single todo item with title, description, and completion status.

    Attributes:
        id: Unique integer identifier (never reused)
        title: Short task description (1-200 characters)
        description: Optional detailed task information (0-1000 characters)
        status: Current completion state ('Pending' or 'Completed')
    """
    id: int
    title: str
    description: str
    status: Literal["Pending", "Completed"]
```

### ADR-002: Main Menu Loop - While-True with Dispatch Dictionary

**Decision**: Use `while True` loop with dictionary-based command dispatch

**Context**: Need to repeatedly display menu, get user input, execute operation, and return to menu until user exits.

**Options Considered**:
1. **while True with dict dispatch** (SELECTED)
2. while True with if-elif chain
3. Recursive function calls
4. State machine with enum states

**Rationale**:

| Criterion | While + Dict | While + If-Elif | Recursive | State Machine |
|-----------|--------------|-----------------|-----------|---------------|
| Readability | ✅ Clear | ⚠️ Verbose | ❌ Confusing | ❌ Overkill |
| Extensibility | ✅ Easy to add | ⚠️ Modify chain | ❌ Complex | ⚠️ Complex |
| Performance | ✅ O(1) dispatch | ✅ O(n) checks | ❌ Stack risk | ✅ O(1) |
| Simplicity | ✅ Simple | ✅ Simple | ❌ Complex | ❌ Over-engineered |
| Exit Handling | ✅ `break` statement | ✅ `break` statement | ❌ Return stack | ⚠️ State transition |

**Selected**: **Option 1 - while True with dict dispatch**

**Benefits**:
- O(1) command dispatch via dictionary lookup
- Easy to extend with new menu options (add key-value pair)
- Clean separation: menu display → get input → dispatch → execute
- Clear exit condition (`break` on option 6)
- No recursion depth issues

**Tradeoffs**:
- Requires function references in dictionary (minor cognitive overhead)
- Cannot use positional arguments (must use closures or partial functions)

**Implementation**:

```python
# todo_app.py (main loop structure)
def main() -> None:
    """Main application entry point."""
    print(messages.BANNER)
    manager = TodoManager()

    # Command dispatch dictionary
    commands: dict[str, Callable[[], None]] = {
        "1": lambda: handle_create(manager),
        "2": lambda: handle_view(manager),
        "3": lambda: handle_mark_complete(manager),
        "4": lambda: handle_update(manager),
        "5": lambda: handle_delete(manager),
        "6": lambda: None,  # Exit - handled by break
    }

    while True:
        display_menu()
        choice = input("Select an option: ").strip()

        if choice == "6":
            break

        if choice in commands:
            commands[choice]()
        else:
            print(messages.error("Invalid option. Please select 1-6."))
```

### ADR-003: Global ID Counter - Encapsulated in TodoManager Class

**Decision**: Store ID counter as private instance variable `_next_id` in `TodoManager` class

**Context**: Need to generate unique, sequential IDs that never reset or reuse deleted IDs.

**Options Considered**:
1. **Private instance variable in TodoManager** (SELECTED)
2. Global module-level variable
3. Maximum ID calculation (max(todos.keys()) + 1)
4. UUID/GUID generation

**Rationale**:

| Criterion | Instance Variable | Global Variable | Max ID Calc | UUID |
|-----------|-------------------|-----------------|-------------|------|
| Constitution Compliance | ✅ No globals | ❌ Violates III | ✅ No globals | ✅ No globals |
| Encapsulation | ✅ Strong | ❌ None | ✅ Derived | ✅ Strong |
| Performance | ✅ O(1) | ✅ O(1) | ❌ O(n) | ✅ O(1) |
| Simplicity | ✅ Simple | ✅ Simple | ⚠️ Edge cases | ❌ Complex |
| ID Guarantees | ✅ Sequential | ✅ Sequential | ⚠️ Empty list | ❌ Non-sequential |
| Spec Compliance | ✅ Sequential ints | ✅ Sequential ints | ✅ Sequential ints | ❌ Not integers |

**Selected**: **Option 1 - Private instance variable in TodoManager**

**Benefits**:
- Complies with Constitution III (no global variables)
- O(1) ID generation (increment counter)
- Simple initialization (`_next_id = 1`)
- No edge cases with empty lists
- Clear ownership (TodoManager owns the counter)
- Easy to test (pass TodoManager instance)

**Tradeoffs**:
- Requires TodoManager instance (not a concern - already needed for state)
- Must remember to increment in `create_todo` method

**Implementation**:

```python
# services/todo_manager.py
class TodoManager:
    """Manages todo list state and CRUD operations."""

    def __init__(self) -> None:
        """Initialize empty todo list and ID counter."""
        self._todos: dict[int, TodoItem] = {}
        self._next_id: int = 1  # Global counter, never resets

    def create_todo(self, title: str, description: str) -> TodoItem:
        """Create a new todo item with unique ID.

        Args:
            title: Todo title (1-200 characters, non-empty)
            description: Optional todo description (0-1000 characters)

        Returns:
            Newly created TodoItem with assigned ID

        Raises:
            ValueError: If title is empty or exceeds 200 characters,
                       or description exceeds 1000 characters
        """
        # Validation logic...

        todo = TodoItem(
            id=self._next_id,
            title=title,
            description=description,
            status="Pending"
        )
        self._todos[self._next_id] = todo
        self._next_id += 1  # Increment counter (never resets)
        return todo
```

## Implementation Phases

### Phase 0: Project Setup (Prerequisites)

**Goal**: Establish Python environment and project structure

**Tasks**:
1. Verify Python 3.13+ installation (`python --version`)
2. Install UV package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
3. run command uv init <project-name>
4. Create project structure (src/, tests/, specs/)
5. Initialize git repository (if not exists)
6. Create .gitignore (ignore __pycache__, .pyc files)

**Validation**: `uv --version` returns UV version, directory structure exists

**Dependencies**: None
**Estimated Duration**: 15 minutes

---

### Phase 1: Core Data Model

**Goal**: Implement `TodoItem` dataclass with type safety

**Tasks**:
1. Create `src/models/todo_item.py`
2. Define `TodoItem` dataclass with type hints:
   - `id: int`
   - `title: str`
   - `description: str`
   - `status: Literal["Pending", "Completed"]`
3. Add module-level docstring
4. Add class-level docstring with attribute descriptions
5. Verify type hints with `mypy --strict src/models/todo_item.py`

**Validation**:
- Import TodoItem in Python REPL
- Create instance: `todo = TodoItem(id=1, title="Test", description="", status="Pending")`
- Verify attributes accessible: `todo.id`, `todo.title`, `todo.status`
- mypy passes with zero errors

**Dependencies**: Phase 0
**Estimated Duration**: 20 minutes

**Acceptance Criteria**:
- ✅ TodoItem dataclass defined with all 4 attributes
- ✅ Type hints for all attributes
- ✅ Docstrings for module and class
- ✅ mypy --strict passes with zero errors

---

### Phase 2: Todo Manager Service

**Goal**: Implement `TodoManager` class with CRUD operations and ID counter

**Tasks**:
1. Create `src/services/todo_manager.py`
2. Define `TodoManager` class with:
   - `__init__`: Initialize empty dict and counter
   - `_todos: dict[int, TodoItem]` (private)
   - `_next_id: int = 1` (private)
3. Implement `create_todo(title: str, description: str) -> TodoItem`:
   - Validate title non-empty and ≤200 chars
   - Validate description ≤1000 chars
   - Create TodoItem with `_next_id`
   - Store in `_todos` dict
   - Increment `_next_id`
   - Return created todo
4. Implement `get_all_todos() -> list[TodoItem]`:
   - Return list of all todos sorted by ID
5. Implement `get_todo(todo_id: int) -> TodoItem | None`:
   - Return todo if exists, else None
6. Implement `update_todo(todo_id: int, title: str | None, description: str | None) -> TodoItem`:
   - Validate todo exists (raise ValueError if not)
   - Validate title/description if provided
   - Update fields if not None
   - Return updated todo
7. Implement `delete_todo(todo_id: int) -> None`:
   - Validate todo exists (raise ValueError if not)
   - Remove from `_todos` dict
8. Implement `mark_complete(todo_id: int) -> TodoItem`:
   - Validate todo exists (raise ValueError if not)
   - Set status to "Completed"
   - Return updated todo (idempotent)
9. Add comprehensive docstrings for all methods
10. Add type hints for all parameters and return values

**Validation**:
- Create TodoManager instance in REPL
- Test create: `todo = manager.create_todo("Test", "Description")`
- Verify ID starts at 1, increments to 2, 3...
- Test get_all: Returns list sorted by ID
- Test update: Modify title/description
- Test mark_complete: Status changes to "Completed"
- Test delete: Todo removed, ID not reused
- Test error cases: Non-existent ID raises ValueError
- mypy --strict passes

**Dependencies**: Phase 1
**Estimated Duration**: 60 minutes

**Acceptance Criteria**:
- ✅ All 7 methods implemented with type hints
- ✅ ID counter starts at 1, increments, never resets
- ✅ Deleted IDs never reused
- ✅ Validation raises ValueError for invalid inputs
- ✅ Docstrings for all methods
- ✅ mypy --strict passes

---

### Phase 3: UI Messages Module

**Goal**: Implement standardized SUCCESS/ERROR message formatting

**Tasks**:
1. Create `src/ui/messages.py`
2. Define constants:
   - `BANNER = "=== TODO CLI (Phase 1) ==="`
   - `SEPARATOR = "-" * 20`
3. Implement `success(action: str) -> str`:
   - Return f"SUCCESS: {action}."
4. Implement `error(message: str) -> str`:
   - Return f"ERROR: {message}."
5. Add module docstring
6. Add function docstrings

**Validation**:
- Import in REPL
- Verify `success("Todo created")` returns "SUCCESS: Todo created."
- Verify `error("Title cannot be empty")` returns "ERROR: Title cannot be empty."
- Verify BANNER and SEPARATOR constants

**Dependencies**: None (independent)
**Estimated Duration**: 15 minutes

**Acceptance Criteria**:
- ✅ Constants defined: BANNER, SEPARATOR
- ✅ success() function formats correctly
- ✅ error() function formats correctly
- ✅ Docstrings for module and functions

---

### Phase 4: UI Display Module

**Goal**: Implement todo list formatting with status symbols

**Tasks**:
1. Create `src/ui/display.py`
2. Implement `format_todo(todo: TodoItem) -> str`:
   - Return formatted string with status symbol, ID, title
   - If description non-empty, add indented line with description
   - Format: `[○] 1: Buy groceries\n    Milk, eggs, bread`
   - Use ✓ for Completed, ○ for Pending
3. Implement `format_todo_list(todos: list[TodoItem]) -> str`:
   - If empty, return "No todos found"
   - Otherwise, format all todos with newlines between
4. Add module docstring
5. Add function docstrings

**Validation**:
- Create sample TodoItem instances
- Test format_todo with Pending status (shows ○)
- Test format_todo with Completed status (shows ✓)
- Test format_todo with empty description (no indented line)
- Test format_todo with description (indented line)
- Test format_todo_list with empty list (shows "No todos found")
- Test format_todo_list with multiple todos (newlines between)

**Dependencies**: Phase 1 (TodoItem)
**Estimated Duration**: 30 minutes

**Acceptance Criteria**:
- ✅ format_todo displays status symbols correctly
- ✅ format_todo formats title and description correctly
- ✅ format_todo_list handles empty list
- ✅ format_todo_list formats multiple todos with newlines
- ✅ Docstrings for all functions

---

### Phase 5: UI Menu Module

**Goal**: Implement menu display and user input handling

**Tasks**:
1. Create `src/ui/menu.py`
2. Implement `display_menu() -> None`:
   - Print numbered menu options 1-6
   - Format: "1. Create Todo", "2. View All Todos", etc.
3. Implement `get_menu_choice() -> str`:
   - Display menu
   - Prompt "Select an option: "
   - Return stripped input
4. Implement `get_todo_id() -> int`:
   - Prompt "Enter todo ID: "
   - Return integer (handle ValueError with error message)
5. Implement `get_title(prompt: str = "Enter title: ") -> str`:
   - Display prompt
   - Loop until non-empty title received
   - Show error "ERROR: Title cannot be empty." if empty
   - Return stripped title
6. Implement `get_description(prompt: str = "Enter description (press Enter to skip): ") -> str`:
   - Display prompt
   - Return stripped input (can be empty)
7. Add module docstring
8. Add function docstrings

**Validation**:
- Test display_menu prints 6 options
- Test get_title rejects empty input and re-prompts
- Test get_description accepts empty input
- Test get_todo_id handles invalid integer input

**Dependencies**: Phase 3 (messages)
**Estimated Duration**: 30 minutes

**Acceptance Criteria**:
- ✅ display_menu shows all 6 options
- ✅ get_title validates non-empty
- ✅ get_description allows empty input
- ✅ get_todo_id handles ValueError
- ✅ Docstrings for all functions

---

### Phase 6: Command Handlers

**Goal**: Implement command handler functions for each menu option

**Tasks**:
1. Create `src/ui/handlers.py`
2. Implement `handle_create(manager: TodoManager) -> None`:
   - Get title (loop until non-empty)
   - Get description (optional)
   - Call manager.create_todo()
   - Handle ValueError (title/description too long)
   - Print success or error message
3. Implement `handle_view(manager: TodoManager) -> None`:
   - Get all todos from manager
   - Format with display.format_todo_list()
   - Print formatted list
   - Print SEPARATOR
4. Implement `handle_mark_complete(manager: TodoManager) -> None`:
   - Get todo ID
   - Call manager.mark_complete()
   - Handle ValueError (ID not found)
   - Print success or error message
5. Implement `handle_update(manager: TodoManager) -> None`:
   - Get todo ID
   - Prompt "Update title? (y/n): "
   - If yes, get new title
   - Prompt "Update description? (y/n): "
   - If yes, get new description
   - Call manager.update_todo()
   - Handle ValueError
   - Print success or error message
6. Implement `handle_delete(manager: TodoManager) -> None`:
   - Get todo ID
   - Call manager.delete_todo()
   - Handle ValueError (ID not found)
   - Print success or error message
7. Add module docstring
8. Add function docstrings

**Validation**:
- Test each handler with TodoManager instance
- Verify error handling for invalid IDs
- Verify error handling for validation failures
- Verify success messages printed
- Verify handle_view prints separator

**Dependencies**: Phases 2, 3, 4, 5
**Estimated Duration**: 45 minutes

**Acceptance Criteria**:
- ✅ All 5 handlers implemented
- ✅ Error handling for ValueError
- ✅ Success/error messages printed
- ✅ handle_view prints separator
- ✅ Docstrings for all functions

---

### Phase 7: Main Application Loop

**Goal**: Implement main entry point with menu loop and dispatch

**Tasks**:
1. Create `src/todo_app.py`
2. Implement `main() -> None`:
   - Print BANNER
   - Initialize TodoManager
   - Create command dispatch dictionary (6 commands)
   - Enter while True loop:
     - Call display_menu()
     - Get choice
     - If choice == "6", break
     - If choice in commands, execute command
     - Else print error "Invalid option"
3. Add `if __name__ == "__main__": main()`
4. Add module docstring
5. Add function docstring

**Validation**:
- Run `python src/todo_app.py`
- Verify banner displays
- Verify menu displays
- Test option 1 (create) - add todo
- Test option 2 (view) - see created todo
- Test option 3 (mark complete) - change status
- Test option 4 (update) - modify title/description
- Test option 5 (delete) - remove todo
- Test option 6 (exit) - application terminates
- Test invalid option - error message displays

**Dependencies**: Phases 2, 3, 4, 5, 6
**Estimated Duration**: 30 minutes

**Acceptance Criteria**:
- ✅ Banner displays on startup
- ✅ Menu loop runs until option 6
- ✅ All 5 commands dispatch correctly
- ✅ Invalid options show error
- ✅ Application exits cleanly
- ✅ Docstrings for module and main()

---

### Phase 8: Code Quality & Formatting

**Goal**: Ensure code meets Constitution quality standards

**Tasks**:
1. Run `ruff check src/` - fix all linting errors
2. Run `ruff format src/` - auto-format all files
3. Run `mypy --strict src/` - fix all type errors
4. Review all docstrings for completeness
5. Verify no global variables (all state in TodoManager)
6. Verify no file I/O, no databases, no external APIs
7. Add module docstrings to all files
8. Verify all functions have type hints

**Validation**:
- `ruff check src/` returns zero errors
- `mypy --strict src/` returns zero errors
- All files have module docstrings
- All functions have docstrings and type hints
- Code follows PEP 8

**Dependencies**: Phase 7
**Estimated Duration**: 30 minutes

**Acceptance Criteria**:
- ✅ ruff check passes (zero errors)
- ✅ mypy --strict passes (zero errors)
- ✅ All docstrings complete
- ✅ No global variables
- ✅ No persistence layer

---

## Validation Strategy

### Manual CLI Verification Plan

Create `tests/manual_test_plan.md` with step-by-step verification for all acceptance scenarios from spec.md.

#### Test Case 1: Create Todo (User Story 1)

**Scenario 1.1**: Create todo with title and description
1. Run `python src/todo_app.py`
2. Verify banner displays: `=== TODO CLI (Phase 1) ===`
3. Select option 1 (Create Todo)
4. Enter title: "Buy groceries"
5. Enter description: "Milk, eggs, bread"
6. Verify success message: "SUCCESS: Todo created."
7. Return to menu
8. Select option 2 (View All Todos)
9. Verify todo displays:
   ```
   [○] 1: Buy groceries
       Milk, eggs, bread
   ```
10. Verify separator displays: `--------------------`

**Expected**: Todo created with ID 1, status Pending, displays correctly
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 1.2**: Create todo with empty title
1. Select option 1 (Create Todo)
2. Enter empty title (press Enter)
3. Verify error message: "ERROR: Title cannot be empty."
4. Enter title: "Quick task"
5. Enter empty description (press Enter)
6. Verify success message: "SUCCESS: Todo created."
7. Select option 2 (View All Todos)
8. Verify todo displays without description:
   ```
   [○] 2: Quick task
   ```

**Expected**: Empty title rejected, empty description accepted
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 1.3**: Create todo with title exceeding 200 characters
1. Select option 1 (Create Todo)
2. Enter title with 201 characters
3. Verify error message: "ERROR: Title exceeds maximum length of 200 characters."
4. Todo not created

**Expected**: Long title rejected
**Result**: [ ] PASS / [ ] FAIL

---

#### Test Case 2: View All Todos (User Story 2)

**Scenario 2.1**: View empty list
1. Run fresh application
2. Select option 2 (View All Todos)
3. Verify message: "No todos found"

**Expected**: Empty list message displays
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 2.2**: View list with pending and completed todos
1. Create 3 pending todos
2. Mark todo ID 1 as complete
3. Mark todo ID 3 as complete
4. Select option 2 (View All Todos)
5. Verify display:
   ```
   [✓] 1: Todo 1 title
       Todo 1 description
   [○] 2: Todo 2 title
       Todo 2 description
   [✓] 3: Todo 3 title
       Todo 3 description
   ```

**Expected**: Completed todos show ✓, pending todos show ○
**Result**: [ ] PASS / [ ] FAIL

---

#### Test Case 3: Mark Todo Complete (User Story 3)

**Scenario 3.1**: Mark pending todo as complete
1. Create todo with ID 1
2. Select option 3 (Mark Todo Complete)
3. Enter todo ID: 1
4. Verify success message: "SUCCESS: Todo marked complete."
5. View todos
6. Verify status symbol changed from ○ to ✓

**Expected**: Status changes to Completed
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 3.2**: Mark non-existent todo as complete
1. Select option 3 (Mark Todo Complete)
2. Enter todo ID: 999
3. Verify error message: "ERROR: Todo with ID 999 not found."

**Expected**: Error message for non-existent ID
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 3.3**: Mark completed todo as complete (idempotent)
1. Mark todo ID 1 as complete (already completed)
2. Verify success message (no error)
3. Verify status remains "Completed"

**Expected**: Idempotent operation, no error
**Result**: [ ] PASS / [ ] FAIL

---

#### Test Case 4: Update Todo (User Story 4)

**Scenario 4.1**: Update title only
1. Create todo with ID 1: title="Old title", description="Old description"
2. Select option 4 (Update Todo)
3. Enter todo ID: 1
4. Update title? y
5. Enter new title: "New title"
6. Update description? n
7. Verify success message: "SUCCESS: Todo updated."
8. View todos
9. Verify title changed, description unchanged

**Expected**: Only title updated
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 4.2**: Update description only
1. Select option 4 (Update Todo)
2. Enter todo ID: 1
3. Update title? n
4. Update description? y
5. Enter new description: "New description"
6. Verify success message: "SUCCESS: Todo updated."
7. View todos
8. Verify description changed, title unchanged

**Expected**: Only description updated
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 4.3**: Update both title and description
1. Select option 4 (Update Todo)
2. Enter todo ID: 1
3. Update title? y
4. Enter new title: "Updated title"
5. Update description? y
6. Enter new description: "Updated description"
7. Verify success message: "SUCCESS: Todo updated."
8. View todos
9. Verify both fields changed, ID and status unchanged

**Expected**: Both fields updated, ID/status preserved
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 4.4**: Update non-existent todo
1. Select option 4 (Update Todo)
2. Enter todo ID: 888
3. Verify error message: "ERROR: Todo with ID 888 not found."

**Expected**: Error message for non-existent ID
**Result**: [ ] PASS / [ ] FAIL

---

#### Test Case 5: Delete Todo (User Story 5)

**Scenario 5.1**: Delete existing todo
1. Create todos with IDs 1, 2, 3
2. Select option 5 (Delete Todo)
3. Enter todo ID: 2
4. Verify success message: "SUCCESS: Todo deleted."
5. View todos
6. Verify todo ID 2 removed
7. Verify todos ID 1 and 3 still present with original IDs

**Expected**: Todo deleted, other IDs unchanged
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 5.2**: Delete non-existent todo
1. Select option 5 (Delete Todo)
2. Enter todo ID: 777
3. Verify error message: "ERROR: Todo with ID 777 not found."

**Expected**: Error message for non-existent ID
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 5.3**: Verify ID never reused after deletion
1. Create todos with IDs 1, 2, 3
2. Delete todo ID 2
3. Create new todo
4. Verify new todo gets ID 4 (not ID 2)

**Expected**: Deleted ID never reused
**Result**: [ ] PASS / [ ] FAIL

---

#### Test Case 6: UI Visual Polish

**Scenario 6.1**: Verify startup banner
1. Run application
2. Verify first line displays: `=== TODO CLI (Phase 1) ===`

**Expected**: Banner displays on startup
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 6.2**: Verify separator between list and menu
1. View todos (option 2)
2. Verify separator line with minimum 20 dashes displays between todo list and menu
3. Verify format: `--------------------`

**Expected**: Separator displays correctly
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 6.3**: Verify standardized success messages
1. Create todo - verify: "SUCCESS: Todo created."
2. Mark complete - verify: "SUCCESS: Todo marked complete."
3. Update todo - verify: "SUCCESS: Todo updated."
4. Delete todo - verify: "SUCCESS: Todo deleted."

**Expected**: All success messages follow format
**Result**: [ ] PASS / [ ] FAIL

---

**Scenario 6.4**: Verify standardized error messages
1. Empty title - verify: "ERROR: Title cannot be empty."
2. Non-existent ID - verify: "ERROR: Todo with ID [id] not found."
3. Title too long - verify: "ERROR: Title exceeds maximum length of 200 characters."
4. Description too long - verify: "ERROR: Description exceeds maximum length of 1000 characters."

**Expected**: All error messages follow format
**Result**: [ ] PASS / [ ] FAIL

---

### Performance Verification

**Test Case P1**: Create operation performance
1. Measure time to create 100 todos
2. Verify average time <1 second per todo

**Expected**: <1 second per create operation
**Result**: [ ] PASS / [ ] FAIL

---

**Test Case P2**: View operation performance with 10,000 todos
1. Create 10,000 todos (use Python loop if needed for bulk creation)
2. Measure time to view all todos
3. Verify time <2 seconds

**Expected**: <2 seconds to view 10,000 items
**Result**: [ ] PASS / [ ] FAIL

---

## Architectural Decision Records (ADRs)

The following architectural decisions require documentation:

### ADR-001: Todo Storage Structure
- **Decision**: TodoItem dataclass + dict[int, TodoItem]
- **Status**: Documented in "Data Structures" section above
- **Create ADR**: Run `/sp.adr "Todo Storage - TodoItem Dataclass with Dictionary Index"`

### ADR-002: Main Menu Loop Logic
- **Decision**: while True with dictionary dispatch
- **Status**: Documented in "Data Structures" section above
- **Create ADR**: Run `/sp.adr "Main Menu Loop - While-True with Dispatch Dictionary"`

### ADR-003: Global ID Counter Implementation
- **Decision**: Private instance variable in TodoManager
- **Status**: Documented in "Data Structures" section above
- **Create ADR**: Run `/sp.adr "Global ID Counter - Encapsulated in TodoManager Class"`

**Note**: ADRs should be created after plan approval using the `/sp.adr` command for each decision.

## Next Steps

1. **Review & Approve Plan**: Obtain user approval for architecture and phases
2. **Create ADRs**: Document the 3 architectural decisions using `/sp.adr`
3. **Generate Tasks**: Run `/sp.tasks` to create granular task breakdown from phases
4. **Begin Implementation**: Execute Phase 0 (Project Setup)

## Success Criteria

✅ **Architecture**: All components designed with clear responsibilities
✅ **ADR Decisions**: 3 significant decisions documented with rationale
✅ **Implementation Phases**: 8 phases with clear goals, tasks, validation
✅ **Validation Strategy**: Manual test plan covers all acceptance scenarios
✅ **Constitution Compliance**: No violations, zero global variables, in-memory only
✅ **Type Safety**: All code will use type hints and pass mypy --strict
✅ **Performance**: <1s create/update/delete, <2s view 10,000 items
