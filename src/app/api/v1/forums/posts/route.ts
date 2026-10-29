import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/posts`, {
            method: 'POST',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error('Error creating post proxy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}