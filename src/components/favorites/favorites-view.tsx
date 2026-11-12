"use client";

import { useState } from "react";
import {
  FavoriteCollectionsList,
  FavoriteItemsList,
} from "@/components/favorites/favorites-list";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { FavoriteItem } from "@/lib/db/items";
import {
  DEFAULT_FAVORITES_SORT,
  FAVORITE_COLLECTIONS_SORT_OPTIONS,
  FAVORITES_SORT_OPTIONS,
  sortFavoriteCollections,
  sortFavoriteItems,
  type FavoriteCollectionsSort,
  type FavoritesSort,
} from "@/lib/favorites-sort";
import { cn } from "@/lib/utils";

interface SortControlProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (sort: T) => void;
}

function SortControl<T extends string>({ label, options, value, onChange }: SortControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-md border border-border p-0.5 font-mono text-[11px] text-muted-foreground"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded px-2 py-0.5 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
            value === option.value ? "bg-accent text-foreground" : "hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface FavoritesViewProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export function FavoritesView({ items, collections }: FavoritesViewProps) {
  const [itemsSort, setItemsSort] = useState<FavoritesSort>(DEFAULT_FAVORITES_SORT);
  const [collectionsSort, setCollectionsSort] =
    useState<FavoriteCollectionsSort>(DEFAULT_FAVORITES_SORT);

  return (
    <div className="space-y-8">
      {items.length > 0 && (
        <FavoriteItemsList
          items={sortFavoriteItems(items, itemsSort)}
          action={
            <SortControl
              label="Sort favorite items"
              options={FAVORITES_SORT_OPTIONS}
              value={itemsSort}
              onChange={setItemsSort}
            />
          }
        />
      )}
      {collections.length > 0 && (
        <FavoriteCollectionsList
          collections={sortFavoriteCollections(collections, collectionsSort)}
          action={
            <SortControl
              label="Sort favorite collections"
              options={FAVORITE_COLLECTIONS_SORT_OPTIONS}
              value={collectionsSort}
              onChange={setCollectionsSort}
            />
          }
        />
      )}
    </div>
  );
}
