import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Measure total cookie size. Supabase stores JWTs in chunked cookies
  // (sb-*-auth-token.0, .1, .2...). If user_metadata contains large data
  // (e.g. base64 avatar), the JWT grows huge and triggers HTTP 431.
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (cookieHeader.length > 8000) {
    // Cookies are dangerously large — clear all Supabase auth cookies
    // to force a fresh login with clean metadata
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
