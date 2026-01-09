"""Menu display and user input handling for the Todo CLI.

This module provides functions for displaying the main menu, capturing
user input for menu selections, and handling sequential prompts for
todo creation with validation. All input functions strip whitespace
and validate according to application requirements.
"""

from src.ui.messages import SECTION_SEPARATOR, get_error_msg


def display_menu() -> None:
    """Display the main menu with numbered options.

    Prints the application menu with six numbered options surrounded by
    section separators. The menu provides options for all CRUD operations
    plus an exit option.

    The menu format is:
    - Section separator line
    - Six numbered menu options (1-6)
    - Section separator line

    Returns:
        None. Prints directly to stdout.

    Example:
        >>> display_menu()
        --------------------
        1. Create Todo
        2. View All Todos
        3. Mark Todo Complete
        4. Update Todo
        5. Delete Todo
        6. Exit
        --------------------
    """
    print(SECTION_SEPARATOR)
    print("1. Create Todo")
    print("2. View All Todos")
    print("3. Mark Todo Complete")
    print("4. Update Todo")
    print("5. Delete Todo")
    print("6. Exit")
    print(SECTION_SEPARATOR)


def get_choice() -> str:
    """Prompt user for menu selection and return input.

    Displays a prompt asking the user to select a menu option and
    returns the user's input with leading/trailing whitespace removed.
    No validation is performed - the caller is responsible for checking
    if the choice is valid.

    Returns:
        The user's input string with whitespace stripped.

    Example:
        >>> choice = get_choice()  # User types "1"
        Select an option: 1
        >>> choice
        '1'
    """
    return input("Select an option: ").strip()


def get_todo_input() -> tuple[str, str]:
    """Prompt user for todo title and description with validation.

    Implements sequential prompts following the specification:
    1. Prompts for title (mandatory) - validates non-empty and re-prompts
       until valid input is provided
    2. Prompts for description (optional) - accepts empty string

    Title validation shows error message using get_error_msg and loops
    until a non-empty title is provided.

    Returns:
        A tuple containing (title, description) where both are strings
        with whitespace stripped. Title is guaranteed non-empty,
        description may be empty.

    Example:
        >>> title, desc = get_todo_input()
        Enter title:
        ERROR: Title cannot be empty.
        Enter title: Buy groceries
        Enter description (press Enter to skip): Milk and eggs
        >>> title
        'Buy groceries'
        >>> desc
        'Milk and eggs'

        >>> title, desc = get_todo_input()
        Enter title: Write report
        Enter description (press Enter to skip):
        >>> title
        'Write report'
        >>> desc
        ''
    """
    # Prompt for title with validation loop
    while True:
        title = input("Enter title: ").strip()
        if title:
            break
        # Show error and re-prompt if empty
        print(get_error_msg("Title cannot be empty"))

    # Prompt for description (optional - empty allowed)
    description = input("Enter description (press Enter to skip): ").strip()

    return title, description
