"""
Authentication tests for REST API endpoints.

This module tests JWT token validation and user ownership verification:
- Missing token returns 401
- Invalid token returns 401
- Expired token returns 401
- User ID mismatch returns 403
"""

import pytest
from fastapi.testclient import TestClient

# Fixtures are auto-discovered from conftest.py:
# - api_client
# - auth_headers
# - auth_headers_user2
# - expired_auth_headers
# - invalid_auth_headers


def test_missing_token_returns_401(api_client: TestClient):
    """
    Test that API requests without Authorization header return 401.

    Endpoint: POST /api/test_user_123/tasks
    Expected: HTTP 401 Unauthorized
    Error type: "unauthorized"
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"},
    )

    assert response.status_code == 401
    data = response.json()
    assert data["error"] == "unauthorized"
    assert "message" in data


def test_invalid_token_returns_401(
    api_client: TestClient, invalid_auth_headers: dict[str, str]
):
    """
    Test that API requests with invalid JWT signature return 401.

    Endpoint: POST /api/test_user_123/tasks
    Token: Valid format but signed with wrong secret
    Expected: HTTP 401 Unauthorized
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"},
        headers=invalid_auth_headers,
    )

    assert response.status_code == 401
    data = response.json()
    assert data["error"] == "unauthorized"


def test_expired_token_returns_401(
    api_client: TestClient, expired_auth_headers: dict[str, str]
):
    """
    Test that API requests with expired JWT token return 401.

    Endpoint: POST /api/test_user_123/tasks
    Token: Expired 1 hour ago
    Expected: HTTP 401 Unauthorized
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"},
        headers=expired_auth_headers,
    )

    assert response.status_code == 401
    data = response.json()
    assert data["error"] == "unauthorized"


def test_user_id_mismatch_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that accessing another user's endpoint returns 403.

    Endpoint: POST /api/different_user_456/tasks
    Token: Valid JWT for test_user_123
    URL user_id: different_user_456 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.post(
        "/api/different_user_456/tasks",
        json={"title": "Test task"},
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"
    assert "user_id" in data["message"].lower() or "mismatch" in data["message"].lower()


def test_malformed_token_returns_401(api_client: TestClient):
    """
    Test that API requests with malformed Authorization header return 401.

    Endpoint: POST /api/test_user_123/tasks
    Token: Not a valid JWT format
    Expected: HTTP 401 Unauthorized
    """
    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"},
        headers={"Authorization": "Bearer not_a_valid_jwt_token"},
    )

    assert response.status_code == 401
    data = response.json()
    assert data["error"] == "unauthorized"


def test_missing_bearer_prefix_returns_401(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that Authorization header without 'Bearer ' prefix returns 401.

    Endpoint: POST /api/test_user_123/tasks
    Token: Valid JWT but missing "Bearer " prefix
    Expected: HTTP 401 Unauthorized
    """
    # Get a valid token from auth_headers fixture
    valid_token = auth_headers["Authorization"].replace("Bearer ", "")

    response = api_client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"},
        headers={"Authorization": valid_token},  # Missing "Bearer " prefix
    )

    assert response.status_code == 401
    data = response.json()
    assert data["error"] == "unauthorized"


def test_cross_user_list_tasks_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that listing another user's tasks returns 403.

    Endpoint: GET /api/another_user_789/tasks
    Token: Valid JWT for test_user_123
    URL user_id: another_user_789 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.get(
        "/api/another_user_789/tasks",
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"


def test_cross_user_get_task_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that getting another user's task by ID returns 403.

    Endpoint: GET /api/another_user_789/tasks/1
    Token: Valid JWT for test_user_123
    URL user_id: another_user_789 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.get(
        "/api/another_user_789/tasks/1",
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"


def test_cross_user_update_task_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that updating another user's task returns 403.

    Endpoint: PUT /api/another_user_789/tasks/1
    Token: Valid JWT for test_user_123
    URL user_id: another_user_789 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.put(
        "/api/another_user_789/tasks/1",
        json={"title": "Updated task"},
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"


def test_cross_user_toggle_task_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that toggling another user's task completion returns 403.

    Endpoint: PATCH /api/another_user_789/tasks/1/complete
    Token: Valid JWT for test_user_123
    URL user_id: another_user_789 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.patch(
        "/api/another_user_789/tasks/1/complete",
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"


def test_cross_user_delete_task_returns_403(
    api_client: TestClient, auth_headers: dict[str, str]
):
    """
    Test that deleting another user's task returns 403.

    Endpoint: DELETE /api/another_user_789/tasks/1
    Token: Valid JWT for test_user_123
    URL user_id: another_user_789 (mismatch!)
    Expected: HTTP 403 Forbidden
    """
    response = api_client.delete(
        "/api/another_user_789/tasks/1",
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "forbidden"


if __name__ == "__main__":
    pytest.main()