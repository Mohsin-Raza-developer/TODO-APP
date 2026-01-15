"""
Database connection and session management for SQLModel ORM.

This module provides:
- SQLModel engine initialization with Neon PostgreSQL
- Request-scoped database session dependency for FastAPI
- Connection pooling configuration for serverless deployment
"""

from sqlmodel import create_engine, Session
from config import settings
from typing import Generator


# Create SQLModel engine with connection pooling
# Uses DATABASE_URL from environment (must be pooled endpoint with -pooler suffix)
engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL query logging during development
    pool_pre_ping=True,  # Verify connections before use (important for serverless)
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session for each request.

    Yields:
        Session: SQLModel session for database operations

    Usage:
        @app.get("/api/users")
        async def get_users(session: Session = Depends(get_session)):
            users = session.exec(select(User)).all()
            return users

    Notes:
        - Session is automatically committed on success
        - Session is automatically rolled back on exception
        - Session is always closed after request completes
        - Request-scoped: Each API request gets its own session
    """
    with Session(engine) as session:
        yield session
