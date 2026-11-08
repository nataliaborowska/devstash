import { describe, expect, it } from "vitest";
import { SEARCH_PREVIEW_LENGTH, toSearchPreview } from "@/lib/search";

describe("toSearchPreview", () => {
  it("returns null for missing or blank text", () => {
    expect(toSearchPreview(null)).toBeNull();
    expect(toSearchPreview(undefined)).toBeNull();
    expect(toSearchPreview("")).toBeNull();
    expect(toSearchPreview("  \n\t ")).toBeNull();
  });

  it("collapses whitespace and newlines into single spaces", () => {
    expect(toSearchPreview("  const a = 1;\n\n  const b = 2;  ")).toBe("const a = 1; const b = 2;");
  });

  it("keeps text at exactly the max length unchanged", () => {
    const text = "a".repeat(10);
    expect(toSearchPreview(text, 10)).toBe(text);
  });

  it("truncates long text with an ellipsis within the max length", () => {
    const result = toSearchPreview("abcdefghijkl", 6);
    expect(result).toBe("abcde…");
    expect(result).toHaveLength(6);
  });

  it("trims trailing spaces before the ellipsis", () => {
    expect(toSearchPreview("abcd efgh", 6)).toBe("abcd…");
  });

  it("defaults to SEARCH_PREVIEW_LENGTH", () => {
    expect(toSearchPreview("x".repeat(500))).toHaveLength(SEARCH_PREVIEW_LENGTH);
  });
});
