import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params;
    const page = Number(request.nextUrl.searchParams.get('page'));
    const size = Number(request.nextUrl.searchParams.get('size'));
    try {
        const authHeader = request.headers.get("authorization");
        const posts = await fetch(`${BACKEND_URL}/api/v1/forums/student/${studentId}/posts?page=${page}&size=${size}`, {
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });
        const data = await posts.json();
        console.log('data', data.result.content);
        return NextResponse.json(data.result.content);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}