"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { getTenantSlug } from "@/lib/tenant.server";
import type { OrgRole } from "@/lib/constants";

export async function getOrgContext() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) throw new Error("No tenant context");

  const membership = await prisma.orgMember.findFirst({
    where: {
      userId: session.user.id,
      organization: { slug: tenantSlug },
    },
    include: {
      organization: { select: { id: true } },
    },
  });

  if (!membership) throw new Error("Not a member of this organization");

  return {
    userId: session.user.id,
    orgId: membership.organization.id,
    role: membership.defaultRole as unknown as OrgRole,
  };
}
