"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import type { MentionUser } from "@/lib/actions/comments";
import { Send } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string, mentionedUserIds: string[]) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  members: MentionUser[];
}

export function CommentForm({
  onSubmit,
  placeholder = "Write a comment...",
  autoFocus = false,
  members,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionAnchor, setMentionAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const filteredMembers =
    mentionQuery !== null
      ? members.filter(
          (m) =>
            m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(mentionQuery.toLowerCase())
        )
      : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (mentionQuery !== null && filteredMembers.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMentionIndex((i) => (i + 1) % filteredMembers.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMentionIndex(
            (i) => (i - 1 + filteredMembers.length) % filteredMembers.length
          );
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          insertMention(filteredMembers[mentionIndex]);
          return;
        }
        if (e.key === "Escape") {
          setMentionQuery(null);
          setMentionAnchor(null);
          return;
        }
      }

      // Ctrl/Cmd+Enter to submit
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [mentionQuery, filteredMembers, mentionIndex]
  );

  function insertMention(user: MentionUser) {
    if (!textareaRef.current) return;

    const ta = textareaRef.current;
    const pos = ta.selectionStart;
    const text = content;

    // Find the @ that started this mention
    let atPos = pos - 1;
    while (atPos >= 0 && text[atPos] !== "@") atPos--;

    const before = text.slice(0, atPos);
    const after = text.slice(pos);
    const displayName = user.name || user.email;
    const newContent = `${before}@${displayName} ${after}`;

    setContent(newContent);
    setMentionedIds((ids) =>
      ids.includes(user.id) ? ids : [...ids, user.id]
    );
    setMentionQuery(null);
    setMentionAnchor(null);

    // Restore cursor position
    requestAnimationFrame(() => {
      const newPos = atPos + displayName.length + 2; // @name + space
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    setContent(value);

    // Detect @mention trigger
    const textBefore = value.slice(0, pos);
    const atMatch = textBefore.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
      // Position the popover near the cursor
      setMentionAnchor({ top: 0, left: 0 });
    } else {
      setMentionQuery(null);
      setMentionAnchor(null);
    }
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(content.trim(), mentionedIds);
    setContent("");
    setMentionedIds([]);
    setSubmitting(false);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="min-h-[80px] w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        placeholder={placeholder}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />

      {/* @mention dropdown */}
      {mentionQuery !== null && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-1 max-h-48 w-64 overflow-y-auto rounded-lg border bg-popover shadow-md">
          {filteredMembers.slice(0, 8).map((user, i) => (
            <button
              key={user.id}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent ${
                i === mentionIndex ? "bg-accent" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user);
              }}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                {user.name && (
                  <p className="truncate text-sm font-medium">{user.name}</p>
                )}
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          **bold** *italic* `code` — Ctrl+Enter to submit
        </p>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Sending..." : "Comment"}
        </Button>
      </div>
    </div>
  );
}
