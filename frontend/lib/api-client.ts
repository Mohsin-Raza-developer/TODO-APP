/**
 * API Client for FastAPI backend communication
 *
 * Features:
 * - Automatic JWT token inclusion from Better Auth session
 * - Centralized error handling (follows error_handler skill pattern)
 * - Retry logic for network/server errors
 * - Type-safe requests and responses
 *
 * Architecture:
 * - Extracts JWT from Better Auth session cookie
 * - Includes token in Authorization header: Bearer {token}
 * - Backend verifies JWT and extracts user_id
 * - Backend filters all queries by user_id (data isolation)
 */

import { authClient } from "@/lib/auth-client";
import { APIError, APIErrorResponse } from "@/types/api";
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from "@/types/task";
import { withRetry, handleAPIError, logError } from "@/lib/error-handler";

/**
 * Backend API base URL (FastAPI server)
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API request configuration
 */
interface RequestConfig extends RequestInit {
  requiresAuth?: boolean; // Whether to include Authorization header (default: true)
  retryOnFailure?: boolean; // Retry on network/server errors (default: true)
}

/**
 * Make authenticated API request to FastAPI backend
 *
 * @param endpoint - API endpoint (e.g., "/api/user_123/tasks")
 * @param config - Request configuration
 * @returns Promise with parsed response data
 * @throws APIError on HTTP errors (401, 403, 404, 5xx)
 */
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const {
    requiresAuth = true,
    retryOnFailure = true,
    ...fetchConfig
  } = config;

  const makeRequest = async (): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((fetchConfig.headers as Record<string, string>) || {}),
    };

    // Add Authorization header if required
    if (requiresAuth) {
      const session = await authClient.getSession();

      if (!session?.data) {
        // No session - redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new APIError(401, "unauthorized", "No active session");
      }

      // Extract JWT token from Better Auth session
      // Better Auth stores the session with user and token data
      const accessToken = session.data.session?.token;

      if (!accessToken) {
        throw new APIError(401, "unauthorized", "No access token in session");
      }

      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Make fetch request
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...fetchConfig,
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      const apiError = await APIError.fromResponse(response);

      // Handle 401 - session expired, redirect to login
      if (apiError.isUnauthorized()) {
        await authClient.signOut();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      logError(apiError, { endpoint, method: fetchConfig.method });
      throw apiError;
    }

    // Handle 204 No Content (DELETE responses)
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return response.json();
  };

  // Execute with retry if enabled
  if (retryOnFailure) {
    return withRetry(makeRequest);
  }

  return makeRequest();
}

/**
 * API client with typed task endpoints
 */
export const apiClient = {
  /**
   * List all tasks for authenticated user
   *
   * @param userId - User ID from Better Auth session
   * @param filter - Filter by status (all, pending, completed)
   * @returns Array of tasks
   */
  async listTasks(userId: string, filter: TaskStatus = "all"): Promise<Task[]> {
    const params = filter !== "all" ? `?status=${filter}` : "";
    return request<Task[]>(`/api/${userId}/tasks${params}`);
  },

  /**
   * Get single task by ID
   *
   * @param userId - User ID from Better Auth session
   * @param taskId - Task ID
   * @returns Task object
   * @throws APIError with 404 if task not found or belongs to another user
   */
  async getTask(userId: string, taskId: number): Promise<Task> {
    return request<Task>(`/api/${userId}/tasks/${taskId}`);
  },

  /**
   * Create new task
   *
   * @param userId - User ID from Better Auth session
   * @param data - Task creation data (title, description, date)
   * @returns Created task
   * @throws APIError with 400 if validation fails
   */
  async createTask(userId: string, data: CreateTaskDTO): Promise<Task> {
    return request<Task>(`/api/${userId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing task
   *
   * @param userId - User ID from Better Auth session
   * @param taskId - Task ID
   * @param data - Task update data (partial updates supported)
   * @returns Updated task
   * @throws APIError with 404 if task not found
   * @throws APIError with 400 if validation fails
   */
  async updateTask(
    userId: string,
    taskId: number,
    data: UpdateTaskDTO
  ): Promise<Task> {
    return request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle task completion status
   *
   * @param userId - User ID from Better Auth session
   * @param taskId - Task ID
   * @returns Updated task with toggled completion status
   * @throws APIError with 404 if task not found
   */
  async toggleTask(userId: string, taskId: number): Promise<Task> {
    return request<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
      method: "PATCH",
    });
  },

  /**
   * Delete task
   *
   * @param userId - User ID from Better Auth session
   * @param taskId - Task ID
   * @throws APIError with 404 if task not found
   */
  async deleteTask(userId: string, taskId: number): Promise<void> {
    return request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};
