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
import {
  getResendOutcomeMessage,
  mapResendErrorToOutcome,
  type ResendOutcome,
} from "@/lib/error-handler";

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_DAILY_LIMIT = 5;
const RESEND_STORAGE_PREFIX = "verify_resend";

interface ResendTrackerState {
  date: string;
  count: number;
  lastSentAt: number;
}

interface ResendStatus {
  cooldownRemaining: number;
  remainingToday: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getResendStorageKey(email: string): string {
  return `${RESEND_STORAGE_PREFIX}:${email.toLowerCase()}`;
}

function readResendTracker(email: string): ResendTrackerState {
  if (typeof window === "undefined") {
    return { date: getTodayKey(), count: 0, lastSentAt: 0 };
  }

  const key = getResendStorageKey(email);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return { date: getTodayKey(), count: 0, lastSentAt: 0 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ResendTrackerState>;
    const today = getTodayKey();
    if (parsed.date !== today) {
      return { date: today, count: 0, lastSentAt: 0 };
    }
    return {
      date: today,
      count: Number(parsed.count ?? 0),
      lastSentAt: Number(parsed.lastSentAt ?? 0),
    };
  } catch {
    return { date: getTodayKey(), count: 0, lastSentAt: 0 };
  }
}

function writeResendTracker(email: string, state: ResendTrackerState): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getResendStorageKey(email);
  window.localStorage.setItem(key, JSON.stringify(state));
}

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

      const resultError = (result as { error?: unknown }).error;
      if (resultError) {
        const message =
          (typeof resultError === "string" && resultError) ||
          (typeof resultError === "object" &&
            resultError !== null &&
            "message" in resultError &&
            String((resultError as { message?: string }).message)) ||
          "Invalid email or password. Please try again.";
        throw new Error(message);
      }

      const latestSession = await authClient.getSession();
      const emailVerified = Boolean(latestSession.data?.user?.emailVerified);

      success("Signed in successfully!");
      // Force full reload to ensure cookies are sent to server middleware
      window.location.href = emailVerified ? "/dashboard" : "/verify-email";
    } catch (err) {
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

      success("Account created. Please verify your email.");
      // Force full reload to ensure cookies are sent to server middleware
      window.location.href = "/verify-email";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      showError(message);
      throw err;
    }
  };

  const getResendStatus = (email: string): ResendStatus => {
    const tracker = readResendTracker(email);
    const now = Date.now();
    const cooldownEnd = tracker.lastSentAt + RESEND_COOLDOWN_SECONDS * 1000;
    const cooldownRemaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
    const remainingToday = Math.max(0, RESEND_DAILY_LIMIT - tracker.count);
    return {
      cooldownRemaining,
      remainingToday,
    };
  };

  const resendVerificationEmail = async (
    email: string
  ): Promise<{ ok: boolean; outcome: ResendOutcome; message: string }> => {
    const status = getResendStatus(email);
    if (status.cooldownRemaining > 0) {
      const message = getResendOutcomeMessage("cooldown", {
        seconds: status.cooldownRemaining,
      });
      showError(message);
      return { ok: false, outcome: "cooldown", message };
    }

    if (status.remainingToday <= 0) {
      const message = getResendOutcomeMessage("daily_limit");
      showError(message);
      return { ok: false, outcome: "daily_limit", message };
    }

    try {
      const latestSession = await authClient.getSession();
      if (latestSession.data?.user?.emailVerified) {
        const message = getResendOutcomeMessage("already_verified");
        success(message);
        return { ok: false, outcome: "already_verified", message };
      }

      const result = await (authClient as any).sendVerificationEmail?.({
        email,
        callbackURL: `${window.location.origin}/verify-email`,
      });

      const resultError = (result as { error?: { message?: string } } | undefined)?.error;
      if (resultError) {
        throw new Error(resultError.message || "Failed to resend verification email");
      }

      const now = Date.now();
      const tracker = readResendTracker(email);
      writeResendTracker(email, {
        date: getTodayKey(),
        count: tracker.count + 1,
        lastSentAt: now,
      });

      const message = getResendOutcomeMessage("sent", {
        remaining: Math.max(0, RESEND_DAILY_LIMIT - (tracker.count + 1)),
      });
      success(message);
      return { ok: true, outcome: "sent", message };
    } catch (err) {
      const outcome = mapResendErrorToOutcome(err);
      const cooldownMatch =
        err instanceof Error ? err.message.match(/resend_cooldown_active:(\d+)/i) : null;
      const cooldownSeconds = cooldownMatch ? Number(cooldownMatch[1]) : RESEND_COOLDOWN_SECONDS;
      const message =
        outcome === "cooldown"
          ? getResendOutcomeMessage("cooldown", { seconds: cooldownSeconds })
          : getResendOutcomeMessage(outcome);
      showError(message);
      return { ok: false, outcome, message };
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
    resendVerificationEmail,
    getResendStatus,
    signOut,
    refreshSession,
  };
}
