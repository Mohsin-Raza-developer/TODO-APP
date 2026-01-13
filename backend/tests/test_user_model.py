"""
Integration tests for User model and Better Auth integration.

Tests verify that:
- User model accepts Better Auth string-based UUIDs
- Email UNIQUE constraint enforced
- CASCADE deletion works (GDPR compliance)
- created_at auto-set by database

Principles Tested:
- Multi-User Data Isolation: User model as foundation for task ownership
- Database Schema Architect: UNIQUE constraints, CASCADE deletion
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from models import User, Task


class TestUserModel:
    """Test suite for User model and Better Auth integration."""

    def test_user_creation(self, session: Session):
        """
        Test that User model accepts Better Auth string-based UUIDs.

        Acceptance Scenario:
        Given a user signs up with email "alice@example.com" and name "Alice",
        When the user record is created,
        Then a unique id is generated, email and name are stored,
        and created_at is automatically set.

        Better Auth generates string-based UUIDs like "user_abc123" or
        "clh7x2w3y0000qz8r4t5u6v7w" (not PostgreSQL UUID type).
        """
        # Create user with Better Auth style ID (string, not UUID type)
        user = User(
            id="user_123",
            email="alice@example.com",
            name="Alice"
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        # Verify user created successfully
        assert user.id == "user_123", "User ID should match input"
        assert user.email == "alice@example.com", "Email should be stored"
        assert user.name == "Alice", "Name should be stored"

        # Verify created_at auto-set by database
        assert user.created_at is not None, "created_at should be auto-set by database"

        # Verify user can be queried back
        statement = select(User).where(User.id == "user_123")
        retrieved_user = session.exec(statement).first()
        assert retrieved_user is not None, "User should be retrievable"
        assert retrieved_user.email == "alice@example.com"

    def test_email_uniqueness(self, session: Session):
        """
        Test that email UNIQUE constraint is enforced.

        Acceptance Scenario:
        Given a user exists with email "bob@example.com",
        When a second user attempts to register with the same email,
        Then the database rejects the insertion.

        This prevents duplicate account registrations with the same email.
        """
        # Create first user
        user1 = User(
            id="user_bob_1",
            email="bob@example.com",
            name="Bob"
        )
        session.add(user1)
        session.commit()

        # Attempt to create second user with same email
        user2 = User(
            id="user_bob_2",  # Different ID
            email="bob@example.com",  # Same email (should fail)
            name="Bob Clone"
        )
        session.add(user2)

        # Should raise IntegrityError due to UNIQUE constraint
        with pytest.raises(IntegrityError) as exc_info:
            session.commit()

        # Verify error is about unique constraint
        error_msg = str(exc_info.value).lower()
        assert "unique" in error_msg or "duplicate" in error_msg, \
            f"Error should mention unique constraint: {exc_info.value}"

        # Rollback to clean up
        session.rollback()

    def test_user_deletion_cascade(self, session: Session):
        """
        Test that deleting a user cascades to all their tasks.

        Acceptance Scenario:
        Given a user with id="user_123" and 50 tasks,
        When attempting to delete the user,
        Then all tasks are cascade-deleted.

        This implements GDPR "right to be forgotten" compliance.
        """
        # Create user
        user = User(
            id="user_cascade_test",
            email="cascade@example.com",
            name="Cascade Test User"
        )
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
        statement = select(Task).where(Task.user_id == "user_cascade_test")
        remaining_tasks = session.exec(statement).all()
        assert len(remaining_tasks) == 0, "All tasks should be cascade-deleted with user"

        # Verify user is deleted
        statement = select(User).where(User.id == "user_cascade_test")
        deleted_user = session.exec(statement).first()
        assert deleted_user is None, "User should be deleted"

    def test_better_auth_uuid_formats(self, session: Session):
        """
        Test that User model accepts various Better Auth UUID formats.

        Better Auth may generate different string ID formats:
        - Prefixed: "user_abc123xyz"
        - CUID: "clh7x2w3y0000qz8r4t5u6v7w"
        - Custom: any string format

        The database should accept TEXT type for flexibility.
        """
        # Test different ID formats
        test_cases = [
            ("user_prefixed_123", "user1@example.com", "User 1"),
            ("clh7x2w3y0000qz8r4t5u6v7w", "user2@example.com", "User 2"),
            ("custom-id-format-456", "user3@example.com", "User 3"),
        ]

        for user_id, email, name in test_cases:
            user = User(id=user_id, email=email, name=name)
            session.add(user)
            session.commit()
            session.refresh(user)

            # Verify user created with custom ID format
            assert user.id == user_id, f"User ID should be {user_id}"
            assert user.email == email
            assert user.created_at is not None

        # Verify all 3 users exist
        statement = select(User)
        all_users = session.exec(statement).all()
        test_user_ids = [tc[0] for tc in test_cases]
        created_user_ids = [u.id for u in all_users if u.id in test_user_ids]
        assert len(created_user_ids) == 3, "All 3 users with different ID formats should exist"

    def test_user_creation_with_minimal_fields(self, session: Session):
        """
        Test that User model only requires minimal fields.

        Better Auth integration only needs:
        - id (provided by Better Auth)
        - email (for authentication)
        - name (for display)
        - created_at (auto-set by database)

        No password field needed (handled by Better Auth).
        """
        # Create user with only required fields
        user = User(
            id="minimal_user",
            email="minimal@example.com",
            name="Minimal User"
        )
        # Note: NOT setting created_at - database should handle it
        session.add(user)
        session.commit()
        session.refresh(user)

        # Verify all fields set correctly
        assert user.id == "minimal_user"
        assert user.email == "minimal@example.com"
        assert user.name == "Minimal User"
        assert user.created_at is not None, "created_at should be auto-set"

        # Verify no extra fields required
        # (This test would fail if model required password, etc.)
        assert hasattr(user, 'id')
        assert hasattr(user, 'email')
        assert hasattr(user, 'name')
        assert hasattr(user, 'created_at')
