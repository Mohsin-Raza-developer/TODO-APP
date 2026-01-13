# Quickstart Guide: Database Schema Setup

**Feature**: Database Schema for Multi-User Todo Application
**Date**: 2026-01-12
**Estimated Time**: 30-45 minutes

## Overview

This guide walks you through setting up the Phase II database schema from scratch. You'll provision a Neon PostgreSQL database, initialize Alembic migrations, create SQLModel models, and verify everything works correctly.

**Prerequisites**:
- Python 3.13+ installed
- UV package manager installed (`pip install uv`)
- Git repository cloned
- Terminal/command line access

**What You'll Build**:
- Neon Serverless PostgreSQL database (cloud-hosted)
- SQLModel ORM models (User, Task)
- Alembic migration system (versioned schema changes)
- Test database setup (pytest fixtures)

---

## Step 1: Provision Neon PostgreSQL Database

**Time**: 5 minutes

### 1.1 Create Neon Account

1. Visit [https://neon.tech](https://neon.tech)
2. Sign up for free account (GitHub OAuth recommended)
3. Verify email if required

### 1.2 Create New Project

1. Click "Create Project" in Neon dashboard
2. Project name: `todo-app-phase-ii` (or your choice)
3. Region: Choose closest to your location (e.g., `us-east-2`)
4. PostgreSQL version: Latest stable (15+ recommended)
5. Click "Create Project"

### 1.3 Get Connection String

1. After project creation, navigate to "Connection Details"
2. **IMPORTANT**: Select "Pooled connection" (not "Direct connection")
   - Look for URL with `-pooler` suffix in hostname
   - Example: `postgresql://user:pass@ep-abc-123-pooler.us-east-2.aws.neon.tech/db`
3. Copy the pooled connection string (we'll use it in `.env` file)

**Why Pooled Connection?**
Neon's pooled endpoint uses PgBouncer to handle 10,000+ concurrent connections, essential for serverless FastAPI deployment. Direct endpoints only support ~100 connections.

**Verification**:
```bash
# Test connection (replace with your URL)
psql "postgresql://user:pass@ep-abc-pooler.us-east-2.aws.neon.tech/dbname" -c "SELECT version();"

# Expected output: PostgreSQL version string
```

---

## Step 2: Environment Configuration

**Time**: 3 minutes

### 2.1 Create `.env` File

```bash
# Navigate to backend directory (or repo root if backend/ doesn't exist yet)
cd backend/

# Create .env file
touch .env
```

### 2.2 Add Database Credentials

Edit `.env` file with your favorite editor:

```bash
# .env (NEVER commit to git - add to .gitignore!)

# Neon PostgreSQL pooled connection string
# Format: postgresql://user:password@host-pooler.region.aws.neon.tech:5432/dbname?sslmode=require
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@ep-abc-123-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Better Auth secret (generate random 32+ character string)
# Use: python -c "import secrets; print(secrets.token_urlsafe(32))"
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-here
```

**Generate Better Auth Secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Example output: kJ3mP9qR2sT5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ
```

### 2.3 Add `.env` to `.gitignore`

```bash
# Ensure .env is not committed to git
echo ".env" >> .gitignore
```

**Verification**:
```bash
# Check that .env exists and has correct format
cat .env | grep DATABASE_URL
# Expected: DATABASE_URL=postgresql://...pooler...
```

---

## Step 3: Install Dependencies

**Time**: 2 minutes

### 3.1 Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend/

# Install dependencies with UV
uv pip install sqlmodel alembic psycopg2-binary python-dotenv pytest pytest-postgresql

# Or add to pyproject.toml and run:
uv sync
```

**Required Packages**:
- `sqlmodel>=0.0.14` - ORM (SQLAlchemy + Pydantic)
- `alembic>=1.13.0` - Database migrations
- `psycopg2-binary>=2.9.0` - PostgreSQL adapter
- `python-dotenv>=1.0.0` - Environment variable loader
- `pytest>=8.0.0` - Testing framework
- `pytest-postgresql` - Test database fixtures

**Verification**:
```bash
python -c "import sqlmodel; import alembic; print('Dependencies installed!')"
# Expected: Dependencies installed!
```

---

## Step 4: Initialize Alembic

**Time**: 5 minutes

### 4.1 Run Alembic Init

```bash
# From backend/ directory
alembic init alembic

# Expected output:
# Creating directory /path/to/backend/alembic ... done
# Creating directory /path/to/backend/alembic/versions ... done
# Generating /path/to/backend/alembic.ini ... done
# Generating /path/to/backend/alembic/env.py ... done
# ...
```

**Directory Structure After Init**:
```
backend/
├── alembic/
│   ├── versions/        # Migration scripts (initially empty)
│   ├── env.py           # Alembic environment config
│   ├── script.py.mako   # Migration template
│   └── README
├── alembic.ini          # Alembic configuration
└── .env                 # Environment variables
```

### 4.2 Configure `alembic.ini`

Edit `backend/alembic.ini`:

```ini
# alembic.ini

[alembic]
# ... (leave other settings unchanged)

# CHANGE THIS: Comment out hardcoded sqlalchemy.url
# sqlalchemy.url = driver://user:pass@localhost/dbname

# Database URL will be set from environment variable in env.py
# (No hardcoded database URL for security)
```

### 4.3 Configure `alembic/env.py`

Edit `backend/alembic/env.py` to load DATABASE_URL from environment:

```python
# alembic/env.py (add/modify these sections)

import os
from dotenv import load_dotenv
from sqlmodel import SQLModel

# Load environment variables from .env file
load_dotenv()

# Import all SQLModel models here for autogeneration
# (Add these imports after creating models in Step 5)
from src.models.user import User
from src.models.task import Task

# Set database URL from environment variable
config.set_main_option(
    "sqlalchemy.url",
    os.getenv("DATABASE_URL")  # Read from .env
)

# Set target_metadata for autogeneration
target_metadata = SQLModel.metadata  # SQLModel metadata includes all models
```

**Verification**:
```bash
# Test Alembic configuration
alembic current

# Expected output (before first migration):
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Will assume transactional DDL.
```

---

## Step 5: Create SQLModel Models

**Time**: 10 minutes

### 5.1 Create Models Directory

```bash
# From backend/ directory
mkdir -p src/models
touch src/models/__init__.py
```

### 5.2 Create User Model

Create `backend/src/models/user.py`:

```python
"""User model for Better Auth integration."""

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

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, nullable=False, max_length=255)
    name: str = Field(nullable=False, max_length=200)
    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
        )
    )
```

### 5.3 Create Task Model

Create `backend/src/models/task.py`:

```python
"""Task model implementing ID Architect pattern."""

from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BigInteger, TIMESTAMP, text


class Task(SQLModel, table=True):
    """Task model implementing ID Architect pattern with multi-user isolation.

    Attributes:
        id: Sequential BIGINT primary key (auto-increment, never reused)
        user_id: Foreign key to users.id (NOT NULL, indexed)
        title: Task title (1-200 characters)
        description: Optional task details (unlimited length)
        completed: Completion status (default: False)
        created_at: Task creation timestamp (auto-set by database)
        updated_at: Last modification timestamp (auto-updated by trigger)
    """
    __tablename__ = "tasks"

    id: int | None = Field(
        default=None,
        sa_column=Column(BigInteger, primary_key=True, autoincrement=True)
    )
    user_id: str = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(nullable=False, max_length=200)
    description: str | None = Field(default=None, nullable=True)
    completed: bool = Field(
        default=False,
        nullable=False,
        sa_column_kwargs={"server_default": "FALSE"}
    )
    created_at: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    )
    updated_at: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    )
```

### 5.4 Export Models

Edit `backend/src/models/__init__.py`:

```python
"""SQLModel database models."""

from .user import User
from .task import Task

__all__ = ["User", "Task"]
```

**Verification**:
```bash
python -c "from src.models import User, Task; print('Models imported successfully!')"
# Expected: Models imported successfully!
```

---

## Step 6: Generate and Apply Migration

**Time**: 10 minutes

### 6.1 Generate Initial Migration

```bash
# From backend/ directory
alembic revision --autogenerate -m "Initial database schema"

# Expected output:
# INFO  [alembic.autogenerate.compare] Detected added table 'users'
# INFO  [alembic.autogenerate.compare] Detected added table 'tasks'
# INFO  [alembic.autogenerate.compare] Detected added index 'idx_tasks_user_id' on '['user_id']'
# Generating /path/to/backend/alembic/versions/abc123_initial_database_schema.py ... done
```

### 6.2 Review Generated Migration

Open the generated file in `backend/alembic/versions/` (filename will vary):

```python
# backend/alembic/versions/abc123_initial_database_schema.py

# ... (autogenerated code)

def upgrade() -> None:
    op.create_table('users', ...)
    op.create_table('tasks', ...)
    op.create_index('idx_tasks_user_id', ...)

    # ⚠️ ADD MANUALLY: Alembic doesn't autogenerate triggers
    # (See migration-template.py in contracts/ for complete trigger code)
```

### 6.3 Add UPDATE Trigger (Manual Step)

**IMPORTANT**: Alembic autogeneration doesn't detect triggers. Add manually:

```python
# Add to upgrade() function in generated migration:

def upgrade() -> None:
    # ... (autogenerated tables and indexes)

    # CREATE TRIGGER FUNCTION (manual addition)
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # CREATE TRIGGER (manual addition)
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)

# Add to downgrade() function:

def downgrade() -> None:
    # DROP TRIGGERS (manual addition - must drop before dropping tables)
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")

    # ... (autogenerated drop statements)
```

**Reference**: See `specs/002-database-schema/contracts/migration-template.py` for complete example.

### 6.4 Apply Migration

```bash
# Apply migration to Neon database
alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Will assume transactional DDL.
# INFO  [alembic.runtime.migration] Running upgrade  -> abc123, Initial database schema
```

**Verification**:
```bash
# Check migration status
alembic current

# Expected: abc123 (head)

# Verify tables created in Neon database
psql $DATABASE_URL -c "\dt"

# Expected output:
#           List of relations
#  Schema |  Name  | Type  |  Owner
# --------+--------+-------+---------
#  public | tasks  | table | neondb_owner
#  public | users  | table | neondb_owner
```

---

## Step 7: Test Schema

**Time**: 5 minutes

### 7.1 Test Table Creation

```bash
# Describe users table
psql $DATABASE_URL -c "\d users"

# Expected: id (text), email (text), name (text), created_at (timestamp)

# Describe tasks table
psql $DATABASE_URL -c "\d tasks"

# Expected: id (bigint), user_id (text), title (varchar(200)), etc.
```

### 7.2 Test ID Architect Pattern

```bash
# Insert test user and tasks
psql $DATABASE_URL <<EOF
INSERT INTO users (id, email, name) VALUES ('test_user_1', 'test@example.com', 'Test User');
INSERT INTO tasks (user_id, title) VALUES ('test_user_1', 'Task 1');
INSERT INTO tasks (user_id, title) VALUES ('test_user_1', 'Task 2');
INSERT INTO tasks (user_id, title) VALUES ('test_user_1', 'Task 3');
SELECT id FROM tasks ORDER BY id;
EOF

# Expected: 1, 2, 3

# Delete task #2, then insert new task
psql $DATABASE_URL <<EOF
DELETE FROM tasks WHERE id = 2;
INSERT INTO tasks (user_id, title) VALUES ('test_user_1', 'Task 4');
SELECT id FROM tasks ORDER BY id;
EOF

# Expected: 1, 3, 4 (ID 2 not reused - ID Architect pattern working!)
```

### 7.3 Test CASCADE Deletion

```bash
# Delete user (should cascade-delete all tasks)
psql $DATABASE_URL <<EOF
DELETE FROM users WHERE id = 'test_user_1';
SELECT COUNT(*) FROM tasks;
EOF

# Expected: 0 (all tasks cascade-deleted)
```

### 7.4 Test UPDATE Trigger

```bash
# Insert user and task
psql $DATABASE_URL <<EOF
INSERT INTO users (id, email, name) VALUES ('test_user_2', 'test2@example.com', 'Test User 2');
INSERT INTO tasks (user_id, title) VALUES ('test_user_2', 'Test Task');
SELECT created_at, updated_at FROM tasks WHERE user_id = 'test_user_2';
EOF

# Note the timestamps (should be identical)

# Wait 2 seconds, then update task
sleep 2
psql $DATABASE_URL <<EOF
UPDATE tasks SET title = 'Updated Task' WHERE user_id = 'test_user_2';
SELECT created_at, updated_at FROM tasks WHERE user_id = 'test_user_2';
EOF

# Expected: created_at unchanged, updated_at increased by ~2 seconds
```

**Cleanup Test Data**:
```bash
psql $DATABASE_URL -c "DELETE FROM users WHERE id LIKE 'test_user_%';"
```

---

## Step 8: Configure Testing

**Time**: 5 minutes

### 8.1 Create pytest Configuration

Create `backend/tests/conftest.py`:

```python
"""pytest fixtures for database testing."""

import pytest
from sqlmodel import create_engine, Session
from alembic import command
from alembic.config import Config


@pytest.fixture(scope="session")
def test_database_url():
    """Provide test database URL (use same Neon instance for now)."""
    # TODO: Create separate test database in production
    import os
    from dotenv import load_dotenv
    load_dotenv()
    return os.getenv("DATABASE_URL")


@pytest.fixture(scope="session")
def test_engine(test_database_url):
    """Create test database engine and apply migrations."""
    engine = create_engine(test_database_url, echo=True)

    # Apply Alembic migrations
    alembic_config = Config("alembic.ini")
    alembic_config.set_main_option("sqlalchemy.url", test_database_url)
    command.upgrade(alembic_config, "head")

    yield engine

    # Teardown: Rollback migrations
    command.downgrade(alembic_config, "base")


@pytest.fixture
def session(test_engine):
    """Provide transactional session that rolls back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### 8.2 Create Test File

Create `backend/tests/test_models.py`:

```python
"""Test SQLModel models."""

from src.models import User, Task


def test_user_creation(session):
    """Test user model creation."""
    user = User(id="test_1", email="test@example.com", name="Test User")
    session.add(user)
    session.commit()

    assert user.id == "test_1"
    assert user.email == "test@example.com"


def test_task_creation(session):
    """Test task model creation."""
    user = User(id="test_2", email="test2@example.com", name="Test User 2")
    session.add(user)
    session.commit()

    task = Task(user_id="test_2", title="Test Task")
    session.add(task)
    session.commit()

    assert task.id == 1  # First task in this transaction
    assert task.user_id == "test_2"
    assert task.completed is False  # Default value
```

### 8.3 Run Tests

```bash
# From backend/ directory
pytest tests/test_models.py -v

# Expected:
# test_models.py::test_user_creation PASSED
# test_models.py::test_task_creation PASSED
```

---

## Step 9: Rollback and Re-apply (Optional)

**Time**: 2 minutes

### 9.1 Test Migration Rollback

```bash
# Rollback migration
alembic downgrade -1

# Expected: Tables, indexes, triggers dropped

# Verify schema removed
psql $DATABASE_URL -c "\dt"

# Expected: No tables found (or empty list)
```

### 9.2 Re-apply Migration

```bash
# Re-apply migration
alembic upgrade head

# Expected: Schema recreated

# Verify tables exist again
psql $DATABASE_URL -c "\dt"

# Expected: users, tasks tables listed
```

**Result**: If rollback and re-apply both succeed, migration is reversible and production-ready!

---

## Troubleshooting

### Error: "relation 'users' does not exist"
**Cause**: Migration not applied
**Solution**: Run `alembic upgrade head`

### Error: "connection to server failed"
**Cause**: Incorrect DATABASE_URL or network issue
**Solution**:
1. Verify DATABASE_URL in `.env` uses `-pooler` suffix
2. Test connection: `psql $DATABASE_URL -c "SELECT 1"`
3. Check Neon dashboard for database status

### Error: "No module named 'src'"
**Cause**: Python path not set correctly
**Solution**: Add `export PYTHONPATH=.` before running commands, or use `python -m pytest` instead of `pytest`

### Error: "trigger 'update_tasks_updated_at' not created"
**Cause**: Forgot to manually add trigger to migration
**Solution**: Edit migration file and add trigger creation code (see Step 6.3)

### Error: "Invalid value for sslmode"
**Cause**: Missing `?sslmode=require` in DATABASE_URL
**Solution**: Append `?sslmode=require` to connection string

---

## Next Steps

✅ **Database schema complete!** You can now:

1. **Generate Tasks** (`/sp.tasks`): Break down implementation into granular tasks
2. **Implement SQLModel Models**: Write production-ready models with validation
3. **Implement First Migration**: Create complete migration with triggers
4. **Write Integration Tests**: Test CASCADE deletion, ID Architect pattern, triggers
5. **Create Database Module**: Implement `backend/src/database.py` with engine and session management
6. **Integrate with FastAPI**: Create API endpoints that use database models

**Recommended Order**:
1. `/sp.tasks` - Generate implementation tasks
2. Implement models (User, Task) based on this quickstart
3. Implement migration based on `contracts/migration-template.py`
4. Write integration tests
5. Create database connection module
6. Build FastAPI endpoints (Phase II feature 003-api-endpoints)

---

## Summary

**What You Built**:
- ✅ Neon PostgreSQL database (pooled connection endpoint)
- ✅ Environment configuration (`.env` with secrets)
- ✅ Alembic migration system (versioned schema changes)
- ✅ SQLModel models (User, Task with type safety)
- ✅ Initial migration (tables, indexes, triggers)
- ✅ Test database setup (pytest fixtures)

**Time Spent**: ~30-45 minutes

**Skills Applied**:
- Database Schema Architect (BIGINT, indexes, triggers, pooling)
- Multi-User Data Isolation (user_id foreign keys, CASCADE)
- Neon PostgreSQL Serverless Integration (pooled endpoint, migrations)
- ID Architect (sequential BIGINT IDs, never reused)

**Validation**:
- [x] Tables created (users, tasks)
- [x] Indexes created (idx_tasks_user_id)
- [x] Triggers created (update_tasks_updated_at)
- [x] ID Architect pattern working (IDs never reused)
- [x] CASCADE deletion working (GDPR compliance)
- [x] UPDATE trigger working (updated_at auto-updated)
- [x] Migration reversible (downgrade → upgrade)

**You're ready for implementation!** 🚀
