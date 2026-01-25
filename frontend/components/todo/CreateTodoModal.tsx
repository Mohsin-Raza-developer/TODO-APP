/**
 * Create Todo Modal Component
 *
 * Modal form for creating new todos
 *
 * Features:
 * - Title and description inputs
 * - Form validation
 * - Loading state
 * - Error handling
 * - Dark mode support
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { todoApi } from "@/lib/api/todos";
import { Todo, TodoCreate } from "@/types/todo";

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onTodoCreated: (todo: Todo) => void;
}

export function CreateTodoModal({
  isOpen,
  onClose,
  userId,
  onTodoCreated,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      showError("Title is required");
      return;
    }

    try {
      setLoading(true);
      const data: TodoCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      const newTodo = await todoApi.createTodo(userId, data);
      success("Todo created successfully!");
      onTodoCreated(newTodo);

      // Reset form
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setTitle("");
      setDescription("");
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Todo
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title"
            required
            disabled={loading}
            autoFocus
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter todo description"
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
