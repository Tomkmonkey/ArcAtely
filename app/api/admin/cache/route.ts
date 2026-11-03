import Redis from 'ioredis';
import { requireUser, ok, fail } from '@/lib/api';
import { audit } from '@/lib/audit';
export async function POST() { const { session, error } = await requireUser(['SUPER_ADMIN']); if (error) return error; if (!process.env.REDIS_URL) return fail('未配置 Redis，当前使用进程内缓存', 422); const redis = new Redis(process.env.REDIS_URL); try { let cursor = '0', count = 0; do { const [next, keys] = await redis.scan(cursor, 'MATCH', 'rate:*', 'COUNT', 200); cursor = next; if (keys.length) { await redis.del(...keys); count += keys.length; } } while (cursor !== '0'); await audit({ actorId: session!.user.id, action: 'CACHE_CLEAR', targetType: 'REDIS', metadata: { count, scope: 'rate:*' } }); return ok({ cleared: count }); } finally { redis.disconnect(); } }
