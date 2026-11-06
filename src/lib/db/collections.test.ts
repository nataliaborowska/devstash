import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createCollection,
  getAllCollections,
  getCollectionById,
  getCollectionOptions,
  getFavoriteCollections,
  getNonFavoriteCollections,
  getRecentCollections,
  userOwnsCollections,
} from "@/lib/db/collections";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
  },
}));

const mockFindMany = vi.mocked(prisma.collection.findMany);
const mockFindFirst = vi.mocked(prisma.collection.findFirst);
const mockCreate = vi.mocked(prisma.collection.create);
const mockCount = vi.mocked(prisma.collection.count);

const snippetType = { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" };
const linkType = { id: "type-2", name: "link", icon: "Link", color: "#10b981" };

describe("collection reads", () => {
  beforeEach(() => {
    mockFindMany.mockResolvedValue([] as never);
  });

  it("getRecentCollections only reads the user's collections", async () => {
    await getRecentCollections("user-1", 6);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, take: 6 })
    );
  });

  it("getFavoriteCollections only reads the user's favorites", async () => {
    await getFavoriteCollections("user-1");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1", isFavorite: true }, take: 10 })
    );
  });

  it("getNonFavoriteCollections only reads the user's non-favorites", async () => {
    await getNonFavoriteCollections("user-1");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1", isFavorite: false }, take: 10 })
    );
  });

  it("getAllCollections reads every one of the user's collections with no limit", async () => {
    await getAllCollections("user-1");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        take: undefined,
        orderBy: { updatedAt: "desc" },
      })
    );
  });

  it("maps item counts, types by frequency, and the dominant color", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        items: [
          { item: { typeId: "type-2", type: linkType } },
          { item: { typeId: "type-1", type: snippetType } },
          { item: { typeId: "type-1", type: snippetType } },
        ],
      },
    ] as never);

    const [collection] = await getRecentCollections("user-1");
    expect(collection).toEqual({
      id: "col-1",
      name: "React Patterns",
      description: null,
      isFavorite: false,
      itemCount: 3,
      types: [snippetType, linkType],
      dominantColor: "#3b82f6",
    });
  });
});

describe("createCollection", () => {
  it("creates the collection owned by the user", async () => {
    const created = { id: "col-1", name: "Notes", description: "Docs", isFavorite: false };
    mockCreate.mockResolvedValue(created as never);

    const result = await createCollection("user-1", { name: "Notes", description: "Docs" });

    expect(mockCreate).toHaveBeenCalledWith({
      data: { name: "Notes", description: "Docs", userId: "user-1" },
      select: { id: true, name: true, description: true, isFavorite: true },
    });
    expect(result).toEqual(created);
  });
});

describe("getCollectionById", () => {
  it("returns the collection when it belongs to the user", async () => {
    const collection = { id: "col-1", name: "React Patterns", description: null, isFavorite: true };
    mockFindFirst.mockResolvedValue(collection as never);

    const result = await getCollectionById("user-1", "col-1");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: "col-1", userId: "user-1" },
      select: { id: true, name: true, description: true, isFavorite: true },
    });
    expect(result).toEqual(collection);
  });

  it("returns null when the collection is missing or owned by someone else", async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(getCollectionById("user-1", "col-other")).resolves.toBeNull();
  });
});

describe("getCollectionOptions", () => {
  it("returns all of the user's collections as id and name, sorted by name, with no limit", async () => {
    const options = [
      { id: "col-2", name: "AI Workflows" },
      { id: "col-1", name: "React Patterns" },
    ];
    mockFindMany.mockResolvedValue(options as never);

    const result = await getCollectionOptions("user-1");

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    expect(result).toEqual(options);
  });
});

describe("userOwnsCollections", () => {
  it("is true when every collection belongs to the user", async () => {
    mockCount.mockResolvedValue(2);
    await expect(userOwnsCollections("user-1", ["col-1", "col-2"])).resolves.toBe(true);
    expect(mockCount).toHaveBeenCalledWith({
      where: { id: { in: ["col-1", "col-2"] }, userId: "user-1" },
    });
  });

  it("is false when any collection is missing or owned by someone else", async () => {
    mockCount.mockResolvedValue(1);
    await expect(userOwnsCollections("user-1", ["col-1", "col-other"])).resolves.toBe(false);
  });

  it("ignores duplicate ids when comparing the count", async () => {
    mockCount.mockResolvedValue(1);
    await expect(userOwnsCollections("user-1", ["col-1", "col-1"])).resolves.toBe(true);
  });

  it("is true for an empty list without querying", async () => {
    await expect(userOwnsCollections("user-1", [])).resolves.toBe(true);
    expect(mockCount).not.toHaveBeenCalled();
  });
});
