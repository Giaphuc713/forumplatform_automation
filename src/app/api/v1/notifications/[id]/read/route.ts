import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const authHeader = request.headers.get("authorization");
        const response = await fetch(
            `${BACKEND_URL}/api/v1/notifications/${id}/read`,
            {
                method: "PUT",
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
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error getting notifications proxy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}