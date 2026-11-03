import { prisma } from '@/lib/prisma';
import { MODEL_SELECT } from '@/lib/utils';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { modelSchema } from '@/lib/validators/model';
import { saveModel } from '@/lib/model-service';
import { rateLimit, requestIp } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url); const page = Math.max(1, Number(searchParams.get('page')) || 1); const take = Math.min(50, Number(searchParams.get('take')) || 20);
  const models = await prisma.model.findMany({ where: { status: 'APPROVED', visibility: 'PUBLIC' }, select: MODEL_SELECT, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * take, take });
  return ok(models);
}
export async function POST(request: Request) {
  const { session, error } = await requireUser(); if (error) return error;
  try {
    if (session!.user.status === 'MUTED') return fail('账号处于禁言状态，暂时无法发布', 403);
    if (!(await rateLimit(`publish:${session!.user.id}`, 10, 3600)).success) return fail('发布过于频繁，请稍后再试', 429);
    const model = await saveModel(modelSchema.parse(await request.json()), session!.user.id);
    await audit({ actorId: session!.user.id, action: 'MODEL_SUBMIT', targetType: 'MODEL', targetId: model.id, ip: requestIp(request) });
    return ok(model, 201);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SENSITIVE:')) return fail(`内容命中敏感词：${error.message.slice(10)}`, 422);
    if (error instanceof Error && error.message === 'DUPLICATE_TAGS') return fail('标签不能重复', 422);
    if (error instanceof Error && error.message === 'TAG_RULE') return fail('标签长度不符合站点规则', 422);
    return handleError(error);
  }
}
