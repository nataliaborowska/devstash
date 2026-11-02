import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createCollection,
  getFavoriteCollections,
  getNonFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";

vi.mock("@/lib/prisma", () => ({
  prisma: { collection: { findMany: vi.fn(), create: vi.fn() } },
}));

const mockFindMany = vi.mocked(prisma.collection.findMany);
const mockCreate = vi.mocked(prisma.collection.create);

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

  it("maps item counts, types by frequency, and the dominant color", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        items: [
          { typeId: "type-2", type: linkType },
          { typeId: "type-1", type: snippetType },
          { typeId: "type-1", type: snippetType },
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
