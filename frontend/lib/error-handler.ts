/**
 * Centralized error handling for API requests
 *
 * Follows error_handler skill pattern for graceful error recovery with
 * standardized user feedback
 *
 * Key Features:
 * - APIError class for structured error handling
 * - User-friendly error messages (ux_logic_anchor pattern)
 * - Retry logic for network/server errors
 * - Toast notification integration
 */

import { APIError, getErrorMessage, APIErrorResponse } from "@/types/api";

/**
 * Handle API errors and return user-friendly message
 *
 * Follows error_handler skill pattern:
 * - Catches specific error types (ValueError equivalent in TS: APIError)
 * - Displays standardized error messages
 * - No re-throwing (graceful degradation)
 *
 * @param error - Error caught from API call
 * @returns User-friendly error message
 */
export function handleAPIError(error: unknown): string {
  // Handle APIError (structured error from API client)
  if (error instanceof APIError) {
    // Return user-friendly message from ERROR_MESSAGES map
    return getErrorMessage(error.error);
  }

  // Handle network errors (fetch failures)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return getErrorMessage("network_error");
  }

  // Handle timeout errors
  if (error instanceof Error && error.name === "AbortError") {
    return getErrorMessage("timeout_error");
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return getErrorMessage("unknown_error");
}

/**
 * Retry configuration for API requests
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  retryableStatuses: number[]; // HTTP status codes to retry
}

/**
 * Default retry configuration
 * Retry on network errors and server errors (5xx)
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [500, 502, 503, 504], // Server errors only
};

/**
 * Execute API request with retry logic
 *
 * @param fn - Async function to execute (API call)
 * @param config - Retry configuration
 * @returns Promise with result or throws final error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication/validation errors (client errors)
      if (error instanceof APIError) {
        if (error.status >= 400 && error.status < 500) {
          throw error; // Client errors are not retryable
        }

        // Check if status is retryable
        if (!config.retryableStatuses.includes(error.status)) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Wait before retry (exponential backoff)
      const delay = config.retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed, throw last error
  throw lastError;
}

/**
 * Check if error should show retry button
 *
 * @param error - Error to check
 * @returns true if error is retryable (network/server errors)
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // Timeout errors are retryable
  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error instanceof APIError && error.isServerError()) {
    return true;
  }

  // Client errors (4xx) are not retryable
  return false;
}

/**
 * Log error for debugging (development only)
 *
 * @param error - Error to log
 * @param context - Additional context (e.g., endpoint, user action)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  // Only log in development mode
  if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
    console.error("[API Error]", {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
