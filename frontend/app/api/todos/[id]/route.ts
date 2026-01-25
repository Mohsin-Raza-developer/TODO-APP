/**
 * Individual Todo API Route - Proxy to FastAPI Backend
 *
 * Handles operations on individual todos:
 * - GET: Fetch single todo
 * - PUT: Update todo
 * - DELETE: Delete todo
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth-helper";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, error } = getUserIdFromSession(request);

    if (error || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: error || "Not authenticated" },
        { status: 401 }
      );
    }

    // Better Auth session_token format: "token.signature"
    // Database only stores the first part (token), so we split it
    const sessionTokenFull = request.cookies.get("better-auth.session_token")?.value || "";
    const sessionToken = sessionTokenFull.split('.')[0]; // Extract only token part

    const response = await fetch(`${FASTAPI_URL}/api/${userId}/tasks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });

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
    console.error("Get todo error:", error);
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to fetch todo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, error } = getUserIdFromSession(request);

    if (error || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: error || "Not authenticated" },
        { status: 401 }
      );
    }

    // Better Auth session_token format: "token.signature"
    // Database only stores the first part (token), so we split it
    const sessionTokenFull = request.cookies.get("better-auth.session_token")?.value || "";
    const sessionToken = sessionTokenFull.split('.')[0]; // Extract only token part
    const body = await request.json();

    const response = await fetch(`${FASTAPI_URL}/api/${userId}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(body),
    });

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
    console.error("Update todo error:", error);
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to update todo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, error } = getUserIdFromSession(request);

    if (error || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: error || "Not authenticated" },
        { status: 401 }
      );
    }

    // Better Auth session_token format: "token.signature"
    // Database only stores the first part (token), so we split it
    const sessionTokenFull = request.cookies.get("better-auth.session_token")?.value || "";
    const sessionToken = sessionTokenFull.split('.')[0]; // Extract only token part

    const response = await fetch(`${FASTAPI_URL}/api/${userId}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete todo error:", error);
    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to delete todo",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
