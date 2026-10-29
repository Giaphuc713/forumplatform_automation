import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest, { params }: { params: Promise<{ ownerId: string }> }) {
    const { ownerId } = await params;
    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(
            `${BACKEND_URL}/api/v1/forums/author/${ownerId}`,
            {
                method: "GET",
                headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText },
                { status: response.status },
            );
        }

        const data = await response.json();
        return NextResponse.json(data.result);
    } catch (error) {
        console.error("Error getting forums by owner proxy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
