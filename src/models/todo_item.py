"""TodoItem data model for in-memory todo storage.

This module defines the TodoItem dataclass representing a single todo item
with unique ID, title, description, and completion status.
"""

from dataclasses import dataclass, field


@dataclass
class TodoItem:
    """Represents a single todo item with title, description, and completion status.

    This dataclass provides a type-safe representation of a todo item stored
    in memory. Each todo has a unique integer ID assigned by the TodoManager,
    a mandatory title, an optional description, and a completion status flag.

    Attributes:
        id: Unique integer identifier (never reused, assigned by TodoManager).
            Sequential integers starting from 1.
        title: Short task description (1-200 characters, non-empty).
            Validated by TodoManager before creation.
        description: Optional detailed task information (0-1000 characters).
            Empty string allowed for todos without additional details.
        completed: Completion status flag. Defaults to False (not completed).
            Set to True when user marks todo as complete.

    Example:
        >>> todo = TodoItem(id=1, title="Buy groceries", description="Milk, eggs", completed=False)
        >>> todo.id
        1
        >>> todo.title
        'Buy groceries'
        >>> todo.completed
        False
    """

    id: int
    title: str
    description: str
    completed: bool = field(default=False)
