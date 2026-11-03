import { prisma } from '@/lib/prisma';
import { requireUser, ok } from '@/lib/api';
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser(); if (error) return error;
  const userId = session!.user.id, modelId = params.id;
  await prisma.viewHistory.upsert({ where: { userId_modelId: { userId, modelId } }, create: { userId, modelId }, update: { viewedAt: new Date() } });
  return ok({ recorded: true });
}
