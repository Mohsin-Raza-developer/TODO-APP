# Database Query Examples

This document provides example SQL queries and Python code snippets for common database operations in the Todo application.

## Table of Contents

- [User Operations](#user-operations)
- [Task Operations](#task-operations)
- [Multi-User Queries](#multi-user-queries)
- [CASCADE Deletion](#cascade-deletion)
- [Performance Queries](#performance-queries)
- [Timestamp Queries](#timestamp-queries)

---

## User Operations

### Create a New User

**SQL (Direct)**:
```sql
-- Create user with Better Auth string-based ID
INSERT INTO users (id, email, name)
VALUES ('user_alice_123', 'alice@example.com', 'Alice Smith');

-- created_at is automatically set by DEFAULT NOW()
```

**Python (SQLModel)**:
```python
from sqlmodel import Session
from models import User

# Create new user
user = User(
    id="user_alice_123",  # Better Auth generates this
    email="alice@example.com",
    name="Alice Smith"
)

session.add(user)
session.commit()
session.refresh(user)

print(f"Created user: {user.id} at {user.created_at}")
```

**Expected Output**:
```
Created user: user_alice_123 at 2026-01-13 10:30:15.123456
```

### Get User by ID

**SQL**:
```sql
SELECT id, email, name, created_at
FROM users
WHERE id = 'user_alice_123';
```

**Python (SQLModel)**:
```python
from sqlmodel import Session, select
from models import User

# Query user by ID
statement = select(User).where(User.id == "user_alice_123")
user = session.exec(statement).first()

if user:
    print(f"Found: {user.name} ({user.email})")
else:
    print("User not found")
```

### Get User by Email

**SQL**:
```sql
SELECT id, email, name, created_at
FROM users
WHERE email = 'alice@example.com';
```

**Python (SQLModel)**:
```python
statement = select(User).where(User.email == "alice@example.com")
user = session.exec(statement).first()
```

---

## Task Operations

### Create a New Task

**SQL**:
```sql
-- Create task for user (id auto-increments, timestamps auto-set)
INSERT INTO tasks (user_id, title, description, completed)
VALUES ('user_alice_123', 'Buy groceries', 'Milk, eggs, bread', FALSE);

-- Both created_at and updated_at set to NOW() automatically
```

**Python (SQLModel)**:
```python
from models import Task

# Create new task
task = Task(
    user_id="user_alice_123",
    title="Buy groceries",
    description="Milk, eggs, bread",
    completed=False  # Default
)

session.add(task)
session.commit()
session.refresh(task)

print(f"Created task #{task.id}: {task.title}")
print(f"Timestamps: created={task.created_at}, updated={task.updated_at}")
```

**Expected Output**:
```
Created task #1: Buy groceries
Timestamps: created=2026-01-13 10:31:00, updated=2026-01-13 10:31:00
```

### Update a Task

**SQL**:
```sql
-- Update task title (updated_at auto-refreshed by trigger)
UPDATE tasks
SET title = 'Buy groceries and fruits',
    description = 'Milk, eggs, bread, apples, bananas'
WHERE id = 1 AND user_id = 'user_alice_123';

-- Trigger automatically updates updated_at to NOW()
-- created_at remains unchanged
```

**Python (SQLModel)**:
```python
# Get existing task
statement = select(Task).where(Task.id == 1, Task.user_id == "user_alice_123")
task = session.exec(statement).first()

if task:
    # Update fields
    task.title = "Buy groceries and fruits"
    task.description = "Milk, eggs, bread, apples, bananas"

    session.add(task)
    session.commit()
    session.refresh(task)

    print(f"Updated task #{task.id}")
    print(f"created_at: {task.created_at} (unchanged)")
    print(f"updated_at: {task.updated_at} (refreshed by trigger)")
```

### Mark Task as Complete

**SQL**:
```sql
-- Toggle completion status
UPDATE tasks
SET completed = TRUE
WHERE id = 1 AND user_id = 'user_alice_123';

-- updated_at auto-refreshed by trigger
```

**Python (SQLModel)**:
```python
statement = select(Task).where(Task.id == 1, Task.user_id == "user_alice_123")
task = session.exec(statement).first()

if task:
    task.completed = True
    session.add(task)
    session.commit()

    print(f"Task #{task.id} marked complete")
```

### Delete a Task

**SQL**:
```sql
-- Delete specific task
DELETE FROM tasks
WHERE id = 1 AND user_id = 'user_alice_123';
```

**Python (SQLModel)**:
```python
statement = select(Task).where(Task.id == 1, Task.user_id == "user_alice_123")
task = session.exec(statement).first()

if task:
    session.delete(task)
    session.commit()
    print(f"Deleted task #{task.id}")
```

---

## Multi-User Queries

### Get All Tasks for a User

**SQL**:
```sql
-- Get all tasks for specific user (uses ix_tasks_user_id index)
SELECT id, title, description, completed, created_at, updated_at
FROM tasks
WHERE user_id = 'user_alice_123'
ORDER BY created_at DESC;
```

**Python (SQLModel)**:
```python
# Get all tasks for user (filtered by user_id)
statement = select(Task).where(Task.user_id == "user_alice_123").order_by(Task.created_at.desc())
tasks = session.exec(statement).all()

print(f"Found {len(tasks)} tasks for user")
for task in tasks:
    status = "✓" if task.completed else "○"
    print(f"{status} #{task.id}: {task.title}")
```

**Expected Output**:
```
Found 3 tasks for user
○ #3: Call dentist
✓ #2: Finish report
○ #1: Buy groceries and fruits
```

### Get Only Pending Tasks

**SQL**:
```sql
SELECT id, title, created_at
FROM tasks
WHERE user_id = 'user_alice_123'
  AND completed = FALSE
ORDER BY created_at ASC;
```

**Python (SQLModel)**:
```python
statement = (
    select(Task)
    .where(Task.user_id == "user_alice_123", Task.completed == False)
    .order_by(Task.created_at)
)
pending_tasks = session.exec(statement).all()

print(f"Pending tasks: {len(pending_tasks)}")
```

### Get Only Completed Tasks

**SQL**:
```sql
SELECT id, title, created_at, updated_at
FROM tasks
WHERE user_id = 'user_alice_123'
  AND completed = TRUE
ORDER BY updated_at DESC;
```

**Python (SQLModel)**:
```python
statement = (
    select(Task)
    .where(Task.user_id == "user_alice_123", Task.completed == True)
    .order_by(Task.updated_at.desc())
)
completed_tasks = session.exec(statement).all()
```

### Count Tasks by User

**SQL**:
```sql
-- Count total, pending, and completed tasks
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE completed = FALSE) as pending,
    COUNT(*) FILTER (WHERE completed = TRUE) as completed
FROM tasks
WHERE user_id = 'user_alice_123';
```

**Python (SQLModel)**:
```python
from sqlmodel import func

# Get task counts
statement = select(Task).where(Task.user_id == "user_alice_123")
all_tasks = session.exec(statement).all()

total = len(all_tasks)
completed = len([t for t in all_tasks if t.completed])
pending = total - completed

print(f"Total: {total}, Pending: {pending}, Completed: {completed}")
```

---

## CASCADE Deletion

### Delete User and All Their Tasks (GDPR Compliance)

**SQL**:
```sql
-- Delete user (automatically deletes all their tasks via CASCADE)
DELETE FROM users WHERE id = 'user_alice_123';

-- All tasks with user_id = 'user_alice_123' are automatically deleted
-- due to ON DELETE CASCADE foreign key constraint
```

**Python (SQLModel)**:
```python
# Delete user (CASCADE deletion handles tasks automatically)
statement = select(User).where(User.id == "user_alice_123")
user = session.exec(statement).first()

if user:
    # Count tasks before deletion
    task_statement = select(Task).where(Task.user_id == user.id)
    task_count = len(session.exec(task_statement).all())

    # Delete user
    session.delete(user)
    session.commit()

    print(f"Deleted user '{user.name}' and {task_count} associated tasks")

    # Verify tasks are gone (CASCADE deletion)
    remaining_tasks = len(session.exec(task_statement).all())
    print(f"Remaining tasks: {remaining_tasks} (should be 0)")
```

**Expected Output**:
```
Deleted user 'Alice Smith' and 5 associated tasks
Remaining tasks: 0 (should be 0)
```

### Verify CASCADE Deletion

**SQL**:
```sql
-- Before deletion
SELECT COUNT(*) FROM tasks WHERE user_id = 'user_bob_456';
-- Result: 10

-- Delete user
DELETE FROM users WHERE id = 'user_bob_456';

-- After deletion (CASCADE effect)
SELECT COUNT(*) FROM tasks WHERE user_id = 'user_bob_456';
-- Result: 0 (all tasks deleted automatically)
```

---

## Performance Queries

### Verify Index Usage (EXPLAIN ANALYZE)

**SQL**:
```sql
-- Check if ix_tasks_user_id index is being used
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 'user_alice_123';
```

**Expected Output**:
```
Index Scan using ix_tasks_user_id on tasks  (cost=0.14..8.16 rows=1 width=507) (actual time=0.017..0.019 rows=2 loops=1)
  Index Cond: (user_id = 'user_alice_123'::text)
Planning Time: 0.063 ms
Execution Time: 0.036 ms
```

**Analysis**:
- ✅ Uses `ix_tasks_user_id` index (O(log n) performance)
- ✅ Execution time: 0.036ms (well under 100ms target)

### Bulk Insert Tasks

**SQL**:
```sql
-- Insert multiple tasks in one transaction
BEGIN;

INSERT INTO tasks (user_id, title) VALUES
    ('user_alice_123', 'Task 1'),
    ('user_alice_123', 'Task 2'),
    ('user_alice_123', 'Task 3'),
    ('user_alice_123', 'Task 4'),
    ('user_alice_123', 'Task 5');

COMMIT;
```

**Python (SQLModel)**:
```python
# Bulk insert using session.add_all()
tasks = [
    Task(user_id="user_alice_123", title=f"Task {i}")
    for i in range(1, 6)
]

session.add_all(tasks)
session.commit()

print(f"Created {len(tasks)} tasks in one transaction")
```

---

## Timestamp Queries

### Get Recently Created Tasks

**SQL**:
```sql
-- Tasks created in the last 24 hours
SELECT id, title, created_at
FROM tasks
WHERE user_id = 'user_alice_123'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Python (SQLModel)**:
```python
from datetime import datetime, timedelta

# Tasks created in last 24 hours
cutoff = datetime.utcnow() - timedelta(hours=24)

statement = (
    select(Task)
    .where(Task.user_id == "user_alice_123", Task.created_at > cutoff)
    .order_by(Task.created_at.desc())
)
recent_tasks = session.exec(statement).all()

print(f"Tasks created in last 24 hours: {len(recent_tasks)}")
```

### Get Recently Updated Tasks

**SQL**:
```sql
-- Tasks modified in the last hour
SELECT id, title, created_at, updated_at
FROM tasks
WHERE user_id = 'user_alice_123'
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

**Python (SQLModel)**:
```python
from datetime import datetime, timedelta

cutoff = datetime.utcnow() - timedelta(hours=1)

statement = (
    select(Task)
    .where(Task.user_id == "user_alice_123", Task.updated_at > cutoff)
    .order_by(Task.updated_at.desc())
)
recently_updated = session.exec(statement).all()
```

### Verify Timestamp Automation

**SQL**:
```sql
-- Check that created_at and updated_at are identical on creation
SELECT id, title,
       created_at,
       updated_at,
       (created_at = updated_at) as timestamps_match
FROM tasks
WHERE id = 1;

-- After update, verify created_at unchanged but updated_at changed
UPDATE tasks SET title = 'Updated title' WHERE id = 1;

SELECT id, title,
       created_at,
       updated_at,
       (updated_at > created_at) as updated_after_creation
FROM tasks
WHERE id = 1;
```

---

## Complete Example: Create User and Tasks

**Python (SQLModel)**:
```python
from sqlmodel import Session, create_engine, select
from models import User, Task
import os

# Connect to database
engine = create_engine(os.getenv("DATABASE_URL"))

with Session(engine) as session:
    # 1. Create user
    user = User(
        id="user_demo_789",
        email="demo@example.com",
        name="Demo User"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    print(f"Created user: {user.name}")

    # 2. Create multiple tasks
    tasks = [
        Task(user_id=user.id, title="Welcome task", completed=True),
        Task(user_id=user.id, title="Explore features"),
        Task(user_id=user.id, title="Complete tutorial"),
    ]
    session.add_all(tasks)
    session.commit()
    print(f"Created {len(tasks)} tasks")

    # 3. Query user's tasks
    statement = select(Task).where(Task.user_id == user.id)
    user_tasks = session.exec(statement).all()

    print(f"\n{user.name}'s tasks:")
    for task in user_tasks:
        status = "✓" if task.completed else "○"
        print(f"{status} #{task.id}: {task.title}")

    # 4. Delete user (CASCADE deletes tasks)
    session.delete(user)
    session.commit()
    print(f"\nDeleted user and {len(tasks)} tasks (CASCADE)")
```

**Expected Output**:
```
Created user: Demo User
Created 3 tasks

Demo User's tasks:
✓ #1: Welcome task
○ #2: Explore features
○ #3: Complete tutorial

Deleted user and 3 tasks (CASCADE)
```

---

## Database Schema Reference

### Tables

**users**:
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**tasks**:
```sql
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);
```

### Trigger (Timestamp Automation)

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Performance Tips

1. **Always filter by user_id first**: The `ix_tasks_user_id` index makes this extremely fast
2. **Use bulk operations**: `session.add_all()` for multiple inserts
3. **Avoid N+1 queries**: Fetch all related data in one query when possible
4. **Use EXPLAIN ANALYZE**: Verify index usage for your queries
5. **Leverage timestamps**: created_at and updated_at are database-managed, no application code needed

---

## Common Patterns

### User Isolation (Multi-User Data Isolation)

Always include `user_id` filter to prevent data leakage:

```python
# CORRECT: Filter by authenticated user
statement = select(Task).where(Task.user_id == authenticated_user_id)

# WRONG: No user filter (exposes all users' tasks)
statement = select(Task)  # Security vulnerability!
```

### Error Handling

```python
from sqlalchemy.exc import IntegrityError

try:
    # Attempt to create user with duplicate email
    user = User(id="user_123", email="existing@example.com", name="Test")
    session.add(user)
    session.commit()
except IntegrityError:
    session.rollback()
    print("Error: Email already exists (UNIQUE constraint)")
```

### Transaction Management

```python
from sqlmodel import Session

with Session(engine) as session:
    try:
        # Multiple operations in one transaction
        user = User(...)
        session.add(user)

        tasks = [Task(...), Task(...)]
        session.add_all(tasks)

        session.commit()  # All or nothing
    except Exception as e:
        session.rollback()  # Rollback on error
        print(f"Transaction failed: {e}")
```

---

## See Also

- [backend/README.md](../README.md) - Database setup guide
- [specs/002-database-schema/data-model.md](../../specs/002-database-schema/data-model.md) - Entity relationships
- [specs/002-database-schema/quickstart.md](../../specs/002-database-schema/quickstart.md) - Step-by-step setup
