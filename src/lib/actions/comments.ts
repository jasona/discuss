"use server";

import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/actions/context";
import type { OrgRole } from "@/lib/constants";
import { canViewSpace } from "@/lib/permissions";

// ─── Helpers ─────────────────────────────────────────────

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  const membership = await prisma.spaceMember.findUnique({
    where: {
      spaceId_userId: { spaceId, userId },
    },
    select: { role: true },
  });

  if (membership) return membership.role as "admin" | "editor" | "viewer";

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { defaultRole: true },
  });

  if (space && space.defaultRole !== "none") {
    return space.defaultRole as "editor" | "viewer";
  }

  return "none";
}

async function canAccessPage(
  pageId: string,
  userId: string,
  orgId: string,
  orgRole: OrgRole
): Promise<boolean> {
  const page = await prisma.page.findFirst({
    where: { id: pageId, orgId },
    select: { spaceId: true },
  });

  if (!page) return false;

  const spaceRole = await getUserSpaceRole(page.spaceId, userId);
  return canViewSpace(orgRole, spaceRole);
}

// ─── Types ───────────────────────────────────────────────

export interface Comment {
  id: string;
  pageId: string;
  parentCommentId: string | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

// ─── Create Comment ──────────────────────────────────────

export async function createComment(
  pageId: string,
  content: string,
  parentCommentId?: string | null,
  mentionedUserIds?: string[]
): Promise<{ success: boolean; error?: string; commentId?: string }> {
  try {
    const ctx = await getOrgContext();

    if (!(await canAccessPage(pageId, ctx.userId, ctx.orgId, ctx.role))) {
      return { success: false, error: "You don't have access to this page" };
    }

    const comment = await prisma.comment.create({
      data: {
        pageId,
        orgId: ctx.orgId,
        parentCommentId: parentCommentId || null,
        authorId: ctx.userId,
        content,
      },
      select: { id: true },
    });

    // Get author info for notification messages
    const author = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true, email: true },
    });
    const authorName = author?.name || author?.email || "Someone";

    // Get page title for notification message
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { title: true },
    });
    const pageTitle = page?.title || "Untitled";

    // Create mention notifications
    if (mentionedUserIds && mentionedUserIds.length > 0) {
      const mentionData = mentionedUserIds
        .filter((uid) => uid !== ctx.userId)
        .map((uid) => ({
          userId: uid,
          orgId: ctx.orgId,
          type: "mention" as const,
          referenceId: comment.id,
          pageId,
          message: `${authorName} mentioned you in "${pageTitle}"`,
        }));

      if (mentionData.length > 0) {
        await prisma.notification.createMany({ data: mentionData });
      }
    }

    // Create reply notification for parent comment author
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { authorId: true },
      });

      if (parentComment && parentComment.authorId !== ctx.userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            orgId: ctx.orgId,
            type: "reply",
            referenceId: comment.id,
            pageId,
            message: `${authorName} replied to your comment in "${pageTitle}"`,
          },
        });
      }
    }

    return { success: true, commentId: comment.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Comment ──────────────────────────────────────

export async function updateComment(
  commentId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, orgId: true },
    });

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.orgId !== ctx.orgId)
      return { success: false, error: "Comment not found" };

    // Only author or admin/owner can edit
    if (
      comment.authorId !== ctx.userId &&
      ctx.role !== "owner" &&
      ctx.role !== "admin"
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content, updatedAt: new Date() },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Delete Comment ──────────────────────────────────────

export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getOrgContext();

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, orgId: true, parentCommentId: true },
    });

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.orgId !== ctx.orgId)
      return { success: false, error: "Comment not found" };

    // Only author or admin/owner can delete
    if (
      comment.authorId !== ctx.userId &&
      ctx.role !== "owner" &&
      ctx.role !== "admin"
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if comment has replies — soft-delete if so
    const replyCount = await prisma.comment.count({
      where: { parentCommentId: commentId, isDeleted: false },
    });

    if (replyCount > 0) {
      // Soft-delete: mark as deleted but keep for thread structure
      await prisma.comment.update({
        where: { id: commentId },
        data: { isDeleted: true, content: "[deleted]" },
      });
    } else {
      // Hard-delete: no replies, safe to remove
      await prisma.comment.delete({
        where: { id: commentId },
      });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Comments for Page ───────────────────────────────

export async function getPageComments(pageId: string): Promise<Comment[]> {
  try {
    const ctx = await getOrgContext();

    if (!(await canAccessPage(pageId, ctx.userId, ctx.orgId, ctx.role))) {
      return [];
    }

    const comments = await prisma.comment.findMany({
      where: { pageId, orgId: ctx.orgId },
      include: {
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build threaded structure
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    for (const c of comments) {
      const node: Comment = {
        id: c.id,
        pageId: c.pageId,
        parentCommentId: c.parentCommentId,
        authorId: c.authorId,
        authorName: c.author.name || "",
        authorEmail: c.author.email || "unknown",
        content: c.content,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        replies: [],
      };
      commentMap.set(c.id, node);
    }

    for (const node of commentMap.values()) {
      if (node.parentCommentId && commentMap.has(node.parentCommentId)) {
        commentMap.get(node.parentCommentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  } catch {
    return [];
  }
}

// ─── Get Comment Count ───────────────────────────────────

export async function getCommentCount(pageId: string): Promise<number> {
  try {
    const ctx = await getOrgContext();

    return await prisma.comment.count({
      where: { pageId, orgId: ctx.orgId, isDeleted: false },
    });
  } catch {
    return 0;
  }
}

// ─── Get Org Members for @mentions ───────────────────────

export interface MentionUser {
  id: string;
  name: string;
  email: string;
}

export async function getOrgMembersForMention(): Promise<MentionUser[]> {
  try {
    const ctx = await getOrgContext();

    const members = await prisma.orgMember.findMany({
      where: { orgId: ctx.orgId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name || "",
      email: m.user.email || "unknown",
    }));
  } catch {
    return [];
  }
}
