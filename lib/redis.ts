import type Redis from 'ioredis';
import IORedis from 'ioredis';

const REDIS_TLS_ENABLED = process.env.REDIS_TLS === 'true';

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _redisClient: Redis | null | undefined;
}

function getConfigFromEnv(): RedisConfig | null {
  const url = process.env.REDIS_URL?.trim();
  if (url) {
    return { url };
  }

  const host = process.env.REDIS_HOST?.trim();
  if (!host) {
    return null;
  }

  const port = Number.parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const username = process.env.REDIS_USERNAME?.trim();
  const password = process.env.REDIS_PASSWORD?.trim();

  return { host, port, username, password };
}

function createRedisClient(config: RedisConfig): Redis {
  const commonOptions = {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 5_000,
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
  };

  if (config.url) {
    return new IORedis(config.url, {
      ...commonOptions,
      tls: REDIS_TLS_ENABLED ? {} : undefined
    });
  }

  return new IORedis({
    ...commonOptions,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    tls: REDIS_TLS_ENABLED ? {} : undefined
  });
}

export function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (global._redisClient !== undefined) {
    return global._redisClient;
  }

  const config = getConfigFromEnv();
  if (!config) {
    global._redisClient = null;
    return null;
  }

  try {
    const client = createRedisClient(config);
    client.on('error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Redis error:', error);
      }
    });
    global._redisClient = client;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to initialize Redis client:', error);
    }
    global._redisClient = null;
  }

  return global._redisClient ?? null;
}

export async function disconnectRedis(): Promise<void> {
  if (global._redisClient) {
    try {
      await global._redisClient.quit();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error closing Redis connection:', error);
      }
    } finally {
      global._redisClient = null;
    }
  }
}
