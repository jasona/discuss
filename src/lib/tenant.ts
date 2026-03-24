/**
 * Build a URL for a specific tenant subdomain.
 */
export function getTenantUrl(slug: string, path: string = "/"): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "discusslabs.com";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  if (process.env.NODE_ENV !== "production") {
    // Local dev: use localhost with tenant cookie
    return `${protocol}://localhost:3000${path}`;
  }

  return `${protocol}://${slug}.${domain}${path}`;
}

/**
 * Build the root domain URL (no tenant).
 */
export function getRootUrl(path: string = "/"): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";
  return `${appUrl}${path}`;
}
