import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail } from '@/lib/api';
import { notify } from '@/lib/audit';
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser(); if (error) return error;
  const followerId = session!.user.id, followingId = params.id;
  if (followerId === followingId) return fail('不能关注自己', 422);
  const target = await prisma.user.findUnique({ where: { id: followingId }, select: { name: true, status: true } });
  if (!target || target.status === 'BANNED') return fail('用户不存在', 404);
  const key = { followerId_followingId: { followerId, followingId } };
  const existing = await prisma.follow.findUnique({ where: key });
  if (existing) await prisma.follow.delete({ where: key });
  else { await prisma.follow.create({ data: { followerId, followingId } }); await notify(followingId, 'FOLLOW', '你有一位新关注者', session!.user.name || '社区用户', `/u/${followerId}`); }
  return ok({ active: !existing });
}
export const DELETE = POST;
