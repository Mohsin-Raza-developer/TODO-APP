/**
 * ChatKit API Proxy Route
 * 
 * Proxies ChatKit requests to the chatbot backend with JWT authentication.
 * This route:
 * - Verifies user authentication via Better Auth
 * - Injects JWT token into requests to chatbot backend
 * - Forwards requests/responses (including streaming)
 * - Returns 401 for unauthenticated requests
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

const CHATBOT_BACKEND_URL = process.env.NEXT_PUBLIC_CHATBOT_BACKEND_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication via Better Auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Get JWT token from session
        const token = session.session?.token;

        if (!token) {
            console.error('No token found in session');
            return new Response(
                JSON.stringify({ error: 'Authentication token missing' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Get request body
        const body = await request.text();

        // Forward request to chatbot backend
        const backendUrl = `${CHATBOT_BACKEND_URL}/api/chatkit`;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });

        // Return backend response (preserves streaming)
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
                'Cache-Control': response.headers.get('Cache-Control') || 'no-cache',
            },
        });

    } catch (error) {
        console.error('ChatKit proxy error:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle GET requests (for health checks or session info)
export async function GET() {
    return new Response(
        JSON.stringify({
            status: 'ChatKit proxy ready',
            backend: CHATBOT_BACKEND_URL
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
