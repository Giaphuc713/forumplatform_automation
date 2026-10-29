import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest, { params }: { params: Promise<{ forumId: string }> }) {
    try {
        const param = await params
        const forumId = param.forumId;
        const authHeader = req.headers.get("authorization");
        const res = await fetch(`${BACKEND_URL}/api/v1/forums/${forumId}/members`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        });
        const data = await res.json();
        return NextResponse.json(data.result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get forum members' }, { status: 500 });
    }
}