import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/auth";
import {
  deleteItem as deleteItemInDb,
  updateItem as updateItemInDb,
  type ItemDetail,
} from "@/lib/db/items";
import { deleteItem, updateItem } from "@/actions/items";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn(), deleteItem: vi.fn() }));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockUpdateItemInDb = vi.mocked(updateItemInDb);
const mockDeleteItemInDb = vi.mocked(deleteItemInDb);

const validInput = {
  title: "  useAuth Hook  ",
  description: "",
  content: "  const x = 1",
  language: " typescript ",
  url: undefined,
  tags: [" react ", "hooks", "react"],
};

const updatedItem = { id: "item-1", title: "useAuth Hook" } as ItemDetail;

describe("updateItem", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemInDb.mockResolvedValue(updatedItem);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockUpdateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const result = await updateItem("item-1", { ...validInput, title: "   " });
    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockUpdateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects an invalid URL", async () => {
    const result = await updateItem("item-1", { ...validInput, url: "not a url" });
    expect(result).toEqual({ success: false, error: "URL must be a valid http(s) link" });
  });

  it("rejects non-http URLs", async () => {
    const result = await updateItem("item-1", { ...validInput, url: "javascript:alert(1)" });
    expect(result.success).toBe(false);
    expect(mockUpdateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects empty tags", async () => {
    const result = await updateItem("item-1", { ...validInput, tags: ["react", " "] });
    expect(result).toEqual({ success: false, error: "Tags cannot be empty" });
  });

  it("normalizes the input and saves it for the signed-in user", async () => {
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: true, data: updatedItem });
    expect(mockUpdateItemInDb).toHaveBeenCalledWith("user-1", "item-1", {
      title: "useAuth Hook",
      description: null,
      content: "  const x = 1",
      language: "typescript",
      url: undefined,
      tags: ["react", "hooks"],
    });
  });

  it("accepts a valid http(s) URL", async () => {
    await updateItem("item-1", { ...validInput, url: "https://nextjs.org/docs" });
    expect(mockUpdateItemInDb).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      expect.objectContaining({ url: "https://nextjs.org/docs" })
    );
  });

  it("returns not found when the item is missing or owned by someone else", async () => {
    mockUpdateItemInDb.mockResolvedValue(null);
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns a generic error when the database update fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateItemInDb.mockRejectedValue(new Error("db down"));
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: false, error: "Could not save the item. Please try again." });
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDeleteItemInDb.mockResolvedValue(true);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockDeleteItemInDb).not.toHaveBeenCalled();
  });

  it("rejects a blank item id", async () => {
    const result = await deleteItem("   ");
    expect(result).toEqual({ success: false, error: "Invalid item id" });
    expect(mockDeleteItemInDb).not.toHaveBeenCalled();
  });

  it("deletes the item for the signed-in user", async () => {
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(mockDeleteItemInDb).toHaveBeenCalledWith("user-1", "item-1");
  });

  it("trims whitespace around the item id", async () => {
    const result = await deleteItem("  item-1  ");
    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(mockDeleteItemInDb).toHaveBeenCalledWith("user-1", "item-1");
  });

  it("returns not found when the item is missing or owned by someone else", async () => {
    mockDeleteItemInDb.mockResolvedValue(false);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns a generic error when the database delete fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockDeleteItemInDb.mockRejectedValue(new Error("db down"));
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Could not delete the item. Please try again." });
  });
});
