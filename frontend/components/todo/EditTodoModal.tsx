/**
 * Edit Todo Modal Component
 *
 * Modal dialog for editing existing todo items
 *
 * Features:
 * - Pre-populated form with existing todo data
 * - Title and description validation
 * - Loading state during API call
 * - Error handling with toast notifications
 * - Success feedback
 */

"use client";

import { useState, useEffect } from "react";
import { todoApi } from "@/lib/api/todos";
import { Todo, TodoUpdate } from "@/types/todo";
import { useToast } from "@/hooks/useToast";

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  todo: Todo | null;
  onTodoUpdated: (updatedTodo: Todo) => void;
}

export function EditTodoModal({
  isOpen,
  onClose,
  userId,
  todo,
  onTodoUpdated,
}: EditTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  // Reset form when todo changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [todo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!todo) return;

    if (!title.trim()) {
      showError("Title is required");
      return;
    }

    // Check if anything changed
    if (
      title.trim() === todo.title &&
      (description.trim() || undefined) === todo.description
    ) {
      showError("No changes detected");
      return;
    }

    try {
      setLoading(true);
      const data: TodoUpdate = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      const updatedTodo = await todoApi.updateTodo(userId, todo.id, data);
      success("Todo updated successfully!");
      onTodoUpdated(updatedTodo);
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Todo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter todo title..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description Textarea */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={loading}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
