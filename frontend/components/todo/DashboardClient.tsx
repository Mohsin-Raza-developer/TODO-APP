/**
 * Dashboard Client Component
 *
 * Client-side todo list with CRUD operations
 *
 * Features:
 * - Fetch and display todos from FastAPI backend
 * - Filter by status (all/pending/completed)
 * - Create, update, delete todos
 * - Toggle completion status
 * - Real-time stats calculation
 */

"use client";

import { useEffect, useState } from "react";
import { todoApi } from "@/lib/api/todos";
import { Todo, TodoFilter, TodoStats } from "@/types/todo";
import { useToast } from "@/hooks/useToast";
import { CreateTodoModal } from "./CreateTodoModal";
import { EditTodoModal } from "./EditTodoModal";

interface DashboardClientProps {
  userId: string;
  userName: string;
}

export function DashboardClient({ userId, userName }: DashboardClientProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const { error: showError } = useToast();

  // Calculate stats from todos
  useEffect(() => {
    setStats({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
    });
  }, [todos]);

  // Fetch todos on mount and when filter changes
  useEffect(() => {
    fetchTodos();
  }, [filter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open create modal
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
      // Escape to close modals
      if (e.key === "Escape") {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const data = await todoApi.getTodos(userId, filter);
      setTodos(data);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleComplete(todoId: number) {
    try {
      const updated = await todoApi.toggleComplete(userId, todoId);
      setTodos(
        todos.map((t) => (t.id === todoId ? updated : t))
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update todo");
    }
  }

  async function handleDelete(todoId: number) {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      await todoApi.deleteTodo(userId, todoId);
      setTodos(todos.filter((t) => t.id !== todoId));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  }

  function handleTodoCreated(newTodo: Todo) {
    setTodos([newTodo, ...todos]);
  }

  function handleEditClick(todo: Todo) {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  }

  function handleTodoUpdated(updatedTodo: Todo) {
    setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
  }

  // Filter todos based on search query
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      searchQuery === "" ||
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate completion percentage
  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what you need to focus on today
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 group"
          title="Press Ctrl+K to create"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Todo</span>
          <span className="hidden md:inline-flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <kbd className="px-1.5 py-0.5 bg-blue-700 rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-blue-700 rounded text-xs">K</kbd>
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Tasks
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.completed}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter("all")}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === "all"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === "pending"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === "completed"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No matching todos" : "No todos yet"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `No todos match "${searchQuery}"`
                : filter === "all"
                ? "Create your first todo to get started"
                : `No ${filter} todos found`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] animate-fadeIn"
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(todo.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {todo.completed ? (
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg font-medium mb-1 ${
                      todo.completed
                        ? "line-through text-gray-500 dark:text-gray-600"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {todo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span>
                      Created {new Date(todo.created_at).toLocaleDateString()}
                    </span>
                    {todo.updated_at !== todo.created_at && (
                      <span>
                        Updated {new Date(todo.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(todo)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit todo"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete todo"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Todo Modal */}
      <CreateTodoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={userId}
        onTodoCreated={handleTodoCreated}
      />

      {/* Edit Todo Modal */}
      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTodo(null);
        }}
        userId={userId}
        todo={editingTodo}
        onTodoUpdated={handleTodoUpdated}
      />
    </div>
  );
}
