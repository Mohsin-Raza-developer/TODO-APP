# Frontend Data Model: TypeScript Types

**Feature**: `004-frontend-nextjs-better-auth`
**Date**: 2026-01-16
**Phase**: 1 (Design Artifacts)

## Overview

This document defines the TypeScript type system for the Next.js frontend. Types are organized by domain and mirror the backend API contracts while adding frontend-specific state management types.

---

## Core Entity Types

### User Types (`types/user.ts`)

```typescript
/**
 * Authenticated user session data
 * Returned by Better Auth after successful authentication
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * User session with authentication token
 * Managed by Better Auth, consumed by API client
 */
export interface UserSession {
  user: User;
  accessToken: string;
  expiresAt: string; // ISO 8601 timestamp
}

/**
 * Authentication state for UI rendering
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

---

### Task Types (`types/task.ts`)

```typescript
/**
 * Todo task entity
 * Mirrors backend Task model from FastAPI
 */
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  date: string | null; // YYYY-MM-DD format (date-only, no time)
  completed: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Task creation payload
 * Sent to POST /api/{user_id}/tasks
 */
export interface CreateTaskDTO {
  title: string; // Required, 1-200 characters
  description?: string; // Optional, up to 1000 characters
  date?: string; // Optional, YYYY-MM-DD format
}

/**
 * Task update payload
 * Sent to PUT /api/{user_id}/tasks/{task_id}
 */
export interface UpdateTaskDTO {
  title: string;
  description?: string | null;
  date?: string | null;
}

/**
 * Task filter status
 * Maps to query parameter: ?status=all|pending|completed
 */
export type TaskStatus = 'all' | 'pending' | 'completed';

/**
 * Task list state for UI rendering
 */
export interface TaskListState {
  tasks: Task[];
  filteredTasks: Task[]; // After applying status filter
  filter: TaskStatus;
  isLoading: boolean;
  error: string | null;
}
```

---

## API Contract Types

### Request/Response Types (`types/api.ts`)

```typescript
/**
 * Standard API error response
 * Returned by FastAPI on 4xx/5xx errors
 */
export interface APIErrorResponse {
  error: string; // Error code (e.g., 'unauthorized', 'not_found')
  message: string; // User-friendly error message
}

/**
 * API success response wrapper
 * Generic type for successful responses
 */
export interface APIResponse<T> {
  data: T;
  status: 'success';
}

/**
 * Paginated response (future use, not Phase II)
 * Reserved for Phase III if pagination needed
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * API request configuration
 * Extends fetch RequestInit with custom options
 */
export interface APIRequestConfig extends RequestInit {
  requiresAuth?: boolean; // Defaults to true
  retryOnFailure?: boolean; // Retry on 5xx/network errors
  skipErrorToast?: boolean; // Skip automatic error toast
}
```

---

## UI State Types

### Theme Types (`types/theme.ts`)

```typescript
/**
 * Application theme mode
 * Stored in localStorage, device-specific
 */
export type Theme = 'light' | 'dark';

/**
 * Theme context state
 */
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
```

---

### Toast Notification Types (`types/toast.ts`)

```typescript
/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Toast notification data
 */
export interface Toast {
  id: string; // UUID for tracking
  type: ToastType;
  message: string;
  duration?: number; // Auto-dismiss duration in ms (default: 5000)
}

/**
 * Toast context API
 */
export interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}
```

---

### Form State Types (`types/form.ts`)

```typescript
/**
 * Generic form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form validation state
 */
export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Signup form data
 */
export interface SignupFormData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

/**
 * Task form data (create/edit)
 */
export interface TaskFormData {
  title: string;
  description: string;
  date: string;
}
```

---

## Custom Hook Return Types

### useAuth Hook (`hooks/useAuth.ts`)

```typescript
/**
 * useAuth hook return type
 * Provides authentication state and actions
 */
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

---

### useTasks Hook (`hooks/useTasks.ts`)

```typescript
/**
 * useTasks hook return type
 * Provides task list state and CRUD operations
 */
export interface UseTasksReturn {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskDTO) => Promise<Task>;
  updateTask: (id: number, data: UpdateTaskDTO) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<Task>;
  setFilter: (filter: TaskStatus) => void;

  // Helpers
  getTaskById: (id: number) => Task | undefined;
  getPendingCount: () => number;
  getCompletedCount: () => number;
}
```

---

### useToast Hook (`hooks/useToast.ts`)

```typescript
/**
 * useToast hook return type
 * Provides toast notification API
 */
export interface UseToastReturn {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}
```

---

## Component Prop Types

### Button Component (`components/ui/Button.tsx`)

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

---

### Input Component (`components/ui/Input.tsx`)

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

---

### Task Item Component (`components/tasks/TaskItem.tsx`)

```typescript
export interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}
```

---

### Task Form Component (`components/tasks/TaskForm.tsx`)

```typescript
export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Task;
  onSubmit: (data: CreateTaskDTO | UpdateTaskDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

---

## Utility Types

### Error Types (`lib/error-handler.ts`)

```typescript
/**
 * Custom API error class
 * Extends Error with HTTP status and error code
 */
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

/**
 * Error map for status code → user message
 */
export type ErrorMap = Record<number, { code: string; message: string }>;
```

---

### Validation Types (`lib/validation.ts`)

```typescript
/**
 * Field validation rule
 */
export type ValidationRule<T> = (value: T) => string | null;

/**
 * Form validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]: ValidationRule<T[K]>[];
};

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string | null>;
}
```

---

## Type Guards

### Type Guard Functions (`lib/type-guards.ts`)

```typescript
/**
 * Type guard: Check if value is a Task
 */
export function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'completed' in value
  );
}

/**
 * Type guard: Check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard: Check if response is an API error response
 */
export function isAPIErrorResponse(value: unknown): value is APIErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'message' in value
  );
}
```

---

## Constant Types

### Route Paths (`lib/constants/routes.ts`)

```typescript
/**
 * Application route paths
 * Centralized for type-safe navigation
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
```

---

### API Endpoints (`lib/constants/api.ts`)

```typescript
/**
 * Backend API endpoints
 * Template strings for user-scoped routes
 */
export const API_ENDPOINTS = {
  TASKS: (userId: string) => `/api/${userId}/tasks`,
  TASK: (userId: string, taskId: number) => `/api/${userId}/tasks/${taskId}`,
  TASK_COMPLETE: (userId: string, taskId: number) => `/api/${userId}/tasks/${taskId}/complete`,
} as const;
```

---

## Type Exports

All types are exported from a central index file for easy imports:

```typescript
// types/index.ts
export * from './user';
export * from './task';
export * from './api';
export * from './theme';
export * from './toast';
export * from './form';
```

**Usage Example**:
```typescript
import { Task, CreateTaskDTO, UseTasksReturn } from '@/types';
```

---

## Backend API Alignment

These frontend types align with the existing FastAPI backend schema:

| Frontend Type | Backend Model | Notes |
|---------------|---------------|-------|
| `Task` | `Task` (SQLModel) | Exact match, all fields present |
| `User` | `User` (Better Auth) | Better Auth manages user table |
| `CreateTaskDTO` | Request body for POST /api/{user_id}/tasks | Matches Pydantic schema |
| `UpdateTaskDTO` | Request body for PUT /api/{user_id}/tasks/{id} | Matches Pydantic schema |
| `APIErrorResponse` | FastAPI exception handlers | Standardized error format |

---

## Validation Rules

### Task Validation

```typescript
// Title: Required, 1-200 characters
const validateTitle = (title: string): string | null => {
  if (!title || !title.trim()) {
    return 'Title cannot be empty.';
  }
  if (title.length > 200) {
    return 'Title exceeds maximum length of 200 characters.';
  }
  return null;
};

// Description: Optional, up to 1000 characters
const validateDescription = (description: string): string | null => {
  if (description && description.length > 1000) {
    return 'Description exceeds maximum length of 1000 characters.';
  }
  return null;
};

// Date: Optional, YYYY-MM-DD format
const validateDate = (date: string): string | null => {
  if (!date) return null; // Optional field
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return 'Date must be in YYYY-MM-DD format.';
  }
  return null;
};
```

### Auth Validation

```typescript
// Email: Required, valid format
const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email cannot be empty.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format.';
  }
  return null;
};

// Password: Required, minimum 8 characters (no complexity requirements per spec)
const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password cannot be empty.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
};

// Password Confirmation: Must match password
const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (password !== confirmation) {
    return 'Passwords do not match.';
  }
  return null;
};
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Next**: Create API contracts and quickstart guide
