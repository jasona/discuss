"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantSlug } from "@/lib/tenant.server";
import type { OrgRole } from "@/lib/constants";
import { canViewSpace } from "@/lib/permissions";

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

async function getAccessibleSpaceIds(
  orgId: string,
  userId: string,
  orgRole: OrgRole
): Promise<string[]> {
  const admin = createAdminClient();

  // Owners and admins can see all spaces
  if (orgRole === "owner" || orgRole === "admin") {
    const { data } = await admin
      .from("spaces")
      .select("id")
      .eq("org_id", orgId)
      .eq("is_archived", false);
    return (data || []).map((s) => s.id);
  }

  // Others: spaces with explicit membership or non-none default_role
  const { data: spaces } = await admin
    .from("spaces")
    .select("id, default_role")
    .eq("org_id", orgId)
    .eq("is_archived", false);

  const { data: memberships } = await admin
    .from("space_members")
    .select("space_id")
    .eq("user_id", userId);

  const memberSpaceIds = new Set(
    (memberships || []).map((m) => m.space_id)
  );

  return (spaces || [])
    .filter((s) => memberSpaceIds.has(s.id) || s.default_role !== "none")
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
    const admin = createAdminClient();

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

    // Sanitize query for tsquery — escape special chars and join with &
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
      .filter(Boolean)
      .join(" & ");

    if (!tsQuery) return [];

    // Full-text search using content_tsvector
    const { data, error } = await admin.rpc("search_pages", {
      search_query: tsQuery,
      org_filter: ctx.orgId,
      space_ids: targetSpaceIds,
      result_limit: 20,
    });

    // If the RPC doesn't exist, fall back to a direct query
    if (error) {
      return await searchFallback(admin, query, ctx.orgId, targetSpaceIds);
    }

    if (!data) return [];

    return (data as Array<{
      id: string;
      title: string;
      space_id: string;
      space_name: string;
      space_icon: string | null;
      snippet: string;
      updated_at: string;
    }>).map((r) => ({
      pageId: r.id,
      title: r.title,
      spaceId: r.space_id,
      spaceName: r.space_name,
      spaceIcon: r.space_icon,
      snippet: r.snippet,
      updatedAt: r.updated_at,
    }));
  } catch {
    return [];
  }
}

// Fallback search using ILIKE on title and content_markdown
async function searchFallback(
  admin: ReturnType<typeof createAdminClient>,
  query: string,
  orgId: string,
  spaceIds: string[]
): Promise<SearchResult[]> {
  const pattern = `%${query}%`;

  const { data: pages } = await admin
    .from("pages")
    .select("id, title, space_id, content_markdown, updated_at")
    .eq("org_id", orgId)
    .in("space_id", spaceIds)
    .eq("is_archived", false)
    .or(`title.ilike.${pattern},content_markdown.ilike.${pattern}`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!pages) return [];

  // Fetch space names
  const uniqueSpaceIds = [...new Set(pages.map((p) => p.space_id))];
  const { data: spaces } = await admin
    .from("spaces")
    .select("id, name, icon")
    .in("id", uniqueSpaceIds);

  const spaceMap = new Map(
    (spaces || []).map((s) => [s.id, { name: s.name, icon: s.icon }])
  );

  return pages.map((p) => {
    const space = spaceMap.get(p.space_id) || { name: "", icon: null };
    const snippet = extractSnippet(p.content_markdown || "", query);
    return {
      pageId: p.id,
      title: p.title,
      spaceId: p.space_id,
      spaceName: space.name,
      spaceIcon: space.icon,
      snippet,
      updatedAt: p.updated_at,
    };
  });
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
    const admin = createAdminClient();

    const accessibleIds = await getAccessibleSpaceIds(
      ctx.orgId,
      ctx.userId,
      ctx.role
    );

    if (accessibleIds.length === 0) return [];

    const pattern = `%${query}%`;
    const results: NavigationResult[] = [];

    // Search spaces by name
    const { data: spaces } = await admin
      .from("spaces")
      .select("id, name, icon")
      .eq("org_id", ctx.orgId)
      .eq("is_archived", false)
      .in("id", accessibleIds)
      .ilike("name", pattern)
      .limit(5);

    for (const s of spaces || []) {
      results.push({
        id: s.id,
        type: "space",
        name: s.name,
        icon: s.icon,
      });
    }

    // Search pages by title
    const { data: pages } = await admin
      .from("pages")
      .select("id, title, space_id, spaces!inner(name, icon)")
      .eq("org_id", ctx.orgId)
      .eq("is_archived", false)
      .in("space_id", accessibleIds)
      .ilike("title", pattern)
      .limit(8);

    for (const p of pages || []) {
      const space = p.spaces as unknown as { name: string; icon: string | null };
      results.push({
        id: p.id,
        type: "page",
        name: p.title,
        spaceId: p.space_id,
        spaceName: space?.name,
        icon: space?.icon,
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

    const admin = createAdminClient();
    const { data } = await admin
      .from("spaces")
      .select("id, name, icon")
      .in("id", accessibleIds)
      .eq("is_archived", false)
      .order("name");

    return (data || []).map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
    }));
  } catch {
    return [];
  }
}
