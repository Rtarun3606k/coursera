import { auth } from "./app/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected route for dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (req.auth && req.auth.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
