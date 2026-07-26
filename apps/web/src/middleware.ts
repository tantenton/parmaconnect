import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/auth-service";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/health",
  "/api/auth/login",
  "/api/auth/register",
  "/_next",
  "/favicon.ico",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
];

// Admin-only routes
const adminRoutes = [
  "/admin",
  "/api/auth/users",
  "/api/admin",
  "/api/audit",
];

// Staff+ routes (accessible by any admin/staff role)
const staffRoutes = [
  "/staff",
  "/api/staff",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get("parmaconnect_session")?.value;
  if (!token) {
    // API routes return 401, pages redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "FINANCE_ADMIN", "SECURITY_OFFICER", "STAFF"];
    if (!adminRoles.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check staff routes
  if (staffRoutes.some((route) => pathname.startsWith(route))) {
    const staffRoles = ["SUPER_ADMIN", "ADMIN", "STAFF"];
    if (!staffRoles.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image).*)",
  ],
};