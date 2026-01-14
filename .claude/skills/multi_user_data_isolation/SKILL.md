---
name: "multi-user-data-isolation"
description: "User data isolation enforcement with ownership verification, cross-user access prevention, and defense-in-depth security"
---

## Context

**Active State**: Multi-User Authentication and Authorization

This subagent logic MUST be triggered whenever:
- Implementing API endpoints that access user-owned resources
- Designing database queries for multi-tenant applications
- Implementing JWT token verification and user identification
- Enforcing data isolation and preventing cross-user data leaks
- Designing authorization logic for resource ownership verification
- Implementing GDPR "right to be forgotten" compliance

## Requirements

### Database-Level Isolation
- Every entity table MUST include a `user_id` foreign key column (NOT NULL)
- All user data queries MUST include `WHERE user_id = {authenticated_user_id}` filter
- Foreign key constraints MUST enforce referential integrity (`REFERENCES users(id)`)
- `user_id` columns MUST be indexed for query performance (CREATE INDEX)
- Cross-user data access MUST be prevented at database constraint level, not just application level
- Application code MUST NEVER trust client-provided user_id values

### JWT Token Verification
- All API endpoints MUST verify JWT token signature using `BETTER_AUTH_SECRET` environment variable
- JWT token payload MUST include `user_id` claim for identity verification
- Expired tokens MUST be rejected with 401 Unauthorized
- Missing tokens MUST be rejected with 401 Unauthorized (except public auth endpoints)
- Invalid token signatures MUST be rejected with 401 Unauthorized
- Token verification MUST occur BEFORE any database queries execute

### Ownership Verification Pattern
- Resource access queries MUST verify ownership with: `WHERE id = {resource_id} AND user_id = {token_user_id}`
- Ownership verification MUST happen in a SINGLE database query (not two separate queries)
- Cross-user resource access MUST return 404 Not Found (NOT 403 Forbidden) to prevent information leakage
- API responses MUST NOT reveal whether a resource exists but belongs to another user
- Bulk operations (list, search) MUST filter by authenticated user_id automatically
- Admin/service accounts MUST have explicit role claim in JWT for elevated access

### Error Response Security
- Failed ownership verification MUST return 404 Not Found
- Authentication failures MUST return 401 Unauthorized
- MUST NOT return 403 Forbidden for cross-user access (prevents ID enumeration attacks)
- Error messages MUST NOT leak information about other users' data
- Stack traces MUST NOT be exposed in production error responses
- Rate limiting MUST be applied to authentication endpoints

### GDPR Compliance
- User deletion MUST cascade to all owned entities (ON DELETE CASCADE)
- User data export MUST include all owned resources across all tables
- User data MUST be physically deleted, not soft-deleted (for "right to be forgotten")
- Cross-user data MUST remain completely invisible (cannot leak in aggregations, counts, etc.)
- Audit logs MUST track user_id for all data access operations

### Defense-in-Depth
- Database constraints MUST enforce user_id NOT NULL (first layer)
- Application queries MUST filter by user_id (second layer)
- API route guards MUST verify JWT tokens (third layer)
- Integration tests MUST verify cross-user access fails (validation layer)
- Code reviews MUST check for missing user_id filters (process layer)

## Examples

### ✅ Good (Phase II Reference)

```python
# From Constitution v2.0.0 Principle VII: Stateless Security
# FastAPI endpoint with JWT verification and ownership verification

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlmodel import Session, select

# JWT token verification (Layer 1: Authentication)
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract and verify JWT token, return user_id."""
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),  # Environment variable, never hardcoded
            algorithms=["HS256"]
        )
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id claim"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature"
        )

# Ownership verification (Layer 2: Authorization)
@app.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    user_id: str = Depends(verify_token),  # JWT verification happens first
    session: Session = Depends(get_session)
) -> Task:
    """Get a single task - ownership verification in single query."""

    # CORRECT: Single query with ownership verification
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id  # Ownership check in database query
    )
    task = session.exec(statement).first()

    if not task:
        # Return 404 (not 403) to prevent information leakage
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"  # Generic message, no user info leak
        )

    return task

# Bulk operations with automatic filtering
@app.get("/tasks")
def list_tasks(
    user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
) -> list[Task]:
    """List all tasks for authenticated user."""

    # CORRECT: Automatic user_id filtering
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()

    return list(tasks)

# Update with ownership verification
@app.patch("/tasks/{task_id}")
def update_task(
    task_id: int,
    updates: TaskUpdate,
    user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
) -> Task:
    """Update task - ownership verification prevents cross-user modification."""

    # CORRECT: Ownership verification in WHERE clause
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update logic here
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

**Database Schema (Layer 3: Constraints)**:
```sql
-- From Database Schema Architect skill
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Constraint prevents orphans
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);  -- Performance for WHERE user_id = ?
```

**Why This Satisfies Constitution v2.0.0**:
- Stateless Security (Principle VII): JWT verification + ownership verification pattern
- Persistent Relational State (Principle III): Database-level user_id enforcement
- Reusable Intelligence (Principle VI): Pattern extracted for horizontal reuse

**Security Validation**:
```
Test: User A attempts to access User B's task via GET /tasks/123
JWT token: valid for User A (user_id = "user_A")
Database query: SELECT * FROM tasks WHERE id = 123 AND user_id = "user_A"
Result: Empty (task 123 belongs to User B)
HTTP Response: 404 Not Found (no information leakage)
Security: PASS - Cross-user access prevented
```

### ❌ Bad (Anti-Patterns)

```python
# ANTI-PATTERN 1: Missing JWT verification (authentication bypass)
@app.get("/tasks/{task_id}")
def get_task(task_id: int, session: Session = Depends(get_session)) -> Task:
    # ❌ No JWT verification - anyone can access any task
    task = session.get(Task, task_id)
    return task
```

**Architectural Risk**:
- **Complete Security Bypass**: Unauthenticated users can access all data
- **Data Breach**: Attackers can enumerate all tasks by iterating IDs (1, 2, 3, ...)
- **Compliance Violation**: Fails GDPR, HIPAA, SOC 2 requirements for access control
- **Legal Liability**: Data leak can result in regulatory fines and lawsuits
- Violates Constitution v2.0.0 Principle VII requirement for JWT verification

```python
# ANTI-PATTERN 2: Two-query ownership check (TOCTOU vulnerability)
@app.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
) -> Task:
    # ❌ First query: Check if task exists
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ❌ Second query: Check ownership separately
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")  # ❌ 403 leaks info

    return task
```

**Architectural Risk**:
- **Information Leakage**: Returns 403 (not 404) reveals task exists but belongs to another user
- **ID Enumeration Attack**: Attacker can map all task IDs and their owners (403 = exists, 404 = doesn't exist)
- **TOCTOU Race Condition**: Task ownership can change between queries in concurrent scenarios
- **Performance**: Two database queries instead of one (2x latency)
- Violates Constitution v2.0.0 Principle VII requirement for 404 responses

```python
# ANTI-PATTERN 3: Trusting client-provided user_id (critical vulnerability)
@app.get("/tasks")
def list_tasks(
    user_id: str,  # ❌ Accepts user_id from query parameter, not JWT
    session: Session = Depends(get_session)
) -> list[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    return list(session.exec(statement).all())

# Attack: GET /tasks?user_id=victim_user_id
# Result: Attacker sees all victim's tasks
```

**Architectural Risk**:
- **Catastrophic Authorization Bypass**: Attacker can access ANY user's data by changing query parameter
- **Trivial Exploitation**: No technical skill required, just change URL parameter
- **Data Breach**: Full database compromise (iterate through all user_ids)
- **Audit Trail Failure**: Logs show wrong user_id (cannot trace actual attacker)
- Violates Constitution v2.0.0 Principle VII requirement to verify user_id from JWT token

```python
# ANTI-PATTERN 4: Missing user_id filter on bulk operations (data leak)
@app.get("/tasks/search")
def search_tasks(
    query: str,
    user_id: str = Depends(verify_token),  # JWT verified correctly
    session: Session = Depends(get_session)
) -> list[Task]:
    # ❌ Missing user_id filter - searches ALL users' tasks
    statement = select(Task).where(Task.title.contains(query))
    return list(session.exec(statement).all())

# Attack: GET /tasks/search?query=secret
# Result: Attacker sees ALL users' tasks containing "secret"
```

**Architectural Risk**:
- **Data Leak**: Returns other users' data despite valid JWT token
- **Aggregation Attack**: Attacker learns about all users' tasks via search queries
- **Privacy Violation**: User A can discover User B's task titles, descriptions
- **Hard to Detect**: May go unnoticed in code reviews (missing WHERE clause is invisible)
- Violates Constitution v2.0.0 Principle III requirement for strict data isolation

```python
# ANTI-PATTERN 5: Soft delete without user_id scoping (GDPR violation)
@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)

    if task and task.user_id == user_id:
        task.deleted = True  # ❌ Soft delete, data remains in database
        session.commit()

    return {"status": "deleted"}

# GDPR deletion request: User data still exists in database (deleted=True flag)
```

**Architectural Risk**:
- **GDPR Violation**: "Right to be forgotten" requires physical deletion, not soft delete
- **Data Retention Risk**: Deleted data can be recovered (regulatory compliance failure)
- **Storage Growth**: Database grows indefinitely with soft-deleted records
- **Query Complexity**: All queries must filter `WHERE deleted = FALSE` (easy to forget)
- Violates GDPR compliance requirement from Database Schema Architect skill (ON DELETE CASCADE)

## Rationale

**Horizontal Intelligence for Phase III (Analytics), Phase IV (Mobile), and Phase V (Scale)**:

### Phase III: Analytics and Reporting
- **Aggregation Security**: Analytics queries (`COUNT(*)`, `SUM(amount)`) MUST filter by user_id to prevent data leakage
- **Admin Dashboards**: Role-based access (JWT role claim) allows admin to query across users
- **Audit Logs**: user_id tracking enables per-user activity reports and compliance audits
- **Data Export**: GDPR data export must collect user_id-filtered data from all tables

### Phase IV: Mobile Offline-First
- **Sync Protocol**: Mobile app sends JWT token with sync requests, server filters by user_id
- **Local Storage**: Mobile SQLite database isolates data by user_id (same pattern as server)
- **Multi-Account Support**: App can switch users, each sees only their isolated data
- **Cache Invalidation**: user_id used as cache key prefix (`user:{user_id}:tasks`)

### Phase V: Horizontal Scaling
- **Database Sharding**: Shard by user_id (User A → Shard 1, User B → Shard 2) for horizontal scaling
- **Load Balancing**: Sticky sessions by user_id ensure consistent routing
- **Read Replicas**: user_id filtering allows safe read distribution across replicas
- **Multi-Region**: user_id enables geo-routing (EU users → EU database for GDPR data residency)

### Cross-Platform Security
- **Mobile App**: Same JWT + user_id pattern (Swift, Kotlin use same API)
- **Web Frontend**: Next.js uses same JWT in HTTP-only cookies + Authorization header
- **Third-Party Integrations**: Webhook consumers receive user_id-scoped data only
- **Admin Tools**: Admin JWT with role claim bypasses user_id filter for support operations

### Engineering Benefits
- **Code Review**: Checklist item "Does query filter by user_id?" catches 90% of security bugs
- **Integration Tests**: Automated tests create User A and User B, verify cross-user access fails
- **Penetration Testing**: ID enumeration tests validate 404 (not 403) responses
- **Monitoring**: Alert on queries missing user_id filter (database query log analysis)

### Compliance & Governance
- **GDPR**: user_id scoping enables complete data deletion, export, and audit
- **SOC 2**: Defense-in-depth (database constraints + application filters + JWT) meets control requirements
- **HIPAA**: user_id isolation ensures PHI (Protected Health Information) cannot leak between users
- **ISO 27001**: Access control pattern documented and consistently applied

This pattern is **battle-tested** (used by GitHub, Stripe, AWS), **defense-in-depth** (3+ security layers), and **compliance-ready** (GDPR, SOC 2, HIPAA). It forms the foundation for all multi-tenant security across phases.
