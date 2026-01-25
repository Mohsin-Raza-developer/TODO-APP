# Tasks: Todo Web Application Frontend with User Authentication

**Input**: Design documents from `/specs/004-frontend-nextjs-better-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification - tests excluded from task breakdown

**Organization**: Tasks are grouped by user story (P1-P8) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/` (existing), `frontend/src/` (new)
- All frontend paths relative to `frontend/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Next.js 16 project with Better Auth and connect to existing FastAPI backend

- [x] T001 Create Next.js 16 project with TypeScript in frontend/ directory using create-next-app
- [x] T002 Install dependencies: next@16.1.1, react@19, better-auth@1.3.4, tailwindcss@3+, and TypeScript 5+
- [x] T003 [P] Configure TypeScript with strict mode in frontend/tsconfig.json
- [x] T004 [P] Configure Tailwind CSS with dark mode support in frontend/tailwind.config.ts
- [x] T005 [P] Configure ESLint and Prettier in frontend/.eslintrc.json and frontend/.prettierrc
- [x] T006 [P] Create frontend/.env.local with BETTER_AUTH_SECRET, DATABASE_URL, NEXT_PUBLIC_API_URL placeholders
- [x] T007 [P] Setup basic folder structure per plan.md (src/app, src/components, src/lib, src/hooks, src/types, src/contexts)
- [x] T008 [P] Create frontend/README.md with development setup instructions from quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Configure Better Auth server in frontend/lib/auth.ts with JWT plugin and database connection
- [x] T010 Configure Better Auth client in frontend/lib/auth-client.ts for React components
- [x] T011 Create Better Auth API handler in frontend/app/api/auth/[...all]/route.ts
- [x] T012 [P] Create TypeScript types in frontend/types/user.ts (User, UserSession, AuthState interfaces)
- [x] T013 [P] Create TypeScript types in frontend/types/task.ts (Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus, TaskListState interfaces)
- [x] T014 [P] Create TypeScript types in frontend/types/api.ts (APIErrorResponse, APIRequestConfig, APIError class, ERROR_MESSAGES map)
- [x] T015 [P] Create TypeScript types in frontend/types/theme.ts (Theme type, ThemeContextType interface)
- [x] T016 [P] Create TypeScript types in frontend/types/toast.ts (ToastType, Toast, ToastContextType interfaces)
- [x] T017 Create centralized error handler in frontend/lib/error-handler.ts (APIError class, handleAPIError function per error_handler skill)
- [x] T018 Create API client in frontend/lib/api-client.ts with automatic JWT token inclusion and error handling
- [x] T019 [P] Create ThemeContext provider in frontend/contexts/ThemeContext.tsx with localStorage persistence
- [x] T020 [P] Create ToastContext provider in frontend/contexts/ToastContext.tsx with toast state management
- [x] T021 Create Next.js middleware in frontend/middleware.ts for route protection (checks session cookie, redirects to /login if missing)
- [x] T022 Create root layout in frontend/app/layout.tsx with ThemeProvider, ToastProvider, and global styles
- [x] T023 [P] Create reusable Button component in frontend/components/ui/Button.tsx with variants (primary, secondary, danger, ghost)
- [x] T024 [P] Create reusable Input component in frontend/components/ui/Input.tsx with label, error, and helper text support
- [x] T025 [P] Create Toast notification component in frontend/components/ui/Toast.tsx with auto-dismiss functionality
- [x] T026 [P] Create ThemeToggle component in frontend/components/ui/ThemeToggle.tsx with light/dark mode switch
- [x] T027 Create Header component in frontend/components/layout/Header.tsx with logo, navigation, theme toggle, and sign-out button

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication and Access (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, sign in, and access their protected dashboard with session management

**Independent Test**: Create account with email/password → Sign out → Sign back in → Verify access to protected dashboard → Session persists with "Remember me" → Session expires after 7 days without "Remember me"

### Implementation for User Story 1

- [x] T028 [P] [US1] Create useAuth hook in frontend/src/hooks/useAuth.ts with signIn, signUp, signOut, refreshSession methods
- [x] T029 [P] [US1] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email/password fields and "Remember me" checkbox
- [x] T030 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx with email, password, and password confirmation fields
- [x] T031 [US1] Create login page in frontend/src/app/login/page.tsx with LoginForm and link to signup page
- [x] T032 [US1] Create signup page in frontend/src/app/signup/page.tsx with SignupForm and link to login page
- [x] T033 [US1] Create landing page in frontend/src/app/page.tsx with welcome message and links to login/signup
- [x] T034 [US1] Create dashboard layout in frontend/src/app/dashboard/page.tsx (server component) with session check and redirect logic
- [X] T035 [US1] Implement form validation for signup (email format, password min 8 chars, password confirmation match)
- [X] T036 [US1] Implement form validation for login (email format, password required)
- [X] T037 [US1] Add error handling for authentication failures (401 incorrect credentials, network errors with retry button)
- [X] T038 [US1] Implement "Remember me" functionality in Better Auth configuration (7 days vs permanent session)
- [X] T039 [US1] Test session persistence across page refreshes and verify redirect to login when unauthenticated

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup, signin, signout, and access protected dashboard

---

## Phase 4: User Story 2 - View and Filter Tasks (Priority: P2)

**Goal**: Display user's task list with filtering by status (all/pending/completed) and empty state handling

**Independent Test**: Sign in → View empty state → Create a few tasks → View all tasks → Filter by pending → Filter by completed → Verify task details display (title, description, date, status)

### Implementation for User Story 2

- [X] T040 [P] [US2] Create useTasks hook in frontend/src/hooks/useTasks.ts with fetchTasks, filter state, and helper methods (getPendingCount, getCompletedCount)
- [X] T041 [P] [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx to display task array
- [X] T042 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx to render individual task with status symbol ([✓]/[○] per ux_logic_anchor skill)
- [X] T043 [P] [US2] Create TaskFilter component in frontend/src/components/tasks/TaskFilter.tsx with all/pending/completed filter buttons
- [X] T044 [P] [US2] Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx for "no tasks yet" message
- [X] T045 [US2] Update dashboard page in frontend/src/app/dashboard/page.tsx to integrate TaskList, TaskFilter, and EmptyState components
- [X] T046 [US2] Implement fetchTasks in useTasks hook calling GET /api/{user_id}/tasks endpoint with status query parameter
- [X] T047 [US2] Implement filter logic in useTasks hook to update filteredTasks when filter changes
- [X] T048 [US2] Add loading spinner while fetching tasks (use ux_logic_anchor skill pattern)
- [X] T049 [US2] Add error handling for API failures with retry button (per error_handler skill)
- [X] T050 [US2] Display task details in TaskItem: title, description (if present), date (if present), completion status with visual indicators

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can view and filter their task list

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P3)

**Goal**: Enable users to create new tasks with title (required), description (optional), and date (optional)

**Independent Test**: Sign in → Click "Add Task" → Fill title "Buy groceries" → Submit → Task appears in list → Try empty title → See validation error → Try 250-char title → See 200-char limit error

### Implementation for User Story 3

- [X] T051 [P] [US3] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx with mode prop (create/edit), title/description/date fields
- [X] T052 [P] [US3] Create validation rules in frontend/src/lib/validation.ts for title (1-200 chars required), description (0-1000 chars optional), date (YYYY-MM-DD format optional)
- [X] T053 [US3] Implement createTask method in frontend/src/hooks/useTasks.ts calling POST /api/{user_id}/tasks endpoint
- [X] T054 [US3] Add "Create Task" button to dashboard page in frontend/src/app/dashboard/page.tsx opening TaskForm modal/dialog
- [X] T055 [US3] Implement form validation in TaskForm with inline error messages for title length, description length
- [X] T056 [US3] Add date picker input in TaskForm with YYYY-MM-DD format guidance
- [X] T057 [US3] Display success toast notification after task creation (per ux_logic_anchor skill: "SUCCESS: Task created completed.")
- [X] T058 [US3] Refresh task list immediately after successful creation (optimistic UI update)
- [X] T059 [US3] Handle API errors (422 validation error from backend) and display field-specific errors
- [X] T060 [US3] Prevent form submission when validation fails and provide clear feedback

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - users can create new tasks

---

## Phase 6: User Story 4 - Update Existing Tasks (Priority: P4)

**Goal**: Allow users to edit task title, description, and date fields with validation

**Independent Test**: Create task "Buy milk" → Click edit → Change title to "Buy groceries and milk" → Save → Verify updated title displays → Edit description and date → Verify all changes persist

### Implementation for User Story 4

- [X] T061 [US4] Implement updateTask method in frontend/src/hooks/useTasks.ts calling PUT /api/{user_id}/tasks/{task_id} endpoint
- [X] T062 [US4] Add edit button to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [X] T063 [US4] Update TaskForm component to support edit mode with initialData prop (populate existing task values)
- [X] T064 [US4] Handle edit button click in dashboard to open TaskForm in edit mode with selected task data
- [X] T065 [US4] Display success toast notification after task update (per ux_logic_anchor skill: "SUCCESS: Task updated completed.")
- [X] T066 [US4] Refresh task list immediately after successful update (optimistic UI update)
- [X] T067 [US4] Handle 404 error when task was deleted in another tab/device (show error message and refresh list)
- [X] T068 [US4] Handle validation errors (422 from backend) for updated fields
- [X] T069 [US4] Allow clearing optional fields (description, date) by setting to null

**Checkpoint**: At this point, User Stories 1-4 should all work - users can update existing tasks

---

## Phase 7: User Story 5 - Toggle Task Completion (Priority: P5)

**Goal**: Enable one-click task completion toggle with visual feedback and persistence

**Independent Test**: Create pending task → Click checkbox → Task marked complete with visual feedback (strikethrough, checkmark) → Click again → Task marked pending → Refresh page → Status persists

### Implementation for User Story 5

- [ ] T070 [US5] Implement toggleTaskCompletion method in frontend/src/hooks/useTasks.ts calling PATCH /api/{user_id}/tasks/{task_id}/complete endpoint
- [ ] T071 [US5] Add completion checkbox to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T072 [US5] Add visual feedback for completed tasks in TaskItem (strikethrough text, checkmark icon, different background color)
- [ ] T073 [US5] Handle checkbox click to call toggleTaskCompletion and update task state optimistically
- [ ] T074 [US5] Revert optimistic update if API call fails and show error toast
- [ ] T075 [US5] Update task list to reflect completion status change immediately
- [ ] T076 [US5] Ensure completion status persists across page refreshes (verify fetched from backend)
- [ ] T077 [US5] Test toggling between pending → completed → pending multiple times

**Checkpoint**: At this point, User Stories 1-5 should all work - users can toggle task completion status

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P6)

**Goal**: Allow permanent task deletion with confirmation feedback

**Independent Test**: Create task → Click delete button → Task removed from list → See confirmation toast → Refresh page → Deleted task does not reappear

### Implementation for User Story 6

- [ ] T078 [US6] Implement deleteTask method in frontend/src/hooks/useTasks.ts calling DELETE /api/{user_id}/tasks/{task_id} endpoint
- [ ] T079 [US6] Add delete button to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T080 [US6] Handle delete button click to call deleteTask and remove task from list optimistically
- [ ] T081 [US6] Display success toast notification after task deletion (per ux_logic_anchor skill: "SUCCESS: Task deleted completed.")
- [ ] T082 [US6] Revert optimistic delete if API call fails and show error toast
- [ ] T083 [US6] Handle 404 error gracefully (task already deleted in another tab/device)
- [ ] T084 [US6] Ensure deleted task does not reappear after page refresh

**Checkpoint**: At this point, User Stories 1-6 should all work - users have full CRUD operations on tasks

---

## Phase 9: User Story 7 - Theme Customization (Priority: P7)

**Goal**: Provide light/dark mode toggle with device-specific localStorage persistence

**Independent Test**: Toggle theme switch from dark to light → All pages update immediately → Sign out and back in → Theme preference persists → Sign in on different device → Default dark mode (device-specific preference)

### Implementation for User Story 7

- [ ] T085 [US7] Implement useTheme hook in frontend/src/hooks/useTheme.ts (wrapper around ThemeContext)
- [ ] T086 [US7] Add theme toggle button to Header component in frontend/src/components/layout/Header.tsx using ThemeToggle component
- [ ] T087 [US7] Verify ThemeContext saves theme preference to localStorage on toggle
- [ ] T088 [US7] Verify ThemeContext reads theme preference from localStorage on app load
- [ ] T089 [US7] Apply dark mode styles to all pages using Tailwind CSS dark: variants
- [ ] T090 [US7] Apply light mode styles to all pages using default Tailwind classes
- [ ] T091 [US7] Test theme persistence across sign-out and sign-in (preference stored in browser, not backend)
- [ ] T092 [US7] Test theme preference is device-specific (different devices start with default dark mode)
- [ ] T093 [US7] Ensure all components (forms, buttons, inputs, task items) support both themes

**Checkpoint**: At this point, User Stories 1-7 should all work - users can customize theme

---

## Phase 10: User Story 8 - Responsive Design (Priority: P8)

**Goal**: Ensure app is usable on phone, tablet, and desktop with adaptive layouts

**Independent Test**: Access app on phone (375px width) → All features usable with touch → Access on tablet (768px width) → Layout adapts → Access on desktop (1920px width) → Interface utilizes space effectively

### Implementation for User Story 8

- [ ] T094 [US8] Add responsive breakpoints to Tailwind config in frontend/tailwind.config.ts (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- [ ] T095 [US8] Make Header component responsive in frontend/src/components/layout/Header.tsx (hamburger menu for mobile, full nav for desktop)
- [ ] T096 [US8] Make TaskList component responsive in frontend/src/components/tasks/TaskList.tsx (single column on mobile, grid on tablet/desktop)
- [ ] T097 [US8] Make TaskItem component responsive in frontend/src/components/tasks/TaskItem.tsx (stack vertically on mobile, horizontal on desktop)
- [ ] T098 [US8] Make TaskForm component responsive in frontend/src/components/tasks/TaskForm.tsx (full-screen modal on mobile, dialog on desktop)
- [ ] T099 [US8] Make authentication forms responsive (LoginForm, SignupForm) - stack vertically on mobile, centered on desktop
- [ ] T100 [US8] Test touch interactions on mobile (tap targets min 44px, no hover-only features)
- [ ] T101 [US8] Test tablet layout (768px-1024px) - verify all features accessible
- [ ] T102 [US8] Test desktop layout (>1024px) - verify effective use of space
- [ ] T103 [US8] Add responsive padding and margins using Tailwind responsive utilities (px-4 md:px-8 lg:px-16)
- [ ] T104 [US8] Test form inputs are large enough for touch on mobile (min 44px height)

**Checkpoint**: At this point, all 8 User Stories are complete - app works on all devices

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and validation

- [ ] T105 [P] Add loading skeletons for improved perceived performance during API calls
- [ ] T106 [P] Implement optimistic UI updates for all CRUD operations (immediate feedback, revert on error)
- [ ] T107 [P] Add keyboard shortcuts for common actions (Ctrl+K to create task, Escape to close modals)
- [ ] T108 [P] Improve accessibility (ARIA labels, keyboard navigation, focus management)
- [ ] T109 [P] Add meta tags for SEO in frontend/src/app/layout.tsx (title, description, Open Graph)
- [ ] T110 [P] Create favicon and app icons in frontend/public/
- [ ] T111 [P] Add 404 error page in frontend/src/app/not-found.tsx
- [ ] T112 [P] Add global error boundary in frontend/src/app/error.tsx
- [ ] T113 Validate all success criteria from spec.md (SC-001 through SC-012)
- [ ] T114 Run frontend build (npm run build) and fix any TypeScript errors
- [ ] T115 Run frontend linter (npm run lint) and fix any warnings
- [ ] T116 Test all 8 user stories end-to-end following acceptance scenarios from spec.md
- [ ] T117 Verify all 16 functional requirements (FR-001 through FR-016) are implemented
- [ ] T118 Update frontend/README.md with final deployment instructions
- [ ] T119 Verify quickstart.md instructions work for new developers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed) after Phase 2
  - OR sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ **MVP READY**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies (uses US1 auth but independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies (extends US2 view with create)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies (extends US3 create with update)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies (extends US2 view with toggle)
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - No dependencies (extends US2 view with delete)
- **User Story 7 (P7)**: Can start after Foundational (Phase 2) - No dependencies (cross-cutting theme feature)
- **User Story 8 (P8)**: Can start after Foundational (Phase 2) - No dependencies (cross-cutting responsive design)

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Tasks without [P] must run sequentially (dependencies within story)
- Each story should be complete and tested before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T003, T004, T005, T006, T007, T008 can all run in parallel

**Foundational Phase (Phase 2)**:
- T012, T013, T014, T015, T016 (all type files) can run in parallel
- T019, T020 (context providers) can run in parallel
- T023, T024, T025, T026 (UI components) can run in parallel

**User Story 1**:
- T028, T029, T030 can run in parallel (hook + 2 forms)

**User Story 2**:
- T040, T041, T042, T043, T044 can all run in parallel (hook + 4 components)

**User Story 3**:
- T051, T052 can run in parallel (component + validation)

**User Story 8**:
- T094, T095, T096, T097, T098, T099 can run in parallel (all responsive updates)

**Polish Phase**:
- T105, T106, T107, T108, T109, T110, T111, T112 can all run in parallel

**Once Foundational phase completes, ALL user stories (P1-P8) can start in parallel if team capacity allows**

---

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create useTasks hook in frontend/src/hooks/useTasks.ts"
Task: "Create TaskList component in frontend/src/components/tasks/TaskList.tsx"
Task: "Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx"
Task: "Create TaskFilter component in frontend/src/components/tasks/TaskFilter.tsx"
Task: "Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T027) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T028-T039)
4. **STOP and VALIDATE**: Test authentication flow end-to-end
5. Deploy/demo if ready - **WORKING MVP with signup/signin/protected dashboard**

### Incremental Delivery (Recommended for Hackathon Phase II)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)** ✅
3. Add User Story 2 → Test independently → Deploy/Demo (View tasks)
4. Add User Story 3 → Test independently → Deploy/Demo (Create tasks)
5. Add User Story 4 → Test independently → Deploy/Demo (Update tasks)
6. Add User Story 5 → Test independently → Deploy/Demo (Toggle completion)
7. Add User Story 6 → Test independently → Deploy/Demo (Delete tasks) ← **ALL 5 BASIC CRUD COMPLETE**
8. Add User Story 7 → Test independently → Deploy/Demo (Theme customization)
9. Add User Story 8 → Test independently → Deploy/Demo (Responsive design) ← **PHASE II COMPLETE**
10. Polish Phase → Final validation → **SUBMIT FOR HACKATHON**

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T027)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T028-T039) - Auth foundation
   - **Developer B**: User Story 2 (T040-T050) - View/Filter
   - **Developer C**: User Story 3 (T051-T060) - Create
3. Then continue sequentially or assign:
   - **Developer A**: User Story 4 + 6 (Update + Delete)
   - **Developer B**: User Story 5 (Toggle completion)
   - **Developer C**: User Story 7 + 8 (Theme + Responsive)
4. All developers: Polish Phase together (T105-T119)

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Backend already complete** (Features 002, 003) - focus on frontend only
- **Better Auth secret MUST match backend** - critical for JWT verification
- All API endpoints already exist and tested (36/36 backend tests passing)
- Theme preference is device-specific (localStorage, not synced to backend)
- No real-time sync across tabs (manual refresh required per spec)

---

## Task Count Summary

- **Total Tasks**: 119
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 19 tasks (CRITICAL - blocks all stories)
- **Phase 3 (US1 - Auth)**: 12 tasks ← **MVP**
- **Phase 4 (US2 - View/Filter)**: 11 tasks
- **Phase 5 (US3 - Create)**: 10 tasks
- **Phase 6 (US4 - Update)**: 9 tasks
- **Phase 7 (US5 - Toggle)**: 8 tasks
- **Phase 8 (US6 - Delete)**: 7 tasks ← **ALL 5 BASIC CRUD COMPLETE**
- **Phase 9 (US7 - Theme)**: 9 tasks
- **Phase 10 (US8 - Responsive)**: 11 tasks ← **PHASE II COMPLETE**
- **Phase 11 (Polish)**: 15 tasks

**Parallel Opportunities**: 38 tasks marked [P] can run in parallel
- Setup: 6 parallel tasks
- Foundational: 12 parallel tasks
- User Stories: 11 parallel tasks
- Polish: 9 parallel tasks

**MVP Scope (Phase II Minimum)**: Setup + Foundational + US1-US6 = **84 tasks** (includes all 5 Basic CRUD features)
**Full Phase II**: All 119 tasks (includes theme customization and responsive design)

---

**READY FOR IMPLEMENTATION**: Run `/sp.implement` to begin executing tasks in priority order
