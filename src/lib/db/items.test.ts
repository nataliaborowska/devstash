import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getItemDetail } from "@/lib/db/items";

vi.mock("@/lib/prisma", () => ({
  prisma: { item: { findFirst: vi.fn() } },
}));

const mockFindFirst = vi.mocked(prisma.item.findFirst);

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
