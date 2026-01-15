"""
Pytest configuration and fixtures for integration tests.

This module provides:
- Database connection fixtures
- Test session management with transactional rollback
- Common test data fixtures (users, tasks)

Test Isolation Strategy:
- Each test runs in a transaction that is rolled back
- This is 100x faster than recreating the database per test
- Ensures complete isolation between tests
"""

import os
import sys
from pathlib import Path
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel
from dotenv import load_dotenv

# Add src/ to Python path for model imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from models import User, Task

# Load environment variables
load_dotenv()

# Register REST API fixtures
pytest_plugins = ["tests.test_rest_api_conftest"]


@pytest.fixture(scope="session")
def database_url():
    """
    Get DATABASE_URL from environment.

    This fixture uses the same Neon database as development.
    Tests run in transactions that are rolled back.
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        pytest.fail("DATABASE_URL not set in environment. Create backend/.env file.")
    return url


@pytest.fixture(scope="session")
def test_engine(database_url):
    """
    Create SQLAlchemy engine for testing.

    Configuration:
    - Uses Neon pooled connection endpoint
    - pool_pre_ping ensures stale connections are detected
    - Minimal pool_size for serverless optimization
    """
    engine = create_engine(
        database_url,
        echo=False,  # Set to True for SQL debugging
        pool_pre_ping=True,
        pool_size=1,
        max_overflow=0,
    )

    # Verify connection works
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1, "Database connection failed"

    yield engine

    # Cleanup: dispose connections
    engine.dispose()


@pytest.fixture(scope="function")
def session(test_engine):
    """
    Create a test session with transactional rollback.

    Test Isolation Strategy:
    - Each test runs in a transaction
    - Transaction is rolled back after test completes
    - This is 100x faster than recreating tables per test
    - Ensures complete isolation between tests

    Usage:
        def test_something(session):
            user = User(id="test", email="test@example.com", name="Test")
            session.add(user)
            session.commit()
            # ... test logic ...
            # Transaction automatically rolled back after test
    """
    # Start a connection
    connection = test_engine.connect()

    # Begin a transaction
    transaction = connection.begin()

    # Create session bound to this connection
    test_session = Session(bind=connection)

    yield test_session

    # Rollback transaction (undoes all changes from test)
    test_session.close()
    transaction.rollback()

    # Close connection
    connection.close()


@pytest.fixture(scope="function")
def test_user(session: Session):
    """
    Create a test user for use in tests.

    This fixture provides a default test user to avoid
    repetitive user creation in every test.

    Usage:
        def test_something(session, test_user):
            task = Task(user_id=test_user.id, title="Test Task")
            session.add(task)
            session.commit()
    """
    user = User(
        id="test_user_default",
        email="test@example.com",
        name="Test User"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return user


@pytest.fixture(scope="function")
def multiple_users(session: Session):
    """
    Create multiple test users for multi-user tests.

    Returns a list of 3 users for testing data isolation.

    Usage:
        def test_multi_user(session, multiple_users):
            alice, bob, charlie = multiple_users
            # ... test logic ...
    """
    users = [
        User(id="alice", email="alice@example.com", name="Alice"),
        User(id="bob", email="bob@example.com", name="Bob"),
        User(id="charlie", email="charlie@example.com", name="Charlie"),
    ]
    session.add_all(users)
    session.commit()

    for user in users:
        session.refresh(user)

    return users


@pytest.fixture(autouse=True, scope="session")
def cleanup_test_data(test_engine):
    """
    Cleanup any leftover test data before and after test session.

    This fixture runs automatically and ensures the database
    is clean before tests start.

    Note: Due to transactional rollback, this should rarely be needed,
    but provides extra safety if tests fail unexpectedly.
    """
    def cleanup():
        """Delete all test data (users starting with 'test_' or common test emails)."""
        with Session(test_engine) as session:
            # Delete test tasks
            session.exec(
                text("DELETE FROM tasks WHERE user_id LIKE 'test_%' OR user_id IN ('alice', 'bob', 'charlie')")
            )

            # Delete test users
            session.exec(
                text("DELETE FROM users WHERE id LIKE 'test_%' OR id IN ('alice', 'bob', 'charlie')")
            )

            session.commit()

    # Cleanup before tests
    cleanup()

    yield

    # Cleanup after tests
    cleanup()


# ==============================================================================
# REST API Test Fixtures (Phase III)
# ==============================================================================

from fastapi.testclient import TestClient
from sqlmodel.pool import StaticPool
from jose import jwt

# Import REST API components
sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app
from database import get_session
from config import settings


@pytest.fixture(name="api_test_engine")
def api_test_engine_fixture(test_engine):
    """
    Use PostgreSQL test engine for API testing.

    Reuses the same Neon PostgreSQL database as schema tests.
    Tests use transactional rollback for isolation.
    """
    # Reuse the PostgreSQL test_engine fixture
    return test_engine


@pytest.fixture(name="api_test_session")
def api_test_session_fixture(api_test_engine):
    """
    Create test database session with transactional rollback for API tests.
    """
    connection = api_test_engine.connect()
    transaction = connection.begin()
    test_session = Session(bind=connection)

    yield test_session

    test_session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(name="api_client")
def api_client_fixture(api_test_session: Session):
    """
    Create FastAPI TestClient with test database session.

    Also seeds test users required by auth_headers fixtures.
    """
    # Import models
    from models import User

    # Seed test users for auth_headers fixtures
    from datetime import datetime
    now = datetime.utcnow()
    test_users = [
        User(id="test_user_123", email="test1@example.com", name="Test User 1", created_at=now),
        User(id="test_user_456", email="test2@example.com", name="Test User 2", created_at=now),
    ]
    for user in test_users:
        api_test_session.add(user)
    api_test_session.commit()

    def get_api_test_session_override():
        return api_test_session

    app.dependency_overrides[get_session] = get_api_test_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture():
    """
    Generate valid JWT authentication headers for testing.
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="auth_headers_user2")
def auth_headers_user2_fixture():
    """
    Generate valid JWT authentication headers for second test user.
    """
    payload = {
        "userId": "test_user_456",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="expired_auth_headers")
def expired_auth_headers_fixture():
    """
    Generate expired JWT authentication headers for testing.
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() - timedelta(hours=1),
        "iat": datetime.utcnow() - timedelta(hours=2),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="invalid_auth_headers")
def invalid_auth_headers_fixture():
    """
    Generate invalid JWT authentication headers for testing.
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, "wrong_secret", algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}