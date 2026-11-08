import { describe, expect, it } from "vitest";
import {
  DEFAULT_EDITOR_PREFERENCES,
  editorPreferencesSchema,
  parseEditorPreferences,
} from "@/lib/validations/editor-preferences";

const custom = {
  fontSize: 16,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "monokai",
} as const;

describe("DEFAULT_EDITOR_PREFERENCES", () => {
  it("matches the spec defaults", () => {
    expect(DEFAULT_EDITOR_PREFERENCES).toMatchObject({
      wordWrap: true,
      minimap: false,
      theme: "vs-dark",
    });
    expect(editorPreferencesSchema.safeParse(DEFAULT_EDITOR_PREFERENCES).success).toBe(true);
  });
});

describe("editorPreferencesSchema", () => {
  it("accepts valid preferences", () => {
    expect(editorPreferencesSchema.parse(custom)).toEqual(custom);
  });

  it.each([
    ["font size", { fontSize: 15 }, "Invalid font size"],
    ["tab size", { tabSize: 3 }, "Invalid tab size"],
    ["theme", { theme: "dracula" }, "Invalid theme"],
    ["word wrap", { wordWrap: "yes" }, "Invalid word wrap setting"],
    ["minimap", { minimap: 1 }, "Invalid minimap setting"],
  ])("rejects an invalid %s", (_label, override, message) => {
    const result = editorPreferencesSchema.safeParse({ ...custom, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it("rejects missing fields", () => {
    expect(editorPreferencesSchema.safeParse({ fontSize: 14 }).success).toBe(false);
  });

  it("strips unknown fields", () => {
    expect(editorPreferencesSchema.parse({ ...custom, extra: "x" })).toEqual(custom);
  });
});

describe("parseEditorPreferences", () => {
  it.each([null, undefined, "vs-dark", 42, [custom]])("returns defaults for %j", (value) => {
    expect(parseEditorPreferences(value)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns a copy of the defaults, not the shared object", () => {
    expect(parseEditorPreferences(null)).not.toBe(DEFAULT_EDITOR_PREFERENCES);
  });

  it("keeps valid stored values", () => {
    expect(parseEditorPreferences(custom)).toEqual(custom);
  });

  it("falls back per field for missing or invalid values", () => {
    expect(parseEditorPreferences({ fontSize: 18, tabSize: 5, theme: "dracula", extra: 1 })).toEqual({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 18,
    });
  });
});
