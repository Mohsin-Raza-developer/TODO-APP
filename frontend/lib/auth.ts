/**
 * Better Auth server configuration
 *
 * Server-side authentication setup with JWT tokens and PostgreSQL storage
 *
 * Features:
 * - Email/password authentication
 * - JWT token generation (signed with BETTER_AUTH_SECRET)
 * - Session management with HTTP-only cookies
 * - Neon PostgreSQL database integration
 *
 * CRITICAL: BETTER_AUTH_SECRET must match backend/.env secret for JWT verification
 */

import { betterAuth } from "better-auth";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

const EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 5; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_DAILY_LIMIT = 6; // 1 signup email + 5 resend attempts/day
const resendTracker = new Map<string, { day: string; count: number; lastSentAt: number }>();
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3001";

function getUtcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function enforceResendPolicy(email: string): void {
  const now = Date.now();
  const day = getUtcDayKey();
  const existing = resendTracker.get(email);
  const state =
    !existing || existing.day !== day
      ? { day, count: 0, lastSentAt: 0 }
      : existing;

  const cooldownRemainingMs = state.lastSentAt + RESEND_COOLDOWN_SECONDS * 1000 - now;
  if (cooldownRemainingMs > 0) {
    const seconds = Math.ceil(cooldownRemainingMs / 1000);
    throw new Error(`RESEND_COOLDOWN_ACTIVE:${seconds}`);
  }

  if (state.count >= RESEND_DAILY_LIMIT) {
    throw new Error("RESEND_DAILY_LIMIT_REACHED");
  }

  resendTracker.set(email, {
    day,
    count: state.count + 1,
    lastSentAt: now,
  });
}

// Create PostgreSQL connection for Neon using postgres-js
// Increased timeouts to handle Neon's cold start (database wakes from sleep)
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10, // Connection pool size
  ssl: "require", // Neon requires SSL
  idle_timeout: 60, // Increased idle timeout
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
  connect_timeout: 120, // 120 seconds connection timeout (for cold starts)
  keep_alive: 30, // Keep Alive every 30 seconds
});


// Create Kysely instance
const db = new Kysely({
  dialect: new PostgresJSDialect({
    postgres: sql,
  }),
});

export const auth = betterAuth({
  // Secret for JWT signing (MUST match backend BETTER_AUTH_SECRET)
  // This ensures JWT tokens generated here can be verified by FastAPI backend
  secret: process.env.BETTER_AUTH_SECRET!,

  // Database connection (Neon PostgreSQL via Kysely)
  // Uses Kysely query builder for type-safe database operations
  database: {
    db: db as any, // Kysely instance
    type: "postgres",
  },

  // Email verification setup
  // Production mail provider integration can replace this callback.
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    async sendVerificationEmail({ user, url }) {
      enforceResendPolicy(user.email.toLowerCase());
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set("callbackURL", `${APP_BASE_URL}/verify-email`);
      const finalVerificationUrl = verificationUrl.toString();

      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.AUTH_FROM_EMAIL;

      // Fallback for local development when no mail provider is configured.
      if (!resendApiKey || !fromEmail) {
        console.info(`[AUTH][DEV] Verification link for ${user.email}: ${finalVerificationUrl}`);
        return;
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: user.email,
          subject: "Verify your email address - Check Mate",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <h2 style="margin:0 0 12px 0;font-size:22px;color:#111827">Verify your email address</h2>
              <p style="margin:0 0 12px 0">Welcome to Check Mate.</p>
              <p style="margin:0 0 20px 0">Please confirm your email address to activate your account and continue to your dashboard.</p>
              <p style="margin:0 0 20px 0">
                <a href="${finalVerificationUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">
                  Verify Email
                </a>
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px">If you did not create this account, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to send verification email:", errorBody);
        throw new Error("Failed to send verification email");
      }
    },
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    // Unverified users can sign in to access the verification-pending state.
    requireEmailVerification: false,
  },

  // Session management
  session: {
    // Keep a short cache window so route handlers can read session_data cookie
    // while minimizing stale emailVerified state after verification.
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days (default session)
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
  },
});
