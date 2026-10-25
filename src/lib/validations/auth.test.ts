import { describe, expect, it } from "vitest";
import { registerSchema, signInSchema } from "@/lib/validations/auth";

describe("signInSchema", () => {
  it("normalizes the email", () => {
    const result = signInSchema.parse({ email: "Demo@DevStash.io", password: "secret" });
    expect(result.email).toBe("demo@devstash.io");
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { name: "  Ada  ", email: "ada@example.com", password: "12345678", confirmPassword: "12345678" };

  it("accepts valid input and trims the name", () => {
    expect(registerSchema.parse(valid).name).toBe("Ada");
  });

  it("requires at least 8 password characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "1234567", confirmPassword: "1234567" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Password must be at least 8 characters");
  });

  it("reports mismatched passwords on confirmPassword", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});
