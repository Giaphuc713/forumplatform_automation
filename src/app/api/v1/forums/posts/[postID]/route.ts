import { NextRequest, NextResponse } from 'next/server';

// Proxy route: GET /api/v1/forums/posts/[postID]
// Forwards request to backend API

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postID: string }> }
) {
    const { postID } = await params;
    const { searchParams } = request.nextUrl;
    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/posts/${postID}?${searchParams}`, {
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });
        const data = await response.json();

        if (!data.result) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(data.result);

    } catch (error) {
        console.error(`Error fetching post ${postID}:`, error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ postID: string }> }
) {
    const { postID } = await params;
    const authorId = request.nextUrl.searchParams.get('authorId');

    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/posts/${postID}?authorId=${authorId}`, {
            method: 'DELETE',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(`Error deleting post ${postID}:`, error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ postID: string }> }
) {
    const { postID } = await params;
    const { searchParams } = request.nextUrl;
    const authorId = searchParams.get('authorId');
    try {
        // Forward raw body + original Content-Type (preserves multipart boundary)
        const contentType = request.headers.get('content-type') || '';
        const body = await request.arrayBuffer();

        const authHeader = request.headers.get("authorization");
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/posts/${postID}?authorId=${authorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: Buffer.from(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error(`Error updating post ${postID}:`, error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
