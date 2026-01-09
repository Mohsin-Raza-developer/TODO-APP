"""Standardized message formatting for CLI feedback.

This module provides constants and helper functions for consistent
formatting of application banners, separators, success messages, and
error messages displayed to the user in the terminal interface.

All messages follow a standardized format to ensure clear and
predictable user feedback throughout the application.
"""

# Application visual layout constants
APP_BANNER: str = "=== TODO CLI (Phase 1) ==="
SECTION_SEPARATOR: str = "--------------------"


def get_success_msg(action_name: str) -> str:
    """Format a standardized success message.

    Creates a consistent success message indicating that an action
    has completed successfully. Used to provide positive feedback
    to users after operations like creating, updating, or deleting todos.

    Args:
        action_name: The name or description of the action that succeeded.
            Should be a concise description in past tense or noun form
            (e.g., "Todo created", "Update", "Deletion").

    Returns:
        A formatted success message string in the format:
        "SUCCESS: [action_name] completed."

    Example:
        >>> get_success_msg("Todo created")
        'SUCCESS: Todo created completed.'
        >>> get_success_msg("Update")
        'SUCCESS: Update completed.'
    """
    return f"SUCCESS: {action_name} completed."


def get_error_msg(error_detail: str) -> str:
    """Format a standardized error message.

    Creates a consistent error message explaining what went wrong.
    Used to provide clear feedback when operations fail due to
    validation errors, missing resources, or other issues.

    Args:
        error_detail: A description of the error that occurred.
            Should be a clear, concise explanation of the problem
            (e.g., "Title cannot be empty", "Todo with ID 5 not found").

    Returns:
        A formatted error message string in the format:
        "ERROR: [error_detail]."

    Example:
        >>> get_error_msg("Title cannot be empty")
        'ERROR: Title cannot be empty.'
        >>> get_error_msg("Todo with ID 5 not found")
        'ERROR: Todo with ID 5 not found.'
    """
    return f"ERROR: {error_detail}."
