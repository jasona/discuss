"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getSpacesWithPages,
  createSpace,
  archiveSpace,
  type SpaceWithPages,
  type PageTreeNode,
} from "@/lib/actions/spaces";
import { createPage, archivePage, movePage } from "@/lib/actions/pages";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Archive,
  Trash2,
  Pencil,
  MoveRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SpaceDefaultRole } from "@/lib/constants";

// ─── Sortable Page Item ──────────────────────────────────

function SortablePageItem({
  node,
  spaceId,
  depth,
  activePath,
  onNavigate,
  onNewSubPage,
  onArchive,
}: {
  node: PageTreeNode;
  spaceId: string;
  depth: number;
  activePath: string;
  onNavigate: (spaceId: string, pageId: string) => void;
  onNewSubPage: (spaceId: string, parentPageId: string) => void;
  onArchive: (pageId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = activePath === `/${spaceId}/${node.id}`;
  const hasChildren = node.children.length > 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={`group flex items-center gap-1 rounded-md px-1 py-0.5 text-sm hover:bg-muted ${
            isActive ? "bg-accent text-accent-foreground" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          {hasChildren ? (
            <CollapsibleTrigger className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted-foreground/10">
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
          ) : (
            <span className="w-5" />
          )}

          <button
            className="flex flex-1 items-center gap-1.5 truncate text-left"
            onClick={() => onNavigate(spaceId, node.id)}
            {...listeners}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{node.title || "Untitled"}</span>
          </button>

          <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
            <button
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted-foreground/10"
              onClick={(e) => {
                e.stopPropagation();
                onNewSubPage(spaceId, node.id);
              }}
              title="Add sub-page"
            >
              <Plus className="h-3 w-3" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted-foreground/10">
                <MoreHorizontal className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onArchive(node.id)}>
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <SortableContext
              items={node.children.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {node.children.map((child) => (
                <SortablePageItem
                  key={child.id}
                  node={child}
                  spaceId={spaceId}
                  depth={depth + 1}
                  activePath={activePath}
                  onNavigate={onNavigate}
                  onNewSubPage={onNewSubPage}
                  onArchive={onArchive}
                />
              ))}
            </SortableContext>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

// ─── Space Section ───────────────────────────────────────

function SpaceSection({
  space,
  activePath,
  onNavigate,
  onNewPage,
  onNewSubPage,
  onArchiveSpace,
  onArchivePage,
}: {
  space: SpaceWithPages;
  activePath: string;
  onNavigate: (spaceId: string, pageId?: string) => void;
  onNewPage: (spaceId: string) => void;
  onNewSubPage: (spaceId: string, parentPageId: string) => void;
  onArchiveSpace: (spaceId: string) => void;
  onArchivePage: (pageId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isSpaceActive = activePath.startsWith(`/${space.id}`);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted">
        <CollapsibleTrigger className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted-foreground/10">
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </CollapsibleTrigger>

        <button
          className={`flex flex-1 items-center gap-1.5 truncate text-left text-sm font-medium ${
            isSpaceActive && !activePath.includes("/") ? "text-accent-foreground" : ""
          }`}
          onClick={() => onNavigate(space.id)}
        >
          <span className="shrink-0 text-base">{space.icon || "📁"}</span>
          <span className="truncate">{space.name}</span>
        </button>

        <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              onNewPage(space.id);
            }}
            title="Add page"
          >
            <Plus className="h-3 w-3" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted-foreground/10">
              <MoreHorizontal className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onNavigate(space.id)}>
                <FolderOpen className="h-4 w-4" />
                Open space
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onArchiveSpace(space.id)}
              >
                <Archive className="h-4 w-4" />
                Archive space
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CollapsibleContent>
        <SortableContext
          items={space.pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {space.pages.map((page) => (
            <SortablePageItem
              key={page.id}
              node={page}
              spaceId={space.id}
              depth={1}
              activePath={activePath}
              onNavigate={(sid, pid) => onNavigate(sid, pid)}
              onNewSubPage={onNewSubPage}
              onArchive={onArchivePage}
            />
          ))}
        </SortableContext>

        {space.pages.length === 0 && (
          <button
            className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 pl-8 text-xs text-muted-foreground hover:bg-muted"
            onClick={() => onNewPage(space.id)}
          >
            <Plus className="h-3 w-3" />
            Add a page
          </button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── New Space Dialog ────────────────────────────────────

function NewSpaceDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📁");
  const [defaultRole, setDefaultRole] = useState<SpaceDefaultRole>("viewer");
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    const result = await createSpace(
      name.trim(),
      description.trim() || null,
      icon || null,
      defaultRole
    );

    if (result.success) {
      toast.success("Space created");
      setName("");
      setDescription("");
      setIcon("📁");
      setDefaultRole("viewer");
      onOpenChange(false);
      onCreated();
    } else {
      toast.error(result.error || "Failed to create space");
    }
    setCreating(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new space</DialogTitle>
          <DialogDescription>
            Spaces organize your pages by team, project, or topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="space-name">Name</Label>
            <div className="flex gap-2">
              <Input
                className="w-16 text-center text-lg"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                title="Icon (emoji)"
              />
              <Input
                id="space-name"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="space-desc">Description (optional)</Label>
            <Input
              id="space-desc"
              placeholder="What is this space for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Default permission for org members</Label>
            <Select
              value={defaultRole}
              onValueChange={(v) => setDefaultRole(v as SpaceDefaultRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — can read</SelectItem>
                <SelectItem value="editor">Editor — can read and write</SelectItem>
                <SelectItem value="none">None — invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create space"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Space Tree ─────────────────────────────────────

export function SpaceTree() {
  const router = useRouter();
  const pathname = usePathname();
  const [spaces, setSpaces] = useState<SpaceWithPages[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSpace, setShowNewSpace] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const loadSpaces = useCallback(async () => {
    const data = await getSpacesWithPages();
    setSpaces(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  function handleNavigate(spaceId: string, pageId?: string) {
    if (pageId) {
      router.push(`/${spaceId}/${pageId}`);
    } else {
      router.push(`/${spaceId}`);
    }
  }

  async function handleNewPage(spaceId: string) {
    const result = await createPage(spaceId, null, "Untitled");
    if (result.success && result.pageId) {
      toast.success("Page created");
      await loadSpaces();
      router.push(`/${spaceId}/${result.pageId}`);
    } else {
      toast.error(result.error || "Failed to create page");
    }
  }

  async function handleNewSubPage(spaceId: string, parentPageId: string) {
    const result = await createPage(spaceId, parentPageId, "Untitled");
    if (result.success && result.pageId) {
      toast.success("Page created");
      await loadSpaces();
      router.push(`/${spaceId}/${result.pageId}`);
    } else {
      toast.error(result.error || "Failed to create page");
    }
  }

  async function handleArchiveSpace(spaceId: string) {
    if (!confirm("Archive this space and all its pages?")) return;
    const result = await archiveSpace(spaceId);
    if (result.success) {
      toast.success("Space archived");
      loadSpaces();
    } else {
      toast.error(result.error || "Failed to archive space");
    }
  }

  async function handleArchivePage(pageId: string) {
    const result = await archivePage(pageId);
    if (result.success) {
      toast.success("Page archived");
      loadSpaces();
    } else {
      toast.error(result.error || "Failed to archive page");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which space contains the active and over items
    for (const space of spaces) {
      const pageIds = flattenPageIds(space.pages);
      if (pageIds.includes(active.id as string) && pageIds.includes(over.id as string)) {
        // Simple reorder within same parent
        const activeNode = findPageNode(space.pages, active.id as string);
        const overNode = findPageNode(space.pages, over.id as string);

        if (activeNode && overNode && activeNode.parentPageId === overNode.parentPageId) {
          // Get siblings
          const parent = activeNode.parentPageId
            ? findPageNode(space.pages, activeNode.parentPageId)
            : null;
          const siblings = parent ? parent.children : space.pages;
          const orderedIds = siblings.map((s) => s.id);

          const activeIdx = orderedIds.indexOf(active.id as string);
          const overIdx = orderedIds.indexOf(over.id as string);

          if (activeIdx !== -1 && overIdx !== -1) {
            orderedIds.splice(activeIdx, 1);
            orderedIds.splice(overIdx, 0, active.id as string);

            const { reorderPages } = await import("@/lib/actions/pages");
            await reorderPages(
              space.id,
              activeNode.parentPageId,
              orderedIds
            );
            loadSpaces();
          }
        } else if (activeNode && overNode) {
          // Move to different parent
          await movePage(active.id as string, space.id, overNode.parentPageId);
          loadSpaces();
        }
        break;
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 px-2">
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2 py-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {spaces.map((space) => (
              <SpaceSection
                key={space.id}
                space={space}
                activePath={pathname}
                onNavigate={handleNavigate}
                onNewPage={handleNewPage}
                onNewSubPage={handleNewSubPage}
                onArchiveSpace={handleArchiveSpace}
                onArchivePage={handleArchivePage}
              />
            ))}
          </DndContext>

          {spaces.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No spaces yet. Create one to get started.
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="border-t px-2 py-2">
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setShowNewSpace(true)}
        >
          <Plus className="h-4 w-4" />
          New space
        </button>
      </div>

      <NewSpaceDialog
        open={showNewSpace}
        onOpenChange={setShowNewSpace}
        onCreated={loadSpaces}
      />
    </>
  );
}

// ─── Tree Helpers ────────────────────────────────────────

function flattenPageIds(nodes: PageTreeNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    ids.push(n.id);
    ids.push(...flattenPageIds(n.children));
  }
  return ids;
}

function findPageNode(
  nodes: PageTreeNode[],
  id: string
): PageTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findPageNode(n.children, id);
    if (found) return found;
  }
  return null;
}
