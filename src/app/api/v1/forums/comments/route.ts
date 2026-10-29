import { NextRequest, NextResponse } from 'next/server';

// Proxy route: POST /api/v1/forums/comments
// Forwards comment creation request to backend API

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error('Error creating comment proxy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
