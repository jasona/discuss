"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getPage,
  getPageBreadcrumbs,
  canUserEditPage,
  getPageAuthorInfo,
  type Page,
  type PageBreadcrumb,
  type PageAuthorInfo,
} from "@/lib/actions/pages";
import { getSpace, type Space } from "@/lib/actions/spaces";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { PageEditor } from "@/components/editor/page-editor";
import { PageViewer } from "@/components/editor/page-viewer";
import { CommentsPanel } from "@/components/comments/comments-panel";

export default function PageViewPage() {
  const params = useParams<{ spaceId: string; pageId: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<PageBreadcrumb[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [authorInfo, setAuthorInfo] = useState<PageAuthorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [p, s, bc, editable, author] = await Promise.all([
      getPage(params.pageId),
      getSpace(params.spaceId),
      getPageBreadcrumbs(params.pageId),
      canUserEditPage(params.pageId),
      getPageAuthorInfo(params.pageId),
    ]);
    setPage(p);
    setSpace(s);
    setBreadcrumbs(bc);
    setCanEdit(editable);
    setAuthorInfo(author);
    setLoading(false);
  }, [params.pageId, params.spaceId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-10 w-96 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!page || !space) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumbs
          orgName=""
          spaceName={space.name}
          spaceId={space.id}
          breadcrumbs={breadcrumbs}
        />

        {authorInfo && (
          <CommentsPanel
            pageId={page.id}
            currentUserId={authorInfo.currentUserId}
            currentUserRole={authorInfo.currentUserRole}
          />
        )}
      </div>

      {canEdit ? (
        <PageEditor
          page={page}
          orgId={authorInfo?.orgId}
          updatedByName={authorInfo?.updatedByName}
        />
      ) : (
        <PageViewer page={page} />
      )}
    </div>
  );
}
