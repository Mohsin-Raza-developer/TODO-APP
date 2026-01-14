---
name: "database-schema-architect"
description: "Multi-user relational schema design with performance optimization, data isolation, and serverless database integration"
---

## Context

**Active State**: Database Schema Design and Data Modeling

This subagent logic MUST be triggered whenever:
- Designing database schemas for multi-user applications
- Implementing persistent storage with user data isolation requirements
- Integrating with serverless databases (Neon PostgreSQL, PlanetScale, etc.)
- Optimizing query performance for user-scoped data access
- Defining auto-increment primary keys with sequence exhaustion prevention
- Implementing audit trails with automatic timestamp tracking

## Requirements

### Multi-User Data Isolation
- Every entity table MUST include a `user_id` column (foreign key to users table)
- `user_id` column MUST be NOT NULL to prevent orphaned records
- `user_id` MUST be indexed (B-tree index) for O(log n) query performance
- All user data queries MUST include `WHERE user_id = {authenticated_user_id}` filter
- Cross-user data access MUST be prevented at database constraint level
- Foreign key constraints MUST enforce referential integrity

### Primary Key Design (ID Architect Pattern for Databases)
- Primary keys MUST use BIGINT type (BIGSERIAL in PostgreSQL) not INTEGER
- Sequences MUST start at 1 and never decrement
- Deleted record IDs MUST NEVER be reused (sequence continues)
- BIGINT provides ~9.2 quintillion capacity (effectively unlimited)
- Auto-increment MUST be database-native (SERIAL/BIGSERIAL) not application-generated
- Concurrent inserts MUST receive unique, sequential IDs without collisions

### Index Strategy
- MUST create explicit index on all foreign key columns (especially `user_id`)
- Index syntax: `CREATE INDEX idx_<table>_<column> ON <table>(<column>)`
- B-tree indexes MUST be used for equality and range queries (PostgreSQL default)
- Composite indexes MUST be considered when queries filter by multiple columns
- Index creation MUST be included in migration scripts, not added post-deployment
- Query performance targets MUST be defined and measurable (e.g., <100ms for typical datasets)

### Timestamp Automation
- `created_at` MUST use database-level DEFAULT constraint (PostgreSQL: `DEFAULT NOW()`)
- `updated_at` MUST use database-level UPDATE trigger (not ORM-level event listeners)
- Timestamp automation MUST be enforced at database level for all clients (ORM, admin tools, direct SQL)
- Timestamps MUST be stored in UTC timezone for consistency
- Application code MUST NOT manually set `created_at` or `updated_at` values
- Database triggers MUST update `updated_at` on ANY column modification

### Connection Pooling (Serverless Databases)
- Serverless databases MUST use pooled connection endpoints (e.g., Neon pooled endpoint via PgBouncer)
- Connection pooling MUST handle 10,000+ concurrent connections for high-throughput scenarios
- Application MUST configure connection timeouts to prevent indefinite waiting on pool exhaustion
- Connection strings MUST use environment variables, never hardcoded
- Pooling strategy MUST align with serverless/stateless application architecture (FastAPI, Next.js serverless functions)

### Data Cascade Behavior
- Foreign key constraints MUST define ON DELETE behavior explicitly
- User deletion MUST cascade to all owned entities (ON DELETE CASCADE) for GDPR "right to be forgotten" compliance
- Cascade behavior MUST be documented in schema specifications
- Orphaned records MUST be prevented via NOT NULL + ON DELETE CASCADE combination

### Field Constraints
- String fields with known max length MUST use VARCHAR(n) not TEXT (e.g., title VARCHAR(200))
- Boolean fields MUST have explicit defaults (e.g., `completed BOOLEAN DEFAULT FALSE`)
- Email fields MUST enforce UNIQUE constraint to prevent duplicate accounts
- Required fields MUST use NOT NULL constraint at database level
- Text fields without max length MUST use TEXT type (e.g., description)

## Examples

### ✅ Good (Phase II Reference)

```sql
-- From specs/002-database-schema/spec.md (FR-001, FR-002, FR-011)
-- PostgreSQL/Neon Serverless Database Schema

-- Users table (Better Auth integration)
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- Better Auth string-based IDs (UUIDs)
    email TEXT UNIQUE NOT NULL,  -- Prevents duplicate accounts
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()  -- Database-level automation
);

-- Tasks table (ID Architect pattern + Multi-User Isolation)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,  -- BIGINT auto-increment, ~9.2 quintillion capacity
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- GDPR compliance
    title VARCHAR(200) NOT NULL,  -- Explicit max length for validation
    description TEXT,  -- Unlimited length, nullable
    completed BOOLEAN NOT NULL DEFAULT FALSE,  -- Explicit default
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  -- Auto-set on insert
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()  -- Auto-update on modify
);

-- Performance optimization index (Assumption #10, FR-011)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);  -- O(log n) query performance

-- Timestamp automation trigger (Assumption #13, FR-009)
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
```

**Why This Satisfies Constitution v2.0.0**:
- Persistent Relational State (Principle III): Neon PostgreSQL with SQLModel ORM
- Stateless Security (Principle VII): `user_id` foreign key enforces ownership verification
- Reusable Intelligence (Principle VI): Pattern extracted from Phase II for horizontal reuse

**Performance Validation (Success Criteria SC-002)**:
```
Query: SELECT * FROM tasks WHERE user_id = 'user_123'
Dataset: 100 tasks per user
Performance: <100ms execution time (verified with B-tree index on user_id)
Result: PASS - O(log n) performance with index, prevents full table scan
```

**Data Isolation Validation (Success Criteria SC-002)**:
```
User A has 50 tasks, User B has 30 tasks
Query with user_id = 'user_A' returns exactly 50 tasks (0 cross-user leaks)
Result: PASS - 100% data isolation via WHERE user_id filter + foreign key constraint
```

**Sequential ID Validation (Success Criteria SC-003)**:
```
Create tasks 1-100 → Delete tasks 20-70 (50 tasks) → Create 10 new tasks
New task IDs: 101-110 (NOT 20-29, sequence never reuses deleted IDs)
Result: PASS - BIGSERIAL sequence continues, never decrements
```

### ❌ Bad (Anti-Patterns)

```sql
-- ANTI-PATTERN 1: INTEGER sequences (exhaustion risk)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,  -- ❌ INTEGER (max ~2.1 billion)
    user_id TEXT NOT NULL,
    title TEXT,
    completed BOOLEAN
);
```

**Architectural Risk**:
- **Sequence Exhaustion**: High-volume multi-user applications can exceed 2.1 billion tasks
- **Migration Cost**: Changing INTEGER → BIGINT after production is complex and risky
- **Downtime Risk**: Live migration requires table locks and reindexing
- **Storage Overhead**: BIGINT only costs 4 extra bytes per row (~0.01% overhead for typical schemas)
- Violates ID Architect robustness requirement (Assumption #5)

```sql
-- ANTI-PATTERN 2: Missing user_id index (performance bottleneck)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    completed BOOLEAN DEFAULT FALSE
);
-- ❌ No CREATE INDEX idx_tasks_user_id - full table scan on every query
```

**Architectural Risk**:
- **O(n) Performance**: Without index, `WHERE user_id = ?` requires full table scan
- **Scalability Failure**: Query time grows linearly with total task count across all users
- **Multi-User Degradation**: User A with 10 tasks experiences slow queries because User B has 100,000 tasks
- **Production Incident**: <100ms performance target (SC-002) fails under realistic load
- Violates Performance Target requirement (Assumption #12)

```sql
-- ANTI-PATTERN 3: Application-level timestamps (single source of truth violation)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP,  -- ❌ No DEFAULT, application must set manually
    updated_at TIMESTAMP   -- ❌ No trigger, ORM must update on every save
);
```

**Architectural Risk**:
- **Inconsistency**: Admin tools, SQL scripts, and direct database access bypass ORM and create NULL timestamps
- **Fragility**: Forgetting to set `updated_at` in application code creates audit trail gaps
- **Multi-Client Risk**: Future integrations (mobile apps, third-party tools) must duplicate timestamp logic
- **Testing Complexity**: Cannot verify database-level automation, requires end-to-end tests
- Violates Timestamp Automation requirement (Assumption #13)

```sql
-- ANTI-PATTERN 4: Missing ON DELETE CASCADE (GDPR violation)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),  -- ❌ No ON DELETE CASCADE
    title VARCHAR(200)
);

-- Later: User requests account deletion
DELETE FROM users WHERE id = 'user_123';
-- ❌ ERROR: foreign key constraint violation (tasks still reference user_123)
```

**Architectural Risk**:
- **GDPR Compliance Failure**: Cannot fulfill "right to be forgotten" without manual cleanup
- **Data Leak**: Orphaned tasks remain in database after user deletion
- **Operational Burden**: Requires application code to manually delete all user data before user deletion
- **Race Conditions**: Concurrent task creation during user deletion can create inconsistent state
- Violates ON DELETE Behavior requirement (Assumption #9, FR-010)

```sql
-- ANTI-PATTERN 5: Direct connection endpoint for serverless (connection exhaustion)
-- Connection string: postgresql://user:pass@ep-abc-123.us-east-2.aws.neon.tech/db
-- ❌ Using direct endpoint (no connection pooling) in FastAPI serverless deployment
```

**Architectural Risk**:
- **"Too Many Connections" Error**: Serverless functions create new connections on every request
- **Cold Start Penalty**: Each function instance establishes separate database connection
- **Resource Exhaustion**: PostgreSQL default max_connections (100-200) quickly exceeded
- **503 Service Unavailable**: Application crashes under moderate concurrent load
- **Cost Spike**: Forced to upgrade database tier instead of using pooling
- Violates Connection Pooling requirement (Assumption #11)

**Correct Approach**: Use pooled endpoint `postgresql://user:pass@ep-abc-123-pooler.us-east-2.aws.neon.tech/db` (note `-pooler` suffix for PgBouncer)

## Rationale

**Horizontal Intelligence for Phase III (Analytics), Phase IV (Mobile), and Phase V (Scale)**:

### Phase III: Analytics and Reporting
- **Index Strategy**: Multi-column indexes on `(user_id, created_at)` enable fast time-series queries
  - Example: "Show tasks created this week for user X" uses composite index
- **BIGINT Sequences**: Analytics queries like "total tasks created" use `MAX(id)` to estimate volume
- **Timestamp Automation**: Reliable audit trails for user activity reports ("tasks created per day")
- **B-tree Indexes**: Range queries (`WHERE created_at > '2026-01-01'`) leverage index ordering

### Phase IV: Mobile Offline-First
- **Sequential IDs**: Mobile SQLite uses same BIGINT sequence pattern for local-first consistency
- **Sync Protocol**: Server-assigned IDs (1, 2, 3...) merge cleanly with local temporary IDs (-1, -2, -3...)
- **Conflict Resolution**: Immutable IDs prevent "edit task 5 on mobile, delete task 5 on web" conflicts
- **Cache Keys**: Redis keys `user:{user_id}:tasks` use indexed `user_id` for fast invalidation

### Phase V: Horizontal Scaling
- **Sharding Strategy**: `user_id` index enables database sharding by user (User A → Shard 1, User B → Shard 2)
- **Read Replicas**: Indexed `user_id` allows load balancing read queries across replicas
- **Connection Pooling**: PgBouncer scales to 10,000+ concurrent connections without database connection limit
- **Query Performance**: <100ms SLO holds at 1M users with proper indexing (validated via load testing)

### Cross-Platform Database Portability
- **PostgreSQL → MySQL**: BIGSERIAL maps to BIGINT AUTO_INCREMENT (pattern is portable)
- **SQLModel → Raw SQL**: Database-level triggers work with any ORM or direct SQL client
- **Neon → AWS RDS**: Connection pooling pattern applies to all serverless PostgreSQL providers
- **Migration Safety**: BIGINT allows 100+ years of runway at 1M tasks/day (eliminates migration urgency)

### Engineering Benefits
- **Debugging**: `EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'user_A'` shows index usage
- **Performance Testing**: Measurable target (<100ms) enables regression detection in CI/CD
- **Code Review**: Database constraints enforce data integrity without trusting application code
- **Incident Response**: Index missing? Add `CREATE INDEX CONCURRENTLY` without downtime (PostgreSQL feature)

### Security & Compliance
- **Defense in Depth**: Database-level `user_id` filtering prevents application bugs from leaking data
- **GDPR Automation**: ON DELETE CASCADE ensures complete user data deletion (no manual cleanup)
- **Audit Trail**: Database-enforced timestamps provide non-repudiable creation/modification records
- **SQL Injection Prevention**: Indexed columns + parameterized queries prevent full table scans in attack scenarios

This pattern is **battle-tested** (PostgreSQL default for 25+ years), **scalable** (BIGINT + indexing + pooling), and **compliant** (GDPR CASCADE). It forms the foundation for all multi-user relational database schemas across phases.
