"""Initial database schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-01-12

This migration implements the foundational database schema for Phase II
multi-user todo application with strict data isolation and GDPR compliance.

Implements:
- User table (Better Auth integration with string-based UUIDs)
- Task table (ID Architect pattern with BIGINT sequential IDs)
- user_id index (B-tree for O(log n) query performance)
- updated_at trigger (database-level timestamp automation)

Principles Applied:
- Database Schema Architect: BIGINT sequences, indexes, triggers, pooling
- Multi-User Data Isolation: user_id foreign keys, ON DELETE CASCADE
- ID Architect: Sequential IDs starting from 1, never reused
- Neon PostgreSQL Serverless Integration: Pooled connection endpoint required

Success Criteria:
- SC-001: Migration executes without errors on fresh Neon PostgreSQL instance
- SC-002: Query performance <100ms for 100 tasks per user (validated by index)
- SC-003: Sequential ID generation verified (no ID reuse after deletion)
- SC-004: Referential integrity enforced (foreign key constraint)
- SC-005: Timestamp automation verified (database-level defaults and triggers)

Performance Targets:
- User's tasks query: <100ms (via idx_tasks_user_id)
- Connection pooling: 10,000+ concurrent connections (via Neon pooled endpoint)
- Migration execution: <5 seconds on empty database
"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply migration: Create users and tasks tables with constraints.

    This migration:
    1. Creates users table (Better Auth integration)
    2. Creates tasks table (ID Architect pattern with BIGINT)
    3. Creates index on tasks.user_id (performance optimization)
    4. Creates trigger for tasks.updated_at (timestamp automation)

    Execution Time: <5 seconds on empty Neon PostgreSQL database
    """
    # ========================================================================
    # USERS TABLE
    # ========================================================================
    # Purpose: Store authenticated users (Better Auth integration)
    # Primary Key: TEXT (Better Auth generates UUIDs like "clh7x2w3y0000qz8r4t5u6v7w")
    # Constraints: UNIQUE email (prevents duplicate account registrations)

    op.create_table(
        'users',
        sa.Column('id', sa.Text(), nullable=False, comment='User UUID from Better Auth'),
        sa.Column('email', sa.Text(), nullable=False, comment='Unique email for login'),
        sa.Column('name', sa.Text(), nullable=False, comment='Display name for UI'),
        sa.Column(
            'created_at',
            sa.TIMESTAMP(),
            server_default=sa.text('NOW()'),  # Database-level default (not Python)
            nullable=False,
            comment='Account creation timestamp (UTC)'
        ),
        sa.PrimaryKeyConstraint('id', name='users_pkey'),
        sa.UniqueConstraint('email', name='users_email_key'),
        comment='Authenticated users (Better Auth integration)'
    )

    # ========================================================================
    # TASKS TABLE
    # ========================================================================
    # Purpose: Store user's todo items with sequential IDs
    # Primary Key: BIGINT (BIGSERIAL = auto-increment, ~9.2 quintillion capacity)
    # Foreign Key: user_id → users.id (ON DELETE CASCADE for GDPR compliance)
    # Constraints: NOT NULL on required fields, DEFAULT FALSE on completed

    op.create_table(
        'tasks',
        # BIGINT primary key (ID Architect pattern)
        # autoincrement=True generates BIGSERIAL in PostgreSQL
        # Sequence starts at 1, never reuses deleted IDs
        sa.Column(
            'id',
            sa.BigInteger(),
            autoincrement=True,
            nullable=False,
            comment='Sequential BIGINT primary key (never reused)'
        ),

        # Foreign key to users.id (data isolation)
        # NOT NULL: Tasks must have an owner
        # ON DELETE CASCADE: Deleting user deletes all their tasks (GDPR)
        sa.Column(
            'user_id',
            sa.Text(),
            nullable=False,
            comment='Owner user ID (foreign key to users.id)'
        ),

        # Title: Task description (1-200 characters)
        # VARCHAR(200) enforces max length at database level
        sa.Column(
            'title',
            sa.String(length=200),
            nullable=False,
            comment='Task title (1-200 characters, required)'
        ),

        # Description: Optional details (unlimited length)
        # TEXT type supports unlimited length (no max constraint)
        sa.Column(
            'description',
            sa.Text(),
            nullable=True,  # Optional field
            comment='Optional task details (unlimited length)'
        ),

        # Completed: Boolean flag for completion status
        # DEFAULT FALSE: New tasks are incomplete
        # server_default uses PostgreSQL FALSE (not Python False)
        sa.Column(
            'completed',
            sa.Boolean(),
            server_default=sa.false(),  # Database-level default
            nullable=False,
            comment='Completion status (default: FALSE)'
        ),

        # Created At: Task creation timestamp
        # server_default=NOW() ensures PostgreSQL sets timestamp (not Python)
        sa.Column(
            'created_at',
            sa.TIMESTAMP(),
            server_default=sa.text('NOW()'),
            nullable=False,
            comment='Task creation timestamp (UTC, auto-set by database)'
        ),

        # Updated At: Last modification timestamp
        # server_default=NOW() sets initial value
        # UPDATE trigger handles auto-update (see trigger creation below)
        sa.Column(
            'updated_at',
            sa.TIMESTAMP(),
            server_default=sa.text('NOW()'),
            nullable=False,
            comment='Last modification timestamp (UTC, auto-updated by trigger)'
        ),

        # Table constraints
        sa.PrimaryKeyConstraint('id', name='tasks_pkey'),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name='tasks_user_id_fkey',
            ondelete='CASCADE'  # GDPR "right to be forgotten"
        ),
        comment='User todo items with sequential IDs (ID Architect pattern)'
    )

    # ========================================================================
    # INDEXES
    # ========================================================================
    # Index on tasks.user_id for query performance (Database Schema Architect skill)
    # Type: B-tree (PostgreSQL default, optimal for equality queries)
    # Purpose: Optimize WHERE user_id = ? queries (most common pattern)
    # Performance: O(log n) instead of O(n) full table scan
    # Expected: <100ms for 100 tasks per user (SC-002)

    op.create_index(
        'idx_tasks_user_id',
        'tasks',
        ['user_id'],
        unique=False  # Non-unique index (multiple tasks per user)
    )

    # ========================================================================
    # TRIGGER FUNCTION
    # ========================================================================
    # Create PL/pgSQL function to auto-update updated_at field
    # Type: TRIGGER function (returns special TRIGGER type)
    # Behavior: Sets NEW.updated_at to NOW() before UPDATE
    # Usage: Called by update_tasks_updated_at trigger (see below)

    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Set updated_at to current timestamp (UTC)
            NEW.updated_at = NOW();
            -- Return modified row (required for BEFORE UPDATE triggers)
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # ========================================================================
    # TRIGGER
    # ========================================================================
    # Create trigger to call update_updated_at_column() before every UPDATE
    # Type: BEFORE UPDATE (modifies row before write to disk)
    # Scope: FOR EACH ROW (fires once per row updated)
    # Effect: Automatically updates updated_at without application code

    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    """Rollback migration: Drop all tables, indexes, triggers, and functions.

    This migration rollback:
    1. Drops triggers (must drop before functions)
    2. Drops trigger functions
    3. Drops indexes (must drop before tables)
    4. Drops tables (CASCADE handles foreign key dependencies)

    WARNING: This is DESTRUCTIVE - all data in users and tasks tables will be lost.
    Always backup database before running downgrade in production.

    Execution Time: <2 seconds on empty database
    """
    # ========================================================================
    # DROP TRIGGERS
    # ========================================================================
    # Must drop triggers before dropping trigger functions
    # IF EXISTS prevents error if trigger doesn't exist (idempotent)

    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")

    # ========================================================================
    # DROP TRIGGER FUNCTIONS
    # ========================================================================
    # Must drop functions after dropping triggers that use them
    # IF EXISTS prevents error if function doesn't exist (idempotent)

    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")

    # ========================================================================
    # DROP INDEXES
    # ========================================================================
    # Must drop indexes before dropping tables
    # if_exists=True prevents error if index doesn't exist (idempotent)

    op.drop_index('idx_tasks_user_id', table_name='tasks', if_exists=True)

    # ========================================================================
    # DROP TABLES
    # ========================================================================
    # Drop tables in reverse order of creation (child before parent)
    # tasks table has foreign key to users, must drop first
    # if_exists=True prevents error if table doesn't exist (idempotent)

    op.drop_table('tasks', if_exists=True)
    op.drop_table('users', if_exists=True)


# ============================================================================
# TESTING NOTES
# ============================================================================
# To test this migration:
#
# 1. Apply migration:
#    $ alembic upgrade head
#    Expected: "Running upgrade -> 001_initial_schema, Initial database schema"
#
# 2. Verify schema:
#    $ psql $DATABASE_URL -c "\dt"
#    Expected: users, tasks tables listed
#
#    $ psql $DATABASE_URL -c "\d tasks"
#    Expected: Shows id (bigint), user_id (text), title (varchar(200)), etc.
#
# 3. Verify indexes:
#    $ psql $DATABASE_URL -c "SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';"
#    Expected: tasks_pkey, idx_tasks_user_id
#
# 4. Verify triggers:
#    $ psql $DATABASE_URL -c "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'tasks';"
#    Expected: update_tasks_updated_at
#
# 5. Test rollback:
#    $ alembic downgrade -1
#    Expected: All tables, indexes, triggers dropped
#
# 6. Re-apply migration:
#    $ alembic upgrade head
#    Expected: Schema recreated successfully
#
# If all steps pass, migration is reversible and production-ready.
#
# ============================================================================
# VALIDATION QUERIES
# ============================================================================
# After applying migration, validate with these queries:
#
# -- Test ID Architect pattern (sequential IDs, no reuse)
# INSERT INTO users (id, email, name) VALUES ('user_1', 'test@example.com', 'Test User');
# INSERT INTO tasks (user_id, title) VALUES ('user_1', 'Task 1');  -- id = 1
# INSERT INTO tasks (user_id, title) VALUES ('user_1', 'Task 2');  -- id = 2
# DELETE FROM tasks WHERE id = 1;
# INSERT INTO tasks (user_id, title) VALUES ('user_1', 'Task 3');  -- id = 3 (NOT 1)
# SELECT id FROM tasks ORDER BY id;  -- Expected: 2, 3 (not 1, 2, 3)
#
# -- Test CASCADE deletion (GDPR compliance)
# DELETE FROM users WHERE id = 'user_1';
# SELECT * FROM tasks;  -- Expected: Empty (all tasks cascade-deleted)
#
# -- Test updated_at trigger (timestamp automation)
# INSERT INTO users (id, email, name) VALUES ('user_2', 'test2@example.com', 'Test User 2');
# INSERT INTO tasks (user_id, title) VALUES ('user_2', 'Test Task');
# -- Wait 1 second
# UPDATE tasks SET title = 'Updated Task' WHERE user_id = 'user_2';
# SELECT created_at, updated_at FROM tasks WHERE user_id = 'user_2';
# -- Expected: created_at < updated_at (trigger fired)
#
# -- Test query performance (index usage)
# EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'user_2';
# -- Expected: "Index Scan using idx_tasks_user_id" (not "Seq Scan")
#
# ============================================================================
