"""
Pydantic schemas for task request validation and response serialization.

This module provides:
- TaskCreate: Schema for creating new tasks (POST requests)
- TaskUpdate: Schema for updating existing tasks (PUT requests)
- TaskResponse: Schema for task responses (all endpoints)
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Validation Rules (from FR-012, FR-013):
        - title: Required, 1-200 characters
        - description: Optional, 0-1000 characters

    Example:
        {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread"
        }
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required)",
        examples=["Buy groceries", "Complete project report"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Task description (optional)",
        examples=["Milk, eggs, bread", None],
    )


class TaskUpdate(BaseModel):
    """
    Schema for updating a task.

    Validation Rules (from FR-030):
        - At least one field must be provided
        - title: If provided, 1-200 characters
        - description: If provided, 0-1000 characters

    Example:
        {
            "title": "Buy groceries and fruits"
        }
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title (optional)",
        examples=["Buy groceries and fruits"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Updated task description (optional)",
        examples=["Milk, eggs, bread, apples, bananas"],
    )


class TaskResponse(BaseModel):
    """
    Schema for task responses.

    Returned by:
        - POST /api/{user_id}/tasks (create)
        - GET /api/{user_id}/tasks (list)
        - GET /api/{user_id}/tasks/{id} (get single)
        - PUT /api/{user_id}/tasks/{id} (update)
        - PATCH /api/{user_id}/tasks/{id}/complete (toggle)

    All fields are always populated (no optionals).

    Example:
        {
            "id": 5,
            "user_id": "user_alice_123",
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "completed": false,
            "created_at": "2026-01-14T10:30:00Z",
            "updated_at": "2026-01-14T10:30:00Z"
        }
    """

    id: int = Field(description="Unique task ID")
    user_id: str = Field(description="Owner user ID (from JWT)")
    title: str = Field(description="Task title (1-200 characters)")
    description: Optional[str] = Field(
        description="Task description (0-1000 characters, nullable)"
    )
    completed: bool = Field(
        description="Completion status (true=completed, false=pending)"
    )
    created_at: datetime = Field(description="Creation timestamp (UTC)")
    updated_at: datetime = Field(description="Last update timestamp (UTC)")

    model_config = {"from_attributes": True}  # Allow conversion from SQLModel
