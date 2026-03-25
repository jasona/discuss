"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import {
  SLUG_MIN_LENGTH,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  RESERVED_SUBDOMAINS,
} from "@/lib/constants";

export interface CreateOrgResult {
  success: boolean;
  slug?: string;
  error?: string;
}

export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; error?: string }> {
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    return {
      available: false,
      error: `Slug must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`,
    };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      available: false,
      error:
        "Slug must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens",
    };
  }

  if (RESERVED_SUBDOMAINS.includes(slug)) {
    return { available: false, error: "This subdomain is reserved" };
  }

  const existing = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    return { available: false, error: "This subdomain is already taken" };
  }

  return { available: true };
}

export async function createOrg(
  name: string,
  slug: string
): Promise<CreateOrgResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const slugCheck = await checkSlugAvailability(slug);
  if (!slugCheck.available) {
    return { success: false, error: slugCheck.error };
  }

  try {
    const org = await prisma.organization.create({
      data: { name, slug, ownerId: session.user.id },
      select: { id: true },
    });

    await prisma.orgMember.create({
      data: {
        orgId: org.id,
        userId: session.user.id,
        defaultRole: "owner",
      },
    });

    await prisma.subscription.create({
      data: {
        orgId: org.id,
        plan: "free",
        status: "active",
        seatCount: 1,
      },
    });

    return { success: true, slug };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
