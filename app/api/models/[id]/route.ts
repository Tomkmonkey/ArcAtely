import { prisma } from '@/lib/prisma';
import { MODEL_SELECT } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { requireUser, ok, fail, handleError, STAFF } from '@/lib/api';
import { modelSchema } from '@/lib/validators/model';
import { saveModel } from '@/lib/model-service';
import { removeModelFromIndex } from '@/lib/search';
import { audit } from '@/lib/audit';
type Context = { params: { id: string } };
export async function GET(_: Request, { params }: Context) {
  const session = await getSession();
  const model = await prisma.model.findUnique({ where: { id: params.id }, select: { ...MODEL_SELECT, authorId: true } });
  if (!model) return fail('模型不存在', 404);
  const own = session?.user.id === model.authorId, staff = session && STAFF.includes(session.user.role);
  if (model.status !== 'APPROVED' && !own && !staff) return fail('模型不存在或尚未公开', 404);
  if (model.visibility === 'PRIVATE' && !own && !staff) return fail('这是私密模型', 403);
  return ok(model);
}
export async function PATCH(request: Request, { params }: Context) {
  const { session, error } = await requireUser(); if (error) return error;
  try {
    const existing = await prisma.model.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!existing) return fail('模型不存在', 404);
    if (existing.authorId !== session!.user.id && !STAFF.includes(session!.user.role)) return fail('只能编辑自己的模型', 403);
    if (session!.user.status === 'MUTED') return fail('账号处于禁言状态', 403);
    const model = await saveModel(modelSchema.parse(await request.json()), existing.authorId, params.id);
    await audit({ actorId: session!.user.id, action: 'MODEL_EDIT_SUBMIT', targetType: 'MODEL', targetId: params.id });
    return ok(model);
  } catch (error) {
    if (error instanceof Error && error.message === 'TAG_RULE') return fail('标签长度不符合站点规则', 422);
    if (error instanceof Error && error.message.startsWith('SENSITIVE:')) return fail('内容包含敏感词', 422);
    return handleError(error);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  const { session, error } = await requireUser(); if (error) return error;
  const existing = await prisma.model.findUnique({ where: { id: params.id }, select: { authorId: true } });
  if (!existing) return fail('模型不存在', 404);
  if (existing.authorId !== session!.user.id && !STAFF.includes(session!.user.role)) return fail('只能删除自己的模型', 403);
  await prisma.model.update({ where: { id: params.id }, data: { status: 'REMOVED' } });
  await removeModelFromIndex(params.id);
  await audit({ actorId: session!.user.id, action: 'MODEL_REMOVE', targetType: 'MODEL', targetId: params.id });
  return ok({ removed: true });
}
