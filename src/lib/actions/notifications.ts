"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import { auth } from "@/lib/auth.config";
import { getTenantSlug } from "@/lib/tenant.server";

// ─── Types ──────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  pageId: string | null;
  referenceId: string | null;
  createdAt: string;
}

// ─── Get Notifications ──────────────────────────────────

export async function getNotifications(
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  const ctx = await getOrgContext();

  const data = await prisma.notification.findMany({
    where: { userId: ctx.userId, orgId: ctx.orgId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      type: true,
      message: true,
      isRead: true,
      pageId: true,
      referenceId: true,
      createdAt: true,
    },
  });

  return data.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    pageId: n.pageId,
    referenceId: n.referenceId,
    createdAt: n.createdAt.toISOString(),
  }));
}

// ─── Get Unread Count ───────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) return 0;

  const membership = await prisma.orgMember.findFirst({
    where: {
      userId: session.user.id,
      organization: { slug: tenantSlug },
    },
    select: { organization: { select: { id: true } } },
  });

  if (!membership) return 0;

  return prisma.notification.count({
    where: {
      userId: session.user.id,
      orgId: membership.organization.id,
      isRead: false,
    },
  });
}

// ─── Mark as Read ───────────────────────────────────────

export async function markAsRead(
  notificationId: string
): Promise<{ success: boolean }> {
  const ctx = await getOrgContext();

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: ctx.userId,
      orgId: ctx.orgId,
    },
    data: { isRead: true },
  });

  return { success: true };
}

// ─── Mark All as Read ───────────────────────────────────

export async function markAllAsRead(): Promise<{ success: boolean }> {
  const ctx = await getOrgContext();

  await prisma.notification.updateMany({
    where: {
      userId: ctx.userId,
      orgId: ctx.orgId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}
