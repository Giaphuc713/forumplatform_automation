import { NextRequest, NextResponse } from "next/server";

// UI routes disabled — all redirect to /ai-assistant
const DISABLED_ROUTE_PREFIXES = [
    '/home',
    '/personal',
    '/dashboard',
    '/profile',
    '/forum',
    '/settings',
];

// Auth routes: accessible to guests but redirect logged-in users away
const AUTH_ROUTE_PREFIXES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-code',
    '/reset-password',
];

export function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;


    // Disabled UI routes → /ai-assistant (for everyone)
    const isDisabled = DISABLED_ROUTE_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    );
    if (isDisabled) {
        // return NextResponse.redirect(new URL("/ai-assistant", request.url));
    }

    if (pathname == '/') {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Logged -in users visiting auth pages → /ai-assistant
    const isAuthRoute = AUTH_ROUTE_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    );
    // if (token && isAuthRoute) {
    //     return NextResponse.redirect(new URL("/ai - assistant", request.url));
    // }

    // /ai-assistant is public — no auth gate
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - /api/* (Next.js API routes / BFF proxy)
         * - /_next/static (static chunks)
         * - /_next/image (image optimisation)
         * - /favicon.ico, /images/*, /assets/*
         */
        "/((?!api|_next/static|_next/image|favicon\\.ico|images|assets).*)",
    ],
};
