import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/auth";
import { createCollection as createCollectionInDb } from "@/lib/db/collections";
import { createCollection } from "@/actions/collections";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({ createCollection: vi.fn() }));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockCreateCollectionInDb = vi.mocked(createCollectionInDb);

const createdCollection = {
  id: "col-1",
  name: "React Patterns",
  description: null,
  isFavorite: false,
};

describe("createCollection", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockCreateCollectionInDb.mockResolvedValue(createdCollection);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createCollection({ name: "React Patterns" });
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockCreateCollectionInDb).not.toHaveBeenCalled();
  });

  it("rejects a blank name", async () => {
    const result = await createCollection({ name: "   ", description: "Hooks" });
    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockCreateCollectionInDb).not.toHaveBeenCalled();
  });

  it("creates the collection for the signed-in user with normalized input", async () => {
    const result = await createCollection({ name: "  React Patterns  ", description: "  " });
    expect(mockCreateCollectionInDb).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
    expect(result).toEqual({ success: true, data: createdCollection });
  });

  it("returns a friendly error when the database call fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateCollectionInDb.mockRejectedValue(new Error("db down"));
    const result = await createCollection({ name: "React Patterns" });
    expect(result).toEqual({
      success: false,
      error: "Could not create the collection. Please try again.",
    });
  });
});
