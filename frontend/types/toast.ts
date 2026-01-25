/**
 * Toast notification type definitions
 *
 * Types for toast notification system
 * Follows ux_logic_anchor skill pattern for standardized user feedback
 */

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Toast notification object
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // Auto-dismiss duration in milliseconds (default: 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast context type for React Context
 */
export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}
