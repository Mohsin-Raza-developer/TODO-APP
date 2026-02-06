# Tasks: Chatbot Frontend

**Input**: Design documents from `/specs/007-chatbot-frontend/`  
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), quickstart.md (complete)

**Tests**: Manual verification only (no automated tests requested in spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` (Next.js application)
- All  paths relative to `frontend/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create basic configuration

- [x] T001 Install @openai/chatkit-react package via `npm install @openai/chatkit-react` in frontend/
- [x] T002 [P] Create ChatKit configuration in frontend/lib/chatkit-config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create API proxy route in frontend/app/api/chatkit/route.ts with JWT forwarding to chatbot backend
- [x] T004 [P] Create locked chat placeholder component in frontend/components/chat/LockedChatPlaceholder.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Authenticated Chat Interface (Priority: P1) 🎯 MVP

**Goal**: Logged-in users can interact with AI chatbot to manage tasks through natural conversation

**Independent Test**: Login, navigate to /chat, send "show my tasks", verify AI response streams and displays tasks

### Implementation for User Story 1

- [x] T005 [P] [US1] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx with useChatKit hook integration
- [x] T006 [US1] Create chat page in frontend/app/chat/page.tsx with server-side auth check
- [x] T007 [US1] Update Header component to add "Chat" navigation link in frontend/components/layout/Header.tsx

**Checkpoint**: At this point, authenticated users can chat with AI and manage tasks. This is a fully functional MVP!

---

## Phase 4: User Story 2 - Authentication-Based Access Control (Priority: P2)

**Goal**: Unauthenticated users see locked UI prompting sign-in, protecting chat for registered users only

**Independent Test**: Open /chat without logging in, verify locked UI with lock icon displays, click "Sign In" button, verify redirect to login page

### Implementation for User Story 2

- [x] T008 [US2] Integrate LockedChatPlaceholder component into chat page conditional rendering (frontend/app/chat/page.tsx)
- [x] T009 [US2] Add lock icon SVG and styling to LockedChatPlaceholder component (frontend/components/chat/LockedChatPlaceholder.tsx)

**Checkpoint**: Unauthenticated users cannot access chat, only see sign-in prompt

---

## Phase 5: User Story 3 - Chat Thread Persistence (Priority: P3)

**Goal**: Users can return to previous conversations and continue where they left off with full conversation history

**Independent Test**: Have a conversation, close browser, return to /chat while logged in, verify previous messages still visible

### Implementation for User Story 3

- [x] T010 [US3] Configure ChatKit onThreadChange callback to persist thread ID in ChatInterface component (frontend/components/chat/ChatInterface.tsx)
- [x] T011 [US3] Implement thread loading logic from localStorage on component mount (frontend/components/chat/ChatInterface.tsx)
- [x] T012 [US3] Add thread switching UI controls to ChatInterface (optional enhancement - frontend/components/chat/ChatInterface.tsx)

**Checkpoint**: All user stories complete - conversation history persists across sessions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all user stories

- [ ] T013 [P] Update package.json to lock @openai/chatkit-react version after testing
- [ ] T014 [P] Add TypeScript types for ChatKit configuration in frontend/lib/chatkit-config.ts
- [ ] T015 [P] Test responsive design on mobile (320px viewport) per success criteria SC-005
- [ ] T016 Verify no authentication tokens exposed in browser console per success criteria SC-006
- [ ] T017 Run all manual verification tests from plan.md verification section
- [ ] T018 Update README.md with chat feature documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - Or User Story 1 can be done alone for MVP, then P2/P3 added later
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Modifies same page.tsx as US1 but separate section (conditional rendering)
- **User Story 3 (P3)**: Depends on User Story 1 (modifies ChatInterface.tsx created in US1)

### Within Each User Story

- US1: ChatInterface and page.tsx can be created in parallel ([P] tasks T005 and T006)
- US1: Header navigation link (T007) depends on page.tsx existing
- US2: Integration task (T008) depends on placeholder component from Phase 2 (T004)
- US3: All tasks modify the same ChatInterface.tsx file sequentially

### Parallel Opportunities

- **Phase 1**: Both tasks can run in parallel
- **Phase 2**: T003 (API proxy) and T004 (locked placeholder) can run in parallel [P]
- **Phase 3 (US1)**: T005 (ChatInterface) and T006 (page.tsx) can run in parallel [P]
- **Phase 6**: Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch ChatInterface and page components together:
Task T005: "Create ChatInterface component in frontend/components/chat/ChatInterface.tsx"
Task T006: "Create chat page in frontend/app/chat/page.tsx"

# Both work on different files, no conflicts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install ChatKit, create config)
2. Complete Phase 2: Foundational (API proxy + locked placeholder)
3. Complete Phase 3: User Story 1 (authenticated chat interface)
4. **STOP and VALIDATE**: 
   - Login to app
   - Navigate to /chat
   - Send message "show my tasks"
   - Verify streaming response
   - Verify task operations work (add, complete, list)
5. **MVP COMPLETE** - Can demo/deploy authenticated chat feature!

### Incremental Delivery

1. **Milestone 1** (Phases 1-3): MVP - Authenticated chat works
   - Login required
   - Chat with AI
   - Task management via conversation
   
2. **Milestone 2** (Phase 4): + Access control
   - Locked UI for unauthenticated users
   - Sign-in workflow
   
3. **Milestone 3** (Phase 5): + History persistence
   - Conversation history preserved
   - Return to previous chats
   - Thread management

4. **Release** (Phase 6): Polish and verify all features

### Sequential Strategy (Single Developer)

1. Work through phases 1-3 for working MVP
2. Validate MVP manually (quickstart.md test scenarios)
3. Add Phase 4 (P2) for access control
4. Add Phase 5 (P3) for history
5. Polish and documentation in Phase 6

---

## Notes

- All tasks organized by user story for independent delivery
- MVP = Just Phase 1 + Phase 2 + Phase 3 (User Story 1)
- User Story 2 & 3 can be added incrementally after MVP
- No automated tests requested - using manual verification from plan.md
- Chatbot backend (port 8001) and MCP server (port 8000) must be running
- Lock placeholder created in Phase 2 but integrated in Phase 4 (US2)
- Thread persistence (US3) modifies US1 components - dependency noted
- All file paths use absolute references from frontend/ directory
