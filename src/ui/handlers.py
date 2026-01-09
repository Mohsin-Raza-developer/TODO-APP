"""Command handler functions connecting UI to TodoManager service.

This module implements handler functions for all CRUD operations on todos.
Each handler accepts a TodoManager instance, interacts with the user via
menu/display/messages modules, and handles errors gracefully with consistent
error messaging.
"""

from src.services.todo_manager import TodoManager
from src.ui.menu import get_todo_input
from src.ui.display import format_todo, format_todo_list
from src.ui.messages import SECTION_SEPARATOR, get_success_msg, get_error_msg


def _get_todo_id() -> int:
    """Prompt user for todo ID with validation.

    Internal helper function that prompts for a todo ID and validates
    that the input is a valid integer. Re-prompts on invalid input
    until a valid integer is provided.

    Returns:
        The todo ID as an integer.

    Example:
        >>> id = _get_todo_id()
        Enter todo ID: abc
        ERROR: Invalid ID. Please enter a number.
        Enter todo ID: 5
        >>> id
        5
    """
    while True:
        try:
            id_str = input("Enter todo ID: ").strip()
            return int(id_str)
        except ValueError:
            print(get_error_msg("Invalid ID. Please enter a number"))


def handle_create(manager: TodoManager) -> None:
    """Handle creation of a new todo.

    Prompts the user for todo title and description using get_todo_input,
    creates the todo via TodoManager.add_todo, and displays the created
    todo with a success message. Catches and displays validation errors
    (empty title, length violations).

    Args:
        manager: The TodoManager instance to use for todo creation.

    Returns:
        None. Prints todo details and success/error messages to stdout.

    Example:
        >>> manager = TodoManager()
        >>> handle_create(manager)
        Enter title: Buy groceries
        Enter description (press Enter to skip): Milk and eggs
        [○] 1: Buy groceries
            Milk and eggs
        SUCCESS: Todo created completed.
    """
    try:
        title, description = get_todo_input()
        todo = manager.add_todo(title, description)
        print(format_todo(todo))
        print(get_success_msg("Todo created"))
    except ValueError as e:
        print(get_error_msg(str(e)))


def handle_view(manager: TodoManager) -> None:
    """Handle viewing all todos.

    Retrieves all todos from TodoManager.get_all_todos, formats them
    using format_todo_list, and displays the list followed by a
    section separator.

    Args:
        manager: The TodoManager instance to retrieve todos from.

    Returns:
        None. Prints todo list and separator to stdout.

    Example:
        >>> manager = TodoManager()
        >>> manager.add_todo("Task 1", "")
        >>> manager.add_todo("Task 2", "Details")
        >>> handle_view(manager)
        [○] 1: Task 1
        [○] 2: Task 2
            Details
        --------------------
    """
    todos = manager.get_all_todos()
    print(format_todo_list(todos))
    print(SECTION_SEPARATOR)


def handle_toggle(manager: TodoManager) -> None:
    """Handle toggling todo completion status.

    Prompts the user for a todo ID, toggles the completion status via
    TodoManager.toggle_complete, and displays a success message. Catches
    and displays errors for non-existent IDs.

    Args:
        manager: The TodoManager instance to use for toggling completion.

    Returns:
        None. Prints success/error messages to stdout.

    Example:
        >>> manager = TodoManager()
        >>> todo = manager.add_todo("Task", "")
        >>> handle_toggle(manager)
        Enter todo ID: 1
        SUCCESS: Todo marked complete completed.

        >>> handle_toggle(manager)
        Enter todo ID: 999
        ERROR: Todo with ID 999 not found.
    """
    try:
        todo_id = _get_todo_id()
        manager.toggle_complete(todo_id)
        print(get_success_msg("Todo marked complete"))
    except ValueError as e:
        print(get_error_msg(str(e)))


def handle_update(manager: TodoManager) -> None:
    """Handle updating an existing todo.

    Prompts the user for a todo ID, then prompts for new title and
    description using get_todo_input. Updates the todo via
    TodoManager.update_todo and displays a success message. Catches
    and displays errors for non-existent IDs and validation failures.

    Args:
        manager: The TodoManager instance to use for updating.

    Returns:
        None. Prints success/error messages to stdout.

    Example:
        >>> manager = TodoManager()
        >>> manager.add_todo("Old title", "Old desc")
        >>> handle_update(manager)
        Enter todo ID: 1
        Enter title: New title
        Enter description (press Enter to skip): New desc
        SUCCESS: Todo updated completed.

        >>> handle_update(manager)
        Enter todo ID: 999
        ERROR: Todo with ID 999 not found.
    """
    try:
        todo_id = _get_todo_id()
        title, description = get_todo_input()
        manager.update_todo(todo_id, title, description)
        print(get_success_msg("Todo updated"))
    except ValueError as e:
        print(get_error_msg(str(e)))


def handle_delete(manager: TodoManager) -> None:
    """Handle deleting a todo.

    Prompts the user for a todo ID, deletes the todo via
    TodoManager.delete_todo, and displays a success message. Catches
    and displays errors for non-existent IDs.

    Args:
        manager: The TodoManager instance to use for deletion.

    Returns:
        None. Prints success/error messages to stdout.

    Example:
        >>> manager = TodoManager()
        >>> manager.add_todo("Task to delete", "")
        >>> handle_delete(manager)
        Enter todo ID: 1
        SUCCESS: Todo deleted completed.

        >>> handle_delete(manager)
        Enter todo ID: 1
        ERROR: Todo with ID 1 not found.
    """
    try:
        todo_id = _get_todo_id()
        manager.delete_todo(todo_id)
        print(get_success_msg("Todo deleted"))
    except ValueError as e:
        print(get_error_msg(str(e)))
