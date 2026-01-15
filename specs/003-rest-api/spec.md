# Feature Specification: REST API for Multi-User Todo Application

**Feature Branch**: `003-rest-api`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "REST API for multi-user todo application with Better Auth JWT authentication"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Todo via API (Priority: P1)

As a client application, I want to create a new todo item for an authenticated user via an API endpoint so that users can add tasks programmatically.

**Why this priority**: This is the foundational operation - without the ability to create todos via API, no other operations are possible. This is the minimum viable API.

**Independent Test**: Can be fully tested by sending a POST request with valid JWT token and todo data, verifying the response contains the created todo with unique ID, and confirming the todo appears in the user's todo list. Delivers immediate value by enabling task creation through any client.

**Acceptance Scenarios**:

1. **Given** an authenticated user with valid JWT token, **When** they POST to `/api/{user_id}/tasks` with title "Buy groceries" and description "Milk, eggs, bread", **Then** the system creates the todo, assigns it a unique ID, sets status to 'Pending', and returns HTTP 201 with the created todo object
2. **Given** an authenticated user, **When** they POST with only a title "Quick task" (no description), **Then** the system creates the todo with empty description and returns HTTP 201
3. **Given** an authenticated user, **When** they POST with an empty title, **Then** the system returns HTTP 400 with error message "Title is required"
4. **Given** an unauthenticated request (no JWT token), **When** attempting to POST a todo, **Then** the system returns HTTP 401 Unauthorized
5. **Given** a valid JWT token for user Alice, **When** attempting to POST to `/api/bob_id/tasks` (different user), **Then** the system returns HTTP 403 Forbidden

---

### User Story 2 - List Todos via API (Priority: P2)

As a client application, I want to retrieve all todos for an authenticated user via an API endpoint so that users can view their task list.

**Why this priority**: After creating todos, clients need to retrieve and display them. This is the second most critical endpoint as it provides visibility into the user's task list.

**Independent Test**: Can be fully tested by creating multiple todos for a user, then sending a GET request with valid JWT token and verifying the response contains all the user's todos with correct IDs, titles, descriptions, and statuses. Delivers value by enabling task list display in any client application.

**Acceptance Scenarios**:

1. **Given** user Alice has 5 todos (3 pending, 2 completed), **When** they GET `/api/alice_id/tasks`, **Then** the system returns HTTP 200 with an array of 5 todo objects, each containing id, title, description, completed status, created_at, and updated_at
2. **Given** user Alice has no todos, **When** they GET `/api/alice_id/tasks`, **Then** the system returns HTTP 200 with an empty array
3. **Given** an unauthenticated request, **When** attempting to GET todos, **Then** the system returns HTTP 401 Unauthorized
4. **Given** user Alice's JWT token, **When** attempting to GET `/api/bob_id/tasks`, **Then** the system returns HTTP 403 Forbidden (user isolation enforced)
5. **Given** user Alice has 10 todos, **When** they GET `/api/alice_id/tasks?status=completed`, **Then** the system returns HTTP 200 with only completed todos
6. **Given** user Alice has 10 todos, **When** they GET `/api/alice_id/tasks?status=pending`, **Then** the system returns HTTP 200 with only pending todos

---

### User Story 3 - Get Single Todo via API (Priority: P3)

As a client application, I want to retrieve a specific todo by its ID for an authenticated user so that users can view detailed information about a single task.

**Why this priority**: Users need to view details of individual tasks. This supports detailed task views and edit forms in client applications.

**Independent Test**: Can be fully tested by creating a todo, then sending a GET request with valid JWT token and the todo's ID, verifying the response contains the complete todo details. Delivers value by enabling detailed task views.

**Acceptance Scenarios**:

1. **Given** user Alice has a todo with ID 5, **When** they GET `/api/alice_id/tasks/5`, **Then** the system returns HTTP 200 with the todo object containing all fields
2. **Given** user Alice's JWT token, **When** they GET `/api/alice_id/tasks/999` (non-existent ID), **Then** the system returns HTTP 404 Not Found
3. **Given** user Alice's JWT token, **When** they attempt to GET `/api/alice_id/tasks/7` (todo belongs to Bob), **Then** the system returns HTTP 404 Not Found (not 403, to prevent ID enumeration)
4. **Given** an unauthenticated request, **When** attempting to GET a specific todo, **Then** the system returns HTTP 401 Unauthorized

---

### User Story 4 - Update Todo via API (Priority: P4)

As a client application, I want to update an existing todo's title or description for an authenticated user so that users can modify task details.

**Why this priority**: Users need to correct mistakes or update task information. This is essential for maintaining accurate task lists.

**Independent Test**: Can be fully tested by creating a todo, sending a PUT request with valid JWT token and updated data, and verifying the changes are reflected in subsequent GET requests. Delivers value by enabling task editing.

**Acceptance Scenarios**:

1. **Given** user Alice has todo ID 3 with title "Old title", **When** they PUT to `/api/alice_id/tasks/3` with title "New title", **Then** the system updates the title, preserves other fields, and returns HTTP 200 with updated todo
2. **Given** user Alice has todo ID 5, **When** they PUT with description "Updated description", **Then** the system updates only the description and returns HTTP 200
3. **Given** user Alice has todo ID 7, **When** they PUT with both new title and description, **Then** the system updates both fields and returns HTTP 200
4. **Given** user Alice's JWT token, **When** they PUT to `/api/alice_id/tasks/999` (non-existent), **Then** the system returns HTTP 404 Not Found
5. **Given** user Alice's JWT token, **When** they PUT with empty title, **Then** the system returns HTTP 400 with error message "Title is required"
6. **Given** user Alice's JWT token, **When** they attempt to PUT `/api/alice_id/tasks/8` (belongs to Bob), **Then** the system returns HTTP 404 Not Found

---

### User Story 5 - Toggle Todo Completion via API (Priority: P5)

As a client application, I want to mark a todo as complete or incomplete for an authenticated user so that users can track task progress.

**Why this priority**: Tracking completion status is core todo functionality. This enables users to mark tasks done.

**Independent Test**: Can be fully tested by creating a pending todo, sending a PATCH request to mark it complete, and verifying the status changes. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** user Alice has todo ID 1 with completed=false, **When** they PATCH `/api/alice_id/tasks/1/complete`, **Then** the system toggles completed to true and returns HTTP 200
2. **Given** user Alice has todo ID 2 with completed=true, **When** they PATCH `/api/alice_id/tasks/2/complete`, **Then** the system toggles completed to false and returns HTTP 200
3. **Given** user Alice's JWT token, **When** they PATCH `/api/alice_id/tasks/999/complete` (non-existent), **Then** the system returns HTTP 404 Not Found
4. **Given** user Alice's JWT token, **When** they attempt to PATCH `/api/alice_id/tasks/6/complete` (belongs to Bob), **Then** the system returns HTTP 404 Not Found

---

### User Story 6 - Delete Todo via API (Priority: P6)

As a client application, I want to delete a todo for an authenticated user so that users can remove tasks that are no longer relevant.

**Why this priority**: Users need to clean up their task lists. This is the least critical operation but still necessary for list management.

**Independent Test**: Can be fully tested by creating a todo, sending a DELETE request with valid JWT token, and verifying the todo no longer appears in the list. Delivers value by enabling task removal.

**Acceptance Scenarios**:

1. **Given** user Alice has todo ID 4, **When** they DELETE `/api/alice_id/tasks/4`, **Then** the system removes the todo and returns HTTP 204 No Content
2. **Given** user Alice's JWT token, **When** they DELETE `/api/alice_id/tasks/999` (non-existent), **Then** the system returns HTTP 404 Not Found
3. **Given** user Alice's JWT token, **When** they attempt to DELETE `/api/alice_id/tasks/9` (belongs to Bob), **Then** the system returns HTTP 404 Not Found
4. **Given** user Alice deletes todo ID 4, **When** they subsequently GET `/api/alice_id/tasks`, **Then** todo ID 4 does not appear in the list

---

### Edge Cases

- What happens when a request includes a malformed JWT token?
  - **Expected**: System returns HTTP 401 Unauthorized with error message "Invalid token"

- What happens when a JWT token has expired?
  - **Expected**: System returns HTTP 401 Unauthorized with error message "Token expired"

- What happens when the `user_id` in the URL path doesn't match the `user_id` in the JWT payload?
  - **Expected**: System returns HTTP 403 Forbidden with error message "User ID mismatch"

- What happens when a user provides an extremely long title (e.g., 1000 characters)?
  - **Expected**: System returns HTTP 400 with error message "Title exceeds maximum length of 200 characters"

- What happens when a user provides an extremely long description (e.g., 5000 characters)?
  - **Expected**: System returns HTTP 400 with error message "Description exceeds maximum length of 1000 characters"

- What happens when a client sends invalid JSON in the request body?
  - **Expected**: System returns HTTP 400 with error message "Invalid JSON format"

- What happens when required fields are missing from the request body?
  - **Expected**: System returns HTTP 400 with error message specifying which fields are required

- What happens when a user attempts to create more than 10,000 todos?
  - **Assumption**: System allows unlimited todos per user in Phase II (scalability handled by database design)

- What happens when concurrent requests attempt to update the same todo?
  - **Assumption**: Last write wins (optimistic concurrency). Database handles concurrent writes safely.

- What happens when the BETTER_AUTH_SECRET is not configured?
  - **Expected**: API server fails to start with error message "BETTER_AUTH_SECRET environment variable is required"

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization

- **FR-001**: API MUST require a valid JWT token in the Authorization header for all endpoints (except public auth endpoints managed by Better Auth)
- **FR-002**: API MUST verify JWT tokens using the BETTER_AUTH_SECRET shared with the frontend
- **FR-003**: API MUST extract the user_id claim from the JWT token payload for identity verification
- **FR-004**: API MUST reject expired JWT tokens with HTTP 401 Unauthorized
- **FR-005**: API MUST reject malformed JWT tokens with HTTP 401 Unauthorized
- **FR-006**: API MUST verify that the user_id in the URL path matches the user_id in the JWT token payload
- **FR-007**: API MUST return HTTP 403 Forbidden when the authenticated user attempts to access another user's resources
- **FR-008**: API MUST return HTTP 404 Not Found (not 403) when a user attempts to access a todo that belongs to another user (prevents ID enumeration)

#### Todo Creation

- **FR-009**: API MUST provide a POST endpoint at `/api/{user_id}/tasks` to create new todos
- **FR-010**: API MUST require the `title` field in the request body for todo creation
- **FR-011**: API MUST accept an optional `description` field in the request body
- **FR-012**: API MUST validate that title is not empty and does not exceed 200 characters
- **FR-013**: API MUST validate that description does not exceed 1000 characters
- **FR-014**: API MUST assign a unique, auto-incrementing ID to each created todo
- **FR-015**: API MUST set the `completed` status to false for newly created todos
- **FR-016**: API MUST automatically set `created_at` and `updated_at` timestamps
- **FR-017**: API MUST associate the created todo with the authenticated user's user_id
- **FR-018**: API MUST return HTTP 201 Created with the created todo object on success
- **FR-019**: API MUST return HTTP 400 Bad Request with specific error messages for validation failures

#### Todo Retrieval

- **FR-020**: API MUST provide a GET endpoint at `/api/{user_id}/tasks` to list all todos for a user
- **FR-021**: API MUST filter the todo list to only include todos belonging to the authenticated user
- **FR-022**: API MUST support an optional `status` query parameter with values: "all", "pending", "completed"
- **FR-023**: API MUST return todos ordered by creation date (newest first) when no ordering is specified
- **FR-024**: API MUST return HTTP 200 OK with an array of todo objects (empty array if no todos)
- **FR-025**: API MUST provide a GET endpoint at `/api/{user_id}/tasks/{id}` to retrieve a single todo
- **FR-026**: API MUST return HTTP 200 OK with the todo object if found and owned by the authenticated user
- **FR-027**: API MUST return HTTP 404 Not Found if the todo doesn't exist or belongs to another user

#### Todo Updates

- **FR-028**: API MUST provide a PUT endpoint at `/api/{user_id}/tasks/{id}` to update a todo
- **FR-029**: API MUST allow updating the `title` and/or `description` fields
- **FR-030**: API MUST validate updated fields with the same constraints as creation (title required, length limits)
- **FR-031**: API MUST preserve fields that are not included in the update request
- **FR-032**: API MUST update the `updated_at` timestamp on successful updates
- **FR-033**: API MUST return HTTP 200 OK with the updated todo object on success
- **FR-034**: API MUST return HTTP 404 Not Found if the todo doesn't exist or belongs to another user
- **FR-035**: API MUST return HTTP 400 Bad Request for validation failures

#### Todo Completion Toggle

- **FR-036**: API MUST provide a PATCH endpoint at `/api/{user_id}/tasks/{id}/complete` to toggle completion status
- **FR-037**: API MUST toggle the `completed` field between true and false
- **FR-038**: API MUST update the `updated_at` timestamp when toggling completion
- **FR-039**: API MUST return HTTP 200 OK with the updated todo object on success
- **FR-040**: API MUST return HTTP 404 Not Found if the todo doesn't exist or belongs to another user

#### Todo Deletion

- **FR-041**: API MUST provide a DELETE endpoint at `/api/{user_id}/tasks/{id}` to delete a todo
- **FR-042**: API MUST permanently remove the todo from the database
- **FR-043**: API MUST return HTTP 204 No Content on successful deletion
- **FR-044**: API MUST return HTTP 404 Not Found if the todo doesn't exist or belongs to another user

#### Error Handling

- **FR-045**: API MUST return consistent error response format with `error` and `message` fields
- **FR-046**: API MUST use appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)
- **FR-047**: API MUST provide clear, user-friendly error messages
- **FR-048**: API MUST log server errors while returning HTTP 500 Internal Server Error to clients

#### CORS & Headers

- **FR-049**: API MUST support Cross-Origin Resource Sharing (CORS) for requests from the frontend origin
- **FR-050**: API MUST accept JWT tokens in the `Authorization: Bearer <token>` header format
- **FR-051**: API MUST return `Content-Type: application/json` for all responses

### Key Entities

- **Todo**: Represents a task item
  - Unique identifier (auto-incrementing integer)
  - Title (required, max 200 characters)
  - Description (optional, max 1000 characters)
  - Completion status (boolean: completed/pending)
  - Owner (user_id, string reference to authenticated user)
  - Creation timestamp (automatically set)
  - Last update timestamp (automatically updated)

- **User**: Represents an authenticated user (managed by Better Auth)
  - Unique identifier (string, from Better Auth)
  - Email address (from Better Auth)
  - Display name (from Better Auth)

- **JWT Token**: Represents authentication credentials
  - Payload contains user_id claim
  - Signed with BETTER_AUTH_SECRET
  - Has expiration time

### Assumptions

- **Authentication Provider**: Better Auth manages user authentication and issues JWT tokens with user_id claims
- **Shared Secret**: Frontend (Better Auth) and backend API share the same BETTER_AUTH_SECRET for token verification
- **Token Transmission**: Clients send JWT tokens in the `Authorization: Bearer <token>` header for all API requests
- **User Identification**: The `user_id` in JWT payload is a string (Better Auth UUID format)
- **Data Lifetime**: Todos persist in the database until explicitly deleted
- **Concurrency**: Last write wins for concurrent updates to the same todo (optimistic concurrency)
- **Character Encoding**: UTF-8 support for all text fields, allowing Unicode characters and emojis
- **Error Handling**: API returns user-friendly error messages to clients; detailed errors logged server-side
- **API Versioning**: Not implemented in Phase II (all endpoints under `/api/` without version prefix)
- **Rate Limiting**: Not implemented in Phase II (can be added in future phases)
- **Pagination**: Not implemented in Phase II (all todos returned in single response)
- **Sorting Options**: Default sort by creation date descending; additional sort options deferred to Phase III
- **Filtering Options**: Only status filtering (all/pending/completed) in Phase II; advanced filters deferred
- **Field Validation**: Title length 1-200 characters, description 0-1000 characters (same as Phase I constraints)
- **ID Reuse**: Deleted todo IDs are never reused (auto-increment sequence)
- **CORS Configuration**: Frontend origin must be whitelisted in API CORS settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clients can create a new todo and receive the created resource in under 500 milliseconds (95th percentile)
- **SC-002**: Clients can retrieve a list of todos and receive the response in under 1 second regardless of list size (up to 10,000 todos per user)
- **SC-003**: All API operations return appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500) 100% of the time
- **SC-004**: Unauthorized requests (missing or invalid JWT) are rejected with HTTP 401 100% of the time
- **SC-005**: Cross-user access attempts are blocked and return HTTP 403 or 404 100% of the time (zero data leakage)
- **SC-006**: API handles 100 concurrent requests per user without errors or response time degradation
- **SC-007**: All validation errors provide clear, actionable error messages that clients can display to users
- **SC-008**: API successfully integrates with Better Auth JWT tokens and validates user identity on every request
- **SC-009**: All CRUD operations (Create, Read, Update, Delete, Toggle Complete) function correctly as specified in acceptance scenarios
- **SC-010**: API maintains data isolation - users can only access, modify, or delete their own todos
- **SC-011**: API documentation (OpenAPI/Swagger) accurately reflects all endpoints, request/response formats, and error codes
- **SC-012**: 100% of API endpoints are accessible from the frontend application via CORS
