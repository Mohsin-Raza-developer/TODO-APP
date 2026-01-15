"""
Pytest fixtures for REST API testing.

This module provides shared test fixtures for REST API endpoint tests:
- Test database (SQLite in-memory with transactional rollback)
- Test client (FastAPI TestClient)
- Authentication headers (valid JWT tokens for testing)

Note: This is separate from the main conftest.py which tests database schema
using the actual Neon PostgreSQL database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from datetime import datetime, timedelta
from jose import jwt
from typing import Generator
import sys
from pathlib import Path

# Add backend directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from database import get_session
from config import settings


@pytest.fixture(name="api_test_engine")
def api_test_engine_fixture():
    """
    Create SQLite in-memory database engine for API testing.

    Returns:
        Engine: SQLModel engine with in-memory SQLite database

    Notes:
        - Uses StaticPool to maintain single connection for in-memory DB
        - Connects check_same_thread=False for multi-threaded test execution
        - Creates all tables before each test
        - Drops all tables after each test
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="api_test_session")
def api_test_session_fixture(api_test_engine) -> Generator[Session, None, None]:
    """
    Create test database session with transactional rollback.

    Args:
        api_test_engine: SQLite in-memory engine from api_test_engine fixture

    Yields:
        Session: Database session that rolls back after each test

    Notes:
        - Each test gets a fresh transaction
        - Rollback ensures test isolation (no data persists between tests)
        - Connection closed after rollback
    """
    connection = api_test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(name="api_client")
def api_client_fixture(api_test_session: Session) -> TestClient:
    """
    Create FastAPI TestClient with test database session.

    Args:
        api_test_session: Test database session from api_test_session fixture

    Returns:
        TestClient: FastAPI test client configured to use test database

    Notes:
        - Overrides get_session dependency with api_test_session
        - All API calls during tests use in-memory database
        - No external database required for testing
    """

    def get_api_test_session_override():
        return api_test_session

    app.dependency_overrides[get_session] = get_api_test_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture() -> dict[str, str]:
    """
    Generate valid JWT authentication headers for testing.

    Returns:
        dict: Authorization headers with valid JWT token

    Example:
        {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }

    Notes:
        - Uses BETTER_AUTH_SECRET from settings for token signing
        - Token expires in 1 hour (sufficient for test execution)
        - user_id set to "test_user_123" for consistent testing
        - Matches Better Auth JWT format (userId claim)
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="auth_headers_user2")
def auth_headers_user2_fixture() -> dict[str, str]:
    """
    Generate valid JWT authentication headers for second test user.

    Returns:
        dict: Authorization headers with valid JWT token for test_user_456

    Notes:
        - Used for cross-user access testing
        - Verifies 404 responses for accessing another user's tasks
        - Same token format as auth_headers but different userId
    """
    payload = {
        "userId": "test_user_456",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="expired_auth_headers")
def expired_auth_headers_fixture() -> dict[str, str]:
    """
    Generate expired JWT authentication headers for testing.

    Returns:
        dict: Authorization headers with expired JWT token

    Notes:
        - Token expired 1 hour ago (exp in the past)
        - Used for testing 401 Unauthorized responses
        - Verifies JWT expiration validation
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() - timedelta(hours=1),  # Expired 1 hour ago
        "iat": datetime.utcnow() - timedelta(hours=2),
    }
    token = jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="invalid_auth_headers")
def invalid_auth_headers_fixture() -> dict[str, str]:
    """
    Generate invalid JWT authentication headers for testing.

    Returns:
        dict: Authorization headers with malformed JWT token

    Notes:
        - Token signed with wrong secret ("wrong_secret")
        - Used for testing 401 Unauthorized responses
        - Verifies JWT signature validation
    """
    payload = {
        "userId": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, "wrong_secret", algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}