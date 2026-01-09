"""Todo list formatting and display rendering for terminal output.

This module provides functions for formatting individual TodoItem instances
and collections of todos for display in the terminal. It handles status
symbols (✓ for completed, ○ for pending), line formatting, and description
indentation for a clean, readable CLI interface.
"""

from src.models.todo_item import TodoItem


def format_todo(todo: TodoItem) -> str:
    """Format a single todo item for terminal display.

    Creates a formatted string representation of a todo with:
    - Status symbol: [✓] for completed todos, [○] for pending todos
    - ID and title on the first line
    - Description (if present) on a second line with 4-space indentation

    Args:
        todo: The TodoItem instance to format.

    Returns:
        A formatted string representing the todo. If the todo has a description,
        the return value contains a newline character separating the title line
        from the indented description line.

    Example:
        >>> todo1 = TodoItem(id=1, title="Buy groceries", description="", completed=False)
        >>> print(format_todo(todo1))
        [○] 1: Buy groceries

        >>> todo2 = TodoItem(id=2, title="Write report", description="Q4 summary", completed=True)
        >>> print(format_todo(todo2))
        [✓] 2: Write report
            Q4 summary
    """
    # Determine status symbol based on completion status
    status_symbol = "✓" if todo.completed else "○"

    # Format the main line with status, ID, and title
    result = f"[{status_symbol}] {todo.id}: {todo.title}"

    # Add description on a new line with 4-space indentation if present
    if todo.description:
        result += f"\n    {todo.description}"

    return result


def format_todo_list(todos: list[TodoItem]) -> str:
    """Format a list of todos for terminal display.

    Creates a formatted string representation of multiple todos, with each
    todo separated by a newline. If the list is empty, returns a friendly
    "No todos found." message.

    Args:
        todos: A list of TodoItem instances to format. May be empty.

    Returns:
        A formatted string representing all todos separated by newlines.
        Returns "No todos found." if the list is empty.

    Example:
        >>> # Empty list case
        >>> format_todo_list([])
        'No todos found.'

        >>> # Multiple todos case
        >>> todo1 = TodoItem(id=1, title="Task 1", description="", completed=False)
        >>> todo2 = TodoItem(id=2, title="Task 2", description="Details", completed=True)
        >>> print(format_todo_list([todo1, todo2]))
        [○] 1: Task 1
        [✓] 2: Task 2
            Details
    """
    # Handle empty list case
    if not todos:
        return "No todos found."

    # Format each todo and join with newlines
    formatted_todos = [format_todo(todo) for todo in todos]
    return "\n".join(formatted_todos)
