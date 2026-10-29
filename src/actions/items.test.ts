import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/auth";
import {
  createItem as createItemInDb,
  deleteItem as deleteItemInDb,
  updateItem as updateItemInDb,
  type ItemDetail,
} from "@/lib/db/items";
import { createItem, deleteItem, updateItem } from "@/actions/items";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn() }));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockCreateItemInDb = vi.mocked(createItemInDb);
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

describe("createItem", () => {
  const snippetInput = {
    type: "snippet" as const,
    title: "  useAuth Hook  ",
    description: "",
    content: "  const x = 1",
    language: " typescript ",
    url: "https://stale.example.com",
    tags: [" react ", "hooks", "react"],
  };

  const createdItem = { id: "item-new", title: "useAuth Hook" } as ItemDetail;

  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockCreateItemInDb.mockResolvedValue(createdItem);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createItem(snippetInput);
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const result = await createItem({ ...snippetInput, title: "   " });
    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects types that can't be created from the form", async () => {
    const result = await createItem({ ...snippetInput, type: "file" as never });
    expect(result).toEqual({ success: false, error: "Choose an item type" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("requires a URL for links", async () => {
    const result = await createItem({ type: "link", title: "Next.js docs", url: " ", tags: [] });
    expect(result).toEqual({ success: false, error: "URL is required" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects non-http URLs for links", async () => {
    const result = await createItem({
      type: "link",
      title: "Bad link",
      url: "javascript:alert(1)",
      tags: [],
    });
    expect(result).toEqual({ success: false, error: "URL must be a valid http(s) link" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("normalizes the input, drops fields the type doesn't use, and saves it for the user", async () => {
    const result = await createItem(snippetInput);
    expect(result).toEqual({ success: true, data: createdItem });
    expect(mockCreateItemInDb).toHaveBeenCalledWith("user-1", {
      type: "snippet",
      title: "useAuth Hook",
      description: null,
      content: "  const x = 1",
      language: "typescript",
      url: null,
      tags: ["react", "hooks"],
    });
  });

  it("keeps the URL but drops content and language for links", async () => {
    await createItem({
      ...snippetInput,
      type: "link",
      title: "Next.js docs",
      url: "https://nextjs.org/docs",
    });
    expect(mockCreateItemInDb).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        type: "link",
        url: "https://nextjs.org/docs",
        content: null,
        language: null,
      })
    );
  });

  it("keeps content but drops language for prompts", async () => {
    await createItem({ ...snippetInput, type: "prompt" });
    expect(mockCreateItemInDb).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ type: "prompt", content: "  const x = 1", language: null, url: null })
    );
  });

  it("returns an error when the system item type is missing", async () => {
    mockCreateItemInDb.mockResolvedValue(null);
    const result = await createItem(snippetInput);
    expect(result).toEqual({ success: false, error: "Item type not found" });
  });

  it("returns a generic error when the database insert fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateItemInDb.mockRejectedValue(new Error("db down"));
    const result = await createItem(snippetInput);
    expect(result).toEqual({
      success: false,
      error: "Could not create the item. Please try again.",
    });
  });
});
