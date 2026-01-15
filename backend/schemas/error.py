"""
Standardized error response schema for the Todo REST API.

This module provides a consistent error format across all endpoints,
inspired by RFC 7807 Problem Details specification.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ErrorResponse(BaseModel):
    """
    Standardized error response format (RFC 7807-inspired).

    HTTP Status Codes:
        - 400: Validation error, bad request
        - 401: Unauthorized (missing/invalid/expired token)
        - 403: Forbidden (user_id mismatch)
        - 404: Not found (task doesn't exist or belongs to another user)
        - 500: Internal server error

    Example Responses:
        400 Bad Request (validation error):
        {
            "error": "validation_error",
            "message": "Title is required",
            "details": {
                "field": "title",
                "constraint": "required"
            }
        }

        401 Unauthorized (expired token):
        {
            "error": "unauthorized",
            "message": "Token expired"
        }

        403 Forbidden (user_id mismatch):
        {
            "error": "forbidden",
            "message": "User ID mismatch"
        }

        404 Not Found (task not found or belongs to another user):
        {
            "error": "not_found",
            "message": "Task not found"
        }

        500 Internal Server Error:
        {
            "error": "internal_server_error",
            "message": "An unexpected error occurred"
        }

    Attributes:
        error: Error type/code (e.g., "validation_error", "unauthorized")
        message: Human-readable error message for client display
        details: Optional additional context (e.g., validation field details)
    """

    error: str = Field(description="Error type/code")
    message: str = Field(description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(
        default=None, description="Optional additional context"
    )
