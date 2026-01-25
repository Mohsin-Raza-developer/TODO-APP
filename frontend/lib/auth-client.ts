/**
 * Better Auth client configuration
 *
 * Client-side authentication for React components
 *
 * Features:
 * - useSession hook for client components
 * - Sign in/up/out methods
 * - Session state management
 *
 * Usage in Client Components:
 * ```tsx
 * "use client";
 * import { authClient } from "@/lib/auth-client";
 *
 * export function UserProfile() {
 *   const { data: session, isPending } = authClient.useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return null;
 *
 *   return <div>Logged in as: {session.user.email}</div>;
 * }
 * ```
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
