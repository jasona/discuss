"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanType, SpaceDefaultRole } from "@/lib/constants";
import { canManageSpace } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────

async function getOrgPlan(orgId: string): Promise<PlanType> {
  const data = await prisma.subscription.findUnique({
    where: { orgId },
    select: { plan: true },
  });

  return (data?.plan as PlanType) || "free";
}

async function getSpaceCount(orgId: string): Promise<number> {
  return prisma.space.count({
    where: { orgId, isArchived: false },
  });
}

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  const data = await prisma.spaceMember.findFirst({
    where: { spaceId, userId },
    select: { role: true },
  });

  return (data?.role as "admin" | "editor" | "viewer") || "none";
}

// ─── Types ───────────────────────────────────────────────

export interface Space {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  icon: string | null;
  defaultRole: SpaceDefaultRole;
  sortOrder: number;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
}

export interface SpaceWithPages extends Space {
  pages: PageTreeNode[];
}

export interface PageTreeNode {
  id: string;
  spaceId: string;
  parentPageId: string | null;
  title: string;
  sortOrder: number;
  isArchived: boolean;
  children: PageTreeNode[];
}

// ─── Create Space ────────────────────────────────────────

export async function createSpace(
  name: string,
  description: string | null,
  icon: string | null,
  defaultRole: SpaceDefaultRole
): Promise<{ success: boolean; error?: string; spaceId?: string }> {
  try {
    const ctx = await getOrgContext();

    // Only owners, admins, and editors can create spaces
    if (ctx.role === "viewer") {
      return { success: false, error: "Viewers cannot create spaces" };
    }

    // Check plan limits
    const plan = await getOrgPlan(ctx.orgId);
    const spaceCount = await getSpaceCount(ctx.orgId);
    const limits = PLAN_LIMITS[plan];

    if (spaceCount >= limits.maxSpaces) {
      return {
        success: false,
        error: `Your ${plan} plan allows up to ${limits.maxSpaces} spaces. Upgrade to add more.`,
      };
    }

    // Get next sort order
    const lastSpace = await prisma.space.findFirst({
      where: { orgId: ctx.orgId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (lastSpace?.sortOrder ?? -1) + 1;

    const space = await prisma.space.create({
      data: {
        orgId: ctx.orgId,
        name,
        description,
        icon,
        defaultRole,
        sortOrder,
        createdBy: ctx.userId,
      },
      select: { id: true },
    });

    // Add creator as space admin
    await prisma.spaceMember.create({
      data: {
        spaceId: space.id,
        userId: ctx.userId,
        role: "admin",
      },
    });

    return { success: true, spaceId: space.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Space ────────────────────────────────────────

export async function updateSpace(
  spaceId: string,
  updates: {
    name?: string;
    description?: string | null;
    icon?: string | null;
    defaultRole?: SpaceDefaultRole;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.defaultRole !== undefined) updateData.defaultRole = updates.defaultRole;

    await prisma.space.updateMany({
      where: { id: spaceId, orgId: ctx.orgId },
      data: updateData,
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Archive Space ───────────────────────────────────────

export async function archiveSpace(
  spaceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.space.updateMany({
      where: { id: spaceId, orgId: ctx.orgId },
      data: { isArchived: true },
    });

    // Also archive all pages in this space
    await prisma.page.updateMany({
      where: { spaceId, orgId: ctx.orgId },
      data: { isArchived: true },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Restore Space ───────────────────────────────────────

export async function restoreSpace(
  spaceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.space.updateMany({
      where: { id: spaceId, orgId: ctx.orgId },
      data: { isArchived: false },
    });

    // Restore pages in this space
    await prisma.page.updateMany({
      where: { spaceId, orgId: ctx.orgId },
      data: { isArchived: false },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Delete Space (permanent) ────────────────────────────

export async function deleteSpace(
  spaceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Only allow deletion of archived spaces
    const space = await prisma.space.findFirst({
      where: { id: spaceId, orgId: ctx.orgId },
      select: { isArchived: true },
    });

    if (!space) return { success: false, error: "Space not found" };
    if (!space.isArchived) {
      return { success: false, error: "Space must be archived before deletion" };
    }

    // Delete all pages in this space
    await prisma.page.deleteMany({ where: { spaceId } });
    // Delete space members
    await prisma.spaceMember.deleteMany({ where: { spaceId } });
    // Delete the space
    await prisma.space.delete({ where: { id: spaceId } });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Spaces with Page Trees ─────────────────────────

export async function getSpacesWithPages(): Promise<SpaceWithPages[]> {
  try {
    const ctx = await getOrgContext();

    // Fetch all non-archived spaces for this org
    const spaces = await prisma.space.findMany({
      where: { orgId: ctx.orgId, isArchived: false },
      orderBy: { sortOrder: "asc" },
    });

    // Fetch all non-archived pages for this org
    const pages = await prisma.page.findMany({
      where: { orgId: ctx.orgId, isArchived: false },
      select: {
        id: true,
        spaceId: true,
        parentPageId: true,
        title: true,
        sortOrder: true,
        isArchived: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Get user's space memberships for filtering
    const memberships = await prisma.spaceMember.findMany({
      where: { userId: ctx.userId },
      select: { spaceId: true, role: true },
    });

    const membershipMap = new Map(
      memberships.map((m) => [m.spaceId, m.role])
    );

    // Filter spaces: user can see if they're owner/admin, or have space membership, or space has a defaultRole
    const visibleSpaces = spaces.filter((s) => {
      if (ctx.role === "owner" || ctx.role === "admin") return true;
      if (membershipMap.has(s.id)) return true;
      return s.defaultRole !== "none";
    });

    // Build page trees per space
    const pagesBySpace = new Map<string, typeof pages>();
    for (const page of pages) {
      const list = pagesBySpace.get(page.spaceId) || [];
      list.push(page);
      pagesBySpace.set(page.spaceId, list);
    }

    return visibleSpaces.map((s) => {
      const spacePages = pagesBySpace.get(s.id) || [];
      const pageTree = buildPageTree(spacePages);

      return {
        id: s.id,
        orgId: s.orgId,
        name: s.name,
        description: s.description,
        icon: s.icon,
        defaultRole: s.defaultRole as SpaceDefaultRole,
        sortOrder: s.sortOrder,
        isArchived: s.isArchived,
        createdBy: s.createdBy,
        createdAt: s.createdAt as unknown as string,
        pages: pageTree,
      };
    });
  } catch {
    return [];
  }
}

// ─── Get Single Space ────────────────────────────────────

export async function getSpace(spaceId: string): Promise<Space | null> {
  try {
    const ctx = await getOrgContext();

    const data = await prisma.space.findFirst({
      where: { id: spaceId, orgId: ctx.orgId },
    });

    if (!data) return null;

    return {
      id: data.id,
      orgId: data.orgId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      defaultRole: data.defaultRole as SpaceDefaultRole,
      sortOrder: data.sortOrder,
      isArchived: data.isArchived,
      createdBy: data.createdBy,
      createdAt: data.createdAt as unknown as string,
    };
  } catch {
    return null;
  }
}

// ─── Get Archived Items ──────────────────────────────────

export interface ArchivedItem {
  id: string;
  type: "space" | "page";
  name: string;
  spaceName?: string;
  archivedAt: string;
}

export async function getArchivedItems(): Promise<ArchivedItem[]> {
  try {
    const ctx = await getOrgContext();
    if (ctx.role !== "owner" && ctx.role !== "admin") return [];

    const [spaces, pages] = await Promise.all([
      prisma.space.findMany({
        where: { orgId: ctx.orgId, isArchived: true },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.page.findMany({
        where: { orgId: ctx.orgId, isArchived: true },
        include: { space: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items: ArchivedItem[] = [];

    for (const s of spaces) {
      items.push({
        id: s.id,
        type: "space",
        name: s.name,
        archivedAt: s.createdAt as unknown as string,
      });
    }

    for (const p of pages) {
      items.push({
        id: p.id,
        type: "page",
        name: p.title,
        spaceName: p.space?.name,
        archivedAt: p.createdAt as unknown as string,
      });
    }

    return items;
  } catch {
    return [];
  }
}

// ─── Get Space Members ───────────────────────────────────

export interface SpaceMemberInfo {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: "admin" | "editor" | "viewer";
}

export async function getSpaceMembers(
  spaceId: string
): Promise<SpaceMemberInfo[]> {
  try {
    await getOrgContext();

    const members = await prisma.spaceMember.findMany({
      where: { spaceId },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user?.email || "unknown",
      fullName: m.user?.name || null,
      role: m.role as "admin" | "editor" | "viewer",
    }));
  } catch {
    return [];
  }
}

// ─── Update Space Member ─────────────────────────────────

export async function updateSpaceMember(
  spaceId: string,
  userId: string,
  role: "admin" | "editor" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.spaceMember.updateMany({
      where: { spaceId, userId },
      data: { role },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Add Space Member ────────────────────────────────────

export async function addSpaceMember(
  spaceId: string,
  userId: string,
  role: "admin" | "editor" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.spaceMember.create({
      data: {
        spaceId,
        userId,
        role,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Remove Space Member ─────────────────────────────────

export async function removeSpaceMember(
  spaceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const spaceRole = await getUserSpaceRole(spaceId, ctx.userId);

    if (!canManageSpace(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.spaceMember.deleteMany({
      where: { spaceId, userId },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Helpers ─────────────────────────────────────────────

function buildPageTree(
  pages: {
    id: string;
    spaceId: string;
    parentPageId: string | null;
    title: string;
    sortOrder: number;
    isArchived: boolean;
  }[]
): PageTreeNode[] {
  const nodeMap = new Map<string, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  // Create all nodes
  for (const p of pages) {
    nodeMap.set(p.id, {
      id: p.id,
      spaceId: p.spaceId,
      parentPageId: p.parentPageId,
      title: p.title,
      sortOrder: p.sortOrder,
      isArchived: p.isArchived,
      children: [],
    });
  }

  // Build tree
  for (const node of nodeMap.values()) {
    if (node.parentPageId && nodeMap.has(node.parentPageId)) {
      nodeMap.get(node.parentPageId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children
  const sortNodes = (nodes: PageTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}
