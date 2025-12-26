import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Routes yang tidak memerlukan autentikasi
const publicRoutes = ["/login", "/api/auth"];

// Routes yang hanya untuk admin/superadmin
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Bypass untuk static files dan public routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Cek apakah route ada di publicRoutes
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Cek session menggunakan cookie
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
        // Redirect ke login jika tidak ada session
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
