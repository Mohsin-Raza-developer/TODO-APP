/**
 * Toast Notification Component
 *
 * Displays toast notifications with auto-dismiss functionality
 * Follows ux_logic_anchor skill pattern for standardized user feedback
 *
 * Features:
 * - 4 types: success, error, info, warning
 * - Auto-dismiss (configurable duration)
 * - Manual dismiss button
 * - Optional action button
 * - Stacked positioning (bottom-right by default)
 *
 * Usage:
 * Automatically rendered by ToastProvider based on toast state
 * No need to import directly - use useToast() hook instead
 *
 * ```tsx
 * const { success, error } = useToast();
 * success("Task created successfully!");
 * error("Failed to delete task.");
 * ```
 */

"use client";

import React from "react";
import { Toast as ToastType } from "@/types/toast";

export interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, type, message, action } = toast;

  // Type-specific styles
  const typeStyles = {
    success:
      "bg-green-50 border-green-500 text-green-900 dark:bg-green-900 dark:border-green-600 dark:text-green-100",
    error:
      "bg-red-50 border-red-500 text-red-900 dark:bg-red-900 dark:border-red-600 dark:text-red-100",
    info: "bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100",
    warning:
      "bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100",
  };

  // Type-specific icons
  const icons = {
    success: (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
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
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg max-w-md ${typeStyles[type]} animate-slide-in`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>

        {/* Action button (optional) */}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Dismiss notification"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Container
 *
 * Renders all active toasts in a fixed position (bottom-right)
 */
export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
