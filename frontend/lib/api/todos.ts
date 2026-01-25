/**
 * Todo API Service
 *
 * Handles all HTTP requests for todo operations via Next.js API routes
 * Next.js API routes act as proxy to FastAPI backend with proper authentication
 */

import { Todo, TodoCreate, TodoUpdate, TodoFilter } from "@/types/todo";

/**
 * Handle API errors with proper error messages
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "unknown_error",
      message: "An unexpected error occurred",
    }));

    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content (delete operations)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API Service for Todo operations
 */
export const todoApi = {
  /**
   * Get all todos for current user
   * @param userId - User ID (not used, but kept for API consistency)
   * @param filter - Filter by status (all/pending/completed)
   */
  async getTodos(userId: string, filter: TodoFilter = "all"): Promise<Todo[]> {
    const response = await fetch(`/api/todos?status=${filter}`, {
      method: "GET",
      credentials: "include",
    });

    return handleResponse<Todo[]>(response);
  },

  /**
   * Get single todo by ID
   * @param userId - User ID (not used, but kept for API consistency)
   * @param todoId - Todo ID
   */
  async getTodo(userId: string, todoId: number): Promise<Todo> {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "GET",
      credentials: "include",
    });

    return handleResponse<Todo>(response);
  },

  /**
   * Create new todo
   * @param userId - User ID (not used, but kept for API consistency)
   * @param data - Todo creation data
   */
  async createTodo(userId: string, data: TodoCreate): Promise<Todo> {
    const response = await fetch(`/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return handleResponse<Todo>(response);
  },

  /**
   * Update existing todo
   * @param userId - User ID (not used, but kept for API consistency)
   * @param todoId - Todo ID
   * @param data - Todo update data (partial updates supported)
   */
  async updateTodo(
    userId: string,
    todoId: number,
    data: TodoUpdate
  ): Promise<Todo> {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return handleResponse<Todo>(response);
  },

  /**
   * Toggle todo completion status
   * @param userId - User ID (not used, but kept for API consistency)
   * @param todoId - Todo ID
   */
  async toggleComplete(userId: string, todoId: number): Promise<Todo> {
    const response = await fetch(`/api/todos/${todoId}/complete`, {
      method: "PATCH",
      credentials: "include",
    });

    return handleResponse<Todo>(response);
  },

  /**
   * Delete todo
   * @param userId - User ID (not used, but kept for API consistency)
   * @param todoId - Todo ID
   */
  async deleteTodo(userId: string, todoId: number): Promise<void> {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "DELETE",
      credentials: "include",
    });

    return handleResponse<void>(response);
  },
};
