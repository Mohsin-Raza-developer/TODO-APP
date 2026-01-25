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

// Create PostgreSQL connection for Neon using postgres-js
// Increased timeouts to handle Neon's cold start (database wakes from sleep)
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10, // Connection pool size
  ssl: "require", // Neon requires SSL
  idle_timeout: 20, // 20 seconds idle timeout
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
  connect_timeout: 60, // 60 seconds connection timeout (for cold starts)
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

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase II - verification out of scope per spec
  },

  // Session management
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days (default session)
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
  },
});
