"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Search } from "lucide-react";
import { useCollectionOptions } from "@/components/collections/collection-select";
import { useItemDrawer } from "@/components/items/item-drawer-provider";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { TypeIcon } from "@/lib/icon-map";
import { rankBySearch } from "@/lib/search-ranking";
import type { SearchItem } from "@/lib/db/items";

interface GlobalSearchProps {
  items: SearchItem[];
}

export function GlobalSearch({ items }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const { openItem } = useItemDrawer();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectItem(id: string) {
    setOpen(false);
    openItem(id);
  }

  function selectCollection(id: string) {
    setOpen(false);
    router.push(`/collections/${encodeURIComponent(id)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search items and collections"
        aria-keyshortcuts="Meta+K Control+K"
        className="relative flex h-8 w-full items-center rounded-md bg-muted pl-9 pr-12 text-left text-sm text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
        <span className="truncate">Search items and collections...</span>
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search your items and collections"
        className="sm:max-w-lg"
      >
        {/* Mounted only while open, so every open starts with an empty search. */}
        <SearchResults items={items} onSelectItem={selectItem} onSelectCollection={selectCollection} />
      </CommandDialog>
    </>
  );
}

interface SearchResultsProps {
  items: SearchItem[];
  onSelectItem: (id: string) => void;
  onSelectCollection: (id: string) => void;
}

function SearchResults({ items, onSelectItem, onSelectCollection }: SearchResultsProps) {
  const [query, setQuery] = useState("");
  const collections = useCollectionOptions();

  const matchedItems = rankBySearch(items, query, (item) => ({
    primary: [item.title, item.type.name],
    secondary: [item.preview],
  }));
  const matchedCollections = rankBySearch(collections, query, (collection) => ({
    primary: [collection.name],
  }));

  return (
    // Ranking is done by rankBySearch; cmdk only handles keyboard navigation.
    <Command shouldFilter={false}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search items and collections..." />
      <CommandList className="scrollbar-thin max-h-96">
        <CommandEmpty>No results found.</CommandEmpty>

        {matchedItems.length > 0 && (
          <CommandGroup heading="Items">
            {matchedItems.map((item) => (
              <CommandItem key={item.id} value={`item:${item.id}`} onSelect={() => onSelectItem(item.id)}>
                <TypeIcon
                  name={item.type.icon}
                  className="size-4"
                  style={{ color: item.type.color ?? undefined }}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{item.title}</span>
                  {item.preview && (
                    <span className="truncate text-xs text-muted-foreground">{item.preview}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchedCollections.length > 0 && (
          <CommandGroup heading="Collections">
            {matchedCollections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={`collection:${collection.id}`}
                onSelect={() => onSelectCollection(collection.id)}
              >
                <FolderOpen className="text-muted-foreground" />
                <span className="truncate">{collection.name}</span>
                <CommandShortcut className="tracking-normal">
                  {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
