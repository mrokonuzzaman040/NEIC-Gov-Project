import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface Bucket { count: number; expires: number; }
const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
const windowMs = windowSeconds * 1000;
const store = new Map<string, Bucket>();

let upstash: Ratelimit | null = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    upstash = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`) });
  }
} catch {
  upstash = null;
}

export async function checkRateLimit(identifier: string) {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: max };
  }

  if (upstash) {
    try {
      const { success, remaining } = await upstash.limit(identifier);
      return { allowed: success, remaining };
    } catch {
      // fall through to in-memory
    }
  }
  const now = Date.now();
  const bucket = store.get(identifier);
  if (!bucket || bucket.expires < now) {
    store.set(identifier, { count: 1, expires: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (bucket.count >= max) return { allowed: false, remaining: 0 };
  bucket.count++;
  return { allowed: true, remaining: max - bucket.count };
}

