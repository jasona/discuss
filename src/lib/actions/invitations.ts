"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AcceptInviteResult {
  success: boolean;
  orgSlug?: string;
  error?: string;
}

export async function getInvitationByToken(token: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invitations")
    .select("*, organizations(name, slug)")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function acceptInvitation(
  token: string
): Promise<AcceptInviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const admin = createAdminClient();

  // Fetch the invitation
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return {
      success: false,
      error: "Invitation not found, expired, or already accepted",
    };
  }

  // Check if user is already a member
  const { data: existing } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", invitation.org_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Already a member — just redirect
    const org = invitation.organizations as { slug: string };
    return { success: true, orgSlug: org.slug };
  }

  // Add user to org
  const { error: memberError } = await admin.from("org_members").insert({
    org_id: invitation.org_id,
    user_id: user.id,
    default_role: invitation.default_role,
  });

  if (memberError) {
    return { success: false, error: "Failed to join organization" };
  }

  // Mark invitation as accepted
  await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // Update seat count
  const { count } = await admin
    .from("org_members")
    .select("*", { count: "exact", head: true })
    .eq("org_id", invitation.org_id);

  if (count !== null) {
    await admin
      .from("subscriptions")
      .update({ seat_count: count })
      .eq("org_id", invitation.org_id);
  }

  // Set active org
  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { active_org_id: invitation.org_id },
  });

  const org = invitation.organizations as { slug: string };
  return { success: true, orgSlug: org.slug };
}
