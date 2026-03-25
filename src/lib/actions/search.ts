"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import type { OrgRole } from "@/lib/constants";

// ─── Helpers ─────────────────────────────────────────────

async function getAccessibleSpaceIds(
  orgId: string,
  userId: string,
  orgRole: OrgRole
): Promise<string[]> {
  // Owners and admins can see all spaces
  if (orgRole === "owner" || orgRole === "admin") {
    const spaces = await prisma.space.findMany({
      where: { orgId, isArchived: false },
      select: { id: true },
    });
    return spaces.map((s) => s.id);
  }

  // Others: spaces with explicit membership or non-none default_role
  const [spaces, memberships] = await Promise.all([
    prisma.space.findMany({
      where: { orgId, isArchived: false },
      select: { id: true, defaultRole: true },
    }),
    prisma.spaceMember.findMany({
      where: { userId },
      select: { spaceId: true },
    }),
  ]);

  const memberSpaceIds = new Set(memberships.map((m) => m.spaceId));

  return spaces
    .filter((s) => memberSpaceIds.has(s.id) || s.defaultRole !== "none")
    .map((s) => s.id);
}

// ─── Types ───────────────────────────────────────────────

export interface SearchResult {
  pageId: string;
  title: string;
  spaceId: string;
  spaceName: string;
  spaceIcon: string | null;
  snippet: string;
  updatedAt: string;
}

export interface NavigationResult {
  id: string;
  type: "space" | "page";
  name: string;
  spaceId?: string;
  spaceName?: string;
  icon?: string | null;
}

export interface SpaceOption {
  id: string;
  name: string;
  icon: string | null;
}

// ─── Full-Text Search ────────────────────────────────────

export async function searchDocuments(
  query: string,
  spaceId?: string
): Promise<SearchResult[]> {
  try {
    if (!query.trim()) return [];

    const ctx = await getOrgContext();

    // Get accessible spaces for permission filtering
    const accessibleIds = await getAccessibleSpaceIds(
      ctx.orgId,
      ctx.userId,
      ctx.role
    );

    if (accessibleIds.length === 0) return [];

    // If a space filter is set, verify access
    if (spaceId && !accessibleIds.includes(spaceId)) return [];

    const targetSpaceIds = spaceId ? [spaceId] : accessibleIds;

    const pages = await prisma.page.findMany({
      where: {
        orgId: ctx.orgId,
        spaceId: { in: targetSpaceIds },
        isArchived: false,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { contentMarkdown: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        space: { select: { name: true, icon: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return pages.map((p) => ({
      pageId: p.id,
      title: p.title,
      spaceId: p.spaceId,
      spaceName: p.space.name,
      spaceIcon: p.space.icon,
      snippet: extractSnippet(p.contentMarkdown || "", query),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

function extractSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 150);

  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  let snippet = text.slice(start, end).replace(/\n/g, " ");

  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

// ─── Quick Navigation ────────────────────────────────────

export async function quickNavigate(
  query: string
): Promise<NavigationResult[]> {
  try {
    if (!query.trim()) return [];

    const ctx = await getOrgContext();

    const accessibleIds = await getAccessibleSpaceIds(
      ctx.orgId,
      ctx.userId,
      ctx.role
    );

    if (accessibleIds.length === 0) return [];

    const results: NavigationResult[] = [];

    // Search spaces by name
    const spaces = await prisma.space.findMany({
      where: {
        orgId: ctx.orgId,
        isArchived: false,
        id: { in: accessibleIds },
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true, icon: true },
      take: 5,
    });

    for (const s of spaces) {
      results.push({
        id: s.id,
        type: "space",
        name: s.name,
        icon: s.icon,
      });
    }

    // Search pages by title
    const pages = await prisma.page.findMany({
      where: {
        orgId: ctx.orgId,
        isArchived: false,
        spaceId: { in: accessibleIds },
        title: { contains: query, mode: "insensitive" },
      },
      include: {
        space: { select: { name: true, icon: true } },
      },
      take: 8,
    });

    for (const p of pages) {
      results.push({
        id: p.id,
        type: "page",
        name: p.title,
        spaceId: p.spaceId,
        spaceName: p.space.name,
        icon: p.space.icon,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// ─── Get Spaces for Filter ───────────────────────────────

export async function getSearchSpaces(): Promise<SpaceOption[]> {
  try {
    const ctx = await getOrgContext();
    const accessibleIds = await getAccessibleSpaceIds(
      ctx.orgId,
      ctx.userId,
      ctx.role
    );

    if (accessibleIds.length === 0) return [];

    const spaces = await prisma.space.findMany({
      where: {
        id: { in: accessibleIds },
        isArchived: false,
      },
      select: { id: true, name: true, icon: true },
      orderBy: { name: "asc" },
    });

    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
    }));
  } catch {
    return [];
  }
}
