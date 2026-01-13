"""
Task model for multi-user todo application.

This model defines the tasks table with BIGINT sequential IDs,
foreign key to users, and automatic timestamp management.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import BigInteger, TEXT, String, Boolean, TIMESTAMP, ForeignKey, text


class Task(SQLModel, table=True):
    """
    Task model for user todo items.

    Implements ID Architect pattern with BIGINT sequential IDs that are
    never reused after deletion. Enforces data isolation with user_id foreign key.

    Attributes:
        id: Sequential BIGINT primary key (BIGSERIAL, ~9.2 quintillion capacity)
        user_id: Owner user ID (foreign key to users.id, CASCADE deletion)
        title: Task description (1-200 characters, required)
        description: Optional task details (unlimited length)
        completed: Completion status (default: FALSE)
        created_at: Task creation timestamp (auto-set by database)
        updated_at: Last modification timestamp (auto-updated by trigger)

    Principles Applied:
        - ID Architect: BIGINT sequences starting from 1, never reused
        - Multi-User Data Isolation: user_id foreign key with ON DELETE CASCADE
        - Database Schema Architect: Indexes, triggers, timestamp automation

    Example:
        task = Task(
            user_id="user_abc123",
            title="Buy groceries",
            description="Milk, eggs, bread"
        )
    """

    __tablename__ = "tasks"

    # BIGINT primary key (ID Architect pattern)
    # autoincrement=True generates BIGSERIAL in PostgreSQL
    # Sequence starts at 1, never reuses deleted IDs
    id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            BigInteger,
            primary_key=True,
            autoincrement=True,
            nullable=False
        ),
        description="Sequential BIGINT primary key (never reused)"
    )

    # Foreign key to users.id (data isolation)
    # ON DELETE CASCADE: Deleting user deletes all their tasks (GDPR)
    user_id: str = Field(
        sa_column=Column(
            TEXT,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True  # B-tree index for O(log n) query performance
        ),
        description="Owner user ID (foreign key to users.id)"
    )

    # Title: Task description (1-200 characters)
    # VARCHAR(200) enforces max length at database level
    title: str = Field(
        sa_column=Column(
            String(200),
            nullable=False
        ),
        max_length=200,
        description="Task title (1-200 characters, required)"
    )

    # Description: Optional details (unlimited length)
    # TEXT type supports unlimited length
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Optional task details (unlimited length)"
    )

    # Completed: Boolean flag for completion status
    # server_default=false() uses PostgreSQL FALSE (not Python False)
    completed: bool = Field(
        default=False,
        sa_column=Column(
            Boolean,
            nullable=False,
            server_default=text("FALSE")
        ),
        description="Completion status (default: FALSE)"
    )

    # Created At: Task creation timestamp
    # server_default=NOW() ensures PostgreSQL sets timestamp (not Python)
    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
        ),
        description="Task creation timestamp (UTC, auto-set by database)"
    )

    # Updated At: Last modification timestamp
    # server_default=NOW() sets initial value
    # UPDATE trigger handles auto-update (see migration)
    updated_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP,
            nullable=False,
            server_default=text("NOW()")
        ),
        description="Last modification timestamp (UTC, auto-updated by trigger)"
    )
