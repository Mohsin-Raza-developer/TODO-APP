/**
 * API Client Type Contracts
 *
 * Feature: 004-frontend-nextjs-better-auth
 * Date: 2026-01-16
 * Phase: 1 (Design Artifacts)
 *
 * This file defines TypeScript types for the API client that communicates
 * with the FastAPI backend. All types align with backend/API_TESTING_GUIDE.md.
 */

// =============================================================================
// Base Configuration
// =============================================================================

/**
 * API client configuration
 * Used to initialize the API client with base URL and default options
 */
export interface APIClientConfig {
  baseURL: string; // Default: http://localhost:8000 (development)
  timeout?: number; // Request timeout in milliseconds (default: 10000)
  retryAttempts?: number; // Number of retry attempts for 5xx/network errors (default: 2)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
}

/**
 * API request options
 * Extends native fetch RequestInit with custom options
 */
export interface APIRequestOptions extends RequestInit {
  requiresAuth?: boolean; // Whether to include Authorization header (default: true)
  skipErrorToast?: boolean; // Skip automatic error toast notification (default: false)
  retryOnFailure?: boolean; // Retry request on 5xx/network errors (default: true)
}

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * Better Auth session data
 * Returned by Better Auth after successful authentication
 */
export interface AuthSession {
  user: {
    id: string; // User ID (UUID from Better Auth)
    email: string;
    name?: string;
  };
  accessToken: string; // JWT token for backend authorization
  expiresAt: string; // ISO 8601 timestamp
}

/**
 * Login request payload
 * Sent to Better Auth signin endpoint
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean; // Extend session duration if true
}

/**
 * Signup request payload
 * Sent to Better Auth signup endpoint
 */
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

// =============================================================================
// Task CRUD Types
// =============================================================================

/**
 * Task entity (matches backend Task model)
 * Returned by all task endpoints
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
 * Create task request payload
 * POST /api/{user_id}/tasks
 */
export interface CreateTaskRequest {
  title: string; // Required, 1-200 characters
  description?: string; // Optional, up to 1000 characters
  date?: string; // Optional, YYYY-MM-DD format
}

/**
 * Update task request payload
 * PUT /api/{user_id}/tasks/{task_id}
 */
export interface UpdateTaskRequest {
  title: string; // Required, 1-200 characters
  description?: string | null; // Optional, nullable
  date?: string | null; // Optional, nullable, YYYY-MM-DD format
}

/**
 * Task filter query parameters
 * GET /api/{user_id}/tasks?status={status}
 */
export type TaskFilterStatus = 'all' | 'pending' | 'completed';

export interface TaskFilterParams {
  status?: TaskFilterStatus; // Default: 'all'
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Standard error response from backend
 * Returned on 4xx/5xx errors
 */
export interface APIErrorResponse {
  error: string; // Error code (e.g., 'unauthorized', 'not_found', 'forbidden')
  message: string; // User-friendly error message
}

/**
 * Generic success response wrapper
 * Used when backend returns wrapped responses
 */
export interface APISuccessResponse<T> {
  data: T;
  status: 'success';
}

/**
 * Task list response
 * GET /api/{user_id}/tasks
 */
export type TaskListResponse = Task[];

/**
 * Single task response
 * GET /api/{user_id}/tasks/{task_id}
 * POST /api/{user_id}/tasks
 * PUT /api/{user_id}/tasks/{task_id}
 */
export type TaskResponse = Task;

/**
 * Delete task response
 * DELETE /api/{user_id}/tasks/{task_id}
 */
export interface DeleteTaskResponse {
  message: string; // "Task deleted successfully"
}

/**
 * Toggle completion response
 * PATCH /api/{user_id}/tasks/{task_id}/complete
 */
export type ToggleCompletionResponse = Task; // Returns updated task

// =============================================================================
// HTTP Error Status Codes
// =============================================================================

/**
 * Expected HTTP error status codes from backend
 * Maps to specific error handling logic in the frontend
 */
export enum APIErrorStatus {
  UNAUTHORIZED = 401, // No token or invalid token
  FORBIDDEN = 403, // User ID mismatch (trying to access another user's data)
  NOT_FOUND = 404, // Resource (task) not found
  VALIDATION_ERROR = 422, // Request body validation failure
  SERVER_ERROR = 500, // Internal server error
  SERVICE_UNAVAILABLE = 503, // Service temporarily unavailable
}

/**
 * Error code to user message mapping
 * Used by centralized error handler to display user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  unauthorized: 'Session expired. Please sign in again.',
  forbidden: 'You do not have permission to access this resource.',

  // Resource errors
  not_found: 'The requested resource was not found.',

  // Validation errors
  validation_error: 'Invalid input. Please check your data and try again.',

  // Server errors
  server_error: 'Server error. Please try again later.',
  service_unavailable: 'Service temporarily unavailable. Please try again later.',

  // Network errors
  network_error: 'Network error. Please check your connection and try again.',
  timeout_error: 'Request timed out. Please try again.',

  // Generic fallback
  unknown_error: 'An unexpected error occurred. Please try again.',
};

// =============================================================================
// API Client Interface
// =============================================================================

/**
 * API client interface
 * Defines the contract for the API client implementation
 */
export interface APIClient {
  // Configuration
  config: APIClientConfig;

  // HTTP methods
  get<T>(url: string, options?: APIRequestOptions): Promise<T>;
  post<T>(url: string, data?: unknown, options?: APIRequestOptions): Promise<T>;
  put<T>(url: string, data?: unknown, options?: APIRequestOptions): Promise<T>;
  patch<T>(url: string, data?: unknown, options?: APIRequestOptions): Promise<T>;
  delete<T>(url: string, options?: APIRequestOptions): Promise<T>;

  // Authentication
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  getAuthToken(): string | null;

  // Task endpoints
  tasks: {
    list(userId: string, params?: TaskFilterParams): Promise<TaskListResponse>;
    get(userId: string, taskId: number): Promise<TaskResponse>;
    create(userId: string, data: CreateTaskRequest): Promise<TaskResponse>;
    update(userId: string, taskId: number, data: UpdateTaskRequest): Promise<TaskResponse>;
    delete(userId: string, taskId: number): Promise<DeleteTaskResponse>;
    toggleCompletion(userId: string, taskId: number): Promise<ToggleCompletionResponse>;
  };
}

// =============================================================================
// Endpoint Templates
// =============================================================================

/**
 * API endpoint URL templates
 * Used to construct full URLs for API requests
 */
export const API_ENDPOINTS = {
  // Authentication (Better Auth)
  AUTH_SIGNIN: '/api/auth/signin',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_SIGNOUT: '/api/auth/signout',
  AUTH_SESSION: '/api/auth/session',

  // Tasks (FastAPI backend)
  TASKS: (userId: string) => `/api/${userId}/tasks`,
  TASK: (userId: string, taskId: number) => `/api/${userId}/tasks/${taskId}`,
  TASK_COMPLETE: (userId: string, taskId: number) => `/api/${userId}/tasks/${taskId}/complete`,
} as const;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard: Check if response is an API error
 */
export function isAPIErrorResponse(value: unknown): value is APIErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'message' in value
  );
}

/**
 * Type guard: Check if value is a Task
 */
export function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'user_id' in value &&
    'title' in value &&
    'completed' in value
  );
}

/**
 * Type guard: Check if value is a TaskListResponse
 */
export function isTaskList(value: unknown): value is TaskListResponse {
  return Array.isArray(value) && (value.length === 0 || isTask(value[0]));
}

// =============================================================================
// Notes
// =============================================================================

/**
 * Backend API Alignment:
 * - All types mirror backend/API_TESTING_GUIDE.md contracts
 * - Field names use snake_case (backend convention)
 * - Date fields use ISO 8601 strings (backend format)
 * - Error response format matches FastAPI exception handlers
 *
 * Authentication Flow:
 * 1. User signs in via Better Auth → receives AuthSession with accessToken
 * 2. API client extracts accessToken from session
 * 3. API client includes `Authorization: Bearer {accessToken}` header
 * 4. Backend verifies JWT and extracts userId from token payload
 * 5. Backend returns data filtered by userId
 *
 * Error Handling:
 * - 401 Unauthorized → Redirect to login, clear session
 * - 403 Forbidden → Show error toast, log security event
 * - 404 Not Found → Show error toast "Resource not found"
 * - 422 Validation Error → Display field-level errors
 * - 500/503 Server Errors → Show error toast with retry button
 *
 * See Also:
 * - backend/API_TESTING_GUIDE.md (backend API contracts)
 * - specs/004-frontend-nextjs-better-auth/data-model.md (UI state types)
 * - specs/004-frontend-nextjs-better-auth/contracts/backend-api.md (API reference)
 */
