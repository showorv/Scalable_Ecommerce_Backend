import Redis from "ioredis";
//I used Redis with ioredis. I created reusable helper functions for setting, getting, and invalidating cache. Data is stored as JSON with a TTL of 5 minutes. On read, I first check Redis, and on cache miss, I fetch from MongoDB and update the cache. I also implemented cache invalidation using key patterns after updates.

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Exponential back-off, max 30 s
    const delay = Math.min(times * 500, 30_000);
    console.warn(`Redis retry #${times} in ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET"];
    return targetErrors.some((e) => err.message.includes(e));
  },
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// Helper wrappers

/** Set a JSON value with optional TTL in seconds */
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> => {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

/** Get and parse a cached JSON value */
export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

/** Delete one or many cache keys */
export const deleteCache = async (...keys: string[]): Promise<void> => {
  if (keys.length) await redis.del(...keys);
};

/** Delete all keys matching a pattern (e.g. "products:*") */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
};

export default redis;