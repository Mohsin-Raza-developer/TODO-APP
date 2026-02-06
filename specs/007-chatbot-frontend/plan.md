# Implementation Plan: Chatbot Frontend

**Branch**: `007-chatbot-frontend` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-chatbot-frontend/spec.md`

## Summary

Add AI chatbot UI to frontend using OpenAI ChatKit React library integrated with existing Better Auth system. Authenticated users will be able to interact with the chatbot for task management through natural conversation. Unauthenticated users will see a locked UI prompting them to sign in. The chatbot will communicate with the existing chatbot backend (`http://localhost:8001/api/chatkit`) using JWT tokens from Better Auth.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.1.2, React 19.2.3  
**Primary Dependencies**: `@openai/chatkit-react` (new), Better Auth 1.3.4 (existing)  
**Storage**: Database persistence handled by chatbot backend (Neon PostgreSQL)  
**Testing**: Manual testing via browser, component tests (if time permits)  
**Target Platform**: Web browsers (desktop and mobile responsive)  
**Project Type**: Web application (Next.js frontend)  
**Performance Goals**: Chat response initiation \u003c 5 seconds, UI loads \u003c 1 second  
**Constraints**: Must use existing Better Auth for authentication, JWT token forwarding to backend  
**Scale/Scope**: Single chatbot component, 1 new page route, locked state for unauthenticated users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **No new projects**: Adding feature to existing `frontend` project  
✅ **Minimal dependencies**: Only adding `@openai/chatkit-react`  
✅ **Reuses existing patterns**: Following dashboard page authentication pattern  
✅ **Type safety**: Full TypeScript coverage maintained  
✅ **Documentation**: Plan, quickstart will be created

**Status**: PASS - Aligns with constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/007-chatbot-frontend/
├── spec.md                  # Feature specification (complete)
├── plan.md                  # This file
├── research.md              # ChatKit integration research (Phase 0)
├── quickstart.md            # Setup and usage guide (Phase 1)
└── checklists/
    └── requirements.md      # Spec validation (complete)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── chat/                # NEW: Chat page route
│   │   └── page.tsx         # NEW: Main chat page with auth check
│   ├── api/
│   │   └── chatkit/         # NEW: ChatKit API proxy endpoints
│   │       └── route.ts     # NEW: Proxy to chatbot backend
│   └── layout.tsx           # EXISTING: Root layout
│
├── components/
│   ├── chat/                # NEW: Chat-specific components
│   │   ├── ChatInterface.tsx      # NEW: ChatKit wrapper with auth
│   │   └── LockedChatPlaceholder.tsx  # NEW: Locked UI for unauth users
│   └── layout/              # EXISTING: Layout components
│
├── hooks/
│   └── useAuth.ts          # EXISTING: Auth hook (already implemented)
│
├── lib/
│   ├── auth-client.ts      # EXISTING: Better Auth client
│   └── chatkit-config.ts   # NEW: ChatKit configuration
│
└── package.json            # MODIFY: Add @openai/chatkit-react
```

**Structure Decision**: Web application structure (Option 2) - Extending existing Next.js frontend with new `/chat` route and ChatKit integration components.

## Proposed Changes

### Phase 0: Research & Dependencies

#### 1. Install ChatKit React Package

**File**: `frontend/package.json`

**Action**: Add dependency

```json
{
  "dependencies": {
    "@openai/chatkit-react": "^latest"
  }
}
```

**Command**: `cd frontend && npm install @openai/chatkit-react`

---

#### 2. Research Documentation

**File**: `specs/007-chatbot-frontend/research.md`

**Content**:
- ChatKit React integration patterns (from Context7 research)
- Custom fetch configuration for Bearer token injection
- Best practices for authentication with ChatKit
- Theme configuration for dark mode consistency

---

### Phase 1: Core Implementation

#### 3. Create ChatKit Configuration

**File**: `frontend/lib/chatkit-config.ts` [NEW]

```typescript
/**
 * ChatKit configuration with Better Auth integration
 */
export const CHATKIT_CONFIG = {
  api: {
    url: '/api/chatkit',  // Proxy to backend
  },
  theme: {
    colorScheme: 'dark' as const,  // Match existing app theme
  },
};
```

**Purpose**: Central configuration for ChatKit setup

---

#### 4. Create API Proxy Route

**File**: `frontend/app/api/chatkit/route.ts` [NEW]

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  // Verify authentication
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get JWT token from session
  const token = session.session.token;  // Better Auth JWT

  // Forward request to chatbot backend
  const body = await request.text();
  
  const response = await fetch('http://localhost:8001/api/chatkit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  });

  // Return backend response (streaming supported)
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}
```

**Purpose**: Proxy requests to chatbot backend with JWT token injection

---

#### 5. Create Locked Chat Placeholder Component

**File**: `frontend/components/chat/LockedChatPlaceholder.tsx` [NEW]

```typescript
"use client";

import { useRouter } from 'next/navigation';

export function LockedChatPlaceholder() {
  const router = useRouter();

  return (
    \u003cdiv className="flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg p-8"\u003e
      \u003cdiv className="text-center space-y-4"\u003e
        {/* Lock Icon */}
        \u003csvg className="w-16 h-16 mx-auto text-gray-400" /* ... lock icon SVG ... */ /\u003e
        
        \u003ch2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300"\u003e
          Sign in to Chat
        \u003c/h2\u003e
        
        \u003cp className="text-gray-600 dark:text-gray-400"\u003e
          Please sign in to access the AI chatbot and manage your tasks through conversation.
        \u003c/p\u003e
        
        \u003cbutton
          onClick={() =\u003e router.push('/login?redirect=/chat')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        \u003e
          Sign In
        \u003c/button\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );
}
```

**Purpose**: Display locked UI for unauthenticated users (US2)

---

#### 6. Create Chat Interface Component

**File**: `frontend/components/chat/ChatInterface.tsx` [NEW]

```typescript
"use client";

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/hooks/useAuth';
import { CHATKIT_CONFIG } from '@/lib/chatkit-config';

interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { session } = useAuth();
  
  const { control } = useChatKit({
    ...CHATKIT_CONFIG,
    api: {
      ...CHATKIT_CONFIG.api,
      // Custom fetch to add authentication
      fetch: async (url, options) =\u003e {
        const token = session?.session.token;
        
        return fetch(url, {
          ...options,
          headers: {
            ...(options?.headers || {}),
            'Authorization': `Bearer ${token}`,
          },
        });
      },
    },
    onError: ({ error }) =\u003e {
      console.error('ChatKit error:', error);
    },
  });

  return (
    \u003cChatKit 
      control={control} 
      className="h-[calc(100vh-200px)] w-full max-w-4xl mx-auto"
    /\u003e
  );
}
```

**Purpose**: Authenticated chat interface with ChatKit integration (US1)

---

#### 7. Create Chat Page

**File**: `frontend/app/chat/page.tsx` [NEW]

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LockedChatPlaceholder } from '@/components/chat/LockedChatPlaceholder';

export const metadata = {
  title: 'AI Chat - Todo App',
  description: 'Manage your tasks through AI conversation',
};

export default async function ChatPage() {
  // Server-side session check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session;

  return (
    \u003cdiv className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900"\u003e
      \u003cHeader /\u003e

      \u003cmain className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"\u003e
        \u003ch1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white"\u003e
          AI Task Assistant
        \u003c/h1\u003e

        {isAuthenticated ? (
          \u003cChatInterface userId={session.user.id} /\u003e
        ) : (
          \u003cLockedChatPlaceholder /\u003e
        )}
      \u003c/main\u003e

      \u003cFooter /\u003e
    \u003c/div\u003e
  );
}
```

**Purpose**: Main chat page with conditional rendering based on auth (US1, US2)

---

#### 8. Update Navigation

**File**: `frontend/components/layout/Header.tsx` [MODIFY]

**Action**: Add "Chat" link to navigation menu

```tsx
\u003cLink href="/chat" className="nav-link"\u003eChat\u003c/Link\u003e
```

**Purpose**: Allow users to navigate to chat from any page

---

### Phase 2: Documentation

#### 9. Create Quickstart Guide

**File**: `specs/007-chatbot-frontend/quickstart.md`

**Content**:
- Installation steps (`npm install`)
- How to access chat interface (`/chat` route)
- Expected behavior for authenticated vs unauthenticated users
- Troubleshooting common issues (backend not running, token expired)

---

## Verification Plan

### Automated Tests

**Note**: Due to time constraints and complexity of testing ChatKit integration, we'll rely primarily on manual testing. Future iterations can add component tests.

**Optional (if time permits)**:
```bash
# Component rendering tests
cd frontend
npm test -- ChatInterface.test.tsx
npm test -- LockedChatPlaceholder.test.tsx
```

### Manual Verification

#### Test 1: Unauthenticated User Flow (US2)

**Prerequisites**: User is not logged in

**Steps**:
1. Open browser to `http://localhost:3001`
2. Navigate to `/chat` route
3. **Expected**: See locked UI with lock icon and "Sign in to Chat" message
4. Click "Sign In" button
5. **Expected**: Redirected to `/login?redirect=/chat`
6. Complete login
7. **Expected**: Redirected back to `/chat` with full chat interface visible

**Success Criteria**: Lock UI displays correctly, sign-in flow works, redirection after login works

---

#### Test 2: Authenticated Chat Interface (US1)

**Prerequisites**: 
- Chatbot backend running on `http://localhost:8001`
- User logged in

**Steps**:
1. Navigate to `/chat` route
2. **Expected**: See ChatKit UI with message composer
3. Type message: "show my tasks"
4. Press Enter or click Send
5. **Expected**: See streaming AI response listing tasks
6. Type message: "add task: Test chatbot"
7. **Expected**: AI confirms task creation
8. Navigate to `/dashboard`
9. **Expected**: New task "Test chatbot" appears in task list
10. Return to `/chat`
11. **Expected**: Previous conversation history still visible (US3)

**Success Criteria**: Chat interface loads, messages send/receive, streaming works, task operations work, history persists

---

#### Test 3: Mobile Responsiveness (SC-005)

**Steps**:
1. Open browser DevTools
2. Set viewport to 320px width (iPhone SE)
3. Navigate to `/chat` while logged in
4. **Expected**: Chat UI is fully functional and readable
5. Test sending a message
6. **Expected**: Composer works, messages display properly

**Success Criteria**: UI is usable on mobile devices

---

#### Test 4: Error Handling

**Prerequisites**: User logged in

**Steps**:
1. Stop chatbot backend (`Ctrl+C` on backend terminal)
2. Navigate to `/chat`
3. Try sending a message
4. **Expected**: Error message displayed (ChatKit's built-in error handling)
5. Restart backend
6. Try sending message again
7. **Expected**: Message succeeds

**Success Criteria**: Graceful error handling when backend unavailable

---

## Complexity Tracking

*This section is empty - no Constitution violations requiring justification.*

---

## Notes

- **Backend Dependency**: Requires chatbot backend running on port 8001
- **MCP Server**: Backend requires MCP server on port 8000 (for task operations)
- **Database**: Uses existing Neon PostgreSQL via chatbot backend
- **Theme**: ChatKit configured for dark mode to match existing app
- **Future Enhancements**: Thread list UI, delete threads, export conversations
