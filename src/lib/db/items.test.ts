import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createItem, deleteItem, getItemDetail, updateItem } from "@/lib/db/items";

vi.mock("@/lib/prisma", () => {
  const item = { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() };
  const itemType = { findFirst: vi.fn() };
  // Interactive transactions run against the same mocked client.
  return {
    prisma: { item, itemType, $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({ item })) },
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
  collection: { id: "col-1", name: "React Patterns" },
};

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

  it("maps the full item detail with flattened tags and its collection", async () => {
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
      collection: { id: "col-1", name: "React Patterns" },
    });
  });

  it("returns a null collection for items outside any collection", async () => {
    mockFindFirst.mockResolvedValue({ ...dbItem, collection: null } as never);
    const item = await getItemDetail("user-1", "item-1");
    expect(item?.collection).toBeNull();
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

  it("returns the updated item detail", async () => {
    const item = await updateItem("user-1", "item-1", data);
    expect(item).toMatchObject({
      id: "item-1",
      title: "useAuth Hook v2",
      description: null,
      tags: ["react", "hooks"],
      collection: { id: "col-1", name: "React Patterns" },
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
        },
      })
    );
  });

  it("creates no tag links when given an empty list", async () => {
    await createItem("user-1", { ...data, tags: [] });
    expect(mockCreate.mock.calls[0][0].data.tags).toEqual({ create: [] });
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
