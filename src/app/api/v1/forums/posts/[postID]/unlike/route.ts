import { NextRequest, NextResponse } from 'next/server';

// Proxy route: POST /api/v1/forums/posts/[postID]/like?studentId=...
// Toggles like/unlike on a post for a given student

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postID: string }> }
) {
    const { postID } = await params;
    const { searchParams } = request.nextUrl;

    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(
            `${BACKEND_URL}/api/v1/forums/posts/${postID}/unlike?${searchParams}`,
            {
                method: 'POST',
                headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error(`Error toggling like on post ${postID}:`, error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
