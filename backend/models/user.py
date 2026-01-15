"""
User model (managed by Better Auth).

This model is inherited from feature 002-database-schema.
The User table is managed by Better Auth on the frontend - the backend
only references it for foreign key relationships.
"""

from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional


class User(SQLModel, table=True):
    """
    User account (managed by Better Auth).

    This table is managed by Better Auth on the frontend.
    Backend references users by user_id (string) but doesn't manage user records.

    Attributes:
        id: Better Auth UUID (string, not UUID type)
        email: Unique email address
        name: Display name (optional)
        created_at: Account creation timestamp
    """

    __tablename__ = "users"

    id: str = Field(primary_key=True)  # Better Auth UUID (string)
    email: str = Field(unique=True, index=True)  # Unique email address
    name: Optional[str] = None  # Display name
    created_at: datetime = Field(default_factory=datetime.utcnow)
