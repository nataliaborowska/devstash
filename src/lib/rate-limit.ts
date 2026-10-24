import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const RATE_LIMITS = {
  login: { limit: 5, window: "15 m" },
  register: { limit: 3, window: "1 h" },
  forgotPassword: { limit: 3, window: "1 h" },
  resetPassword: { limit: 5, window: "15 m" },
} as const satisfies Record<string, { limit: number; window: Duration }>;

export type RateLimitName = keyof typeof RATE_LIMITS;

// Created once per server instance so Upstash's ephemeral cache survives between requests.
const limiters = new Map<RateLimitName, Ratelimit>();
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    redis = url && token ? new Redis({ url, token }) : null;
  }
  return redis;
}

function getLimiter(name: RateLimitName, client: Redis): Ratelimit {
  let limiter = limiters.get(name);
  if (!limiter) {
    const { limit, window } = RATE_LIMITS[name];
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ratelimit:${name}`,
      timeout: 2000,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

/** Fails open: the request is allowed when Upstash is not configured or unreachable. */
export async function rateLimit(name: RateLimitName, identifier: string): Promise<RateLimitResult> {
  const allowed = { success: true, remaining: RATE_LIMITS[name].limit, reset: 0 };
  const client = getRedis();
  if (!client) return allowed;

  try {
    const { success, remaining, reset } = await getLimiter(name, client).limit(identifier);
    return { success, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed", error);
    return allowed;
  }
}

/** Vercel sets x-forwarded-for; the first entry is the original client. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headers.get("x-real-ip") || "unknown";
}

export function getRetryAfterSeconds(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

export function getRateLimitMessage(reset: number): string {
  const minutes = Math.ceil(getRetryAfterSeconds(reset) / 60);
  return `Too many attempts. Please try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}
