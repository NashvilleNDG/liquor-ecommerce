import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE } from "@/lib/admin-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Dashboard protection ──────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Always allow the login page through
    if (pathname === "/dashboard/login") return NextResponse.next();

    const token = request.cookies.get(COOKIE)?.value;
    const email = token ? await verifyAdminToken(token) : null;

    if (!email) {
      const loginUrl = new URL("/dashboard/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
