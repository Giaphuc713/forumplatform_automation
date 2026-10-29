import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ inviteCode: string }> }
) {
    const param = await params;
    const inviteCode = param.inviteCode;
    try {
        const authHeader = request.headers.get('authorization');
        const response = await fetch(`${BACKEND_URL}/api/v1/forums/by-code/${inviteCode}`, {
            method: 'GET',
            headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
        });
        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error('Error fetching forum by invite code:', error);
        return NextResponse.json({ error: 'Only the owner or an admin can perform this action' }, { status: 403 });
    }
}
