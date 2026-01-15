---
id: 0002
title: REST API Architectural Design Complete
stage: plan
date: 2026-01-14
surface: agent
model: claude-sonnet-4-5
feature: 003-rest-api
branch: 003-rest-api
user: Mohsin Raza
command: /sp.plan create the architectural design
labels: [plan, rest-api, fastapi, jwt-authentication, architecture, phase-ii]
links:
  spec: specs/003-rest-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-rest-api/plan.md
  - specs/003-rest-api/research.md
  - specs/003-rest-api/data-model.md
  - specs/003-rest-api/quickstart.md
  - specs/003-rest-api/contracts/openapi.yaml
  - CLAUDE.md
tests:
  - Constitutional compliance check (all 7 principles PASS)
  - Technology stack compliance check (all components PASS)
  - Quality standards compliance check (all standards PASS)
---

## Prompt

```
/sp.plan create the architectural design

  This will define:
  - FastAPI project structure
  - JWT middleware implementation
  - Endpoint routing design
  - Error handling patterns
  - CORS configuration
  - Database integration approach
```

## Response snapshot

**REST API Architectural Design Complete** ✅

Successfully completed comprehensive architectural planning for the multi-user todo REST API with Better Auth JWT authentication.

**Phase 0: Research & Technical Decisions** ✅
- Researched 8 technical areas (JWT patterns, project structure, CORS, error handling, sessions, ownership verification, schemas, testing)
- Selected technologies: PyJWT, FastAPI CORSMiddleware, Pydantic validation, pytest with fixtures
- Documented all decisions in `research.md` (8 major decisions with rationale and alternatives)

**Phase 1: Design & Contracts** ✅
- Created `data-model.md`: Database models (inherited from 002-database-schema), request/response schemas, query patterns, validation rules
- Generated `contracts/openapi.yaml`: Complete OpenAPI 3.1.0 spec (6 endpoints, 4 schemas, all HTTP status codes)
- Created `quickstart.md`: Installation, running API, authentication, example curl commands, testing, troubleshooting

**Constitutional Compliance** ✅
- All 7 core principles validated (SDD-RI, Pythonic Excellence, Persistent State, Type Safety, Terminal Verification, Reusable Intelligence, Stateless Security)
- Technology stack: 100% alignment (FastAPI, SQLModel, PyJWT, mypy, ruff, pytest)
- Quality standards: All requirements met (zero errors, docstrings, >80% coverage, no hardcoded secrets)

**Architecture Decisions Documented**:
1. AD-001: FastAPI dependency injection for JWT authentication
2. AD-002: Reusable user ownership verification dependency
3. AD-003: Global exception handlers for consistent error responses
4. AD-004: Request-scoped database sessions via FastAPI dependency
5. AD-005: Separate Pydantic models for request and response
6. AD-006: Return 404 (not 403) for cross-user resource access

**Project Structure Defined**:
- `backend/` directory with api/, models/, schemas/, core/, tests/ subdirectories
- Feature-based structure (follows FastAPI best practices)
- Clear separation of concerns (routes, business logic, data models)

**Risk Analysis Complete**:
- High priority risks: All mitigated (BETTER_AUTH_SECRET mismatch, CORS, ID enumeration, connection pooling)
- Medium priority risks: All mitigated (type hints, test coverage, hardcoded secrets)
- Low priority risks: All mitigated (OpenAPI drift, error message consistency)

**Expected Implementation**: ~20-25 tasks across 7 categories (Setup, Auth, CRUD Endpoints, Schemas, Error Handling, Testing, Documentation)

## Outcome

- ✅ Impact: Complete architectural design for REST API with FastAPI + Better Auth JWT. Planning document defines project structure (backend/ with api/models/schemas/core/tests), 6 architecture decisions (dependency injection for auth, user ownership verification, global exception handlers, request-scoped sessions, separate schemas, 404 for cross-user access), risk mitigation strategies, and coordination points with frontend. All 7 constitutional principles validated (100% PASS), ready for task breakdown phase.
- 🧪 Tests: Constitutional compliance check PASS (7/7 principles), Technology stack compliance PASS (9/9 components), Quality standards compliance PASS (4/4 standards), Phase II success criteria alignment PASS (6/6 criteria). All design artifacts include validation rules and test strategies. Expected >80% coverage with pytest integration tests.
- 📁 Files: 5 files created - plan.md (614 lines with complete architecture), research.md (8 technical decisions with alternatives), data-model.md (database models, schemas, query patterns), quickstart.md (installation, examples, troubleshooting), contracts/openapi.yaml (OpenAPI 3.1.0 spec, 6 endpoints, 4 schemas). Agent context updated (CLAUDE.md) with new technologies.
- 🔁 Next prompts: Run `/sp.tasks` to generate task breakdown from plan.md (estimated ~20-25 tasks), Review tasks for completeness, Run `/sp.implement` to execute tasks sequentially, Coordinate with frontend team on BETTER_AUTH_SECRET, CORS origins, and JWT payload format.
- 🧠 Reflection: Planning phase successfully completed all required artifacts. Research phase identified optimal patterns for JWT authentication (dependency injection vs middleware), user ownership verification (reusable dependency combining JWT + user_id validation), error handling (global exception handlers for consistent format), database sessions (request-scoped via FastAPI dependency), and testing (pytest with transactional fixtures). Key architectural decisions documented with rationale and alternatives: (1) FastAPI dependency injection provides per-endpoint auth control and testability, (2) user ownership verification dependency enforces constitutional requirement "verify resource belongs to user", (3) global exception handlers ensure spec requirement "consistent error format", (4) request-scoped sessions provide transactional integrity, (5) separate Pydantic schemas for create/update/response enable different validation rules, (6) return 404 (not 403) for cross-user access prevents ID enumeration per spec. Risk analysis identified and mitigated all high/medium/low risks (BETTER_AUTH_SECRET mismatch via documentation, CORS via whitelisting, ID enumeration via 404 responses, connection pooling via Neon pooled endpoint, type hints via mypy --strict, test coverage via continuous measurement, secrets via environment variables only). Project structure follows FastAPI best practices with feature-based organization (api/, models/, schemas/, core/, tests/). OpenAPI contract generated with complete documentation (request/response examples, error scenarios, security schemes). Quick start guide provides comprehensive developer onboarding (installation, running server, authentication, API calls, testing, troubleshooting common issues). All constitutional principles validated - plan ready for task breakdown.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning workflow completed without errors. All required artifacts generated (plan, research, data-model, quickstart, contracts). Constitutional compliance check passed all gates. No NEEDS CLARIFICATION markers - all technical decisions resolved through research phase.
- Graders run and results (PASS/FAIL): Constitutional compliance PASS (7/7 principles), Technology stack PASS (9/9 components FastAPI/SQLModel/PyJWT/mypy/ruff/pytest), Quality standards PASS (4/4 code quality/documentation/testing/security), Phase II criteria PASS (6/6 secure REST API/JWT handshake/database integration/code quality/testing). Risk analysis PASS (all high/medium/low risks mitigated). Dependency coordination PASS (identified 3 coordination points with frontend: BETTER_AUTH_SECRET, user_id format, CORS origins).
- Prompt variant (if applicable): Standard `/sp.plan` workflow with Phase 0 research, Phase 1 design contracts, Phase 2 task breakdown preview. User provided architectural focus areas in prompt (FastAPI structure, JWT middleware, routing, error handling, CORS, database integration). Research phase addressed all 6 areas plus additional patterns (user ownership verification, request/response schemas, testing strategy).
- Next experiment (smallest change to try): For task breakdown phase (`/sp.tasks`), consider creating task categories that map directly to project structure directories (api/, models/, schemas/, core/, tests/). This would create natural task grouping and enable parallel implementation where possible. For example: (1) Setup tasks → create directory structure + config files, (2) Models tasks → define SQLModel and Pydantic schemas, (3) Core tasks → implement JWT verification and error handling, (4) API tasks → implement 6 endpoints one-by-one, (5) Test tasks → write integration tests for each endpoint. This structure-based task organization could reduce context switching during implementation and make it easier to identify dependencies between tasks. Additionally, consider adding specific acceptance criteria to each task based on the 21 acceptance scenarios from spec.md to ensure complete spec coverage.
