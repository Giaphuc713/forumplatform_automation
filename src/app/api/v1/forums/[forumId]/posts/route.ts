import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> },
) {
  const { forumId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const studentId = searchParams.get("studentId");
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "10";

  try {
    const url = `${BACKEND_URL}/api/v1/forums/${forumId}/posts?studentId=${studentId}&page=${page}&size=${size}`;
    const authHeader = request.headers.get("authorization");
    const response = await fetch(url, {
      cache: "no-store",
      headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Forum posts fetch failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
