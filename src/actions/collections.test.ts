import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  updateCollection as updateCollectionInDb,
} from "@/lib/db/collections";
import { createCollection, deleteCollection, updateCollection } from "@/actions/collections";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockCreateCollectionInDb = vi.mocked(createCollectionInDb);
const mockUpdateCollectionInDb = vi.mocked(updateCollectionInDb);
const mockDeleteCollectionInDb = vi.mocked(deleteCollectionInDb);

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

describe("updateCollection", () => {
  const updatedCollection = { ...createdCollection, name: "Hooks", description: "Custom hooks" };

  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateCollectionInDb.mockResolvedValue(updatedCollection);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateCollection("col-1", { name: "Hooks" });
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockUpdateCollectionInDb).not.toHaveBeenCalled();
  });

  it("rejects a blank collection id", async () => {
    const result = await updateCollection("  ", { name: "Hooks" });
    expect(result).toEqual({ success: false, error: "Invalid collection id" });
    expect(mockUpdateCollectionInDb).not.toHaveBeenCalled();
  });

  it("rejects a blank name", async () => {
    const result = await updateCollection("col-1", { name: "  " });
    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockUpdateCollectionInDb).not.toHaveBeenCalled();
  });

  it("updates the user's collection with normalized input", async () => {
    const result = await updateCollection("col-1", {
      name: "  Hooks ",
      description: " Custom hooks ",
    });
    expect(mockUpdateCollectionInDb).toHaveBeenCalledWith("user-1", "col-1", {
      name: "Hooks",
      description: "Custom hooks",
    });
    expect(result).toEqual({ success: true, data: updatedCollection });
  });

  it("returns not found when the collection isn't the user's", async () => {
    mockUpdateCollectionInDb.mockResolvedValue(null);
    const result = await updateCollection("col-x", { name: "Hooks" });
    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("returns a friendly error when the database call fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateCollectionInDb.mockRejectedValue(new Error("db down"));
    const result = await updateCollection("col-1", { name: "Hooks" });
    expect(result).toEqual({
      success: false,
      error: "Could not update the collection. Please try again.",
    });
  });
});

describe("deleteCollection", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDeleteCollectionInDb.mockResolvedValue(true);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deleteCollection("col-1");
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockDeleteCollectionInDb).not.toHaveBeenCalled();
  });

  it("rejects a blank collection id", async () => {
    const result = await deleteCollection("  ");
    expect(result).toEqual({ success: false, error: "Invalid collection id" });
    expect(mockDeleteCollectionInDb).not.toHaveBeenCalled();
  });

  it("deletes the user's collection", async () => {
    const result = await deleteCollection(" col-1 ");
    expect(mockDeleteCollectionInDb).toHaveBeenCalledWith("user-1", "col-1");
    expect(result).toEqual({ success: true, data: { id: "col-1" } });
  });

  it("does not redirect by default", async () => {
    await deleteCollection("col-1");
    expect(redirect).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates and redirects to /collections when asked", async () => {
    await expect(deleteCollection("col-1", { redirectToCollections: true })).rejects.toThrow(
      "NEXT_REDIRECT"
    );
    expect(mockDeleteCollectionInDb).toHaveBeenCalledWith("user-1", "col-1");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(redirect).toHaveBeenCalledWith("/collections");
  });

  it("does not redirect when nothing was deleted", async () => {
    mockDeleteCollectionInDb.mockResolvedValue(false);
    const result = await deleteCollection("col-x", { redirectToCollections: true });
    expect(result).toEqual({ success: false, error: "Collection not found" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns not found when nothing was deleted", async () => {
    mockDeleteCollectionInDb.mockResolvedValue(false);
    const result = await deleteCollection("col-x");
    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("returns a friendly error when the database call fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockDeleteCollectionInDb.mockRejectedValue(new Error("db down"));
    const result = await deleteCollection("col-1");
    expect(result).toEqual({
      success: false,
      error: "Could not delete the collection. Please try again.",
    });
  });
});
