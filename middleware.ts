import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Admin & Staff only routes
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "STAFF") {
        return NextResponse.redirect(new URL("/login?error=UnauthorizedAdmin", req.url));
      }
    }

    // Kitchen display routes (Kitchen, Admin, Staff allowed)
    if (path.startsWith("/kitchen")) {
      if (role !== "KITCHEN" && role !== "ADMIN" && role !== "STAFF") {
        return NextResponse.redirect(new URL("/login?error=UnauthorizedKitchen", req.url));
      }
    }

    // Customer personal account
    if (path.startsWith("/account")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login?callbackUrl=/account", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Public routes are always accessible
        if (
          path === "/" ||
          path.startsWith("/book") ||
          path.startsWith("/menu") ||
          path.startsWith("/login") ||
          path.startsWith("/api/public") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/_next") ||
          path.includes("favicon")
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/kitchen/:path*", "/account/:path*"],
};
