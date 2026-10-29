import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const size = searchParams.get('size');

    try {
        const url = `${BACKEND_URL}/api/v1/forums/posts/trending?page=${page}&size=${size}`;

        const authHeader = request.headers.get('authorization');
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch trending posts' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
