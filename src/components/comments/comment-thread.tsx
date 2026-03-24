"use client";

import { useState } from "react";
import type { Comment, MentionUser } from "@/lib/actions/comments";
import { updateComment, deleteComment } from "@/lib/actions/comments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentForm } from "./comment-form";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Reply } from "lucide-react";

interface CommentThreadProps {
  comments: Comment[];
  currentUserId: string;
  currentUserRole: string;
  members: MentionUser[];
  onNewComment: (
    content: string,
    parentCommentId: string | null,
    mentionedUserIds: string[]
  ) => Promise<void>;
  onRefresh: () => void;
}

export function CommentThread({
  comments,
  currentUserId,
  currentUserRole,
  members,
  onNewComment,
  onRefresh,
}: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          members={members}
          onNewComment={onNewComment}
          onRefresh={onRefresh}
          depth={0}
        />
      ))}

      {comments.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  members,
  onNewComment,
  onRefresh,
  depth,
}: {
  comment: Comment;
  currentUserId: string;
  currentUserRole: string;
  members: MentionUser[];
  onNewComment: (
    content: string,
    parentCommentId: string | null,
    mentionedUserIds: string[]
  ) => Promise<void>;
  onRefresh: () => void;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const canModify =
    comment.authorId === currentUserId ||
    currentUserRole === "owner" ||
    currentUserRole === "admin";

  const displayName = comment.authorName || comment.authorEmail;
  const initial = displayName.charAt(0).toUpperCase();

  async function handleEdit() {
    if (!editContent.trim()) return;
    const result = await updateComment(comment.id, editContent.trim());
    if (result.success) {
      toast.success("Comment updated");
      setEditing(false);
      onRefresh();
    } else {
      toast.error(result.error || "Failed to update");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    const result = await deleteComment(comment.id);
    if (result.success) {
      toast.success("Comment deleted");
      onRefresh();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  async function handleReply(content: string, mentionedUserIds: string[]) {
    await onNewComment(content, comment.id, mentionedUserIds);
    setShowReply(false);
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l pl-4" : ""}>
      <div className="group rounded-lg p-2 hover:bg-muted/50">
        <div className="flex items-start gap-3">
          <Avatar className="mt-0.5 h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && !comment.isDeleted && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {editing ? (
              <div className="mt-2">
                <textarea
                  className="min-h-[60px] w-full resize-none rounded border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <div className="mt-1 flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.isDeleted ? (
                  <span className="italic text-muted-foreground">
                    [deleted]
                  </span>
                ) : (
                  renderCommentContent(comment.content)
                )}
              </div>
            )}

            {/* Actions */}
            {!comment.isDeleted && !editing && (
              <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowReply(!showReply)}
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </Button>

                {canModify && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted">
                      <MoreHorizontal className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditContent(comment.content);
                          setEditing(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReply && (
        <div className="ml-10 mt-2">
          <CommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
            autoFocus
            members={members}
          />
        </div>
      )}

      {/* Nested replies (one level only) */}
      {comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              members={members}
              onNewComment={onNewComment}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function renderCommentContent(content: string): React.ReactNode {
  // Simple inline markdown: **bold**, *italic*, `code`, @mentions
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|@\w+)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1 py-0.5 text-xs font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span key={i} className="font-medium text-primary">
          {part}
        </span>
      );
    }
    return part;
  });
}
