"use client";

import type { Page } from "@/lib/actions/pages";

interface PageViewerProps {
  page: Page;
}

export function PageViewer({ page }: PageViewerProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{page.title || "Untitled"}</h1>

      <p className="mt-2 text-xs text-muted-foreground">
        Last updated {new Date(page.updatedAt).toLocaleDateString()}
      </p>

      <div className="prose prose-sm dark:prose-invert mt-6 max-w-none">
        {page.contentMarkdown ? (
          <pre className="whitespace-pre-wrap font-sans">
            {page.contentMarkdown}
          </pre>
        ) : (
          <p className="text-muted-foreground">This page is empty.</p>
        )}
      </div>
    </div>
  );
}
