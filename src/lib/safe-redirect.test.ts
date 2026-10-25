import { describe, expect, it } from "vitest";
import { DEFAULT_SIGN_IN_REDIRECT, getSafeCallbackUrl } from "@/lib/safe-redirect";

describe("getSafeCallbackUrl", () => {
  it("returns relative paths unchanged", () => {
    expect(getSafeCallbackUrl("/items/snippets")).toBe("/items/snippets");
    expect(getSafeCallbackUrl("/profile?tab=account")).toBe("/profile?tab=account");
  });

  it.each([
    ["absolute URL", "https://evil.example.com"],
    ["protocol-relative URL", "//evil.example.com"],
    ["backslash trick", "/\\evil.example.com"],
    ["path without leading slash", "dashboard"],
    ["empty string", ""],
  ])("falls back to the default for an %s", (_label, value) => {
    expect(getSafeCallbackUrl(value)).toBe(DEFAULT_SIGN_IN_REDIRECT);
  });

  it("falls back to the default for non-string values", () => {
    expect(getSafeCallbackUrl(null)).toBe(DEFAULT_SIGN_IN_REDIRECT);
    expect(getSafeCallbackUrl(undefined)).toBe(DEFAULT_SIGN_IN_REDIRECT);
    expect(getSafeCallbackUrl(42)).toBe(DEFAULT_SIGN_IN_REDIRECT);
  });
});
