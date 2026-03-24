"use client";

import type { Page } from "@/lib/actions/pages";
import { TiptapEditor } from "./tiptap-editor";
import { markdownToHtml } from "@/lib/editor/markdown";

interface PageViewerProps {
  page: Page;
}

export function PageViewer({ page }: PageViewerProps) {
  const html = page.contentMarkdown
    ? markdownToHtml(page.contentMarkdown)
    : "";

  return (
    <div>
      <h1 className="text-3xl font-bold">{page.title || "Untitled"}</h1>

      <p className="mt-2 text-xs text-muted-foreground">
        Last updated{" "}
        {new Date(page.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      <div className="mt-6">
        {page.contentMarkdown ? (
          <TiptapEditor content={html} editable={false} />
        ) : (
          <p className="text-muted-foreground">This page is empty.</p>
        )}
      </div>
    </div>
  );
}
