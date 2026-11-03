import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail } from '@/lib/api';
import { notify } from '@/lib/audit';
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser(); if (error) return error;
  const userId = session!.user.id, modelId = params.id;
  const model = await prisma.model.findUnique({ where: { id: modelId }, select: { authorId: true, title: true, status: true } });
  if (!model || model.status !== 'APPROVED') return fail('模型不可互动', 404);
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({ where: { userId_modelId: { userId, modelId } } });
    if (existing) { await tx.like.delete({ where: { userId_modelId: { userId, modelId } } }); await tx.model.update({ where: { id: modelId }, data: { likesCount: { decrement: 1 } } }); return false; }
    await tx.like.create({ data: { userId, modelId } }); await tx.model.update({ where: { id: modelId }, data: { likesCount: { increment: 1 } } }); return true;
  });
  if (result && model.authorId !== userId) await notify(model.authorId, 'LIKE', '有人赞了你的模型', model.title, `/models/${modelId}`);
  return ok({ active: result });
}
export const DELETE = POST;
