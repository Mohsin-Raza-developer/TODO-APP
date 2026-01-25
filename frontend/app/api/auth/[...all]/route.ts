/**
 * Better Auth API handler
 *
 * Catch-all route for Better Auth authentication endpoints:
 * - POST /api/auth/signup - Create new user account
 * - POST /api/auth/signin - Authenticate user and create session
 * - POST /api/auth/signout - Destroy session and sign out
 * - GET /api/auth/session - Get current session
 *
 * This handler automatically provides all Better Auth endpoints
 * via the catch-all route [...all]
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
