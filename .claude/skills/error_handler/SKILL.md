---
name: "error-handler"
description: "Centralized exception handling pattern for graceful error recovery with standardized user feedback"
---

## Context

**Active State**: Exception Handling, User Input Validation, Service Layer Integration

This subagent logic MUST be triggered whenever:
- Integrating UI handlers with service layer (business logic)
- Validating user input that could fail (type conversions, constraints)
- Performing operations that raise domain exceptions
- Implementing CRUD command handlers
- Building interactive CLI prompts with retry logic

## Requirements

### Exception Type Selection
- Service layer MUST raise `ValueError` for domain/business rule violations
- ValueError MUST include descriptive error message string
- ValueError message MUST be user-friendly (avoid stack traces, technical jargon)
- ValueError MUST be raised immediately when constraint violated (fail-fast)
- Do NOT use generic `Exception` or custom exception classes (YAGNI principle)

### Try-Except Block Structure
- Handler functions MUST wrap service layer calls in `try-except` blocks
- `try` block MUST contain ONLY the operation that can fail + immediate aftermath
- `except` clause MUST catch `ValueError` specifically (not bare `except:`)
- `except` block MUST extract error message with `str(e)`
- `except` block MUST display error using standardized formatter (`get_error_msg`)

### Error Message Display
- Errors MUST be printed to stdout (CLI convention, user sees immediately)
- Error messages MUST use `get_error_msg(str(e))` helper function
- Error messages MUST follow format: `"ERROR: {error_detail}."`
- MUST NOT re-raise exception after displaying (graceful degradation)
- MUST NOT return error codes or boolean flags (print-and-continue pattern)

### Input Validation Loop
- User input that requires type conversion MUST use `while True` retry loop
- Loop MUST attempt conversion inside `try` block
- Loop MUST catch `ValueError` from conversion failures (e.g., `int()`)
- Loop MUST display error and re-prompt on invalid input
- Loop MUST `return` valid value on successful conversion (breaks loop)
- Loop MUST NOT have explicit `break` statements (return-based termination)

### Function Signatures
- Handler functions MUST accept manager instance as parameter
- Handler functions MUST return `None` (side-effect only: print to stdout)
- Handler functions MUST have complete type hints (`manager: TodoManager -> None`)
- Helper functions (e.g., `_get_todo_id`) MUST follow same pattern

## Examples

### ✅ Good (Phase I Reference)

```python
# From src/ui/handlers.py:15-38 (Input Validation Loop)
def _get_todo_id() -> int:
    """Prompt user for todo ID with validation.

    Internal helper that re-prompts until valid integer provided.
    """
    while True:  # ✅ Retry loop for graceful error recovery
        try:
            id_str = input("Enter todo ID: ").strip()
            return int(id_str)  # ✅ Returns on success (breaks loop)
        except ValueError:  # ✅ Catches conversion failure
            print(get_error_msg("Invalid ID. Please enter a number"))
            # ✅ Loop continues, re-prompts user

# From src/ui/handlers.py:41-70 (Service Integration)
def handle_create(manager: TodoManager) -> None:
    """Handle creation of a new todo."""
    try:
        title, description = get_todo_input()  # Can raise ValueError
        todo = manager.add_todo(title, description)  # Can raise ValueError
        print(format_todo(todo))
        print(get_success_msg("Todo created"))  # ✅ Success path
    except ValueError as e:  # ✅ Catches specific exception type
        print(get_error_msg(str(e)))  # ✅ Standardized error display
        # ✅ No re-raise, graceful degradation

# From src/services/todo_manager.py:78-86 (Service Layer)
def add_todo(self, title: str, description: str = "") -> TodoItem:
    """Create a new todo item with unique ID."""
    # Validate title
    if not title or not title.strip():
        raise ValueError("Title cannot be empty.")  # ✅ Descriptive message
    if len(title) > 200:
        raise ValueError("Title exceeds maximum length of 200 characters.")
    # ... rest of implementation
```

**Why This Satisfies Constitution v1.1.0**:
- Pythonic Excellence (Principle II): Uses standard exceptions, no custom types
- Terminal-Based Verification (Principle V): Errors printed to stdout, user sees immediately
- Type Safety (Principle IV): Full type hints on handlers and helpers
- Reusable Intelligence (Principle VI): Centralized pattern applicable to all handlers

**Test Case Validation (from T069, T074, T079)**:
```
T069: Empty title input → "ERROR: Title cannot be empty." → Re-prompt → PASS
T074: Non-existent ID 999 → "ERROR: Todo with ID 999 not found.." → PASS
T079: Invalid ID "abc" → "ERROR: Invalid ID. Please enter a number." → PASS
```

### ❌ Bad (Anti-Pattern)

```python
# ANTI-PATTERN 1: Bare except clause (catches everything)
def handle_create(manager):
    try:
        todo = manager.add_todo(title, description)
        print(f"Created: {todo.title}")
    except:  # ❌ Catches ALL exceptions (even KeyboardInterrupt, SystemExit)
        print("Something went wrong")  # ❌ Non-descriptive error
```

**Architectural Risk**:
- **Masks Fatal Errors**: Catches `KeyboardInterrupt` (Ctrl+C), preventing graceful shutdown
- **Debugging Nightmare**: Hides actual exception type and stack trace
- **User Frustration**: "Something went wrong" provides no actionable information
- **Production Outages**: Swallows critical errors (database connection failure, out of memory)

```python
# ANTI-PATTERN 2: Re-raising exception (crashes application)
def handle_create(manager):
    try:
        todo = manager.add_todo(title, description)
    except ValueError as e:
        print(f"Error: {e}")
        raise  # ❌ Re-raises exception, terminates program
```

**Architectural Risk**:
- **Application Crash**: Entire CLI exits on any validation error
- **User Experience**: User loses all progress, must restart application
- **Testing Difficulty**: Cannot test error paths without catching exceptions in tests
- Violates Terminal-Based Verification (Principle V: "Clear success/failure indicators" ≠ crashes)

```python
# ANTI-PATTERN 3: Return codes instead of exceptions
def add_todo(self, title: str) -> tuple[TodoItem | None, str]:
    """Returns (todo, error_message) tuple."""
    if not title:
        return (None, "Title cannot be empty")  # ❌ Error as return value
    todo = TodoItem(id=self._next_id, title=title)
    self._todos[self._next_id] = todo
    self._next_id += 1
    return (todo, "")  # ❌ Empty string means success?

# Caller must check both values
def handle_create(manager):
    todo, error = manager.add_todo(title, description)
    if error:  # ❌ Manual error checking every call site
        print(f"Error: {error}")
    else:
        print(f"Created: {todo.title}")
```

**Architectural Risk**:
- **Caller Burden**: Every caller must remember to check error value (easy to forget)
- **Type Complexity**: `TodoItem | None` creates optional handling overhead
- **Not Pythonic**: Python uses exceptions, not error codes (Go/C pattern)
- **Testing**: Must test both return paths (success and failure) at every call site

```python
# ANTI-PATTERN 4: Logging instead of displaying errors
import logging

def handle_create(manager):
    try:
        todo = manager.add_todo(title, description)
    except ValueError as e:
        logging.error(f"Validation failed: {e}")  # ❌ Only logs, user sees nothing
        # Application continues as if nothing happened
```

**Architectural Risk**:
- **Silent Failures**: User has no idea their operation failed
- **Debug Mode Required**: User must enable logging to see errors (not discoverable)
- Violates Terminal-Based Verification (Principle V): Output MUST be visible on terminal
- **UX Nightmare**: User thinks todo was created, but it wasn't

```python
# ANTI-PATTERN 5: No retry loop for input validation
def _get_todo_id() -> int:
    id_str = input("Enter todo ID: ")
    return int(id_str)  # ❌ Crashes on non-numeric input (no try-except)

# Or with single try-except but no loop:
def _get_todo_id() -> int:
    try:
        id_str = input("Enter todo ID: ")
        return int(id_str)
    except ValueError:
        print("Invalid ID")
        return -1  # ❌ Returns invalid value instead of re-prompting
```

**Architectural Risk**:
- **Application Crash**: Uncaught `ValueError` terminates program
- **Poor UX**: User must restart application to try again
- **Sentinel Values**: Returning `-1` creates special-case handling downstream
- **No Graceful Degradation**: Single failure opportunity, no second chances

## Rationale

**Horizontal Intelligence for Phase II (Web) and Phase III (AI Chatbot)**:

### Phase II: Web Application with REST API
- **HTTP Error Responses**: `ValueError` → HTTP 400 Bad Request with JSON body
  ```json
  {
    "error": "Title cannot be empty.",
    "status": 400,
    "type": "validation_error"
  }
  ```
- **Frontend Validation**: Same `ValueError` messages displayed in form field tooltips
- **API Documentation**: OpenAPI spec lists same error messages in 400 response examples
- **Rate Limiting**: Retry logic pattern extends to API retry with exponential backoff

### Phase III: AI Chatbot Integration
- **Error Recovery Dialogue**:
  ```
  User: "Create todo with empty title"
  Bot: "I couldn't do that: Title cannot be empty. What would you like to name it?"
  ```
- **Validation Guidance**: Bot parses `ValueError` messages to provide contextual help
  - "Title exceeds 200 characters" → Bot suggests "Try a shorter title, like..."
- **Voice Interface**: Retry loop becomes "I didn't catch that, please say the ID again"
- **Multi-Turn Context**: Bot remembers partial input ("You said 'Buy groceries', now add description")

### Cross-Platform Consistency
- **Mobile App**: Same `ValueError` messages in native alert dialogs
- **GraphQL API**: Errors become `errors` array in GraphQL response
- **Webhooks**: Error payloads include same message strings for third-party integrations
- **CLI Tools**: Pattern works for `argparse` argument validation

### Engineering Benefits
- **Centralized Error Catalog**: All error messages defined in service layer (single source of truth)
- **Easy Translation (i18n)**: Extract error strings to `messages.json` for localization
- **Automated Testing**: Mock `ValueError` to test all error paths without triggering actual failures
- **Monitoring**: Count `ValueError` occurrences by message string (identify common user mistakes)
- **Documentation**: Error messages self-document constraints (no separate validation docs needed)

### Design Pattern Advantages
- **Separation of Concerns**: Service layer validates, UI layer displays (no mixing)
- **Fail-Fast**: Errors detected early (at service boundary) prevent invalid state propagation
- **Graceful Degradation**: Application continues after error (no crashes)
- **User Empowerment**: Retry loops let users self-correct without developer intervention

This pattern is **exception-safe** (no resource leaks), **testable** (mock exceptions easily), and **user-friendly** (clear error messages, retry opportunities). It forms the error handling foundation for all layers of the application stack.
