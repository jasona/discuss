"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export interface AcceptInviteResult {
  success: boolean;
  orgSlug?: string;
  error?: string;
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findFirst({
    where: {
      token,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      organization: { select: { name: true, slug: true } },
    },
  });

  return invitation;
}

export async function acceptInvitation(
  token: string
): Promise<AcceptInviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    return {
      success: false,
      error: "Invitation not found, expired, or already accepted",
    };
  }

  // Check if user is already a member
  const existing = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: { orgId: invitation.orgId, userId: session.user.id },
    },
  });

  if (existing) {
    return { success: true, orgSlug: invitation.organization.slug };
  }

  // Add user to org
  await prisma.orgMember.create({
    data: {
      orgId: invitation.orgId,
      userId: session.user.id,
      defaultRole: invitation.defaultRole,
    },
  });

  // Mark invitation as accepted
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  // Update seat count
  const count = await prisma.orgMember.count({
    where: { orgId: invitation.orgId },
  });
  await prisma.subscription.updateMany({
    where: { orgId: invitation.orgId },
    data: { seatCount: count },
  });

  return { success: true, orgSlug: invitation.organization.slug };
}
