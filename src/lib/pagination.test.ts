import { describe, expect, it } from "vitest";
import {
  getPageHref,
  getPageLinks,
  getTotalPages,
  parsePageParam,
  toSkipTake,
} from "@/lib/pagination";

describe("parsePageParam", () => {
  it("reads a positive integer page", () => {
    expect(parsePageParam("3")).toBe(3);
  });

  it("falls back to page 1 when missing", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("")).toBe(1);
  });

  it("falls back to page 1 for zero, negative, decimal, or non-numeric values", () => {
    for (const value of ["0", "-2", "1.5", "abc", "2abc", " 2", "1e3"]) {
      expect(parsePageParam(value)).toBe(1);
    }
  });

  it("falls back to page 1 for numbers beyond the safe integer range", () => {
    expect(parsePageParam("99999999999999999999")).toBe(1);
  });

  it("uses the first value when the param is repeated", () => {
    expect(parsePageParam(["4", "7"])).toBe(4);
  });
});

describe("getTotalPages", () => {
  it("rounds up partial pages", () => {
    expect(getTotalPages(22, 21)).toBe(2);
    expect(getTotalPages(21, 21)).toBe(1);
  });

  it("keeps one page for an empty list", () => {
    expect(getTotalPages(0, 21)).toBe(1);
  });
});

describe("toSkipTake", () => {
  it("skips the rows of earlier pages", () => {
    expect(toSkipTake({ page: 1, perPage: 21 })).toEqual({ skip: 0, take: 21 });
    expect(toSkipTake({ page: 3, perPage: 21 })).toEqual({ skip: 42, take: 21 });
  });
});

describe("getPageHref", () => {
  it("links page 1 to the bare path", () => {
    expect(getPageHref("/collections", 1)).toBe("/collections");
  });

  it("adds the page param for later pages", () => {
    expect(getPageHref("/items/snippets", 2)).toBe("/items/snippets?page=2");
  });
});

describe("getPageLinks", () => {
  it("shows a single page", () => {
    expect(getPageLinks(1, 1)).toEqual([1]);
  });

  it("shows every page when there are only a few", () => {
    expect(getPageLinks(1, 2)).toEqual([1, 2]);
    expect(getPageLinks(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the far end with an ellipsis near the start", () => {
    expect(getPageLinks(1, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("collapses the start with an ellipsis near the end", () => {
    expect(getPageLinks(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("collapses both sides around a middle page", () => {
    expect(getPageLinks(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("shows a single skipped page instead of an ellipsis", () => {
    expect(getPageLinks(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(getPageLinks(7, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });
});
