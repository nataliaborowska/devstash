import { describe, expect, it } from "vitest";
import {
  createItemSchema,
  isCreatableItemType,
  isFavoriteSchema,
  isPinnedSchema,
  updateItemSchema,
} from "@/lib/validations/items";

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

describe("collectionIds", () => {
  const base = { title: "Item", tags: [] };

  it("trims and dedupes the selected collection ids", () => {
    const result = updateItemSchema.parse({ ...base, collectionIds: [" col-1 ", "col-2", "col-1"] });
    expect(result.collectionIds).toEqual(["col-1", "col-2"]);
  });

  it("keeps an empty list so the item can leave every collection", () => {
    expect(updateItemSchema.parse({ ...base, collectionIds: [] }).collectionIds).toEqual([]);
  });

  it("rejects blank ids", () => {
    const result = updateItemSchema.safeParse({ ...base, collectionIds: ["col-1", " "] });
    expect(result.success).toBe(false);
  });

  it("leaves omitted collection ids undefined so they aren't changed", () => {
    expect(updateItemSchema.parse(base).collectionIds).toBeUndefined();
  });

  it("is passed through by createItemSchema", () => {
    const result = createItemSchema.parse({ ...base, type: "note", collectionIds: ["col-1"] });
    expect(result.collectionIds).toEqual(["col-1"]);
  });
});

describe("isFavoriteSchema", () => {
  it.each([true, false])("accepts %s", (value) => {
    expect(isFavoriteSchema.parse(value)).toBe(value);
  });

  it.each(["true", 1, null, undefined])("rejects %s", (value) => {
    const result = isFavoriteSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Invalid favorite value");
  });
});

describe("isPinnedSchema", () => {
  it.each([true, false])("accepts %s", (value) => {
    expect(isPinnedSchema.parse(value)).toBe(value);
  });

  it.each(["true", 1, null, undefined])("rejects %s", (value) => {
    const result = isPinnedSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Invalid pin value");
  });
});
