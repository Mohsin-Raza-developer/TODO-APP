# Feature Specification: Standalone Todo MCP Server

**Feature Branch**: `005-todo-mcp-server`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "Build standalone MCP server with 5 task management tools (add, list, complete, delete, update) using UV package manager and official MCP SDK. Location: /mnt/d/todo-mcp-server/ (separate from main app). Test independently before integrating. Use existing backend API endpoints."

## Clarifications

### Session 2026-01-26

- Q: How should the MCP server persist task data - direct database connection, mock storage, or other? → A: Use existing backend REST API endpoints - MCP tools make HTTP requests to the FastAPI backend that already has all database logic, authentication, and validation implemented. No direct database connection needed.
- Q: How should the MCP server behave when API connection fails or errors occur? → A: Use try-except blocks in all tools to catch HTTP errors, parse ErrorResponse format from backend, and return meaningful error messages to AI agents
- Q: How should the system handle concurrent updates to the same task? → A: Delegate to existing backend API which handles concurrent updates using database transactions
- Q: What are the exact backend API endpoints to use? → A: Reviewed backend/api/tasks.py - endpoints are POST /api/{user_id}/tasks (create), GET /api/{user_id}/tasks (list with ?status filter), PATCH /api/{user_id}/tasks/{id}/complete (toggle completion), PUT /api/{user_id}/tasks/{id} (update), DELETE /api/{user_id}/tasks/{id} (delete - returns 204 No Content)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task via MCP Tool (Priority: P1)

An AI agent needs to create a new task on behalf of a user through natural language interaction. The MCP server receives the task details and stores them for the user.

**Why this priority**: Task creation is the foundational operation - without it, no other operations are possible. This is the minimum viable functionality.

**Independent Test**: Can be fully tested by calling the `add_task` tool with user_id, title, and optional description, and verifying a task is created with a unique ID and returned confirmation.

**Acceptance Scenarios**:

1. **Given** an AI agent has user credentials, **When** it calls `add_task` with user_id="user123", title="Buy groceries", **Then** a new task is created and returns task_id, status="created", and title="Buy groceries"
2. **Given** an AI agent has user credentials, **When** it calls `add_task` with user_id="user123", title="Call dentist", description="Schedule annual checkup", **Then** a task is created with both title and description stored
3. **Given** an AI agent calls `add_task`, **When** title is missing or empty, **Then** the tool returns an error indicating title is required

---

### User Story 2 - View Tasks via MCP Tool (Priority: P1)

An AI agent needs to retrieve a user's task list to display or answer questions about their tasks. The agent can filter tasks by completion status.

**Why this priority**: Without the ability to list tasks, the AI cannot provide context-aware responses about existing tasks. This is essential for any meaningful interaction.

**Independent Test**: Can be fully tested by creating sample tasks, then calling `list_tasks` with various filters (all, pending, completed) and verifying the correct tasks are returned.

**Acceptance Scenarios**:

1. **Given** user has 3 pending tasks and 2 completed tasks, **When** agent calls `list_tasks` with user_id="user123", status="pending", **Then** returns array of 3 pending tasks
2. **Given** user has tasks, **When** agent calls `list_tasks` with user_id="user123", status="all", **Then** returns all tasks regardless of completion status
3. **Given** user has no tasks, **When** agent calls `list_tasks` with user_id="user123", **Then** returns empty array
4. **Given** agent calls `list_tasks`, **When** user_id is missing, **Then** returns error indicating authentication is required

---

### User Story 3 - Toggle Task Completion via MCP Tool (Priority: P2)

An AI agent needs to toggle a task's completion status when a user indicates they've finished it or wants to reopen it. This toggles between completed=true and completed=false.

**Why this priority**: Task completion is a core workflow but requires tasks to exist first. Enables users to track progress through natural language and allows undoing completions.

**Independent Test**: Can be fully tested by creating a task, calling `complete_task` with the task_id twice, and verifying the completed status toggles (false → true → false).

**Acceptance Scenarios**:

1. **Given** user has a pending task (completed=false) with id=5, **When** agent calls `complete_task` with user_id="user123", task_id=5, **Then** task is toggled to completed=true and returns updated task object
2. **Given** user has a completed task (completed=true) with id=5, **When** agent calls `complete_task` with user_id="user123", task_id=5, **Then** task is toggled back to completed=false
3. **Given** user tries to complete a task, **When** task_id doesn't exist, **Then** returns error "Task not found"
4. **Given** user tries to complete another user's task, **When** task belongs to different user_id, **Then** returns error "Task not found" (enforces data isolation)

---

### User Story 4 - Delete Task via MCP Tool (Priority: P2)

An AI agent needs to permanently remove a task when a user wants to cancel or discard it. This provides task list management capabilities.

**Why this priority**: Deletion is important for task management but not critical for MVP. Users need to clean up irrelevant or cancelled tasks.

**Independent Test**: Can be fully tested by creating a task, calling `delete_task` with the task_id, and verifying the task is removed and subsequent queries don't return it.

**Acceptance Scenarios**:

1. **Given** user has a task with id=7, **When** agent calls `delete_task` with user_id="user123", task_id=7, **Then** task is deleted and returns task_id=7, status="deleted"
2. **Given** user tries to delete a task, **When** task_id doesn't exist, **Then** returns error "Task not found"
3. **Given** task is deleted, **When** agent calls `list_tasks`, **Then** deleted task does not appear in results

---

### User Story 5 - Update Task Details via MCP Tool (Priority: P3)

An AI agent needs to modify an existing task's title or description when a user wants to change task details. This enables task refinement without deletion and recreation.

**Why this priority**: While useful, task updates are not essential for basic task management. Users can delete and recreate tasks as a workaround.

**Independent Test**: Can be fully tested by creating a task, calling `update_task` with new title/description, and verifying the task reflects the changes.

**Acceptance Scenarios**:

1. **Given** user has task id=3 with title="Buy milk", **When** agent calls `update_task` with user_id="user123", task_id=3, title="Buy milk and eggs", **Then** task title is updated and returns task_id=3, status="updated"
2. **Given** user has a task, **When** agent calls `update_task` with only description="Updated details", **Then** only description is changed, title remains unchanged
3. **Given** user tries to update a task, **When** neither title nor description is provided, **Then** returns error "At least one field (title or description) must be provided"

---

### Edge Cases

- What happens when the backend API is unreachable or returns errors? → MCP server starts successfully regardless of backend API status; each tool uses try-except blocks to catch HTTP errors (connection refused, timeout, 4xx/5xx responses), parses ErrorResponse from backend when available, and returns appropriate error messages to the AI agent (e.g., "Cannot connect to backend API", "Task not found", "Validation error: {detail}")
- How does the system handle concurrent requests to update the same task? → MCP server delegates to backend API which handles concurrent updates according to its existing logic
- What happens when user_id format is invalid or contains special characters?
- How does the system handle extremely long titles (1000+ characters) or descriptions (10,000+ characters)?
- What happens when a task_id is provided as a string instead of an integer?
- How does the system handle requests with missing or malformed JSON?
- What happens when the same task is created multiple times with identical title and description?
- How does the system handle requests when storage quota is exceeded?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an `add_task` tool that accepts user_id (string, required), title (string, required), and description (string, optional) as parameters
- **FR-002**: System MUST provide a `list_tasks` tool that accepts user_id (string, required) and status (string, optional: "all", "pending", "completed") as parameters
- **FR-003**: System MUST provide a `complete_task` tool that accepts user_id (string, required) and task_id (integer, required) as parameters
- **FR-004**: System MUST provide a `delete_task` tool that accepts user_id (string, required) and task_id (integer, required) as parameters
- **FR-005**: System MUST provide an `update_task` tool that accepts user_id (string, required), task_id (integer, required), title (string, optional), and description (string, optional) as parameters
- **FR-006**: System MUST enforce user data isolation - each tool call can only access tasks belonging to the specified user_id
- **FR-007**: System MUST validate that user_id is provided and non-empty for all tool calls
- **FR-008**: System MUST validate that task_id exists and belongs to the requesting user before allowing complete, delete, or update operations
- **FR-009**: System MUST return structured responses from backend API:
  - add_task, update_task, complete_task: Return full Task object (id, user_id, title, description, completed, created_at, updated_at)
  - list_tasks: Return array of full Task objects
  - delete_task: Return success confirmation (backend returns 204 No Content)
- **FR-010**: System MUST return meaningful error messages when operations fail (e.g., "Task not found", "Title is required")
- **FR-011**: System MUST assign unique, auto-incrementing task IDs when creating new tasks
- **FR-012**: System MUST delegate task persistence to the existing backend API by calling appropriate REST endpoints
- **FR-013**: System MUST implement the MCP protocol correctly to be discoverable and callable by MCP clients
- **FR-014**: System MUST operate independently without requiring the main application to be running
- **FR-015**: System MUST handle task titles with a maximum length of 200 characters
- **FR-016**: System MUST handle task descriptions with a maximum length of 1000 characters
- **FR-017**: System MUST default new tasks to completed=false when created
- **FR-018**: System MUST track created_at and updated_at timestamps for each task
- **FR-019**: System MUST handle the case where a user has no tasks and return an empty array for list_tasks
- **FR-020**: System MUST use the existing backend API base URL configured via BACKEND_API_URL environment variable
- **FR-021**: Each MCP tool MUST make HTTP requests to corresponding backend REST API endpoints (POST /api/{user_id}/tasks, GET /api/{user_id}/tasks, etc.)
- **FR-022**: Each tool implementation MUST use try-except blocks to catch all HTTP errors (connection failures, timeouts, 4xx/5xx responses)
- **FR-023**: When backend API errors occur, tools MUST parse the ErrorResponse format ({"error": "error_type", "message": "detail"}) and return meaningful error messages to AI agents
- **FR-027**: MCP tools MUST handle HTTP status codes from backend:
  - 200/201: Success - return parsed response data
  - 204: Success (delete) - return confirmation message
  - 400: Validation error - return error message from response body
  - 401: Unauthorized - return "Authentication required"
  - 403: Forbidden - return "Access denied"
  - 404: Not found - return "Task not found"
  - 500: Server error - return "Backend service unavailable"
  - Network errors: Return "Cannot connect to backend API"
- **FR-024**: MCP tools MUST map to backend API endpoints as follows:
  - add_task → POST /api/{user_id}/tasks (returns 201 Created with full Task object)
  - list_tasks → GET /api/{user_id}/tasks?status={status} (status: all/pending/completed, default: all)
  - complete_task → PATCH /api/{user_id}/tasks/{id}/complete (toggles completion status, returns 200 OK with full Task object)
  - delete_task → DELETE /api/{user_id}/tasks/{id} (returns 204 No Content with no response body)
  - update_task → PUT /api/{user_id}/tasks/{id} (partial updates supported, returns 200 OK with full Task object)
- **FR-025**: Backend API base URL MUST be configured as http://localhost:8000 during development (or via BACKEND_API_URL environment variable)
- **FR-026**: MCP tools MUST NOT include JWT authentication headers - backend uses verify_user_ownership but assumes user_id is validated by MCP client layer

### Key Entities

- **Task**: Represents a todo item with attributes: task_id (unique identifier), user_id (owner), title (required text), description (optional text), completed (boolean status), created_at (timestamp), updated_at (timestamp)
- **User**: Represents the task owner, identified by user_id (string). The MCP server does not manage user data, only uses user_id for task ownership

### Non-Functional Requirements

- **NFR-001**: MCP server MUST be deployable independently at location /mnt/d/todo-mcp-server/
- **NFR-002**: Project MUST be initialized and managed using UV Python package manager
- **NFR-003**: MCP server MUST use the official MCP SDK for implementation
- **NFR-004**: All tool operations MUST complete within 2 seconds under normal conditions
- **NFR-005**: System MUST provide clear error messages that can be understood by AI agents
- **NFR-006**: MCP server MUST be testable by running it alongside the existing backend API (backend API dependency required for testing)
- **NFR-007**: System MUST support at least 10 concurrent tool requests without errors

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) can be successfully discovered and invoked by an MCP client
- **SC-002**: A complete task workflow (create → list → complete → list → delete) can be executed successfully through MCP tools within 10 seconds
- **SC-003**: User data isolation is enforced - attempts to access another user's tasks return "Task not found" errors 100% of the time
- **SC-004**: Each tool returns properly formatted responses (task_id, status, title) that can be parsed by AI agents without errors
- **SC-005**: The MCP server can be started alongside the running backend API, tested, and stopped without errors using UV package manager commands
- **SC-006**: All error scenarios (missing parameters, invalid task_id, etc.) return appropriate error messages within 1 second
- **SC-007**: The server successfully handles 100 consecutive task operations without crashing or data corruption
- **SC-008**: Documentation allows a developer to set up and test the MCP server within 15 minutes

## Scope *(mandatory)*

### In Scope

- Implementation of 5 MCP tools for task management (add, list, complete, delete, update)
- User data isolation enforcement (tasks scoped to user_id)
- Input validation and error handling for all tools
- Standalone MCP server using official MCP SDK
- Project setup using UV package manager
- HTTP client wrapper that calls existing backend REST API endpoints
- Independent testing capability without main application
- Tool response formatting for AI agent consumption

### Out of Scope

- User authentication or authorization (user_id is assumed to be provided by caller)
- User management operations (creating users, managing user profiles)
- Database schema changes or migrations to the main Todo application database
- Integration with the main Todo web application
- Frontend UI components or ChatKit integration
- OpenAI Agents SDK integration (that's Phase 3B)
- Conversation or message history management
- Real-time notifications or websocket connections
- Task priorities, tags, categories, or due dates (Basic Level features only)
- Multi-language support
- Performance optimization beyond basic requirements
- Production deployment configuration (this is for local development/testing)

## Dependencies & Assumptions *(mandatory)*

### Dependencies

- UV Python package manager must be installed on the development system
- Official MCP SDK Python package availability
- HTTP client library (httpx or aiohttp) for making API requests
- Access to file system at /mnt/d/ for project location
- Network connectivity for installing Python packages and accessing backend API
- Existing backend API must be running and accessible (BACKEND_API_URL)

### Assumptions

- User IDs will be provided as strings in the format used by Better Auth (e.g., text/UUID format)
- Task IDs will be integers (bigint in database)
- The MCP client (AI agent) will handle user authentication and pass validated user_id to tools
- Backend API base URL will be configured via BACKEND_API_URL environment variable
- Task data structure matches Phase 2 schema: id, user_id, title, description, completed, created_at, updated_at
- MCP server will run on localhost during development/testing
- Backend API will be running on localhost (e.g., http://localhost:8000) during development
- Error responses follow standard MCP error format
- The server will be tested manually or with MCP testing tools before Phase 3B integration
- Default status filter for list_tasks is "all" if not specified
- MCP server delegates all task operations to existing backend REST API endpoints
- Backend API handles JWT authentication, database persistence, and data validation
- MCP tools only need to pass user_id; backend enforces authorization

## References *(optional)*

- Model Context Protocol (MCP) Official Documentation
- Official MCP SDK Python Implementation
- UV Python Package Manager Documentation
- Existing Backend API (`/mnt/d/github.com/TODO-APP/backend/api/tasks.py`)
- Hackathon Phase 3 Requirements Document
