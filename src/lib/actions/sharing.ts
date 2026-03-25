"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import { isAtLeast } from "@/lib/permissions";
import { PLAN_LIMITS, type PlanType } from "@/lib/constants";
import { nanoid } from "nanoid";

export interface ShareStatus {
  isShared: boolean;
  slug: string | null;
  publicUrl: string | null;
}

export async function getShareStatus(pageId: string): Promise<ShareStatus> {
  const ctx = await getOrgContext();

  const page = await prisma.page.findFirst({
    where: { id: pageId, orgId: ctx.orgId },
    select: { isExternallyShared: true, externalShareSlug: true },
  });

  if (!page) throw new Error("Page not found");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";

  return {
    isShared: page.isExternallyShared,
    slug: page.externalShareSlug,
    publicUrl: page.isExternallyShared && page.externalShareSlug
      ? `${appUrl}/public/${page.externalShareSlug}`
      : null,
  };
}

export async function toggleExternalSharing(
  pageId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string; shareStatus?: ShareStatus }> {
  try {
    const ctx = await getOrgContext();

    // Only admins+ can manage sharing
    if (!isAtLeast(ctx.role, "admin")) {
      return { success: false, error: "Only admins can manage sharing" };
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { id: true, spaceId: true, isExternallyShared: true },
    });

    if (!page) return { success: false, error: "Page not found" };

    if (enabled) {
      // Check plan limits
      const subscription = await prisma.subscription.findFirst({
        where: { orgId: ctx.orgId },
        select: { plan: true },
      });

      const plan = (subscription?.plan || "free") as PlanType;
      const limits = PLAN_LIMITS[plan];

      if (limits.maxExternalShares === 0) {
        return {
          success: false,
          error: "External sharing is not available on the Free plan. Please upgrade.",
        };
      }

      if (limits.maxExternalShares !== Infinity) {
        const currentCount = await prisma.page.count({
          where: { orgId: ctx.orgId, isExternallyShared: true },
        });

        if (currentCount >= limits.maxExternalShares) {
          return {
            success: false,
            error: `You've reached the limit of ${limits.maxExternalShares} externally shared pages on your plan.`,
          };
        }
      }

      // Enable sharing with a new slug
      const slug = nanoid(21);
      await prisma.page.update({
        where: { id: pageId },
        data: { isExternallyShared: true, externalShareSlug: slug },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";

      return {
        success: true,
        shareStatus: {
          isShared: true,
          slug,
          publicUrl: `${appUrl}/public/${slug}`,
        },
      };
    } else {
      // Disable sharing
      await prisma.page.update({
        where: { id: pageId },
        data: { isExternallyShared: false, externalShareSlug: null },
      });

      return {
        success: true,
        shareStatus: { isShared: false, slug: null, publicUrl: null },
      };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/**
 * Fetch a page by its external share slug (no auth required).
 */
export async function getPublicPage(slug: string) {
  const page = await prisma.page.findFirst({
    where: {
      externalShareSlug: slug,
      isExternallyShared: true,
      isArchived: false,
    },
    select: {
      id: true,
      title: true,
      contentJson: true,
      contentMarkdown: true,
      updatedAt: true,
      organization: { select: { name: true } },
    },
  });

  if (!page) return null;

  return {
    id: page.id,
    title: page.title,
    contentJson: page.contentJson as Record<string, unknown>,
    contentMarkdown: page.contentMarkdown,
    updatedAt: page.updatedAt.toISOString(),
    orgName: page.organization.name,
  };
}
