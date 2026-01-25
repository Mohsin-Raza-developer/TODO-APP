/**
 * API client type definitions
 *
 * Types for API requests, responses, and error handling
 * Follows error_handler skill patterns for centralized error handling
 */

/**
 * API error response from backend
 * Matches FastAPI ErrorResponse schema
 */
export interface APIErrorResponse {
  error: string; // Error type: validation_error, unauthorized, forbidden, not_found, internal_server_error
  message: string; // Human-readable error message
  field?: string; // Optional field name for validation errors
}

/**
 * API request configuration
 */
export interface APIRequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  token?: string; // JWT token from Better Auth session
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  data?: T;
  error?: APIErrorResponse;
  status: number;
}

/**
 * Custom API error class
 * Follows error_handler skill pattern for standardized error handling
 */
export class APIError extends Error {
  public readonly status: number;
  public readonly error: string;
  public readonly field?: string;

  constructor(status: number, error: string, message: string, field?: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.error = error;
    this.field = field;

    // Maintain proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Create APIError from fetch Response
   */
  static async fromResponse(response: Response): Promise<APIError> {
    let errorData: APIErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      // If response body is not JSON, create generic error
      errorData = {
        error: "unknown_error",
        message: response.statusText || "An unexpected error occurred",
      };
    }

    return new APIError(
      response.status,
      errorData.error,
      errorData.message,
      errorData.field
    );
  }

  /**
   * Check if error is a specific HTTP status
   */
  isStatus(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is authentication-related (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is permission-related (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is not found (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is validation-related (400)
   */
  isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if error is server-related (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

/**
 * Standard error messages map
 * Follows ux_logic_anchor skill pattern for consistent messaging
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  network_error: "Unable to connect to the server. Please check your internet connection.",
  timeout_error: "Request timed out. Please try again.",

  // Authentication errors (401)
  unauthorized: "Your session has expired. Please sign in again.",
  invalid_token: "Invalid authentication token. Please sign in again.",
  token_expired: "Your session has expired. Please sign in again.",

  // Permission errors (403)
  forbidden: "You don't have permission to access this resource.",

  // Validation errors (400)
  validation_error: "Please check your input and try again.",
  invalid_email: "Please enter a valid email address.",
  password_too_short: "Password must be at least 8 characters.",
  passwords_dont_match: "Passwords do not match.",
  title_required: "Title cannot be empty.",
  title_too_long: "Title exceeds maximum length of 200 characters.",
  description_too_long: "Description exceeds maximum length of 1000 characters.",

  // Resource errors (404)
  not_found: "The requested resource was not found.",
  task_not_found: "Task not found.",
  user_not_found: "User not found.",

  // Server errors (5xx)
  internal_server_error: "An unexpected error occurred. Please try again later.",
  service_unavailable: "Service is temporarily unavailable. Please try again later.",

  // Generic fallback
  unknown_error: "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message from error type
 */
export function getErrorMessage(error: string): string {
  return ERROR_MESSAGES[error] || ERROR_MESSAGES.unknown_error;
}
