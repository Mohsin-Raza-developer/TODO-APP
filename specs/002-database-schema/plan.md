# Implementation Plan: Database Schema for Multi-User Todo Application

**Branch**: `002-database-schema` | **Date**: 2026-01-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-database-schema/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes the foundational database schema for Phase II multi-user web application. The schema implements two tables (`users` and `tasks`) with strict data isolation via `user_id` foreign keys, sequential BIGINT primary keys (ID Architect pattern), and automatic timestamp tracking. The schema integrates with Neon Serverless PostgreSQL using SQLModel ORM and Alembic migrations, supporting Better Auth JWT authentication and GDPR compliance via CASCADE deletion.

**Technical Approach**: Use SQLModel to define type-safe database models, Alembic for versioned schema migrations, and Neon's pooled connection endpoint for serverless scalability. Apply Database Schema Architect, Multi-User Data Isolation, and Neon PostgreSQL Serverless Integration skills to ensure performance (<100ms queries), security (user_id filtering), and reliability (connection pooling, database-level constraints).

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: SQLModel 0.0.14+, Alembic 1.13+, psycopg2-binary 2.9+ (PostgreSQL adapter), python-dotenv 1.0+ (environment variables)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, auto-scaling)
**Testing**: pytest 8.0+, pytest-asyncio (for async database operations), pytest-postgresql (test database fixtures)
**Target Platform**: Linux server (FastAPI deployment), containerized (Docker optional)
**Project Type**: Web (backend component of full-stack application)
**Performance Goals**:
- Query execution <100ms for typical datasets (100 tasks per user) - SC-002
- Support 10,000+ concurrent connections via PgBouncer pooling
- Database migration execution <5 seconds on empty database

**Constraints**:
- All entities MUST include `user_id` foreign key (Constitution Principle III, VII)
- BIGINT sequences MUST be used for primary keys (prevent exhaustion, FR-002)
- Timestamps MUST be database-managed (DEFAULT NOW(), UPDATE triggers, FR-008/FR-009)
- Connection pooling MUST use Neon pooled endpoint (Assumption #11)
- Migrations MUST support both upgrade and downgrade operations

**Scale/Scope**:
- Initial: 10-100 users, ~1,000 tasks total (development/testing phase)
- Target: 10,000 users, ~1M tasks (production readiness)
- Database size: <100MB for initial deployment, <10GB at target scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: SDD-RI Methodology ✅
- Specification complete: `specs/002-database-schema/spec.md` (178 lines, 11 FRs, 7 SCs)
- Technical clarifications resolved: 5 Q&A sessions documented
- Planning in progress: This document
- Task breakdown: Deferred to `/sp.tasks` command
- **Status**: PASS - Following prescribed workflow

### Principle II: Pythonic Excellence ✅
- Python 3.13+ confirmed in Technical Context
- SQLModel uses modern Python features (type unions with `|`, Pydantic v2)
- Alembic migration scripts follow PEP 8
- **Status**: PASS - Technology stack aligned

### Principle III: Persistent Relational State ✅
- Database: Neon Serverless PostgreSQL (required technology)
- ORM: SQLModel (required technology)
- Schema: All entities include `user_id` foreign key (users.id, tasks.user_id)
- Migrations: Alembic (required technology)
- Data Isolation: `WHERE user_id = {authenticated_user_id}` enforced in queries
- **Status**: PASS - All requirements met

### Principle IV: Type Safety & Documentation ✅
- SQLModel models provide type hints (inherit from SQLModel base with Field() definitions)
- Pydantic validation automatic for all model fields
- Docstrings required for all migration functions
- **Status**: PASS - Type safety guaranteed by SQLModel

### Principle V: Terminal-Based Verification ✅
- Alembic CLI commands for migration verification (`alembic upgrade head`, `alembic current`)
- PostgreSQL CLI (psql) for direct schema inspection
- pytest for automated schema validation tests
- **Status**: PASS - CLI-based workflow

### Principle VI: Reusable Intelligence ✅
- **Database Schema Architect** skill applied (indexing, sequences, timestamps, pooling)
- **Multi-User Data Isolation** skill applied (user_id foreign keys, ownership verification pattern)
- **Neon PostgreSQL Serverless Integration** skill applied (pooled endpoint, connection management, Alembic setup)
- **ID Architect** skill applied horizontally from Phase I (sequential, non-decrementing IDs)
- **Status**: PASS - 4 skills applied to this feature

### Principle VII: Stateless Security ✅
- JWT authentication: Deferred to API implementation (not part of schema)
- Ownership verification: Enabled by `user_id` foreign key in schema
- Cross-user access prevention: Database constraints enforce referential integrity
- ON DELETE CASCADE: Implements GDPR "right to be forgotten" (FR-010)
- **Status**: PASS - Schema foundation for security implemented

**Gate Result**: ✅ **PASS** - All principles satisfied, proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/002-database-schema/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions, best practices)
├── data-model.md        # Phase 1 output (SQLModel models, relationships, constraints)
├── quickstart.md        # Phase 1 output (Neon setup, Alembic initialization, first migration)
├── contracts/           # Phase 1 output (database schema DDL, migration templates)
│   ├── schema.sql       # PostgreSQL DDL for reference
│   └── migration-template.py  # Alembic migration example
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (backend component for Phase II)
backend/
├── alembic/                    # Alembic migration management
│   ├── versions/               # Migration scripts (timestamped)
│   │   └── 001_initial_schema.py
│   ├── env.py                  # Alembic environment configuration
│   ├── script.py.mako          # Migration template
│   └── README                  # Alembic usage instructions
├── alembic.ini                 # Alembic configuration file
├── src/
│   ├── models/                 # SQLModel database models
│   │   ├── __init__.py
│   │   ├── user.py             # User model (Better Auth integration)
│   │   └── task.py             # Task model (ID Architect pattern)
│   ├── database.py             # Database engine, session management
│   └── config.py               # Environment variable configuration
├── tests/
│   ├── test_models.py          # SQLModel model validation tests
│   ├── test_migrations.py      # Alembic migration tests (upgrade/downgrade)
│   └── conftest.py             # pytest fixtures (test database)
├── .env.example                # Environment variable template
├── pyproject.toml              # UV dependency management
└── README.md                   # Backend setup instructions

# Database migrations are backend-specific, no frontend changes for this feature
frontend/                       # (No changes for database schema feature)
└── [unchanged]
```

**Structure Decision**: Backend-only implementation. Database schema is a backend concern with no direct frontend impact. SQLModel models live in `backend/src/models/`, Alembic migrations in `backend/alembic/versions/`. Test database fixtures in `backend/tests/conftest.py` enable isolated testing. Environment variables (DATABASE_URL, BETTER_AUTH_SECRET) stored in `.env` file (excluded from git via `.gitignore`).

## Complexity Tracking

> **No violations** - All Constitution principles satisfied without exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all technical unknowns from Technical Context and establish technology-specific best practices.

### Research Topics

1. **SQLModel Model Definition Best Practices**
   - Field configuration for BIGINT primary keys (sa_column with BigInteger)
   - Foreign key syntax for user_id references
   - Index definition in SQLModel (`__table_args__` vs Alembic migration)
   - Timestamp defaults (server_default vs Python default)

2. **Alembic Migration Patterns**
   - Initial migration structure (create tables, indexes, triggers)
   - UPDATE trigger syntax for `updated_at` automation
   - Migration testing strategy (upgrade → downgrade → upgrade cycle)
   - Data migration vs schema migration separation

3. **Neon PostgreSQL Connection Configuration**
   - Pooled endpoint URL format (hostname suffix: `-pooler`)
   - Connection string parameters (sslmode, connect_timeout, pool_size)
   - Environment variable management (.env file structure)
   - Health check queries (SELECT 1 vs pg_isready)

4. **Testing Database Setup**
   - pytest-postgresql fixture configuration
   - Transactional test isolation (rollback after each test)
   - Test database initialization (apply migrations in setup)
   - Mocking vs real database for integration tests

**Output**: `research.md` document with decisions, rationales, and code examples for each topic.

---

## Phase 1: Design & Contracts

**Prerequisites**: Phase 0 research complete

### 1. Data Model Design (`data-model.md`)

**Entities**:

**User Entity**:
- **Purpose**: Authenticate users and serve as parent for task ownership
- **Fields**:
  - `id`: TEXT, PRIMARY KEY (Better Auth generates string-based UUIDs)
  - `email`: TEXT, UNIQUE, NOT NULL (prevents duplicate accounts)
  - `name`: TEXT, NOT NULL (display name)
  - `created_at`: TIMESTAMP, NOT NULL, DEFAULT NOW() (audit trail)
- **Relationships**: One-to-many with Task (one user owns many tasks)
- **Constraints**: UNIQUE(email)
- **SQLModel Implementation**: Model class with Field() definitions, Pydantic validation

**Task Entity**:
- **Purpose**: Represent user's todo items with sequential IDs and completion tracking
- **Fields**:
  - `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT (ID Architect pattern, BIGSERIAL)
  - `user_id`: TEXT, NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE
  - `title`: VARCHAR(200), NOT NULL (1-200 character constraint)
  - `description`: TEXT, NULLABLE (unlimited length)
  - `completed`: BOOLEAN, NOT NULL, DEFAULT FALSE
  - `created_at`: TIMESTAMP, NOT NULL, DEFAULT NOW()
  - `updated_at`: TIMESTAMP, NOT NULL, DEFAULT NOW() + UPDATE trigger
- **Relationships**: Many-to-one with User (many tasks belong to one user)
- **Constraints**:
  - FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  - INDEX(user_id) for query performance (idx_tasks_user_id)
- **SQLModel Implementation**: Model class with sa_column for BigInteger PK, ForeignKey()

**State Transitions**:
- Task creation: `completed = FALSE` (default)
- Task completion toggle: `completed = TRUE` ↔ `completed = FALSE`
- Task update: Any field modification triggers `updated_at` refresh
- User deletion: CASCADE deletes all user's tasks (GDPR compliance)

### 2. API Contracts (`contracts/`)

**Schema DDL** (`schema.sql`):
```sql
-- PostgreSQL schema for reference (Alembic generates actual migrations)

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- UPDATE trigger for updated_at automation
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

**Migration Template** (`migration-template.py`):
```python
"""Initial database schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-01-12

Implements:
- User table (Better Auth integration)
- Task table (ID Architect pattern with BIGINT)
- user_id index (performance optimization)
- updated_at trigger (timestamp automation)
"""

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create tasks table with BIGINT primary key
    op.create_table(
        'tasks',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Text(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on user_id for query performance
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])

    # Create trigger function for updated_at automation
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Create trigger on tasks table
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)

def downgrade() -> None:
    # Drop trigger and function
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")

    # Drop index
    op.drop_index('idx_tasks_user_id', 'tasks')

    # Drop tables (CASCADE handles foreign key dependencies)
    op.drop_table('tasks')
    op.drop_table('users')
```

### 3. Quickstart Guide (`quickstart.md`)

**Content**:
1. **Neon Database Setup**:
   - Create Neon project at neon.tech
   - Copy pooled connection string (with `-pooler` suffix)
   - Configure `.env` file with `DATABASE_URL`

2. **Alembic Initialization**:
   - Run `alembic init alembic` (creates directory structure)
   - Configure `alembic.ini` to read DATABASE_URL from environment
   - Update `env.py` to import SQLModel metadata

3. **First Migration**:
   - Generate initial migration: `alembic revision --autogenerate -m "Initial schema"`
   - Review generated migration script
   - Apply migration: `alembic upgrade head`
   - Verify schema: Connect to Neon via psql or Neon console

4. **Testing Setup**:
   - Install pytest-postgresql
   - Configure test database fixture
   - Run migration tests: `pytest tests/test_migrations.py`

5. **Verification Commands**:
   - Check migration status: `alembic current`
   - View migration history: `alembic history`
   - Test rollback: `alembic downgrade -1` then `alembic upgrade head`

### 4. Agent Context Update

**Command**: `.specify/scripts/bash/update-agent-context.sh claude`

**New Technology Added** (to `.claude/context/technology.md` or similar):
- Neon Serverless PostgreSQL (connection pooling, branch databases)
- SQLModel 0.0.14+ (SQLAlchemy + Pydantic ORM)
- Alembic 1.13+ (database migration tool)
- psycopg2-binary (PostgreSQL adapter for Python)
- pytest-postgresql (test database fixtures)

**Skills Applied**:
- Database Schema Architect (indexing, sequences, timestamps, pooling)
- Multi-User Data Isolation (user_id foreign keys, CASCADE deletion)
- Neon PostgreSQL Serverless Integration (pooled endpoints, migration management)
- ID Architect (BIGINT sequences, no ID reuse)

---

## Constitution Re-Check (Post-Phase 1)

### Updated Assessment

**Principle III: Persistent Relational State** ✅
- SQLModel models defined: User (4 fields), Task (7 fields)
- user_id foreign key included in Task model with ON DELETE CASCADE
- Alembic migration created with upgrade/downgrade operations
- **Status**: PASS - Full implementation designed

**Principle VI: Reusable Intelligence** ✅
- Database Schema Architect skill patterns applied (BIGINT, indexes, triggers, pooling)
- Multi-User Data Isolation patterns applied (user_id foreign key, CASCADE)
- Neon PostgreSQL Serverless Integration patterns applied (pooled endpoint configuration)
- ID Architect pattern applied horizontally (sequential BIGINT IDs)
- **Status**: PASS - All 4 skills actively applied in design

**Principle VII: Stateless Security** ✅
- Schema foundation for JWT authentication complete (user_id foreign key enables ownership verification)
- ON DELETE CASCADE implements GDPR compliance
- Database constraints prevent orphaned records
- **Status**: PASS - Security foundation established

**Gate Result**: ✅ **PASS** - Design satisfies all Constitution principles

---

## Implementation Notes

### Critical Path Dependencies

1. **Neon Database Provisioned** (BLOCKER):
   - Obtain Neon pooled connection string before Alembic initialization
   - Configure `.env` file with DATABASE_URL
   - Verify connectivity with health check query

2. **Alembic Initialized** (BLOCKER):
   - Run `alembic init alembic` to create directory structure
   - Configure `alembic.ini` and `env.py`
   - Generate and review first migration

3. **SQLModel Models Defined** (BLOCKER):
   - Create `backend/src/models/user.py` and `task.py`
   - Import models in Alembic `env.py` for autogeneration
   - Test model validation with pytest

### Risk Mitigation

**Risk**: Alembic autogeneration misses UPDATE trigger
- **Mitigation**: Manually verify generated migration includes trigger creation
- **Fallback**: Add trigger creation in manual migration review step

**Risk**: Connection pool exhaustion in serverless environment
- **Mitigation**: Use Neon pooled endpoint (PgBouncer) as specified in Assumption #11
- **Fallback**: Configure connection timeout and pool_pre_ping in SQLModel engine

**Risk**: Migration fails on downgrade (irreversible data loss)
- **Mitigation**: Test downgrade on empty database before production
- **Fallback**: Backup database before running migrations in production

### Performance Considerations

- **Index on user_id**: Creates B-tree index to achieve O(log n) query performance (FR-011, Assumption #10)
- **BIGINT sequences**: Prevents ID exhaustion with ~9.2 quintillion capacity (FR-002, Assumption #5)
- **Database-level timestamps**: Eliminates application-level overhead for timestamp management (FR-008/FR-009, Assumption #13)
- **Connection pooling**: PgBouncer handles 10,000+ concurrent connections without "too many connections" errors (Assumption #11)

### Security Considerations

- **Secrets management**: DATABASE_URL and BETTER_AUTH_SECRET in `.env` file, excluded from git
- **ON DELETE CASCADE**: Implements GDPR "right to be forgotten" (FR-010, Assumption #9)
- **Foreign key constraints**: Prevents orphaned tasks (user_id must reference valid user)
- **Index on user_id**: Enables efficient ownership verification queries for Multi-User Data Isolation skill

---

## Next Steps

1. **Execute `/sp.tasks`**: Generate granular implementation tasks from this plan
2. **Provision Neon Database**: Create project at neon.tech, obtain pooled connection string
3. **Environment Setup**: Create `.env` file with DATABASE_URL and BETTER_AUTH_SECRET
4. **Alembic Initialization**: Run `alembic init alembic` and configure
5. **SQLModel Models**: Implement User and Task models with Field() definitions
6. **First Migration**: Generate and apply initial schema migration
7. **Testing**: Write and run pytest tests for models and migrations
8. **Documentation**: Update README.md with database setup instructions

**Estimated Effort**:
- Phase 0 Research: 2 hours (SQLModel, Alembic, Neon best practices)
- Phase 1 Implementation: 4 hours (models, migration, testing)
- Phase 2 Testing & Documentation: 2 hours (integration tests, README updates)
- **Total**: ~8 hours for complete database schema implementation
