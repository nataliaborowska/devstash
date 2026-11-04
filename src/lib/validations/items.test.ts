import { describe, expect, it } from "vitest";
import { createItemSchema, isCreatableItemType, updateItemSchema } from "@/lib/validations/items";

describe("isCreatableItemType", () => {
  it.each(["snippet", "prompt", "command", "note", "link"])("accepts %s", (type) => {
    expect(isCreatableItemType(type)).toBe(true);
  });

  it.each(["file", "image", "", "Snippet"])("rejects %j", (type) => {
    expect(isCreatableItemType(type)).toBe(false);
  });
});

const base = {
  title: "Item",
  description: "",
  content: "  echo hi",
  language: "bash",
  url: "https://example.com",
  tags: [],
};

describe("createItemSchema", () => {
  it("accepts every creatable type", () => {
    for (const type of ["snippet", "prompt", "command", "note", "link"] as const) {
      expect(createItemSchema.safeParse({ ...base, type }).success).toBe(true);
    }
  });

  it("rejects file and image types", () => {
    for (const type of ["file", "image"]) {
      const result = createItemSchema.safeParse({ ...base, type });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Choose an item type");
    }
  });

  it("requires a URL for links and reports it on the url field", () => {
    const result = createItemSchema.safeParse({ ...base, type: "link", url: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ message: "URL is required", path: ["url"] });
  });

  it("does not require a URL for other types", () => {
    const result = createItemSchema.safeParse({ ...base, type: "note", url: undefined });
    expect(result.success).toBe(true);
  });

  it("keeps content and language for snippets and commands, but not the URL", () => {
    for (const type of ["snippet", "command"] as const) {
      expect(createItemSchema.parse({ ...base, type })).toMatchObject({
        content: "  echo hi",
        language: "bash",
        url: null,
      });
    }
  });

  it("keeps content only for prompts and notes", () => {
    for (const type of ["prompt", "note"] as const) {
      expect(createItemSchema.parse({ ...base, type })).toMatchObject({
        content: "  echo hi",
        language: null,
        url: null,
      });
    }
  });

  it("keeps the URL only for links", () => {
    expect(createItemSchema.parse({ ...base, type: "link" })).toMatchObject({
      content: null,
      language: null,
      url: "https://example.com",
    });
  });

  it("nulls omitted type-specific fields and leaves an omitted description undefined", () => {
    const result = createItemSchema.parse({ type: "snippet", title: "Item", tags: [] });
    expect(result).toEqual({
      type: "snippet",
      title: "Item",
      description: undefined,
      content: null,
      language: null,
      url: null,
      tags: [],
    });
  });
});

describe("collectionId", () => {
  const base = { title: "Item", tags: [] };

  it("trims a selected collection id", () => {
    expect(updateItemSchema.parse({ ...base, collectionId: " col-1 " }).collectionId).toBe("col-1");
  });

  it("turns a blank collection id into null", () => {
    expect(updateItemSchema.parse({ ...base, collectionId: "  " }).collectionId).toBeNull();
  });

  it("keeps null so the item can leave its collection", () => {
    expect(updateItemSchema.parse({ ...base, collectionId: null }).collectionId).toBeNull();
  });

  it("leaves an omitted collection id undefined so it isn't changed", () => {
    expect(updateItemSchema.parse(base).collectionId).toBeUndefined();
  });

  it("is passed through by createItemSchema", () => {
    const result = createItemSchema.parse({ ...base, type: "note", collectionId: "col-1" });
    expect(result.collectionId).toBe("col-1");
  });
});
