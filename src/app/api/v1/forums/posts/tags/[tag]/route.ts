import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tag: string }> }
) {
    const { tag } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    try {
        const url = `${BACKEND_URL}/api/v1/forums/posts/tags/${encodeURIComponent(tag)}?page=${page}&size=${size}`;

        const authHeader = request.headers.get('authorization');
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch posts by tag' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching posts by tag:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
