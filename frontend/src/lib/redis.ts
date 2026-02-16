import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | null = null;
let _rateLimiter: Ratelimit | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "https://placeholder.upstash.io",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "placeholder",
    });
  }
  return _redis;
}

// Rate limiter: 20 requests per 10 seconds per IP
export function getRateLimiter(): Ratelimit {
  if (!_rateLimiter) {
    _rateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
    });
  }
  return _rateLimiter;
}

// Exported alias for backward compat
export const rateLimiter = {
  limit: async (identifier: string) => getRateLimiter().limit(identifier),
};

// Cache helpers
const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await getRedis().get<T>(key);
  } catch {
    return null; // Graceful degradation if Redis is unavailable
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL
): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
  } catch {
    // Graceful degradation
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  } catch {
    // Graceful degradation
  }
}
