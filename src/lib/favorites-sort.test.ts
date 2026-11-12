import { describe, expect, it } from "vitest";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { FavoriteItem } from "@/lib/db/items";
import {
  DEFAULT_FAVORITES_SORT,
  FAVORITE_COLLECTIONS_SORT_OPTIONS,
  FAVORITES_SORT_OPTIONS,
  sortFavoriteCollections,
  sortFavoriteItems,
} from "@/lib/favorites-sort";

function item(id: string, title: string, typeName: string, updatedAt: string): FavoriteItem {
  return {
    id,
    title,
    type: { id: `type-${typeName}`, name: typeName, icon: null, color: null },
    updatedAt: new Date(updatedAt),
  };
}

function collection(id: string, name: string, updatedAt: string): FavoriteCollection {
  return { id, name, itemCount: 0, updatedAt: new Date(updatedAt) };
}

const ids = (entries: { id: string }[]) => entries.map((entry) => entry.id);

const items = [
  item("a", "zsh aliases", "command", "2026-11-01"),
  item("b", "React hook", "snippet", "2026-11-10"),
  item("c", "api prompt", "prompt", "2026-11-05"),
  item("d", "Docker run", "command", "2026-11-08"),
];

describe("favorites sort options", () => {
  it("offers date, name, and type with date as the default", () => {
    expect(FAVORITES_SORT_OPTIONS.map((option) => option.value)).toEqual(["date", "name", "type"]);
    expect(DEFAULT_FAVORITES_SORT).toBe("date");
  });
});

describe("sortFavoriteItems", () => {
  it("sorts by date, newest first", () => {
    expect(ids(sortFavoriteItems(items, "date"))).toEqual(["b", "d", "c", "a"]);
  });

  it("sorts by name case-insensitively", () => {
    expect(ids(sortFavoriteItems(items, "name"))).toEqual(["c", "d", "b", "a"]);
  });

  it("groups by type name, then sorts by name within a type", () => {
    expect(ids(sortFavoriteItems(items, "type"))).toEqual(["d", "a", "c", "b"]);
  });

  it("breaks ties by id", () => {
    const tied = [
      item("y", "Same", "note", "2026-11-01"),
      item("x", "same", "note", "2026-11-01"),
    ];
    expect(ids(sortFavoriteItems(tied, "date"))).toEqual(["x", "y"]);
    expect(ids(sortFavoriteItems(tied, "name"))).toEqual(["x", "y"]);
    expect(ids(sortFavoriteItems(tied, "type"))).toEqual(["x", "y"]);
  });

  it("accepts dates serialized as strings", () => {
    const serialized = [
      { ...item("a", "A", "note", "2026-01-01"), updatedAt: "2026-01-01T00:00:00.000Z" },
      { ...item("b", "B", "note", "2026-02-01"), updatedAt: "2026-02-01T00:00:00.000Z" },
    ] as unknown as FavoriteItem[];
    expect(ids(sortFavoriteItems(serialized, "date"))).toEqual(["b", "a"]);
  });

  it("does not mutate the input and handles an empty list", () => {
    const copy = [...items];
    sortFavoriteItems(items, "name");
    expect(items).toEqual(copy);
    expect(sortFavoriteItems([], "type")).toEqual([]);
  });
});

describe("sortFavoriteCollections", () => {
  const collections = [
    collection("1", "python", "2026-11-02"),
    collection("2", "Interview Prep", "2026-11-09"),
    collection("3", "React Patterns", "2026-11-04"),
  ];

  it("sorts by date, newest first", () => {
    expect(ids(sortFavoriteCollections(collections, "date"))).toEqual(["2", "3", "1"]);
  });

  it("sorts by name case-insensitively", () => {
    expect(ids(sortFavoriteCollections(collections, "name"))).toEqual(["2", "1", "3"]);
  });

  it("offers only date and name options", () => {
    expect(FAVORITE_COLLECTIONS_SORT_OPTIONS.map((option) => option.value)).toEqual([
      "date",
      "name",
    ]);
  });
});
