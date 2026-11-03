import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET() { try { await prisma.$queryRaw`SELECT 1`; return ok({ status: 'healthy', database: 'up', search: process.env.MEILISEARCH_HOST ? 'configured' : 'database-fallback', cache: process.env.REDIS_URL ? 'configured' : 'memory-fallback', storage: process.env.S3_BUCKET ? 's3' : 'local', timestamp: new Date().toISOString() }); } catch { return fail('数据库连接失败', 503, { status: 'unhealthy' }); } }
