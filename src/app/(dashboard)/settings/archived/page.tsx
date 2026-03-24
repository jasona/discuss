"use client";

import { useEffect, useState } from "react";
import {
  getArchivedItems,
  restoreSpace,
  deleteSpace,
  type ArchivedItem,
} from "@/lib/actions/spaces";
import { restorePage, deletePage } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { RotateCcw, Trash2, Archive } from "lucide-react";

export default function ArchivedItemsPage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getArchivedItems();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRestore(item: ArchivedItem) {
    const result =
      item.type === "space"
        ? await restoreSpace(item.id)
        : await restorePage(item.id);

    if (result.success) {
      toast.success(`${item.type === "space" ? "Space" : "Page"} restored`);
      load();
    } else {
      toast.error(result.error || "Failed to restore");
    }
  }

  async function handleDelete(item: ArchivedItem) {
    if (
      !confirm(
        `Permanently delete "${item.name}"? This cannot be undone.`
      )
    )
      return;

    const result =
      item.type === "space"
        ? await deleteSpace(item.id)
        : await deletePage(item.id);

    if (result.success) {
      toast.success("Permanently deleted");
      load();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Archived items</h1>
        <p className="text-sm text-muted-foreground">
          Restore or permanently delete archived spaces and pages. Items
          archived for more than 30 days may be automatically purged.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.spaceName || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRestore(item)}
                        title="Restore"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Archive className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No archived items
          </p>
        </div>
      )}
    </div>
  );
}
