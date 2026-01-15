# Implementation Plan: REST API for Multi-User Todo Application

**Branch**: `003-rest-api` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-rest-api/spec.md`

## Summary

Implement a secure REST API for multi-user todo management with Better Auth JWT authentication. The API provides full CRUD operations (Create, Read, Update, Delete, Toggle Complete) with strict user data isolation, leveraging the database schema from feature 002-database-schema. All endpoints require JWT token verification and enforce user ownership at the database level, returning 404 (not 403) for cross-user access to prevent ID enumeration.

**Technical Approach** (from research.md):
- FastAPI framework with dependency injection for JWT verification
- SQLModel ORM with request-scoped database sessions
- Pydantic schemas for request validation and response serialization
- Global exception handlers for consistent error responses
- CORS middleware for Next.js frontend integration
- Pytest with transactional test fixtures for >80% coverage

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, SQLModel, PyJWT, Uvicorn, python-dotenv, pytest
**Storage**: Neon Serverless PostgreSQL (inherited from feature 002-database-schema)
**Testing**: pytest with TestClient and transactional rollback fixtures
**Target Platform**: Linux server (development: localhost, production: cloud hosting)
**Project Type**: Web application (backend only - Next.js frontend is separate feature)
**Performance Goals**:
- Create task: <500ms response time (95th percentile)
- List tasks: <1s response time (up to 10,000 tasks per user)
- Concurrent load: 100 requests/user without degradation
**Constraints**:
- All endpoints require valid JWT tokens (except health checks)
- User isolation enforced at database level (user_id foreign key + query filters)
- CORS limited to whitelisted frontend origins
- No pagination in Phase II (all todos returned in single response)
**Scale/Scope**:
- Multi-user: Unlimited users (database-level isolation)
- Tasks per user: Up to 10,000 (sufficient for Phase II)
- Endpoints: 6 REST endpoints (POST, GET list, GET single, PUT, PATCH, DELETE)
- Error scenarios: 5 HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitutional Requirements

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| **I. SDD-RI Methodology** | Validated spec + tasks before implementation | ✅ PASS | Spec complete (specs/003-rest-api/spec.md), plan in progress, tasks next |
| **II. Pythonic Excellence** | PEP 8, type hints, Python 3.13+ features | ✅ PASS | All code will use type hints, Pydantic validation, async/await patterns |
| **III. Persistent Relational State** | Neon PostgreSQL, SQLModel, user_id isolation | ✅ PASS | Inherits database schema from 002-database-schema, all queries filter by user_id |
| **IV. Type Safety & Documentation** | Complete type hints + docstrings | ✅ PASS | Pydantic schemas, FastAPI path operations with type hints, Google-style docstrings |
| **V. Terminal-Based Verification** | API testable with curl/httpie | ✅ PASS | All endpoints return JSON, documented in quickstart.md with curl examples |
| **VI. Reusable Intelligence** | Extract patterns as Agent Skills | ✅ PASS | JWT verification pattern, user ownership pattern, error handling pattern (candidates for skills) |
| **VII. Stateless Security** | JWT authentication, ownership verification | ✅ PASS | All endpoints verify JWT, user_id matches token, return 404 for cross-user access |

### Technology Stack Compliance

| Component | Constitution Requirement | Planned Implementation | Status |
|-----------|-------------------------|------------------------|--------|
| **Backend Framework** | Python 3.13+ FastAPI | FastAPI 0.104+ | ✅ PASS |
| **ORM** | SQLModel | SQLModel 0.0.14+ | ✅ PASS |
| **Database** | Neon Serverless PostgreSQL | Inherited from 002-database-schema | ✅ PASS |
| **Migrations** | Alembic | Alembic 1.13+ (inherited) | ✅ PASS |
| **Authentication** | Better Auth JWT | PyJWT library with BETTER_AUTH_SECRET | ✅ PASS |
| **Type Checking** | mypy --strict | mypy 1.7+ | ✅ PASS |
| **Linting** | ruff check | ruff 0.1+ | ✅ PASS |
| **Formatting** | ruff format | ruff 0.1+ | ✅ PASS |
| **Testing** | pytest with >80% coverage | pytest 7.4+ with pytest-cov | ✅ PASS |

### Quality Standards Compliance

| Standard | Requirement | Planned Approach | Status |
|----------|-------------|------------------|--------|
| **Code Quality** | Zero linting errors, no debug prints | Pre-commit hooks with ruff, remove all print statements | ✅ PASS |
| **Documentation** | Module/class/function docstrings | Google-style docstrings on all public APIs | ✅ PASS |
| **Testing** | >80% coverage, edge cases tested | pytest with coverage, test all HTTP status codes | ✅ PASS |
| **Security** | No hardcoded secrets, JWT validation | Environment variables only (.env), dependency injection for auth | ✅ PASS |

### Phase II Success Criteria Alignment

| Criterion | Requirement | Plan Coverage | Status |
|-----------|-------------|---------------|--------|
| **1. Secure REST API** | JWT auth, user isolation, HTTP codes, OpenAPI docs | All endpoints require JWT, user_id filters, FastAPI auto-generates OpenAPI | ✅ PASS |
| **2. Responsive Next.js UI** | Not applicable (frontend is separate feature) | N/A - This feature is backend only | ✅ PASS |
| **3. Successful JWT Handshake** | Verify BETTER_AUTH_SECRET, extract user_id claim | Dependency injection with PyJWT, verify signature and claims | ✅ PASS |
| **4. Database Integration** | user_id foreign keys, Alembic migrations, pooling | Inherits schema from 002-database-schema, SQLModel engine with pooling | ✅ PASS |
| **5. Code Quality** | Zero errors, docstrings, no hardcoded secrets | ruff + mypy, environment variables, comprehensive docs | ✅ PASS |
| **6. Testing** | >80% coverage, auth/authz tests | pytest with TestClient, test valid/invalid tokens, ownership checks | ✅ PASS |

**GATE RESULT**: ✅ **PASS** - All constitutional requirements met, no violations to justify

---

## Project Structure

### Documentation (this feature)

```text
specs/003-rest-api/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - JWT patterns, FastAPI structure, CORS config
├── data-model.md        # Phase 1 output - SQLModel models, Pydantic schemas, query patterns
├── quickstart.md        # Phase 1 output - API usage guide with curl examples
├── contracts/           # Phase 1 output - OpenAPI specification
│   └── openapi.yaml     # Complete API contract (6 endpoints, 4 schemas)
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (all items passed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py                 # FastAPI app initialization, CORS, middleware, exception handlers
├── config.py               # Settings (Pydantic BaseSettings for environment variables)
├── database.py             # Database connection, session management, get_session dependency
├── models/                 # SQLModel database models (inherited from 002-database-schema)
│   ├── __init__.py        # Export User, Task models
│   ├── user.py            # User model (Better Auth managed, reference only)
│   └── task.py            # Task model with user_id foreign key
├── schemas/               # Pydantic request/response models
│   ├── __init__.py        # Export all schemas
│   ├── task.py           # TaskCreate, TaskUpdate, TaskResponse
│   └── error.py          # ErrorResponse (standardized error format)
├── api/                   # API route handlers
│   ├── __init__.py        # Export router
│   ├── deps.py           # Shared dependencies (verify_jwt_token, verify_user_ownership)
│   └── tasks.py          # Task endpoints (POST, GET, PUT, PATCH, DELETE)
├── core/                  # Business logic and utilities
│   ├── __init__.py
│   └── security.py       # JWT utilities (decode token, verify signature)
├── tests/                 # Test suite (pytest)
│   ├── __init__.py
│   ├── conftest.py       # pytest fixtures (test DB, client, auth headers)
│   ├── test_auth.py      # JWT authentication tests (401, 403, expired tokens)
│   └── test_tasks.py     # Task endpoint tests (CRUD, ownership, validation)
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variable template (documented in Phase II)
└── README.md             # Setup instructions, quick start guide

tests/ (integration tests at repo root)
└── contract/
    └── test_openapi.py   # Validate API responses match OpenAPI spec
```

**Structure Decision**: Web application structure (Option 2) with backend-only implementation. Frontend is a separate feature that will consume this API. The backend/ directory contains the complete REST API with FastAPI, following the feature-based structure recommended in research.md.

**Rationale**:
- Clear separation of concerns (api/, models/, schemas/, core/)
- Aligns with FastAPI best practices and constitutional requirements
- Scales well for Phase III (AI chatbot will add MCP server, reuse same structure)
- Tests colocated with source code for faster iteration

---

## Complexity Tracking

**No violations to justify** - All constitutional requirements met without exceptions.

The implementation follows:
- Single project structure (backend only)
- Standard FastAPI patterns (dependency injection, Pydantic validation)
- Direct database access via SQLModel (no repository pattern needed for CRUD)
- Minimal abstraction layers (only what FastAPI requires)

---

## Implementation Phases

### Phase 0: Research & Technical Decisions ✅ COMPLETE

**Status**: All research completed in `research.md`

**Key Decisions**:
1. **JWT Authentication**: Dependency injection with HTTPBearer security scheme
2. **Project Structure**: Feature-based with api/models/schemas/core separation
3. **CORS Configuration**: Environment-based with explicit origin whitelisting
4. **Error Standardization**: RFC 7807-inspired format with global exception handlers
5. **Database Sessions**: Request-scoped via FastAPI dependency
6. **User Ownership**: Reusable dependency combining JWT verification + user_id validation
7. **Request/Response Schemas**: Separate Pydantic models for create/update/response
8. **Testing Strategy**: Pytest with fixtures for test DB, client, authenticated requests

**Technologies Selected**:
- PyJWT (not python-jose) for simpler Better Auth integration
- FastAPI built-in CORSMiddleware
- Pydantic BaseModel with Field validators
- pytest with TestClient and transactional fixtures

**Constitutional Compliance**: All 7 principles addressed in research findings

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: All design artifacts completed

#### 1.1 Data Model ✅

**Output**: `data-model.md`

**Contents**:
- Database models inherited from 002-database-schema (User, Task)
- Request schemas (TaskCreate, TaskUpdate)
- Response schemas (TaskResponse, ErrorResponse)
- Query patterns (list, get, update, toggle, delete)
- Data validation rules (title 1-200 chars, description 0-1000 chars)
- State transitions (create → pending ↔ completed → delete)

**Key Patterns**:
- User isolation via user_id filter on all queries
- Ownership verification via combined ID + user_id query
- Consistent error response format (error, message, details)
- B-tree index on user_id for O(log n) query performance

#### 1.2 API Contracts ✅

**Output**: `contracts/openapi.yaml`

**Contents**:
- 6 REST endpoints (POST, GET list, GET single, PUT, PATCH, DELETE)
- 4 schemas (TaskCreate, TaskUpdate, TaskResponse, ErrorResponse)
- Security scheme (BearerAuth with JWT)
- All HTTP status codes documented (200, 201, 204, 400, 401, 403, 404, 500)
- Request/response examples for every endpoint
- Error response examples for every error scenario

**OpenAPI Compliance**:
- OpenAPI 3.1.0 specification
- Complete parameter documentation
- Request body validation rules
- Response schema definitions
- Security requirements on all endpoints

#### 1.3 Quick Start Guide ✅

**Output**: `quickstart.md`

**Contents**:
- Installation instructions (uv, dependencies, .env setup)
- Running the API (dev server, production server)
- API documentation access (Swagger, ReDoc, OpenAPI JSON)
- Authentication (JWT token generation for testing)
- Example API calls (curl, httpie) for all 6 endpoints
- Testing instructions (pytest, coverage, single tests)
- Common issues and solutions (401, 403, 404, CORS, database)
- Performance tips (connection pooling, monitoring, load testing)

---

### Phase 2: Tasks Breakdown ⏳ NEXT

**Command**: `/sp.tasks` (run after this planning phase completes)

**Expected Tasks**:
1. **Setup & Configuration** (2-3 tasks)
   - Create FastAPI app with CORS and exception handlers
   - Configure database connection and session management
   - Set up environment variables and settings

2. **Authentication & Authorization** (3-4 tasks)
   - Implement JWT verification dependency
   - Implement user ownership verification dependency
   - Add security testing (valid/invalid/expired tokens)

3. **Task CRUD Endpoints** (6 tasks, one per endpoint)
   - POST /api/{user_id}/tasks (create)
   - GET /api/{user_id}/tasks (list with filtering)
   - GET /api/{user_id}/tasks/{id} (get single)
   - PUT /api/{user_id}/tasks/{id} (update)
   - PATCH /api/{user_id}/tasks/{id}/complete (toggle)
   - DELETE /api/{user_id}/tasks/{id} (delete)

4. **Request/Response Schemas** (2-3 tasks)
   - Create Pydantic request schemas (TaskCreate, TaskUpdate)
   - Create Pydantic response schemas (TaskResponse, ErrorResponse)
   - Add schema validation tests

5. **Error Handling** (2 tasks)
   - Implement global exception handlers
   - Add error response tests (400, 401, 403, 404, 500)

6. **Testing** (3-4 tasks)
   - Set up pytest fixtures (test DB, client, auth headers)
   - Write integration tests for all endpoints
   - Achieve >80% code coverage
   - Add contract testing (validate against OpenAPI spec)

7. **Documentation** (1 task)
   - Verify FastAPI auto-generated OpenAPI docs match contracts/openapi.yaml

**Estimated Total**: ~20-25 tasks

---

## Architecture Decisions

### AD-001: FastAPI Dependency Injection for Authentication

**Decision**: Use FastAPI's dependency injection system for JWT verification instead of middleware

**Rationale**:
- Per-endpoint control over authentication requirements
- Easy to test in isolation (mock dependencies in tests)
- Reusable across endpoints (DRY principle)
- Follows FastAPI best practices and constitutional requirement for maintainability

**Alternatives Considered**:
- Middleware: Rejected because it doesn't provide per-endpoint control
- Manual verification in each endpoint: Violates DRY principle
- Third-party library (authlib): Adds unnecessary complexity

**Implementation**:
```python
# api/deps.py
async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = jwt.decode(credentials.credentials, settings.BETTER_AUTH_SECRET, algorithms=["HS256"])
    return payload

# Usage
@app.get("/api/{user_id}/tasks")
async def list_tasks(token_payload: dict = Depends(verify_jwt_token)):
    ...
```

---

### AD-002: Reusable User Ownership Verification Dependency

**Decision**: Create a reusable dependency that combines JWT verification with user_id validation

**Rationale**:
- DRY principle: Single source of truth for ownership checks
- Constitutional requirement: "Backend MUST verify that requested resource ID belongs to authenticated user ID"
- Specification requirement: Return 404 (not 403) for cross-user access to prevent ID enumeration

**Alternatives Considered**:
- Check ownership inside each endpoint: Violates DRY, error-prone
- Separate dependency for ownership: Redundant, still need JWT verification
- Database-level RLS: Adds complexity, Neon doesn't require it for Phase II

**Implementation**:
```python
# api/deps.py
async def verify_user_ownership(
    user_id: str,
    token_payload: dict = Depends(verify_jwt_token)
) -> str:
    if token_payload.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    return user_id

# Usage
@app.get("/api/{user_id}/tasks/{task_id}")
async def get_task(user_id: str = Depends(verify_user_ownership), task_id: int):
    # Query with user_id filter (database-level isolation)
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user_id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")  # Not 403
    return task
```

---

### AD-003: Global Exception Handlers for Consistent Error Responses

**Decision**: Use FastAPI's exception handler decorators for standardized error responses

**Rationale**:
- Specification requirement: "API MUST return consistent error response format"
- Constitutional requirement: "API MUST provide clear, user-friendly error messages"
- Single place to define error format (DRY)
- Automatic error handling across all endpoints

**Alternatives Considered**:
- Different error format per endpoint: Inconsistent, violates spec
- Try/except in each endpoint: Violates DRY
- Custom middleware: More complex than exception handlers

**Implementation**:
```python
# main.py
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=exc.status_code, message=exc.detail).model_dump()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(error="internal_server_error", message="An unexpected error occurred").model_dump()
    )
```

---

### AD-004: Request-Scoped Database Sessions via FastAPI Dependency

**Decision**: Use FastAPI dependency with context manager for database session lifecycle

**Rationale**:
- Automatic session cleanup after request
- Constitutional requirement for transactional integrity
- Follows SQLModel and FastAPI best practices
- Easy to test (override dependency in tests)

**Alternatives Considered**:
- Manual session management: Error-prone
- Global session: Thread safety issues
- AsyncSession: Not needed for Phase II (sync operations sufficient)

**Implementation**:
```python
# database.py
def get_session():
    with Session(engine) as session:
        yield session

# Usage
@app.post("/api/{user_id}/tasks")
async def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session)
):
    task = Task(**task_data.model_dump())
    session.add(task)
    session.commit()  # Auto-rollback on exception
    session.refresh(task)
    return task
```

---

### AD-005: Separate Pydantic Models for Request and Response

**Decision**: Use separate Pydantic models for create/update requests and responses

**Rationale**:
- Constitutional requirement for type safety
- Clear separation between input validation and output serialization
- FastAPI auto-generates accurate OpenAPI docs from schemas
- Different validation rules for create vs update

**Alternatives Considered**:
- Single schema for all operations: Lacks type safety, confusing validation
- Use SQLModel directly: Exposes internal fields, no validation flexibility
- Dictionary-based: No type checking, violates constitution

**Implementation**:
```python
# schemas/task.py
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
```

---

### AD-006: Return 404 (Not 403) for Cross-User Resource Access

**Decision**: Return 404 Not Found for both "resource doesn't exist" and "resource belongs to another user"

**Rationale**:
- Specification requirement: "API MUST return HTTP 404 Not Found (not 403) when a user attempts to access a todo that belongs to another user (prevents ID enumeration)"
- Constitutional requirement: "Cross-user resource access MUST return 404 Not Found"
- Security best practice: Prevents attackers from enumerating valid resource IDs

**Alternatives Considered**:
- Return 403 for ownership violations: Leaks information about resource existence
- Separate error codes: Violates spec and security best practice

**Implementation**:
```python
@app.get("/api/{user_id}/tasks/{task_id}")
async def get_task(
    user_id: str = Depends(verify_user_ownership),
    task_id: int,
    session: Session = Depends(get_session)
):
    # Single query combines existence + ownership check
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    # Returns None for both "not found" and "belongs to another user"
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task
```

---

## Risk Analysis

### High Priority Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| **BETTER_AUTH_SECRET mismatch** | Authentication fails (all requests return 401) | Document in quickstart.md, add validation test, use same .env template | ✅ MITIGATED |
| **CORS misconfiguration** | Frontend requests blocked | Whitelist frontend URL, test CORS in integration tests | ✅ MITIGATED |
| **User ID enumeration** | Security vulnerability | Return 404 (not 403) for cross-user access | ✅ MITIGATED |
| **Database connection pooling** | Performance degradation under load | Use Neon pooled endpoint (-pooler suffix), configure pool settings | ✅ MITIGATED |

### Medium Priority Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| **Missing type hints** | mypy --strict fails | Enable strict type checking from start, use Pydantic models | ✅ MITIGATED |
| **Test coverage <80%** | Fails Phase II success criteria | Write tests alongside implementation, measure coverage continuously | ✅ MITIGATED |
| **Hardcoded secrets** | Security violation, fails constitution | Use environment variables only, add pre-commit hook to detect secrets | ✅ MITIGATED |

### Low Priority Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| **OpenAPI spec drift** | Docs don't match implementation | Use FastAPI auto-generation, validate with contract tests | ✅ MITIGATED |
| **Inconsistent error messages** | Poor user experience | Use global exception handlers, standardized ErrorResponse | ✅ MITIGATED |

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Feature 002-database-schema** | Complete | Database schema (users, tasks tables) | ✅ AVAILABLE |
| **Better Auth (Frontend)** | TBD | JWT token issuance, user management | ⚠️ COORDINATION NEEDED |
| **Neon PostgreSQL** | Provisioned | Database hosting | ✅ AVAILABLE |

### Coordination Points

1. **Better Auth Secret**: Frontend and backend must share the same BETTER_AUTH_SECRET
   - **Action**: Document in both frontend and backend .env.example
   - **Timeline**: Before frontend integration testing

2. **User ID Format**: Backend expects Better Auth UUID as string (TEXT, not PostgreSQL UUID)
   - **Action**: Verify frontend sends user_id in JWT payload as string
   - **Timeline**: Before JWT integration testing

3. **CORS Origins**: Frontend URL must be whitelisted in backend CORS configuration
   - **Action**: Add FRONTEND_URL environment variable to backend
   - **Timeline**: Before frontend makes first API call

---

## Success Metrics

### Specification Compliance

- ✅ All 6 user stories implemented (P1-P6)
- ✅ All 51 functional requirements addressed
- ✅ All 21 acceptance scenarios testable
- ✅ All 12 success criteria measurable

### Performance Metrics

- Create task: <500ms (95th percentile) ← Measured in integration tests
- List tasks: <1s (up to 10,000 tasks) ← Measured with performance tests
- Concurrent load: 100 requests/user ← Measured with load testing (Apache Bench)

### Quality Metrics

- Test coverage: >80% (target: 90%)
- Type checking: 100% (mypy --strict passes)
- Linting: Zero warnings (ruff check passes)
- Security: No hardcoded secrets, all endpoints require auth

### Deliverables

- [ ] FastAPI application with 6 REST endpoints
- [ ] JWT authentication middleware with user ownership verification
- [ ] Pydantic request/response schemas with validation
- [ ] Global exception handlers for consistent error responses
- [ ] CORS configuration for Next.js frontend
- [ ] pytest test suite with >80% coverage
- [ ] OpenAPI documentation (auto-generated by FastAPI)
- [ ] Quick start guide with curl examples
- [ ] Environment variable template (.env.example)

---

## Next Steps

1. **Run `/sp.tasks`** to generate task breakdown from this plan
2. **Review tasks** for completeness and effort estimates
3. **Run `/sp.implement`** to execute tasks sequentially
4. **Coordinate with frontend** for Better Auth JWT integration
5. **Deploy to staging** for integration testing with Next.js frontend

---

**Plan Status**: ✅ COMPLETE - Ready for task breakdown phase
