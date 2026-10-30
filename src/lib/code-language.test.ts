import { describe, expect, it } from "vitest";
import { CODE_ITEM_TYPES, getFallbackCodeLanguage, toMonacoLanguage } from "@/lib/code-language";

describe("toMonacoLanguage", () => {
  it.each([
    ["ts", "typescript"],
    ["js", "javascript"],
    ["py", "python"],
    ["bash", "shell"],
    ["zsh", "shell"],
    ["yml", "yaml"],
    ["postgresql", "pgsql"],
  ])("maps the alias %s to %s", (alias, expected) => {
    expect(toMonacoLanguage(alias)).toBe(expected);
  });

  it("trims and lowercases the language before mapping", () => {
    expect(toMonacoLanguage("  TS ")).toBe("typescript");
    expect(toMonacoLanguage("Python")).toBe("python");
  });

  it("passes unknown languages through normalized", () => {
    expect(toMonacoLanguage("TypeScript")).toBe("typescript");
    expect(toMonacoLanguage("sql")).toBe("sql");
  });

  it.each([null, undefined, "", "   "])("returns plaintext for empty language %j", (language) => {
    expect(toMonacoLanguage(language)).toBe("plaintext");
  });

  it("uses the given fallback for empty languages", () => {
    expect(toMonacoLanguage(null, "shell")).toBe("shell");
    expect(toMonacoLanguage("ts", "shell")).toBe("typescript");
  });
});

describe("getFallbackCodeLanguage", () => {
  it("highlights commands as shell", () => {
    expect(getFallbackCodeLanguage("command")).toBe("shell");
  });

  it("falls back to plaintext for other types", () => {
    expect(getFallbackCodeLanguage("snippet")).toBe("plaintext");
  });
});

describe("CODE_ITEM_TYPES", () => {
  it("covers only snippets and commands", () => {
    expect(CODE_ITEM_TYPES).toEqual(["snippet", "command"]);
  });
});
