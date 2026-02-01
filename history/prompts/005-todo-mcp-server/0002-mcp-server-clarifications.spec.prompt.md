---
id: 0002
title: MCP Server Clarifications
stage: spec
date: 2026-01-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-todo-mcp-server
branch: 005-todo-mcp-server
user: mohsin
command: /sp.clarify
labels: ["clarification", "architecture", "backend-api-integration"]
links:
  spec: specs/005-todo-mcp-server/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-todo-mcp-server/spec.md
tests:
  - N/A - specification clarification phase
---

## Prompt

User requested clarification workflow for MCP server specification after user indicated:
1. "b" - Use existing Neon database connection
2. "use try except block in all tool"
3. "use apis from backend @backend/ so we use api endpoint that already set logic"

## Response snapshot

Conducted clarification session and discovered critical architectural change:

**Initial Assumption**: MCP server would connect directly to Neon database

**Actual Architecture** (after clarifications):
- MCP server calls existing backend REST API (http://localhost:8000)
- Backend API already has all logic: database, authentication, validation
- MCP tools are thin HTTP client wrappers

**Key Clarifications Made**:

1. **Storage Strategy**: Use backend API endpoints (not direct database)
2. **Error Handling**: Try-except blocks to catch HTTP errors and parse ErrorResponse format
3. **Concurrent Updates**: Delegate to backend API's database transactions
4. **Exact Endpoints** (reviewed backend/api/tasks.py):
   - POST /api/{user_id}/tasks (create)
   - GET /api/{user_id}/tasks?status={filter} (list)
   - PATCH /api/{user_id}/tasks/{id}/complete (toggle)
   - PUT /api/{user_id}/tasks/{id} (update)
   - DELETE /api/{user_id}/tasks/{id} (delete, returns 204)

**Spec Updates Made**:
- Changed FR-012 from "persist to database" to "delegate to backend API"
- Updated FR-020-027 with HTTP client requirements and error handling
- Modified dependencies: removed psycopg2, added httpx/aiohttp
- Updated environment variables: BACKEND_API_URL instead of DATABASE_URL
- Clarified complete_task toggles status (not just sets to true)
- Specified ErrorResponse format parsing: {"error": "type", "message": "detail"}
- Updated assumptions: backend API must be running for testing

## Outcome

- ✅ Impact: Major architectural clarification - MCP server is now HTTP client wrapper instead of database client
- 🧪 Tests: Testing now requires backend API running (not just database access)
- 📁 Files: Updated specs/005-todo-mcp-server/spec.md with 4 clarifications and 15+ requirement changes
- 🔁 Next prompts: /sp.plan to design HTTP client architecture and MCP tool implementations
- 🧠 Reflection: Critical decision - using backend API dramatically simplifies MCP server (no database, auth, or validation logic) and ensures consistency with existing web app. MCP tools become thin wrappers that translate MCP protocol to REST API calls.

## Evaluation notes (flywheel)

- Failure modes observed: None - user proactively clarified architecture before planning phase
- Graders run and results (PASS/FAIL): N/A - clarification phase
- Prompt variant (if applicable): Standard /sp.clarify workflow with interactive questioning
- Next experiment (smallest change to try): Proceed to /sp.plan with simplified HTTP client architecture
