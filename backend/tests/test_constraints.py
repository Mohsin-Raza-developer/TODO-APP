"""
Integration tests for database constraints.

Tests verify that database enforces:
- NOT NULL constraints on required fields
- UNIQUE constraints on email
- Foreign key constraints
- Field length constraints (VARCHAR(200))

Principles Tested:
- Database Schema Architect: Constraint enforcement
- Multi-User Data Isolation: Foreign key validation
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from models import User, Task


class TestDatabaseConstraints:
    """Test suite for database constraint verification."""

    def test_null_user_id_rejected(self, session: Session):
        """
        Test that tasks require a user_id (NOT NULL constraint).

        Acceptance Scenario:
        Given a new task is created,
        When the user_id field is omitted or null,
        Then the database rejects the insertion with IntegrityError.
        """
        # Attempt to create task with None user_id
        task = Task(user_id=None, title="Task without user")

        session.add(task)

        # Should raise IntegrityError due to NOT NULL constraint
        with pytest.raises(IntegrityError) as exc_info:
            session.commit()

        # Verify error is about null value
        assert "null value" in str(exc_info.value).lower() or "not-null" in str(exc_info.value).lower()

        # Rollback to clean up
        session.rollback()

    def test_duplicate_email_rejected(self, session: Session):
        """
        Test that user emails must be unique.

        Acceptance Scenario:
        Given a user exists with email "bob@example.com",
        When a second user attempts to register with the same email,
        Then the database rejects the insertion with IntegrityError.
        """
        # Create first user
        user1 = User(id="user_1", email="bob@example.com", name="Bob")
        session.add(user1)
        session.commit()

        # Attempt to create second user with same email
        user2 = User(id="user_2", email="bob@example.com", name="Bob Clone")
        session.add(user2)

        # Should raise IntegrityError due to UNIQUE constraint
        with pytest.raises(IntegrityError) as exc_info:
            session.commit()

        # Verify error is about unique constraint
        assert "unique" in str(exc_info.value).lower() or "duplicate" in str(exc_info.value).lower()

        # Rollback to clean up
        session.rollback()

    def test_foreign_key_constraint(self, session: Session):
        """
        Test that tasks require a valid user_id (foreign key constraint).

        Acceptance Scenario:
        Given no user with id "nonexistent_user" exists,
        When a task is created with user_id="nonexistent_user",
        Then the database rejects with foreign key violation.
        """
        # Attempt to create task with non-existent user_id
        task = Task(user_id="nonexistent_user", title="Orphaned task")
        session.add(task)

        # Should raise IntegrityError due to foreign key constraint
        with pytest.raises(IntegrityError) as exc_info:
            session.commit()

        # Verify error is about foreign key
        assert "foreign key" in str(exc_info.value).lower() or "violates" in str(exc_info.value).lower()

        # Rollback to clean up
        session.rollback()

    def test_task_title_required(self, session: Session, test_user: User):
        """
        Test that task title is required (NOT NULL constraint).

        Acceptance Scenario:
        Given a new task is created,
        When the title field is None,
        Then the database rejects with IntegrityError.
        """
        # Attempt to create task without title
        task = Task(user_id=test_user.id, title=None)
        session.add(task)

        # Should raise IntegrityError due to NOT NULL constraint
        with pytest.raises(IntegrityError) as exc_info:
            session.commit()

        # Verify error is about null value
        assert "null value" in str(exc_info.value).lower() or "not-null" in str(exc_info.value).lower()

        # Rollback to clean up
        session.rollback()

    def test_task_title_max_length(self, session: Session, test_user: User):
        """
        Test that task title enforces 200 character limit.

        Acceptance Scenario:
        Given a task title with 201 characters,
        When the task is created,
        Then the database rejects with value too long error.
        """
        # Create title with 201 characters (exceeds VARCHAR(200))
        long_title = "x" * 201

        task = Task(user_id=test_user.id, title=long_title)
        session.add(task)

        # Should raise error due to VARCHAR(200) constraint
        # Note: Some databases truncate, others reject - PostgreSQL rejects
        with pytest.raises((IntegrityError, Exception)) as exc_info:
            session.commit()

        # Verify error is about value length
        error_msg = str(exc_info.value).lower()
        assert "too long" in error_msg or "value too long" in error_msg or "length" in error_msg

        # Rollback to clean up
        session.rollback()

    def test_valid_task_creation(self, session: Session, test_user: User):
        """
        Test that valid tasks are accepted.

        This is a positive test to verify constraints don't block valid data.
        """
        # Create valid task
        task = Task(
            user_id=test_user.id,
            title="Valid Task",
            description="This is a valid task description"
        )
        session.add(task)
        session.commit()

        # Verify task was created
        session.refresh(task)
        assert task.id is not None, "Task should have ID assigned"
        assert task.title == "Valid Task", "Task title should be preserved"
        assert task.user_id == test_user.id, "Task user_id should match"

    def test_task_with_max_length_title(self, session: Session, test_user: User):
        """
        Test that task title with exactly 200 characters is accepted.
        """
        # Create title with exactly 200 characters
        max_title = "x" * 200

        task = Task(user_id=test_user.id, title=max_title)
        session.add(task)
        session.commit()

        # Verify task was created successfully
        session.refresh(task)
        assert task.id is not None, "Task should be created"
        assert len(task.title) == 200, "Title should be exactly 200 characters"
