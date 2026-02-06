"""Custom exception classes for chatbot backend.

This module defines a hierarchy of custom exceptions for different error scenarios,
each with an associated HTTP status code for proper API responses.

Exception Hierarchy:
- ChatbotError (base class, 500)
  ├─ AgentError (agent execution failures, 500)
  ├─ MCPError (MCP tool/server issues, 502)
  └─ StorageError (database/persistence failures, 500)

All exceptions include:
- message: User-facing error description
- status_code: HTTP status code for API response
- details: Optional technical details for logging
"""

from typing import Optional


class ChatbotError(Exception):
    """Base exception for all chatbot backend errors.

    Attributes:
        message: User-facing error message
        status_code: HTTP status code (default: 500)
        details: Optional technical details for logging
    """

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[str] = None
    ):
        """Initialize chatbot error.

        Args:
            message: User-facing error message
            status_code: HTTP status code for response
            details: Optional technical details for debugging
        """
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

    def to_dict(self) -> dict:
        """Convert exception to JSON-serializable dict.

        Returns:
            Dictionary with error type, message, and optional details
        """
        error_dict = {
            "type": self.__class__.__name__,
            "message": self.message,
            "status_code": self.status_code
        }
        if self.details:
            error_dict["details"] = self.details
        return error_dict



class AgentError(ChatbotError):
    """Errors related to OpenAI agent execution.

    Raised when:
    - Agent initialization fails
    - Agent execution errors (model unavailable, rate limits, etc.)
    - Invalid agent configuration
    - Stream processing failures

    Default status code: 500 (internal server error)
    """

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[str] = None
    ):
        """Initialize agent error.

        Args:
            message: User-facing error message
            status_code: HTTP status code (default: 500)
            details: Optional technical details
        """
        super().__init__(message, status_code, details)


class MCPError(ChatbotError):
    """Errors related to MCP (Model Context Protocol) integration.

    Raised when:
    - MCP server unreachable
    - Tool execution fails
    - Invalid tool parameters
    - Authentication/authorization failures with MCP
    - Timeout waiting for MCP response

    Default status code: 502 (bad gateway) - external service failure
    """

    def __init__(
        self,
        message: str,
        status_code: int = 502,
        details: Optional[str] = None
    ):
        """Initialize MCP error.

        Args:
            message: User-facing error message
            status_code: HTTP status code (default: 502)
            details: Optional technical details
        """
        super().__init__(message, status_code, details)


class StorageError(ChatbotError):
    """Errors related to database and persistence operations.

    Raised when:
    - Database connection failures
    - Query execution errors
    - Transaction failures
    - Data validation errors
    - Storage backend unavailable

    Default status code: 500 (internal server error)
    """

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[str] = None
    ):
        """Initialize storage error.

        Args:
            message: User-facing error message
            status_code: HTTP status code (default: 500)
            details: Optional technical details
        """
        super().__init__(message, status_code, details)


class QuotaExceededError(ChatbotError):
    """Errors related to API quota/rate limit exceeded.

    Raised when:
    - OpenAI API quota exceeded
    - Rate limit hit
    - Daily/monthly usage limit reached
    - Free tier limits exceeded

    Default status code: 429 (too many requests)
    """

    def __init__(
        self,
        message: str = "API quota exceeded. Please try again later or upgrade your plan.",
        status_code: int = 429,
        details: Optional[str] = None
    ):
        """Initialize quota exceeded error.

        Args:
            message: User-facing error message (default: friendly quota message)
            status_code: HTTP status code (default: 429)
            details: Optional technical details
        """
        super().__init__(message, status_code, details)
