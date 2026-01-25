---
id: 0001
title: Architectural Implementation Planning
stage: plan
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5
feature: 004-frontend-nextjs-better-auth
branch: 004-frontend-nextjs-better-auth
user: user
command: /sp.plan
labels: ["architecture", "planning", "next.js", "better-auth", "research", "design-artifacts", "triple-layer-auth", "react-context"]
links:
  spec: specs/004-frontend-nextjs-better-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-frontend-nextjs-better-auth/plan.md
  - specs/004-frontend-nextjs-better-auth/research.md
  - specs/004-frontend-nextjs-better-auth/data-model.md
  - specs/004-frontend-nextjs-better-auth/contracts/api-client.ts
  - specs/004-frontend-nextjs-better-auth/contracts/backend-api.md
  - specs/004-frontend-nextjs-better-auth/quickstart.md
  - CLAUDE.md
tests:
  - No tests at planning stage
---

## Prompt

create the architectural implementation plan

## Response snapshot

**Phase 0: Research & Technical Decisions**

Researched Next.js 16 and Better Auth using Context7 MCP tools and invoked Agent Skills (`ux_logic_anchor`, `error_handler`) to gather architectural patterns.

**Key Research Findings**:
1. **Route Protection Strategy**: Triple-layer defense-in-depth approach
   - Middleware (first defense, fast redirects)
   - Server components (data access gate)
   - Client hooks (reactive UI)

2. **Better Auth + FastAPI Integration**: Better Auth as frontend authentication layer; FastAPI backend unchanged
   - Better Auth generates JWT signed with BETTER_AUTH_SECRET
   - JWT stored in HTTP-only cookie (XSS protection)
   - Frontend extracts token, adds to Authorization header
   - Backend verifies JWT with same secret

3. **State Management**: React Context instead of Zustand/Redux/React Query
   - Sufficient for Phase II scope (8 user stories)
   - Zero external dependencies
   - Theme and auth state are infrequent-change

4. **Error Handling**: Three-tier system
   - Centralized error handler with typed APIError class
   - Toast notifications for transient feedback
   - React Error Boundary for uncaught exceptions

5. **UX Feedback Patterns**: Adapted CLI Phase I patterns to web
   - Toast notifications replace terminal output
   - Status symbols ([✓]/[○]) for task completion
   - Loading spinners, inline validation

**Phase 1: Design Artifacts Created**

1. **plan.md** (850 lines): Complete architectural implementation plan with technical context, constitution check, research findings, architecture diagrams, implementation strategy, risk mitigation

2. **research.md**: Consolidated research findings documenting 5 key decisions with options evaluated, rationale, and implementation patterns

3. **data-model.md**: Complete TypeScript type system with:
   - Core entity types (User, Task, Session)
   - API contract types (requests, responses, errors)
   - UI state types (theme, toast, forms)
   - Custom hook return types (useAuth, useTasks, useToast)
   - Component prop types
   - Validation rules with code examples

4. **contracts/api-client.ts**: TypeScript API client types with:
   - APIClient interface definition
   - Request/response types for all endpoints
   - Error status codes and message mapping
   - Type guards for runtime validation
   - Endpoint URL templates

5. **contracts/backend-api.md**: Backend API reference linking to existing backend/API_TESTING_GUIDE.md with:
   - Complete endpoint documentation
   - Authentication flow
   - Error response format
   - Request interceptor pattern
   - Data isolation enforcement

6. **quickstart.md**: Developer onboarding guide with:
   - Prerequisites and installation steps
   - Environment configuration (critical secrets alignment)
   - Project structure overview
   - Development workflow
   - Troubleshooting common issues

**Agent Context Updated**: Added Next.js 16.1.1, TypeScript 5+, React 19, Better Auth 1.3.4, Tailwind CSS 3+, React Context to CLAUDE.md

## Outcome

- ✅ Impact: Complete architectural plan ready for implementation. All Phase 0 research findings and Phase 1 design artifacts created. Development team can begin `/sp.tasks` generation.
- 🧪 Tests: No tests at planning stage (business requirements and architecture only)
- 📁 Files: Created 6 new design artifacts + updated CLAUDE.md (7 files total)
- 🔁 Next prompts: `/sp.tasks` to generate implementation task breakdown from plan.md
- 🧠 Reflection: Context7 MCP direct tool usage more reliable than skill wrapper scripts (line ending issues). Triple-layer route protection pattern is defense-in-depth best practice from Next.js docs. React Context sufficient for Phase II scope; no premature optimization with Zustand/Redux.

## Evaluation notes (flywheel)

- Failure modes observed: context7-efficient skill failed due to shell script line ending issues (CRLF vs LF). Workaround: used Context7 MCP tools directly via `mcp__context7__resolve-library-id` and `mcp__context7__query-docs`.
- Graders run and results (PASS/FAIL): Constitution gate check PASS (all 7 principles verified). Template structure PASS (plan.md follows template requirements).
- Prompt variant (if applicable): Standard `/sp.plan` with proactive skill invocation for research phase
- Next experiment (smallest change to try): Fix context7-efficient skill shell scripts (convert CRLF → LF line endings). Consider bypassing skill wrappers and using MCP tools directly for more reliable documentation fetching.
