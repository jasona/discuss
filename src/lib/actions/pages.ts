"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantSlug } from "@/lib/tenant.server";
import type { OrgRole } from "@/lib/constants";
import { canEditPage, canViewSpace } from "@/lib/permissions";

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

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  const admin = createAdminClient();

  // Check explicit membership
  const { data: membership } = await admin
    .from("space_members")
    .select("role")
    .eq("space_id", spaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membership) return membership.role as "admin" | "editor" | "viewer";

  // Fall back to space default role
  const { data: space } = await admin
    .from("spaces")
    .select("default_role")
    .eq("id", spaceId)
    .single();

  if (space && space.default_role !== "none") {
    return space.default_role as "editor" | "viewer";
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

    const admin = createAdminClient();

    // Get next sort order among siblings
    const { data: lastPage } = await admin
      .from("pages")
      .select("sort_order")
      .eq("space_id", spaceId)
      .eq("org_id", ctx.orgId)
      .is("parent_page_id", parentPageId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastPage?.sort_order ?? -1) + 1;

    const { data: page, error } = await admin
      .from("pages")
      .insert({
        org_id: ctx.orgId,
        space_id: spaceId,
        parent_page_id: parentPageId,
        title: title || "Untitled",
        content_json: {},
        content_markdown: "",
        sort_order: sortOrder,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      })
      .select("id")
      .single();

    if (error || !page) {
      return { success: false, error: "Failed to create page" };
    }

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
    const admin = createAdminClient();

    // Get page to check space membership
    const { data: page } = await admin
      .from("pages")
      .select("space_id")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const updateData: Record<string, unknown> = {
      updated_by: ctx.userId,
    };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.contentJson !== undefined)
      updateData.content_json = updates.contentJson;
    if (updates.contentMarkdown !== undefined)
      updateData.content_markdown = updates.contentMarkdown;

    const { error } = await admin
      .from("pages")
      .update(updateData)
      .eq("id", pageId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to update page" };
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
    const admin = createAdminClient();

    const { data: page } = await admin
      .from("pages")
      .select("space_id")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Recursively archive this page and all sub-pages
    await archivePageRecursive(admin, pageId, ctx.orgId);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

async function archivePageRecursive(
  admin: ReturnType<typeof createAdminClient>,
  pageId: string,
  orgId: string
) {
  // Archive the page itself
  await admin
    .from("pages")
    .update({ is_archived: true })
    .eq("id", pageId)
    .eq("org_id", orgId);

  // Find and archive child pages
  const { data: children } = await admin
    .from("pages")
    .select("id")
    .eq("parent_page_id", pageId)
    .eq("org_id", orgId)
    .eq("is_archived", false);

  for (const child of children || []) {
    await archivePageRecursive(admin, child.id, orgId);
  }
}

// ─── Restore Page ────────────────────────────────────────

export async function restorePage(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();
    const admin = createAdminClient();

    const { data: page } = await admin
      .from("pages")
      .select("space_id")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return { success: false, error: "Page not found" };

    const spaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const { error } = await admin
      .from("pages")
      .update({ is_archived: false })
      .eq("id", pageId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to restore page" };
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
    const admin = createAdminClient();

    const { data: page } = await admin
      .from("pages")
      .select("space_id, is_archived")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return { success: false, error: "Page not found" };
    if (!page.is_archived) {
      return { success: false, error: "Page must be archived before deletion" };
    }

    const spaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
    if (!canEditPage(ctx.role, spaceRole)) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Re-parent children to this page's parent (or make them root)
    const { data: pageData } = await admin
      .from("pages")
      .select("parent_page_id")
      .eq("id", pageId)
      .single();

    await admin
      .from("pages")
      .update({ parent_page_id: pageData?.parent_page_id ?? null })
      .eq("parent_page_id", pageId)
      .eq("org_id", ctx.orgId);

    // Delete comments on this page
    await admin.from("comments").delete().eq("page_id", pageId);

    // Delete the page
    const { error } = await admin
      .from("pages")
      .delete()
      .eq("id", pageId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to delete page" };
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
    const admin = createAdminClient();

    // Check permissions on source page
    const { data: page } = await admin
      .from("pages")
      .select("space_id")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return { success: false, error: "Page not found" };

    const sourceSpaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
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
        const { data: parent }: { data: { parent_page_id: string | null } | null } = await admin
          .from("pages")
          .select("parent_page_id")
          .eq("id", checkId)
          .single();
        checkId = parent?.parent_page_id ?? null;
      }
    }

    // Get next sort order in target location
    const { data: lastPage } = await admin
      .from("pages")
      .select("sort_order")
      .eq("space_id", newSpaceId)
      .is("parent_page_id", newParentPageId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastPage?.sort_order ?? -1) + 1;

    const { error } = await admin
      .from("pages")
      .update({
        space_id: newSpaceId,
        parent_page_id: newParentPageId,
        sort_order: sortOrder,
      })
      .eq("id", pageId)
      .eq("org_id", ctx.orgId);

    if (error) return { success: false, error: "Failed to move page" };
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

    const admin = createAdminClient();

    // Update sort_order for each page
    for (let i = 0; i < orderedPageIds.length; i++) {
      await admin
        .from("pages")
        .update({ sort_order: i, parent_page_id: parentPageId })
        .eq("id", orderedPageIds[i])
        .eq("space_id", spaceId)
        .eq("org_id", ctx.orgId);
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
    const admin = createAdminClient();

    const { data } = await admin
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!data) return null;

    // Check permissions
    const spaceRole = await getUserSpaceRole(data.space_id, ctx.userId);
    if (!canViewSpace(ctx.role, spaceRole)) return null;

    return {
      id: data.id,
      orgId: data.org_id,
      spaceId: data.space_id,
      parentPageId: data.parent_page_id,
      title: data.title,
      contentJson: data.content_json as Record<string, unknown>,
      contentMarkdown: data.content_markdown,
      sortOrder: data.sort_order,
      isArchived: data.is_archived,
      isExternallyShared: data.is_externally_shared,
      externalShareSlug: data.external_share_slug,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
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

    const admin = createAdminClient();
    const { data } = await admin
      .from("pages")
      .select("*")
      .eq("space_id", spaceId)
      .eq("org_id", ctx.orgId)
      .eq("is_archived", false)
      .is("parent_page_id", null)
      .order("sort_order", { ascending: true });

    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      orgId: d.org_id,
      spaceId: d.space_id,
      parentPageId: d.parent_page_id,
      title: d.title,
      contentJson: d.content_json as Record<string, unknown>,
      contentMarkdown: d.content_markdown,
      sortOrder: d.sort_order,
      isArchived: d.is_archived,
      isExternallyShared: d.is_externally_shared,
      externalShareSlug: d.external_share_slug,
      createdBy: d.created_by,
      updatedBy: d.updated_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
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
    const admin = createAdminClient();

    const breadcrumbs: PageBreadcrumb[] = [];
    let currentId: string | null = pageId;

    while (currentId) {
      const { data }: { data: { id: string; title: string; parent_page_id: string | null } | null } = await admin
        .from("pages")
        .select("id, title, parent_page_id")
        .eq("id", currentId)
        .eq("org_id", ctx.orgId)
        .single();

      if (!data) break;

      breadcrumbs.unshift({ id: data.id, title: data.title });
      currentId = data.parent_page_id;
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
    const admin = createAdminClient();

    const { data: page } = await admin
      .from("pages")
      .select("space_id")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return false;

    const spaceRole = await getUserSpaceRole(page.space_id, ctx.userId);
    return canEditPage(ctx.role, spaceRole);
  } catch {
    return false;
  }
}

// ─── Get Page Author Info ────────────────────────────────

export interface PageAuthorInfo {
  updatedByName: string | null;
  orgId: string;
}

export async function getPageAuthorInfo(
  pageId: string
): Promise<PageAuthorInfo | null> {
  try {
    const ctx = await getOrgContext();
    const admin = createAdminClient();

    const { data: page } = await admin
      .from("pages")
      .select("updated_by")
      .eq("id", pageId)
      .eq("org_id", ctx.orgId)
      .single();

    if (!page) return null;

    const { data: userData } = await admin.auth.admin.getUserById(
      page.updated_by
    );

    return {
      updatedByName:
        userData?.user?.user_metadata?.full_name ||
        userData?.user?.email ||
        null,
      orgId: ctx.orgId,
    };
  } catch {
    return null;
  }
}
