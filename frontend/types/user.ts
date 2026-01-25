/**
 * User and authentication type definitions
 *
 * Types for Better Auth user sessions and authentication state
 */

/**
 * User entity from Better Auth
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User session from Better Auth
 * Contains user info and session metadata
 */
export interface UserSession {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Authentication state for React components
 */
export interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Signup form data
 */
export interface SignupFormData {
  email: string;
  password: string;
  passwordConfirmation: string;
  name?: string;
}

/**
 * Auth error response
 */
export interface AuthError {
  error: string;
  message: string;
  field?: string;
}
