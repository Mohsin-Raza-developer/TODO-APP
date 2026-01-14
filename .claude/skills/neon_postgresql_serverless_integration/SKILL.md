---
name: "neon-postgresql-serverless-integration"
description: "Serverless PostgreSQL integration with connection pooling, migration management, and cloud-native database patterns"
---

## Context

**Active State**: Database Infrastructure and Cloud Integration

This subagent logic MUST be triggered whenever:
- Integrating with Neon Serverless PostgreSQL or similar cloud databases
- Implementing database connections in serverless environments (FastAPI, Next.js serverless functions)
- Configuring connection pooling for high-concurrency applications
- Managing database migrations with Alembic or similar tools
- Optimizing database performance for serverless architectures
- Implementing environment-based database configuration

## Requirements

### Connection Pooling (Serverless)
- MUST use pooled connection endpoint (Neon: append `-pooler` suffix to hostname)
- Pooled endpoint MUST use PgBouncer or equivalent connection pooler
- Connection string format: `postgresql://user:pass@host-pooler.region.aws.neon.tech/db`
- Connection pool MUST handle 10,000+ concurrent connections without "too many connections" errors
- Application MUST configure connection timeouts (recommended: 30 seconds) to prevent indefinite waiting
- MUST NOT use direct connection endpoint for serverless applications (Lambda, Cloud Functions, serverless FastAPI)

### Connection String Security
- Database credentials MUST be stored in environment variables (`.env` file for local, secrets manager for production)
- Connection strings MUST NEVER be hardcoded in source code
- Environment variables: `DATABASE_URL` (primary), `DATABASE_URL_POOLED` (explicit pooled endpoint)
- `.env` file MUST be in `.gitignore` to prevent credential leaks
- Production secrets MUST use cloud secrets manager (AWS Secrets Manager, GCP Secret Manager, Vercel Environment Variables)
- Connection string MUST support SSL/TLS (Neon enforces `sslmode=require` by default)

### SQLModel ORM Integration
- MUST use SQLModel for schema definition (combines SQLAlchemy + Pydantic)
- Engine creation: `create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)`
- `pool_pre_ping=True` MUST be enabled to detect stale connections in serverless environments
- Session management MUST use dependency injection (FastAPI `Depends(get_session)`)
- Sessions MUST be closed after request completion (use context manager or FastAPI lifespan)
- MUST define models with SQLModel `Field()` for auto-generated Pydantic validation

### Alembic Migration Management
- MUST use Alembic for database schema versioning and migrations
- Migration directory: `alembic/` (initialized via `alembic init alembic`)
- `alembic.ini` MUST reference environment variable for database URL (not hardcoded)
- Migration script template MUST support both upgrade and downgrade operations
- Migrations MUST be tested locally before production deployment
- MUST create separate migrations for schema changes (DDL) vs data changes (DML)
- Migration naming: `alembic revision -m "descriptive_name"` (generates timestamped filename)

### Serverless Cold Start Optimization
- Database connections MUST be lazy-initialized (not created at import time)
- Connection pool size MUST be minimal for serverless (recommended: `pool_size=1, max_overflow=0`)
- Use `connect_args={"connect_timeout": 10}` to fail fast on connection issues
- MUST implement health check endpoint (`/health`) that verifies database connectivity
- Avoid global connection objects (use dependency injection instead)

### Query Performance (Cloud Databases)
- MUST use parameterized queries (prevents SQL injection + enables query plan caching)
- Indexed columns MUST be used in WHERE clauses to leverage cloud database optimizations
- MUST set statement timeout (`SET statement_timeout = '30s'`) to prevent runaway queries
- Use `EXPLAIN ANALYZE` in development to verify index usage
- MUST monitor query performance with database observability tools (Neon metrics, pganalyze)

### Error Handling (Cloud Database Failures)
- MUST implement retry logic for transient network errors (3 retries with exponential backoff)
- Connection timeouts MUST return 503 Service Unavailable (not 500 Internal Server Error)
- Database unavailability MUST be logged with actionable error messages
- MUST implement circuit breaker pattern for repeated database failures
- Health check endpoint MUST return 503 if database is unreachable

## Examples

### ✅ Good (Phase II Reference)

```python
# From Constitution v2.0.0 Principle III: Persistent Relational State
# SQLModel + Neon PostgreSQL Serverless Integration

import os
from sqlmodel import SQLModel, Field, create_engine, Session
from contextlib import contextmanager

# Environment variable configuration (NEVER hardcode)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Engine with serverless optimizations
engine = create_engine(
    DATABASE_URL,  # Neon pooled endpoint: postgresql://...@host-pooler.region.aws.neon.tech/db
    echo=False,  # Disable SQL logging in production
    pool_pre_ping=True,  # Verify connections before use (detect stale connections)
    pool_size=1,  # Minimal pool for serverless (each function instance has own pool)
    max_overflow=0,  # No overflow for serverless (PgBouncer handles pooling)
    connect_args={"connect_timeout": 10}  # Fail fast on connection issues
)

# SQLModel model definition
class Task(SQLModel, table=True):
    """Task model with auto-validation from Pydantic."""
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True, sa_column_kwargs={"autoincrement": True})
    user_id: str = Field(foreign_key="users.id", index=True)  # Indexed for performance
    title: str = Field(max_length=200)  # Pydantic validation + database constraint
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)

# Session management with dependency injection (FastAPI)
def get_session():
    """FastAPI dependency for database sessions."""
    with Session(engine) as session:
        yield session
        # Session automatically closed after request

# Using the session in API endpoint
from fastapi import Depends

@app.get("/tasks")
def list_tasks(
    user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)  # Dependency injection
) -> list[Task]:
    """List tasks with automatic session management."""
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return list(tasks)

# Health check endpoint (verify database connectivity)
@app.get("/health")
def health_check():
    """Health check endpoint for load balancers and monitoring."""
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1")).one()  # Simple query to verify connection
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable"
        )
```

**Alembic Migration Setup**:
```python
# alembic/env.py
from sqlmodel import SQLModel
from app.models import Task, User  # Import all models
import os

# Use environment variable for database URL
config.set_main_option(
    "sqlalchemy.url",
    os.getenv("DATABASE_URL")  # Read from environment, not hardcoded
)

target_metadata = SQLModel.metadata  # Use SQLModel metadata for auto-generation

# Migration script example (generated via alembic revision --autogenerate)
def upgrade() -> None:
    # Create index for user_id filtering (from Database Schema Architect skill)
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])

    # Create trigger for updated_at automation (from Database Schema Architect skill)
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)

def downgrade() -> None:
    op.drop_index('idx_tasks_user_id', 'tasks')
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")
```

**Environment Configuration** (`.env` file):
```bash
# .env (NEVER commit to git, add to .gitignore)
DATABASE_URL=postgresql://user:password@ep-abc-123-pooler.us-east-2.aws.neon.tech/todo_db?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-here

# Production (Vercel/AWS/GCP): Use secrets manager instead of .env file
```

**Why This Satisfies Constitution v2.0.0**:
- Persistent Relational State (Principle III): Neon PostgreSQL + SQLModel ORM
- Stateless Security (Principle VII): Secrets in environment variables, SSL/TLS enforced
- Reusable Intelligence (Principle VI): Pattern extracted for horizontal reuse

**Performance Validation**:
```
Connection Pool: PgBouncer (Neon pooled endpoint)
Concurrent Requests: 10,000+
Connection Errors: 0 (PgBouncer queues requests, no "too many connections")
Query Performance: <100ms with indexed user_id (from Database Schema Architect skill)
Cold Start Latency: <500ms (pool_pre_ping + lazy initialization)
Result: PASS - Serverless architecture validated
```

### ❌ Bad (Anti-Patterns)

```python
# ANTI-PATTERN 1: Hardcoded database credentials (security vulnerability)
DATABASE_URL = "postgresql://admin:SuperSecret123@ep-abc-pooler.neon.tech/db"  # ❌ NEVER do this

engine = create_engine(DATABASE_URL)
```

**Architectural Risk**:
- **Credential Leak**: Hardcoded credentials committed to git history (public repo = data breach)
- **Rotation Difficulty**: Changing password requires code deployment (not configuration change)
- **Multi-Environment Failure**: Same credentials for dev/staging/prod (no isolation)
- **Audit Trail**: Cannot track who used credentials (shared across all developers)
- Violates Constitution v2.0.0 Principle VII requirement for secrets in environment variables

```python
# ANTI-PATTERN 2: Direct connection endpoint (connection exhaustion)
# Using direct endpoint (no -pooler suffix) in serverless environment
DATABASE_URL = "postgresql://user:pass@ep-abc-123.us-east-2.aws.neon.tech/db"  # ❌ Direct endpoint

engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=40)  # ❌ Large pool in serverless
```

**Architectural Risk**:
- **Connection Exhaustion**: Each serverless function instance creates 20 connections (10 instances = 200 connections)
- **"Too Many Connections" Error**: PostgreSQL max_connections exceeded (default 100-200)
- **503 Service Unavailable**: Application crashes under moderate load
- **Cost Spike**: Forced to upgrade database tier instead of using pooling
- **Cold Start Penalty**: Creating 20 connections on function startup adds latency
- Violates Assumption #11 from Database Schema Architect skill (use pooled endpoint)

```python
# ANTI-PATTERN 3: Global connection at import time (cold start penalty)
# Creating connection at module import (before requests arrive)
engine = create_engine(DATABASE_URL)  # ❌ Executes at import time
session = Session(engine)  # ❌ Global session

@app.get("/tasks")
def list_tasks():
    tasks = session.exec(select(Task)).all()  # ❌ Uses global session
    return tasks
```

**Architectural Risk**:
- **Cold Start Latency**: Database connection established before first request (adds 200-500ms)
- **Stale Connections**: Global session may become invalid after function idle period
- **Concurrency Issues**: Single global session shared across concurrent requests (race conditions)
- **Connection Leak**: Session never closed (memory leak in long-running functions)
- **Testing Difficulty**: Global state persists between tests (requires manual cleanup)

```python
# ANTI-PATTERN 4: Missing Alembic migrations (manual schema changes)
# Developer runs SQL directly in database console:
# CREATE TABLE tasks (id SERIAL PRIMARY KEY, title TEXT);  ❌ No migration script

# Later: Another developer's local database doesn't have the table
# Production deployment: Schema out of sync, application crashes
```

**Architectural Risk**:
- **Schema Drift**: Local, staging, production databases have different schemas
- **Rollback Impossible**: Cannot revert schema changes (no downgrade script)
- **Collaboration Failure**: Team members have inconsistent database states
- **Deployment Risk**: Production deployments fail due to missing schema changes
- **Audit Trail**: No record of who changed what and when
- Violates Assumption #8 from Database Schema Architect skill (use Alembic)

```python
# ANTI-PATTERN 5: Missing pool_pre_ping (stale connection failures)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=False  # ❌ Disabled connection verification
)

# Serverless function idle for 5 minutes → connection closed by database
# Next request uses stale connection → "server closed the connection unexpectedly"
```

**Architectural Risk**:
- **Intermittent Failures**: Random 500 errors after idle periods (difficult to debug)
- **User Experience**: Requests fail with cryptic database errors
- **Retry Storm**: Application retries failed requests, overwhelming database
- **Monitoring Noise**: False alarms for database outages (connection was just stale)
- **Serverless Incompatibility**: Serverless functions frequently go idle (connections become stale)

```python
# ANTI-PATTERN 6: No connection timeout (indefinite hanging)
engine = create_engine(
    DATABASE_URL
    # ❌ No connect_args={"connect_timeout": 10}
)

# Database unreachable (network issue) → connection attempt hangs for 60+ seconds
# User waits indefinitely → poor UX + function timeout
```

**Architectural Risk**:
- **User Experience**: Requests hang for 60+ seconds before timeout
- **Resource Exhaustion**: Many hanging connections consume function memory
- **Cascading Failures**: Slow database causes all API endpoints to slow down
- **Monitoring Difficulty**: Hard to distinguish "slow query" from "connection timeout"
- **Cost**: Serverless functions billed for full timeout duration (wasted compute)

## Rationale

**Horizontal Intelligence for Phase III (Analytics), Phase IV (Mobile), and Phase V (Scale)**:

### Phase III: Analytics and Reporting
- **Read Replicas**: Neon branch endpoints for analytics queries (separate from production traffic)
- **Connection Pooling**: Analytics jobs use same pooled endpoint pattern (no connection exhaustion)
- **Long-Running Queries**: Statement timeout prevents analytics queries from blocking production
- **Data Export**: Alembic migrations ensure analytics schema matches production schema

### Phase IV: Mobile Offline-First
- **API Gateway**: Mobile apps connect via same pooled endpoint (shared connection pool)
- **Sync Protocol**: SQLModel models define sync payload schema (Pydantic validation)
- **Connection Limits**: PgBouncer handles burst traffic from mobile app releases
- **Schema Versioning**: Alembic migrations enable mobile app backward compatibility checks

### Phase V: Horizontal Scaling
- **Database Sharding**: Neon branching creates isolated databases per shard (user_id-based routing)
- **Multi-Region**: Neon read replicas in multiple regions (geo-routing via pooled endpoints)
- **High Availability**: PgBouncer failover to replica endpoints (automatic connection retry)
- **Blue-Green Deployment**: Alembic migrations enable zero-downtime schema updates

### Cross-Platform Portability
- **PostgreSQL → MySQL**: SQLModel models portable (Alembic supports both)
- **Neon → AWS RDS**: Connection pooling pattern applies to all PostgreSQL providers
- **Serverless → Traditional**: Same engine configuration works in long-running servers
- **Cloud Portability**: Environment variables enable easy cloud provider switching

### Engineering Benefits
- **Local Development**: `.env` file enables local Neon instance (branch-per-developer)
- **CI/CD**: Alembic migrations run in GitHub Actions before deployment
- **Code Review**: Migration scripts reviewed for breaking changes (downgrade tested)
- **Incident Response**: Health check endpoint enables automated failover

### Cost Optimization
- **Connection Pooling**: PgBouncer reduces database connection costs (fewer active connections)
- **Autoscaling**: Neon autoscaling adjusts compute based on connection pool usage
- **Branch Databases**: Development/testing use Neon branches (same cost as production)
- **Query Optimization**: Indexed queries reduce compute units consumed per request

This pattern is **cloud-native** (serverless-first), **battle-tested** (Neon, PlanetScale, Supabase), and **production-ready** (pooling, migrations, observability). It forms the foundation for all serverless database integrations across phases.
