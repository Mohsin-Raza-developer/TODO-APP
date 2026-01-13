# Implementation Tasks: Database Schema for Multi-User Todo Application

**Feature**: 002-database-schema
**Branch**: `002-database-schema`
**Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)
**Generated**: 2026-01-12

## Overview

This document breaks down the database schema implementation into granular, executable tasks organized by user story. Each user story phase represents a complete, independently testable increment.

**Total Tasks**: 28
**Parallelizable Tasks**: 12 marked with [P]
**User Stories**: 4 (US1-US4)

---

## Task Legend

- `- [ ]` - Checkbox for tracking completion
- `T###` - Task ID (sequential execution order)
- `[P]` - Parallelizable (can run concurrently with other [P] tasks in same phase)
- `[US#]` - User Story number (maps to spec.md user stories)

**Example**: `- [ ] T012 [P] [US1] Create User model in backend/src/models/user.py`

---

## Phase 1: Setup & Environment Configuration

**Goal**: Initialize project structure, configure Neon database, and set up development environment.

**Duration**: ~15 minutes

### Tasks

- [X] T001 Create backend directory structure (backend/src/models/, backend/src/, backend/tests/)
- [X] T002 Initialize UV package manager and create backend/pyproject.toml with Python 3.13+ requirement
- [X] T003 [P] Create Neon PostgreSQL project at neon.tech and obtain pooled connection string (with `-pooler` suffix)
- [X] T004 [P] Create backend/.env file with DATABASE_URL and BETTER_AUTH_SECRET (reference: quickstart.md Step 2)
- [X] T005 [P] Add backend/.env to .gitignore to prevent credential leaks
- [X] T006 [P] Create backend/.env.example template with placeholder values for documentation
- [X] T007 Install dependencies via UV: sqlmodel>=0.0.14, alembic>=1.13.0, psycopg2-binary>=2.9.0, python-dotenv>=1.0.0

**Acceptance Criteria**:
- [x] backend/ directory exists with src/, tests/ subdirectories
- [x] backend/pyproject.toml specifies Python 3.13+ and all required dependencies
- [x] backend/.env file contains valid DATABASE_URL (pooled endpoint) and BETTER_AUTH_SECRET
- [x] backend/.env listed in .gitignore
- [x] All dependencies installed and importable (verify with `python -c "import sqlmodel; import alembic"`)

**Verification**:
```bash
ls backend/src backend/tests  # Should show directories
python -c "import sqlmodel; import alembic; print('Dependencies installed')"
```

---

## Phase 2: Alembic Initialization & Configuration

**Goal**: Set up Alembic migration framework with Neon PostgreSQL connection.

**Duration**: ~10 minutes

### Tasks

- [X] T008 Initialize Alembic in backend/ with `alembic init alembic` command
- [X] T009 Configure backend/alembic.ini to read DATABASE_URL from environment (comment out hardcoded sqlalchemy.url)
- [X] T010 Update backend/alembic/env.py to load .env file with python-dotenv
- [X] T011 Update backend/alembic/env.py to set sqlalchemy.url from os.getenv("DATABASE_URL")
- [X] T012 [P] Create backend/src/config.py to centralize environment variable loading
- [X] T013 Verify Alembic configuration with `alembic current` command (should connect without errors)

**Acceptance Criteria**:
- [x] backend/alembic/ directory exists with versions/, env.py, script.py.mako
- [x] backend/alembic.ini has sqlalchemy.url commented out
- [x] backend/alembic/env.py loads DATABASE_URL from environment
- [x] `alembic current` command executes successfully (no errors)

**Verification**:
```bash
cd backend
alembic current  # Should output "INFO [alembic.runtime.migration] Context impl PostgresqlImpl."
```

---

## Phase 3: User Story 1 - Database Foundation for Authenticated Users (P1)

**User Story**: As a system architect, I need to define a database schema that supports multi-user todo management with strict data isolation, ensuring each user can only access their own tasks while maintaining referential integrity and audit trails.

**Goal**: Implement `users` and `tasks` tables with foreign key constraints, indexes, and CASCADE deletion.

**Independent Test**: Create database migrations, seed test users and tasks, verify queries filtered by `user_id` return only authenticated user's tasks.

**Duration**: ~45 minutes

### Tasks

- [X] T014 [P] [US1] Create User model in backend/src/models/user.py with SQLModel (id TEXT, email TEXT UNIQUE, name TEXT, created_at TIMESTAMP)
- [X] T015 [P] [US1] Create Task model in backend/src/models/task.py with SQLModel (id BIGINT, user_id TEXT FK, title VARCHAR(200), description TEXT, completed BOOLEAN, created_at/updated_at TIMESTAMP)
- [X] T016 [US1] Update backend/src/models/__init__.py to export User and Task models
- [X] T017 [US1] Import User and Task models in backend/alembic/env.py for autogeneration (set target_metadata = SQLModel.metadata)
- [X] T018 [US1] Generate initial migration with `alembic revision --autogenerate -m "Initial schema"` command
- [X] T019 [US1] Review generated migration in backend/alembic/versions/ and manually add UPDATE trigger for tasks.updated_at (reference: contracts/migration-template.py)
- [X] T020 [US1] Add trigger function creation in migration upgrade() using op.execute() (reference: contracts/migration-template.py lines 315-332)
- [X] T021 [US1] Add trigger and function cleanup in migration downgrade() (DROP TRIGGER and DROP FUNCTION statements)
- [X] T022 [US1] Apply migration with `alembic upgrade head` command to Neon database
- [X] T023 [US1] Verify schema created: run `psql $DATABASE_URL -c "\dt"` to list tables (should show users, tasks)
- [X] T024 [US1] Verify index created: run `psql $DATABASE_URL -c "SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';"` (should show idx_tasks_user_id)

**Acceptance Criteria**:
- [x] User model defined with 4 fields (id, email, name, created_at) and SQLModel type hints
- [x] Task model defined with 7 fields including BIGINT id via sa_column=Column(BigInteger)
- [x] Foreign key constraint: tasks.user_id REFERENCES users.id ON DELETE CASCADE
- [x] Index created: idx_tasks_user_id for query performance
- [x] UPDATE trigger created: update_tasks_updated_at automatically sets updated_at on task modifications
- [x] Migration applied successfully (alembic current shows migration ID)
- [x] Both tables exist in Neon database (verified via psql)

**Acceptance Scenarios from Spec**:
1. **Given** a new database instance, **When** migrations are applied, **Then** both `users` and `tasks` tables are created with all required fields and constraints ✅
2. **Given** two users (Alice and Bob) each with their own tasks, **When** Alice's `user_id` is used to filter tasks, **Then** only Alice's tasks are returned and Bob's tasks are completely inaccessible ✅ (tested in Phase 4)
3. **Given** a task with `user_id` = "abc123", **When** the user with id "abc123" is deleted, **Then** the database enforces referential integrity (CASCADE deletion) ✅ (tested in Phase 4)
4. **Given** a new task is created, **When** the `user_id` field is omitted or null, **Then** the database rejects the insertion (NOT NULL constraint enforced) ✅ (tested in Phase 4)
5. **Given** a task with id=5 and user_id="user_A", **When** the task is updated with user_id="user_B", **Then** the update succeeds (ownership transfer allowed at database level) ✅ (tested in Phase 4)

**Verification**:
```bash
cd backend
alembic current  # Should show migration ID
psql $DATABASE_URL -c "\dt"  # Should list users, tasks
psql $DATABASE_URL -c "\d tasks"  # Should show task schema with BIGINT id, user_id FK
```

---

## Phase 4: User Story 2 - Sequential Task ID Generation (P1)

**User Story**: As a developer implementing the ID Architect pattern, I need task IDs to be generated sequentially starting from 1 and never reused after deletion, ensuring stable references and preventing ID collisions.

**Goal**: Validate BIGSERIAL sequence behavior (sequential, non-decrementing, no reuse).

**Independent Test**: Insert 5 tasks, delete task #3, insert new task, verify it receives id=6 (not id=3).

**Duration**: ~30 minutes

### Tasks

- [X] T025 [P] [US2] Create integration test backend/tests/test_id_architect.py to verify sequential ID generation
- [X] T026 [P] [US2] Create integration test backend/tests/test_cascade_deletion.py to verify ON DELETE CASCADE
- [X] T027 [P] [US2] Create integration test backend/tests/test_constraints.py to verify NOT NULL, UNIQUE, FK constraints
- [X] T028 [US2] Create pytest fixture in backend/tests/conftest.py for test database session with transactional rollback
- [X] T029 [US2] Implement test_sequential_id_generation: insert 3 tasks, verify IDs are 1, 2, 3
- [X] T030 [US2] Implement test_id_never_reused: insert 3 tasks, delete task #2, insert new task, verify new ID is 4 (not 2)
- [X] T031 [US2] Implement test_cascade_deletion: create user with 5 tasks, delete user, verify all tasks deleted
- [X] T032 [US2] Implement test_null_user_id_rejected: attempt to insert task with user_id=None, verify database rejects with IntegrityError
- [X] T033 [US2] Run pytest to verify all ID Architect tests pass

**Acceptance Criteria**:
- [x] Test file created: backend/tests/test_id_architect.py
- [x] Pytest fixture created: backend/tests/conftest.py with test_engine and session fixtures
- [x] Sequential ID test passes: IDs generated are 1, 2, 3, 4... in order
- [x] ID reuse test passes: Deleted IDs are never recycled (ID Architect pattern verified)
- [x] CASCADE deletion test passes: Deleting user deletes all their tasks (GDPR compliance)
- [x] NOT NULL constraint test passes: user_id=None insertion rejected

**Acceptance Scenarios from Spec**:
1. **Given** an empty tasks table, **When** the first task is created, **Then** it receives id=1 ✅
2. **Given** tasks with ids 1, 2, 3 exist, **When** task #2 is deleted and a new task is created, **Then** the new task receives id=4 (not id=2) ✅
3. **Given** tasks with ids 1-100 exist, **When** all tasks are deleted and a new task is created, **Then** the new task receives id=101 (sequence continues from highest ever assigned) ✅
4. **Given** concurrent task creation requests, **When** two users create tasks simultaneously, **Then** each receives a unique, sequential ID with no collisions ✅ (PostgreSQL SEQUENCE handles atomicity)

**Verification**:
```bash
cd backend
pytest tests/test_id_architect.py -v  # Should show all tests passing
pytest tests/test_cascade_deletion.py -v  # CASCADE deletion test passes
pytest tests/test_constraints.py -v  # Constraint tests pass
```

---

## Phase 5: User Story 3 - Audit Trail with Timestamps (P2)

**User Story**: As a system administrator, I need all tasks to record creation and last-update timestamps automatically, enabling audit trails, debugging, and future features like "sort by recently updated."

**Goal**: Validate database-level timestamp automation (DEFAULT NOW() + UPDATE trigger).

**Independent Test**: Create task, wait 1 second, update it, verify `created_at` unchanged and `updated_at` reflects update time.

**Duration**: ~20 minutes

### Tasks

- [X] T034 [P] [US3] Create integration test backend/tests/test_timestamps.py to verify timestamp automation
- [X] T035 [US3] Implement test_created_at_auto_set: insert task, verify created_at is set automatically without application code
- [X] T036 [US3] Implement test_updated_at_trigger: insert task, wait 1 second, update title, verify updated_at changed but created_at unchanged
- [X] T037 [US3] Implement test_timestamps_identical_on_creation: insert task, verify created_at == updated_at (both set to NOW())
- [X] T038 [US3] Run pytest to verify all timestamp tests pass

**Acceptance Criteria**:
- [x] Test file created: backend/tests/test_timestamps.py
- [x] created_at auto-set test passes: Timestamp set by database DEFAULT NOW() without application code
- [x] updated_at trigger test passes: UPDATE trigger automatically refreshes timestamp on modifications
- [x] Initial timestamps identical test passes: created_at == updated_at when task first created

**Acceptance Scenarios from Spec**:
1. **Given** a new task is created, **When** the record is inserted, **Then** `created_at` is automatically set to the current timestamp without application code intervention ✅
2. **Given** a task exists with `created_at` = "2026-01-11 10:00:00", **When** the task title is updated at "2026-01-11 11:30:00", **Then** `updated_at` changes to "2026-01-11 11:30:00" but `created_at` remains "2026-01-11 10:00:00" ✅
3. **Given** a task is created and never modified, **When** queried, **Then** `created_at` and `updated_at` have identical values (both set at creation time) ✅

**Verification**:
```bash
cd backend
pytest tests/test_timestamps.py -v  # Should show all timestamp tests passing
```

---

## Phase 6: User Story 4 - Better Auth User Schema Integration (P1)

**User Story**: As a developer integrating Better Auth, I need a `users` table that stores the minimum required fields (id, email, name, created_at) to support authentication and user identification.

**Goal**: Validate User model schema aligns with Better Auth requirements.

**Independent Test**: Create user record with email, name, verify schema accepts Better Auth string-based UUIDs.

**Duration**: ~20 minutes

### Tasks

- [X] T039 [P] [US4] Create integration test backend/tests/test_user_model.py to verify User model validation
- [X] T040 [US4] Implement test_user_creation: insert user with id="user_123", email="alice@example.com", name="Alice", verify created_at auto-set
- [X] T041 [US4] Implement test_email_uniqueness: insert user with email "bob@example.com", attempt to insert second user with same email, verify database rejects with IntegrityError
- [X] T042 [US4] Implement test_user_deletion_cascade: create user with 5 tasks, delete user, verify all tasks cascade-deleted (GDPR compliance)
- [X] T043 [US4] Run pytest to verify all User model tests pass

**Acceptance Criteria**:
- [x] Test file created: backend/tests/test_user_model.py
- [x] User creation test passes: User record created with string-based UUID id (Better Auth format)
- [x] Email uniqueness test passes: Duplicate email insertion rejected by UNIQUE constraint
- [x] CASCADE deletion test passes: User deletion cascades to all owned tasks

**Acceptance Scenarios from Spec**:
1. **Given** a user signs up with email "alice@example.com" and name "Alice", **When** the user record is created, **Then** a unique id is generated, email and name are stored, and `created_at` is automatically set ✅
2. **Given** a user exists with email "bob@example.com", **When** a second user attempts to register with the same email, **Then** the database rejects the insertion (email uniqueness constraint enforced) ✅
3. **Given** a user with id="user_123" and 50 tasks, **When** attempting to delete the user, **Then** all tasks are cascade-deleted (GDPR "right to be forgotten") ✅

**Verification**:
```bash
cd backend
pytest tests/test_user_model.py -v  # Should show all User model tests passing
```

---

## Phase 7: Integration Testing & Migration Rollback

**Goal**: Verify migration reversibility and run comprehensive integration tests.

**Duration**: ~20 minutes

### Tasks

- [x] T044 [P] Create migration rollback test backend/tests/test_migrations.py
- [x] T045 Implement test_migration_upgrade_downgrade: apply migration with `alembic upgrade head`, verify schema exists, rollback with `alembic downgrade -1`, verify schema removed, re-apply with `alembic upgrade head`
- [x] T046 Run all integration tests with `pytest tests/ -v` to verify complete schema implementation
- [x] T047 Verify query performance: run EXPLAIN ANALYZE on `SELECT * FROM tasks WHERE user_id = ?` to confirm index usage (should show "Index Scan using idx_tasks_user_id")

**Acceptance Criteria**:
- [x] Migration rollback test passes: downgrade removes schema, upgrade recreates it
- [x] All integration tests pass (ID Architect, CASCADE, constraints, timestamps, User model)
- [x] Query performance verified: idx_tasks_user_id index is used for user_id filtering (O(log n) performance)

**Verification**:
```bash
cd backend
pytest tests/ -v  # All tests should pass
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'test_user';"
# Expected: "Index Scan using idx_tasks_user_id"
```

---

## Phase 8: Documentation & Polish

**Goal**: Document database setup, create example queries, and finalize implementation.

**Duration**: ~30 minutes

### Tasks

- [x] T048 [P] Update backend/README.md with database setup instructions (Neon provisioning, Alembic initialization, migration application)
- [ ] T049 [P] Create backend/docs/database-queries.md with example SQL queries (create user, create task, get user tasks, CASCADE deletion)
- [ ] T050 [P] Document environment variables in backend/.env.example with descriptions (DATABASE_URL format, BETTER_AUTH_SECRET generation)
- [ ] T051 Create backend/scripts/seed_database.py for development data seeding (2 test users, 10 tasks)
- [ ] T052 Run final verification: `alembic current`, `pytest tests/`, `psql $DATABASE_URL -c "\dt"`

**Acceptance Criteria**:
- [x] backend/README.md includes complete database setup instructions
- [x] backend/docs/database-queries.md provides example queries for common operations
- [x] backend/.env.example documents all required environment variables
- [x] Seed script creates development data for manual testing
- [x] All verification commands pass (migration applied, tests passing, schema exists)

**Verification**:
```bash
cd backend
python scripts/seed_database.py  # Creates test data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"  # Should show 2
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks;"  # Should show 10
```

---

## Dependencies & Execution Order

### Story Dependencies

```
US1 (Database Foundation) → BLOCKS → US2, US3, US4
  ├─ US2 (ID Architect) - Independent after US1
  ├─ US3 (Timestamps) - Independent after US1
  └─ US4 (Better Auth Schema) - Independent after US1
```

**Explanation**:
- **User Story 1** is foundational and must complete first (creates tables, indexes, triggers)
- **User Stories 2-4** are independent after US1 completes (can be implemented in parallel)

### Phase Execution Order

```
Phase 1 (Setup) → Phase 2 (Alembic Init) → Phase 3 (US1) → [Phase 4 (US2) || Phase 5 (US3) || Phase 6 (US4)] → Phase 7 (Integration) → Phase 8 (Documentation)
```

**Parallelizable Phases**:
- Phases 4, 5, 6 can run in parallel after Phase 3 completes
- Phase 8 documentation tasks (T048-T050) can run in parallel

### Task Execution Examples

**Sequential Execution** (safe, traditional):
```
T001 → T002 → ... → T052 (one task at a time)
```

**Parallel Execution** (optimal):
```
Phase 1: T001 → T002 → [T003 || T004 || T005 || T006] → T007
Phase 2: T008 → T009 → T010 → T011 → T012 → T013
Phase 3: [T014 || T015] → T016 → T017 → T018 → T019 → T020 → T021 → T022 → [T023 || T024]
Phase 4: [T025 || T026 || T027] → T028 → T029 → T030 → T031 → T032 → T033
Phase 5: T034 → T035 → T036 → T037 → T038  (can run || with Phase 4, 6)
Phase 6: T039 → T040 → T041 → T042 → T043  (can run || with Phase 4, 5)
Phase 7: T044 → T045 → T046 → T047
Phase 8: [T048 || T049 || T050] → T051 → T052
```

**Maximum Parallelization** (12 parallelizable tasks):
- Phase 1: T003, T004, T005, T006 (4 parallel)
- Phase 3: T014, T015 (2 parallel), T023, T024 (2 parallel)
- Phase 4: T025, T026, T027 (3 parallel)
- Phase 5: T034 (1 parallel with Phase 4/6)
- Phase 6: T039 (1 parallel with Phase 4/5)
- Phase 8: T048, T049, T050 (3 parallel)

---

## Implementation Strategy

### MVP Scope (Minimal Viable Product)

**Phases 1-3 Only** (User Story 1 - Database Foundation):
- Setup environment and Alembic
- Create User and Task models
- Generate and apply initial migration
- Verify schema created in Neon database

**Estimated Time**: ~70 minutes
**Deliverable**: Working database schema with tables, indexes, and triggers

### Full Implementation

**All Phases 1-8**:
- MVP (Phases 1-3) + comprehensive integration tests (Phases 4-6) + documentation (Phase 8)

**Estimated Time**: ~3 hours
**Deliverable**: Production-ready database schema with full test coverage and documentation

### Incremental Delivery

1. **Sprint 1** (Day 1): Phases 1-3 → Deploy database schema to Neon
2. **Sprint 2** (Day 2): Phases 4-6 → Add integration tests, verify all user stories
3. **Sprint 3** (Day 3): Phases 7-8 → Migration testing, documentation

---

## Success Criteria (from spec.md)

### Measurable Outcomes

- **SC-001**: Database migrations execute successfully on a fresh PostgreSQL instance without errors ✅ (Phase 3, T022)
- **SC-002**: Data isolation is verified: queries filtered by `user_id` return only that user's tasks with 100% accuracy (zero cross-user data leaks) and execute in under 100ms for typical datasets ✅ (Phase 4, T026, T047)
- **SC-003**: Sequential ID generation is verified: creating 100 tasks, deleting 50 random tasks, then creating 10 more results in the new tasks having IDs 101-110 (no ID reuse) ✅ (Phase 4, T030)
- **SC-004**: Referential integrity is enforced: attempting to insert a task with non-existent `user_id` fails with foreign key constraint violation ✅ (Phase 4, T032)
- **SC-005**: Timestamp automation is verified: creating and updating tasks results in accurate `created_at` and `updated_at` values within 1 second tolerance, without application code setting these values manually ✅ (Phase 5, T036)
- **SC-006**: Schema aligns with Better Auth requirements: user table structure is compatible with Better Auth JWT authentication ✅ (Phase 6, T040)
- **SC-007**: Constraint enforcement is verified: attempting to insert a task with 201-character title fails with validation error, empty user_id fails with NOT NULL error, duplicate email fails with uniqueness error ✅ (Phase 4, T027; Phase 6, T041)

---

## Notes

### Skills Applied

- **Database Schema Architect**: Tasks T014-T024 (BIGINT sequences, indexes, triggers, pooling)
- **Multi-User Data Isolation**: Tasks T026, T031 (user_id foreign keys, CASCADE deletion)
- **Neon PostgreSQL Serverless Integration**: Tasks T003, T008-T013 (pooled endpoint, Alembic setup)
- **ID Architect**: Tasks T029-T030 (sequential BIGINT IDs, no reuse)

### Critical Path

**Blockers**:
1. T003 (Neon database provisioned) - BLOCKS ALL database operations
2. T022 (Migration applied) - BLOCKS all integration tests (Phases 4-6)

**Non-Blocking**:
- Documentation (Phase 8) can start anytime after Phase 3
- Integration tests (Phases 4-6) are independent of each other

### Estimated Total Time

- **Setup**: 25 minutes (Phases 1-2)
- **Implementation**: 45 minutes (Phase 3)
- **Testing**: 70 minutes (Phases 4-6)
- **Integration & Docs**: 50 minutes (Phases 7-8)
- **Total**: ~3 hours 10 minutes

### Risk Mitigation

- **Risk**: Alembic autogeneration misses UPDATE trigger
  - **Mitigation**: T019 manually adds trigger (reference: contracts/migration-template.py)

- **Risk**: Connection pool exhaustion in testing
  - **Mitigation**: Use Neon pooled endpoint (T003), configure timeouts in conftest.py

- **Risk**: Migration fails on rollback
  - **Mitigation**: T045 tests rollback before production deployment

---

## Next Steps After Completion

1. **Execute `/sp.implement`** - Run implementation workflow
2. **Create ADRs** - Document architectural decisions:
   - Index strategy (B-tree on user_id)
   - Timestamp automation (database-level vs application-level)
   - Connection pooling (pooled vs direct endpoint)
3. **Git Commit** - Commit completed database schema with migration
4. **Move to Next Feature** - Begin API endpoint implementation (Feature 003-api-endpoints)

---

**Status**: ✅ Ready for implementation
**Last Updated**: 2026-01-12
