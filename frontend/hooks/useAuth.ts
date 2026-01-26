/**
 * useAuth Hook
 *
 * Provides authentication state and actions for React components
 *
 * Features:
 * - Sign in with email/password
 * - Sign up with email/password
 * - Sign out
 * - Session state (user, isAuthenticated, isLoading)
 * - Remember me functionality
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();
 *
 * await signIn({ email: "user@example.com", password: "password123" });
 * ```
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { LoginFormData, SignupFormData } from "@/types/user";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  // Get session from Better Auth
  const { data: session, isPending, error } = authClient.useSession();

  const user = session?.user || null;
  const isAuthenticated = !!session?.user;
  const isLoading = isPending;

  /**
   * Sign in with email and password
   *
   * @param data - Login form data (email, password, rememberMe)
   * @throws Error if sign in fails
   */
  const signIn = async (data: LoginFormData): Promise<void> => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to sign in");
      }

      success("Signed in successfully!");
      // Force full reload to ensure cookies are sent to server middleware
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Sign in error details:", err);
      const message = err instanceof Error ? err.message : "Failed to sign in";
      showError(message);
      throw err;
    }
  };

  /**
   * Sign up with email and password
   *
   * @param data - Signup form data (email, password, passwordConfirmation, name)
   * @throws Error if sign up fails
   */
  const signUp = async (data: SignupFormData): Promise<void> => {
    try {
      // Validate password confirmation
      if (data.password !== data.passwordConfirmation) {
        throw new Error("Passwords do not match");
      }

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name || "",
      });

      if (result.error) {
        console.error("Better Auth signup error:", result.error);
        throw new Error(result.error.message || "Failed to create account");
      }

      success("Account created successfully!");
      // Force full reload to ensure cookies are sent to server middleware
      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      showError(message);
      throw err;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await authClient.signOut();
      success("Signed out successfully");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      showError(message);
      throw err;
    }
  };

  /**
   * Refresh session
   * Useful for checking if session is still valid
   */
  const refreshSession = async (): Promise<void> => {
    try {
      await authClient.getSession();
    } catch (err) {
      console.error("Failed to refresh session:", err);
    }
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
