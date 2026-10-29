import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ forumId: string }> }
) {
    const { searchParams } = request.nextUrl;
    const param = await params;
    const forumId = param.forumId;
    try {
        const authHeader = request.headers.get('authorization');
        const response = await fetch(
            `${BACKEND_URL}/api/v1/forums/${forumId}/reject?${searchParams}`,
            {
                method: 'POST',
                headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            },
        );
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error rejecting join request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
