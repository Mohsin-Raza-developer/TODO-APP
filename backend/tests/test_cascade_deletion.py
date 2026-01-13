"""
Integration tests for CASCADE deletion behavior.

Tests verify that:
- Deleting a user deletes all their tasks (GDPR compliance)
- Foreign key constraint enforced (ON DELETE CASCADE)
- No orphaned tasks remain after user deletion

Principles Tested:
- Multi-User Data Isolation: ON DELETE CASCADE for GDPR
- Database Schema Architect: Referential integrity enforcement
"""

import pytest
from sqlmodel import Session, select
from models import User, Task


class TestCascadeDeletion:
    """Test suite for CASCADE deletion verification."""

    def test_cascade_deletion_basic(self, session: Session):
        """
        Test that deleting a user deletes all their tasks.

        Acceptance Scenario:
        Given a user with 5 tasks,
        When the user is deleted,
        Then all 5 tasks are automatically deleted.

        This implements GDPR "right to be forgotten" compliance.
        """
        # Create user
        user = User(id="test_user_cascade", email="cascade@example.com", name="Cascade Test")
        session.add(user)
        session.commit()

        # Create 5 tasks for this user
        tasks = [
            Task(user_id=user.id, title=f"Task {i}")
            for i in range(1, 6)
        ]
        session.add_all(tasks)
        session.commit()

        # Verify 5 tasks exist
        statement = select(Task).where(Task.user_id == user.id)
        user_tasks = session.exec(statement).all()
        assert len(user_tasks) == 5, "Should have 5 tasks before deletion"

        # Delete user (should cascade to tasks)
        session.delete(user)
        session.commit()

        # Verify all tasks are deleted (CASCADE behavior)
        statement = select(Task).where(Task.user_id == "test_user_cascade")
        remaining_tasks = session.exec(statement).all()
        assert len(remaining_tasks) == 0, "All tasks should be cascade-deleted with user"

        # Verify user is deleted
        statement = select(User).where(User.id == "test_user_cascade")
        deleted_user = session.exec(statement).first()
        assert deleted_user is None, "User should be deleted"

    def test_cascade_deletion_multiple_users(self, session: Session):
        """
        Test that CASCADE deletion only affects the deleted user's tasks.

        Acceptance Scenario:
        Given User A with 3 tasks and User B with 2 tasks,
        When User A is deleted,
        Then User A's 3 tasks are deleted but User B's 2 tasks remain.
        """
        # Create two users
        user_a = User(id="user_a", email="alice@example.com", name="Alice")
        user_b = User(id="user_b", email="bob@example.com", name="Bob")
        session.add_all([user_a, user_b])
        session.commit()

        # Create tasks for both users
        alice_tasks = [
            Task(user_id=user_a.id, title=f"Alice Task {i}")
            for i in range(1, 4)
        ]
        bob_tasks = [
            Task(user_id=user_b.id, title=f"Bob Task {i}")
            for i in range(1, 3)
        ]
        session.add_all(alice_tasks + bob_tasks)
        session.commit()

        # Verify initial state
        statement_a = select(Task).where(Task.user_id == user_a.id)
        statement_b = select(Task).where(Task.user_id == user_b.id)
        assert len(session.exec(statement_a).all()) == 3, "Alice should have 3 tasks"
        assert len(session.exec(statement_b).all()) == 2, "Bob should have 2 tasks"

        # Delete User A
        session.delete(user_a)
        session.commit()

        # Verify Alice's tasks are deleted
        alice_remaining = session.exec(statement_a).all()
        assert len(alice_remaining) == 0, "Alice's tasks should be cascade-deleted"

        # Verify Bob's tasks are NOT deleted
        bob_remaining = session.exec(statement_b).all()
        assert len(bob_remaining) == 2, "Bob's tasks should remain untouched"

        # Verify Bob's user still exists
        bob_check = session.exec(select(User).where(User.id == user_b.id)).first()
        assert bob_check is not None, "Bob's user should still exist"
        assert bob_check.email == "bob@example.com", "Bob's data should be intact"

    def test_cascade_deletion_empty_user(self, session: Session):
        """
        Test that deleting a user with no tasks works correctly.

        Acceptance Scenario:
        Given a user with 0 tasks,
        When the user is deleted,
        Then the deletion succeeds without errors.
        """
        # Create user with no tasks
        user = User(id="empty_user", email="empty@example.com", name="Empty User")
        session.add(user)
        session.commit()

        # Verify user exists
        statement = select(User).where(User.id == "empty_user")
        assert session.exec(statement).first() is not None, "User should exist"

        # Delete user (no tasks to cascade)
        session.delete(user)
        session.commit()

        # Verify user is deleted
        deleted_user = session.exec(statement).first()
        assert deleted_user is None, "User should be deleted successfully"
