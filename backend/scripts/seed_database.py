"""
Database seeding script for development and testing.

This script populates the database with sample data:
- 2 test users (Alice and Bob)
- 10 tasks (5 for each user, mix of pending and completed)

Usage:
    python scripts/seed_database.py

Environment:
    Requires DATABASE_URL in .env file

Safety:
    - Idempotent: Can be run multiple times (uses ON CONFLICT for users)
    - Development only: Do not run on production database
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add src/ to Python path for model imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlmodel import Session, create_engine, select
from models import User, Task

# Load environment variables
load_dotenv()


def get_engine():
    """Create database engine from DATABASE_URL."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL not set in environment. "
            "Create backend/.env file with your Neon connection string."
        )
    return create_engine(database_url, echo=False)


def seed_users(session: Session) -> dict[str, User]:
    """
    Create 2 test users: Alice and Bob.

    Returns:
        dict: User objects keyed by name
    """
    print("Creating test users...")

    users_data = [
        {
            "id": "user_alice_demo",
            "email": "alice@example.com",
            "name": "Alice Smith",
        },
        {
            "id": "user_bob_demo",
            "email": "bob@example.com",
            "name": "Bob Johnson",
        },
    ]

    users = {}
    for user_data in users_data:
        # Check if user already exists
        statement = select(User).where(User.id == user_data["id"])
        existing_user = session.exec(statement).first()

        if existing_user:
            print(f"  ✓ User already exists: {existing_user.name} ({existing_user.email})")
            users[user_data["name"]] = existing_user
        else:
            user = User(**user_data)
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"  ✓ Created user: {user.name} ({user.email})")
            users[user_data["name"]] = user

    return users


def seed_tasks(session: Session, users: dict[str, User]) -> list[Task]:
    """
    Create 10 tasks (5 for each user).

    Args:
        users: Dictionary of User objects keyed by name

    Returns:
        list: Created Task objects
    """
    print("\nCreating test tasks...")

    alice = users["Alice Smith"]
    bob = users["Bob Johnson"]

    tasks_data = [
        # Alice's tasks (3 pending, 2 completed)
        {
            "user_id": alice.id,
            "title": "Buy groceries",
            "description": "Milk, eggs, bread, fruits",
            "completed": False,
        },
        {
            "user_id": alice.id,
            "title": "Finish project report",
            "description": "Complete Q4 analysis and recommendations",
            "completed": True,
        },
        {
            "user_id": alice.id,
            "title": "Call dentist",
            "description": "Schedule annual checkup appointment",
            "completed": False,
        },
        {
            "user_id": alice.id,
            "title": "Read book chapter",
            "description": "Chapter 5: Database Design Patterns",
            "completed": True,
        },
        {
            "user_id": alice.id,
            "title": "Plan weekend trip",
            "description": "Research hotels and activities in Portland",
            "completed": False,
        },
        # Bob's tasks (2 pending, 3 completed)
        {
            "user_id": bob.id,
            "title": "Review pull requests",
            "description": "Check team PRs #142, #143, #144",
            "completed": True,
        },
        {
            "user_id": bob.id,
            "title": "Update documentation",
            "description": "Add API endpoint examples to README",
            "completed": True,
        },
        {
            "user_id": bob.id,
            "title": "Fix bug #287",
            "description": "Resolve timestamp timezone issue",
            "completed": True,
        },
        {
            "user_id": bob.id,
            "title": "Attend team meeting",
            "description": "Weekly sync - Thursday 2 PM",
            "completed": False,
        },
        {
            "user_id": bob.id,
            "title": "Learn Kubernetes",
            "description": "Complete Docker/K8s tutorial series",
            "completed": False,
        },
    ]

    # Delete existing tasks for demo users (idempotent seeding)
    print(f"  Removing existing tasks for demo users...")
    for user in users.values():
        statement = select(Task).where(Task.user_id == user.id)
        existing_tasks = session.exec(statement).all()
        for task in existing_tasks:
            session.delete(task)
    session.commit()

    # Create new tasks
    tasks = []
    for task_data in tasks_data:
        task = Task(**task_data)
        session.add(task)
        tasks.append(task)

    session.commit()

    # Refresh tasks to get IDs
    for task in tasks:
        session.refresh(task)

    print(f"  ✓ Created {len(tasks)} tasks")
    return tasks


def print_summary(session: Session, users: dict[str, User]):
    """
    Print summary of seeded data.

    Args:
        users: Dictionary of User objects
    """
    print("\n" + "=" * 60)
    print("DATABASE SEED SUMMARY")
    print("=" * 60)

    for user_name, user in users.items():
        # Get task counts
        statement = select(Task).where(Task.user_id == user.id)
        all_tasks = session.exec(statement).all()

        total = len(all_tasks)
        completed = len([t for t in all_tasks if t.completed])
        pending = total - completed

        print(f"\n{user.name} ({user.email}):")
        print(f"  Total tasks: {total}")
        print(f"  Completed:   {completed}")
        print(f"  Pending:     {pending}")

        # List tasks
        for task in all_tasks:
            status = "✓" if task.completed else "○"
            print(f"    {status} #{task.id}: {task.title}")

    print("\n" + "=" * 60)


def verify_seed(session: Session) -> bool:
    """
    Verify seeded data matches expected counts.

    Returns:
        bool: True if verification passes

    Raises:
        AssertionError: If counts don't match expected values
    """
    print("\nVerifying seed data...")

    # Count users
    user_count = len(session.exec(select(User).where(
        User.id.in_(["user_alice_demo", "user_bob_demo"])
    )).all())

    # Count tasks for demo users
    task_count = len(session.exec(select(Task).where(
        Task.user_id.in_(["user_alice_demo", "user_bob_demo"])
    )).all())

    print(f"  Users: {user_count} (expected: 2)")
    print(f"  Tasks: {task_count} (expected: 10)")

    assert user_count == 2, f"Expected 2 users, found {user_count}"
    assert task_count == 10, f"Expected 10 tasks, found {task_count}"

    print("  ✓ Verification passed!")
    return True


def main():
    """Main seeding workflow."""
    print("=" * 60)
    print("DATABASE SEEDING SCRIPT")
    print("=" * 60)
    print("\nThis script will create:")
    print("  - 2 test users (Alice, Bob)")
    print("  - 10 tasks (5 per user, mix of completed/pending)")
    print("\nNote: Existing demo user tasks will be removed and recreated.")
    print("=" * 60)

    try:
        # Create database engine
        engine = get_engine()
        print(f"\n✓ Connected to database")

        with Session(engine) as session:
            # Seed users
            users = seed_users(session)

            # Seed tasks
            tasks = seed_tasks(session, users)

            # Verify seeded data
            verify_seed(session)

            # Print summary
            print_summary(session, users)

        print("\n✓ Database seeding completed successfully!")
        print("\nYou can now:")
        print("  1. Run tests: pytest tests/ -v")
        print("  2. Query data: psql $DATABASE_URL")
        print("  3. Start development with pre-populated data")

    except ValueError as e:
        print(f"\n✗ Configuration error: {e}")
        sys.exit(1)
    except AssertionError as e:
        print(f"\n✗ Verification failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
