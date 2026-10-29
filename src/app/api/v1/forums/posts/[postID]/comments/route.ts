import { NextRequest, NextResponse } from 'next/server';

// Proxy route: GET /api/v1/forums/posts/[postID]/comments
// Forwards request to backend API for post comments

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postID: string }> }
) {
    const { postID } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    try {
        const url = `${BACKEND_URL}/api/v1/forums/posts/${postID}/comments?page=${page}&size=${size}`;
        const authHeader = request.headers.get("authorization");
        const response = await fetch(url, {
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Comments fetch failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching comments for post ${postID}:`, error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
