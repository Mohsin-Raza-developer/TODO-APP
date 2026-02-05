# TODO Application Suite

Full-stack task management application with CLI, REST API, and AI-powered chatbot interface.

## Projects

1. **TODO CLI** - In-memory Python console application with CRUD operations
2. **TODO API** - FastAPI REST backend with PostgreSQL database
3. **Chatbot Backend** - AI agent with conversational task management

## Phase I: Basic CRUD - ✅ 100% COMPLETE

**Status**: Production-ready | **Tasks**: 88/88 (100%) | **Constitution**: v1.1.0

### Completed Features
- ✅ Add todo item (sequential ID assignment)
- ✅ Delete todo item (ID reuse prevention)
- ✅ Update todo item (title and description)
- ✅ View all todo items (status symbols ✓/○)
- ✅ Mark todo item as complete (toggle operation)

### Quality Verification
- ✅ 100% PEP 8 compliance (ruff check: 0 errors)
- ✅ 100% type hint coverage (mypy --strict: 0 errors)
- ✅ 100% docstring coverage (Google-style)
- ✅ All manual test scenarios passed (21/21)
- ✅ Performance benchmarks exceeded (5000x faster than requirements)

### Agent Skills Extracted (Constitution v1.1.0 - Principle VI)
1. **ID Architect** - Sequential ID generation with immutable counter
2. **UX Logic Anchor** - Standardized visual feedback patterns
3. **Error Handler** - Centralized exception handling with graceful recovery

---

## Chatbot Backend - ✅ COMPLETE

**Status**: Production-ready | **Phases**: 5/6 (83%) | **Branch**: 006-chatbot-agent-backend

### Features

#### ✅ Phase 1-3: Foundation & Basic Chat
- OpenAI Agent SDK with Gemini 2.0 Flash model
- ChatKit protocol server implementation
- JWT authentication with Better Auth
- Streaming responses via Server-Sent Events (SSE)
- Request context with user isolation

#### ✅ Phase 4: MCP Integration
- Model Context Protocol (MCP) client
- 5 task management tools: `list_tasks`, `add_task`, `complete_task`, `update_task`, `delete_task`
- Token forwarding for authenticated MCP requests
- Cross-user isolation enforcement

#### ✅ Phase 5: Database Persistence
- NeonPostgresStore implementation (17 methods)
- PostgreSQL database with Neon hosting
- Chat threads and messages persistence
- Alembic migrations for schema management
- 20-message conversation history context

### Architecture

```
Frontend (ChatKit React)
    ↓ HTTP POST /api/chatkit
Chatbot Backend (FastAPI)
    ↓ JWT Auth
ChatKitServer
    ↓ Load History (DB)
OpenAI Agent (Gemini 2.0)
    ↓ MCP Tools
TODO API (FastAPI)
    ↓ Database Query
PostgreSQL (Neon)
```

### Key Implementation Details

**Stateful Conversations:**
- Agent instance: Stateless (created per request)
- Conversation: Stateful (persisted to database)
- History loading: Last 20 messages from `chat_messages` table
- User isolation: Query-level filtering by `user_id`

**Database Schema:**
```sql
chat_threads:
  - id (UUID, PK)
  - user_id (FK to user.id, CASCADE DELETE)
  - title (optional)
  - created_at, updated_at

chat_messages:
  - id (BigInt, auto-increment)
  - thread_id (FK to chat_threads.id, CASCADE DELETE)
  - role (user|assistant|system)
  - content (JSONB)
  - created_at
```

**MCP Integration:**
- Client: `MCPServerStreamableHttp`
- Endpoint: `http://localhost:8000/mcp`
- Authorization: Bearer token forwarding
- Tools: 5 task management operations

### Technology Stack (Chatbot)

**CLI Application:**
- Language: Python 3.12+
- Package Manager: UV
- Type Checking: mypy (strict mode)
- Linting: ruff
- Formatting: ruff format

**Chatbot Backend:**
- Framework: FastAPI
- AI SDK: OpenAI Agent SDK (agents)
- Model: Google Gemini 2.0 Flash (via OpenAI-compatible API)
- Protocol: ChatKit (OpenAI)
- MCP Client: Model Context Protocol
- Database: PostgreSQL (Neon)
- ORM: AsyncPG + SQLAlchemy
- Migrations: Alembic
- Auth: Better Auth (JWT)

## Installation & Usage

### CLI Application

```bash
# Install dependencies
uv sync

# Run the application
uv run python -m src.todo_app

# Run quality checks
uv run ruff check src/
uv run ruff format src/
uv run mypy --strict --explicit-package-bases src/
```

### Chatbot Backend

```bash
# Navigate to chatbot backend
cd chatbot-backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (Neon PostgreSQL)
# - OPENAI_API_KEY (Gemini API key)
# - BETTER_AUTH_SECRET (from frontend)

# Run database migrations
uv run alembic upgrade head

# Start the server
uv run uvicorn app.main:app --port 8001 --reload
```

**Prerequisites:**
- TODO API running on port 9000
- MCP Server running on port 8000
- PostgreSQL database (Neon recommended)

## Project Structure

```
.
├── .claude/skills/          # Reusable architectural patterns
│   ├── id_architect.md
│   ├── ux_logic_anchor.md
│   └── error_handler.md
├── chatbot-backend/         # AI Chatbot Backend
│   ├── app/
│   │   ├── auth/            # JWT authentication
│   │   ├── models/          # Request context models
│   │   ├── server/          # ChatKit server & Gemini config
│   │   ├── store/           # Database persistence (NeonPostgresStore)
│   │   ├── utils/           # Agent factory & helpers
│   │   ├── config.py        # Settings management
│   │   └── main.py          # FastAPI application
│   ├── alembic/             # Database migrations
│   │   └── versions/        # Migration scripts
│   └── .env                 # Environment variables
├── src/                     # CLI Application
│   ├── models/              # Data models (TodoItem)
│   ├── services/            # Business logic (TodoManager)
│   ├── ui/                  # User interface components
│   │   ├── display.py       # Formatting and rendering
│   │   ├── handlers.py      # Command handlers
│   │   ├── menu.py          # Menu and input
│   │   └── messages.py      # Standardized messages
│   └── todo_app.py          # Main entry point
├── specs/
│   ├── 001-basic-crud/      # CLI feature specification
│   └── 006-chatbot-agent-backend/  # Chatbot specification
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── history/
│   ├── adr/                 # Architecture Decision Records
│   └── prompts/             # Prompt History Records
└── .specify/
    ├── memory/              # Constitution and project memory
    └── templates/           # SDD-RI templates
```

## Architecture Highlights

### Data Model
- `TodoItem` dataclass with immutable ID
- Dictionary-based storage for O(1) lookups
- Type-safe with complete type hints

### Service Layer
- `TodoManager` encapsulates business logic
- ID counter starts at 1, never decrements
- Deleted IDs never reused (validated in T082)

### UI Layer
- Standardized message formats (`SUCCESS:`/`ERROR:`)
- Status symbols ([✓] completed, [○] pending)
- Centralized error handling with retry loops

### Main Loop
- Command dispatch dictionary pattern
- Single TodoManager instance (ADR-002)
- Graceful error recovery

## Development Methodology

This project follows **Spec-Driven Development with Rigorous Implementation (SDD-RI)**:

1. **Specification** - User stories and acceptance criteria
2. **Planning** - Architecture and design decisions (3 ADRs)
3. **Task Breakdown** - 88 granular, testable tasks
4. **Implementation** - Sequential execution with validation
5. **Skill Extraction** - Patterns formalized for reuse

## Governance

**Constitution**: v1.1.0 (Ratified 2026-01-07, Amended 2026-01-09)

Core Principles:
- I. SDD-RI Methodology
- II. Pythonic Excellence
- III. In-Memory State Management
- IV. Type Safety & Documentation
- V. Terminal-Based Verification
- VI. Reusable Intelligence (Agent Skills)

## Performance

- **Create**: 0.000002s average (100 todos)
- **View**: 0.001696s (10,000 todos)
- **Exceeds requirements**: 5000x (create), 1000x (view)

## Documentation

- **Specification**: `specs/001-basic-crud/spec.md`
- **Implementation Plan**: `specs/001-basic-crud/plan.md`
- **Task Breakdown**: `specs/001-basic-crud/tasks.md`
- **ADRs**: `history/adr/` (3 architectural decisions)
- **PHRs**: `history/prompts/` (15 prompt records)
- **Skills**: `.claude/skills/` (3 reusable patterns)

## License

[]

## Author

Mohsin Raza
