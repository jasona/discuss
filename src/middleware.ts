import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
  // Strip port if present
  const host = hostname.split(":")[0];

  // Localhost development: use `x-tenant` header or `tenant` cookie
  if (host === "localhost" || host === "127.0.0.1") {
    return null; // handled separately via header/cookie
  }

  // Check if the host ends with our app domain
  if (!host.endsWith(`.${APP_DOMAIN}`) && host !== APP_DOMAIN) {
    return null;
  }

  // Root domain — no subdomain
  if (host === APP_DOMAIN || host === `www.${APP_DOMAIN}`) {
    return null;
  }

  // Extract subdomain: "acme.discusslabs.com" → "acme"
  const subdomain = host.slice(0, -(APP_DOMAIN.length + 1));

  // Reject multi-level subdomains (e.g., "a.b.discusslabs.com")
  if (subdomain.includes(".")) {
    return null;
  }

  // Reject reserved subdomains
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  return subdomain;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // ─── Resolve tenant ──────────────────────────────────
  let tenant = extractSubdomain(hostname);

  // Localhost dev: allow tenant override via header or cookie
  if (!tenant && (hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1"))) {
    tenant =
      request.headers.get("x-tenant") ||
      request.cookies.get("tenant")?.value ||
      null;
  }

  // ─── Supabase session refresh ────────────────────────
  // Refresh the auth session on every request so cookies stay fresh
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh the session (important for server components)
  await supabase.auth.getUser();

  // ─── Set tenant context header ───────────────────────
  // Downstream server components can read this to know which org is active
  if (tenant) {
    response.headers.set("x-tenant-slug", tenant);
    // Also set a cookie so client components can access it
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - api/health (health check for Coolify)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/health).*)",
  ],
};
