import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "discusslabs.com";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "mail",
  "smtp",
  "ftp",
  "blog",
  "status",
  "help",
  "support",
]);

/**
 * Extract the subdomain from a hostname.
 * Returns null for root domain, reserved subdomains, or localhost without override.
 */
export function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(":")[0];

  if (host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  if (!host.endsWith(`.${APP_DOMAIN}`) && host !== APP_DOMAIN) {
    return null;
  }

  if (host === APP_DOMAIN || host === `www.${APP_DOMAIN}`) {
    return null;
  }

  const subdomain = host.slice(0, -(APP_DOMAIN.length + 1));

  if (subdomain.includes(".")) {
    return null;
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  return subdomain;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // ─── Resolve tenant ──────────────────────────────────
  let tenant = extractSubdomain(hostname);

  // Dev / non-subdomain: allow tenant override via header or cookie
  if (!tenant) {
    tenant =
      request.headers.get("x-tenant") ||
      request.cookies.get("tenant")?.value ||
      null;
  }

  // ─── Set tenant context ────────────────────────────────
  const requestHeaders = new Headers(request.headers);

  if (tenant) {
    // Forward tenant slug to server components via request headers
    requestHeaders.set("x-tenant-slug", tenant);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (tenant) {
    // Also persist in cookie for subsequent requests
    response.cookies.set("tenant", tenant, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // ─── Reserved subdomain → redirect to root domain ───
  if (hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = APP_DOMAIN;
    return NextResponse.redirect(url, 301);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/health).*)",
  ],
};
