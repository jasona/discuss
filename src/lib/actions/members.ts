"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantSlug } from "@/lib/tenant.server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { OrgRole, PlanType } from "@/lib/constants";
import { nanoid } from "nanoid";

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

async function getOrgMemberCount(orgId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("org_members")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  return count || 0;
}

// ─── Invite Member ───────────────────────────────────────

export async function inviteMember(
  email: string,
  role: "admin" | "editor" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Only owners and admins can invite members" };
    }

    // Check plan limits
    const plan = await getOrgPlan(ctx.orgId);
    const memberCount = await getOrgMemberCount(ctx.orgId);
    const limits = PLAN_LIMITS[plan];

    if (memberCount >= limits.maxUsers) {
      return {
        success: false,
        error: `Your ${plan} plan allows up to ${limits.maxUsers} members. Upgrade to add more.`,
      };
    }

    const admin = createAdminClient();

    // Check if already a member
    const { data: existingUsers } = await admin
      .from("org_members")
      .select("user_id, ...auth_users:user_id(email)")
      .eq("org_id", ctx.orgId);

    // Check if already invited
    const { data: existingInvite } = await admin
      .from("invitations")
      .select("id")
      .eq("org_id", ctx.orgId)
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return { success: false, error: "An invitation has already been sent to this email" };
    }

    // Create invitation
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: inviteError } = await admin.from("invitations").insert({
      org_id: ctx.orgId,
      email,
      invited_by: ctx.userId,
      default_role: role,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (inviteError) {
      return { success: false, error: "Failed to create invitation" };
    }

    // TODO: Send invitation email (Task 12.5)
    // For now the invitation link is: {APP_URL}/invite/{token}

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Member Role ──────────────────────────────────

export async function updateMemberRole(
  targetUserId: string,
  newRole: "admin" | "editor" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    const admin = createAdminClient();

    // Get target's current role
    const { data: target } = await admin
      .from("org_members")
      .select("default_role")
      .eq("org_id", ctx.orgId)
      .eq("user_id", targetUserId)
      .single();

    if (!target) {
      return { success: false, error: "Member not found" };
    }

    // Can't change the owner's role (must transfer ownership instead)
    if (target.default_role === "owner") {
      return { success: false, error: "Cannot change the owner's role. Use ownership transfer instead." };
    }

    // Only owners can change admin roles
    if (target.default_role === "admin" && ctx.role !== "owner") {
      return { success: false, error: "Only the owner can change an admin's role" };
    }

    const { error } = await admin
      .from("org_members")
      .update({ default_role: newRole })
      .eq("org_id", ctx.orgId)
      .eq("user_id", targetUserId);

    if (error) {
      return { success: false, error: "Failed to update role" };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Remove Member ───────────────────────────────────────

export async function removeMember(
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    // Can't remove yourself
    if (targetUserId === ctx.userId) {
      return { success: false, error: "You cannot remove yourself" };
    }

    const admin = createAdminClient();

    // Get target's role
    const { data: target } = await admin
      .from("org_members")
      .select("default_role")
      .eq("org_id", ctx.orgId)
      .eq("user_id", targetUserId)
      .single();

    if (!target) {
      return { success: false, error: "Member not found" };
    }

    // Can't remove the owner
    if (target.default_role === "owner") {
      return { success: false, error: "Cannot remove the owner" };
    }

    // Only owners can remove admins
    if (target.default_role === "admin" && ctx.role !== "owner") {
      return { success: false, error: "Only the owner can remove admins" };
    }

    // Admins and owners can remove editors/viewers
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Remove from all space_members in this org
    const { data: spaces } = await admin
      .from("spaces")
      .select("id")
      .eq("org_id", ctx.orgId);

    if (spaces && spaces.length > 0) {
      const spaceIds = spaces.map((s) => s.id);
      await admin
        .from("space_members")
        .delete()
        .in("space_id", spaceIds)
        .eq("user_id", targetUserId);
    }

    // Remove from org_members
    const { error } = await admin
      .from("org_members")
      .delete()
      .eq("org_id", ctx.orgId)
      .eq("user_id", targetUserId);

    if (error) {
      return { success: false, error: "Failed to remove member" };
    }

    // Update seat count
    const newCount = await getOrgMemberCount(ctx.orgId);
    await admin
      .from("subscriptions")
      .update({ seat_count: newCount })
      .eq("org_id", ctx.orgId);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Transfer Ownership ──────────────────────────────────

export async function transferOwnership(
  newOwnerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner") {
      return { success: false, error: "Only the owner can transfer ownership" };
    }

    if (newOwnerId === ctx.userId) {
      return { success: false, error: "You are already the owner" };
    }

    const admin = createAdminClient();

    // Verify new owner is an admin
    const { data: target } = await admin
      .from("org_members")
      .select("default_role")
      .eq("org_id", ctx.orgId)
      .eq("user_id", newOwnerId)
      .single();

    if (!target) {
      return { success: false, error: "User is not a member of this organization" };
    }

    if (target.default_role !== "admin") {
      return { success: false, error: "Ownership can only be transferred to an admin" };
    }

    // Swap roles: current owner → admin, target → owner
    const { error: e1 } = await admin
      .from("org_members")
      .update({ default_role: "admin" })
      .eq("org_id", ctx.orgId)
      .eq("user_id", ctx.userId);

    if (e1) {
      return { success: false, error: "Failed to update current owner role" };
    }

    const { error: e2 } = await admin
      .from("org_members")
      .update({ default_role: "owner" })
      .eq("org_id", ctx.orgId)
      .eq("user_id", newOwnerId);

    if (e2) {
      // Rollback
      await admin
        .from("org_members")
        .update({ default_role: "owner" })
        .eq("org_id", ctx.orgId)
        .eq("user_id", ctx.userId);
      return { success: false, error: "Failed to transfer ownership" };
    }

    // Update organizations.owner_id
    await admin
      .from("organizations")
      .update({ owner_id: newOwnerId })
      .eq("id", ctx.orgId);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Revoke Invitation ───────────────────────────────────

export async function revokeInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .eq("org_id", ctx.orgId);

    if (error) {
      return { success: false, error: "Failed to revoke invitation" };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Members List ────────────────────────────────────

export interface OrgMember {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: OrgRole;
  joinedAt: string;
}

export async function getOrgMembers(): Promise<OrgMember[]> {
  try {
    const ctx = await getOrgContext();
    const admin = createAdminClient();

    const { data: members } = await admin
      .from("org_members")
      .select("id, user_id, default_role, joined_at")
      .eq("org_id", ctx.orgId)
      .order("joined_at", { ascending: true });

    if (!members) return [];

    // Fetch user details
    const result: OrgMember[] = [];
    for (const m of members) {
      const { data: userData } = await admin.auth.admin.getUserById(m.user_id);
      result.push({
        id: m.id,
        userId: m.user_id,
        email: userData?.user?.email || "unknown",
        fullName: userData?.user?.user_metadata?.full_name || null,
        role: m.default_role as OrgRole,
        joinedAt: m.joined_at,
      });
    }

    return result;
  } catch {
    return [];
  }
}

// ─── Get Pending Invitations ─────────────────────────────

export interface PendingInvitation {
  id: string;
  email: string;
  role: OrgRole;
  expiresAt: string;
  createdAt: string;
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  try {
    const ctx = await getOrgContext();

    if (ctx.role !== "owner" && ctx.role !== "admin") return [];

    const admin = createAdminClient();
    const { data } = await admin
      .from("invitations")
      .select("id, email, default_role, expires_at, created_at")
      .eq("org_id", ctx.orgId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!data) return [];

    return data.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.default_role as OrgRole,
      expiresAt: inv.expires_at,
      createdAt: inv.created_at,
    }));
  } catch {
    return [];
  }
}
