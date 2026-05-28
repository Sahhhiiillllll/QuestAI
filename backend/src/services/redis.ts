import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const redisConnection = {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port || '6379'),
};

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 3600) => {
  await redis.set(`vedaai:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const val = await redis.get(`vedaai:${key}`);
  if (!val) return null;
  return JSON.parse(val) as T;
};

export const cacheDel = async (key: string) => {
  await redis.del(`vedaai:${key}`);
};
