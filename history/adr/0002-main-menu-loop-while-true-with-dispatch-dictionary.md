# ADR-0002: Main Menu Loop - While-True with Dispatch Dictionary

> **Scope**: This decision clusters the main loop structure (while vs recursion) with the command dispatch mechanism (dictionary vs if-elif), as they work together to provide the interactive menu experience.

- **Status:** Accepted
- **Date:** 2026-01-08
- **Feature:** 001-basic-crud
- **Context:** The CLI application requires an interactive menu that repeatedly displays options, accepts user input, executes the selected operation, and returns to the menu. The loop must run indefinitely until the user selects Exit, handle invalid input gracefully, and dispatch commands efficiently to their respective handlers.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Yes - Defines the core application control flow and user interaction pattern
     2) Alternatives: Yes - Considered 4 viable approaches with different tradeoffs
     3) Scope: Yes - Cross-cutting concern that affects main application, menu handling, and command execution
-->

## Decision

Use `while True` loop with dictionary-based command dispatch for menu handling and command execution.

**Components:**
- **Loop Structure:** Infinite `while True` loop with explicit `break` on Exit command
- **Command Dispatch:** Dictionary mapping menu choices to handler functions (`dict[str, Callable[[], None]]`)
- **Input Handling:** Simple `input().strip()` for menu selection
- **Exit Strategy:** Break statement when user selects option "6"
- **Error Handling:** Check if choice exists in dictionary, show error for invalid options

## Consequences

### Positive

- **O(1) Command Dispatch:** Dictionary lookup provides constant-time command execution regardless of number of menu options
- **Easy Extensibility:** Adding new menu options requires only adding a key-value pair to the dispatch dictionary
- **Clean Separation:** Clear boundaries between menu display, input collection, and command execution
- **Simple Exit Handling:** Explicit `break` statement provides clear termination condition
- **No Stack Overflow Risk:** Unlike recursion, loop depth is constant regardless of session duration
- **Testability:** Each handler can be tested independently without mocking the entire loop
- **Readability:** Intent is immediately clear to developers familiar with command patterns

### Negative

- **Function Reference Overhead:** Requires storing function references in dictionary (minor cognitive load)
- **Closure/Lambda Requirement:** Cannot pass arguments directly; must use lambdas to pass `manager` instance to handlers
- **Less Pythonic Than Generator:** Some Python developers prefer generator-based coroutines for state machines (overkill for this use case)

## Alternatives Considered

### Alternative A: While-True with If-Elif Chain
- **Structure:** `while True` loop with `if choice == "1": ... elif choice == "2": ...` chain
- **Why Rejected:**
  - O(n) dispatch time (checks each condition sequentially)
  - Less extensible (must modify chain for new options)
  - More verbose (repeated if/elif/else boilerplate)
  - Harder to refactor (commands coupled to control flow)

### Alternative B: Recursive Function Calls
- **Structure:** Each handler recursively calls `main_menu()` at the end
- **Why Rejected:**
  - Stack overflow risk for long sessions (each operation adds stack frame)
  - Complex exit handling (must propagate returns up call stack)
  - Confusing control flow (harder to reason about program state)
  - Python doesn't optimize tail recursion

### Alternative C: State Machine with Enum States
- **Structure:** Enum states (MENU, CREATE, VIEW, etc.) with transition logic
- **Why Rejected:**
  - Over-engineered for simple menu (adds complexity without benefit)
  - Requires explicit state transitions for every action
  - More boilerplate code (state classes, transition validators)
  - Harder to understand for straightforward menu flow

## References

- Feature Spec: [specs/001-basic-crud/spec.md](../../specs/001-basic-crud/spec.md)
- Implementation Plan: [specs/001-basic-crud/plan.md](../../specs/001-basic-crud/plan.md) (ADR-002 section, lines 207-272)
- Related ADRs:
  - ADR-0001: Todo Storage (menu dispatches to handlers that use TodoManager)
  - ADR-0003: Global ID Counter (handlers modify counter through TodoManager)
- Evaluator Evidence: N/A (planning phase, no graders run yet)
