"""
Integration tests for ID Architect pattern.

Tests verify that task IDs are:
- Generated sequentially starting from 1
- Never reused after deletion
- Monotonically increasing (no gaps filled)

Principles Tested:
- ID Architect: Sequential BIGINT IDs, never reused
- Database Schema Architect: BIGSERIAL sequence behavior
"""

import pytest
from sqlmodel import Session, select
from models import User, Task


class TestIDArchitect:
    """Test suite for ID Architect pattern verification."""

    def test_sequential_id_generation(self, session: Session, test_user: User):
        """
        Test that task IDs are generated sequentially.

        Acceptance Scenario:
        Given tasks are created,
        When 3 tasks are created in sequence,
        Then they receive sequential IDs (n, n+1, n+2).
        """
        # Create 3 tasks
        task1 = Task(user_id=test_user.id, title="Task 1")
        task2 = Task(user_id=test_user.id, title="Task 2")
        task3 = Task(user_id=test_user.id, title="Task 3")

        session.add(task1)
        session.add(task2)
        session.add(task3)
        session.commit()

        # Refresh to get database-generated IDs
        session.refresh(task1)
        session.refresh(task2)
        session.refresh(task3)

        # Verify sequential IDs (consecutive, incrementing by 1)
        assert task2.id == task1.id + 1, f"Second task ID should be {task1.id + 1}, got {task2.id}"
        assert task3.id == task2.id + 1, f"Third task ID should be {task2.id + 1}, got {task3.id}"
        assert task1.id < task2.id < task3.id, "IDs should be strictly increasing"

    def test_id_never_reused(self, session: Session, test_user: User):
        """
        Test that deleted IDs are never recycled.

        Acceptance Scenario:
        Given tasks with sequential ids exist,
        When the middle task is deleted and a new task is created,
        Then the new task receives the next sequential ID (not the deleted ID).

        This is the core ID Architect pattern behavior.
        """
        # Create 3 tasks
        task1 = Task(user_id=test_user.id, title="Task 1")
        task2 = Task(user_id=test_user.id, title="Task 2")
        task3 = Task(user_id=test_user.id, title="Task 3")

        session.add_all([task1, task2, task3])
        session.commit()

        # Get IDs
        session.refresh(task1)
        session.refresh(task2)
        session.refresh(task3)

        task2_id = task2.id
        expected_next_id = task3.id + 1

        # Delete task #2 (middle task)
        session.delete(task2)
        session.commit()

        # Create new task
        task4 = Task(user_id=test_user.id, title="Task 4")
        session.add(task4)
        session.commit()
        session.refresh(task4)

        # Verify ID is NOT reused (should be next in sequence, not deleted ID)
        assert task4.id == expected_next_id, f"New task should have id={expected_next_id}, got {task4.id}"
        assert task4.id != task2_id, "Deleted ID should never be reused"
        assert task4.id > task3.id, "New ID should be greater than all previous IDs"

        # Verify only 3 tasks exist (task2 deleted)
        statement = select(Task).where(Task.user_id == test_user.id)
        remaining_tasks = session.exec(statement).all()
        assert len(remaining_tasks) == 3, "Should have 3 tasks after deletion"

        # Verify middle ID is missing (gap in sequence)
        task_ids = sorted([t.id for t in remaining_tasks])
        assert task2_id not in task_ids, f"Deleted ID {task2_id} should not be in remaining tasks"
        assert task_ids == [task1.id, task3.id, task4.id], f"IDs should be [{task1.id}, {task3.id}, {task4.id}], got {task_ids}"

    def test_sequence_continues_after_bulk_deletion(self, session: Session, test_user: User):
        """
        Test that sequence continues from highest ever assigned.

        Acceptance Scenario:
        Given multiple tasks exist,
        When all tasks are deleted and a new task is created,
        Then the new task receives the next ID (sequence continues, not reset).
        """
        # Create 10 tasks (using 10 instead of 100 for faster test)
        tasks = [Task(user_id=test_user.id, title=f"Task {i}") for i in range(1, 11)]
        session.add_all(tasks)
        session.commit()

        # Get last task ID
        last_task = tasks[-1]
        session.refresh(last_task)
        highest_id = last_task.id
        expected_next_id = highest_id + 1

        # Delete all tasks
        for task in tasks:
            session.delete(task)
        session.commit()

        # Verify no tasks remain
        statement = select(Task).where(Task.user_id == test_user.id)
        remaining = session.exec(statement).all()
        assert len(remaining) == 0, "All tasks should be deleted"

        # Create new task
        new_task = Task(user_id=test_user.id, title="New Task")
        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        # Verify ID continues from highest (not reset to 1)
        assert new_task.id == expected_next_id, f"New task should have id={expected_next_id}, got {new_task.id}"
        assert new_task.id > highest_id, "Sequence should continue, not reset"
