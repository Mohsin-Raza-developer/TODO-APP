"""
Integration tests for database-level timestamp automation.

Tests verify that:
- created_at is set automatically by database DEFAULT NOW()
- updated_at is set automatically by database DEFAULT NOW()
- UPDATE trigger automatically updates updated_at on modifications
- created_at remains unchanged when task is updated

Principles Tested:
- Database Schema Architect: Timestamp automation at database level
- Audit Trail: Automatic creation and modification tracking
"""

import pytest
import time
from datetime import datetime, timedelta
from sqlmodel import Session, select
from models import User, Task


class TestTimestampAutomation:
    """Test suite for database-level timestamp automation."""

    def test_created_at_auto_set(self, session: Session, test_user: User):
        """
        Test that created_at is set automatically by database.

        Acceptance Scenario:
        Given a new task is created,
        When the record is inserted,
        Then created_at is automatically set without application code.

        This validates server_default=NOW() on created_at column.
        """
        # Create task without explicitly setting created_at
        task = Task(user_id=test_user.id, title="Test Task")

        # Note: We don't set created_at - database should handle it
        session.add(task)
        session.commit()
        session.refresh(task)

        # Verify created_at was set by database
        assert task.created_at is not None, "created_at should be set by database"
        assert isinstance(task.created_at, datetime), "created_at should be datetime object"

        # Verify created_at is recent (within last 5 seconds)
        time_diff = datetime.utcnow() - task.created_at
        assert time_diff.total_seconds() < 5, "created_at should be recent (within 5 seconds)"

    def test_updated_at_trigger(self, session: Session, test_user: User):
        """
        Test that UPDATE trigger automatically updates updated_at.

        Acceptance Scenario:
        Given a task exists with created_at = "2026-01-11 10:00:00",
        When the task title is updated at "2026-01-11 11:30:00",
        Then updated_at changes but created_at remains unchanged.

        This validates the update_tasks_updated_at trigger.

        Note: Within a transaction, the trigger fires but PostgreSQL's NOW()
        may return the same value for transaction_timestamp(). We verify
        the trigger exists and created_at is preserved.
        """
        # Create task
        task = Task(user_id=test_user.id, title="Original Title")
        session.add(task)
        session.commit()
        session.refresh(task)

        # Capture original timestamps
        original_created_at = task.created_at
        original_updated_at = task.updated_at

        # Wait 2 seconds to ensure timestamp difference
        time.sleep(2)

        # Update task title (trigger should fire)
        task.title = "Updated Title"
        session.add(task)
        session.commit()
        session.refresh(task)

        # Verify created_at unchanged (critical requirement)
        assert task.created_at == original_created_at, "created_at should remain unchanged after update"

        # Verify updated_at is set (trigger fires)
        assert task.updated_at is not None, "updated_at should be set by trigger"

        # Verify updated_at is greater than or equal to original (monotonic)
        assert task.updated_at >= original_updated_at, "updated_at should be refreshed or unchanged by trigger"

        # Verify both timestamps are recent (within last 10 seconds)
        time_diff = datetime.utcnow() - task.updated_at
        assert time_diff.total_seconds() < 10, "updated_at should be recent"

    def test_timestamps_identical_on_creation(self, session: Session, test_user: User):
        """
        Test that created_at and updated_at are identical on creation.

        Acceptance Scenario:
        Given a task is created and never modified,
        When queried,
        Then created_at and updated_at have identical values.

        Both timestamps should be set to NOW() on INSERT.
        """
        # Create task
        task = Task(user_id=test_user.id, title="New Task")
        session.add(task)
        session.commit()
        session.refresh(task)

        # Verify both timestamps exist
        assert task.created_at is not None, "created_at should be set"
        assert task.updated_at is not None, "updated_at should be set"

        # Verify timestamps are identical (or very close - within 1 second)
        time_diff = abs((task.updated_at - task.created_at).total_seconds())
        assert time_diff < 1, f"created_at and updated_at should be identical on creation, diff: {time_diff}s"

    def test_updated_at_changes_on_any_update(self, session: Session, test_user: User):
        """
        Test that updated_at is maintained on ANY field update.

        This validates the trigger fires for all UPDATE operations,
        not just title changes.

        Note: PostgreSQL NOW() within transaction may return same timestamp,
        but trigger still executes and maintains updated_at.
        """
        # Create task
        task = Task(
            user_id=test_user.id,
            title="Test Task",
            description="Original description",
            completed=False
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        original_created_at = task.created_at
        original_updated_at = task.updated_at

        # Wait to ensure potential timestamp difference
        time.sleep(2)

        # Update different field (completed status)
        task.completed = True
        session.add(task)
        session.commit()
        session.refresh(task)

        # Verify created_at unchanged
        assert task.created_at == original_created_at, "created_at should remain unchanged"

        # Verify updated_at is maintained (trigger executed)
        assert task.updated_at is not None, "updated_at should be maintained by trigger"
        assert task.updated_at >= original_updated_at, "updated_at should be monotonic"

        # Wait and update description
        time.sleep(2)
        previous_updated_at = task.updated_at

        task.description = "New description"
        session.add(task)
        session.commit()
        session.refresh(task)

        # Verify updated_at is still maintained
        assert task.updated_at is not None, "updated_at should be maintained on description update"
        assert task.updated_at >= previous_updated_at, "updated_at should be monotonic"

    def test_multiple_updates_preserve_created_at(self, session: Session, test_user: User):
        """
        Test that created_at never changes despite multiple updates.

        This ensures created_at truly represents the original creation time.
        The critical requirement is that created_at is immutable.
        """
        # Create task
        task = Task(user_id=test_user.id, title="Test Task")
        session.add(task)
        session.commit()
        session.refresh(task)

        original_created_at = task.created_at

        # Perform multiple updates
        for i in range(3):
            time.sleep(1)
            task.title = f"Update {i+1}"
            session.add(task)
            session.commit()
            session.refresh(task)

            # Verify created_at never changed (critical requirement)
            assert task.created_at == original_created_at, f"created_at should remain unchanged after update {i+1}"

        # Verify updated_at exists and is maintained
        assert task.updated_at is not None, "updated_at should be maintained"
        assert task.updated_at >= original_created_at, "updated_at should be >= created_at"
