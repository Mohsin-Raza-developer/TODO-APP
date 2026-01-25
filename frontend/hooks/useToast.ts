/**
 * useToast Hook
 *
 * Simple toast notification hook for success/error messages
 *
 * Usage:
 * ```tsx
 * const { success, error } = useToast();
 * success("Todo created!");
 * error("Failed to delete todo");
 * ```
 */

"use client";

export function useToast() {
  function success(message: string) {
    // For now, use browser alert
    // TODO: Implement proper toast notifications in future
    alert(`✓ ${message}`);
  }

  function error(message: string) {
    // For now, use browser alert
    // TODO: Implement proper toast notifications in future
    alert(`✗ ${message}`);
  }

  return {
    success,
    error,
  };
}
