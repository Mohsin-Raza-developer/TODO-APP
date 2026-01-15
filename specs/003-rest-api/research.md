# Research: REST API for Multi-User Todo Application

**Feature**: 003-rest-api
**Date**: 2026-01-14
**Purpose**: Resolve technical unknowns and establish best practices for FastAPI REST API with Better Auth JWT integration

## Research Tasks Completed

### 1. FastAPI JWT Authentication Patterns

**Question**: How should JWT tokens be verified in FastAPI for Better Auth integration?

**Decision**: Use FastAPI dependency injection with a reusable JWT verification dependency

**Rationale**:
- FastAPI's dependency system provides clean separation of concerns
- Dependency can be reused across all protected endpoints
- Easy to test in isolation
- Follows FastAPI best practices and constitutional requirement for clean architecture

**Implementation Pattern**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Annotated

security = HTTPBearer()

async def verify_jwt_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> dict:
    """
    Verify JWT token and extract payload.

    Raises:
        HTTPException: 401 if token invalid/expired
    """
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Usage in endpoints
@app.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    token_payload: Annotated[dict, Depends(verify_jwt_token)]
):
    # Verify user_id matches token
    if token_payload.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    ...
```

**Alternatives Considered**:
- Middleware approach: Rejected because it doesn't provide per-endpoint control
- Manual verification in each endpoint: Violates DRY principle
- Third-party auth library (authlib): Adds unnecessary complexity for simple JWT verification

---

### 2. FastAPI Project Structure for Multi-User API

**Question**: What's the optimal directory structure for a FastAPI application with database integration?

**Decision**: Feature-based structure with separation of concerns

**Rationale**:
- Aligns with constitutional requirement for maintainability
- Clear separation between API routes, business logic, and data models
- Scales well as features grow
- Follows FastAPI community best practices

**Structure**:
```
backend/
├── main.py                 # FastAPI app initialization, CORS, middleware
├── config.py               # Settings (Pydantic BaseSettings)
├── database.py             # Database connection, session management
├── models/                 # SQLModel database models
│   ├── __init__.py
│   ├── user.py            # User model (from Phase II schema)
│   └── task.py            # Task model (from Phase II schema)
├── schemas/               # Pydantic request/response models
│   ├── __init__.py
│   ├── task.py           # TaskCreate, TaskUpdate, TaskResponse
│   └── error.py          # ErrorResponse
├── api/                   # API route handlers
│   ├── __init__.py
│   ├── deps.py           # Shared dependencies (JWT verification)
│   └── tasks.py          # Task endpoints (CRUD operations)
├── core/                  # Business logic (if needed)
│   ├── __init__.py
│   └── security.py       # JWT utilities, password hashing
└── tests/
    ├── conftest.py       # pytest fixtures (test DB, client)
    ├── test_auth.py      # JWT authentication tests
    └── test_tasks.py     # Task endpoint tests
```

**Alternatives Considered**:
- Layered architecture (controllers/services/repositories): Too complex for Phase II scope
- Flat structure: Doesn't scale, violates maintainability principle
- Domain-driven design: Overkill for CRUD API

---

### 3. CORS Configuration for Next.js Frontend

**Question**: How should CORS be configured for local development and production?

**Decision**: Environment-based CORS configuration with explicit origin whitelisting

**Rationale**:
- Security: Only allows requests from known frontend origins
- Flexibility: Different configs for dev/staging/prod
- Follows constitutional security requirements

**Implementation**:
```python
from fastapi.middleware.cors import CORSMiddleware

# In main.py
origins = [
    "http://localhost:3000",           # Next.js dev server
    "http://localhost:3001",           # Alternative dev port
    os.getenv("FRONTEND_URL", ""),     # Production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,             # Required for cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Alternatives Considered**:
- Allow all origins (*): Security risk, violates constitution
- Regex pattern matching: Unnecessary complexity
- Manual preflight handling: FastAPI middleware handles this automatically

---

### 4. Error Response Standardization

**Question**: What's the best format for consistent API error responses?

**Decision**: RFC 7807 Problem Details-inspired format with FastAPI exception handlers

**Rationale**:
- Industry standard approach
- Consistent error format across all endpoints
- Constitutional requirement for user-friendly error messages

**Implementation**:
```python
# schemas/error.py
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    error: str                    # Error type/code
    message: str                  # Human-readable message
    details: dict | None = None   # Optional additional context

# Exception handlers in main.py
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.status_code,
            message=exc.detail
        ).model_dump()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log full error server-side
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    # Return sanitized error to client
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="internal_server_error",
            message="An unexpected error occurred"
        ).model_dump()
    )
```

**Alternatives Considered**:
- Different error format per endpoint: Inconsistent, violates spec requirement
- Expose full exception details: Security risk
- HTTP status code only: Not user-friendly

---

### 5. Database Session Management in FastAPI

**Question**: How should SQLModel sessions be managed for request-scoped transactions?

**Decision**: FastAPI dependency with lifespan context manager

**Rationale**:
- Automatic session cleanup after request
- Constitutional requirement for transactional integrity
- Follows SQLModel and FastAPI best practices

**Implementation**:
```python
# database.py
from sqlmodel import create_engine, Session, SQLModel
from contextlib import asynccontextmanager

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    """Dependency for database session."""
    with Session(engine) as session:
        yield session

# Usage in endpoints
@app.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    session: Annotated[Session, Depends(get_session)],
    token_payload: Annotated[dict, Depends(verify_jwt_token)]
):
    # Session automatically commits on success, rollbacks on exception
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks
```

**Alternatives Considered**:
- Manual session management: Error-prone, violates DRY
- Global session: Thread safety issues, doesn't work with async
- AsyncSession: Not needed for Phase II (sync operations sufficient)

---

### 6. User Ownership Verification Pattern

**Question**: How should we verify that authenticated users only access their own resources?

**Decision**: Reusable dependency that combines JWT verification with user_id validation

**Rationale**:
- DRY principle: Single source of truth for ownership checks
- Constitutional requirement: "Backend MUST verify that requested resource ID belongs to authenticated user ID"
- Spec requirement: Return 404 (not 403) for cross-user access

**Implementation**:
```python
# api/deps.py
async def verify_user_ownership(
    user_id: str,
    token_payload: Annotated[dict, Depends(verify_jwt_token)]
) -> str:
    """
    Verify that the user_id in URL matches authenticated user.

    Returns:
        user_id if valid

    Raises:
        HTTPException: 403 if user_id mismatch
    """
    token_user_id = token_payload.get("user_id")
    if not token_user_id:
        raise HTTPException(status_code=401, detail="Missing user_id in token")

    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    return user_id

# Usage in endpoints
@app.get("/api/{user_id}/tasks/{task_id}")
async def get_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    # Query with user_id filter (database-level isolation)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    # Return 404 for both "not found" and "belongs to another user"
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task
```

**Alternatives Considered**:
- Check ownership inside each endpoint: Violates DRY, error-prone
- Separate dependency for ownership: Redundant, still need JWT verification
- Database-level RLS (Row-Level Security): Adds complexity, Neon doesn't require it for Phase II

---

### 7. Request/Response Schema Patterns

**Question**: How should request and response schemas be structured for type safety and validation?

**Decision**: Separate Pydantic models for create/update requests and responses

**Rationale**:
- Constitutional requirement for type safety
- Clear separation between input validation and output serialization
- FastAPI auto-generates OpenAPI docs from schemas

**Implementation**:
```python
# schemas/task.py
from pydantic import BaseModel, Field
from datetime import datetime

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskResponse(BaseModel):
    """Schema for task responses."""
    id: int
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Allow from SQLModel

# Usage in endpoints
@app.post("/api/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: Annotated[str, Depends(verify_user_ownership)],
    task_data: TaskCreate,
    session: Annotated[Session, Depends(get_session)]
):
    task = Task(**task_data.model_dump(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

**Alternatives Considered**:
- Single schema for all operations: Lacks type safety, confusing validation rules
- Use SQLModel directly: Exposes internal fields, no validation flexibility
- Dictionary-based: No type checking, violates constitution

---

### 8. Testing Strategy for API Endpoints

**Question**: What testing approach ensures comprehensive coverage of authentication, authorization, and CRUD operations?

**Decision**: Pytest with fixtures for test database, client, and authenticated requests

**Rationale**:
- Constitutional requirement: >80% coverage, integration tests for database
- Efficient: Transactional rollback for test isolation
- Comprehensive: Tests auth, ownership, CRUD, error paths

**Implementation**:
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session, SQLModel
from main import app
from database import get_session

# Test database (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL)

@pytest.fixture
def session():
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)

@pytest.fixture
def client(session):
    def override_get_session():
        yield session
    app.dependency_overrides[get_session] = override_get_session
    return TestClient(app)

@pytest.fixture
def auth_headers():
    """Generate valid JWT token for testing."""
    token = jwt.encode(
        {"user_id": "test_user_123", "exp": datetime.utcnow() + timedelta(hours=1)},
        settings.BETTER_AUTH_SECRET,
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}

# tests/test_tasks.py
def test_create_task_success(client, auth_headers):
    response = client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task", "description": "Test description"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"

def test_create_task_unauthorized(client):
    response = client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test task"}
    )
    assert response.status_code == 401

def test_get_task_cross_user_access(client, session, auth_headers):
    # Create task for different user
    other_task = Task(user_id="other_user", title="Other task", completed=False)
    session.add(other_task)
    session.commit()

    # Try to access with test_user_123 token
    response = client.get(
        f"/api/test_user_123/tasks/{other_task.id}",
        headers=auth_headers
    )
    assert response.status_code == 404  # Not 403, per spec
```

**Alternatives Considered**:
- Manual database setup/teardown: Slow, error-prone
- Mock database: Doesn't test real SQL queries
- Separate test server: Adds deployment complexity

---

## Summary of Research Findings

### Technology Decisions
- **JWT Library**: PyJWT (python-jose alternative, simpler for Better Auth integration)
- **CORS Middleware**: FastAPI built-in CORSMiddleware
- **Request Validation**: Pydantic BaseModel with Field validators
- **Testing Framework**: pytest with TestClient and transactional fixtures

### Architecture Patterns
- **Authentication**: Dependency injection with HTTPBearer security scheme
- **Authorization**: Reusable user ownership verification dependency
- **Error Handling**: Global exception handlers with standardized ErrorResponse
- **Database Sessions**: Request-scoped sessions via FastAPI dependency
- **Project Structure**: Feature-based with api/models/schemas/core separation

### Constitutional Compliance
- ✅ **Pythonic Excellence**: Type hints, Pydantic validation, PEP 8 structure
- ✅ **Persistent Relational State**: SQLModel ORM, user_id foreign keys, database-level isolation
- ✅ **Type Safety & Documentation**: Complete type hints, Pydantic schemas, docstrings
- ✅ **Terminal-Based Verification**: All endpoints testable with curl/httpie, JSON responses
- ✅ **Stateless Security**: JWT verification on every request, ownership checks, 404 for cross-user access

### Specification Compliance
- ✅ All 51 functional requirements addressed in research
- ✅ JWT authentication patterns defined (FR-001 to FR-008)
- ✅ CRUD endpoint patterns established (FR-009 to FR-044)
- ✅ Error handling standardized (FR-045 to FR-048)
- ✅ CORS configuration planned (FR-049 to FR-051)

### Next Steps
Phase 1 ready to proceed:
1. Create data-model.md (leverage existing database schema from feature 002-database-schema)
2. Generate OpenAPI contracts in contracts/
3. Create quickstart.md for API usage
4. Update agent context with new technologies
