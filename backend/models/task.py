"""
Task model for todo items.

This model is inherited from feature 002-database-schema with multi-user
data isolation via user_id foreign key.
"""

from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional


class Task(SQLModel, table=True):
    """
    Todo task item with user ownership.

    Constraints:
        - id: Auto-incrementing BIGINT, never reused (ID Architect pattern from 002-database-schema)
        - user_id: Foreign key to users.id with CASCADE delete (GDPR compliance)
        - title: Required, 1-200 characters
        - description: Optional, 0-1000 characters
        - completed: Boolean status (default: False)
        - created_at: Auto-set on creation (database default)
        - updated_at: Auto-updated on modification (database trigger from 002-database-schema)

    Attributes:
        id: Unique task ID (auto-increment)
        user_id: Owner user ID (foreign key to users table)
        title: Task title (required, 1-200 characters)
        description: Task description (optional, max 1000 characters)
        completed: Completion status (default: false/pending)
        created_at: Creation timestamp (UTC)
        updated_at: Last update timestamp (UTC, auto-updated)
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)  # Auto-increment BIGINT
    user_id: str = Field(foreign_key="users.id", index=True)  # B-tree index for O(log n) queries
    title: str = Field(min_length=1, max_length=200)  # Required, validated length
    description: Optional[str] = Field(default=None, max_length=1000)  # Optional
    completed: bool = Field(default=False)  # Default: pending
    created_at: datetime = Field(default_factory=datetime.utcnow)  # Timestamp
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},  # Auto-update on modification
    )
