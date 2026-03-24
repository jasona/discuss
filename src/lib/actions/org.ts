"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (data) {
    return { available: false, error: "This subdomain is already taken" };
  }

  return { available: true };
}

export async function createOrg(
  name: string,
  slug: string
): Promise<CreateOrgResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate slug
  const slugCheck = await checkSlugAvailability(slug);
  if (!slugCheck.available) {
    return { success: false, error: slugCheck.error };
  }

  const admin = createAdminClient();

  // Create the organization
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name, slug, owner_id: user.id })
    .select("id")
    .single();

  if (orgError || !org) {
    return {
      success: false,
      error: orgError?.message || "Failed to create organization",
    };
  }

  // Add the creator as Owner
  const { error: memberError } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    default_role: "owner",
  });

  if (memberError) {
    // Rollback: delete the org
    await admin.from("organizations").delete().eq("id", org.id);
    return { success: false, error: "Failed to add you as owner" };
  }

  // Create a free subscription for the org
  const { error: subError } = await admin.from("subscriptions").insert({
    org_id: org.id,
    plan: "free",
    status: "active",
    seat_count: 1,
  });

  if (subError) {
    console.error("Failed to create subscription:", subError);
    // Non-fatal — org is still usable
  }

  // Set active org in user metadata so JWT hook picks it up
  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { active_org_id: org.id },
  });

  return { success: true, slug };
}
