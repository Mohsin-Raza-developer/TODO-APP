# Backend: Todo Application REST API

**Multi-User Todo Application Backend with REST API**

This directory contains the complete backend implementation including:
- **Phase II**: Database schema with Neon PostgreSQL, SQLModel ORM, and Alembic migrations
- **Phase III**: REST API with FastAPI, JWT authentication, and comprehensive CRUD operations

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Setup](#database-setup)
- [Alembic Migrations](#alembic-migrations)
- [Running Tests](#running-tests)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Overview

The database schema implements:
- **User Management**: User accounts with Better Auth JWT integration
- **Task Management**: Multi-user task isolation with `user_id` foreign keys
- **ID Architect Pattern**: Sequential BIGINT IDs (never reused after deletion)
- **Timestamp Automation**: Database-level `created_at`/`updated_at` tracking with UPDATE triggers
- **GDPR Compliance**: CASCADE deletion for "right to be forgotten"

**Schema Entities**:
- `users` table: User accounts (id, email, name, created_at)
- `tasks` table: User tasks (id, user_id, title, description, completed, created_at, updated_at)

**Key Features**:
- User-task relationship with `ON DELETE CASCADE`
- B-tree index on `tasks.user_id` for efficient queries (<100ms)
- Database-managed timestamps (DEFAULT NOW(), UPDATE trigger)
- Sequential IDs that never decrement (ID Architect pattern)

---

## Tech Stack

- **Language**: Python 3.13+
- **Database**: Neon Serverless PostgreSQL (cloud-hosted, auto-scaling)
- **ORM**: SQLModel 0.0.14+ (SQLAlchemy + Pydantic)
- **Migrations**: Alembic 1.13+
- **Database Driver**: psycopg2-binary 2.9+
- **Testing**: pytest 8.0+, pytest-asyncio
- **Environment**: python-dotenv 1.0+

---

## Database Setup

### Prerequisites

- Python 3.13+ installed
- Neon PostgreSQL account (free tier available)
- Terminal/command line access

### Step 1: Provision Neon PostgreSQL Database

1. **Create Neon Account**
   - Visit [https://neon.tech](https://neon.tech)
   - Sign up (GitHub OAuth recommended)
   - Verify email if required

2. **Create New Project**
   - Click "Create Project" in Neon dashboard
   - Project name: `todo-app-phase-ii` (or your choice)
   - Region: Choose closest to you (e.g., `us-east-1`, `us-east-2`)
   - PostgreSQL version: Latest stable (15+ recommended)
   - Click "Create Project"

3. **Get Pooled Connection String**
   - After project creation, navigate to "Connection Details"
   - **CRITICAL**: Select **"Pooled connection"** (NOT "Direct connection")
   - Look for URL with `-pooler` suffix in hostname
   - Example: `postgresql://user:pass@ep-abc-123-pooler.us-east-2.aws.neon.tech/neondb`
   - Copy the pooled connection string

**Why Pooled Connection?**

Neon's pooled endpoint uses PgBouncer to handle 10,000+ concurrent connections, essential for serverless deployments. Direct endpoints only support ~100 connections and will fail under load.

**Verification**:
```bash
# Test connection (replace with your actual URL)
psql "postgresql://user:pass@ep-abc-pooler.us-east-2.aws.neon.tech/neondb" -c "SELECT version();"

# Expected output: PostgreSQL 15.x version string
```

### Step 2: Environment Configuration

1. **Create `.env` file** in the `backend/` directory:

```bash
cd backend/
touch .env
```

2. **Add database credentials** to `.env`:

```bash
# Neon PostgreSQL pooled connection string
# Format: postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Better Auth secret for JWT token verification
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-characters
```

**Generate Better Auth Secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Example output: kJ3mP9qR2sT5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ
```

3. **Verify `.env` is in `.gitignore`**:

```bash
# Check if .env is ignored (should return nothing)
git check-ignore .env

# If not ignored, add to .gitignore
echo ".env" >> .gitignore
```

**SECURITY WARNING**: Never commit `.env` to version control. It contains sensitive database credentials.

### Step 3: Install Python Dependencies

1. **Create virtual environment** (if not already created):

```bash
# From repository root
python3.13 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate  # Windows
```

2. **Install dependencies**:

```bash
cd backend/

# Install from pyproject.toml
pip install -e .

# OR install specific packages
pip install sqlmodel>=0.0.14 alembic>=1.13.0 psycopg2-binary>=2.9.0 python-dotenv>=1.0.0
```

**Verify Installation**:
```bash
python -c "import sqlmodel, alembic; print('✓ Dependencies installed')"
# Expected output: ✓ Dependencies installed
```

---

## Alembic Migrations

Alembic manages database schema versions. All schema changes must go through migrations for safe deployments and rollbacks.

### Initialize Alembic (First Time Only)

**NOTE**: Alembic is already initialized in this repository. Skip this section unless starting fresh.

```bash
cd backend/
alembic init alembic

# Edit alembic.ini to set sqlalchemy.url from environment
# Edit alembic/env.py to import models and load .env
```

### Apply Migrations

1. **Check current migration state**:

```bash
cd backend/
alembic current

# Expected output:
# db201faec95e (head)  # Initial schema migration
# OR
# (empty)  # No migrations applied yet
```

2. **Apply all pending migrations**:

```bash
alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Running upgrade  -> db201faec95e, Initial schema
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
```

3. **Verify schema created**:

```bash
# Connect to database and list tables
psql $DATABASE_URL -c "\dt"

# Expected output:
#          List of relations
#  Schema |   Name   | Type  |   Owner
# --------+----------+-------+-----------
#  public | alembic_version | table | neondb_owner
#  public | tasks    | table | neondb_owner
#  public | users    | table | neondb_owner
```

4. **Verify schema structure**:

```bash
# Show users table structure
psql $DATABASE_URL -c "\d users"

# Expected columns: id (TEXT), email (TEXT UNIQUE), name (TEXT), created_at (TIMESTAMP)

# Show tasks table structure
psql $DATABASE_URL -c "\d tasks"

# Expected columns: id (BIGINT), user_id (TEXT FK), title (VARCHAR(200)),
#                   description (TEXT), completed (BOOLEAN),
#                   created_at (TIMESTAMP), updated_at (TIMESTAMP)

# Show indexes
psql $DATABASE_URL -c "\di"

# Expected: ix_tasks_user_id (B-tree index on tasks.user_id)
```

### Rollback Migrations

**WARNING**: Rolling back migrations will delete data. Only use in development or with proper backups.

```bash
# Rollback one migration
alembic downgrade -1

# Rollback all migrations (drop entire schema)
alembic downgrade base

# Re-apply after rollback
alembic upgrade head
```

**Verify Rollback**:
```bash
# After downgrade base, tables should be gone
psql $DATABASE_URL -c "\dt"

# Expected output: No relations found (or only alembic_version)
```

### Create New Migration

When modifying SQLModel models, generate a new migration:

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add column X to tasks"

# Edit generated migration file in alembic/versions/
# Review changes, add manual operations if needed

# Apply new migration
alembic upgrade head
```

**Best Practices**:
- Review auto-generated migrations before applying (Alembic may miss some changes)
- Test migrations on a copy of production data before deploying
- Always implement both `upgrade()` and `downgrade()` functions
- Include database-level triggers/functions in manual migration steps (Alembic doesn't auto-detect these)

---

## Running Tests

The test suite validates schema behavior using pytest with transactional rollback for isolation (100x faster than recreating database per test).

### Prerequisites

```bash
# Install test dependencies
pip install pytest>=8.0.0 pytest-asyncio

# Ensure .env file exists with DATABASE_URL
```

### Run All Tests

```bash
cd backend/

# Run all integration tests with verbose output
python -m pytest tests/ -v

# Expected output:
# ============================= test session starts ==============================
# ...
# tests/test_cascade_deletion.py::TestCascadeDeletion::test_cascade_deletion_basic PASSED
# tests/test_constraints.py::TestDatabaseConstraints::test_null_user_id_rejected PASSED
# tests/test_id_architect.py::TestIDArchitect::test_sequential_id_generation PASSED
# tests/test_migrations.py::TestMigrationReversibility::test_migration_upgrade_downgrade PASSED
# tests/test_timestamps.py::TestTimestampAutomation::test_created_at_auto_set PASSED
# tests/test_user_model.py::TestUserModel::test_user_creation PASSED
# ...
# ==================== 24 passed, 8 warnings in 133.45s =====================
```

### Run Specific Test Suites

```bash
# ID Architect pattern tests
pytest tests/test_id_architect.py -v

# Timestamp automation tests
pytest tests/test_timestamps.py -v

# Better Auth user model tests
pytest tests/test_user_model.py -v

# Migration rollback tests
pytest tests/test_migrations.py -v -s  # -s shows print output

# CASCADE deletion tests
pytest tests/test_cascade_deletion.py -v

# Database constraint tests
pytest tests/test_constraints.py -v
```

### Test Coverage

Current test coverage (24 tests):

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| ID Architect (test_id_architect.py) | 3 | Sequential IDs, ID reuse prevention, bulk deletion |
| CASCADE Deletion (test_cascade_deletion.py) | 3 | User deletion cascades to tasks, multi-user isolation |
| Constraints (test_constraints.py) | 7 | NOT NULL, UNIQUE, Foreign Key, VARCHAR(200) limits |
| Timestamps (test_timestamps.py) | 5 | DEFAULT NOW(), UPDATE trigger, created_at immutability |
| User Model (test_user_model.py) | 5 | Better Auth string IDs, email uniqueness, minimal schema |
| Migrations (test_migrations.py) | 1 | Upgrade/downgrade reversibility, schema validation |

**Performance**:
- Test execution: ~133 seconds (2:13) for full suite
- Transaction-based isolation: 100x faster than database recreation
- All tests use same database (no cleanup needed)

---

## Development Workflow

### Daily Development

1. **Start development session**:

```bash
# Activate virtual environment
source .venv/bin/activate

# Navigate to backend
cd backend/

# Verify database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks;"
```

2. **Make schema changes**:

```bash
# Edit models in src/models.py
# Generate migration
alembic revision --autogenerate -m "Description of changes"

# Review migration in alembic/versions/
# Apply migration
alembic upgrade head

# Run tests to verify
pytest tests/ -v
```

3. **Manual database queries**:

```bash
# Create test user
psql $DATABASE_URL -c "INSERT INTO users (id, email, name) VALUES ('user_123', 'test@example.com', 'Test User');"

# Create test tasks
psql $DATABASE_URL -c "INSERT INTO tasks (user_id, title) VALUES ('user_123', 'My first task'), ('user_123', 'My second task');"

# Query user tasks
psql $DATABASE_URL -c "SELECT * FROM tasks WHERE user_id = 'user_123';"

# Verify CASCADE deletion
psql $DATABASE_URL -c "DELETE FROM users WHERE id = 'user_123';"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks WHERE user_id = 'user_123';"  # Should return 0
```

### Query Performance Verification

Verify that indexes are being used for efficient queries:

```bash
# Run EXPLAIN ANALYZE on user task query
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'user_123';"

# Expected output:
# Index Scan using ix_tasks_user_id on tasks  (cost=0.14..8.16 rows=1 width=507) (actual time=0.017..0.019 rows=2 loops=1)
#   Index Cond: (user_id = 'user_123'::text)
# Planning Time: 0.063 ms
# Execution Time: 0.036 ms

# ✓ Confirms O(log n) performance with ix_tasks_user_id index
```

**Performance Benchmarks**:
- Query with index: 0.036ms (O(log n))
- Target: <100ms for 100 tasks per user
- Actual: Well under target even at scale

### Database Seeding

Create development test data:

```bash
# Run seed script (if implemented)
python scripts/seed_database.py

# Verify seeded data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"   # Should show 2
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks;"   # Should show 10
```

---

## Troubleshooting

### Common Issues

#### 1. "ModuleNotFoundError: No module named 'models'"

**Solution**: Ensure Python path includes `src/` directory.

```bash
# Add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"

# OR run from backend/ directory
cd backend/
python -m pytest tests/
```

#### 2. "Connection refused" or "could not connect to server"

**Solution**: Verify DATABASE_URL uses pooled endpoint (`-pooler` suffix).

```bash
# Check .env file
cat .env | grep DATABASE_URL

# Should contain: ep-xxx-pooler.region.aws.neon.tech
# NOT: ep-xxx.region.aws.neon.tech (missing -pooler)

# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

#### 3. "psycopg2.errors.UndefinedTable: relation 'users' does not exist"

**Solution**: Apply Alembic migrations.

```bash
cd backend/
alembic upgrade head

# Verify schema created
psql $DATABASE_URL -c "\dt"
```

#### 4. "alembic.util.exc.CommandError: Can't locate revision identified by 'head'"

**Solution**: Alembic migrations not initialized.

```bash
# Check alembic/versions/ directory exists and contains migration files
ls alembic/versions/

# If empty, migrations need to be generated
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

#### 5. Tests fail with "transaction already deassociated from connection"

**Solution**: This is a warning, not an error. Tests use transactional rollback for isolation.

```bash
# Warnings are expected - verify tests still pass
pytest tests/ -v

# Look for: X passed, Y warnings
# As long as tests pass, warnings are safe to ignore
```

#### 6. "duplicate key value violates unique constraint 'users_email_key'"

**Solution**: Email already exists in database (UNIQUE constraint enforced).

```bash
# Either use different email
psql $DATABASE_URL -c "INSERT INTO users (id, email, name) VALUES ('user_456', 'different@example.com', 'User 2');"

# OR delete existing user first
psql $DATABASE_URL -c "DELETE FROM users WHERE email = 'test@example.com';"
```

---

## Project Structure

```
backend/
├── README.md                 # This file
├── .env                      # Database credentials (NOT in git)
├── .env.example              # Environment variable template
├── pyproject.toml            # Python dependencies
├── alembic.ini               # Alembic configuration
├── alembic/
│   ├── env.py                # Alembic environment setup
│   ├── script.py.mako        # Migration template
│   └── versions/
│       └── db201faec95e_initial_schema.py  # Initial migration
├── src/
│   └── models.py             # SQLModel definitions (User, Task)
├── tests/
│   ├── conftest.py           # pytest fixtures
│   ├── test_id_architect.py  # ID Architect pattern tests
│   ├── test_cascade_deletion.py  # CASCADE deletion tests
│   ├── test_constraints.py   # Database constraint tests
│   ├── test_timestamps.py    # Timestamp automation tests
│   ├── test_user_model.py    # User model & Better Auth tests
│   └── test_migrations.py    # Migration rollback tests
└── scripts/
    └── seed_database.py      # Development data seeding
```

---

## Next Steps

After completing database setup:

1. **Implement FastAPI endpoints** (Phase III) - CRUD operations for tasks
2. **Integrate Better Auth** (Phase IV) - JWT authentication and user management
3. **Deploy to production** - Docker containerization and cloud hosting

For detailed implementation guidance, see:
- `specs/002-database-schema/quickstart.md` - Step-by-step setup guide
- `specs/002-database-schema/plan.md` - Technical architecture plan
- `specs/002-database-schema/data-model.md` - SQLModel entity details

---

## Support

For issues or questions:
- Review `specs/002-database-schema/` documentation
- Check Alembic logs: `alembic.log` (if configured)
- Verify Neon dashboard for database status
- Run test suite to validate schema: `pytest tests/ -v`

**Constitution Principles Applied**:
- Principle III: Persistent Relational State (PostgreSQL, SQLModel, Alembic)
- Principle VI: Reusable Intelligence (Database Schema Architect, Multi-User Data Isolation)
- Principle VII: Stateless Security (user_id foreign keys, CASCADE deletion)

---

# Phase III: REST API Implementation

## REST API Features

- ✅ Complete CRUD operations for todos (Create, Read, Update, Delete, Toggle)
- ✅ JWT authentication with Better Auth integration
- ✅ User ownership verification (403 forbidden for user_id mismatch)
- ✅ ID enumeration prevention (404 for cross-user access, not 403)
- ✅ Input validation with Pydantic schemas
- ✅ Automatic OpenAPI documentation (Swagger UI + ReDoc)
- ✅ Comprehensive test suite (pytest + httpx TestClient)
- ✅ Logging for all operations
- ✅ Type safety (mypy strict mode)
- ✅ Code quality (ruff linter/formatter)

## Quick Start - REST API

### Start the API Server

```bash
cd backend/

# Development server with auto-reload
uvicorn main:app --reload --port 8000

# Server starts at http://localhost:8000
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Access Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs (try endpoints in browser)
- **ReDoc**: http://localhost:8000/redoc (clean documentation view)
- **OpenAPI Schema**: http://localhost:8000/openapi.json (machine-readable)

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Task Management

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/api/{user_id}/tasks` | Create new task | 201 Created |
| `GET` | `/api/{user_id}/tasks` | List all tasks (optional `?status=all\|pending\|completed`) | 200 OK |
| `GET` | `/api/{user_id}/tasks/{id}` | Get single task by ID | 200 OK |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update task title/description | 200 OK |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion status | 200 OK |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete task permanently | 204 No Content |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API health check |

## Example API Requests

### 1. Create Task

```bash
# Generate JWT token (use your BETTER_AUTH_SECRET)
export TOKEN=$(python3 -c "from jose import jwt; from datetime import datetime, timedelta; print(jwt.encode({'userId': 'alice', 'exp': datetime.utcnow() + timedelta(hours=1), 'iat': datetime.utcnow()}, 'your-secret-here', algorithm='HS256'))")

# Create task
curl -X POST http://localhost:8000/api/alice/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'

# Response: 201 Created
{
  "id": 1,
  "user_id": "alice",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-14T12:00:00Z",
  "updated_at": "2026-01-14T12:00:00Z"
}
```

### 2. List Tasks

```bash
# List all tasks
curl http://localhost:8000/api/alice/tasks \
  -H "Authorization: Bearer $TOKEN"

# List only pending tasks
curl "http://localhost:8000/api/alice/tasks?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# List only completed tasks
curl "http://localhost:8000/api/alice/tasks?status=completed" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Single Task

```bash
curl http://localhost:8000/api/alice/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update Task

```bash
# Update both title and description
curl -X PUT http://localhost:8000/api/alice/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "description": "Updated description"}'

# Update only title (partial update)
curl -X PUT http://localhost:8000/api/alice/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New title"}'
```

### 5. Toggle Completion

```bash
# First toggle: pending → completed
curl -X PATCH http://localhost:8000/api/alice/tasks/1/complete \
  -H "Authorization: Bearer $TOKEN"

# Second toggle: completed → pending
curl -X PATCH http://localhost:8000/api/alice/tasks/1/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Delete Task

```bash
curl -X DELETE http://localhost:8000/api/alice/tasks/1 \
  -H "Authorization: Bearer $TOKEN"

# Response: 204 No Content (empty body)
```

## Authentication & Security

### JWT Token Format

This API uses Better Auth JWT tokens with the following structure:

```json
{
  "userId": "alice",
  "exp": 1737722000,
  "iat": 1737718400
}
```

**Required Claims**:
- `userId`: User identifier (must match `user_id` in URL)
- `exp`: Expiration timestamp (Unix epoch)
- `iat`: Issued at timestamp (Unix epoch)

### Security Features

1. **JWT Verification**: All endpoints verify token signature using `BETTER_AUTH_SECRET`
2. **User Ownership**: URL `user_id` must match JWT `userId` claim (else 403)
3. **Data Isolation**: Database queries filter by `user_id` (users only see their own data)
4. **ID Enumeration Prevention**: Cross-user access returns 404 (not 403) per AD-006

### Error Responses

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | `validation_error` | Invalid request body (empty title, too long, etc.) |
| 401 | `unauthorized` | Missing/invalid/expired JWT token |
| 403 | `forbidden` | Valid token but `user_id` mismatch |
| 404 | `not_found` | Task doesn't exist OR cross-user access (prevents ID enumeration) |
| 500 | `internal_server_error` | Unexpected server error |

**Example Error Response**:
```json
{
  "error": "unauthorized",
  "message": "Could not validate credentials"
}
```

## Testing REST API

### Run All REST API Tests

```bash
cd backend/

# Run all REST API tests
pytest tests/test_api_auth.py tests/test_api_tasks.py -v

# Run with coverage
pytest tests/test_api_auth.py tests/test_api_tasks.py --cov=api --cov=core --cov-report=html
```

### Test Organization

- **`test_api_auth.py`**: Authentication tests (13 tests)
  - Missing token → 401
  - Invalid token (wrong signature) → 401
  - Expired token → 401
  - User ID mismatch → 403
  - Malformed token → 401
  - Cross-user access (all endpoints) → 403

- **`test_api_tasks.py`**: Endpoint tests (30+ tests covering all 6 user stories)
  - User Story 1: Create Todo (5 tests)
  - User Story 2: List Todos (5 tests)
  - User Story 3: Get Single Todo (3 tests)
  - User Story 4: Update Todo (5 tests)
  - User Story 5: Toggle Completion (3 tests)
  - User Story 6: Delete Todo (4 tests)

### Manual Testing with Swagger UI

1. Start server: `uvicorn main:app --reload`
2. Open http://localhost:8000/docs
3. Click "Authorize" button
4. Enter: `Bearer <your-jwt-token>`
5. Try endpoints interactively

## Project Structure (Phase III Additions)

```
backend/
├── api/
│   ├── __init__.py          # Router exports
│   ├── deps.py              # JWT dependencies (verify_jwt_token, verify_user_ownership)
│   └── tasks.py             # Task CRUD endpoints (6 endpoints)
├── core/
│   └── security.py          # JWT decode utilities
├── schemas/
│   ├── error.py             # ErrorResponse schema
│   └── task.py              # TaskCreate, TaskUpdate, TaskResponse schemas
├── tests/
│   ├── test_rest_api_conftest.py  # REST API test fixtures
│   ├── test_api_auth.py     # Authentication tests
│   └── test_api_tasks.py    # Endpoint tests (all CRUD)
├── config.py                # Settings (DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL)
├── database.py              # Database session dependency
├── main.py                  # FastAPI app with CORS + error handlers
└── requirements.txt         # Dependencies (FastAPI, PyJWT, httpx, pytest-cov)
```

## Logging

All endpoint operations are logged for monitoring and debugging:

```python
# Example log output
INFO:api.tasks:Created task 1 for user alice: 'Buy groceries'
INFO:api.tasks:Listed 3 tasks for user alice (filter=all)
INFO:api.tasks:Retrieved task 1 for user alice
INFO:api.tasks:Updated task 1 for user alice
INFO:api.tasks:Toggled task 1 completion to True for user alice
INFO:api.tasks:Deleted task 1 for user alice
WARNING:api.tasks:Task 99 not found for user alice
```

## Troubleshooting REST API

### "401 Unauthorized" on valid token

**Solutions**:
1. Verify `BETTER_AUTH_SECRET` in `.env` matches frontend
2. Check token expiration (default 1 hour)
3. Ensure `Authorization: Bearer <token>` header format (note the space)
4. Verify token was signed with correct secret (not "wrong_secret")

### "403 Forbidden" on own resources

**Solution**: URL `user_id` must match JWT `userId` claim exactly.

```bash
# JWT has userId="alice"
# ✓ CORRECT: /api/alice/tasks
# ✗ WRONG:   /api/bob/tasks (returns 403)
```

### "404 Not Found" for existing task

**Possible causes**:
1. Task truly doesn't exist
2. Task belongs to another user (returns 404 to prevent ID enumeration per AD-006)

```bash
# User alice creates task with ID 1
# User bob tries to access it → 404 (not 403)
# This prevents bob from knowing task 1 exists
```

### CORS errors from frontend

**Solution**: Add frontend URL to CORS middleware in `main.py`:

```python
origins = [
    "http://localhost:3000",  # Next.js dev server
    "https://your-app.vercel.app",  # Production frontend
]
```

### "422 Unprocessable Entity" on valid data

**Common causes**:
- Empty title (required, 1-200 chars)
- Title too long (>200 chars)
- Description too long (>1000 chars)

Check response body for Pydantic validation details.

## Next Steps (Phase IV)

1. **Frontend Integration**: Connect Next.js app with Better Auth
2. **Performance Testing**: Load test with 100 concurrent users
3. **Deployment**: Docker containerization + cloud hosting
4. **Monitoring**: Add structured logging + error tracking

For detailed specifications:
- `specs/003-rest-api/spec.md` - Feature requirements
- `specs/003-rest-api/plan.md` - Technical architecture
- `specs/003-rest-api/contracts/` - API contracts + OpenAPI schema
- `specs/003-rest-api/quickstart.md` - Quick start guide
