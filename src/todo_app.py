"""Main entry point for Todo CLI application.

This module provides the main() function that runs the interactive
command-line interface for managing todos. It initializes a TodoManager
instance, displays the application banner, and runs the main menu loop
allowing users to create, view, update, delete, and toggle completion
status of todos.
"""

from src.services.todo_manager import TodoManager
from src.ui.messages import APP_BANNER, get_error_msg
from src.ui.menu import display_menu, get_choice
from src.ui.handlers import (
    handle_create,
    handle_view,
    handle_toggle,
    handle_update,
    handle_delete,
)


def main() -> None:
    """Main application entry point running interactive menu loop.

    Initializes the TodoManager instance and displays the application
    banner, then enters an infinite loop displaying the menu, accepting
    user input, and dispatching commands to appropriate handlers.

    The loop continues until the user selects option 6 (Exit), at which
    point a goodbye message is displayed and the application terminates.

    Command dispatch:
    - "1": Create new todo
    - "2": View all todos
    - "3": Toggle todo completion status
    - "4": Update existing todo
    - "5": Delete todo
    - "6": Exit application
    - Other: Display error message

    Returns:
        None. Runs until user exits or KeyboardInterrupt.

    Example:
        >>> main()
        === TODO CLI (Phase 1) ===
        --------------------
        1. Create Todo
        2. View All Todos
        3. Mark Todo Complete
        4. Update Todo
        5. Delete Todo
        6. Exit
        --------------------
        Select an option: 1
        Enter title: Buy groceries
        ...
    """
    # Initialize TodoManager instance (single instance per ADR-002)
    manager = TodoManager()

    # Display application banner
    print(APP_BANNER)

    # Command dispatch dictionary mapping choices to handler functions
    commands = {
        "1": lambda: handle_create(manager),
        "2": lambda: handle_view(manager),
        "3": lambda: handle_toggle(manager),
        "4": lambda: handle_update(manager),
        "5": lambda: handle_delete(manager),
    }

    # Main menu loop
    while True:
        # Display menu
        display_menu()

        # Get user choice
        choice = get_choice()

        # Check for exit
        if choice == "6":
            print("Goodbye!")
            break

        # Dispatch command or show error
        if choice in commands:
            commands[choice]()
        else:
            print(get_error_msg("Invalid option. Please select 1-6"))


if __name__ == "__main__":
    main()
