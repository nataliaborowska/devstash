import { describe, expect, it, vi } from "vitest";
import { isEmailVerificationEnabled } from "@/lib/feature-flags";

describe("isEmailVerificationEnabled", () => {
  it('is enabled only when the flag is exactly "true"', () => {
    vi.stubEnv("EMAIL_VERIFICATION_ENABLED", "true");
    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it.each(["false", "TRUE", "1", ""])('is disabled when the flag is "%s"', (value) => {
    vi.stubEnv("EMAIL_VERIFICATION_ENABLED", value);
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it("is disabled when the flag is unset", () => {
    vi.stubEnv("EMAIL_VERIFICATION_ENABLED", undefined);
    expect(isEmailVerificationEnabled()).toBe(false);
  });
});
