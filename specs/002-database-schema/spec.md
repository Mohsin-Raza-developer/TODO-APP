# Feature Specification: Database Schema for Multi-User Todo Application

**Feature Branch**: `002-database-schema`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Database Schema Specification for Phase II - Requirements: 1. Create the new branch. 2. Apply the 'ID Architect' Agent Skill: Define the 'tasks' table with a sequential, non-decrementing integer Primary Key. 3. Define the Multi-User Isolation: Include a 'user_id' string field as a foreign key to the 'users' table. 4. List all required fields: title (1-200 chars), description, completed (bool), created_at, and updated_at. 5. Define the 'users' table structure as required by Better Auth (id, email, name, created_at)."

## User Scenarios & Testing

### User Story 1 - Database Foundation for Authenticated Users (Priority: P1)

As a system architect, I need to define a database schema that supports multi-user todo management with strict data isolation, ensuring each user can only access their own tasks while maintaining referential integrity and audit trails.

**Why this priority**: This is the foundational schema that all Phase II features depend on. Without proper user isolation and task storage, no web application functionality can be implemented. This schema must be correct from the start to prevent data leaks and security vulnerabilities.

**Independent Test**: Can be fully tested by creating database migrations, seeding test users and tasks, and verifying that queries filtered by `user_id` return only the authenticated user's tasks. Success is measured by querying the database directly and confirming referential integrity constraints are enforced.

**Acceptance Scenarios**:

1. **Given** a new database instance, **When** migrations are applied, **Then** both `users` and `tasks` tables are created with all required fields and constraints
2. **Given** two users (Alice and Bob) each with their own tasks, **When** Alice's `user_id` is used to filter tasks, **Then** only Alice's tasks are returned and Bob's tasks are completely inaccessible
3. **Given** a task with `user_id` = "abc123", **When** the user with id "abc123" is deleted, **Then** the database enforces referential integrity (either cascades deletion or prevents user deletion)
4. **Given** a new task is created, **When** the `user_id` field is omitted or null, **Then** the database rejects the insertion (NOT NULL constraint enforced)
5. **Given** a task with id=5 and user_id="user_A", **When** the task is updated with user_id="user_B", **Then** the update succeeds (ownership transfer is allowed at database level, application layer will enforce authorization)

---

### User Story 2 - Sequential Task ID Generation (Priority: P1)

As a developer implementing the ID Architect pattern, I need task IDs to be generated sequentially starting from 1 and never reused after deletion, ensuring stable references and preventing ID collisions.

**Why this priority**: The ID Architect skill from Phase I established sequential, non-decrementing IDs as a core pattern. This must be preserved in the database layer to maintain consistency, enable human-readable IDs, and support features like permalinks and audit trails.

**Independent Test**: Can be tested by inserting 5 tasks, deleting task #3, then inserting a new task and verifying it receives id=6 (not id=3). Success is measured by querying the database and confirming the ID sequence never decrements or reuses deleted IDs.

**Acceptance Scenarios**:

1. **Given** an empty tasks table, **When** the first task is created, **Then** it receives id=1
2. **Given** tasks with ids 1, 2, 3 exist, **When** task #2 is deleted and a new task is created, **Then** the new task receives id=4 (not id=2)
3. **Given** tasks with ids 1-100 exist, **When** all tasks are deleted and a new task is created, **Then** the new task receives id=101 (sequence continues from highest ever assigned)
4. **Given** concurrent task creation requests, **When** two users create tasks simultaneously, **Then** each receives a unique, sequential ID with no collisions

---

### User Story 3 - Audit Trail with Timestamps (Priority: P2)

As a system administrator, I need all tasks to record creation and last-update timestamps automatically, enabling audit trails, debugging, and future features like "sort by recently updated."

**Why this priority**: While not critical for MVP functionality, timestamps are essential for production systems. They enable debugging (when was this task created?), support future sorting/filtering features, and provide compliance audit trails. Retrofitting timestamps later is difficult, so including them now prevents technical debt.

**Independent Test**: Can be tested by creating a task, waiting 1 second, updating it, then querying the database to verify `created_at` remains unchanged and `updated_at` reflects the update time. Success is measured by timestamp accuracy within 1 second tolerance.

**Acceptance Scenarios**:

1. **Given** a new task is created, **When** the record is inserted, **Then** `created_at` is automatically set to the current timestamp without application code intervention
2. **Given** a task exists with `created_at` = "2026-01-11 10:00:00", **When** the task title is updated at "2026-01-11 11:30:00", **Then** `updated_at` changes to "2026-01-11 11:30:00" but `created_at` remains "2026-01-11 10:00:00"
3. **Given** a task is created and never modified, **When** queried, **Then** `created_at` and `updated_at` have identical values (both set at creation time)

---

### User Story 4 - Better Auth User Schema Integration (Priority: P1)

As a developer integrating Better Auth, I need a `users` table that stores the minimum required fields (id, email, name, created_at) to support authentication and user identification without duplicating Better Auth's internal tables.

**Why this priority**: Better Auth requires specific user data to function. This schema must align with Better Auth's expectations to enable seamless JWT authentication integration. This is a dependency for all authenticated API endpoints.

**Independent Test**: Can be tested by creating a user record with email, name, and verifying Better Auth can authenticate using this data. Success is measured by successful JWT token generation using the `users` table data.

**Acceptance Scenarios**:

1. **Given** a user signs up with email "alice@example.com" and name "Alice", **When** the user record is created, **Then** a unique id is generated, email and name are stored, and `created_at` is automatically set
2. **Given** a user exists with email "bob@example.com", **When** a second user attempts to register with the same email, **Then** the database rejects the insertion (email uniqueness constraint enforced)
3. **Given** a user with id="user_123" and 50 tasks, **When** attempting to delete the user, **Then** the deletion is prevented if tasks exist (referential integrity enforced) OR all tasks are cascade-deleted (depending on constraint configuration)

---

### Edge Cases

- **Empty descriptions**: What happens when a task is created with an empty description field? (Should be allowed, as description is optional)
- **Title length boundary**: What happens when a user attempts to create a task with title length exactly 200 characters? (Should succeed) What about 201 characters? (Should fail with validation error)
- **Null user_id**: What happens if application code attempts to insert a task with `user_id=null`? (Database MUST reject with NOT NULL constraint violation)
- **User deletion with existing tasks**: What happens when a user with 100 tasks is deleted? (Must be defined: CASCADE delete tasks or RESTRICT deletion)
- **Concurrent updates**: How does the system handle two users updating the same task's `updated_at` field simultaneously? (Last write wins, database handles timestamp serialization)
- **Time zone handling**: Are timestamps stored in UTC or local time? (Assumption: UTC for consistency, documented in Assumptions section)
- **Sequence exhaustion**: Can the task ID sequence run out of values? (No - BIGINT sequence supports ~9.2 quintillion tasks, effectively unlimited for any realistic usage)
- **Connection pool exhaustion**: What happens when Neon's connection pool reaches capacity? (PgBouncer queues requests automatically; application should configure timeouts to prevent indefinite waiting)

## Requirements

### Functional Requirements

- **FR-001**: Database schema MUST include a `users` table with fields: id (string, primary key), email (string, unique, not null), name (string, not null), created_at (timestamp, not null, auto-set)
- **FR-002**: Database schema MUST include a `tasks` table with fields: id (bigint, primary key, auto-increment via BIGSERIAL), user_id (string, foreign key to users.id, not null), title (string 1-200 chars, not null), description (text, nullable), completed (boolean, not null, default false), created_at (timestamp, not null, auto-set), updated_at (timestamp, not null, auto-update)
- **FR-003**: The `tasks.id` field MUST use sequential integer generation starting from 1, never decrementing or reusing deleted IDs (implements ID Architect pattern)
- **FR-004**: The `tasks.user_id` field MUST enforce referential integrity via foreign key constraint to `users.id`
- **FR-005**: The `users.email` field MUST enforce uniqueness to prevent duplicate account registrations
- **FR-006**: The `tasks.title` field MUST enforce a maximum length of 200 characters at the database level
- **FR-007**: The `tasks.completed` field MUST default to `false` when not explicitly provided
- **FR-008**: The `created_at` fields MUST be automatically set to the current timestamp on record creation via PostgreSQL DEFAULT NOW() constraint, enforced at database level without application code intervention
- **FR-009**: The `updated_at` field on tasks MUST be automatically updated to the current timestamp whenever any field is modified via PostgreSQL UPDATE trigger, enforced at database level for all clients
- **FR-010**: Foreign key constraint on `tasks.user_id` MUST prevent orphaned tasks (enforce ON DELETE CASCADE: all user tasks are automatically deleted when the user is deleted for GDPR "right to be forgotten" compliance)
- **FR-011**: Database schema MUST include an index on `tasks.user_id` column (CREATE INDEX idx_tasks_user_id) to optimize user-specific task queries and prevent full table scans

### Key Entities

- **User**: Represents an authenticated user of the todo application
  - Attributes: unique identifier (id), email address (unique), display name, account creation timestamp
  - Relationships: One user can own many tasks (one-to-many)
  - Constraints: Email must be unique across all users

- **Task**: Represents a single todo item owned by a user
  - Attributes: unique sequential identifier (id), title (1-200 characters), optional description, completion status (boolean), owner identifier (user_id), creation timestamp, last update timestamp
  - Relationships: Each task belongs to exactly one user (many-to-one)
  - Constraints: Cannot exist without a valid user_id, title cannot be empty, id never reused after deletion

## Success Criteria

### Measurable Outcomes

- **SC-001**: Database migrations execute successfully on a fresh PostgreSQL instance without errors
- **SC-002**: Data isolation is verified: queries filtered by `user_id` return only that user's tasks with 100% accuracy (zero cross-user data leaks) and execute in under 100ms for typical datasets (up to 100 tasks per user)
- **SC-003**: Sequential ID generation is verified: creating 100 tasks, deleting 50 random tasks, then creating 10 more results in the new tasks having IDs 101-110 (no ID reuse)
- **SC-004**: Referential integrity is enforced: attempting to insert a task with non-existent `user_id` fails with foreign key constraint violation
- **SC-005**: Timestamp automation is verified: creating and updating tasks results in accurate `created_at` and `updated_at` values within 1 second tolerance, without application code setting these values manually
- **SC-006**: Schema aligns with Better Auth requirements: user table structure is compatible with Better Auth JWT authentication (verified by successful JWT token generation using database user records)
- **SC-007**: Constraint enforcement is verified: attempting to insert a task with 201-character title fails with validation error, empty user_id fails with NOT NULL error, duplicate email fails with uniqueness error

## Assumptions

1. **Database Technology**: Neon Serverless PostgreSQL will be used (as specified in Constitution v2.0.0 Principle III)
2. **ORM**: SQLModel will be used for schema definition and migrations (as specified in Constitution v2.0.0)
3. **Time Zone**: All timestamps will be stored in UTC to ensure consistency across global deployments
4. **User ID Format**: Better Auth generates string-based user IDs (UUIDs or similar), not integers
5. **Task ID Format**: Tasks use BIGINT IDs (BIGSERIAL in PostgreSQL) for human readability and sequence exhaustion prevention (following ID Architect pattern from Phase I, max ~9.2 quintillion tasks)
6. **Description Field**: Task descriptions have no maximum length (TEXT type in PostgreSQL, effectively unlimited)
7. **Completed Default**: New tasks default to incomplete (`completed = false`) unless explicitly marked complete on creation
8. **Migration Tool**: Alembic will be used for database schema versioning and migrations (as specified in Constitution v2.0.0)
9. **ON DELETE Behavior**: CASCADE - Deleting a user automatically deletes all their tasks for GDPR "right to be forgotten" compliance
10. **Index Strategy**: B-tree index on `tasks.user_id` for query optimization (PostgreSQL default index type, optimal for equality and range queries)
11. **Connection Pooling**: Neon pooled connection endpoint (via PgBouncer) will be used for all application connections to handle high concurrency in serverless environment
12. **Performance Target**: User-specific task queries (filtered by `user_id`) should execute in under 100ms for typical datasets (up to 100 tasks per user) to ensure good UX
13. **Timestamp Automation**: Database-level automation using PostgreSQL DEFAULT NOW() for `created_at` and UPDATE trigger for `updated_at` ensures single source of truth across all clients (SQLModel, admin tools, direct SQL)

## Out of Scope

- Task priority levels, due dates, or tags (reserved for future phases)
- User profile fields beyond Better Auth minimum (avatar, bio, preferences)
- Task sharing or collaboration features (multi-user task ownership)
- Soft deletion / trash / archive functionality
- Task categories or projects (organizational grouping)
- User roles or permissions (admin, regular user)
- Task attachments or file uploads
- Database performance optimization (indexes beyond primary/foreign keys)
- Database backup and recovery procedures (infrastructure concern)
- Data migration from Phase I in-memory storage (manual data re-entry acceptable for Phase II)

## Dependencies

- **Better Auth**: User authentication system must be configured to use the `users` table schema
- **Neon PostgreSQL**: Database instance must be provisioned before migrations can run
- **SQLModel**: ORM library must be installed and configured
- **Alembic**: Migration tool must be initialized in project
- **Phase I Agent Skills**: ID Architect pattern must be applied to task ID generation
- **Constitution v2.0.0**: Principle III (Persistent Relational State) and Principle VII (Stateless Security) define schema requirements

## Clarifications

### Session 2026-01-11

- Q: Should the database schema include an explicit index on `tasks.user_id` to optimize user-specific task queries? → A: Create index on `tasks.user_id` - Explicit `CREATE INDEX idx_tasks_user_id ON tasks(user_id)` in migration for O(log n) query performance.
- Q: Should the PostgreSQL sequence for `tasks.id` use INTEGER (max ~2.1 billion) or BIGINT (max ~9.2 quintillion) to prevent ID exhaustion? → A: BIGINT sequence (SERIAL8/BIGSERIAL) - Eliminates sequence exhaustion risk with negligible storage cost (4 bytes per row).
- Q: Should the database configuration use Neon's pooled connection endpoint or direct connection endpoint? → A: Neon pooled connection endpoint (via PgBouncer) - Recommended for FastAPI serverless applications, handles 10,000+ concurrent connections.
- Q: What is the acceptable query response time for retrieving a user's tasks (SELECT * FROM tasks WHERE user_id = ?)? → A: Under 100ms for typical dataset (100 tasks per user) - Industry standard providing good UX with total API response under 200ms.
- Q: Should timestamp automation be implemented at the database level (PostgreSQL triggers/defaults) or at the ORM level (SQLModel event listeners)? → A: Database-level (PostgreSQL defaults + triggers) - Single source of truth, enforced for all clients, more robust than application-level automation.

### Resolved

1. **Foreign Key Cascade Behavior** (Resolved 2026-01-11): CASCADE selected - Deleting a user automatically deletes all their tasks for GDPR "right to be forgotten" compliance. This aligns with data privacy regulations and simplifies the user experience.
