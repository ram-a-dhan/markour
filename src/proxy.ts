import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./lib/jwt";
import { API_PATH, HOME_PATH, NOTE_LIST_PATH } from "./constants/url";

const BASE_URL = process.env.BASE_URL!;
const PUBLIC_PAGES = [HOME_PATH];
const ALLOWED_ORIGINS = [BASE_URL];

export function proxy(req: NextRequest) {
  // /pages requests
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith(API_PATH); 

  if (!isApi) {
    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    const token = req.cookies.get("auth_token")?.value;
    const payload = token ? verifyJwt(token) : null;

    // inside but not logged in
    if (!isPublicPage && !payload) {
      return NextResponse.redirect(new URL(HOME_PATH, req.url));
    }

    // outside but logged in
    if (isPublicPage && payload) {
      return NextResponse.redirect(new URL(NOTE_LIST_PATH, req.url));
    }

    // default case
    return NextResponse.next();
  }

  // /api requests (cors + security headers)
  const origin = req.headers.get("origin");
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  // preflight requests
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.headers.set("Vary", "Origin");
    }
    return res;
  }

  // standard requests
  const res = NextResponse.next();

  if (isAllowedOrigin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
  }

  // security headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
