import { describe, expect, it } from "vitest";
import { EDITOR_THEME_DATA, EDITOR_THEME_LABELS, toMonacoThemeName } from "@/lib/editor-themes";
import { EDITOR_THEMES } from "@/lib/validations/editor-preferences";

describe("toMonacoThemeName", () => {
  it("prefixes theme names so built-in Monaco themes are never shadowed", () => {
    expect(toMonacoThemeName("vs-dark")).toBe("devstash-vs-dark");
    expect(toMonacoThemeName("github-dark")).toBe("devstash-github-dark");
  });
});

describe("EDITOR_THEME_DATA", () => {
  it.each(EDITOR_THEMES)("defines a dark theme and label for %s", (theme) => {
    expect(EDITOR_THEME_DATA[theme]).toMatchObject({ base: "vs-dark", inherit: true });
    expect(EDITOR_THEME_LABELS[theme]).toBeTruthy();
  });
});
