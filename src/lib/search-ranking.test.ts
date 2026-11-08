import { describe, expect, it } from "vitest";
import { MIN_FUZZY_SCORE, rankBySearch, scoreSearchMatch } from "@/lib/search-ranking";

const longPreview =
  "export function useAuth() { const session = useSession(); return session }";

describe("scoreSearchMatch", () => {
  it("matches everything for a blank query", () => {
    expect(scoreSearchMatch("   ", { primary: ["anything"] })).toBeGreaterThan(0);
  });

  it("matches a substring of a primary field, case-insensitively", () => {
    expect(scoreSearchMatch("TEST", { primary: ["Vitest setup"] })).toBeGreaterThanOrEqual(2);
  });

  it("accepts strong fuzzy matches on primary fields", () => {
    const score = scoreSearchMatch("rpat", { primary: ["React Patterns"] });
    expect(score).toBeGreaterThanOrEqual(1 + MIN_FUZZY_SCORE);
    expect(score).toBeLessThan(2);
  });

  it("rejects scattered letter matches in primary fields", () => {
    expect(scoreSearchMatch("test", { primary: [longPreview] })).toBe(0);
  });

  it("does not fuzzy match secondary fields", () => {
    expect(scoreSearchMatch("test", { primary: ["useAuth Hook"], secondary: [longPreview] })).toBe(0);
  });

  it("matches a substring of a secondary field below primary matches", () => {
    const score = scoreSearchMatch("usesession", { primary: ["useAuth Hook"], secondary: [longPreview] });
    expect(score).toBe(0.5);
  });

  it("ignores null secondary fields", () => {
    expect(scoreSearchMatch("x", { primary: ["abc"], secondary: [null, undefined] })).toBe(0);
  });
});

describe("rankBySearch", () => {
  const entries = [
    { title: "useAuth Hook", preview: longPreview },
    { title: "Docs", preview: "Read the test guide" },
    { title: "Test helpers", preview: null },
    { title: "Vitest setup", preview: null },
  ];
  const fields = (entry: (typeof entries)[number]) => ({
    primary: [entry.title],
    secondary: [entry.preview],
  });

  it("returns every entry in original order for a blank query", () => {
    expect(rankBySearch(entries, "", fields)).toBe(entries);
  });

  it("drops non-matches and puts title matches before preview matches", () => {
    const titles = rankBySearch(entries, "test", fields).map((entry) => entry.title);
    expect(titles).toEqual(["Test helpers", "Vitest setup", "Docs"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(rankBySearch(entries, "zzz", fields)).toEqual([]);
  });
});
