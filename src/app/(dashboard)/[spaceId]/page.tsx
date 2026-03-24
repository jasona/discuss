"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpace, type Space } from "@/lib/actions/spaces";
import { getSpacePages, createPage, type Page } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function SpacePage() {
  const params = useParams<{ spaceId: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, p] = await Promise.all([
        getSpace(params.spaceId),
        getSpacePages(params.spaceId),
      ]);
      setSpace(s);
      setPages(p);
      setLoading(false);
    }
    load();
  }, [params.spaceId]);

  async function handleNewPage() {
    const result = await createPage(params.spaceId, null, "Untitled");
    if (result.success && result.pageId) {
      toast.success("Page created");
      router.push(`/${params.spaceId}/${result.pageId}`);
    } else {
      toast.error(result.error || "Failed to create page");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Space not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{space.icon || "📁"}</span>
            <h1 className="text-2xl font-bold">{space.name}</h1>
          </div>
          {space.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {space.description}
            </p>
          )}
        </div>
        <Button onClick={handleNewPage} size="sm">
          <Plus className="h-4 w-4" />
          New page
        </Button>
      </div>

      <div className="mt-8">
        {pages.length > 0 ? (
          <div className="space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                onClick={() => router.push(`/${params.spaceId}/${page.id}`)}
              >
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {page.title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No pages yet
            </p>
            <Button onClick={handleNewPage} size="sm" className="mt-4">
              <Plus className="h-4 w-4" />
              Create your first page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
