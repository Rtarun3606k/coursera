import { auth } from "./app/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check if user is admin
    if (!req.auth.user?.isAdmin) {
      // Redirect to unauthorized if not admin
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
