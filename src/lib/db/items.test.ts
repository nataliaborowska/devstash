import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getItemDetail, updateItem } from "@/lib/db/items";

vi.mock("@/lib/prisma", () => {
  const item = { findFirst: vi.fn(), update: vi.fn() };
  // Interactive transactions run against the same mocked client.
  return { prisma: { item, $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({ item })) } };
});

const mockFindFirst = vi.mocked(prisma.item.findFirst);
const mockUpdate = vi.mocked(prisma.item.update);

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
