"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getPageComments,
  getCommentCount,
  getOrgMembersForMention,
  createComment,
  type Comment,
  type MentionUser,
} from "@/lib/actions/comments";
import { CommentThread } from "./comment-thread";
import { CommentForm } from "./comment-form";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface CommentsPanelProps {
  pageId: string;
  currentUserId: string;
  currentUserRole: string;
}

export function CommentsPanel({
  pageId,
  currentUserId,
  currentUserRole,
}: CommentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<MentionUser[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCount = useCallback(async () => {
    const c = await getCommentCount(pageId);
    setCount(c);
  }, [pageId]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const [c, m] = await Promise.all([
      getPageComments(pageId),
      getOrgMembersForMention(),
    ]);
    setComments(c);
    setMembers(m);
    setLoading(false);
  }, [pageId]);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, loadComments]);

  async function handleNewComment(
    content: string,
    parentCommentId: string | null,
    mentionedUserIds: string[]
  ) {
    const result = await createComment(
      pageId,
      content,
      parentCommentId,
      mentionedUserIds
    );
    if (result.success) {
      loadComments();
      setCount((c) => c + 1);
    } else {
      toast.error(result.error || "Failed to post comment");
    }
  }

  return (
    <>
      {/* Toggle button */}
      <Button
        variant={open ? "secondary" : "outline"}
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <MessageSquare className="h-4 w-4" />
        Comments
        {count > 0 && (
          <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div className="mt-6 rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">
              Comments {count > 0 && `(${count})`}
            </h3>
            <button
              className="rounded p-1 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <CommentThread
                  comments={comments}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  members={members}
                  onNewComment={handleNewComment}
                  onRefresh={loadComments}
                />

                <div className="mt-4 border-t pt-4">
                  <CommentForm
                    onSubmit={(content, mentionedUserIds) =>
                      handleNewComment(content, null, mentionedUserIds)
                    }
                    members={members}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
