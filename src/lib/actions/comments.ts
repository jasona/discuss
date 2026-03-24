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

async function getUserSpaceRole(
  spaceId: string,
  userId: string
): Promise<"admin" | "editor" | "viewer" | "none"> {
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("space_members")
    .select("role")
    .eq("space_id", spaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membership) return membership.role as "admin" | "editor" | "viewer";

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

async function canAccessPage(
  pageId: string,
  userId: string,
  orgId: string,
  orgRole: OrgRole
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: page } = await admin
    .from("pages")
    .select("space_id")
    .eq("id", pageId)
    .eq("org_id", orgId)
    .single();

  if (!page) return false;

  const spaceRole = await getUserSpaceRole(page.space_id, userId);
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

    const admin = createAdminClient();

    const { data: comment, error } = await admin
      .from("comments")
      .insert({
        page_id: pageId,
        org_id: ctx.orgId,
        parent_comment_id: parentCommentId || null,
        author_id: ctx.userId,
        content,
      })
      .select("id")
      .single();

    if (error || !comment) {
      return { success: false, error: "Failed to create comment" };
    }

    // Get author info for notification messages
    const { data: authorData } = await admin.auth.admin.getUserById(ctx.userId);
    const authorName =
      authorData?.user?.user_metadata?.full_name ||
      authorData?.user?.email ||
      "Someone";

    // Get page title for notification message
    const { data: page } = await admin
      .from("pages")
      .select("title")
      .eq("id", pageId)
      .single();
    const pageTitle = page?.title || "Untitled";

    // Create mention notifications
    if (mentionedUserIds && mentionedUserIds.length > 0) {
      const mentionNotifications = mentionedUserIds
        .filter((uid) => uid !== ctx.userId)
        .map((uid) => ({
          user_id: uid,
          org_id: ctx.orgId,
          type: "mention" as const,
          reference_id: comment.id,
          page_id: pageId,
          message: `${authorName} mentioned you in "${pageTitle}"`,
        }));

      if (mentionNotifications.length > 0) {
        await admin.from("notifications").insert(mentionNotifications);
      }
    }

    // Create reply notification for parent comment author
    if (parentCommentId) {
      const { data: parentComment } = await admin
        .from("comments")
        .select("author_id")
        .eq("id", parentCommentId)
        .single();

      if (parentComment && parentComment.author_id !== ctx.userId) {
        await admin.from("notifications").insert({
          user_id: parentComment.author_id,
          org_id: ctx.orgId,
          type: "reply" as const,
          reference_id: comment.id,
          page_id: pageId,
          message: `${authorName} replied to your comment in "${pageTitle}"`,
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
    const admin = createAdminClient();

    const { data: comment } = await admin
      .from("comments")
      .select("author_id, org_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.org_id !== ctx.orgId)
      return { success: false, error: "Comment not found" };

    // Only author or admin/owner can edit
    if (
      comment.author_id !== ctx.userId &&
      ctx.role !== "owner" &&
      ctx.role !== "admin"
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    const { error } = await admin
      .from("comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) return { success: false, error: "Failed to update comment" };
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
    const admin = createAdminClient();

    const { data: comment } = await admin
      .from("comments")
      .select("author_id, org_id, parent_comment_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.org_id !== ctx.orgId)
      return { success: false, error: "Comment not found" };

    // Only author or admin/owner can delete
    if (
      comment.author_id !== ctx.userId &&
      ctx.role !== "owner" &&
      ctx.role !== "admin"
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if comment has replies — soft-delete if so
    const { count } = await admin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("parent_comment_id", commentId)
      .eq("is_deleted", false);

    if (count && count > 0) {
      // Soft-delete: mark as deleted but keep for thread structure
      const { error } = await admin
        .from("comments")
        .update({ is_deleted: true, content: "[deleted]" })
        .eq("id", commentId);

      if (error) return { success: false, error: "Failed to delete comment" };
    } else {
      // Hard-delete: no replies, safe to remove
      const { error } = await admin
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) return { success: false, error: "Failed to delete comment" };
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

    const admin = createAdminClient();

    const { data: comments } = await admin
      .from("comments")
      .select("*")
      .eq("page_id", pageId)
      .eq("org_id", ctx.orgId)
      .order("created_at", { ascending: true });

    if (!comments) return [];

    // Fetch author details
    const authorIds = [...new Set(comments.map((c) => c.author_id))];
    const authorMap = new Map<
      string,
      { name: string; email: string }
    >();

    for (const authorId of authorIds) {
      const { data } = await admin.auth.admin.getUserById(authorId);
      authorMap.set(authorId, {
        name: data?.user?.user_metadata?.full_name || "",
        email: data?.user?.email || "unknown",
      });
    }

    // Build threaded structure
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    for (const c of comments) {
      const author = authorMap.get(c.author_id) || {
        name: "",
        email: "unknown",
      };
      const node: Comment = {
        id: c.id,
        pageId: c.page_id,
        parentCommentId: c.parent_comment_id,
        authorId: c.author_id,
        authorName: author.name,
        authorEmail: author.email,
        content: c.content,
        isDeleted: c.is_deleted,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
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
    const admin = createAdminClient();

    const { count } = await admin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId)
      .eq("org_id", ctx.orgId)
      .eq("is_deleted", false);

    return count || 0;
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
    const admin = createAdminClient();

    const { data: members } = await admin
      .from("org_members")
      .select("user_id")
      .eq("org_id", ctx.orgId);

    if (!members) return [];

    const users: MentionUser[] = [];
    for (const m of members) {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      if (data?.user) {
        users.push({
          id: m.user_id,
          name: data.user.user_metadata?.full_name || "",
          email: data.user.email || "unknown",
        });
      }
    }

    return users;
  } catch {
    return [];
  }
}
