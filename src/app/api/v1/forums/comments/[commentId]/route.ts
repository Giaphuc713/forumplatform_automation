import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/forums/comments/:commentId
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const { commentId } = await params;
        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/comments/${commentId}`, {
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.result ?? data);
    } catch (error) {
        console.error('Error fetching comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/v1/forums/comments/:commentId?authorId=...
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const { commentId } = await params;
        const { searchParams } = new URL(request.url);
        const authorId = searchParams.get('authorId');
        const body = await request.json();

        const url = `${BACKEND_URL}/api/v1/forums/comments/${commentId}?authorId=${authorId}`;

        const authHeader = request.headers.get("authorization");
        const response = await fetch(url, {
            method: 'PUT',
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
        return NextResponse.json(data.result ?? data);
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/v1/forums/comments/:commentId?authorId=...
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const { commentId } = await params;
        const { searchParams } = new URL(request.url);
        const authorId = searchParams.get('authorId');

        const url = `${BACKEND_URL}/api/v1/forums/comments/${commentId}?authorId=${authorId}`;

        const authHeader = request.headers.get("authorization");
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        // DELETE may return empty body
        const text = await response.text();
        if (text) {
            return NextResponse.json(JSON.parse(text));
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
