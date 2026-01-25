/**
 * Todo Type Definitions
 *
 * Matches backend FastAPI Task model schema
 */

export interface Todo {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  due_date?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  due_date?: string;
}

export type TodoFilter = "all" | "pending" | "completed";

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}
