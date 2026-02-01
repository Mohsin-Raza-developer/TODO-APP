# Implementation Plan: Standalone Todo MCP Server

**Branch**: `005-todo-mcp-server` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-todo-mcp-server/spec.md`

**Note**: This plan follows the `/sp.plan` command workflow and constitutional principles for Phase IIIA development.

## Summary

Build a standalone MCP (Model Context Protocol) server at `/mnt/d/todo-mcp-server/` that exposes 5 task management tools (`add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`) for AI agents. The server acts as an HTTP client wrapper around the existing FastAPI backend REST API, delegating all task operations without direct database access. Uses official `mcp` SDK from https://modelcontextprotocol.io/ with `FastMCP` class and `@mcp.tool()` decorators, `httpx` async HTTP client for backend communication, and Python 3.13+ with full type hints per constitutional requirements.

## Technical Context

**Language/Version**: Python 3.13+ (Constitutional Principle II: Pythonic Excellence)
**Primary Dependencies**:
- `mcp>=1.0.0` (Official MCP SDK with `FastMCP` class from https://modelcontextprotocol.io/)
- `httpx>=0.27.0` (async HTTP client for backend API calls)
- `python-dotenv>=1.0.0` (environment variable management)

**Storage**: N/A (delegates to backend API; backend uses Neon PostgreSQL)
**Testing**: `pytest` with `pytest-asyncio`, `pytest-httpx` for async test support and HTTP mocking
**Target Platform**: Linux/WSL2 server (localhost development, runs alongside backend API)
**Project Type**: Single standalone Python package (separate from main app repository)
**Performance Goals**:
- MCP tool response time <2 seconds under normal conditions (NFR-004)
- Support 10 concurrent tool requests without errors (NFR-007)
- Backend API call timeout: 10 seconds

**Constraints**:
- MUST run independently at `/mnt/d/todo-mcp-server/` (NFR-001)
- MUST NOT connect directly to database (delegates to backend API)
- MUST use try-except blocks for all HTTP operations (clarification session)
- Backend API MUST be running on http://localhost:8000 for testing (NFR-006)

**Scale/Scope**:
- 5 MCP tools total (Basic Level CRUD operations)
- Single `server.py` file (~300-400 lines estimated)
- 2 test files (~200 lines combined)
- Supports unlimited concurrent users (backend API responsibility)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: SDD-RI Methodology
- **Status**: ✅ PASS
- **Evidence**: Following full SDD workflow (spec → clarify → plan → tasks → implement)
- **Compliance**: Specification complete with clarifications, now in planning phase

### ✅ Principle II: Pythonic Excellence
- **Status**: ✅ PASS
- **Evidence**:
  - Python 3.13+ selected for modern features (type unions with `|`, pattern matching if needed)
  - PEP 8 compliance via `ruff format` and `ruff check`
  - Type hints for all functions (`mypy --strict`)
- **Compliance**: All code will follow PEP 8, use modern Python 3.13+ syntax

### ✅ Principle III: Persistent Relational State
- **Status**: ✅ N/A (delegates to backend)
- **Evidence**: MCP server does NOT directly access database; all persistence delegated to backend API
- **Compliance**: Backend API already enforces user_id isolation and database constraints

### ✅ Principle IV: Type Safety & Documentation
- **Status**: ✅ PASS
- **Evidence**:
  - All MCP tool functions will have complete type hints
  - Tool parameters use Python 3.13+ syntax (`str | None`, `Literal["all", "pending", "completed"]`)
  - Docstrings for all tools (used by MCP SDK for tool descriptions)
- **Compliance**: Full type coverage, mypy --strict validation

### ✅ Principle V: Terminal-Based Verification
- **Status**: ✅ PASS
- **Evidence**: MCP server testable via MCP clients or integration tests with backend API running
- **Compliance**: Tools return JSON responses, errors are human-readable messages

### ✅ Principle VI: Reusable Intelligence (Agent Skills)
- **Status**: ✅ DEFERRED
- **Evidence**: HTTP client error handling pattern may warrant extraction as skill if repeated across tools
- **Decision**: Implement first, extract pattern to skill library if complexity emerges

### ✅ Principle VII: Stateless Security (JWT Authentication)
- **Status**: ✅ PASS (backend responsibility)
- **Evidence**:
  - MCP server does NOT handle JWT tokens directly
  - Backend API (`verify_user_ownership` dependency) validates JWT and user ownership
  - MCP tools pass `user_id` parameter; backend enforces authorization
- **Compliance**: Security delegated to backend API layer

**GATE RESULT**: ✅ **PASS** - All applicable principles satisfied. Principle III and VII delegated to backend API (architectural decision from clarification session).

---

## Project Structure

### Documentation (this feature)

```text
specs/005-todo-mcp-server/
├── spec.md              # Feature specification (Phase 0)
├── plan.md              # This file (Phase 1: /sp.plan output)
├── research.md          # Technology decisions (Phase 1: /sp.plan output)
├── data-model.md        # MCP tool schemas (Phase 1: /sp.plan output)
├── quickstart.md        # Setup guide (Phase 1: /sp.plan output)
├── contracts/           # MCP tool definitions (Phase 1: /sp.plan output)
│   └── mcp-tools.json   # OpenAPI-style tool schemas
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Implementation tasks (Phase 2: /sp.tasks output)
```

### Source Code (standalone repository)

```text
/mnt/d/todo-mcp-server/
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Template for environment setup
├── .gitignore              # Ignore .env, __pycache__, .venv, uv.lock
├── README.md               # Setup and usage instructions
├── pyproject.toml          # UV project configuration
├── uv.lock                 # Locked dependencies (auto-generated)
├── server.py               # Main MCP server with 5 tools
└── tests/
    ├── __init__.py
    ├── test_tools.py       # Unit tests for MCP tools (mocked HTTP)
    └── test_integration.py # Integration tests with real backend API
```

**Structure Decision**: Standalone single-file Python package at `/mnt/d/todo-mcp-server/` per NFR-001 constitutional requirement. Simple structure appropriate for MVP with 5 tools. Not part of main repository to maintain separation of concerns and independent deployment capability.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. All constitutional principles either satisfied or appropriately delegated to backend API layer.

---

## Architecture

### High-Level Flow

```
AI Agent (e.g., ChatGPT, Claude)
        ↓ MCP Protocol
MCP Server (this project)
    ↓ HTTP Requests (httpx)
Backend API (existing FastAPI)
    ↓ SQLModel ORM
Neon PostgreSQL Database
```

### MCP Server Responsibilities

**IN SCOPE** (MCP server handles):
- Receive MCP tool calls from AI agents
- Validate tool parameters using Python type hints
- Make HTTP requests to backend API endpoints
- Parse backend JSON responses
- Handle HTTP errors with try-except blocks
- Transform backend ErrorResponse to MCP error messages
- Return formatted responses to AI agents

**OUT OF SCOPE** (backend API handles):
- JWT authentication and token validation
- User ownership verification (`verify_user_ownership`)
- Database queries and transactions
- Data validation (Pydantic schemas)
- Business logic (task creation, completion toggling, etc.)
- Error response formatting (ErrorResponse model)

### Tool-to-Endpoint Mapping

| MCP Tool | Backend Endpoint | HTTP Method | Backend Response |
|----------|------------------|-------------|------------------|
| `add_task` | `/api/{user_id}/tasks` | POST | 201 Created + full Task object |
| `list_tasks` | `/api/{user_id}/tasks?status={filter}` | GET | 200 OK + Task array |
| `complete_task` | `/api/{user_id}/tasks/{id}/complete` | PATCH | 200 OK + full Task object (toggles completed) |
| `delete_task` | `/api/{user_id}/tasks/{id}` | DELETE | 204 No Content (no body) |
| `update_task` | `/api/{user_id}/tasks/{id}` | PUT | 200 OK + full Task object |

### Error Handling Strategy

**HTTP Status Code Mapping**:
```python
200/201 → Success, return parsed JSON
204 → Success (delete), return {"message": "Task deleted", "task_id": id}
400 → ValueError("Validation error: {backend_message}")
401 → ValueError("Authentication required")
403 → ValueError("Access denied")
404 → ValueError("Task not found")
500 → ValueError("Backend service unavailable")
Network errors → ValueError("Cannot connect to backend API")
```

**Error Response Transformation**:
```python
# Backend ErrorResponse format
{
  "error": "validation_error",
  "message": "Title is required"
}

# MCP tool error (raised as ValueError)
raise ValueError("Validation error: Title is required")
```

---

## Implementation Phases

### Phase 0: Research (✅ COMPLETE)

**Artifact**: `research.md`

**Decisions Made**:
- MCP SDK: Official `mcp` library from https://modelcontextprotocol.io/
- HTTP Client: `httpx` async
- Environment Config: `python-dotenv`
- Error Handling: Try-except with httpx exceptions
- Testing: pytest + pytest-asyncio

**Output**: See `research.md` for detailed rationale

### Phase 1: Design & Contracts (IN PROGRESS)

**Artifacts**:
1. `data-model.md` - MCP tool schemas and parameter specifications
2. `contracts/mcp-tools.json` - OpenAPI-style MCP tool definitions
3. `quickstart.md` - Setup and testing guide

**Deliverables**:
- [ ] MCP tool parameter schemas with type hints
- [ ] Backend API endpoint contracts (reference existing)
- [ ] Error response transformation rules
- [ ] Setup instructions for UV project initialization
- [ ] Integration test scenarios

### Phase 2: Task Breakdown

**Command**: `/sp.tasks`

**Expected Outputs**:
- Granular implementation tasks for each MCP tool
- Test tasks (unit + integration)
- Setup tasks (UV project initialization, .env configuration)
- Deployment tasks (README, quickstart guide)

### Phase 3: Implementation

**Command**: `/sp.implement`

**Expected Workflow**:
1. Initialize UV project at `/mnt/d/todo-mcp-server/`
2. Implement `server.py` with 5 MCP tools
3. Write unit tests with mocked HTTP client
4. Write integration tests (requires backend API running)
5. Create setup documentation (README, .env.example)
6. Validate with mypy --strict and ruff checks

---

## Testing Strategy

### Unit Tests (`tests/test_tools.py`)

**Approach**: Mock `httpx.AsyncClient` responses

**Coverage**:
- ✅ Successful backend responses (200/201/204)
- ✅ HTTP error scenarios (400, 401, 404, 500)
- ✅ Network error scenarios (connection refused, timeout)
- ✅ Error message transformation (ErrorResponse → MCP error)
- ✅ Parameter validation (type hints)

**Example**:
```python
import pytest
from pytest_httpx import HTTPXMock

@pytest.mark.asyncio
async def test_add_task_success(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url="http://localhost:8000/api/user123/tasks",
        method="POST",
        json={"id": 1, "user_id": "user123", "title": "Test", ...},
        status_code=201
    )

    result = await add_task("user123", "Test", "Description")
    assert result["id"] == 1
    assert result["title"] == "Test"
```

### Integration Tests (`tests/test_integration.py`)

**Approach**: Real HTTP calls to backend API (requires backend running)

**Coverage**:
- ✅ Complete workflow: create → list → complete → list → delete
- ✅ User data isolation (verify task only visible to owner)
- ✅ Toggle completion behavior (pending → completed → pending)
- ✅ Partial update (update_task with only title or description)

**Prerequisites**:
1. Backend API running at http://localhost:8000
2. Test user created via Better Auth
3. Clean database state (or use transactional rollback)

**Example**:
```python
@pytest.mark.asyncio
@pytest.mark.integration
async def test_full_workflow():
    # Requires: backend API running
    user_id = "test_user_123"

    # Create task
    task = await add_task(user_id, "Integration Test")
    task_id = task["id"]

    # List tasks
    tasks = await list_tasks(user_id, "pending")
    assert any(t["id"] == task_id for t in tasks)

    # Complete task
    completed = await complete_task(user_id, task_id)
    assert completed["completed"] == True

    # Delete task
    result = await delete_task(user_id, task_id)
    assert "deleted" in result.get("message", "").lower()
```

---

## Dependencies

### Production

```toml
[project]
name = "todo-mcp-server"
version = "0.1.0"
description = "MCP server for todo task management via backend API"
requires-python = ">=3.13"
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
]
```

### Development

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

## Environment Variables

**.env.example**:
```bash
# Backend API Configuration
BACKEND_API_URL=http://localhost:8000

# MCP Server Configuration
MCP_SERVER_PORT=8080
MCP_DEBUG=true

# Optional: Logging
LOG_LEVEL=INFO
```

**Usage in code**:
```python
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
MCP_SERVER_PORT = int(os.getenv("MCP_SERVER_PORT", "8080"))
MCP_DEBUG = os.getenv("MCP_DEBUG", "false").lower() == "true"
```

---

## Success Criteria (from Spec)

**Implementation complete when**:
- ✅ All 5 MCP tools discoverable and callable by MCP clients (SC-001)
- ✅ Full workflow executable within 10 seconds (SC-002)
- ✅ 100% user data isolation enforcement (SC-003)
- ✅ Properly formatted responses parseable by AI agents (SC-004)
- ✅ Server start/test/stop via UV commands without errors (SC-005)
- ✅ Error scenarios return messages within 1 second (SC-006)
- ✅ 100 consecutive operations without crash/corruption (SC-007)
- ✅ Setup time <15 minutes per documentation (SC-008)

---

## Next Steps

1. **Complete Phase 1**: Generate `data-model.md`, `contracts/mcp-tools.json`, `quickstart.md`
2. **Run `/sp.tasks`**: Break down implementation into granular tasks
3. **Run `/sp.implement`**: Execute tasks sequentially with TDD approach
4. **Validate**: Run mypy --strict, ruff check, pytest with coverage
5. **Document**: Update CLAUDE.md with Phase IIIA completion

**Ready for**: Phase 1 artifact generation
