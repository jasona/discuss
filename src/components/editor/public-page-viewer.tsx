"use client";

import { TiptapEditor } from "./tiptap-editor";
import { markdownToHtml } from "@/lib/editor/markdown";

interface PublicPage {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentMarkdown: string;
  updatedAt: string;
  orgName: string;
}

interface PublicPageViewerProps {
  page: PublicPage;
}

export function PublicPageViewer({ page }: PublicPageViewerProps) {
  const html = page.contentMarkdown ? markdownToHtml(page.contentMarkdown) : "";

  return (
    <div>
      <h1 className="text-3xl font-bold">{page.title || "Untitled"}</h1>

      <p className="mt-2 text-xs text-muted-foreground">
        Published by {page.orgName} &middot; Last updated{" "}
        {new Date(page.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="mt-8">
        {page.contentMarkdown ? (
          <TiptapEditor content={html} editable={false} />
        ) : (
          <p className="text-muted-foreground">This page is empty.</p>
        )}
      </div>
    </div>
  );
}
