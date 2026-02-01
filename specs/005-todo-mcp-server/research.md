# Research: MCP Server Implementation

**Feature**: 005-todo-mcp-server
**Date**: 2026-01-26
**Phase**: 0 (Research & Technology Selection)

## Purpose

Research and validate technology choices for implementing a standalone MCP (Model Context Protocol) server that exposes 5 task management tools for AI agents, delegating all operations to the existing FastAPI backend.

## Research Questions

### 1. MCP SDK Selection

**Question**: Which Python MCP SDK should we use for server implementation?

**Decision**: Use official `mcp` library from https://modelcontextprotocol.io/

**Rationale**:
- Official Python SDK for Model Context Protocol from authoritative source
- Provides `FastMCP` class from `mcp.server.fastmcp` with simple `@mcp.tool()` decorator pattern
- Built-in support for multiple transport options (stdio, streamable-http, SSE)
- Type-safe tool definitions using Python type hints
- Production-ready features from official MCP specification (Score: 89.2, High reputation)
- Active maintenance and comprehensive documentation at modelcontextprotocol.io
- Authoritative implementation aligned with MCP standard
- Simple API: just decorate functions with `@mcp.tool()` for automatic tool registration

**Alternatives Considered**:
- Third-party wrappers: Risk of outdated or non-standard implementations
- Custom MCP implementation: Reinventing the wheel, higher maintenance burden
- LangChain integration: Overkill for our use case (we only need server, not agent)

**Installation**: `uv add mcp`

**Usage Pattern**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-mcp-server")

@mcp.tool()
def add_task(user_id: str, title: str, description: str | None = None) -> dict:
    """Add a new task for the user."""
    # Implementation here
    return {"id": 1, "title": title, ...}

if __name__ == "__main__":
    mcp.run()  # Defaults to stdio transport
```

---

### 2. HTTP Client Library

**Question**: Which HTTP client library should we use for making requests to the backend API?

**Decision**: Use `httpx` (async HTTP client)

**Rationale**:
- Fully async/await compatible (required for `@mcp.tool()` async functions)
- Modern API similar to `requests` but with async support
- Built-in connection pooling for performance
- Excellent error handling with specific exception types
- Type hints support for better IDE integration
- Well-maintained and widely adopted in async Python ecosystem

**Alternatives Considered**:
- `aiohttp`: More complex API, requires explicit session management
- `requests`: Synchronous only, would block MCP server event loop
- `urllib`: Too low-level, lacks convenient error handling

**Installation**: `uv add httpx`

**Usage Pattern**:
```python
import httpx

async with httpx.AsyncClient(base_url=BACKEND_API_URL) as client:
    response = await client.post(f"/api/{user_id}/tasks", json={"title": "..."})
    response.raise_for_status()  # Raises for 4xx/5xx
    return response.json()
```

---

### 3. Environment Configuration

**Question**: How should we manage environment variables for the MCP server?

**Decision**: Use `python-dotenv` for `.env` file loading

**Rationale**:
- Simple, standard pattern in Python ecosystem
- Allows local development with `.env` file
- Production deployment can use real environment variables
- No additional complexity compared to manual `os.getenv()`
- Already used in existing backend (`/mnt/d/github.com/TODO-APP/backend/config.py`)

**Installation**: `uv add python-dotenv`

**Required Environment Variables**:
- `BACKEND_API_URL`: Base URL for backend API (default: `http://localhost:8000`)
- `MCP_SERVER_PORT`: Port for MCP server (default: `8080`)
- `MCP_DEBUG`: Enable debug mode (default: `false`)

---

### 4. Error Handling Pattern

**Question**: How should we handle HTTP errors from the backend API and transform them into MCP tool responses?

**Decision**: Try-except blocks with `httpx.HTTPStatusError` and custom error mapping

**Rationale**:
- Constitutional requirement (Principle VII): All tools MUST use try-except for HTTP operations
- Backend API returns structured `ErrorResponse` format: `{"error": "type", "message": "detail"}`
- MCP tools should return user-friendly error messages to AI agents
- Network errors (connection refused, timeout) need separate handling from HTTP errors

**Pattern**:
```python
from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("todo-mcp-server")

@mcp.tool()
async def add_task(user_id: str, title: str, description: str | None = None) -> dict:
    """Add a new task for the user."""
    try:
        async with httpx.AsyncClient(base_url=BACKEND_API_URL) as client:
            response = await client.post(
                f"/api/{user_id}/tasks",
                json={"title": title, "description": description},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as e:
        # Parse backend ErrorResponse
        if e.response.status_code == 404:
            raise ValueError("Task not found")
        elif e.response.status_code == 400:
            error_data = e.response.json()
            raise ValueError(f"Validation error: {error_data.get('message', 'Invalid request')}")
        elif e.response.status_code == 401:
            raise ValueError("Authentication required")
        else:
            raise ValueError(f"Backend error: {e.response.status_code}")

    except httpx.RequestError as e:
        # Network/connection errors
        raise ValueError(f"Cannot connect to backend API: {str(e)}")
```

---

### 5. Tool Response Format

**Question**: What format should MCP tools return to AI agents?

**Decision**: Return backend API responses directly (JSON dictionaries)

**Rationale**:
- Backend API already returns well-structured JSON responses
- Task objects from backend match MCP tool requirements
- No transformation needed (simple pass-through)
- AI agents can parse the JSON structure naturally

**Backend Response Formats** (from `/mnt/d/github.com/TODO-APP/backend/api/tasks.py`):
```python
# add_task → 201 Created
{
    "id": 1,
    "user_id": "user123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-26T10:30:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
}

# list_tasks → 200 OK
[
    {"id": 1, "user_id": "user123", "title": "...", ...},
    {"id": 2, "user_id": "user123", "title": "...", ...}
]

# complete_task, update_task → 200 OK (full task object)
# delete_task → 204 No Content (no body)
```

---

### 6. Project Structure

**Question**: How should we organize the MCP server codebase?

**Decision**: Standalone Python package at `/mnt/d/todo-mcp-server/` with UV package manager

**Rationale**:
- Constitutional requirement (NFR-001): Independent deployment at `/mnt/d/todo-mcp-server/`
- Separate from main app to avoid coupling
- UV package manager for fast, modern dependency management
- Simple structure: single `server.py` file for MVP, can expand if needed

**Directory Structure**:
```
/mnt/d/todo-mcp-server/
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Template for environment setup
├── .gitignore              # Ignore .env, __pycache__, etc.
├── README.md               # Setup and usage instructions
├── pyproject.toml          # UV project configuration
├── uv.lock                 # Locked dependencies
├── server.py               # Main MCP server with 5 tools
└── tests/
    ├── __init__.py
    ├── test_tools.py       # Unit tests for MCP tools
    └── test_integration.py # Integration tests with backend API
```

---

### 7. Testing Strategy

**Question**: How should we test the MCP server independently?

**Decision**: Unit tests + integration tests with backend API running

**Rationale**:
- Unit tests: Mock `httpx` client to test error handling logic
- Integration tests: Real HTTP calls to backend API (requires backend running)
- Constitutional requirement (NFR-006): "MCP server MUST be testable" with backend API dependency
- Use `pytest` + `pytest-asyncio` for async test support

**Test Coverage Requirements**:
- All 5 MCP tools have unit tests
- HTTP error scenarios (400, 401, 404, 500) tested
- Network error scenarios (connection refused, timeout) tested
- Integration tests verify end-to-end workflow (create → list → complete → delete)

**Installation**: `uv add --dev pytest pytest-asyncio pytest-httpx`

---

### 8. Type Safety

**Question**: How do we ensure type safety for MCP tool parameters and return values?

**Decision**: Use Python 3.13+ type hints with `typing` module

**Rationale**:
- Constitutional requirement (Principle IV): All functions MUST have complete type hints
- MCP SDK uses type hints to generate tool schemas automatically
- Type checking with `mypy --strict` catches errors at development time

**Type Hint Patterns**:
```python
from typing import Literal
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-mcp-server")

@mcp.tool()
async def list_tasks(
    user_id: str,
    status: Literal["all", "pending", "completed"] = "all"
) -> list[dict]:
    """List tasks with optional status filter."""
    ...

@mcp.tool()
async def update_task(
    user_id: str,
    task_id: int,
    title: str | None = None,
    description: str | None = None
) -> dict:
    """Update task title and/or description."""
    ...
```

---

## Summary of Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **MCP SDK** | `mcp` (official from modelcontextprotocol.io) | Official SDK from authoritative source, standard-compliant |
| **HTTP Client** | `httpx` (async) | Async/await support, connection pooling, excellent error handling |
| **Environment Config** | `python-dotenv` | Standard pattern, already used in backend |
| **Error Handling** | Try-except with `httpx` exceptions | Constitutional requirement, backend ErrorResponse compatibility |
| **Tool Responses** | Pass-through JSON from backend | No transformation needed, backend already well-structured |
| **Project Structure** | Standalone package at `/mnt/d/todo-mcp-server/` | Constitutional requirement, clean separation |
| **Testing** | `pytest` + `pytest-asyncio` | Async support, mock capabilities, integration testing |
| **Type Safety** | Python 3.13+ type hints | Constitutional requirement, MCP schema generation |

---

## Dependencies

**Production**:
```toml
[project]
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
]
```

**Development**:
```toml
[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-httpx>=0.30.0",
    "mypy>=1.8.0",
    "ruff>=0.2.0",
]
```

---

## Next Steps

With research complete, proceed to **Phase 1: Design & Contracts**:
1. Create `data-model.md` (MCP tool schemas)
2. Create `contracts/mcp-tools.json` (OpenAPI-style MCP tool definitions)
3. Create `quickstart.md` (setup and testing guide)
