"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantSlug } from "@/lib/tenant.server";

export async function getOrgSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) return null;

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id, name, slug, created_at")
    .eq("slug", tenantSlug)
    .single();

  return org;
}

export async function updateOrgName(
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) return { success: false, error: "No tenant context" };

  const admin = createAdminClient();

  // Check user is owner or admin
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", tenantSlug)
    .single();

  if (!org) return { success: false, error: "Org not found" };

  const { data: membership } = await admin
    .from("org_members")
    .select("default_role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.default_role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  const { error } = await admin
    .from("organizations")
    .update({ name })
    .eq("id", org.id);

  if (error) return { success: false, error: "Failed to update name" };

  return { success: true };
}
