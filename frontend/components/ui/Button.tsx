/**
 * Reusable Button Component
 *
 * Variants:
 * - primary: Main action buttons (default)
 * - secondary: Secondary actions
 * - danger: Destructive actions (delete, cancel)
 * - ghost: Minimal styling (close, dismiss)
 *
 * Features:
 * - Supports all native button props
 * - Disabled state styling
 * - Loading state support
 * - Full width option
 *
 * Usage:
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save Task
 * </Button>
 *
 * <Button variant="danger" disabled={isLoading}>
 *   Delete
 * </Button>
 * ```
 */

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  // Base styles (shared across all variants)
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant-specific styles
  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`;

  return (
    <button
      className={combinedStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
