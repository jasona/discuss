"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import type { OrgRole } from "@/lib/constants";
import { canEditPage, canViewSpace } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  // Check explicit membership
  const membership = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { role: true },
  });

  if (membership) return membership.role as "admin" | "editor" | "viewer";

  // Fall back to space default role
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { defaultRole: true },
  });

  if (space && space.defaultRole !== "none") {
    return space.defaultRole as "editor" | "viewer";
  }

  return "none";
}

// ─── Types ───────────────────────────────────────────────

export interface Page {
  id: string;
  orgId: string;
  spaceId: string;
  parentPageId: string | null;
  title: string;
  contentJson: Record<string, unknown>;
  contentMarkdown: string;
  sortOrder: number;
  isArchived: boolean;
  isExternallyShared: boolean;
  externalShareSlug: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageBreadcrumb {
  id: string;
  title: string;
}

// ─── Helper: map Prisma page row to Page interface ───────

function mapPage(d: {
  id: string;
  orgId: string;
  spaceId: string;
  parentPageId: string | null;
  title: string;
  contentJson: unknown;
  contentMarkdown: string;
  sortOrder: number;
  isArchived: boolean;
  isExternallyShared: boolean;
  externalShareSlug: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Page {
  return {
    id: d.id,
    orgId: d.orgId,
    spaceId: d.spaceId,
    parentPageId: d.parentPageId,
    title: d.title,
    contentJson: d.contentJson as Record<string, unknown>,
    contentMarkdown: d.contentMarkdown,
    sortOrder: d.sortOrder,
    isArchived: d.isArchived,
    isExternallyShared: d.isExternallyShared,
    externalShareSlug: d.externalShareSlug,
    createdBy: d.createdBy,
    updatedBy: d.updatedBy,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

// ─── Create Page ─────────────────────────────────────────

export async function createPage(
  spaceId: string,
  parentPageId: string | null,
  title: string
): Promise<{ success: boolean; error?: string; pageId?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Get next sort order among siblings
    const lastPage = await prisma.page.findFirst({
      where: {
        spaceId,
        orgId: ctx.orgId,
        parentPageId: parentPageId,
      },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (lastPage?.sortOrder ?? -1) + 1;

    const page = await prisma.page.create({
      data: {
        orgId: ctx.orgId,
        spaceId,
        parentPageId,
        title: title || "Untitled",
        contentJson: {},
        contentMarkdown: "",
        sortOrder,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      },
      select: { id: true },
    });

    return { success: true, pageId: page.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Page ─────────────────────────────────────────

export async function updatePage(
  pageId: string,
  updates: {
    title?: string;
    contentJson?: Record<string, unknown>;
    contentMarkdown?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    // Get page to check space membership
    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true },
    });

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const updateData: Record<string, unknown> = {
      updatedBy: ctx.userId,
    };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.contentJson !== undefined)
      updateData.contentJson = updates.contentJson;
    if (updates.contentMarkdown !== undefined)
      updateData.contentMarkdown = updates.contentMarkdown;

    await prisma.page.updateMany({
      where: { id: pageId, orgId: ctx.orgId },
      data: updateData,
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Archive Page ────────────────────────────────────────

export async function archivePage(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true },
    });

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Recursively archive this page and all sub-pages
    await archivePageRecursive(pageId, ctx.orgId);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

async function archivePageRecursive(pageId: string, orgId: string) {
  // Archive the page itself
  await prisma.page.updateMany({
    where: { id: pageId, orgId },
    data: { isArchived: true },
  });

  // Find and archive child pages
  const children = await prisma.page.findMany({
    where: { parentPageId: pageId, orgId, isArchived: false },
    select: { id: true },
  });

  for (const child of children) {
    await archivePageRecursive(child.id, orgId);
  }
}

// ─── Restore Page ────────────────────────────────────────

export async function restorePage(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true },
    });

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.page.updateMany({
      where: { id: pageId, orgId: ctx.orgId },
      data: { isArchived: false },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Delete Page (permanent) ─────────────────────────────

export async function deletePage(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true, isArchived: true, parentPageId: true },
    });

    if (!page) return { success: false, error: "Page not found" };
    if (!page.isArchived) {
      return { success: false, error: "Page must be archived before deletion" };
    }

    const spaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Re-parent children to this page's parent (or make them root)
    await prisma.page.updateMany({
      where: { parentPageId: pageId, orgId: ctx.orgId },
      data: { parentPageId: page.parentPageId ?? null },
    });

    // Delete comments on this page
    await prisma.comment.deleteMany({ where: { pageId } });

    // Delete the page
    await prisma.page.deleteMany({
      where: { id: pageId, orgId: ctx.orgId },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Move Page ───────────────────────────────────────────

export async function movePage(
  pageId: string,
  newSpaceId: string,
  newParentPageId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    // Check permissions on source page
    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true },
    });

    if (!page) return { success: false, error: "Page not found" };

    const sourceSpaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    if (!canEditPage(ctx.role, sourceSpaceRole)) {
      return { success: false, error: "Insufficient permissions on source space" };
    }

    // Check permissions on target space
    const targetSpaceRole = await getUserSpaceRole(newSpaceId, ctx.userId);
    if (!canEditPage(ctx.role, targetSpaceRole)) {
      return { success: false, error: "Insufficient permissions on target space" };
    }

    // Prevent moving a page under itself
    if (newParentPageId) {
      let checkId: string | null = newParentPageId;
      while (checkId) {
        if (checkId === pageId) {
          return { success: false, error: "Cannot move a page under itself" };
        }
        const parent: { parentPageId: string | null } | null =
          await prisma.page.findUnique({
            where: { id: checkId },
            select: { parentPageId: true },
          });
        checkId = parent?.parentPageId ?? null;
      }
    }

    // Get next sort order in target location
    const lastPage = await prisma.page.findFirst({
      where: {
        spaceId: newSpaceId,
        parentPageId: newParentPageId,
      },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (lastPage?.sortOrder ?? -1) + 1;

    await prisma.page.updateMany({
      where: { id: pageId, orgId: ctx.orgId },
      data: {
        spaceId: newSpaceId,
        parentPageId: newParentPageId,
        sortOrder,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Reorder Pages ───────────────────────────────────────

export async function reorderPages(
  spaceId: string,
  parentPageId: string | null,
  orderedPageIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Update sortOrder for each page
    for (let i = 0; i < orderedPageIds.length; i++) {
      await prisma.page.updateMany({
        where: {
          id: orderedPageIds[i],
          spaceId,
          orgId: ctx.orgId,
        },
        data: { sortOrder: i, parentPageId },
      });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Page ────────────────────────────────────────────

export async function getPage(pageId: string): Promise<Page | null> {
  try {
    const ctx = await getOrgContext();

    const data = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
    });

    if (!data) return null;

    // Check permissions
    const spaceRole = await getUserSpaceRole(data.spaceId, ctx.userId);
    if (!canViewSpace(ctx.role, spaceRole)) return null;

    return mapPage(data);
  } catch {
    return null;
  }
}

// ─── Get Pages for Space ─────────────────────────────────

export async function getSpacePages(spaceId: string): Promise<Page[]> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canViewSpace(ctx.role, spaceRole)) return [];

    const data = await prisma.page.findMany({
      where: {
        spaceId,
        orgId: ctx.orgId,
        isArchived: false,
        parentPageId: null,
      },
      orderBy: { sortOrder: "asc" },
    });

    return data.map(mapPage);
  } catch {
    return [];
  }
}

// ─── Get Page Breadcrumbs ────────────────────────────────

export async function getPageBreadcrumbs(
  pageId: string
): Promise<PageBreadcrumb[]> {
  try {
    const ctx = await getOrgContext();

    const breadcrumbs: PageBreadcrumb[] = [];
    let currentId: string | null = pageId;

    while (currentId) {
      const data: { id: string; title: string; parentPageId: string | null } | null =
        await prisma.page.findFirst({
          where: { id: currentId, orgId: ctx.orgId },
          select: { id: true, title: true, parentPageId: true },
        });

      if (!data) break;

      breadcrumbs.unshift({ id: data.id, title: data.title });
      currentId = data.parentPageId;
    }

    return breadcrumbs;
  } catch {
    return [];
  }
}

// ─── Can User Edit Page ──────────────────────────────────

export async function canUserEditPage(pageId: string): Promise<boolean> {
  try {
    const ctx = await getOrgContext();

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { spaceId: true },
    });

    if (!page) return false;

    const spaceRole = await getUserSpaceRole(page.spaceId, ctx.userId);
    return canEditPage(ctx.role, spaceRole);
  } catch {
    return false;
  }
}

// ─── Get Page Author Info ────────────────────────────────

export interface PageAuthorInfo {
  updatedByName: string | null;
  orgId: string;
  currentUserId: string;
  currentUserRole: string;
}

export async function getPageAuthorInfo(
  pageId: string
): Promise<PageAuthorInfo | null> {
  try {
    const ctx = await getOrgContext();

    const page = await prisma.page.findFirst({
      where: { id: pageId, orgId: ctx.orgId },
      select: { updatedBy: true },
    });

    if (!page) return null;

    const user = await prisma.user.findUnique({
      where: { id: page.updatedBy },
      select: { name: true, email: true },
    });

    return {
      updatedByName: user?.name || user?.email || null,
      orgId: ctx.orgId,
      currentUserId: ctx.userId,
      currentUserRole: ctx.role,
    };
  } catch {
    return null;
  }
}
