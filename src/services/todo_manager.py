"""TodoManager service for CRUD operations on in-memory todo items.

This module implements the TodoManager class which provides business logic
for managing todo items, including creation, retrieval, updates, deletion,
and completion status toggling. All data is stored in memory using a
dictionary for O(1) lookup performance.

Design decisions documented in:
- ADR-001: Todo Storage - TodoItem Dataclass with Dictionary Index
- ADR-003: Global ID Counter - Encapsulated in TodoManager Class
"""

from typing import Optional
from src.models.todo_item import TodoItem


class TodoManager:
    """Manages todo list state and CRUD operations.

    This class encapsulates the in-memory todo list and ID counter,
    providing methods for creating, reading, updating, and deleting
    todo items. The ID counter ensures unique, sequential IDs that
    never reset or reuse deleted IDs.

    Attributes:
        _todos: Private dictionary mapping todo IDs to TodoItem instances.
            Provides O(1) lookup performance.
        _next_id: Private counter for generating unique sequential IDs.
            Starts at 1 and increments with each new todo. Never resets.

    Example:
        >>> manager = TodoManager()
        >>> todo = manager.add_todo("Buy groceries", "Milk, eggs")
        >>> todo.id
        1
        >>> all_todos = manager.get_all_todos()
        >>> len(all_todos)
        1
    """

    def __init__(self) -> None:
        """Initialize empty todo list and ID counter.

        The todo dictionary starts empty and the ID counter starts at 1,
        ensuring the first todo created will have ID 1.
        """
        self._todos: dict[int, TodoItem] = {}
        self._next_id: int = 1

    def add_todo(self, title: str, description: str = "") -> TodoItem:
        """Create a new todo item with unique ID.

        Validates the title is non-empty, creates a new TodoItem with
        the current ID counter value, stores it in the dictionary, and
        increments the counter. The ID counter never resets, ensuring
        deleted IDs are never reused.

        Args:
            title: Todo title (must be non-empty string, max 200 characters).
            description: Optional todo description (max 1000 characters).
                Defaults to empty string.

        Returns:
            The newly created TodoItem with assigned ID and completed=False.

        Raises:
            ValueError: If title is empty or exceeds 200 characters.
            ValueError: If description exceeds 1000 characters.

        Example:
            >>> manager = TodoManager()
            >>> todo = manager.add_todo("Buy groceries", "Milk, eggs, bread")
            >>> todo.id
            1
            >>> todo.completed
            False
        """
        # Validate title
        if not title or not title.strip():
            raise ValueError("Title cannot be empty.")
        if len(title) > 200:
            raise ValueError("Title exceeds maximum length of 200 characters.")

        # Validate description
        if len(description) > 1000:
            raise ValueError("Description exceeds maximum length of 1000 characters.")

        # Create new todo with current ID
        todo = TodoItem(
            id=self._next_id,
            title=title.strip(),
            description=description.strip(),
            completed=False,
        )

        # Store and increment ID counter
        self._todos[self._next_id] = todo
        self._next_id += 1

        return todo

    def get_all_todos(self) -> list[TodoItem]:
        """Return list of all todos sorted by ID.

        Returns a list of all TodoItem instances in the manager,
        sorted by ID in ascending order (1, 2, 3, ...). Returns
        an empty list if no todos exist.

        Returns:
            List of TodoItem instances sorted by ID ascending.
            Empty list if no todos exist.

        Example:
            >>> manager = TodoManager()
            >>> manager.add_todo("Task 1", "")
            >>> manager.add_todo("Task 2", "")
            >>> todos = manager.get_all_todos()
            >>> len(todos)
            2
            >>> todos[0].id < todos[1].id
            True
        """
        return sorted(self._todos.values(), key=lambda t: t.id)

    def get_todo(self, todo_id: int) -> TodoItem:
        """Retrieve a specific todo by ID.

        Looks up the todo with the given ID in the internal dictionary.
        Raises ValueError if the ID doesn't exist.

        Args:
            todo_id: The unique ID of the todo to retrieve.

        Returns:
            The TodoItem instance with the specified ID.

        Raises:
            ValueError: If no todo exists with the given ID.

        Example:
            >>> manager = TodoManager()
            >>> todo = manager.add_todo("Task", "")
            >>> retrieved = manager.get_todo(todo.id)
            >>> retrieved.title
            'Task'
        """
        if todo_id not in self._todos:
            raise ValueError(f"Todo with ID {todo_id} not found.")
        return self._todos[todo_id]

    def update_todo(
        self,
        todo_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> TodoItem:
        """Update title and/or description of an existing todo.

        Updates the specified fields of the todo with the given ID.
        Only fields provided (not None) are updated. The ID and
        completed status are never changed by this method.

        Args:
            todo_id: The unique ID of the todo to update.
            title: New title (if provided, must be non-empty, max 200 chars).
                If None, title is not updated.
            description: New description (if provided, max 1000 chars).
                If None, description is not updated.

        Returns:
            The updated TodoItem instance.

        Raises:
            ValueError: If todo with given ID doesn't exist.
            ValueError: If title is provided but empty or exceeds 200 characters.
            ValueError: If description exceeds 1000 characters.

        Example:
            >>> manager = TodoManager()
            >>> todo = manager.add_todo("Old title", "Old desc")
            >>> updated = manager.update_todo(todo.id, title="New title")
            >>> updated.title
            'New title'
            >>> updated.description
            'Old desc'
        """
        # Validate todo exists
        todo = self.get_todo(todo_id)

        # Validate and update title if provided
        if title is not None:
            if not title or not title.strip():
                raise ValueError("Title cannot be empty.")
            if len(title) > 200:
                raise ValueError("Title exceeds maximum length of 200 characters.")
            todo.title = title.strip()

        # Validate and update description if provided
        if description is not None:
            if len(description) > 1000:
                raise ValueError(
                    "Description exceeds maximum length of 1000 characters."
                )
            todo.description = description.strip()

        return todo

    def delete_todo(self, todo_id: int) -> bool:
        """Delete a todo by ID.

        Removes the todo with the given ID from the internal dictionary.
        The ID counter is NOT decremented, ensuring deleted IDs are
        never reused.

        Args:
            todo_id: The unique ID of the todo to delete.

        Returns:
            True if the todo was successfully deleted.

        Raises:
            ValueError: If no todo exists with the given ID.

        Example:
            >>> manager = TodoManager()
            >>> todo1 = manager.add_todo("Task 1", "")
            >>> todo2 = manager.add_todo("Task 2", "")
            >>> manager.delete_todo(todo1.id)
            True
            >>> todo3 = manager.add_todo("Task 3", "")
            >>> todo3.id  # ID 3, not reusing deleted ID 1
            3
        """
        # Validate todo exists (raises ValueError if not)
        self.get_todo(todo_id)

        # Remove from dictionary
        del self._todos[todo_id]

        return True

    def toggle_complete(self, todo_id: int) -> TodoItem:
        """Toggle the completion status of a todo.

        Flips the completed boolean from False to True or True to False.
        This operation is idempotent - calling it twice returns the todo
        to its original state.

        Args:
            todo_id: The unique ID of the todo to toggle.

        Returns:
            The updated TodoItem with toggled completed status.

        Raises:
            ValueError: If no todo exists with the given ID.

        Example:
            >>> manager = TodoManager()
            >>> todo = manager.add_todo("Task", "")
            >>> todo.completed
            False
            >>> updated = manager.toggle_complete(todo.id)
            >>> updated.completed
            True
            >>> updated = manager.toggle_complete(todo.id)
            >>> updated.completed
            False
        """
        todo = self.get_todo(todo_id)
        todo.completed = not todo.completed
        return todo
