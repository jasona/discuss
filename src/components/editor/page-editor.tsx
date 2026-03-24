"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { updatePage, type Page } from "@/lib/actions/pages";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PageEditorProps {
  page: Page;
}

export function PageEditor({ page }: PageEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [markdown, setMarkdown] = useState(page.contentMarkdown);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageIdRef = useRef(page.id);

  // Reset state when page changes
  useEffect(() => {
    if (page.id !== pageIdRef.current) {
      pageIdRef.current = page.id;
      setTitle(page.title);
      setMarkdown(page.contentMarkdown);
      setSaveStatus("saved");
    }
  }, [page]);

  const save = useCallback(
    async (newTitle: string, newMarkdown: string) => {
      setSaveStatus("saving");
      const result = await updatePage(page.id, {
        title: newTitle,
        contentMarkdown: newMarkdown,
        contentJson: { type: "markdown", content: newMarkdown },
      });

      if (result.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
        toast.error(result.error || "Failed to save");
      }
    },
    [page.id]
  );

  const debouncedSave = useCallback(
    (newTitle: string, newMarkdown: string) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        save(newTitle, newMarkdown);
      }, 1500);
    },
    [save]
  );

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    debouncedSave(newTitle, markdown);
  }

  function handleContentChange(newMarkdown: string) {
    setMarkdown(newMarkdown);
    debouncedSave(title, newMarkdown);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-end">
        <span
          className={`text-xs ${
            saveStatus === "saved"
              ? "text-muted-foreground"
              : saveStatus === "saving"
                ? "text-yellow-600"
                : "text-orange-600"
          }`}
        >
          {saveStatus === "saved"
            ? "Saved"
            : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved changes"}
        </span>
      </div>

      <input
        className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled"
      />

      <div className="mt-6">
        <textarea
          className="min-h-[60vh] w-full resize-none border-none bg-transparent font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
          value={markdown}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
}
