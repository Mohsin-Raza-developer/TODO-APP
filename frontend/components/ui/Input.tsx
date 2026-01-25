/**
 * Reusable Input Component
 *
 * Features:
 * - Label support
 * - Error message display
 * - Helper text support
 * - Full width by default
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * />
 * ```
 */

import React, { useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  // Generate stable unique ID using React's useId hook (fixes hydration mismatch)
  const generatedId = useId();
  const inputId = id || generatedId;

  // Base input styles
  const baseStyles =
    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors";

  // Error state styles
  const errorStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-400";

  // Dark mode background
  const darkStyles = "dark:bg-gray-800 dark:text-gray-100";

  // Combine all styles
  const combinedStyles = `${baseStyles} ${errorStyles} ${darkStyles} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}

      <input id={inputId} className={combinedStyles} {...props} />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
