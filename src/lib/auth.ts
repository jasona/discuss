import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRootUrl } from "@/lib/tenant";
import { getTenantSlug } from "@/lib/tenant.server";

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication. Redirects to login if no session.
 * Returns the authenticated user.
 */
export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    redirect(getRootUrl("/login"));
  }
  return user;
}

/**
 * Require that the user belongs to the current tenant org.
 * Must be called from a route that has a tenant context (subdomain).
 * Returns the user and their org membership.
 */
export async function requireOrg() {
  const user = await requireAuth();
  const tenantSlug = await getTenantSlug();

  if (!tenantSlug) {
    redirect(getRootUrl("/login"));
  }

  const supabase = await createClient();

  // Verify user is a member of this org
  const { data: membership } = await supabase
    .from("org_members")
    .select("*, organizations!inner(id, name, slug)")
    .eq("organizations.slug", tenantSlug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    // User is not a member of this org
    redirect(getRootUrl("/login"));
  }

  const org = membership.organizations as {
    id: string;
    name: string;
    slug: string;
  };

  return {
    user,
    orgId: org.id,
    orgSlug: org.slug,
    orgName: org.name,
    role: membership.default_role,
  };
}
