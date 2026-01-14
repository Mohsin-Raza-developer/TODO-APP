---
name: "ux-logic-anchor"
description: "Standardized visual feedback patterns for CLI applications ensuring consistent user communication"
---

## Context

**Active State**: UI Rendering, User Feedback, Terminal Output

This subagent logic MUST be triggered whenever:
- Displaying operation outcomes (success/failure)
- Rendering application branding or section boundaries
- Showing entity status (completed/pending, active/inactive)
- Providing user feedback after state changes
- Formatting lists or collections for terminal display

## Requirements

### Message Formatting Standards
- Success messages MUST follow format: `"SUCCESS: {action_name} completed."`
- Error messages MUST follow format: `"ERROR: {error_detail}."`
- Action names in success messages MUST be past tense or noun form
- Error details MUST be clear, actionable descriptions
- Messages MUST NOT contain emoji or special characters (except status symbols)
- Messages MUST terminate with period for grammatical consistency

### Visual Constants
- Application banner MUST be defined as module-level constant
- Section separators MUST be defined as module-level constant (minimum 20 characters)
- Banner format MUST be: `"=== {APP_NAME} ({VERSION_PHASE}) ==="`
- Separator MUST use consistent character (dash recommended: `"--------------------"`)
- Constants MUST be typed as `str` with explicit type hints

### Status Symbols
- Completed/True states MUST use checkmark symbol: `✓`
- Pending/False states MUST use circle symbol: `○`
- Status symbols MUST be enclosed in square brackets: `[✓]`, `[○]`
- Status symbol MUST precede entity identifier (e.g., `[✓] 1: Task name`)
- Symbol choice MUST be binary (exactly two states, no intermediates)

### Indentation and Spacing
- Supplementary information (descriptions, details) MUST use 4-space indentation
- Indented content MUST appear on new line after primary content
- No tabs allowed (spaces only per PEP 8)
- Blank lines between logical sections (separator serves this purpose)

### Helper Function Signature
- Success/error formatters MUST accept string parameter
- Success/error formatters MUST return string
- Formatters MUST have complete type hints (`str -> str`)
- Formatters MUST be pure functions (no side effects, no state mutation)

## Examples

### ✅ Good (Phase I Reference)

```python
# From src/ui/messages.py:11-13, 16-38, 41-63
# Application visual layout constants
APP_BANNER: str = "=== TODO CLI (Phase 1) ==="
SECTION_SEPARATOR: str = "--------------------"

def get_success_msg(action_name: str) -> str:
    """Format a standardized success message.

    Returns:
        A formatted success message string in the format:
        "SUCCESS: [action_name] completed."
    """
    return f"SUCCESS: {action_name} completed."

def get_error_msg(error_detail: str) -> str:
    """Format a standardized error message.

    Returns:
        A formatted error message string in the format:
        "ERROR: [error_detail]."
    """
    return f"ERROR: {error_detail}."

# Usage from src/ui/handlers.py:64-70
try:
    title, description = get_todo_input()
    todo = manager.add_todo(title, description)
    print(format_todo(todo))
    print(get_success_msg("Todo created"))  # ✅ Standardized format
except ValueError as e:
    print(get_error_msg(str(e)))  # ✅ Standardized format
```

```python
# From src/ui/display.py:12-48
def format_todo(todo: TodoItem) -> str:
    """Format a single todo item for terminal display.

    Creates a formatted string representation with:
    - Status symbol: [✓] for completed, [○] for pending
    - ID and title on first line
    - Description (if present) on second line with 4-space indentation
    """
    # Determine status symbol based on completion status
    status_symbol = "✓" if todo.completed else "○"

    # Format the main line with status, ID, and title
    result = f"[{status_symbol}] {todo.id}: {todo.title}"

    # Add description on a new line with 4-space indentation if present
    if todo.description:
        result += f"\n    {todo.description}"  # ✅ 4-space indent

    return result
```

**Why This Satisfies Constitution v1.1.0**:
- Terminal-Based Verification (Principle V): Clear visual feedback via stdout
- Pythonic Excellence (Principle II): PEP 8 compliant (no tabs, consistent naming)
- Type Safety (Principle IV): Full type hints on all formatters
- Reusable Intelligence (Principle VI): Portable pattern across CLI/TUI/logging

**Test Case Validation (from T083-T086)**:
```
T083: Banner displays "=== TODO CLI (Phase 1) ===" on startup → PASS
T084: Separator "--------------------" (20 dashes) displays correctly → PASS
T085: All success messages follow "SUCCESS: [action] completed." → PASS
T086: All error messages follow "ERROR: [message]." → PASS
```

### ❌ Bad (Anti-Pattern)

```python
# ANTI-PATTERN 1: Inconsistent message formats
def handle_create(manager):
    try:
        todo = manager.add_todo(title, description)
        print("✅ Todo added!")  # ❌ Emoji, no standard prefix
    except ValueError as e:
        print(f"Oops! {e}")  # ❌ Informal tone, no ERROR prefix

def handle_delete(manager):
    try:
        manager.delete_todo(id)
        print("DELETED SUCCESSFULLY")  # ❌ All caps, different format
    except ValueError as e:
        print(f"Error: {e}")  # ❌ Capitalization differs from others
```

**Architectural Risk**:
- **User Confusion**: Unpredictable output format makes scanning difficult
- **Accessibility**: Screen readers struggle with emoji and inconsistent casing
- **Greppability**: Cannot `grep "SUCCESS:"` to find all successful operations in logs
- **Professionalism**: Informal tone ("Oops!") inappropriate for production tools

```python
# ANTI-PATTERN 2: Hard-coded strings everywhere
def display_header():
    print("=== TODO CLI (Phase 1) ===")  # ❌ Magic string

def display_menu():
    print("--------------------")  # ❌ Magic string
    # ... menu items
    print("--------------------")  # ❌ Duplicate magic string

def handle_create(manager):
    print("[✓] Todo created")  # ❌ Hard-coded status symbol
```

**Architectural Risk**:
- **Maintainability**: Changing banner requires finding/replacing all occurrences
- **Consistency**: Developer forgets to update one instance → mixed formats
- **Testing**: Cannot mock constants, harder to test visual output
- **Rebranding**: Updating "Phase 1" to "v2.0" requires codebase-wide search

```python
# ANTI-PATTERN 3: Tabs instead of spaces for indentation
def format_todo(todo):
    result = f"[{symbol}] {todo.id}: {todo.title}"
    if todo.description:
        result += f"\n\t{todo.description}"  # ❌ Tab character
    return result
```

**Architectural Risk**:
- Violates PEP 8 (Python style guide mandates spaces, not tabs)
- Renders inconsistently across terminals (tab width varies)
- Git diffs show whitespace conflicts
- Breaks Python 3.13+ linters (ruff/black will flag as error)

```python
# ANTI-PATTERN 4: Stateful formatters (side effects)
last_message = None  # ❌ Global state

def get_success_msg(action_name: str) -> str:
    global last_message
    msg = f"SUCCESS: {action_name}"
    last_message = msg  # ❌ Mutates global state
    return msg
```

**Architectural Risk**:
- Violates functional programming principles (formatters should be pure)
- Creates hidden dependencies (other code relies on `last_message`)
- Testing becomes order-dependent (tests affect each other via shared state)
- Concurrency hazards (race conditions in threaded environments)

## Rationale

**Horizontal Intelligence for Phase II (Web) and Phase III (AI Chatbot)**:

### Phase II: Web Application with REST API
- **HTTP Status Codes**: `"SUCCESS:"` → HTTP 200/201, `"ERROR:"` → HTTP 400/404/500
- **JSON Response Bodies**:
  ```json
  {
    "status": "success",
    "message": "Todo created completed.",
    "data": { "id": 1, "title": "...", "completed": false }
  }
  ```
- **Frontend Toast Notifications**: Same message strings reused in web UI alerts
- **CSS Classes**: `.status-completed` (✓) and `.status-pending` (○) map directly
- **Server Logs**: Structured logging maintains `SUCCESS:`/`ERROR:` prefixes for grep

### Phase III: AI Chatbot Integration
- **Natural Language Generation**: Bot says "Success! Todo created completed." using same string
- **Sentiment Analysis**: `SUCCESS:` prefix triggers positive response tone
- **Error Recovery**: Bot parses `ERROR: Title cannot be empty.` to suggest "Would you like to try again?"
- **Voice Output**: TTS systems pronounce "[✓]" as "completed" and "[○]" as "pending"
- **Visual Accessibility**: Screen readers announce "checkmark" and "circle" symbols

### Cross-Platform Consistency
- **Mobile App**: Same status symbols (✓/○) in native iOS/Android UI
- **Desktop GUI**: Banner text becomes window title bar
- **Email Notifications**: "SUCCESS: Todo marked complete completed." in email body
- **Slack/Teams Bots**: Separator `--------------------` formats message sections

### Engineering Benefits
- **Log Parsing**: `grep "^ERROR:"` extracts all failures, `grep "^SUCCESS:"` extracts successes
- **Monitoring/Alerting**: Prometheus/Grafana count `ERROR:` occurrences for SLA tracking
- **User Training**: Consistent format reduces cognitive load (users learn once, apply everywhere)
- **Internationalization (i18n)**: Replace constants with locale-specific strings in one place
- **Brand Evolution**: Update `APP_BANNER` constant when transitioning Phase 1 → Phase 2

This pattern is **language-agnostic** (works in Python, Node.js, Rust), **testable** (pure functions), and **accessible** (screen reader friendly). It serves as the UX foundation for all user-facing output.
