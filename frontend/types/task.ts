/**
 * Task entity and CRUD operation type definitions
 *
 * Types matching the FastAPI backend task schema
 */

/**
 * Task completion status
 */
export type TaskStatus = "all" | "pending" | "completed";

/**
 * Task entity (matches backend TaskResponse schema)
 */
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  date: string | null; // YYYY-MM-DD format
  completed: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Data Transfer Object for creating a new task
 * Matches backend TaskCreate schema
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  date?: string; // YYYY-MM-DD format
}

/**
 * Data Transfer Object for updating an existing task
 * Matches backend TaskUpdate schema (all fields optional for partial updates)
 */
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  date?: string; // YYYY-MM-DD format
}

/**
 * Task list state for UI components
 */
export interface TaskListState {
  tasks: Task[];
  filter: TaskStatus;
  isLoading: boolean;
  error: string | null;
}

/**
 * Task form state (for create/update forms)
 */
export interface TaskFormData {
  title: string;
  description: string;
  date: string;
}

/**
 * Task form validation errors
 */
export interface TaskFormErrors {
  title?: string;
  description?: string;
  date?: string;
}
