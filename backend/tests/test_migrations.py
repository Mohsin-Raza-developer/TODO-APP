"""
Integration tests for Alembic migration reversibility.

Tests verify that:
- Migrations can be applied (upgrade)
- Migrations can be rolled back (downgrade)
- Schema is correctly created and removed
- Trigger functions are properly managed

Principles Tested:
- Database Schema Architect: Migration reversibility for safe deployments
- Audit Trail: Trigger automation maintained across upgrade/downgrade cycles
"""

import os
import subprocess
import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import ProgrammingError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class TestMigrationReversibility:
    """Test suite for Alembic migration upgrade/downgrade cycles."""

    @pytest.fixture(scope="session")
    def migration_database_url(self):
        """Get DATABASE_URL from environment."""
        url = os.getenv("DATABASE_URL")
        if not url:
            pytest.fail("DATABASE_URL not set in environment. Create backend/.env file.")
        return url

    @pytest.fixture(scope="session")
    def migration_engine(self, migration_database_url):
        """Create SQLAlchemy engine for migration verification."""
        engine = create_engine(migration_database_url, echo=False)
        yield engine
        engine.dispose()

    def _run_alembic(self, command: str) -> subprocess.CompletedProcess:
        """
        Run Alembic command and return result.

        Args:
            command: Alembic command (e.g., "upgrade head", "downgrade -1")

        Returns:
            CompletedProcess with stdout/stderr
        """
        # Run from backend/ directory where alembic.ini is located
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        result = subprocess.run(
            f"alembic {command}",
            shell=True,
            cwd=backend_dir,
            capture_output=True,
            text=True,
        )
        return result

    def _table_exists(self, engine, table_name: str) -> bool:
        """
        Check if a table exists in the database.

        Args:
            engine: SQLAlchemy engine
            table_name: Name of table to check

        Returns:
            True if table exists, False otherwise
        """
        inspector = inspect(engine)
        return table_name in inspector.get_table_names()

    def _trigger_exists(self, engine, trigger_name: str, table_name: str) -> bool:
        """
        Check if a trigger exists on a table.

        Args:
            engine: SQLAlchemy engine
            trigger_name: Name of trigger to check
            table_name: Name of table trigger is attached to

        Returns:
            True if trigger exists, False otherwise
        """
        with engine.connect() as conn:
            # Use format string for table_name to avoid ::regclass syntax conflict
            query = text(f"""
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_trigger
                    WHERE tgname = :trigger_name
                    AND tgrelid = '{table_name}'::regclass
                )
            """)
            result = conn.execute(query, {"trigger_name": trigger_name})
            return result.scalar()

    def _function_exists(self, engine, function_name: str) -> bool:
        """
        Check if a PL/pgSQL function exists.

        Args:
            engine: SQLAlchemy engine
            function_name: Name of function to check

        Returns:
            True if function exists, False otherwise
        """
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_proc
                        WHERE proname = :function_name
                    )
                """),
                {"function_name": function_name}
            )
            return result.scalar()

    def _index_exists(self, engine, index_name: str) -> bool:
        """
        Check if an index exists.

        Args:
            engine: SQLAlchemy engine
            index_name: Name of index to check

        Returns:
            True if index exists, False otherwise
        """
        inspector = inspect(engine)
        # Get all indexes from all tables
        for table_name in inspector.get_table_names():
            indexes = inspector.get_indexes(table_name)
            if any(idx['name'] == index_name for idx in indexes):
                return True
        return False

    def test_migration_upgrade_downgrade(self, migration_engine):
        """
        Test complete migration cycle: upgrade → downgrade → upgrade.

        Acceptance Scenario:
        Given a fresh database with no schema,
        When I apply migrations with `alembic upgrade head`,
        Then users and tasks tables are created with correct schema.

        When I rollback with `alembic downgrade -1`,
        Then all tables, triggers, and functions are removed.

        When I re-apply with `alembic upgrade head`,
        Then schema is recreated identically.

        This validates migration reversibility for safe rollback in production.
        """
        # =====================================================================
        # STEP 1: Ensure we start from a clean state (downgrade if needed)
        # =====================================================================
        print("\n=== STEP 1: Clean state setup ===")

        # First, ensure we're at head (in case previous tests left schema partially applied)
        result = self._run_alembic("upgrade head")
        print(f"Initial upgrade result: {result.returncode}")

        # Now downgrade to base (remove all schema)
        result = self._run_alembic("downgrade base")
        assert result.returncode == 0, f"Initial downgrade failed: {result.stderr}"
        print(f"Initial downgrade to base: SUCCESS")

        # Verify schema removed
        assert not self._table_exists(migration_engine, "users"), "users table should not exist after downgrade to base"
        assert not self._table_exists(migration_engine, "tasks"), "tasks table should not exist after downgrade to base"
        print("Verified: All tables removed")

        # =====================================================================
        # STEP 2: Apply migration (upgrade to head)
        # =====================================================================
        print("\n=== STEP 2: Upgrade to head ===")

        result = self._run_alembic("upgrade head")
        assert result.returncode == 0, f"Upgrade failed: {result.stderr}"
        print(f"Upgrade to head: SUCCESS")

        # Verify schema created
        assert self._table_exists(migration_engine, "users"), "users table should exist after upgrade"
        assert self._table_exists(migration_engine, "tasks"), "tasks table should exist after upgrade"
        print("Verified: Tables created")

        # Verify index created
        assert self._index_exists(migration_engine, "ix_tasks_user_id"), "idx_tasks_user_id index should exist after upgrade"
        print("Verified: Index created")

        # Verify trigger and function created
        assert self._trigger_exists(migration_engine, "update_tasks_updated_at", "tasks"), \
            "update_tasks_updated_at trigger should exist after upgrade"
        assert self._function_exists(migration_engine, "update_updated_at_column"), \
            "update_updated_at_column function should exist after upgrade"
        print("Verified: Trigger and function created")

        # =====================================================================
        # STEP 3: Rollback migration (downgrade -1)
        # =====================================================================
        print("\n=== STEP 3: Downgrade -1 ===")

        result = self._run_alembic("downgrade -1")
        assert result.returncode == 0, f"Downgrade failed: {result.stderr}"
        print(f"Downgrade -1: SUCCESS")

        # Verify schema removed
        assert not self._table_exists(migration_engine, "users"), "users table should be removed after downgrade"
        assert not self._table_exists(migration_engine, "tasks"), "tasks table should be removed after downgrade"
        print("Verified: Tables removed")

        # Verify index removed
        assert not self._index_exists(migration_engine, "ix_tasks_user_id"), \
            "idx_tasks_user_id index should be removed after downgrade"
        print("Verified: Index removed")

        # Verify trigger and function removed
        # Note: Can't check trigger after table is dropped, but function should be gone
        assert not self._function_exists(migration_engine, "update_updated_at_column"), \
            "update_updated_at_column function should be removed after downgrade"
        print("Verified: Function removed")

        # =====================================================================
        # STEP 4: Re-apply migration (upgrade head again)
        # =====================================================================
        print("\n=== STEP 4: Re-upgrade to head ===")

        result = self._run_alembic("upgrade head")
        assert result.returncode == 0, f"Re-upgrade failed: {result.stderr}"
        print(f"Re-upgrade to head: SUCCESS")

        # Verify schema recreated identically
        assert self._table_exists(migration_engine, "users"), "users table should be recreated after re-upgrade"
        assert self._table_exists(migration_engine, "tasks"), "tasks table should be recreated after re-upgrade"
        assert self._index_exists(migration_engine, "ix_tasks_user_id"), \
            "idx_tasks_user_id index should be recreated after re-upgrade"
        assert self._trigger_exists(migration_engine, "update_tasks_updated_at", "tasks"), \
            "update_tasks_updated_at trigger should be recreated after re-upgrade"
        assert self._function_exists(migration_engine, "update_updated_at_column"), \
            "update_updated_at_column function should be recreated after re-upgrade"
        print("Verified: Full schema recreated identically")

        # =====================================================================
        # FINAL VERIFICATION: Schema structure validation
        # =====================================================================
        print("\n=== FINAL VERIFICATION ===")

        inspector = inspect(migration_engine)

        # Verify users table structure
        users_columns = {col['name']: col for col in inspector.get_columns('users')}
        assert 'id' in users_columns, "users.id column should exist"
        assert 'email' in users_columns, "users.email column should exist"
        assert 'name' in users_columns, "users.name column should exist"
        assert 'created_at' in users_columns, "users.created_at column should exist"
        print("Verified: users table structure correct")

        # Verify tasks table structure
        tasks_columns = {col['name']: col for col in inspector.get_columns('tasks')}
        assert 'id' in tasks_columns, "tasks.id column should exist"
        assert 'user_id' in tasks_columns, "tasks.user_id column should exist"
        assert 'title' in tasks_columns, "tasks.title column should exist"
        assert 'description' in tasks_columns, "tasks.description column should exist"
        assert 'completed' in tasks_columns, "tasks.completed column should exist"
        assert 'created_at' in tasks_columns, "tasks.created_at column should exist"
        assert 'updated_at' in tasks_columns, "tasks.updated_at column should exist"
        print("Verified: tasks table structure correct")

        # Verify foreign key relationship
        fks = inspector.get_foreign_keys('tasks')
        user_fk = next((fk for fk in fks if fk['referred_table'] == 'users'), None)
        assert user_fk is not None, "tasks.user_id should have foreign key to users.id"
        assert user_fk['constrained_columns'] == ['user_id'], "Foreign key should be on user_id column"
        assert user_fk['options'].get('ondelete') == 'CASCADE', "Foreign key should have ON DELETE CASCADE"
        print("Verified: Foreign key with CASCADE deletion")

        # =====================================================================
        # Ensure database stays at head for subsequent tests
        # =====================================================================
        # Leave database at head state (already there from Step 4)
        # This ensures other tests can run without missing schema

        print("\n=== TEST COMPLETE: Migration reversibility validated ===")
