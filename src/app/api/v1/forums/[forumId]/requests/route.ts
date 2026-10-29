import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ forumId: string }> }
) {
    const { searchParams } = request.nextUrl;
    const param = await params;
    const forumId = param.forumId;
    try {
        const authHeader = request.headers.get('authorization');
        const response = await fetch(
            `${BACKEND_URL}/api/v1/forums/${forumId}/requests?${searchParams}`,
            {
                method: 'GET',
                headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            },
        );
        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error('Error fetching pending membership requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
