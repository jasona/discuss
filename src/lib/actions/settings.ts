"use server";

import { getOrgContext } from "@/lib/actions/context";
import { prisma } from "@/lib/db";

export async function getOrgSettings() {
  try {
    const ctx = await getOrgContext();

    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    return org;
  } catch {
    return null;
  }
}

export async function updateOrgName(
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.organization.update({
      where: { id: ctx.orgId },
      data: { name },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
