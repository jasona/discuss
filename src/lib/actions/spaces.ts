"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantSlug } from "@/lib/tenant.server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { OrgRole, PlanType, SpaceDefaultRole } from "@/lib/constants";
import { canManageSpace } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) throw new Error("No tenant context");

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", tenantSlug)
    .single();

  if (!org) throw new Error("Organization not found");

  const { data: membership } = await admin
    .from("org_members")
    .select("default_role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) throw new Error("Not a member of this organization");

  return {
    userId: user.id,
    orgId: org.id,
    role: membership.default_role as OrgRole,
  };
}

async function getOrgPlan(orgId: string): Promise<PlanType> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("org_id", orgId)
    .single();

  return (data?.plan as PlanType) || "free";
}

async function getSpaceCount(orgId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("spaces")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("is_archived", false);

  return count || 0;
}

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("space_members")
    .select("role")
    .eq("space_id", spaceId)
    .eq("user_id", userId)
    .maybeSingle();

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

    const admin = createAdminClient();

    // Get next sort order
    const { data: lastSpace } = await admin
      .from("spaces")
      .select("sort_order")
      .eq("org_id", ctx.orgId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastSpace?.sort_order ?? -1) + 1;

    const { data: space, error } = await admin
      .from("spaces")
      .insert({
        org_id: ctx.orgId,
        name,
        description,
        icon,
        default_role: defaultRole,
        sort_order: sortOrder,
        created_by: ctx.userId,
      })
      .select("id")
      .single();

    if (error || !space) {
      return { success: false, error: "Failed to create space" };
    }

    // Add creator as space admin
    await admin.from("space_members").insert({
      space_id: space.id,
      user_id: ctx.userId,
      role: "admin",
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

    const admin = createAdminClient();
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.defaultRole !== undefined) updateData.default_role = updates.defaultRole;

    const { error } = await admin
      .from("spaces")
      .update(updateData)
      .eq("id", spaceId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to update space" };

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

    const admin = createAdminClient();
    const { error } = await admin
      .from("spaces")
      .update({ is_archived: true })
      .eq("id", spaceId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to archive space" };

    // Also archive all pages in this space
    await admin
      .from("pages")
      .update({ is_archived: true })
      .eq("space_id", spaceId)
      .eq("org_id", ctx.orgId);

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

    const admin = createAdminClient();
    const { error } = await admin
      .from("spaces")
      .update({ is_archived: false })
      .eq("id", spaceId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to restore space" };

    // Restore pages in this space
    await admin
      .from("pages")
      .update({ is_archived: false })
      .eq("space_id", spaceId)
      .eq("org_id", ctx.orgId);

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

    const admin = createAdminClient();

    // Only allow deletion of archived spaces
    const { data: space } = await admin
      .from("spaces")
      .select("is_archived")
      .eq("id", spaceId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!space) return { success: false, error: "Space not found" };
    if (!space.is_archived) {
      return { success: false, error: "Space must be archived before deletion" };
    }

    // Delete all pages in this space
    await admin.from("pages").delete().eq("space_id", spaceId);
    // Delete space members
    await admin.from("space_members").delete().eq("space_id", spaceId);
    // Delete the space
    const { error } = await admin.from("spaces").delete().eq("id", spaceId);

    if (error) return { success: false, error: "Failed to delete space" };

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Spaces with Page Trees ─────────────────────────

export async function getSpacesWithPages(): Promise<SpaceWithPages[]> {
  try {
    const ctx = await getOrgContext();
    const admin = createAdminClient();

    // Fetch all non-archived spaces for this org
    const { data: spaces } = await admin
      .from("spaces")
      .select("*")
      .eq("org_id", ctx.orgId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });

    if (!spaces) return [];

    // Fetch all non-archived pages for this org
    const { data: pages } = await admin
      .from("pages")
      .select("id, space_id, parent_page_id, title, sort_order, is_archived")
      .eq("org_id", ctx.orgId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });

    // Get user's space memberships for filtering
    const { data: memberships } = await admin
      .from("space_members")
      .select("space_id, role")
      .eq("user_id", ctx.userId);

    const membershipMap = new Map(
      (memberships || []).map((m) => [m.space_id, m.role])
    );

    // Filter spaces: user can see if they're owner/admin, or have space membership, or space has a default_role
    const visibleSpaces = spaces.filter((s) => {
      if (ctx.role === "owner" || ctx.role === "admin") return true;
      if (membershipMap.has(s.id)) return true;
      return s.default_role !== "none";
    });

    // Build page trees per space
    const pagesBySpace = new Map<string, typeof pages>();
    for (const page of pages || []) {
      const list = pagesBySpace.get(page.space_id) || [];
      list.push(page);
      pagesBySpace.set(page.space_id, list);
    }

    return visibleSpaces.map((s) => {
      const spacePages = pagesBySpace.get(s.id) || [];
      const pageTree = buildPageTree(spacePages);

      return {
        id: s.id,
        orgId: s.org_id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        defaultRole: s.default_role as SpaceDefaultRole,
        sortOrder: s.sort_order,
        isArchived: s.is_archived,
        createdBy: s.created_by,
        createdAt: s.created_at,
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
    const admin = createAdminClient();

    const { data } = await admin
      .from("spaces")
      .select("*")
      .eq("id", spaceId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      orgId: data.org_id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      defaultRole: data.default_role as SpaceDefaultRole,
      sortOrder: data.sort_order,
      isArchived: data.is_archived,
      createdBy: data.created_by,
      createdAt: data.created_at,
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

    const admin = createAdminClient();

    const [{ data: spaces }, { data: pages }] = await Promise.all([
      admin
        .from("spaces")
        .select("id, name, created_at")
        .eq("org_id", ctx.orgId)
        .eq("is_archived", true)
        .order("created_at", { ascending: false }),
      admin
        .from("pages")
        .select("id, title, space_id, created_at, spaces!inner(name)")
        .eq("org_id", ctx.orgId)
        .eq("is_archived", true)
        .order("created_at", { ascending: false }),
    ]);

    const items: ArchivedItem[] = [];

    for (const s of spaces || []) {
      items.push({
        id: s.id,
        type: "space",
        name: s.name,
        archivedAt: s.created_at,
      });
    }

    for (const p of pages || []) {
      const spaceName = (p.spaces as unknown as { name: string })?.name;
      items.push({
        id: p.id,
        type: "page",
        name: p.title,
        spaceName,
        archivedAt: p.created_at,
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
    const ctx = await getOrgContext();
    const admin = createAdminClient();

    const { data: members } = await admin
      .from("space_members")
      .select("id, user_id, role")
      .eq("space_id", spaceId);

    if (!members) return [];

    const result: SpaceMemberInfo[] = [];
    for (const m of members) {
      const { data: userData } = await admin.auth.admin.getUserById(m.user_id);
      result.push({
        id: m.id,
        userId: m.user_id,
        email: userData?.user?.email || "unknown",
        fullName: userData?.user?.user_metadata?.full_name || null,
        role: m.role as "admin" | "editor" | "viewer",
      });
    }

    return result;
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

    const admin = createAdminClient();
    const { error } = await admin
      .from("space_members")
      .update({ role })
      .eq("space_id", spaceId)
      .eq("user_id", userId);

    if (error) return { success: false, error: "Failed to update role" };
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

    const admin = createAdminClient();
    const { error } = await admin.from("space_members").insert({
      space_id: spaceId,
      user_id: userId,
      role,
    });

    if (error) return { success: false, error: "Failed to add member" };
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

    const admin = createAdminClient();
    const { error } = await admin
      .from("space_members")
      .delete()
      .eq("space_id", spaceId)
      .eq("user_id", userId);

    if (error) return { success: false, error: "Failed to remove member" };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Helpers ─────────────────────────────────────────────

function buildPageTree(
  pages: {
    id: string;
    space_id: string;
    parent_page_id: string | null;
    title: string;
    sort_order: number;
    is_archived: boolean;
  }[]
): PageTreeNode[] {
  const nodeMap = new Map<string, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  // Create all nodes
  for (const p of pages) {
    nodeMap.set(p.id, {
      id: p.id,
      spaceId: p.space_id,
      parentPageId: p.parent_page_id,
      title: p.title,
      sortOrder: p.sort_order,
      isArchived: p.is_archived,
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
