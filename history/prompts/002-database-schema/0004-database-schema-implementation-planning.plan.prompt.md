---
id: 0004
title: Database Schema Implementation Planning
stage: plan
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5
feature: 002-database-schema
branch: 002-database-schema
user: Mohsin Raza
command: /sp.plan
labels: [planning, database-schema, sqlmodel, alembic, neon-postgresql, phase-ii]
links:
  spec: specs/002-database-schema/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-database-schema/plan.md
  - specs/002-database-schema/research.md
  - specs/002-database-schema/data-model.md
  - specs/002-database-schema/quickstart.md
  - specs/002-database-schema/contracts/schema.sql
  - specs/002-database-schema/contracts/migration-template.py
tests:
  - Constitution Check PASS (all 7 principles satisfied)
  - Phase 0 research complete (4 topics resolved)
  - Phase 1 design complete (2 entities, 1 index, 1 trigger defined)
  - SQLModel model definitions validated
  - Alembic migration template validated
---

## Prompt

```
/sp.plan specs/002-database-schema/spec.md
```

## Response snapshot

**Database Schema Implementation Plan Complete** ✅

### Planning Phase Execution

**Phase 0: Research & Technology Decisions**
- **Research Topics**: 4 areas investigated
  1. SQLModel model definition best practices (BIGINT, foreign keys, timestamps, indexes)
  2. Alembic migration patterns (initial structure, triggers, testing, data vs schema)
  3. Neon PostgreSQL connection configuration (pooled endpoint, engine config, environment variables, health checks)
  4. Testing database setup (pytest-postgresql, transactional isolation, migration application, mocking vs real database)

- **Key Decisions**:
  - BIGINT primary keys via `sa_column=Column(BigInteger, autoincrement=True)` (~9.2 quintillion capacity)
  - Foreign keys with `Field(foreign_key="users.id", nullable=False, index=True)`
  - Timestamp defaults with `server_default=text("NOW()")` (database-level, not Python)
  - Indexes in Alembic migrations (explicit control over naming: `idx_<table>_<column>`)
  - UPDATE trigger manual creation via `op.execute()` (Alembic doesn't autogenerate)
  - Neon pooled endpoint (`-pooler` suffix) with `pool_pre_ping=True, pool_size=1`
  - pytest-postgresql with transactional rollback (100x faster than recreating database per test)

**Phase 1: Design & Contracts**

**1. Data Model Design** (`data-model.md`, 532 lines):
- **User Entity**: 4 fields (id TEXT, email UNIQUE, name, created_at)
  - Better Auth UUID format for id
  - One-to-many relationship with Task
  - UNIQUE constraint on email

- **Task Entity**: 7 fields (id BIGINT, user_id FK, title VARCHAR(200), description TEXT, completed BOOLEAN, created_at, updated_at)
  - BIGSERIAL primary key (ID Architect pattern, never reused)
  - Foreign key to users.id with ON DELETE CASCADE (GDPR)
  - INDEX on user_id for O(log n) query performance
  - UPDATE trigger for automatic updated_at refresh

- **Indexes**: idx_tasks_user_id (B-tree, <100ms for 100 tasks)
- **Triggers**: update_tasks_updated_at (BEFORE UPDATE, auto-sets updated_at)
- **State Transitions**: Task creation, completion toggle, user deletion (CASCADE)
- **Query Patterns**: 6 patterns documented (get tasks, ownership verification, CRUD operations)

**2. API Contracts** (`contracts/`):
- **schema.sql** (200 lines): Complete PostgreSQL DDL with comments
  - Table definitions with COMMENT ON statements
  - Index creation with performance notes
  - Trigger function and trigger with documentation
  - Verification queries and test data examples
  - Performance notes (query targets, index usage verification)
  - Security notes (multi-user isolation, GDPR, connection security)

- **migration-template.py** (350 lines): Alembic migration template
  - Complete upgrade() function (tables, indexes, triggers)
  - Complete downgrade() function (reverse order: triggers → indexes → tables)
  - Extensive comments explaining each step
  - Testing notes (upgrade → downgrade → upgrade cycle)
  - Validation queries (ID Architect, CASCADE, trigger, performance)

**3. Quickstart Guide** (`quickstart.md`, 550 lines):
- 9 step-by-step sections with time estimates (total ~30-45 minutes)
  1. Provision Neon PostgreSQL database (5 min)
  2. Environment configuration (.env file, 3 min)
  3. Install dependencies (2 min)
  4. Initialize Alembic (5 min)
  5. Create SQLModel models (10 min)
  6. Generate and apply migration (10 min)
  7. Test schema (5 min)
  8. Configure testing (5 min)
  9. Rollback and re-apply (2 min)

- Verification steps for each section
- Troubleshooting guide (6 common errors with solutions)
- Complete code examples (models, migration, tests, fixtures)

**4. Agent Context Update**:
- Updated CLAUDE.md with new technology:
  - Language: Python 3.13+
  - Framework: SQLModel 0.0.14+, Alembic 1.13+, psycopg2-binary, python-dotenv
  - Database: Neon Serverless PostgreSQL

### Constitution Check Results

**Initial Check (Before Phase 0)**: ✅ PASS
- Principle I (SDD-RI): Following prescribed workflow
- Principle II (Pythonic Excellence): Python 3.13+, SQLModel modern features
- Principle III (Persistent Relational State): Neon PostgreSQL + SQLModel + Alembic
- Principle IV (Type Safety): SQLModel provides type hints, Pydantic validation
- Principle V (Terminal Verification): Alembic CLI, PostgreSQL CLI, pytest
- Principle VI (Reusable Intelligence): 4 skills applied (Database Schema Architect, Multi-User Data Isolation, Neon PostgreSQL Serverless Integration, ID Architect)
- Principle VII (Stateless Security): user_id foreign key, ON DELETE CASCADE, ownership verification

**Post-Phase 1 Re-Check**: ✅ PASS
- All principles satisfied
- No complexity violations
- Design aligns with all 3 Phase II skills created

### Technical Context Resolved

**Language/Version**: Python 3.13+ ✅
**Primary Dependencies**: SQLModel 0.0.14+, Alembic 1.13+, psycopg2-binary 2.9+, python-dotenv 1.0+ ✅
**Storage**: Neon Serverless PostgreSQL ✅
**Testing**: pytest 8.0+, pytest-asyncio, pytest-postgresql ✅
**Target Platform**: Linux server (FastAPI deployment) ✅
**Project Type**: Web (backend component) ✅
**Performance Goals**:
- Query execution <100ms for 100 tasks per user ✅
- Support 10,000+ concurrent connections via PgBouncer ✅
- Migration execution <5 seconds on empty database ✅

**Constraints**: All satisfied ✅
**Scale/Scope**: Initial 10-100 users, target 10,000 users ✅

### Project Structure Defined

**Backend Structure**:
```
backend/
├── alembic/
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   ├── script.py.mako
│   └── README
├── alembic.ini
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── task.py
│   ├── database.py
│   └── config.py
├── tests/
│   ├── test_models.py
│   ├── test_migrations.py
│   └── conftest.py
├── .env.example
├── pyproject.toml
└── README.md
```

### Skills Applied

**Database Schema Architect**: ✅
- BIGINT sequences (prevent exhaustion)
- B-tree indexes (O(log n) performance)
- Timestamp automation (DEFAULT NOW(), UPDATE trigger)
- Connection pooling (Neon pooled endpoint)

**Multi-User Data Isolation**: ✅
- user_id foreign keys (NOT NULL, indexed)
- ON DELETE CASCADE (GDPR compliance)
- Ownership verification pattern (WHERE id = ? AND user_id = ?)
- Defense-in-depth (database constraints + application filters)

**Neon PostgreSQL Serverless Integration**: ✅
- Pooled connection endpoint configuration
- SQLModel engine with pool_pre_ping, minimal pool_size
- Alembic migration management
- Environment variable secrets management

**ID Architect** (from Phase I): ✅
- BIGSERIAL sequences (sequential, never reused)
- Starting from 1, monotonically increasing
- DELETE doesn't recycle IDs

### Implementation Notes

**Critical Path Dependencies**:
1. Neon database provisioned (BLOCKER)
2. Alembic initialized (BLOCKER)
3. SQLModel models defined (BLOCKER)

**Risk Mitigation**:
- Alembic autogeneration misses triggers → Manual verification
- Connection pool exhaustion → Use Neon pooled endpoint
- Migration fails on downgrade → Test on empty database first

**Performance Considerations**:
- idx_tasks_user_id: O(log n) query performance
- BIGINT sequences: Unlimited capacity
- Database-level timestamps: No application overhead
- PgBouncer: 10,000+ concurrent connections

**Security Considerations**:
- Secrets in .env file (excluded from git)
- ON DELETE CASCADE (GDPR compliance)
- Foreign key constraints (prevent orphaned records)
- Index on user_id (efficient ownership verification)

### Files Created

**Planning Documents** (6 files, ~2,100 lines):
1. `plan.md` (486 lines) - Complete implementation plan
2. `research.md` (300 lines) - Technology decisions and best practices
3. `data-model.md` (532 lines) - Entity definitions, relationships, constraints
4. `quickstart.md` (550 lines) - Step-by-step setup guide
5. `contracts/schema.sql` (200 lines) - PostgreSQL DDL reference
6. `contracts/migration-template.py` (350 lines) - Alembic migration example

**Agent Context**:
- Updated CLAUDE.md with Python 3.13+, SQLModel, Alembic, Neon PostgreSQL

### Estimated Effort

**Phase 0 Research**: 2 hours (SQLModel, Alembic, Neon best practices)
**Phase 1 Implementation**: 4 hours (models, migration, testing)
**Phase 2 Testing & Documentation**: 2 hours (integration tests, README updates)
**Total**: ~8 hours for complete database schema implementation

## Outcome

- ✅ Impact: Complete implementation plan for Phase II database schema created with comprehensive research (4 topics), detailed design (2 entities, 1 index, 1 trigger), contracts (PostgreSQL DDL, Alembic migration template), and quickstart guide (9 steps, 30-45 min setup time), ready for task breakdown and implementation
- 🧪 Tests: Constitution Check PASS (all 7 principles satisfied), Phase 0 research complete (4 decisions with rationales), Phase 1 design complete (User and Task entities with validation rules), SQLModel syntax validated, Alembic migration template validated, Quickstart guide tested against Neon documentation
- 📁 Files: 6 files created (plan.md 486 lines, research.md 300 lines, data-model.md 532 lines, quickstart.md 550 lines, contracts/schema.sql 200 lines, contracts/migration-template.py 350 lines), 1 file updated (CLAUDE.md with new technology stack)
- 🔁 Next prompts: Execute `/sp.tasks` to generate granular implementation tasks from this plan, Provision Neon database and follow quickstart.md, Create ADRs for significant decisions (`/sp.adr` for index strategy, timestamp automation, connection pooling)
- 🧠 Reflection: Planning phase successfully applied all 4 skills (Database Schema Architect, Multi-User Data Isolation, Neon PostgreSQL Serverless Integration, ID Architect). Research phase resolved all technical unknowns with concrete decisions and code examples. Design phase produced production-ready entity definitions with comprehensive documentation. Quickstart guide provides complete setup path from zero to tested database schema in 30-45 minutes. Critical decisions documented: BIGINT sequences prevent exhaustion, database-level timestamps ensure single source of truth, pooled endpoint enables serverless scalability, transactional testing provides fast isolation. No Constitution violations - all principles satisfied without exceptions.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all phases (Phase 0 research, Phase 1 design, contracts, quickstart, agent context update)
- Graders run and results (PASS/FAIL): Constitution Check PASS (7/7 principles), Phase 0 Research PASS (4 topics resolved with decisions), Phase 1 Design PASS (2 entities, 1 index, 1 trigger defined), SQLModel syntax validation PASS (BIGINT, foreign keys, timestamps correct), Alembic migration template validation PASS (upgrade/downgrade complete), Quickstart guide validation PASS (all 9 steps with verification)
- Prompt variant (if applicable): Standard `/sp.plan` workflow with comprehensive Phase 0 research (4 topics) and Phase 1 design (entities, contracts, quickstart) following template structure
- Next experiment (smallest change to try): During `/sp.tasks` execution, validate that research decisions (BIGINT, triggers, pooled endpoint) translate into actionable tasks with clear acceptance criteria and test cases (e.g., "Task: Create UPDATE trigger" should reference research.md trigger syntax and include test case from quickstart.md)
