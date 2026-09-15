import "server-only";

import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Duration =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

export interface RateLimitPolicy {
  name: string;
  limit: number;
  window: Duration;
  windowMs: number;
}

export const RATE_LIMIT_POLICIES = {
  loginIp: {
    name: "login-ip",
    limit: 10,
    window: "10 m",
    windowMs: 10 * 60_000,
  },
  loginAccount: {
    name: "login-account",
    limit: 5,
    window: "15 m",
    windowMs: 15 * 60_000,
  },
  register: {
    name: "register",
    limit: 5,
    window: "1 h",
    windowMs: 60 * 60_000,
  },
  contact: { name: "contact", limit: 5, window: "1 h", windowMs: 60 * 60_000 },
  createOrder: {
    name: "create-order",
    limit: 8,
    window: "1 m",
    windowMs: 60_000,
  },
  changePassword: {
    name: "change-password",
    limit: 5,
    window: "15 m",
    windowMs: 15 * 60_000,
  },
} as const satisfies Record<string, RateLimitPolicy>;

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface MemoryEntry {
  count: number;
  reset: number;
}

const globalForRateLimit = globalThis as unknown as {
  danaFarmRateLimitMemory?: Map<string, MemoryEntry>;
  danaFarmRateLimiters?: Map<string, Ratelimit>;
};

const memoryStore =
  globalForRateLimit.danaFarmRateLimitMemory ?? new Map<string, MemoryEntry>();
const distributedLimiters =
  globalForRateLimit.danaFarmRateLimiters ?? new Map<string, Ratelimit>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.danaFarmRateLimitMemory = memoryStore;
  globalForRateLimit.danaFarmRateLimiters = distributedLimiters;
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function getDistributedLimiter(policy: RateLimitPolicy) {
  const existing = distributedLimiters.get(policy.name);
  if (existing) return existing;

  const redis = getRedis();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: `danafarm:rate-limit:${policy.name}`,
    analytics: true,
  });
  distributedLimiters.set(policy.name, limiter);
  return limiter;
}

function cleanupMemoryStore(now: number) {
  if (memoryStore.size < 1_000) return;
  for (const [key, entry] of memoryStore) {
    if (entry.reset <= now) memoryStore.delete(key);
  }
}

function checkMemoryLimit(
  policy: RateLimitPolicy,
  identifier: string,
): RateLimitResult {
  const now = Date.now();
  cleanupMemoryStore(now);
  const key = `${policy.name}:${identifier}`;
  const existing = memoryStore.get(key);

  if (!existing || existing.reset <= now) {
    const reset = now + policy.windowMs;
    memoryStore.set(key, { count: 1, reset });
    return {
      success: true,
      limit: policy.limit,
      remaining: Math.max(0, policy.limit - 1),
      reset,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);
  return {
    success: existing.count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - existing.count),
    reset: existing.reset,
  };
}

export function getClientIp(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const vercelIp = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelIp) return vercelIp;

  const forwardedIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (forwardedIp) return forwardedIp;

  return "unknown";
}

export function hashRateLimitIdentifier(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getDistributedLimiter(policy);
  if (!limiter) return checkMemoryLimit(policy, identifier);

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error(`Distributed rate limit failed for ${policy.name}`, error);
    return checkMemoryLimit(policy, identifier);
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1_000),
  );
  return Response.json(
    {
      error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`,
      code: "RATE_LIMITED",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}

export async function enforceRateLimit(
  request: Request,
  policy: RateLimitPolicy,
  identifier = getClientIp(request),
) {
  const result = await checkRateLimit(policy, identifier);
  return result.success ? null : rateLimitResponse(result);
}
