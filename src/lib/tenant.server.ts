import "server-only";

import { headers, cookies } from "next/headers";

/**
 * Get the current tenant slug from the request context.
 * Set by middleware via the `x-tenant-slug` header.
 * Returns null if on the root domain (no tenant).
 *
 * Server-only — cannot be imported in client components.
 */
export async function getTenantSlug(): Promise<string | null> {
  const headerStore = await headers();
  const slug = headerStore.get("x-tenant-slug");
  if (slug) return slug;

  // Fallback: check the cookie (useful for client-initiated requests)
  const cookieStore = await cookies();
  return cookieStore.get("tenant")?.value || null;
}
