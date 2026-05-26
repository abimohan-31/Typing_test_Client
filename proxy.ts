import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Define route classifications
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/leader") ||
    pathname.startsWith("/student");

  // Unauthenticated users accessing protected routes -> Redirect to Login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url);
    // Persist target path to redirect back after login
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Already authenticated users accessing Login or Register -> Redirect to landing page (which will automatically lead them to their correct dashboard via useAuthStore)
  if (isAuthRoute && token) {
    // If they have a plain role cookie, we can do fine-grained server-side redirect, 
    // otherwise redirect to landing page which performs client-side dashboard routing.
    const role = request.cookies.get("user_role")?.value;
    if (role) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "team-leader") return NextResponse.redirect(new URL("/leader", request.url));
      if (role === "student") return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Map only pages to run middleware, avoiding static assets, next internals, etc.
export const config = {
  matcher: [
    "/admin/:path*",
    "/leader/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};
