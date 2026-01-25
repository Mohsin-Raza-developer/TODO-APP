/**
 * Better Auth Session Helper
 *
 * Better Auth v1.3.4 uses session cookies instead of JWT tokens.
 * User information is stored in the session_data cookie.
 */

import { NextRequest } from "next/server";

export interface SessionData {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  userId?: string;
  id?: string;
}

/**
 * Extract user ID from Better Auth session cookies
 */
export function getUserIdFromSession(request: NextRequest): { userId: string | null; error: string | null } {
  // Get session cookies
  console.log("Cookies available:", request.cookies.getAll().map(c => c.name));
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const sessionData = request.cookies.get("better-auth.session_data")?.value;

  if (!sessionToken) {
    return { userId: null, error: "No session token found" };
  }

  if (!sessionData) {
    return { userId: null, error: "No session data found" };
  }

  try {
    // Better Auth stores session data as base64-encoded JSON
    let decodedSessionData: string;

    // Try base64 decoding first
    try {
      decodedSessionData = Buffer.from(sessionData, 'base64').toString('utf-8');
    } catch {
      // If base64 fails, try URL decoding
      decodedSessionData = decodeURIComponent(sessionData);
    }

    console.log("Decoded session data:", decodedSessionData);
    const sessionObj: any = JSON.parse(decodedSessionData);
    console.log("Parsed session object:", sessionObj);

    // Extract user ID (Better Auth has nested structure)
    // Try multiple possible locations in the session object
    const userId =
      sessionObj.session?.user?.id ||           // session.user.id
      sessionObj.session?.session?.userId ||    // session.session.userId
      sessionObj.user?.id ||                    // user.id
      sessionObj.userId ||                      // userId
      sessionObj.id;                            // id

    if (!userId) {
      console.error("No user ID found in session. Session object:", sessionObj);
      return { userId: null, error: "No user ID in session data" };
    }

    console.log("Extracted user ID:", userId);
    return { userId, error: null };
  } catch (error) {
    console.error("Failed to parse session data:", error);
    return { userId: null, error: "Invalid session data format" };
  }
}
