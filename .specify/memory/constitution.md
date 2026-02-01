# Todo Full-Stack Web Application Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: 2.0.0 → 2.1.0
Type: MINOR (Added MCP Server Integration Architecture)

Modified Principles:
- NONE (All existing principles remain intact)

Added Sections:
- Technology Stack: Added MCP Integration subsection
  - MCP SDK (Official Python SDK for Model Context Protocol)
  - MCP servers wrap backend API endpoints as tools for AI agents
  - HTTP client pattern (httpx/aiohttp) for API integration

- Success Criteria: Added Phase III criteria for AI-powered chatbot
  - Phase IIIA: Standalone MCP Server with 5 task management tools
  - Phase IIIB: Chat endpoint with Gemini agent integration
  - Phase IIIC: Frontend ChatKit widget for conversational interface

New Architectural Pattern:
- MCP servers MUST delegate to existing backend API (no direct database access)
- Try-except error handling for HTTP client operations
- Backend API responses MUST be transformed into MCP tool responses

Templates Requiring Updates:
- ✅ .specify/templates/spec-template.md (HTTP client architecture patterns)
- ⚠ .specify/templates/plan-template.md (add MCP server design sections)
- ⚠ .specify/templates/tasks-template.md (add MCP tool implementation task categories)

Follow-up TODOs:
- Establish MCP tool naming conventions (snake_case aligned with backend endpoints)
- Define error response transformation patterns (HTTPException → MCP error format)
- Document environment variable requirements (BACKEND_API_URL for MCP servers)
-->

## Core Principles

### I. SDD-RI Methodology (Spec-Driven Development with Rigorous Implementation)

**NON-NEGOTIABLE**: No implementation without a validated specification and task breakdown.

All feature development MUST follow this sequence:
1. **Specification** (`/sp.specify`): Define user stories, acceptance criteria, and requirements
2. **Planning** (`/sp.plan`): Architecture and design decisions
3. **Task Breakdown** (`/sp.tasks`): Granular, testable tasks
4. **Implementation** (`/sp.implement`): Execute tasks sequentially

**Rationale**: This prevents scope creep, ensures clarity before coding, and maintains traceability from requirements to implementation. Every line of code must trace back to a documented requirement.

### II. Pythonic Excellence

**MANDATORY**: All code MUST adhere to PEP 8 standards and leverage Python 3.13+ features.

Code quality requirements:
- Follow PEP 8 style guide without exception
- Use modern Python 3.13+ features (pattern matching, type unions with `|`, etc.)
- Prefer readability over cleverness
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)

**Rationale**: Consistency and readability are critical for maintainability. Python 3.13+ provides powerful features that improve code clarity and type safety.

### III. Persistent Relational State

**MANDATORY**: All application data MUST be stored in Neon Serverless PostgreSQL with strict data isolation.

Technology Requirements:
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel (combines SQLAlchemy and Pydantic)
- Schema: All entities MUST include a `user_id` foreign key for data isolation
- Migrations: Use Alembic for database schema versioning

Data Isolation Rules:
- Every entity table MUST have a `user_id` column (foreign key to users table)
- Query filters MUST enforce `WHERE user_id = {authenticated_user_id}`
- Cross-user data access is strictly prohibited
- Database constraints MUST prevent orphaned records

**Rationale**: Persistent storage enables multi-user web applications with data durability. User-level isolation ensures security and privacy. SQLModel provides type-safe database operations aligned with Principle II (Pythonic Excellence).

### IV. Type Safety & Documentation

**MANDATORY**: All functions MUST have complete type hints and comprehensive docstrings.

Requirements:
- Type hints for all function parameters and return values
- Use `typing` module types where appropriate (`list[str]`, `dict[str, Any]`, etc.)
- Docstrings in Google or NumPy format
- Document parameters, return values, and raised exceptions
- Include usage examples in docstrings where helpful

**Rationale**: Type hints catch errors at development time and serve as inline documentation. Comprehensive docstrings ensure code is self-explanatory and reduce onboarding time.

### V. Terminal-Based Verification

**REQUIREMENT**: All backend logic MUST be verifiable via terminal output or API testing tools.

Interaction model:
- Backend: REST API endpoints testable with curl, HTTPie, or Postman
- Output via structured JSON responses
- Clear HTTP status codes (200, 400, 401, 404, 500)
- Human-readable error messages

**Rationale**: API-first design ensures backend logic is decoupled from frontend presentation. Terminal/HTTP testing enables rapid verification without UI dependencies.

### VI. Reusable Intelligence (Agent Skills)

**MANDATORY**: All repeatable architectural patterns MUST be extracted and formalized as Agent Skills.

Pattern Extraction Requirements:
- Identify recurring design patterns during implementation (e.g., ID management, CLI formatting, error handling)
- Extract patterns into the project's skill library with clear documentation
- Each skill MUST include: purpose, usage examples, constraints, and rationale
- Skills MUST be language-agnostic where possible, implementation-specific where necessary

Subagent Governance:
- Any subagent created during development MUST adhere to this Constitution
- Subagents MUST utilize established Agent Skills to maintain consistency
- New patterns discovered by subagents MUST be proposed for skill library inclusion
- Skills MUST be version-controlled alongside code artifacts

**Rationale**: Capturing architectural patterns as reusable skills prevents reinventing solutions, ensures consistency across features, and accelerates development. Subagent governance ensures all development—human or AI-driven—follows established best practices.

### VII. Stateless Security (JWT Authentication)

**MANDATORY**: All API requests MUST be authenticated with a valid JWT token verified against BETTER_AUTH_SECRET.

Authentication Requirements:
- No request shall be processed without a valid JWT token (except public auth endpoints)
- JWT tokens MUST be verified using the `BETTER_AUTH_SECRET` environment variable
- Token payload MUST include `user_id` claim for identity verification
- Token expiration MUST be enforced (reject expired tokens with 401 Unauthorized)

Authorization Requirements:
- Backend MUST verify that the requested resource ID belongs to the authenticated user ID
- Ownership validation pattern: `SELECT * FROM table WHERE id = {resource_id} AND user_id = {token_user_id}`
- Cross-user resource access MUST return 404 Not Found (not 403, to prevent information leakage)
- Admin/service accounts require explicit role claim in JWT payload

**Rationale**: JWT provides stateless authentication suitable for serverless backends. Ownership verification at the database layer prevents unauthorized data access. Returning 404 for forbidden resources prevents attackers from enumerating valid resource IDs.

## Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript 5+
- **State Management**: React Context or Zustand (as needed)
- **Chatbot UI**: OpenAI ChatKit (Phase III)

### Backend
- **Language**: Python 3.13+
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic

### Authentication
- **Provider**: Better Auth
- **Mechanism**: JWT tokens with `BETTER_AUTH_SECRET` signature verification
- **Token Storage**: HTTP-only cookies (frontend) + Authorization header (API)

### MCP Integration (Phase III)
- **Protocol**: Model Context Protocol (MCP) for AI agent tool calling
- **SDK**: Official MCP Python SDK
- **Architecture**: MCP servers wrap backend REST API endpoints (no direct database access)
- **HTTP Client**: httpx or aiohttp for making API requests
- **AI Model**: Gemini 2.5 Flash via OpenAI-compatible API (configurable)
- **Error Handling**: Try-except blocks for all HTTP operations with backend API
- **Environment**: BACKEND_API_URL for API base URL configuration

### Development Tools
- **Backend**:
  - Type checking: `mypy --strict`
  - Linting: `ruff check`
  - Formatting: `ruff format`
  - Dependency Management: UV

- **Frontend**:
  - Type checking: Built-in TypeScript compiler
  - Linting: ESLint with Next.js config
  - Formatting: Prettier

### Testing
- **Backend**: `pytest` with `pytest-cov` for coverage
- **Frontend**: Jest + React Testing Library
- **E2E**: Playwright (optional for Phase II)

## Quality Standards

### Code Quality
- All code passes linter checks with zero warnings (ruff for Python, ESLint for TypeScript)
- All code passes type checking (mypy --strict for Python, tsc --noEmit for TypeScript)
- All code formatted consistently (ruff format for Python, Prettier for TypeScript)
- No commented-out code in final commits
- No debug print/console statements in production code

### Documentation Quality
- Every module has a module-level docstring
- Every class has a class-level docstring
- Every public function has a complete docstring
- Complex algorithms include inline comments explaining logic
- API endpoints documented in OpenAPI/Swagger format (FastAPI auto-generates)

### Testing Quality
- All business logic has corresponding test cases
- Edge cases are explicitly tested
- Error paths are tested (400, 401, 404, 500 responses)
- Test output clearly indicates pass/fail
- Database integration tests use transactional rollbacks (no persistent test data)

### Security Quality
- All secrets stored in environment variables (never committed to git)
- JWT tokens validated on every protected endpoint
- SQL injection prevented via ORM parameterized queries
- CORS configured correctly (whitelist frontend origin)
- Rate limiting implemented on auth endpoints

## Success Criteria

### Phase I (COMPLETE)
Phase I is considered complete when ALL of the following are met:

1. **Feature Completeness**: All Basic Level features implemented in CLI
2. **Code Quality**: 100% PEP 8 compliance, type hints, docstrings, zero linting errors
3. **Functional Correctness**: All features work as specified, edge cases handled
4. **Verification**: All functionality demonstrable via terminal
5. **Documentation**: Specification, plan, tasks complete and approved
6. **Skill Extraction**: 3 Agent Skills formalized (id_architect, ux_logic_anchor, error_handler)

### Phase II (COMPLETE)
Phase II is considered complete when ALL of the following are met:

1. **Secure REST API**: Full CRUD functionality with JWT authentication
   - All endpoints require valid JWT tokens
   - User data isolation enforced at database level
   - Proper HTTP status codes (200, 400, 401, 404, 500)
   - OpenAPI documentation generated

2. **Responsive Next.js UI**: Functional web interface using established UX patterns
   - Landing page with authentication (login/signup)
   - Todo list view with status symbols ([✓] completed, [○] pending)
   - Add, edit, delete, toggle completion actions
   - Standardized success/error messages (leveraging UX Logic Anchor skill)
   - Mobile-responsive design (Tailwind CSS)

3. **Successful JWT Handshake**: Frontend and backend authentication integration
   - Login flow: credentials → Better Auth → JWT token → HTTP-only cookie
   - API requests include Authorization header or cookie
   - Backend validates JWT signature using BETTER_AUTH_SECRET
   - Token expiration handled gracefully (redirect to login on 401)

4. **Database Integration**: Neon PostgreSQL with SQLModel ORM
   - All entities have `user_id` foreign key
   - Database migrations managed with Alembic
   - Connection pooling configured for serverless environment

5. **Code Quality**: Maintains Phase I standards across frontend and backend
   - Zero linting/type errors in both Python and TypeScript
   - Comprehensive docstrings/comments
   - No hardcoded secrets (environment variables only)

6. **Testing**: Backend API tests with >80% coverage
   - Unit tests for business logic
   - Integration tests for database operations
   - Authentication/authorization tests (valid/invalid tokens, ownership checks)

### Phase III (In Progress)
Phase III is considered complete when ALL of the following are met:

**Phase IIIA: Standalone MCP Server**
1. **MCP Tools Implementation**: 5 task management tools callable by AI agents
   - add_task, list_tasks, complete_task, delete_task, update_task
   - All tools delegate to existing backend REST API endpoints
   - HTTP client with try-except error handling for all API calls
   - Error responses transformed from HTTPException to MCP format

2. **API Integration**: MCP server wraps backend API (no direct database access)
   - Tools make HTTP requests to http://localhost:8000/api/{user_id}/* endpoints
   - Backend API handles authentication, validation, and database persistence
   - MCP server location: /mnt/d/todo-mcp-server/ (separate from main app)
   - UV package manager for Python dependency management

3. **Independent Testing**: MCP server testable with backend API running
   - Complete workflow: create → list → complete → delete executable via MCP tools
   - User data isolation enforced (backend API responsibility)
   - All error scenarios handled gracefully (connection failures, 4xx/5xx responses)

**Phase IIIB: Chat Endpoint with AI Agent** (Pending Phase IIIA completion)
1. **Chat API**: Stateless chat endpoint integrated with Gemini agent
   - POST /api/{user_id}/chat endpoint
   - Conversation/message persistence in database
   - Agent calls MCP tools based on natural language input

**Phase IIIC: Frontend ChatKit Widget** (Pending Phase IIIB completion)
1. **Conversational Interface**: WhatsApp-style floating chat button
   - OpenAI ChatKit UI component in bottom-right corner
   - Integrated with existing Next.js frontend
   - Natural language task management via chat

## Governance

**Authority**: This constitution supersedes all other development practices and preferences for this project.

**Compliance**:
- All code reviews MUST verify constitution compliance
- Any complexity or deviation MUST be explicitly justified in planning documents
- Violations MUST be corrected before merge

**Amendment Process**:
1. Proposed amendment MUST be documented with rationale
2. Amendment MUST be reviewed and approved
3. Amendment MUST include migration plan for existing code if applicable
4. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward-incompatible changes (principle removal/redefinition, architecture shift)
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications, wording improvements, typo fixes

**Review Schedule**: Constitution MUST be reviewed at phase boundaries (Phase I → Phase II transition, etc.), including the audit of extracted Skills to ensure they remain relevant and are being utilized.

**Version**: 2.1.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-26
