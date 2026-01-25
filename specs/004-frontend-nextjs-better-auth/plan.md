# Implementation Plan: Todo Web Application Frontend with User Authentication

**Branch**: `004-frontend-nextjs-better-auth` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-frontend-nextjs-better-auth/spec.md`

## Summary

Build a modern Next.js 16 web frontend for the todo application with Better Auth authentication, integrating with the existing FastAPI backend. The frontend provides a responsive, accessible interface for user authentication (signup/signin) and complete CRUD operations on todo tasks. The application enforces user data isolation through JWT token authentication, maintains theme preferences locally (dark mode default), and implements standardized UX patterns for loading states, success/error messages, and retry functionality.

**Key Technical Approach**:
- **Frontend Framework**: Next.js 16 with App Router (server components + client components)
- **Authentication**: Better Auth with JWT tokens stored in HTTP-only cookies
- **Middleware**: Route protection via Next.js middleware with Better Auth session validation
- **API Integration**: Fetch API with Authorization headers to FastAPI backend (localhost:8000)
- **Styling**: Tailwind CSS with dark/light mode toggle (localStorage-persisted)
- **State Management**: React Context for global state (user session, theme, todos)
- **Error Handling**: Centralized error boundary + retry patterns for API failures
- **UX Patterns**: Standardized feedback (loading spinners, toast notifications, form validation)

## Technical Context

**Language/Version**: TypeScript 5+ (Frontend), Python 3.13+ (Backend - existing)
**Primary Dependencies**:
- Frontend: Next.js 16.1.1, Better Auth 1.3.4, Tailwind CSS 3+, React 19+
- Backend: FastAPI (existing), SQLModel (existing), Neon PostgreSQL (existing)

**Storage**:
- User session: HTTP-only cookies (Better Auth managed)
- Theme preference: Browser localStorage
- Todo data: Neon PostgreSQL via FastAPI backend API

**Testing**:
- Frontend: Jest + React Testing Library + Playwright (E2E)
- Backend: pytest (existing, 36/36 tests passing)

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 years)

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- Task list updates: < 1 second perceived latency
- Page navigation: < 2 seconds perceived load time
- API response: Inherit backend targets (< 500ms p95)

**Constraints**:
- No real-time sync across tabs (manual refresh required)
- Date-only format (YYYY-MM-DD, no time component)
- 8-character minimum password (no complexity requirements)
- Theme preference device-specific (not synced to backend)

**Scale/Scope**:
- 8 prioritized user stories (P1-P8)
- 16 functional requirements
- 12 success criteria
- ~10-15 React components (landing, auth, dashboard, task CRUD, theme toggle)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. SDD-RI Methodology ✅
- Specification complete and validated (v2.0, 19/19 checklist items)
- Clarifications resolved (4 items from Session 2026-01-15)
- Planning in progress (this document)
- Tasks will follow via `/sp.tasks`

### II. Pythonic Excellence ✅ (Backend) / TypeScript Excellence ✅ (Frontend)
- Backend: PEP 8 compliant, type hints, FastAPI best practices (existing)
- Frontend: TypeScript strict mode, ESLint + Prettier, Next.js conventions

### III. Persistent Relational State ✅
- Database: Neon PostgreSQL (existing, Phase II complete)
- ORM: SQLModel with user_id isolation (existing)
- Frontend: Stateless (all data via API calls)

### IV. Type Safety & Documentation ✅
- Backend: Full type hints with mypy --strict (existing)
- Frontend: TypeScript 5+ with strict mode, JSDoc for complex functions
- API: OpenAPI schema (FastAPI auto-generated, existing)

### V. Terminal-Based Verification ✅
- Backend: curl/HTTPie testable (existing, API_TESTING_GUIDE.md available)
- Frontend: Browser DevTools, Playwright E2E tests

### VI. Reusable Intelligence (Agent Skills) ✅
- **ux_logic_anchor**: Applied for standardized UI feedback patterns
- **error_handler**: Applied for centralized error handling architecture
- **multi_user_data_isolation**: Already implemented in backend (user_id filtering)

### VII. Stateless Security (JWT Authentication) ✅
- Backend: JWT verification with BETTER_AUTH_SECRET (existing)
- Frontend: Better Auth client with session management
- Middleware: Route protection with session cookie validation

**GATE STATUS**: ✅ **PASS** - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-nextjs-better-auth/
├── spec.md              # Feature specification (v2.0)
├── plan.md              # This file (architectural plan)
├── research.md          # Phase 0 research findings (created below)
├── data-model.md        # Phase 1 frontend state model (created below)
├── quickstart.md        # Phase 1 developer quickstart guide (created below)
├── contracts/           # Phase 1 API contracts & types (created below)
│   ├── api-client.ts    # TypeScript API client types
│   └── backend-api.md   # Backend API reference (links to existing docs)
└── checklists/
    └── requirements.md  # Spec validation checklist (existing)
```

### Source Code (repository root)

```text
frontend/                    # ← NEW: Next.js 16 application
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout (theme provider, fonts)
│   │   ├── page.tsx        # Landing page (public)
│   │   ├── login/
│   │   │   └── page.tsx    # Login page
│   │   ├── signup/
│   │   │   └── page.tsx    # Signup page
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Protected dashboard (task list)
│   │   └── api/
│   │       └── auth/
│   │           └── [...all]/
│   │               └── route.ts  # Better Auth API handler
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── auth/           # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── tasks/          # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilter.tsx
│   │   │   └── EmptyState.tsx
│   │   └── layout/         # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/                # Utilities and configuration
│   │   ├── auth.ts         # Better Auth server config
│   │   ├── auth-client.ts  # Better Auth client config
│   │   ├── api-client.ts   # FastAPI backend client
│   │   ├── error-handler.ts # Centralized error handling
│   │   └── utils.ts        # Utility functions
│   ├── contexts/           # React Context providers
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication state hook
│   │   ├── useTasks.ts     # Task CRUD operations hook
│   │   └── useToast.ts     # Toast notifications hook
│   ├── types/              # TypeScript type definitions
│   │   ├── task.ts         # Task entity types
│   │   ├── user.ts         # User entity types
│   │   └── api.ts          # API request/response types
│   └── middleware.ts       # Next.js middleware (route protection)
├── public/                 # Static assets
│   └── (images, icons)
├── tests/                  # Test files
│   ├── unit/              # Component unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # Playwright E2E tests
├── .env.local             # Environment variables (not committed)
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies

backend/                    # Existing FastAPI application
├── src/
│   ├── models/            # SQLModel entities (existing)
│   ├── services/          # Business logic (existing)
│   ├── api/               # FastAPI routes (existing)
│   └── core/              # Configuration (existing)
└── tests/                 # pytest tests (36/36 passing)
```

**Structure Decision**: Web application with separated frontend and backend. Frontend is a new Next.js 16 project that communicates with the existing FastAPI backend via RESTful API calls. Backend serves as the API layer with database access; frontend handles presentation and user interaction.

## Complexity Tracking

**No violations to justify** - All constitution principles are satisfied without requiring exceptions.

---

## Phase 0: Research & Decision Making

### Research Questions Resolved

#### 1. Next.js 16 App Router Authentication Patterns

**Question**: How to implement route protection with Better Auth in Next.js 16 App Router?

**Research Findings** (from Context7 `/vercel/next.js/v16.1.1` and `/better-auth/better-auth`):

**Middleware-Based Protection** (Recommended):
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from protected routes
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Server Component Protection**:
```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome {session.user.name}</div>;
}
```

**Client Component Protection** (for dynamic UI):
```typescript
// components/UserProfile.tsx
"use client";
import { authClient } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return null;

  return <div>Welcome, {session.user.name}</div>;
}
```

**Decision**: Use **middleware for initial route protection** + **server component checks for sensitive data** + **client hooks for reactive UI**. This triple-layer approach provides defense-in-depth.

---

#### 2. Better Auth + FastAPI Backend Integration

**Question**: How to connect Better Auth (frontend) with FastAPI JWT verification (backend)?

**Research Findings**:

Better Auth generates JWT tokens that can be consumed by any backend. Integration pattern:

**Frontend Setup**:
```typescript
// lib/auth.ts (Better Auth server config)
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: {
    // Can use same Neon DB or separate auth DB
    url: process.env.DATABASE_URL!,
  },
});

// lib/auth-client.ts (Better Auth client)
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});
```

**Backend Integration** (existing FastAPI):
- Backend already verifies JWT with `BETTER_AUTH_SECRET`
- Frontend includes JWT in Authorization header: `Authorization: Bearer {token}`
- Better Auth stores token in HTTP-only cookie (secure, not accessible via JavaScript)
- For API calls, extract token from cookie and attach to requests

**API Client Pattern**:
```typescript
// lib/api-client.ts
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const session = await authClient.getSession();

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session?.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    await authClient.signOut();
    window.location.href = '/login';
  }

  return response;
}
```

**Decision**: Better Auth manages authentication UI/UX; FastAPI backend remains unchanged (already validates JWT). Frontend API client extracts token from Better Auth session and includes in API requests.

---

#### 3. State Management Strategy

**Question**: Use React Context, Zustand, or server state (React Query/SWR)?

**Options Considered**:
- **Option A**: React Context for global state (theme, user session, todos)
- **Option B**: Zustand for client state + React Query for server state
- **Option C**: Server state only (React Query), no global client state

**Decision**: **Option A - React Context**

**Rationale**:
- Simplicity for Phase II scope (8 user stories, limited state complexity)
- Theme and auth state are naturally context-appropriate (infrequent changes)
- No unnecessary dependencies (React Context is built-in)
- Avoids over-engineering for current requirements
- Can migrate to Zustand/Redux in Phase III if complexity increases

**Implementation**:
```typescript
// contexts/ThemeContext.tsx
const ThemeContext = createContext<ThemeContextType>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

#### 4. Error Handling Architecture

**Question**: How to centralize error handling for API failures (401, 403, 404, 5xx)?

**Research Findings** (from `error_handler` skill):

**Centralized Error Handler Pattern**:
```typescript
// lib/error-handler.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(response: Response): never {
  const errorMap: Record<number, { code: string; message: string }> = {
    401: { code: 'unauthorized', message: 'Session expired. Please sign in again.' },
    403: { code: 'forbidden', message: 'You do not have permission to access this resource.' },
    404: { code: 'not_found', message: 'The requested resource was not found.' },
    500: { code: 'server_error', message: 'Server error. Please try again later.' },
  };

  const error = errorMap[response.status] || {
    code: 'unknown_error',
    message: 'An unexpected error occurred.',
  };

  throw new APIError(response.status, error.code, error.message);
}

// Usage in API client
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

    if (!response.ok) {
      handleAPIError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      // Display user-friendly error via toast
      showToast({ type: 'error', message: error.message });
      throw error;
    }
    // Network error
    showToast({ type: 'error', message: 'Network error. Please check your connection.' });
    throw new APIError(0, 'network_error', 'Network request failed');
  }
}
```

**React Error Boundary** (for uncaught errors):
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Decision**: Centralized error handler with typed errors + toast notifications + error boundary for uncaught exceptions. Retry pattern included per spec (FR-012: network errors with retry button).

---

#### 5. UX Feedback Patterns

**Question**: How to standardize loading states, success messages, error displays, and toast notifications?

**Research Findings** (from `ux_logic_anchor` skill):

**Standardized Message Formats**:
- Success: `"SUCCESS: {action} completed."`
- Error: `"ERROR: {detail}."`
- Info: `"INFO: {message}."`

**Status Symbols** (from CLI patterns, adapted for web):
- Completed tasks: `✓` (checkmark)
- Pending tasks: `○` (circle)
- Loading: Spinner component

**Toast Notification System**:
```typescript
// contexts/ToastContext.tsx
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
```

**Loading States**:
```typescript
// components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-primary ${
        size === 'sm' ? 'h-4 w-4' :
        size === 'md' ? 'h-8 w-8' :
        'h-12 w-12'
      }`} />
    </div>
  );
}

// Usage in components
function TaskList() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return tasks.map(task => <TaskItem key={task.id} task={task} />);
}
```

**Form Validation Feedback**:
```typescript
// components/ui/Input.tsx
export function Input({ error, ...props }: InputProps) {
  return (
    <div className="input-wrapper">
      <input
        {...props}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
      />
      {error && (
        <span id={`${props.id}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Decision**: Implement toast notification system for transient feedback, inline validation for forms, loading spinners for async operations, and status symbols ([✓]/[○]) for task completion states.

---

### Technology Choices Summary

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| Frontend Framework | Next.js 16 (App Router) | Modern React patterns, server components, built-in routing |
| Authentication | Better Auth | TypeScript-first, framework-agnostic, JWT support |
| Styling | Tailwind CSS | Utility-first, dark mode support, responsive design |
| State Management | React Context | Sufficient for Phase II scope, avoids over-engineering |
| API Client | Fetch API | Native, no extra dependencies, sufficient for REST |
| Error Handling | Centralized handler + Error Boundary | Constitution-aligned, user-friendly messages |
| UX Feedback | Toast + Inline + Status Symbols | Skill-aligned patterns, consistent with CLI Phase I |
| Testing | Jest + React Testing Library + Playwright | Industry standard, comprehensive coverage |

---

## Phase 1: Design Artifacts

### 1. Data Model (`data-model.md` - created separately)

Frontend state model mirrors backend entities with TypeScript types.

### 2. API Contracts (`contracts/` - created separately)

TypeScript types for all API requests/responses + backend API reference.

### 3. Quickstart Guide (`quickstart.md` - created separately)

Developer onboarding: environment setup, running dev server, testing workflow.

---

## Architecture Diagrams

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Visit /login
       ▼
┌─────────────────────┐
│  Next.js Frontend   │
│  (Better Auth UI)   │
└──────┬──────────────┘
       │ 2. Submit email/password
       ▼
┌─────────────────────┐
│  Better Auth API    │
│  /api/auth/[...]    │
└──────┬──────────────┘
       │ 3. Validate credentials
       │ 4. Generate JWT (signed with BETTER_AUTH_SECRET)
       │ 5. Store in HTTP-only cookie
       ▼
┌─────────────────────┐
│  Browser (Cookie)   │
│  session={JWT}      │
└──────┬──────────────┘
       │ 6. Redirect to /dashboard
       ▼
┌─────────────────────┐
│  Middleware         │
│  (Route Protection) │
└──────┬──────────────┘
       │ 7. Validate session cookie
       ▼
┌─────────────────────┐
│  Dashboard Page     │
│  (Server Component) │
└──────┬──────────────┘
       │ 8. Fetch tasks from backend
       ▼
┌─────────────────────┐
│  API Client         │
│  (Authorization:    │
│   Bearer {JWT})     │
└──────┬──────────────┘
       │ 9. HTTP GET /api/{user_id}/tasks
       ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (JWT Verification) │
└──────┬──────────────┘
       │ 10. Verify JWT signature
       │ 11. Extract user_id from token
       │ 12. Query: SELECT * FROM tasks WHERE user_id = {token_user_id}
       ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
└─────────────────────┘
```

### Component Hierarchy

```
App (layout.tsx)
├── ThemeProvider (theme context)
├── ToastProvider (toast notifications)
└── ErrorBoundary (error recovery)
    │
    ├── Landing Page (/)
    │   ├── Header (navigation)
    │   ├── Hero (call-to-action)
    │   └── Footer
    │
    ├── Login Page (/login)
    │   └── LoginForm
    │       ├── Input (email)
    │       ├── Input (password)
    │       ├── Checkbox (remember me)
    │       └── Button (submit)
    │
    ├── Signup Page (/signup)
    │   └── SignupForm
    │       ├── Input (email)
    │       ├── Input (password)
    │       ├── Input (password confirmation)
    │       └── Button (submit)
    │
    └── Dashboard Page (/dashboard) [PROTECTED]
        ├── Header (user menu, theme toggle, signout)
        ├── TaskFilter (all/pending/completed)
        ├── TaskList
        │   ├── TaskItem (per task)
        │   │   ├── Checkbox (completion toggle)
        │   │   ├── TaskDetails (title, description, date)
        │   │   ├── Button (edit)
        │   │   └── Button (delete)
        │   └── EmptyState (if no tasks)
        └── TaskForm (create/edit modal)
            ├── Input (title)
            ├── Textarea (description)
            ├── DatePicker (date)
            └── Button (save)
```

### API Request Flow

```
User Action → Component Event Handler → Custom Hook (useTasks)
                                            │
                                            ▼
                                      API Client (lib/api-client.ts)
                                            │
                                            ├─→ Extract JWT from Better Auth session
                                            ├─→ Add Authorization header
                                            └─→ Fetch from backend
                                                      │
                                                      ▼
                                              FastAPI Backend
                                                      │
                                                      ├─→ Verify JWT
                                                      ├─→ Extract user_id
                                                      └─→ Query database
                                                              │
                                                              ▼
                                                      Neon PostgreSQL
                                                              │
                                                              ▼
                                              Response ← ← ← ← ←
                                                      │
                                                      ├─→ Success (200/201) → Update UI state
                                                      ├─→ Error (4xx/5xx) → Show toast + retry button
                                                      └─→ Network error → Show toast + retry button
```

---

## Implementation Strategy

### Incremental Delivery by Priority

Following specification priorities (P1-P8):

**Phase 1 - MVP (P1)**: User Authentication
- Landing page with signup/login
- Better Auth integration
- Middleware route protection
- Basic dashboard (empty state)

**Phase 2 - Core Functionality (P2-P3)**: View & Create Tasks
- Task list display with filters
- Create task form
- API integration for GET/POST

**Phase 3 - Full CRUD (P4-P6)**: Update, Toggle, Delete
- Edit task functionality
- Completion toggle
- Delete task with confirmation

**Phase 4 - Polish (P7-P8)**: Theme & Responsiveness
- Dark/light mode toggle
- Mobile-responsive layouts
- Cross-device testing

**Phase 5 - Hardening**: Error Handling & Testing
- Comprehensive error boundaries
- Retry patterns for all API calls
- E2E test coverage
- Accessibility audit

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Better Auth + FastAPI JWT mismatch | High | Use same BETTER_AUTH_SECRET on both sides; validate early |
| CORS issues (frontend → backend) | Medium | Configure FastAPI CORS with frontend origin whitelist |
| Session expiry UX | Medium | Detect 401 responses, show re-auth modal (preserve state) |
| localStorage theme sync | Low | Document device-specific behavior; consider backend sync in Phase III |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow API responses (>1s) | Medium | Loading spinners, optimistic UI updates, backend caching |
| Network failures | High | Retry buttons (per spec FR-012), offline detection, error messaging |
| Multi-tab confusion | Low | Document manual refresh requirement (per clarifications) |
| Password complexity confusion | Low | Clear inline help text ("Minimum 8 characters") |

---

## Dependencies & Prerequisites

### Before Starting Implementation

✅ **Backend Ready**: FastAPI with JWT auth, 36/36 tests passing, API docs available
✅ **Database Ready**: Neon PostgreSQL with user_id isolation, migrations applied
✅ **Environment**: BETTER_AUTH_SECRET shared between frontend and backend
✅ **Specification**: Complete, clarified, and validated (19/19 checklist items)

### External Dependencies

- **Better Auth**: Authentication library (npm package)
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js 16**: React framework with App Router
- **React 19+**: UI library (Next.js dependency)

### Development Tools

- Node.js 20+ (for Next.js)
- pnpm/npm/yarn (package manager)
- VS Code with TypeScript extension
- Prettier + ESLint (code formatting)

---

## Next Steps

1. ✅ **Phase 0 Complete**: Research findings documented above
2. 🔄 **Phase 1 In Progress**: Create design artifacts:
   - `data-model.md` (TypeScript types for frontend state)
   - `contracts/api-client.ts` (API request/response types)
   - `contracts/backend-api.md` (Reference to existing backend docs)
   - `quickstart.md` (Developer onboarding guide)
3. ⏳ **Next**: Update agent context with new technologies
4. ⏳ **Then**: `/sp.tasks` to generate implementation task breakdown

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Next Command**: Continue Phase 1 artifact creation
