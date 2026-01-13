"""
User model for Better Auth integration.

This model defines the users table for storing authenticated users.
Integrates with Better Auth JWT authentication system.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import TEXT, TIMESTAMP, text


class User(SQLModel, table=True):
    """
    User model for Better Auth integration.

    Stores authenticated users with minimum required fields for Better Auth.

    Attributes:
        id: User UUID from Better Auth (format: "clh7x2w3y0000qz8r4t5u6v7w")
        email: Unique email for login (UNIQUE constraint enforced)
        name: Display name for UI
        created_at: Account creation timestamp (auto-set by database)

    Principles Applied:
        - Multi-User Data Isolation: Primary key for user_id foreign keys
        - Database Schema Architect: Database-level timestamp defaults

    Example:
        user = User(
            id="user_abc123",
            email="alice@example.com",
            name="Alice"
        )
    """

    __tablename__ = "users"

    # Better Auth generates string-based UUIDs (not PostgreSQL UUID type)
    id: str = Field(
        sa_column=Column(TEXT, primary_key=True, nullable=False),
        description="User UUID from Better Auth"
    )

    # UNIQUE constraint prevents duplicate account registrations
    email: str = Field(
        sa_column=Column(TEXT, nullable=False, unique=True),
        description="Unique email for login"
    )

    name: str = Field(
        sa_column=Column(TEXT, nullable=False),
        description="Display name for UI"
    )

    # Database-level timestamp (NOT Python datetime.now())
    # server_default=text("NOW()") ensures PostgreSQL sets value
    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
        ),
        description="Account creation timestamp (UTC)"
    )
