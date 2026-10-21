import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow login pages through unconditionally
  if (pathname === "/staff/login" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const roleCookie = request.cookies.get("cue_user_role")?.value;
  const staffToken = request.cookies.get("cn_staff_token")?.value;
  const adminToken = request.cookies.get("cn_admin_token")?.value;

  // Protect /admin routes -> owner / admin only
  if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
    const isAuthorized = roleCookie === "owner" || roleCookie === "admin" || !!adminToken;
    if (!isAuthorized) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /staff routes -> staff, manager, or admin/owner
  if (pathname.startsWith("/staff")) {
    const isAuthorized =
      roleCookie === "staff" ||
      roleCookie === "manager" ||
      roleCookie === "owner" ||
      roleCookie === "admin" ||
      !!staffToken ||
      !!adminToken;
    if (!isAuthorized) {
      const loginUrl = new URL("/staff/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*", "/staff/:path*"],
};
