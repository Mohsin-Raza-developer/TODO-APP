# Data Model: Database Schema

**Feature**: Database Schema for Multi-User Todo Application
**Date**: 2026-01-12
**Status**: Design Complete

## Overview

This document defines the complete data model for the Phase II multi-user todo application. The schema implements two entities (User, Task) with strict data isolation, automatic timestamp tracking, and GDPR-compliant CASCADE deletion. All design decisions align with the Database Schema Architect, Multi-User Data Isolation, and ID Architect skills.

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│       users             │
├─────────────────────────┤
│ id (TEXT, PK)           │◄────┐
│ email (TEXT, UNIQUE)    │     │
│ name (TEXT)             │     │
│ created_at (TIMESTAMP)  │     │ One-to-Many
└─────────────────────────┘     │ ON DELETE CASCADE
                                │
                                │
┌─────────────────────────┐     │
│       tasks             │     │
├─────────────────────────┤     │
│ id (BIGINT, PK)         │     │
│ user_id (TEXT, FK)      │─────┘
│ title (VARCHAR(200))    │
│ description (TEXT)      │
│ completed (BOOLEAN)     │
│ created_at (TIMESTAMP)  │
│ updated_at (TIMESTAMP)  │
└─────────────────────────┘

Indexes:
- idx_tasks_user_id (B-tree on tasks.user_id)

Triggers:
- update_tasks_updated_at (BEFORE UPDATE on tasks)
```

---

## Entities

### 1. User Entity

**Purpose**: Represent authenticated users and serve as parent for task ownership. Integrates with Better Auth JWT authentication.

**Table Name**: `users`

**Fields**:

| Field | Type | Constraints | Purpose | Source |
|-------|------|-------------|---------|--------|
| `id` | TEXT | PRIMARY KEY | Unique user identifier (Better Auth UUID format) | FR-001 |
| `email` | TEXT | UNIQUE, NOT NULL | User email address (login credential, account recovery) | FR-001, FR-005 |
| `name` | TEXT | NOT NULL | Display name for UI | FR-001 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp (audit trail) | FR-001, FR-008 |

**Relationships**:
- **One-to-Many with Task**: One user can own many tasks (`tasks.user_id → users.id`)

**Constraints**:
- **PRIMARY KEY**: `id` (Better Auth generates unique string IDs)
- **UNIQUE**: `email` (prevents duplicate account registrations, SC-007)
- **NOT NULL**: All fields required (no nullable columns)

**State Transitions**:
- User creation: Better Auth generates `id`, application provides `email` and `name`
- User deletion: CASCADE deletes all owned tasks (GDPR "right to be forgotten", FR-010)

**SQLModel Implementation**:

```python
# backend/src/models/user.py
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, TIMESTAMP, text

class User(SQLModel, table=True):
    """User model for Better Auth integration.

    Represents authenticated users in the application. Better Auth manages
    authentication and generates user IDs. This model stores the minimum
    required fields for user identification and audit trails.

    Attributes:
        id: Unique user identifier (Better Auth UUID format)
        email: User email address (unique, used for login)
        name: Display name for UI
        created_at: Account creation timestamp (auto-set by database)
    """
    __tablename__ = "users"

    id: str = Field(primary_key=True)  # Better Auth generates UUIDs
    email: str = Field(unique=True, nullable=False, max_length=255)
    name: str = Field(nullable=False, max_length=200)
    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")  # Database-level default
        )
    )

    # Optional: Relationship for ORM navigation
    # tasks: list["Task"] = Relationship(back_populates="user")
```

**Validation Rules** (Pydantic, enforced by SQLModel):
- `email`: Must be valid email format (Pydantic `EmailStr` if needed)
- `name`: Max 200 characters (reasonable display name length)
- All fields required (no defaults except `created_at`)

**Example Data**:
```json
{
  "id": "clh7x2w3y0000qz8r4t5u6v7w",
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "created_at": "2026-01-12T10:30:00Z"
}
```

---

### 2. Task Entity

**Purpose**: Represent user's todo items with sequential IDs (ID Architect pattern), completion tracking, and automatic timestamp management.

**Table Name**: `tasks`

**Fields**:

| Field | Type | Constraints | Purpose | Source |
|-------|------|-------------|---------|--------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Sequential task ID (ID Architect pattern, never reused) | FR-002, FR-003 |
| `user_id` | TEXT | FOREIGN KEY → users(id), NOT NULL, INDEXED | Task owner (data isolation, ownership verification) | FR-002, FR-004 |
| `title` | VARCHAR(200) | NOT NULL | Task title (1-200 characters) | FR-002, FR-006 |
| `description` | TEXT | NULLABLE | Optional task details (unlimited length) | FR-002 |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status | FR-002, FR-007 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation timestamp | FR-002, FR-008 |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW(), AUTO-UPDATE | Last modification timestamp (UPDATE trigger) | FR-002, FR-009 |

**Relationships**:
- **Many-to-One with User**: Many tasks belong to one user (`user_id → users.id`)

**Constraints**:
- **PRIMARY KEY**: `id` (BIGSERIAL, auto-increment from 1)
- **FOREIGN KEY**: `user_id REFERENCES users(id) ON DELETE CASCADE` (FR-004, FR-010)
- **NOT NULL**: `id`, `user_id`, `title`, `completed`, `created_at`, `updated_at`
- **NULLABLE**: `description` (optional field)
- **INDEX**: `idx_tasks_user_id` (B-tree on `user_id` for O(log n) query performance, FR-011)

**State Transitions**:
- **Task creation**: `completed = FALSE` (default), `created_at = NOW()`, `updated_at = NOW()`
- **Task update**: Any field modification triggers `updated_at = NOW()` (UPDATE trigger)
- **Task completion toggle**: `completed` changes between TRUE and FALSE
- **User deletion**: CASCADE deletes all user's tasks (GDPR compliance)

**SQLModel Implementation**:

```python
# backend/src/models/task.py
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BigInteger, TIMESTAMP, text

class Task(SQLModel, table=True):
    """Task model implementing ID Architect pattern with multi-user isolation.

    Represents user's todo items with sequential BIGINT IDs that never reuse
    deleted IDs. Ownership is enforced via user_id foreign key with CASCADE
    deletion for GDPR compliance.

    Attributes:
        id: Sequential BIGINT primary key (auto-increment, never reused)
        user_id: Foreign key to users.id (NOT NULL, indexed)
        title: Task title (1-200 characters)
        description: Optional task details (unlimited length)
        completed: Completion status (default: False)
        created_at: Task creation timestamp (auto-set by database)
        updated_at: Last modification timestamp (auto-updated by trigger)

    Performance:
        - Query by user_id: O(log n) via idx_tasks_user_id
        - Typical dataset: 100 tasks per user, <100ms query time (SC-002)

    Security:
        - user_id filtering prevents cross-user data access
        - ON DELETE CASCADE implements GDPR "right to be forgotten"
    """
    __tablename__ = "tasks"

    id: int | None = Field(
        default=None,
        sa_column=Column(
            BigInteger,
            primary_key=True,
            autoincrement=True  # BIGSERIAL in PostgreSQL
        )
    )

    user_id: str = Field(
        foreign_key="users.id",
        nullable=False,
        index=True  # Creates idx_tasks_user_id
    )

    title: str = Field(
        nullable=False,
        max_length=200  # Enforced at database level
    )

    description: str | None = Field(
        default=None,
        nullable=True  # Optional field
    )

    completed: bool = Field(
        default=False,
        nullable=False,
        sa_column_kwargs={"server_default": "FALSE"}  # Database-level default
    )

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
        )
    )

    updated_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
            # UPDATE trigger handles auto-update (not SQLModel)
        )
    )

    # Optional: Relationship for ORM navigation
    # user: User = Relationship(back_populates="tasks")
```

**Validation Rules** (Pydantic, enforced by SQLModel):
- `title`: Required, max 200 characters (SC-007)
- `description`: Optional, unlimited length
- `completed`: Boolean, default False
- `user_id`: Required, must reference valid user (foreign key constraint)

**Example Data**:
```json
{
  "id": 1,
  "user_id": "clh7x2w3y0000qz8r4t5u6v7w",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, coffee",
  "completed": false,
  "created_at": "2026-01-12T10:35:00Z",
  "updated_at": "2026-01-12T10:35:00Z"
}
```

**ID Architect Pattern Validation**:
```
Scenario: Create 100 tasks → Delete task #50 → Create new task
Expected: New task receives id=101 (not id=50)
Result: BIGSERIAL sequence never reuses deleted IDs (SC-003)
```

---

## Database Constraints

### Primary Keys
- `users.id`: TEXT PRIMARY KEY (Better Auth UUIDs)
- `tasks.id`: BIGINT PRIMARY KEY (BIGSERIAL auto-increment)

### Foreign Keys
- `tasks.user_id → users.id`:
  - `ON DELETE CASCADE`: Deleting user deletes all their tasks (FR-010)
  - `ON UPDATE RESTRICT`: Prevent user ID changes (Better Auth doesn't change IDs)

### Unique Constraints
- `users.email`: UNIQUE (prevents duplicate account registrations, FR-005)

### Not Null Constraints
- All fields NOT NULL except `tasks.description`
- Database rejects NULL values (SC-007)

### Default Values
- `tasks.completed`: DEFAULT FALSE (FR-007)
- `users.created_at`: DEFAULT NOW() (FR-008)
- `tasks.created_at`: DEFAULT NOW() (FR-008)
- `tasks.updated_at`: DEFAULT NOW() (FR-009, updated by trigger)

### Check Constraints
- None required (length constraints enforced by VARCHAR(200), Pydantic validation)

---

## Indexes

### idx_tasks_user_id
- **Type**: B-tree (PostgreSQL default)
- **Columns**: `tasks.user_id`
- **Purpose**: Optimize user-specific task queries (FR-011, Assumption #10)
- **Performance**: O(log n) query time for `WHERE user_id = ?` (SC-002)
- **Query Pattern**: `SELECT * FROM tasks WHERE user_id = 'user_123'`
- **Expected Performance**: <100ms for 100 tasks per user

**Creation**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**No additional indexes required** for Phase II. Future indexes may include:
- Composite index on `(user_id, completed)` for filtering completed/incomplete tasks
- Index on `created_at` for time-based sorting

---

## Triggers

### update_tasks_updated_at
- **Type**: BEFORE UPDATE trigger
- **Target**: `tasks` table
- **Purpose**: Automatically update `updated_at` field on any row modification (FR-009, Assumption #13)
- **Function**: `update_updated_at_column()` (PL/pgSQL function)

**Trigger Function**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger Definition**:
```sql
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Behavior**:
- Runs BEFORE every UPDATE statement on `tasks` table
- Modifies `NEW` record (the updated row) to set `updated_at = NOW()`
- Fires for each row updated (FOR EACH ROW)
- Automatic - application code doesn't need to set `updated_at`

**Validation**:
```sql
-- Create task
INSERT INTO tasks (user_id, title) VALUES ('user_1', 'Test');
-- created_at = 2026-01-12 10:00:00, updated_at = 2026-01-12 10:00:00

-- Wait 1 second, then update
UPDATE tasks SET title = 'Updated Test' WHERE id = 1;
-- created_at = 2026-01-12 10:00:00 (unchanged), updated_at = 2026-01-12 10:00:01 (changed)
```

---

## Query Patterns

### 1. Get User's Tasks (Most Common)
```sql
SELECT * FROM tasks WHERE user_id = 'user_123';
```
- Uses `idx_tasks_user_id` index
- Performance: O(log n), <100ms for 100 tasks (SC-002)

### 2. Get Single Task with Ownership Verification
```sql
SELECT * FROM tasks WHERE id = 5 AND user_id = 'user_123';
```
- Uses `idx_tasks_user_id` index (user_id filter first)
- Returns empty if task doesn't exist OR belongs to another user (Multi-User Data Isolation skill)
- Security: Returns 404 Not Found (not 403) to prevent information leakage

### 3. Create Task
```sql
INSERT INTO tasks (user_id, title, description, completed)
VALUES ('user_123', 'Buy milk', 'From the store', FALSE);
RETURNING *;
```
- `id` auto-generated by BIGSERIAL sequence
- `created_at` and `updated_at` auto-set by DEFAULT NOW()
- Returns complete task object with generated `id`

### 4. Update Task
```sql
UPDATE tasks
SET title = 'Buy organic milk', completed = TRUE
WHERE id = 5 AND user_id = 'user_123';
```
- `updated_at` auto-updated by trigger
- Ownership verification in WHERE clause (Multi-User Data Isolation)

### 5. Delete Task
```sql
DELETE FROM tasks WHERE id = 5 AND user_id = 'user_123';
```
- Ownership verification in WHERE clause
- ID 5 never reused (ID Architect pattern)

### 6. Delete User (CASCADE)
```sql
DELETE FROM users WHERE id = 'user_123';
```
- CASCADE deletes all tasks with `user_id = 'user_123'` (FR-010, GDPR compliance)
- Automatic via `ON DELETE CASCADE` constraint

---

## Data Integrity Rules

### Referential Integrity
- **Enforced**: Tasks cannot exist without a valid user (`user_id` foreign key)
- **Test**: Attempting to insert task with non-existent `user_id` fails with foreign key violation
- **Validation**: SC-004

### Ownership Isolation
- **Enforced**: All queries MUST filter by `user_id` (Multi-User Data Isolation skill)
- **Test**: User A cannot access User B's tasks via database constraints + application-level filtering
- **Validation**: SC-002 (zero cross-user data leaks)

### ID Uniqueness
- **Enforced**: Primary keys guaranteed unique by PostgreSQL
- **Test**: Cannot insert duplicate `user.id` or `task.id`
- **Validation**: SC-003

### Sequential IDs
- **Enforced**: BIGSERIAL sequence increments monotonically
- **Test**: Deleting task #50 doesn't allow reusing ID 50
- **Validation**: SC-003 (ID Architect pattern)

### Timestamp Accuracy
- **Enforced**: Database-level NOW() function uses PostgreSQL server time (UTC)
- **Test**: `created_at` and `updated_at` within 1 second tolerance
- **Validation**: SC-005

---

## Migration Strategy

### Phase II Initial Schema
- **Migration**: `001_initial_schema.py`
- **Tables**: `users`, `tasks`
- **Indexes**: `idx_tasks_user_id`
- **Triggers**: `update_tasks_updated_at`

### Future Migrations (Phase III+)
- Add columns: `tasks.priority`, `tasks.due_date`, `tasks.tags`
- Add tables: `categories`, `tags`, `task_tags` (many-to-many)
- Add indexes: Composite index on `(user_id, completed)`, time-based indexes

### Data Migration
- **Phase I → Phase II**: No data migration (Phase I was in-memory, no persistent data)
- **Phase II → Phase III**: Data migrations for backfilling new fields (e.g., set default priority)

---

## Performance Characteristics

### Query Performance
- **User's tasks**: O(log n) via B-tree index, <100ms for 100 tasks (SC-002)
- **Single task lookup**: O(log n) via primary key + index, <10ms
- **Task creation**: O(1) insert + sequence increment, <10ms
- **Task update**: O(log n) lookup + O(1) update + trigger overhead, <20ms
- **Task deletion**: O(log n) lookup + O(1) delete, <10ms
- **User deletion (CASCADE)**: O(n) where n = user's task count, <100ms for 100 tasks

### Storage Characteristics
- **User record**: ~100 bytes (TEXT id + email + name + timestamp)
- **Task record**: ~300 bytes (BIGINT + TEXT + VARCHAR(200) + TEXT + BOOLEAN + 2 timestamps)
- **Index overhead**: ~50 bytes per task (idx_tasks_user_id)
- **Database size estimate**: 10,000 users * 100 tasks/user * 350 bytes/task = ~350 MB

### Scalability
- **BIGINT capacity**: ~9.2 quintillion tasks (effectively unlimited, Assumption #5)
- **Connection pooling**: 10,000+ concurrent connections via PgBouncer (Assumption #11)
- **Horizontal scaling**: Sharding by `user_id` possible (future Phase V)

---

## Security Considerations

### Data Isolation
- **Enforced**: `user_id` foreign key + application-level `WHERE user_id = ?` filtering
- **Attack Prevention**: SQL injection prevented by ORM parameterized queries
- **Information Leakage Prevention**: 404 responses for non-existent/unauthorized tasks (not 403)

### GDPR Compliance
- **Right to be Forgotten**: ON DELETE CASCADE deletes all user data (FR-010)
- **Data Export**: Query `SELECT * FROM tasks WHERE user_id = ?` exports all user tasks
- **Audit Trail**: `created_at` timestamps enable compliance reporting

### Secrets Management
- **Database Credentials**: Stored in environment variables, never in code
- **Connection String**: Uses Neon pooled endpoint with SSL (sslmode=require)

---

## Testing Strategy

### Unit Tests (SQLModel Models)
```python
def test_task_validation():
    """Verify Pydantic validation."""
    # Valid task
    task = Task(user_id="user_1", title="Test", completed=False)
    assert task.title == "Test"

    # Invalid task (title too long)
    with pytest.raises(ValueError):
        Task(user_id="user_1", title="x" * 201)
```

### Integration Tests (Database)
```python
def test_cascade_deletion(session):
    """Verify ON DELETE CASCADE."""
    user = User(id="user_1", email="test@example.com", name="Test")
    task = Task(user_id="user_1", title="Test Task")
    session.add(user)
    session.add(task)
    session.commit()

    session.delete(user)
    session.commit()

    assert session.exec(select(Task)).all() == []  # Task cascade-deleted

def test_id_architect_pattern(session):
    """Verify sequential IDs never reused."""
    task1 = Task(user_id="user_1", title="Task 1")
    session.add(task1)
    session.commit()
    assert task1.id == 1

    task2 = Task(user_id="user_1", title="Task 2")
    session.add(task2)
    session.commit()
    assert task2.id == 2

    session.delete(task1)  # Delete task ID 1
    session.commit()

    task3 = Task(user_id="user_1", title="Task 3")
    session.add(task3)
    session.commit()
    assert task3.id == 3  # NOT 1 (ID never reused)
```

---

## References

- **Specification**: `specs/002-database-schema/spec.md`
- **Implementation Plan**: `specs/002-database-schema/plan.md`
- **Research**: `specs/002-database-schema/research.md`
- **Database Schema Architect Skill**: `.claude/skills/database_schema_architect.md`
- **Multi-User Data Isolation Skill**: `.claude/skills/multi_user_data_isolation.md`
- **ID Architect Skill**: `.claude/skills/id_architect.md`

---

**Status**: ✅ Data model design complete. Proceed to contracts/ and quickstart.md.
