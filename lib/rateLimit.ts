import type Redis from 'ioredis';
import { getRedisClient } from './redis';

interface Bucket { count: number; expires: number; }
const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
const windowMs = windowSeconds * 1000;
const inMemoryBuckets = new Map<string, Bucket>();

let redisClient: Redis | null = null;
try {
  redisClient = getRedisClient();
} catch {
  redisClient = null;
}

async function checkRedisRateLimit(identifier: string) {
  if (!redisClient) {
    try {
      redisClient = getRedisClient();
    } catch {
      redisClient = null;
    }
  }

  const client = redisClient;
  if (!client) {
    return null;
  }

  const key = `ratelimit:${identifier}`;

  try {
    const current = await client.incr(key);

    if (current === 1) {
      await client.pexpire(key, windowMs);
    }

    if (current > max) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: Math.max(0, max - current) };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Redis rate limit error:', error);
    }

    return null;
  }
}

function checkInMemoryRateLimit(identifier: string) {
  const now = Date.now();
  const bucket = inMemoryBuckets.get(identifier);
  if (!bucket || bucket.expires < now) {
    inMemoryBuckets.set(identifier, { count: 1, expires: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (bucket.count >= max) return { allowed: false, remaining: 0 };
  bucket.count++;
  return { allowed: true, remaining: max - bucket.count };
}

export async function checkRateLimit(identifier: string) {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: max };
  }

  const redisResult = await checkRedisRateLimit(identifier);
  if (redisResult) {
    return redisResult;
  }

  return checkInMemoryRateLimit(identifier);
}
