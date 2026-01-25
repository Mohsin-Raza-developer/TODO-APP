/**
 * Toast Context Provider
 *
 * Manages toast notification state with auto-dismiss functionality
 * Follows ux_logic_anchor skill pattern for standardized user feedback
 *
 * Features:
 * - Multiple toast types (success, error, info, warning)
 * - Auto-dismiss after configurable duration
 * - Manual dismiss support
 * - Optional action buttons
 * - Helper methods for common toast types
 *
 * Usage:
 * ```tsx
 * // In app/layout.tsx
 * <ToastProvider>
 *   <YourApp />
 * </ToastProvider>
 *
 * // In any component
 * const { success, error, info, warning } = useToast();
 *
 * success("Task created successfully!");
 * error("Failed to save task. Please try again.");
 * ```
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastType, ToastContextType } from "@/types/toast";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 *
 * Wraps app with toast notification functionality
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Generate unique toast ID
   */
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Show toast notification
   *
   * @param toast - Toast configuration (omit id, will be generated)
   */
  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  /**
   * Remove toast by ID
   *
   * @param id - Toast ID to remove
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show success toast
   *
   * Follows ux_logic_anchor pattern: "SUCCESS: {action_name} completed."
   *
   * @param message - Success message
   * @param duration - Auto-dismiss duration in ms (default: 5000)
   */
  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "success", message, duration });
    },
    [showToast]
  );

  /**
   * Show error toast
   *
   * Follows ux_logic_anchor pattern: "ERROR: {error_detail}."
   *
   * @param message - Error message
   * @param duration - Auto-dismiss duration in ms (default: 7000 for errors)
   */
  const error = useCallback(
    (message: string, duration = 7000) => {
      showToast({ type: "error", message, duration });
    },
    [showToast]
  );

  /**
   * Show info toast
   *
   * @param message - Info message
   * @param duration - Auto-dismiss duration in ms (default: 5000)
   */
  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "info", message, duration });
    },
    [showToast]
  );

  /**
   * Show warning toast
   *
   * @param message - Warning message
   * @param duration - Auto-dismiss duration in ms (default: 6000)
   */
  const warning = useCallback(
    (message: string, duration = 6000) => {
      showToast({ type: "warning", message, duration });
    },
    [showToast]
  );

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

/**
 * useToast hook
 *
 * Access toast functionality from any component
 *
 * @returns Toast context value
 * @throws Error if used outside ToastProvider
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
