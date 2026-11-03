import Redis from 'ioredis';

const globalLimit = globalThis as unknown as { redis?: Redis; memory?: Map<string, { count: number; reset: number }> };
const memory = globalLimit.memory ?? new Map<string, { count: number; reset: number }>();
globalLimit.memory = memory;
function redis() {
  if (!process.env.REDIS_URL) return null;
  if (!globalLimit.redis) globalLimit.redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 0, enableOfflineQueue: false });
  return globalLimit.redis;
}

export async function rateLimit(key: string, limit = 60, windowSeconds = 60) {
  const client = redis();
  if (client) {
    try {
      if (client.status === 'wait') await client.connect();
      const fullKey = `rate:${key}`;
      const count = await client.incr(fullKey);
      if (count === 1) await client.expire(fullKey, windowSeconds);
      return { success: count <= limit, remaining: Math.max(0, limit - count) };
    } catch { /* 开发/单实例降级 */ }
  }
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.reset <= now) {
    memory.set(key, { count: 1, reset: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { success: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}
export function requestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
