# Research Findings: Next.js 16 Frontend with Better Auth

**Feature**: `004-frontend-nextjs-better-auth`
**Date**: 2026-01-16
**Phase**: 0 (Research & Decision Making)

## Summary

This document consolidates research findings for implementing a Next.js 16 web frontend with Better Auth authentication, integrating with the existing FastAPI backend. All research leveraged Context7 documentation (Next.js 16.1.1, Better Auth 1.3.4) and project-specific Agent Skills (`ux_logic_anchor`, `error_handler`).

---

## Research Questions & Decisions

### 1. Route Protection Strategy

**Question**: How to protect routes in Next.js 16 App Router with Better Auth?

**Options Evaluated**:
- **A**: Client-side only (useSession hook)
- **B**: Server-side only (server component checks)
- **C**: Middleware + server components (defense-in-depth)

**Decision**: **Option C - Triple-layer protection**

**Rationale**:
- Middleware provides fast redirects (no page render for unauth users)
- Server components double-check before fetching sensitive data
- Client hooks enable reactive UI (user menu, conditional rendering)

**Source**: Context7 `/vercel/next.js/v16.1.1` + `/better-auth/better-auth`

**Implementation Pattern**:
```typescript
// Layer 1: Middleware (first line of defense)
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

// Layer 2: Server Component (data access gate)
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  // Fetch data only after verification
}

// Layer 3: Client Hook (reactive UI)
function UserProfile() {
  const { data: session } = authClient.useSession();
  if (!session) return null;
  return <div>{session.user.name}</div>;
}
```

---

### 2. State Management Architecture

**Question**: React Context, Zustand, or React Query?

**Options Evaluated**:
- **A**: React Context (built-in, simple)
- **B**: Zustand (lightweight state library)
- **C**: React Query/SWR (server state management)

**Decision**: **Option A - React Context**

**Rationale**:
- Phase II scope is limited (8 user stories, ~15 components)
- Theme and auth state are infrequent-change (context-appropriate)
- Avoids over-engineering (YAGNI principle)
- Zero external dependencies for state management
- Can migrate to Zustand/Redux if Phase III complexity demands it

**Alternatives Considered**:
- Zustand: Rejected (adds dependency for minimal benefit at current scale)
- React Query: Rejected (tasks are simple CRUD, no caching complexity needed)

---

### 3. Better Auth ↔ FastAPI Integration

**Question**: How to connect Better Auth (frontend) with existing FastAPI JWT backend?

**Decision**: Better Auth as authentication UI/UX layer; FastAPI remains unchanged

**Integration Pattern**:

1. **Better Auth generates JWT**: User signs in → Better Auth creates token → stores in HTTP-only cookie
2. **Frontend extracts token**: API client calls `authClient.getSession()` → gets `accessToken`
3. **Backend verifies token**: FastAPI receives `Authorization: Bearer {token}` → verifies with `BETTER_AUTH_SECRET`

**Critical Configuration**:
- Same `BETTER_AUTH_SECRET` on both frontend and backend
- Better Auth can use same Neon DB or separate auth DB
- Frontend includes token in `Authorization` header for all API requests

**Rationale**: Minimal changes to backend (already JWT-ready); Better Auth handles signup/signin/session UX

---

### 4. Error Handling Strategy

**Question**: How to centralize error handling for API failures?

**Decision**: Three-tier error handling system

**Source**: `error_handler` Agent Skill

**Implementation**:

**Tier 1: Centralized Error Handler**
```typescript
export class APIError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function handleAPIError(response: Response): never {
  const errorMap = {
    401: { code: 'unauthorized', message: 'Session expired. Please sign in again.' },
    403: { code: 'forbidden', message: 'You do not have permission.' },
    404: { code: 'not_found', message: 'Resource not found.' },
    500: { code: 'server_error', message: 'Server error. Please try again later.' },
  };
  const error = errorMap[response.status] || { code: 'unknown', message: 'Unexpected error.' };
  throw new APIError(response.status, error.code, error.message);
}
```

**Tier 2: Toast Notifications** (transient feedback)
- Display user-friendly error messages
- Auto-dismiss after 5 seconds
- Retry button for network/5xx errors (per spec FR-012)

**Tier 3: React Error Boundary** (uncaught exceptions)
- Catch rendering errors
- Display fallback UI with "Try again" button
- Prevent whole app crash

**Rationale**: Constitution-aligned (user-friendly messages), skill-aligned (error_handler pattern), spec-aligned (retry buttons for failures)

---

### 5. UX Feedback Patterns

**Question**: How to standardize loading, success, error displays?

**Decision**: Adopt CLI patterns from Phase I, adapted for web

**Source**: `ux_logic_anchor` Agent Skill

**Patterns Implemented**:

| Pattern | CLI Phase I | Web Phase II |
|---------|-------------|--------------|
| Success | `"SUCCESS: {action} completed."` | Toast notification: "SUCCESS: Task created completed." |
| Error | `"ERROR: {detail}."` | Toast notification: "ERROR: Title cannot be empty." |
| Loading | `"Loading..."` | Spinner component with size variants |
| Status | `[✓]` / `[○]` | Checkmark / Circle icons in task list |

**Components**:
- **Toast**: Transient notifications (success/error/info)
- **Loading Spinner**: Async operation feedback
- **Inline Validation**: Form field errors
- **Status Symbols**: Task completion indicators ([✓] completed, [○] pending)

**Rationale**: Horizontal intelligence reuse from Phase I; consistent UX across CLI and Web

---

## Technology Stack Final Decisions

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Frontend Framework** | Next.js | 16.1.1 | App Router, server components, built-in routing/middleware |
| **Authentication** | Better Auth | 1.3.4 | TypeScript-first, JWT support, framework-agnostic |
| **UI Styling** | Tailwind CSS | 3+ | Utility-first, dark mode built-in, responsive design |
| **Type System** | TypeScript | 5+ | Type safety, auto-completion, refactoring support |
| **State Management** | React Context | Built-in | Sufficient for Phase II scope, zero dependencies |
| **API Client** | Fetch API | Native | No library needed, works with Next.js SSR/CSR |
| **Error Handling** | Custom + Boundary | N/A | Constitution-aligned centralized error handler |
| **Testing** | Jest + RTL + Playwright | Latest | Unit, integration, E2E coverage |

---

## Architecture Decisions

### Frontend Structure

```
frontend/src/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── components/       # React components (ui/, auth/, tasks/, layout/)
├── lib/              # Utilities (auth, api-client, error-handler)
├── contexts/         # React Context providers (theme, toast)
├── hooks/            # Custom hooks (useAuth, useTasks, useToast)
├── types/            # TypeScript types (task, user, api)
└── middleware.ts     # Route protection middleware
```

**Rationale**: Follows Next.js conventions, clear separation of concerns, scalable for Phase III

---

### API Integration Pattern

```
User Action
    ↓
Event Handler (onClick, onSubmit)
    ↓
Custom Hook (useTasks: createTask, updateTask, etc.)
    ↓
API Client (lib/api-client.ts)
    ├─ Extract JWT from Better Auth session
    ├─ Add Authorization header
    ├─ Fetch from FastAPI backend (localhost:8000)
    └─ Handle errors (401/403/404/5xx)
    ↓
Backend (FastAPI)
    ├─ Verify JWT signature
    ├─ Extract user_id from token
    └─ Query database with user_id filter
    ↓
Response
    ├─ Success → Update UI state, show success toast
    └─ Error → Show error toast + retry button
```

---

## Performance Targets

From specification success criteria:

- **Task list updates**: < 1 second perceived latency
- **Page navigation**: < 2 seconds perceived load time
- **API responses**: Inherit backend targets (< 500ms p95)

**Optimization Strategies**:
- Next.js static generation for landing page
- Server components for initial dashboard render (faster TTFB)
- Client components for interactive UI (task CRUD)
- Loading skeletons to improve perceived performance
- Optimistic UI updates (immediate feedback, revert on error)

---

## Security Considerations

### Authentication Security

- JWT stored in HTTP-only cookies (not accessible via JavaScript, prevents XSS)
- HTTPS required in production (prevent token interception)
- CORS configured on backend (whitelist frontend origin only)
- Session expiry enforced (7 days default, permanent with "Remember me")

### Data Isolation

- Backend enforces `user_id` filtering (per Constitution Principle VII)
- Frontend cannot bypass isolation (all data via authenticated API)
- 404 response for forbidden resources (prevents ID enumeration)

### Input Validation

- Frontend validation (immediate feedback, reduces server load)
- Backend validation (security boundary, never trust client)
- Sanitization for XSS prevention (React handles by default)

---

## Risk Mitigation Plan

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Better Auth + FastAPI JWT secret mismatch | Medium | High | Early integration test with token verification |
| CORS issues | Low | Medium | Configure FastAPI CORS before frontend development |
| Session expiry poor UX | Medium | Medium | 401 handler with re-auth modal (preserve state) |

### User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slow API responses (>1s) | Low | Medium | Loading spinners, optimistic updates |
| Network failures | Medium | High | Retry buttons (per spec FR-012), offline detection |
| Multi-tab sync confusion | Medium | Low | Document manual refresh (per clarifications) |

---

## Open Questions (Resolved)

All research questions resolved. No blockers for implementation.

**Deferred to Phase III** (out of Phase II scope):
- Email verification (out of scope per spec)
- Password reset (out of scope per spec)
- Social auth (Google, Facebook - out of scope per spec)
- Real-time multi-tab sync (explicitly excluded per clarifications)

---

## Next Steps

1. ✅ Research complete (this document)
2. → Create `data-model.md` (TypeScript types for frontend state)
3. → Create `contracts/` (API request/response types)
4. → Create `quickstart.md` (developer onboarding guide)
5. → Update agent context with new technologies
6. → Generate task breakdown via `/sp.tasks`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Research Duration**: Phase 0 complete
**Approved for Phase 1**: Yes
