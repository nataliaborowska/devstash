import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createItem,
  deleteItem,
  getItemDetail,
  getItemsByCollection,
  getItemStats,
  getSearchItems,
  updateItem,
} from "@/lib/db/items";

vi.mock("@/lib/prisma", () => {
  const item = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  };
  const itemType = { findFirst: vi.fn() };
  const collection = { count: vi.fn() };
  // Interactive transactions run against the same mocked client.
  return {
    prisma: {
      item,
      itemType,
      collection,
      $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({ item })),
    },
  };
});

const mockFindFirst = vi.mocked(prisma.item.findFirst);
const mockCreate = vi.mocked(prisma.item.create);
const mockUpdate = vi.mocked(prisma.item.update);
const mockFindItemType = vi.mocked(prisma.itemType.findFirst);
const mockDeleteMany = vi.mocked(prisma.item.deleteMany);

const createdAt = new Date("2026-01-15T10:00:00Z");
const updatedAt = new Date("2026-02-01T12:00:00Z");

const dbItem = {
  id: "item-1",
  title: "useAuth Hook",
  description: "Custom authentication hook",
  isFavorite: true,
  isPinned: false,
  createdAt,
  lastUsedAt: null,
  updatedAt,
  contentType: "TEXT",
  content: "export function useAuth() {}",
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  language: "typescript",
  type: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
  tags: [{ tag: { name: "react" } }, { tag: { name: "auth" } }],
  collections: [
    { collection: { id: "col-1", name: "React Patterns" } },
    { collection: { id: "col-2", name: "Interview Prep" } },
  ],
};

describe("getItemsByCollection", () => {
  it("reads the user's items in the collection, pinned first then most recently updated", async () => {
    const mockFindMany = vi.mocked(prisma.item.findMany);
    mockFindMany.mockResolvedValue([dbItem] as never);

    const items = await getItemsByCollection("user-1", "col-1");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", collections: { some: { collectionId: "col-1" } } },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      })
    );
    expect(items).toEqual([
      {
        id: "item-1",
        title: "useAuth Hook",
        description: "Custom authentication hook",
        isFavorite: true,
        isPinned: false,
        createdAt,
        lastUsedAt: null,
        type: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
        tags: ["react", "auth"],
      },
    ]);
  });

  it("returns an empty list when the collection has no items", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([] as never);
    await expect(getItemsByCollection("user-1", "col-empty")).resolves.toEqual([]);
  });
});

describe("getSearchItems", () => {
  const snippetType = { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" };
  const linkType = { id: "type-7", name: "link", icon: "Link", color: "#10b981" };

  it("reads only the user's items, most recently updated first", async () => {
    const mockFindMany = vi.mocked(prisma.item.findMany);
    mockFindMany.mockResolvedValue([] as never);

    await getSearchItems("user-1");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, orderBy: { updatedAt: "desc" } })
    );
  });

  it("builds a preview from content, falling back to URL then description", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([
      {
        id: "item-1",
        title: "useAuth Hook",
        content: "export function\n  useAuth() {}",
        url: null,
        description: "Hook",
        type: snippetType,
      },
      {
        id: "item-2",
        title: "Docs",
        content: null,
        url: "https://nextjs.org/docs",
        description: "Next docs",
        type: linkType,
      },
      { id: "item-3", title: "Bare", content: "   ", url: null, description: "Only a description", type: snippetType },
      { id: "item-4", title: "Empty", content: null, url: null, description: null, type: snippetType },
    ] as never);

    const items = await getSearchItems("user-1");

    expect(items).toEqual([
      { id: "item-1", title: "useAuth Hook", type: snippetType, preview: "export function useAuth() {}" },
      { id: "item-2", title: "Docs", type: linkType, preview: "https://nextjs.org/docs" },
      { id: "item-3", title: "Bare", type: snippetType, preview: "Only a description" },
      { id: "item-4", title: "Empty", type: snippetType, preview: null },
    ]);
  });
});

describe("getItemDetail", () => {
  beforeEach(() => {
    mockFindFirst.mockResolvedValue(dbItem as never);
  });

  it("only looks up the item for its owner", async () => {
    await getItemDetail("user-1", "item-1");
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } })
    );
  });

  it("returns null when the item does not exist or belongs to another user", async () => {
    mockFindFirst.mockResolvedValue(null);
    expect(await getItemDetail("user-2", "item-1")).toBeNull();
  });

  it("maps the full item detail with flattened tags and collections", async () => {
    expect(await getItemDetail("user-1", "item-1")).toEqual({
      id: "item-1",
      title: "useAuth Hook",
      description: "Custom authentication hook",
      isFavorite: true,
      isPinned: false,
      createdAt,
      lastUsedAt: null,
      updatedAt,
      contentType: "TEXT",
      content: "export function useAuth() {}",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      type: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: ["react", "auth"],
      collections: [
        { id: "col-1", name: "React Patterns" },
        { id: "col-2", name: "Interview Prep" },
      ],
    });
  });

  it("returns no collections for items outside any collection", async () => {
    mockFindFirst.mockResolvedValue({ ...dbItem, collections: [] } as never);
    const item = await getItemDetail("user-1", "item-1");
    expect(item?.collections).toEqual([]);
  });
});

describe("updateItem", () => {
  const data = {
    title: "useAuth Hook v2",
    description: null,
    content: "export function useAuth() { return null }",
    language: "typescript",
    tags: ["react", "hooks"],
  };

  beforeEach(() => {
    mockFindFirst.mockResolvedValue({ id: "item-1" } as never);
    mockUpdate.mockResolvedValue({
      ...dbItem,
      title: data.title,
      description: null,
      content: data.content,
      tags: [{ tag: { name: "react" } }, { tag: { name: "hooks" } }],
    } as never);
  });

  it("checks ownership before updating", async () => {
    await updateItem("user-1", "item-1", data);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } })
    );
  });

  it("returns null without updating when the item is not owned by the user", async () => {
    mockFindFirst.mockResolvedValue(null);
    expect(await updateItem("user-2", "item-1", data)).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates the fields and replaces tags with connect-or-create", async () => {
    await updateItem("user-1", "item-1", data);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: {
          title: "useAuth Hook v2",
          description: null,
          content: "export function useAuth() { return null }",
          language: "typescript",
          tags: {
            deleteMany: {},
            create: ["react", "hooks"].map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name_userId: { name, userId: "user-1" } },
                  create: { name, userId: "user-1" },
                },
              },
            })),
          },
        },
      })
    );
  });

  it("clears all tags when given an empty list", async () => {
    await updateItem("user-1", "item-1", { ...data, tags: [] });
    expect(mockUpdate.mock.calls[0][0].data.tags).toEqual({ deleteMany: {}, create: [] });
  });

  it("replaces the item's collections with the given ones", async () => {
    await updateItem("user-1", "item-1", { ...data, collectionIds: ["col-1", "col-2"] });
    expect(mockUpdate.mock.calls[0][0].data.collections).toEqual({
      deleteMany: {},
      create: [{ collectionId: "col-1" }, { collectionId: "col-2" }],
    });
  });

  it("removes the item from every collection when given an empty list", async () => {
    await updateItem("user-1", "item-1", { ...data, collectionIds: [] });
    expect(mockUpdate.mock.calls[0][0].data.collections).toEqual({ deleteMany: {}, create: [] });
  });

  it("leaves collections untouched when collectionIds is omitted", async () => {
    await updateItem("user-1", "item-1", data);
    expect(mockUpdate.mock.calls[0][0].data).not.toHaveProperty("collections");
  });

  it("returns the updated item detail", async () => {
    const item = await updateItem("user-1", "item-1", data);
    expect(item).toMatchObject({
      id: "item-1",
      title: "useAuth Hook v2",
      description: null,
      tags: ["react", "hooks"],
      collections: [
        { id: "col-1", name: "React Patterns" },
        { id: "col-2", name: "Interview Prep" },
      ],
    });
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    mockDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("only deletes the item for its owner", async () => {
    await deleteItem("user-1", "item-1");
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: "item-1", userId: "user-1" } });
  });

  it("returns true when the item was deleted", async () => {
    expect(await deleteItem("user-1", "item-1")).toBe(true);
  });

  it("returns false when the item does not exist or belongs to another user", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });
    expect(await deleteItem("user-2", "item-1")).toBe(false);
  });
});

describe("createItem", () => {
  const data = {
    type: "snippet" as const,
    title: "useAuth Hook",
    description: "Custom authentication hook",
    content: "export function useAuth() {}",
    language: "typescript",
    url: null,
    tags: ["react", "auth"],
  };

  beforeEach(() => {
    mockFindItemType.mockResolvedValue({ id: "type-1" } as never);
    mockCreate.mockResolvedValue(dbItem as never);
  });

  it("looks up the matching system item type", async () => {
    await createItem("user-1", data);
    expect(mockFindItemType).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: "snippet", isSystem: true } })
    );
  });

  it("returns null without creating when the system type is missing", async () => {
    mockFindItemType.mockResolvedValue(null);
    expect(await createItem("user-1", data)).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates the item for the user with connect-or-create tags", async () => {
    await createItem("user-1", data);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          title: "useAuth Hook",
          description: "Custom authentication hook",
          content: "export function useAuth() {}",
          language: "typescript",
          url: null,
          userId: "user-1",
          typeId: "type-1",
          tags: {
            create: [
              {
                tag: {
                  connectOrCreate: {
                    where: { name_userId: { name: "react", userId: "user-1" } },
                    create: { name: "react", userId: "user-1" },
                  },
                },
              },
              {
                tag: {
                  connectOrCreate: {
                    where: { name_userId: { name: "auth", userId: "user-1" } },
                    create: { name: "auth", userId: "user-1" },
                  },
                },
              },
            ],
          },
          collections: { create: [] },
        },
      })
    );
  });

  it("creates no tag links when given an empty list", async () => {
    await createItem("user-1", { ...data, tags: [] });
    expect(mockCreate.mock.calls[0][0].data.tags).toEqual({ create: [] });
  });

  it("links the item to the given collections", async () => {
    await createItem("user-1", { ...data, collectionIds: ["col-1", "col-2"] });
    expect(mockCreate.mock.calls[0][0].data.collections).toEqual({
      create: [{ collectionId: "col-1" }, { collectionId: "col-2" }],
    });
  });

  it("returns the created item detail", async () => {
    const item = await createItem("user-1", data);
    expect(item).toMatchObject({
      id: "item-1",
      title: "useAuth Hook",
      type: { name: "snippet" },
      tags: ["react", "auth"],
    });
  });
});

describe("getItemStats", () => {
  it("only counts the user's items and collections", async () => {
    const mockItemCount = vi.mocked(prisma.item.count);
    const mockCollectionCount = vi.mocked(prisma.collection.count);
    mockItemCount.mockResolvedValueOnce(12).mockResolvedValueOnce(3);
    mockCollectionCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1);

    const stats = await getItemStats("user-1");

    expect(mockItemCount).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mockItemCount).toHaveBeenCalledWith({ where: { userId: "user-1", isFavorite: true } });
    expect(mockCollectionCount).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mockCollectionCount).toHaveBeenCalledWith({
      where: { userId: "user-1", isFavorite: true },
    });
    expect(stats).toEqual({
      totalItems: 12,
      favoriteItems: 3,
      totalCollections: 4,
      favoriteCollections: 1,
    });
  });
});
