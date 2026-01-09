# Feature Specification: Basic Todo CRUD Operations

**Feature Branch**: `001-basic-crud`
**Created**: 2026-01-07
**Updated**: 2026-01-08
**Status**: Draft
**Input**: User description: "Phase I Todo: Basic CRUD Operations - Create a Python CLI application that manages a list of todo items in-memory."

## Clarifications

### Session 2026-01-07

- Q: The spec defines WHAT operations exist (create, view, update, delete, mark complete) but not HOW users invoke them. What is the CLI interaction pattern? → A: Interactive menu system - App starts, displays numbered menu (1=Create, 2=View, etc.), loops until user quits
- Q: How does the ID counter behave after deletions? → A: Global counter, never resets - IDs increment continuously (1, 2, 3...), even after deletions. If you delete ID 2, next new todo gets ID 4
- Q: What is the concrete display format for viewing todos with clear status indicators? → A: Status symbols + formatting - Use [✓] for completed and [○] for pending tasks. Structured layout with easily scannable IDs and Titles
- Q: What is the concrete menu display format for the interactive menu? → A: Numbered with descriptions - Format: "1. Create Todo", "2. View All Todos", "3. Mark Todo Complete", "4. Update Todo", "5. Delete Todo", "6. Exit". Menu redisplays after each operation
- Q: How does the system collect title and description inputs during Create and Update operations? → A: Sequential prompts with optional skip - Prompt "Enter title:" (validate, retry if empty), then prompt "Enter description (press Enter to skip):"

### Session 2026-01-08

- Update: Add UI visual polish with startup banner, horizontal separators, and standardized feedback messages

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Todo Item (Priority: P1)

As a user, I want to create a new todo item with a title and description so that I can track tasks I need to complete.

**Why this priority**: This is the foundational operation - without the ability to create todos, no other operations are possible. This is the minimum viable product (MVP).

**Independent Test**: Can be fully tested by creating a todo item via CLI and verifying it appears in the todo list with a unique ID, title, description, and 'Pending' status. Delivers immediate value by allowing users to start tracking tasks.

**Acceptance Scenarios**:

1. **Given** an empty todo list, **When** I create a todo with title "Buy groceries" and description "Milk, eggs, bread", **Then** the system assigns it a unique ID and stores it with status 'Pending'
2. **Given** an existing todo list with 3 items, **When** I create a new todo with title "Doctor appointment" and description "Annual checkup at 2pm", **Then** the system assigns it a unique ID different from existing IDs and adds it to the list
3. **Given** I want to create a todo, **When** I provide only a title "Quick task" without a description, **Then** the system creates the todo with an empty description
4. **Given** I want to create a todo, **When** I provide an empty title, **Then** the system displays error message "ERROR: Title cannot be empty." and does not create the todo

---

### User Story 2 - View All Todo Items (Priority: P2)

As a user, I want to view all my todo items with their IDs and statuses so that I can see what tasks I have and their completion state.

**Why this priority**: After creating todos, users need to see what they've created. This is the second most critical feature as it provides visibility into the task list.

**Independent Test**: Can be fully tested by creating multiple todos and then viewing the list. The display should show all todos with IDs, titles, descriptions, and clear status indicators ('Completed' vs 'Pending'). Delivers value by providing task list visibility.

**Acceptance Scenarios**:

1. **Given** a todo list with 5 items (3 pending, 2 completed), **When** I request to view all todos, **Then** the system displays all 5 items with status symbols ([✓] for completed, [○] for pending), IDs, titles, and descriptions in a structured format
2. **Given** an empty todo list, **When** I request to view all todos, **Then** the system displays a message "No todos found"
3. **Given** a todo list with items of varying title and description lengths, **When** I view the list, **Then** all information is displayed using status symbols with IDs and titles on the first line, descriptions indented below, ensuring easy scanning

---

### User Story 3 - Mark Todo as Complete (Priority: P3)

As a user, I want to mark a todo item as complete by its ID so that I can track my progress on tasks.

**Why this priority**: After creating and viewing todos, users need to update task status. This is critical for the todo list to be functional as a productivity tool.

**Independent Test**: Can be fully tested by creating a todo, marking it as complete by ID, and verifying its status changes from 'Pending' to 'Completed' in the list view. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** a todo list with item ID 1 having status 'Pending', **When** I mark todo ID 1 as complete, **Then** the system updates its status to 'Completed'
2. **Given** a todo list, **When** I try to mark a non-existent ID (e.g., ID 999) as complete, **Then** the system displays error message "ERROR: Todo with ID 999 not found."
3. **Given** a todo with ID 2 already marked as 'Completed', **When** I mark ID 2 as complete again, **Then** the system keeps it as 'Completed' (idempotent operation)

---

### User Story 4 - Update Todo Item (Priority: P4)

As a user, I want to update the title or description of an existing todo item by its ID so that I can correct mistakes or modify task details.

**Why this priority**: Users need to edit todos to fix typos or update details. While important, this is less critical than create, view, and mark complete operations.

**Independent Test**: Can be fully tested by creating a todo, updating its title and/or description by ID, and verifying the changes appear in the list view while ID and status remain unchanged. Delivers value by enabling task detail corrections.

**Acceptance Scenarios**:

1. **Given** a todo with ID 3 having title "Old title" and description "Old description", **When** I update ID 3 with title "New title", **Then** the system updates only the title while preserving the description and status
2. **Given** a todo with ID 5, **When** I update ID 5 with description "Updated description", **Then** the system updates only the description while preserving the title and status
3. **Given** a todo with ID 7, **When** I update ID 7 with both new title "Updated title" and new description "Updated description", **Then** the system updates both fields while preserving the ID and status
4. **Given** a todo list, **When** I try to update a non-existent ID (e.g., ID 888), **Then** the system displays error message "ERROR: Todo with ID 888 not found."

---

### User Story 5 - Delete Todo Item (Priority: P5)

As a user, I want to delete a todo item by its ID so that I can remove tasks that are no longer relevant.

**Why this priority**: Users need to clean up their todo list. This is the least critical CRUD operation as it's used less frequently than other operations.

**Independent Test**: Can be fully tested by creating a todo, deleting it by ID, and verifying it no longer appears in the list view. Delivers value by enabling list cleanup and task removal.

**Acceptance Scenarios**:

1. **Given** a todo list with item ID 4, **When** I delete todo ID 4, **Then** the system removes it from the list and it no longer appears in the view
2. **Given** a todo list, **When** I try to delete a non-existent ID (e.g., ID 777), **Then** the system displays error message "ERROR: Todo with ID 777 not found."
3. **Given** a todo list with 5 items, **When** I delete ID 2, **Then** the remaining 4 items retain their original IDs (IDs are not renumbered)

---

### Edge Cases

- What happens when a user provides an extremely long title (e.g., 1000 characters)?
  - **Assumption**: System accepts titles up to 200 characters; displays error "ERROR: Title exceeds maximum length of 200 characters." for longer inputs

- What happens when a user provides an extremely long description (e.g., 5000 characters)?
  - **Assumption**: System accepts descriptions up to 1000 characters; displays error "ERROR: Description exceeds maximum length of 1000 characters." for longer inputs

- What happens when the system runs out of memory for storing todos?
  - **Assumption**: For Phase I, we assume normal usage (up to 10,000 todos). System is not expected to handle memory exhaustion gracefully in this phase.

- What happens when a user provides special characters or emojis in title/description?
  - **Assumption**: System accepts all valid Unicode characters including emojis as Python 3.13 has excellent Unicode support

- What happens when the todo list is empty and user tries to view it?
  - Covered in User Story 2: Display "No todos found"

- What happens when user tries to mark a completed todo as complete again?
  - Covered in User Story 3: Idempotent operation, remains completed

- What happens to ID assignment after todos are deleted?
  - **Specified**: IDs are assigned using a global counter that never resets. Deleted IDs are never reused. Example: Create IDs 1,2,3 → Delete ID 2 → Next created todo gets ID 4

- What is an example of the display format for viewing todos?
  - **Specified**: Display format example:
    ```
    [○] 1: Buy groceries
        Milk, eggs, bread
    [✓] 2: Doctor appointment
        Annual checkup at 2pm
    [○] 3: Quick task
    ```

- What is an example of the interactive menu display?
  - **Specified**: Menu format example with startup banner:
    ```
    === TODO CLI (Phase 1) ===

    1. Create Todo
    2. View All Todos
    3. Mark Todo Complete
    4. Update Todo
    5. Delete Todo
    6. Exit

    Select an option:
    ```

- How does the system handle input collection for Create and Update operations?
  - **Specified**: Sequential prompt example for Create with standardized messages:
    ```
    Enter title: [user inputs ""]
    ERROR: Title cannot be empty.
    Enter title: [user inputs "Buy groceries"]
    Enter description (press Enter to skip): [user inputs "Milk, eggs, bread"]
    SUCCESS: Todo created.
    ```

- What does a complete application flow look like with visual separators?
  - **Specified**: Complete flow example showing banner, todo list, separator, and menu:
    ```
    === TODO CLI (Phase 1) ===

    [○] 1: Buy groceries
        Milk, eggs, bread
    [✓] 2: Doctor appointment
        Annual checkup at 2pm

    --------------------

    1. Create Todo
    2. View All Todos
    3. Mark Todo Complete
    4. Update Todo
    5. Delete Todo
    6. Exit

    Select an option:
    ```

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a startup banner "=== TODO CLI (Phase 1) ===" when the application launches
- **FR-002**: System MUST use horizontal separators (minimum 20 dashes: "--------------------") to visually separate the todo list display from the main menu
- **FR-003**: System MUST format all success messages using the pattern "SUCCESS: [Action name] completed." (e.g., "SUCCESS: Todo created.", "SUCCESS: Todo deleted.")
- **FR-004**: System MUST format all error messages using the pattern "ERROR: [Specific error message]." (e.g., "ERROR: Title cannot be empty.", "ERROR: Todo with ID 999 not found.")
- **FR-005**: System MUST present an interactive numbered menu on startup and after each operation completion, displaying operations as: "1. Create Todo", "2. View All Todos", "3. Mark Todo Complete", "4. Update Todo", "5. Delete Todo", "6. Exit", and loop until user selects Exit
- **FR-006**: System MUST collect title and description inputs using sequential prompts: first prompt "Enter title:" with validation (re-prompt if empty), then prompt "Enter description (press Enter to skip):" allowing blank input
- **FR-007**: System MUST allow users to create a new todo item with a mandatory title and optional description
- **FR-008**: System MUST assign a unique, sequential integer ID to each newly created todo item
- **FR-009**: System MUST store each todo item with the following attributes: ID, title, description, and completion status
- **FR-010**: System MUST initialize all newly created todos with status 'Pending'
- **FR-011**: System MUST allow users to view all stored todo items in a formatted list
- **FR-012**: System MUST display each todo item using status symbols ([✓] for Completed, [○] for Pending) followed by ID and title on the first line, with description indented on subsequent lines if present, ensuring IDs and titles are easily scannable
- **FR-013**: System MUST allow users to mark a todo item as complete by specifying its ID
- **FR-014**: System MUST allow users to update the title and/or description of an existing todo item by specifying its ID
- **FR-015**: System MUST allow users to delete a todo item by specifying its ID
- **FR-016**: System MUST validate that todo titles are not empty before creating or updating
- **FR-017**: System MUST limit title length to 200 characters maximum
- **FR-018**: System MUST limit description length to 1000 characters maximum
- **FR-019**: System MUST preserve todo IDs after deletion (no ID reuse or renumbering)
- **FR-020**: System MUST store all data in memory only with no persistence to files, databases, or external storage

### Key Entities

- **Todo Item**: Represents a single task to be tracked
  - **ID**: Unique integer identifier assigned sequentially starting from 1
  - **Title**: Short text describing the task (required, max 200 characters)
  - **Description**: Longer text providing task details (optional, max 1000 characters)
  - **Status**: Completion state, either 'Pending' (default) or 'Completed'

### Assumptions

- **User Interface**: Interactive menu-driven command-line interface with visual polish - application displays startup banner "=== TODO CLI (Phase 1) ===", shows numbered menu of operations, uses horizontal separators to divide sections, accepts menu selection input, executes operation, returns to menu, loops until Exit is selected
- **Visual Design**: Application uses ASCII-based visual elements (banner, separators) for clarity; horizontal separators are minimum 20 dashes; all feedback messages follow standardized SUCCESS/ERROR format patterns
- **Data Lifetime**: Data exists only during application runtime; all todos are lost when application exits
- **Concurrency**: Single-user, single-threaded execution (no concurrent access)
- **ID Generation**: Sequential integer IDs using a global counter starting from 1, incrementing by 1 for each new todo. Counter never resets or reuses deleted IDs (e.g., if IDs 1,2,3 exist and ID 2 is deleted, next todo gets ID 4, not ID 2)
- **Character Encoding**: UTF-8 support for all text fields, allowing Unicode characters and emojis
- **Error Handling**: All errors display user-friendly messages following "ERROR: [message]." format to stdout/stderr; application does not crash
- **Memory Limits**: Application is designed for typical usage (up to 10,000 todos); no special handling for memory exhaustion

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a todo item and see it appear in the list within 1 second
- **SC-002**: Users can view all todos with correct IDs and status indicators in under 2 seconds regardless of list size (up to 10,000 items)
- **SC-003**: Users receive clear error messages for invalid operations (non-existent IDs, empty titles) within 1 second
- **SC-004**: 100% of CRUD operations (Create, Read, Update, Delete, Mark Complete) function correctly as specified in acceptance scenarios
- **SC-005**: All operations complete without application crashes or data corruption
- **SC-006**: Status indicators ([✓] for Completed, [○] for Pending) clearly distinguish between todo states visually with structured formatting (ID and title on first line, description indented below)
- **SC-007**: Application displays consistent visual structure with startup banner, horizontal separators between todo list and menu, and standardized SUCCESS/ERROR message formatting
- **SC-008**: Users can successfully complete all 5 user stories independently without dependency on other stories (except User Story 1 as the foundation)
- **SC-009**: The application meets all constraints defined in the project Constitution (PEP 8 compliance, type hints, docstrings, no global variables, in-memory only)

## Constraints

- **No Persistence**: All data must be stored in-memory only; no files, JSON, databases, or external storage
- **CLI Only**: All interaction must occur through command-line interface; no GUI or web interface
- **Phase I Scope**: No sorting, filtering, search, categories, or advanced features (deferred to Phase II)
- **No Authentication**: Single-user application with no login or user management

## Non-Goals

- Web interface or graphical user interface
- User authentication or multi-user support
- Data persistence (saving/loading from files or databases)
- Todo sorting, filtering, or search functionality
- Todo categories, tags, or labels
- Due dates or reminders
- Todo prioritization or ordering
- Undo/redo functionality
- Import/export capabilities
- Configuration files or settings
