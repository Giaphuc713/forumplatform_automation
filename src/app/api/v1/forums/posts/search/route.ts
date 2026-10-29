import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
    // Lấy query parameters từ URL của Frontend
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword') || '';
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    try {
        // Encode keyword để tránh lỗi các ký tự đặc biệt (khoảng trắng, dấu +...)
        const url = `${BACKEND_URL}/api/v1/forums/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;

        const authHeader = request.headers.get("authorization");
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Search failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Lỗi khi gọi API search:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}