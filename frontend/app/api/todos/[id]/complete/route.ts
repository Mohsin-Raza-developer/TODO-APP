/**
 * Toggle Todo Completion API Route - Proxy to FastAPI Backend
 *
 * Handles toggling todo completion status
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionAccessFromRequest } from "@/lib/auth-helper";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, sessionToken, emailVerified, error } = await getSessionAccessFromRequest(request);

    if (error || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: error || "Not authenticated" },
        { status: 401 }
      );
    }

    if (!emailVerified) {
      return NextResponse.json(
        { error: "forbidden", message: "Email verification required" },
        { status: 403 }
      );
    }

    if (!sessionToken) {
      return NextResponse.json(
        { error: "unauthorized", message: "Missing session token" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${id}/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FastAPI error (${response.status}):`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: "backend_error", message: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Toggle complete error:", error);
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to toggle completion",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
