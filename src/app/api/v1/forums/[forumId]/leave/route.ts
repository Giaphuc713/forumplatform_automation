import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest, { params }: { params: Promise<{ forumId: string }> }) {
    const { searchParams } = req.nextUrl;
    try {
        const param = await params
        const forumId = param.forumId;
        const studentId = searchParams.get('studentId');
        const authHeader = req.headers.get("authorization");
        const res = await fetch(`${BACKEND_URL}/api/v1/forums/${forumId}/leave?studentId=${studentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to leave forum' }, { status: 500 });
    }
}