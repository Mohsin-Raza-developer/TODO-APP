/**
 * Better Auth session helpers for Next.js route handlers.
 *
 * Better Auth stores session metadata in cookies:
 * - better-auth.session_token
 * - better-auth.session_data
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

interface ParsedSessionData {
  session?: {
    user?: {
      id?: string;
      emailVerified?: boolean;
    };
    session?: {
      userId?: string;
    };
  };
  user?: {
    id?: string;
    emailVerified?: boolean;
  };
  userId?: string;
  id?: string;
  emailVerified?: boolean;
}

export interface SessionAccess {
  userId: string | null;
  sessionToken: string | null;
  emailVerified: boolean;
  error: string | null;
}

interface BetterAuthSession {
  user?: {
    id?: string;
    emailVerified?: boolean;
  };
  session?: {
    token?: string;
    userId?: string;
  };
}

function decodeSessionData(rawValue: string): ParsedSessionData | null {
  try {
    const decoded = Buffer.from(rawValue, "base64").toString("utf-8");
    return JSON.parse(decoded) as ParsedSessionData;
  } catch {
    try {
      const decoded = decodeURIComponent(rawValue);
      return JSON.parse(decoded) as ParsedSessionData;
    } catch {
      return null;
    }
  }
}

/**
 * Extract user access information from Better Auth cookies.
 */
export async function getSessionAccessFromRequest(
  request: NextRequest
): Promise<SessionAccess> {
  const sessionTokenCookie = request.cookies.get("better-auth.session_token")?.value;
  const sessionDataCookie = request.cookies.get("better-auth.session_data")?.value;
  const cookieRawToken = sessionTokenCookie?.split(".")[0] || null;

  if (!sessionTokenCookie) {
    const fallbackSession = (await auth.api.getSession({
      headers: request.headers,
    })) as BetterAuthSession | null;

    if (!fallbackSession?.user?.id) {
      return {
        userId: null,
        sessionToken: null,
        emailVerified: false,
        error: "No session token found",
      };
    }

    return {
      userId: fallbackSession.user.id,
      sessionToken: fallbackSession.session?.token || null,
      emailVerified: Boolean(fallbackSession.user.emailVerified),
      error: null,
    };
  }

  if (sessionDataCookie) {
    const sessionData = decodeSessionData(sessionDataCookie);
    if (sessionData) {
      const userId =
        sessionData.session?.user?.id ||
        sessionData.session?.session?.userId ||
        sessionData.user?.id ||
        sessionData.userId ||
        sessionData.id ||
        null;

      if (userId) {
        const emailVerified = Boolean(
          sessionData.session?.user?.emailVerified ??
            sessionData.user?.emailVerified ??
            sessionData.emailVerified
        );

        return {
          userId,
          sessionToken: cookieRawToken,
          emailVerified,
          error: null,
        };
      }
    }
  }

  const fallbackSession = (await auth.api.getSession({
    headers: request.headers,
  })) as BetterAuthSession | null;

  if (!fallbackSession?.user?.id) {
    return {
      userId: null,
      sessionToken: null,
      emailVerified: false,
      error: "No user ID in session",
    };
  }

  return {
    userId: fallbackSession.user.id,
    sessionToken: cookieRawToken || fallbackSession.session?.token || null,
    emailVerified: Boolean(fallbackSession.user.emailVerified),
    error: null,
  };
}

/**
 * Backward-compatible helper used by existing routes.
 */
export async function getUserIdFromSession(request: NextRequest): Promise<{
  userId: string | null;
  error: string | null;
}> {
  const sessionAccess = await getSessionAccessFromRequest(request);
  return {
    userId: sessionAccess.userId,
    error: sessionAccess.error,
  };
}
