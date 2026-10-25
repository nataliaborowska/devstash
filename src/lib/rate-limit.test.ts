import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClientIp, getRateLimitMessage, getRetryAfterSeconds, rateLimit } from "@/lib/rate-limit";

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1", "x-real-ip": "10.0.0.2" });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to unknown", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "10.0.0.2" }))).toBe("10.0.0.2");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("retry helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rounds the retry delay up to whole seconds, with a minimum of 1", () => {
    expect(getRetryAfterSeconds(Date.now() + 1500)).toBe(2);
    expect(getRetryAfterSeconds(Date.now() - 5000)).toBe(1);
  });

  it("formats the message in minutes", () => {
    expect(getRateLimitMessage(Date.now() + 30_000)).toBe("Too many attempts. Please try again in 1 minute.");
    expect(getRateLimitMessage(Date.now() + 14 * 60_000)).toBe("Too many attempts. Please try again in 14 minutes.");
  });
});

describe("rateLimit", () => {
  it("fails open when Upstash is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", undefined);
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", undefined);
    await expect(rateLimit("login", "203.0.113.7")).resolves.toEqual({ success: true, remaining: 5, reset: 0 });
  });
});
