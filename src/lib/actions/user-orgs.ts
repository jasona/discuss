"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export async function getUserOrgs() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const memberships = await prisma.orgMember.findMany({
    where: { userId: session.user.id },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  return memberships.map((m) => m.organization);
}
