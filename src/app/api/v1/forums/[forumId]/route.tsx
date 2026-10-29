import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ forumId: string }> }
) {
    const { searchParams } = request.nextUrl;
    const param = await params;
    const forumId = param.forumId;
    const studentId = searchParams.get("studentId");
    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(
            `${BACKEND_URL}/api/v1/forums/${forumId}?studentId=${studentId}`,
            {
                method: "GET",
                headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            },
        );

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error("Error getting forums proxy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
