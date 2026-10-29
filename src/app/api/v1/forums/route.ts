import { NextRequest, NextResponse } from "next/server";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export async function GET(
  request: NextRequest
) {
  const { searchParams } = request.nextUrl;
  const studentId = searchParams.get("studentId");
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(
      `${BACKEND_URL}/api/v1/forums?studentId=${studentId}`,
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
    console.error("Error getting forums proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
export async function PUT(
  request: NextRequest
) {
  const { searchParams } = request.nextUrl;
  const authorId = searchParams.get("authorId");
  const postId = searchParams.get("postId");
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/forums/${postId}?authorId=${authorId}`,
      {
        method: "PUT",
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
    console.error("Error getting forums proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const authHeader = request.headers.get("authorization");
    const formData = await request.formData();
    const response = await fetch(`${BACKEND_URL}/api/v1/forums?${searchParams}`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data.result);
  } catch (error) {
    console.error("Error creating forum proxy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
