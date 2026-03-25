import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { getRootUrl } from "@/lib/tenant";
import { getTenantSlug } from "@/lib/tenant.server";

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication. Redirects to login if no session.
 * Returns the authenticated user.
 */
export async function requireAuth() {
  const user = await getSession();
  if (!user || !user.id) {
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

  console.log("[requireOrg] user:", user?.id, "tenantSlug:", tenantSlug);

  if (!tenantSlug) {
    console.log("[requireOrg] no tenant slug, redirecting to login");
    redirect(getRootUrl("/login"));
  }

  const membership = await prisma.orgMember.findFirst({
    where: {
      userId: user.id!,
      organization: { slug: tenantSlug },
    },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!membership) {
    redirect(getRootUrl("/login"));
  }

  return {
    user,
    orgId: membership.organization.id,
    orgSlug: membership.organization.slug,
    orgName: membership.organization.name,
    role: membership.defaultRole,
  };
}
