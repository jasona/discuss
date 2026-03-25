"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import { PLAN_LIMITS } from "@/lib/constants";
import type { OrgRole, PlanType } from "@/lib/constants";
import { nanoid } from "nanoid";

// ─── Helpers ─────────────────────────────────────────────

async function getOrgPlan(orgId: string): Promise<PlanType> {
  const sub = await prisma.subscription.findUnique({
    where: { orgId },
    select: { plan: true },
  });
  return (sub?.plan as unknown as PlanType) || "free";
}

async function getOrgMemberCount(orgId: string): Promise<number> {
  return prisma.orgMember.count({ where: { orgId } });
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

    const plan = await getOrgPlan(ctx.orgId);
    const memberCount = await getOrgMemberCount(ctx.orgId);
    const limits = PLAN_LIMITS[plan];

    if (memberCount >= limits.maxUsers) {
      return {
        success: false,
        error: `Your ${plan} plan allows up to ${limits.maxUsers} members. Upgrade to add more.`,
      };
    }

    // Check if already invited
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        orgId: ctx.orgId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return { success: false, error: "An invitation has already been sent to this email" };
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.invitation.create({
      data: {
        orgId: ctx.orgId,
        email,
        invitedBy: ctx.userId,
        defaultRole: role,
        token,
        expiresAt,
      },
    });

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

    const target = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: ctx.orgId, userId: targetUserId } },
    });

    if (!target) return { success: false, error: "Member not found" };
    if (target.defaultRole === "owner") {
      return { success: false, error: "Cannot change the owner's role. Use ownership transfer instead." };
    }
    if (target.defaultRole === "admin" && ctx.role !== "owner") {
      return { success: false, error: "Only the owner can change an admin's role" };
    }

    await prisma.orgMember.update({
      where: { orgId_userId: { orgId: ctx.orgId, userId: targetUserId } },
      data: { defaultRole: newRole },
    });

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

    if (targetUserId === ctx.userId) {
      return { success: false, error: "You cannot remove yourself" };
    }

    const target = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: ctx.orgId, userId: targetUserId } },
    });

    if (!target) return { success: false, error: "Member not found" };
    if (target.defaultRole === "owner") return { success: false, error: "Cannot remove the owner" };
    if (target.defaultRole === "admin" && ctx.role !== "owner") {
      return { success: false, error: "Only the owner can remove admins" };
    }
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Remove from space_members in this org
    const spaces = await prisma.space.findMany({
      where: { orgId: ctx.orgId },
      select: { id: true },
    });
    const spaceIds = spaces.map((s) => s.id);

    if (spaceIds.length > 0) {
      await prisma.spaceMember.deleteMany({
        where: { spaceId: { in: spaceIds }, userId: targetUserId },
      });
    }

    await prisma.orgMember.delete({
      where: { orgId_userId: { orgId: ctx.orgId, userId: targetUserId } },
    });

    const newCount = await getOrgMemberCount(ctx.orgId);
    await prisma.subscription.updateMany({
      where: { orgId: ctx.orgId },
      data: { seatCount: newCount },
    });

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

    if (ctx.role !== "owner") return { success: false, error: "Only the owner can transfer ownership" };
    if (newOwnerId === ctx.userId) return { success: false, error: "You are already the owner" };

    const target = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: ctx.orgId, userId: newOwnerId } },
    });

    if (!target) return { success: false, error: "User is not a member of this organization" };
    if (target.defaultRole !== "admin") {
      return { success: false, error: "Ownership can only be transferred to an admin" };
    }

    await prisma.$transaction([
      prisma.orgMember.update({
        where: { orgId_userId: { orgId: ctx.orgId, userId: ctx.userId } },
        data: { defaultRole: "admin" },
      }),
      prisma.orgMember.update({
        where: { orgId_userId: { orgId: ctx.orgId, userId: newOwnerId } },
        data: { defaultRole: "owner" },
      }),
      prisma.organization.update({
        where: { id: ctx.orgId },
        data: { ownerId: newOwnerId },
      }),
    ]);

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

    await prisma.invitation.delete({
      where: { id: invitationId, orgId: ctx.orgId },
    });

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

    const members = await prisma.orgMember.findMany({
      where: { orgId: ctx.orgId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      fullName: m.user.name,
      role: m.defaultRole as unknown as OrgRole,
      joinedAt: m.joinedAt.toISOString(),
    }));
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

    const invites = await prisma.invitation.findMany({
      where: {
        orgId: ctx.orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return invites.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.defaultRole as unknown as OrgRole,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
