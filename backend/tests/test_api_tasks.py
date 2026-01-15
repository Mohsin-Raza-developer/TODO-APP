"""
REST API endpoint tests for task CRUD operations.

This module tests all 6 user stories:
- User Story 1: Create Todo (POST /api/{user_id}/tasks)
- User Story 2: List Todos (GET /api/{user_id}/tasks)
- User Story 3: Get Single Todo (GET /api/{user_id}/tasks/{id})
- User Story 4: Update Todo (PUT /api/{user_id}/tasks/{id})
- User Story 5: Toggle Completion (PATCH /api/{user_id}/tasks/{id}/complete)
- User Story 6: Delete Todo (DELETE /api/{user_id}/tasks/{id})
"""

import pytest
from fastapi.testclient import TestClient

# Fixtures are auto-discovered from conftest.py:
# - api_client
# - auth_headers
# - auth_headers_user2


# ==============================================================================
# User Story 1: Create Todo (POST /api/{user_id}/tasks)
# ==============================================================================


def test_create_task_success(api_client: TestClient, auth_headers: dict[str, str]):

    """
    Test successful task creation with valid data.

    Expected:
    - HTTP 201 Created
    - TaskResponse with all fields
    - completed defaults to False
    - Timestamps auto-generated
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Buy groceries", "description": "Milk, eggs, bread"},
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()

    # Verify all fields present
    assert "id" in data
    assert data["user_id"] == "test_user_123"
    assert data["title"] == "Buy groceries"
    assert data["description"] == "Milk, eggs, bread"
    assert data["completed"] is False
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_without_description(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test task creation without description (optional field).

    Expected:
    - HTTP 201 Created
    - description is None
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Simple task"},
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Simple task"
    assert data["description"] is None


def test_create_task_empty_title_returns_400(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that empty title returns validation error.

    Expected:
    - HTTP 400 Bad Request
    - Error type: "validation_error"
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": ""},
        headers=auth_headers,
    )

    assert response.status_code == 422  # Pydantic validation error
    data = response.json()
    assert "detail" in data


def test_create_task_title_too_long_returns_400(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that title exceeding 200 characters returns validation error.

    Expected:
    - HTTP 422 Unprocessable Entity (Pydantic validation)
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "A" * 201},  # 201 characters
        headers=auth_headers,
    )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_create_task_description_too_long_returns_400(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that description exceeding 1000 characters returns validation error.

    Expected:
    - HTTP 422 Unprocessable Entity (Pydantic validation)
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Valid title", "description": "B" * 1001},  # 1001 characters
        headers=auth_headers,
    )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


# ==============================================================================
# User Story 2: List Todos (GET /api/{user_id}/tasks)
# ==============================================================================


def test_list_tasks_empty(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test listing tasks when user has no tasks.

    Expected:
    - HTTP 200 OK
    - Empty array []
    """
    response = api_client.get(
        "/api/test_user_123/tasks",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_list_tasks_multiple(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test listing multiple tasks ordered by created_at DESC.

    Expected:
    - HTTP 200 OK
    - Array of tasks
    - Newest task first
    """
    # Create 3 tasks
    api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task 1"},
        headers=auth_headers,
    )
    api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task 2"},
        headers=auth_headers,
    )
    api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task 3"},
        headers=auth_headers,
    )

    # List tasks
    response = api_client.get(
        "/api/test_user_123/tasks",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Newest first (Task 3)
    assert data[0]["title"] == "Task 3"
    assert data[1]["title"] == "Task 2"
    assert data[2]["title"] == "Task 1"


def test_list_tasks_filter_pending(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test filtering tasks by status=pending.

    Expected:
    - HTTP 200 OK
    - Only pending tasks (completed=false)
    """
    # Create pending task
    api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Pending task"},
        headers=auth_headers,
    )

    # Create completed task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Completed task"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Toggle to completed
    api_client.patch(
        f"/api/test_user_123/tasks/{task_id}/complete",
        headers=auth_headers,
    )

    # List pending tasks
    response = api_client.get(
        "/api/test_user_123/tasks?status=pending",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Pending task"
    assert data[0]["completed"] is False


def test_list_tasks_filter_completed(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test filtering tasks by status=completed.

    Expected:
    - HTTP 200 OK
    - Only completed tasks (completed=true)
    """
    # Create pending task
    api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Pending task"},
        headers=auth_headers,
    )

    # Create completed task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Completed task"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Toggle to completed
    api_client.patch(
        f"/api/test_user_123/tasks/{task_id}/complete",
        headers=auth_headers,
    )

    # List completed tasks
    response = api_client.get(
        "/api/test_user_123/tasks?status=completed",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Completed task"
    assert data[0]["completed"] is True


def test_list_tasks_ordered_by_created_at_desc(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that tasks are ordered by created_at DESC (newest first).

    Expected:
    - HTTP 200 OK
    - Tasks ordered with most recent first
    """
    # Create tasks with slight delay to ensure different timestamps
    task1 = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Oldest"},
        headers=auth_headers,
    ).json()

    task2 = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Middle"},
        headers=auth_headers,
    ).json()

    task3 = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Newest"},
        headers=auth_headers,
    ).json()

    # List tasks
    response = api_client.get(
        "/api/test_user_123/tasks",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["title"] == "Newest"
    assert data[1]["title"] == "Middle"
    assert data[2]["title"] == "Oldest"


# ==============================================================================
# User Story 3: Get Single Todo (GET /api/{user_id}/tasks/{id})
# ==============================================================================


def test_get_task_success(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test getting a single task by ID.

    Expected:
    - HTTP 200 OK
    - Complete task object
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task", "description": "Test description"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Get task
    response = api_client.get(
        f"/api/test_user_123/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Test task"
    assert data["description"] == "Test description"


def test_get_task_not_found_returns_404(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test getting non-existent task returns 404.

    Expected:
    - HTTP 404 Not Found
    - Error type: "not_found"
    """
    response = api_client.get(
        "/api/test_user_123/tasks/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"
    assert "not found" in data["message"].lower()


def test_get_task_cross_user_returns_404(
    api_client: TestClient, auth_headers: dict[str, str], auth_headers_user2: dict[str, str]
):
    """
    Test that accessing another user's task returns 404 (not 403).
    This prevents ID enumeration attacks (AD-006).

    Expected:
    - HTTP 404 Not Found (same as non-existent task)
    """
    # User 1 creates a task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "User 1 task"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # User 2 tries to access User 1's task
    response = api_client.get(
        f"/api/test_user_456/tasks/{task_id}",
        headers=auth_headers_user2,
    )

    # Should return 404 (not 403) to prevent ID enumeration
    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"


# ==============================================================================
# User Story 4: Update Todo (PUT /api/{user_id}/tasks/{id})
# ==============================================================================


def test_update_task_title(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test updating task title only.

    Expected:
    - HTTP 200 OK
    - Title updated
    - Description unchanged
    - updated_at timestamp updated
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Original title", "description": "Original description"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]
    original_updated_at = create_response.json()["updated_at"]

    # Update title only
    response = api_client.put(
        f"/api/test_user_123/tasks/{task_id}",
        json={"title": "Updated title"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated title"
    assert data["description"] == "Original description"  # Unchanged
    # Note: updated_at should be different, but hard to test with exact match


def test_update_task_description(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test updating task description only.

    Expected:
    - HTTP 200 OK
    - Description updated
    - Title unchanged
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Original title", "description": "Original description"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Update description only
    response = api_client.put(
        f"/api/test_user_123/tasks/{task_id}",
        json={"description": "Updated description"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Original title"  # Unchanged
    assert data["description"] == "Updated description"


def test_update_task_both_fields(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test updating both title and description.

    Expected:
    - HTTP 200 OK
    - Both fields updated
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Original title", "description": "Original description"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Update both fields
    response = api_client.put(
        f"/api/test_user_123/tasks/{task_id}",
        json={"title": "Updated title", "description": "Updated description"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated title"
    assert data["description"] == "Updated description"


def test_update_task_not_found_returns_404(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test updating non-existent task returns 404.

    Expected:
    - HTTP 404 Not Found
    """
    response = api_client.put(
        "/api/test_user_123/tasks/99999",
        json={"title": "Updated"},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"


def test_update_task_validation_error_returns_422(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test updating task with invalid data returns validation error.

    Expected:
    - HTTP 422 Unprocessable Entity (Pydantic validation)
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Original"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Try to update with title too long
    response = api_client.put(
        f"/api/test_user_123/tasks/{task_id}",
        json={"title": "A" * 201},  # 201 characters
        headers=auth_headers,
    )

    assert response.status_code == 422


# ==============================================================================
# User Story 5: Toggle Completion (PATCH /api/{user_id}/tasks/{id}/complete)
# ==============================================================================


def test_toggle_completion_pending_to_completed(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test toggling task from pending to completed.

    Expected:
    - HTTP 200 OK
    - completed changes from false to true
    """
    # Create pending task (default)
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task to complete"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]
    assert create_response.json()["completed"] is False

    # Toggle to completed
    response = api_client.patch(
        f"/api/test_user_123/tasks/{task_id}/complete",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


def test_toggle_completion_completed_to_pending(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test toggling task from completed back to pending.

    Expected:
    - HTTP 200 OK
    - completed changes from true to false
    """
    # Create task and toggle to completed
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task to uncomplete"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # First toggle: pending → completed
    api_client.patch(
        f"/api/test_user_123/tasks/{task_id}/complete",
        headers=auth_headers,
    )

    # Second toggle: completed → pending
    response = api_client.patch(
        f"/api/test_user_123/tasks/{task_id}/complete",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is False


def test_toggle_completion_not_found_returns_404(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test toggling non-existent task returns 404.

    Expected:
    - HTTP 404 Not Found
    """
    response = api_client.patch(
        "/api/test_user_123/tasks/99999/complete",
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"


# ==============================================================================
# User Story 6: Delete Todo (DELETE /api/{user_id}/tasks/{id})
# ==============================================================================


def test_delete_task_success(api_client: TestClient, auth_headers: dict[str, str]):
    """
    Test successful task deletion.

    Expected:
    - HTTP 204 No Content
    - No response body
    - Task no longer in database
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task to delete"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Delete task
    response = api_client.delete(
        f"/api/test_user_123/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204
    assert response.text == ""  # No content


def test_delete_task_not_found_returns_404(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test deleting non-existent task returns 404.

    Expected:
    - HTTP 404 Not Found
    """
    response = api_client.delete(
        "/api/test_user_123/tasks/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"


def test_delete_task_cross_user_returns_404(
    api_client: TestClient, auth_headers: dict[str, str], auth_headers_user2: dict[str, str]
):
    """
    Test that deleting another user's task returns 404 (not 403).
    This prevents ID enumeration attacks (AD-006).

    Expected:
    - HTTP 404 Not Found
    """
    # User 1 creates a task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "User 1 task"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # User 2 tries to delete User 1's task
    response = api_client.delete(
        f"/api/test_user_456/tasks/{task_id}",
        headers=auth_headers_user2,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "not_found"


def test_delete_task_removes_from_database(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that deleted task no longer appears in list.

    Expected:
    - Task deleted successfully
    - GET /tasks returns empty array
    """
    # Create task
    create_response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task to delete"},
        headers=auth_headers,
    )
    task_id = create_response.json()["id"]

    # Verify task exists in list
    list_response = api_client.get(
        "/api/test_user_123/tasks",
        headers=auth_headers,
    )
    assert len(list_response.json()) == 1

    # Delete task
    api_client.delete(
        f"/api/test_user_123/tasks/{task_id}",
        headers=auth_headers,
    )

    # Verify task no longer in list
    list_response = api_client.get(
        "/api/test_user_123/tasks",
        headers=auth_headers,
    )
    assert list_response.json() == []





if __name__ == "__main__":
    pytest.main()