"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  searchDocuments,
  quickNavigate,
  getSearchSpaces,
  type SearchResult,
  type NavigationResult,
  type SpaceOption,
} from "@/lib/actions/search";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, Search, X } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navResults, setNavResults] = useState<NavigationResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [spaceFilter, setSpaceFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Load spaces for filter on open
  useEffect(() => {
    if (open) {
      getSearchSpaces().then(setSpaces);
    } else {
      // Reset on close
      setQuery("");
      setNavResults([]);
      setSearchResults([]);
      setSpaceFilter(undefined);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(
    (q: string, spId?: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!q.trim()) {
        setNavResults([]);
        setSearchResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        const [nav, search] = await Promise.all([
          quickNavigate(q),
          searchDocuments(q, spId),
        ]);
        setNavResults(nav);
        setSearchResults(search);
        setLoading(false);
      }, 300);
    },
    []
  );

  useEffect(() => {
    doSearch(query, spaceFilter);
  }, [query, spaceFilter, doSearch]);

  function handleSelect(type: "space" | "page", id: string, spaceId?: string) {
    setOpen(false);
    if (type === "space") {
      router.push(`/${id}`);
    } else {
      router.push(`/${spaceId}/${id}`);
    }
  }

  // Group search results by space
  const groupedResults = new Map<string, SearchResult[]>();
  for (const r of searchResults) {
    const key = r.spaceName || "Other";
    if (!groupedResults.has(key)) groupedResults.set(key, []);
    groupedResults.get(key)!.push(r);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <div className="flex items-center gap-2 px-3 pt-2">
          <CommandInput
            placeholder="Search pages, spaces..."
            value={query}
            onValueChange={setQuery}
          />
        </div>

        {/* Space filter chips */}
        {spaces.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-1.5">
            <button
              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                !spaceFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setSpaceFilter(undefined)}
            >
              All spaces
            </button>
            {spaces.map((s) => (
              <button
                key={s.id}
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  spaceFilter === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                onClick={() =>
                  setSpaceFilter(spaceFilter === s.id ? undefined : s.id)
                }
              >
                {s.icon ? `${s.icon} ` : ""}
                {s.name}
              </button>
            ))}
          </div>
        )}

        <CommandList>
          {!query.trim() && (
            <CommandEmpty>
              Type to search pages and spaces...
            </CommandEmpty>
          )}

          {query.trim() && !loading && navResults.length === 0 && searchResults.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {loading && navResults.length === 0 && searchResults.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {/* Quick navigation results */}
          {navResults.length > 0 && (
            <CommandGroup heading="Quick navigation">
              {navResults.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  onSelect={() => handleSelect(r.type, r.id, r.spaceId)}
                  className="cursor-pointer"
                >
                  {r.type === "space" ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="truncate">{r.name}</span>
                  </div>
                  {r.type === "page" && r.spaceName && (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {r.spaceName}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {r.type}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Full-text search results grouped by space */}
          {navResults.length > 0 && searchResults.length > 0 && (
            <CommandSeparator />
          )}

          {Array.from(groupedResults.entries()).map(([spaceName, results]) => (
            <CommandGroup key={spaceName} heading={spaceName}>
              {results.map((r) => (
                <CommandItem
                  key={r.pageId}
                  onSelect={() => handleSelect("page", r.pageId, r.spaceId)}
                  className="cursor-pointer"
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    {r.snippet && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.snippet}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(r.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
