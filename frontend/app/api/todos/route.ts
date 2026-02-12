/**
 * Todos API Route - Proxy to FastAPI Backend
 *
 * This route acts as a proxy between the frontend and FastAPI backend.
 * It handles authentication by extracting the session from Better Auth
 * and forwarding requests to the backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionAccessFromRequest } from "@/lib/auth-helper";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    if (!sessionToken) {
      return NextResponse.json(
        { error: "unauthorized", message: "Missing session token" },
        { status: 401 }
      );
    }

    // Forward to FastAPI backend with user ID
    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks?status=${status}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
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
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to fetch todos",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    if (!sessionToken) {
      return NextResponse.json(
        { error: "unauthorized", message: "Missing session token" },
        { status: 401 }
      );
    }

    // Forward to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/api/${userId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
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
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to create todo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
