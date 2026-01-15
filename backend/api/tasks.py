"""
Task API endpoints for CRUD operations on todos.

This module provides REST API endpoints for:
- Creating todos (POST /api/{user_id}/tasks)
- Listing todos (GET /api/{user_id}/tasks)
- Getting single todo (GET /api/{user_id}/tasks/{id})
- Updating todos (PUT /api/{user_id}/tasks/{id})
- Toggling completion (PATCH /api/{user_id}/tasks/{id}/complete)
- Deleting todos (DELETE /api/{user_id}/tasks/{id})
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import Annotated, List, Optional
from database import get_session
from api.deps import verify_user_ownership
from models.task import Task
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from datetime import datetime
import logging

# Configure logger
logger = logging.getLogger(__name__)


# Create API router for task endpoints
router = APIRouter()


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo task",
    description="Create a new todo item for the authenticated user with validation",
)
async def create_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_data: TaskCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Task:
    """
    Create a new todo task for the authenticated user.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        task_data: Task creation data (title required, description optional)
        session: Database session

    Returns:
        Task: Created task with auto-generated ID and timestamps

    Raises:
        HTTPException: 400 if validation fails (empty title, title/description too long)
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 403 if user_id doesn't match JWT token

    Example:
        POST /api/user_alice_123/tasks
        {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread"
        }

        Response (201 Created):
        {
            "id": 1,
            "user_id": "user_alice_123",
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "completed": false,
            "created_at": "2026-01-14T10:30:00Z",
            "updated_at": "2026-01-14T10:30:00Z"
        }

    Validation (handled by Pydantic TaskCreate schema):
        - title: Required, 1-200 characters (FR-012)
        - description: Optional, max 1000 characters (FR-013)

    Constitutional Compliance:
        - Principle VII: User ownership verified via verify_user_ownership dependency
        - Principle III: user_id foreign key enforces data isolation at database level
    """
    # Create task with user_id from authenticated token
    # Set timestamps explicitly for SQLite compatibility (PostgreSQL would use server defaults)
    now = datetime.utcnow()
    task = Task(
        user_id=user_id,  # From authenticated JWT token
        title=task_data.title,
        description=task_data.description,
        completed=False,  # New tasks always start as pending (FR-015)
        created_at=now,
        updated_at=now,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Created task {task.id} for user {user_id}: '{task.title}'")
    return task


@router.get(
    "/{user_id}/tasks",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List all todos for a user",
    description="Retrieve all todos for the authenticated user with optional status filtering",
)
async def list_tasks(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    session: Annotated[Session, Depends(get_session)],
    status_filter: Optional[str] = Query(
        default="all",
        alias="status",
        description="Filter by completion status (all, pending, completed)",
        pattern="^(all|pending|completed)$",
    ),
) -> List[Task]:
    """
    List all todos for the authenticated user with optional status filtering.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        session: Database session
        status_filter: Filter by completion status (all/pending/completed, default: all)

    Returns:
        List[Task]: Array of tasks ordered by created_at DESC (newest first)

    Raises:
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 403 if user_id doesn't match JWT token

    Example:
        GET /api/user_alice_123/tasks?status=pending

        Response (200 OK):
        [
            {
                "id": 2,
                "user_id": "user_alice_123",
                "title": "Complete project",
                "description": null,
                "completed": false,
                "created_at": "2026-01-14T15:20:00Z",
                "updated_at": "2026-01-14T15:20:00Z"
            },
            {
                "id": 1,
                "user_id": "user_alice_123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": false,
                "created_at": "2026-01-14T10:30:00Z",
                "updated_at": "2026-01-14T10:30:00Z"
            }
        ]

    Status Filtering (FR-022):
        - "all": Return all tasks (no filter)
        - "pending": Return only tasks with completed=false
        - "completed": Return only tasks with completed=true

    Constitutional Compliance:
        - Principle III: user_id filter enforces data isolation (FR-021)
        - Principle VII: Ownership verified via verify_user_ownership dependency
    """
    # Base query with user isolation (FR-021)
    statement = select(Task).where(Task.user_id == user_id)

    # Apply status filter (FR-022)
    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)
    # "all" = no additional filter

    # Order by newest first (FR-023)
    statement = statement.order_by(Task.created_at.desc())

    # Execute query
    tasks = session.exec(statement).all()

    logger.info(f"Listed {len(tasks)} tasks for user {user_id} (filter={status_filter})")
    # Return empty array if no tasks (FR-024)
    return tasks


@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single todo by ID",
    description="Retrieve detailed information for a specific todo owned by the authenticated user",
)
async def get_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Task:
    """
    Get a single todo by ID for the authenticated user.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        task_id: Task ID from URL path
        session: Database session

    Returns:
        Task: Complete task object with all fields

    Raises:
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 404 if task doesn't exist OR belongs to another user (prevents ID enumeration)

    Example:
        GET /api/user_alice_123/tasks/5

        Response (200 OK):
        {
            "id": 5,
            "user_id": "user_alice_123",
            "title": "Complete project",
            "description": "Finish REST API implementation",
            "completed": false,
            "created_at": "2026-01-14T10:30:00Z",
            "updated_at": "2026-01-14T10:30:00Z"
        }

    Security (AD-006):
        - Uses combined filter (Task.id == task_id AND Task.user_id == user_id)
        - Returns 404 for both non-existent tasks AND cross-user access
        - Prevents ID enumeration attacks (can't distinguish between "not found" and "not yours")

    Constitutional Compliance:
        - Principle VII: Ownership verified via verify_user_ownership dependency
        - Principle III: Combined filter enforces data isolation at database level
    """
    # Query with ownership check at database level (FR-025, AD-006)
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    # Return 404 for both non-existent and cross-user tasks (FR-026, FR-027)
    if not task:
        logger.warning(f"Task {task_id} not found for user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    logger.info(f"Retrieved task {task_id} for user {user_id}")
    return task


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing todo",
    description="Update title and/or description of an existing todo owned by the authenticated user",
)
async def update_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_id: int,
    task_data: TaskUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Task:
    """
    Update an existing todo's title and/or description.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        task_id: Task ID from URL path
        task_data: Task update data (title and/or description, both optional)
        session: Database session

    Returns:
        Task: Updated task with new updated_at timestamp

    Raises:
        HTTPException: 400 if validation fails (empty title, title/description too long)
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 404 if task doesn't exist OR belongs to another user

    Example:
        PUT /api/user_alice_123/tasks/5
        {
            "title": "Complete REST API",
            "description": "Finish all CRUD endpoints"
        }

        Response (200 OK):
        {
            "id": 5,
            "user_id": "user_alice_123",
            "title": "Complete REST API",
            "description": "Finish all CRUD endpoints",
            "completed": false,
            "created_at": "2026-01-14T10:30:00Z",
            "updated_at": "2026-01-14T15:45:00Z"
        }

    Partial Updates (FR-032):
        - Only provided fields are updated
        - Omitted fields preserve their current values
        - Example: {"title": "New title"} updates only title, keeps description unchanged

    Validation (handled by Pydantic TaskUpdate schema):
        - title: Optional, 1-200 characters if provided (FR-030)
        - description: Optional, max 1000 characters if provided (FR-031)

    Constitutional Compliance:
        - Principle VII: Ownership verified via verify_user_ownership dependency
        - Principle III: Combined filter enforces data isolation at database level
    """
    # Query with ownership check at database level (FR-028, AD-006)
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    # Return 404 for both non-existent and cross-user tasks (FR-033)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update fields if provided (partial updates supported, FR-032)
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description

    # Update timestamp automatically (FR-034)
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Updated task {task_id} for user {user_id}")
    # Return updated task (FR-029)
    return task


@router.patch(
    "/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle todo completion status",
    description="Toggle a todo between completed and pending states",
)
async def toggle_completion(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Task:
    """
    Toggle todo completion status between completed and pending.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        task_id: Task ID from URL path
        session: Database session

    Returns:
        Task: Task with toggled completion status and updated timestamp

    Raises:
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 404 if task doesn't exist OR belongs to another user

    Example:
        PATCH /api/user_alice_123/tasks/5/complete

        Response (200 OK) - First toggle (pending → completed):
        {
            "id": 5,
            "user_id": "user_alice_123",
            "title": "Complete project",
            "description": "Finish REST API implementation",
            "completed": true,
            "created_at": "2026-01-14T10:30:00Z",
            "updated_at": "2026-01-14T16:20:00Z"
        }

        Response (200 OK) - Second toggle (completed → pending):
        {
            "id": 5,
            "completed": false,
            "updated_at": "2026-01-14T16:25:00Z"
        }

    Toggle Behavior (FR-037):
        - If completed=true → set to false
        - If completed=false → set to true
        - No request body required (idempotent toggle operation)

    Constitutional Compliance:
        - Principle VII: Ownership verified via verify_user_ownership dependency
        - Principle III: Combined filter enforces data isolation at database level
    """
    # Query with ownership check at database level (FR-036, AD-006)
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    # Return 404 for both non-existent and cross-user tasks (FR-039)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Toggle completion status (FR-037)
    task.completed = not task.completed

    # Update timestamp automatically (FR-038)
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Toggled task {task_id} completion to {task.completed} for user {user_id}")
    # Return updated task (FR-040)
    return task


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo",
    description="Permanently delete a todo owned by the authenticated user",
)
async def delete_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    """
    Permanently delete a todo from the database.

    Args:
        user_id: User ID from URL (verified to match JWT token)
        task_id: Task ID from URL path
        session: Database session

    Returns:
        None: No content (204 status code per REST conventions)

    Raises:
        HTTPException: 401 if JWT token is missing/invalid/expired
        HTTPException: 404 if task doesn't exist OR belongs to another user

    Example:
        DELETE /api/user_alice_123/tasks/5

        Response (204 No Content):
        (empty response body)

    Verification:
        After deletion, GET /api/user_alice_123/tasks/5 returns 404
        GET /api/user_alice_123/tasks no longer includes task 5 in the list

    Constitutional Compliance:
        - Principle VII: Ownership verified via verify_user_ownership dependency
        - Principle III: Combined filter enforces data isolation at database level
        - FR-044: No response body (204 No Content per REST conventions)
    """
    # Query with ownership check at database level (FR-041, AD-006)
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    # Return 404 for both non-existent and cross-user tasks (FR-043)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Delete task and commit (FR-042)
    session.delete(task)
    session.commit()

    logger.info(f"Deleted task {task_id} for user {user_id}")
    # No return value for 204 No Content (FR-044)
    return None
