import { describe, expect, it } from "vitest";
import { createItemSchema } from "@/lib/validations/items";

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
