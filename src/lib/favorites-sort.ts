import type { FavoriteCollection } from "@/lib/db/collections";
import type { FavoriteItem } from "@/lib/db/items";

export const FAVORITES_SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
] as const;

export type FavoritesSort = (typeof FAVORITES_SORT_OPTIONS)[number]["value"];

// Collections have no item type, so they only sort by date or name.
export const FAVORITE_COLLECTIONS_SORT_OPTIONS = FAVORITES_SORT_OPTIONS.filter(
  (option): option is Extract<(typeof FAVORITES_SORT_OPTIONS)[number], { value: "date" | "name" }> =>
    option.value !== "type"
);

export type FavoriteCollectionsSort = Exclude<FavoritesSort, "type">;

export const DEFAULT_FAVORITES_SORT = "date" satisfies FavoritesSort & FavoriteCollectionsSort;

interface SortKey {
  id: string;
  name: string;
  typeName: string;
  updatedAt: Date | string;
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

// Newest first; dates may arrive as strings after crossing the server/client boundary.
function compareDate(a: Date | string, b: Date | string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function compareKeys(a: SortKey, b: SortKey, sort: FavoritesSort) {
  let result = 0;
  if (sort === "date") {
    result = compareDate(a.updatedAt, b.updatedAt);
  } else if (sort === "type") {
    result = compareText(a.typeName, b.typeName) || compareText(a.name, b.name);
  } else {
    result = compareText(a.name, b.name);
  }
  // `id` keeps ties in a stable, predictable order.
  return result || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function sortBy<T>(entries: T[], sort: FavoritesSort, toKey: (entry: T) => SortKey) {
  return [...entries].sort((a, b) => compareKeys(toKey(a), toKey(b), sort));
}

export function sortFavoriteItems(items: FavoriteItem[], sort: FavoritesSort) {
  return sortBy(items, sort, (item) => ({
    id: item.id,
    name: item.title,
    typeName: item.type.name,
    updatedAt: item.updatedAt,
  }));
}

export function sortFavoriteCollections(
  collections: FavoriteCollection[],
  sort: FavoriteCollectionsSort
) {
  return sortBy(collections, sort, (collection) => ({
    id: collection.id,
    name: collection.name,
    typeName: "",
    updatedAt: collection.updatedAt,
  }));
}
