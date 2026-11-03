import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { commentSchema } from '@/lib/validators/model';
import { cleanText, checkSensitive } from '@/lib/content';
import { rateLimit } from '@/lib/rate-limit';
export async function GET(_: Request, { params }: { params: { id: string } }) { return ok(await prisma.comment.findMany({ where: { modelId: params.id, removed: false }, include: { author: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })); }
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser(); if (error) return error;
  try {
    if (session!.user.status === 'MUTED') return fail('账号处于禁言状态', 403);
    if (!(await rateLimit(`comment:${session!.user.id}`, 20, 600)).success) return fail('评论过于频繁', 429);
    const input = commentSchema.parse(await request.json()); const content = cleanText(input.content);
    const sensitive = await checkSensitive(content); if (sensitive.hits.length) return fail('评论包含敏感词', 422);
    const comment = await prisma.comment.create({ data: { content, modelId: params.id, authorId: session!.user.id, parentId: input.parentId }, include: { author: { select: { id: true, name: true, image: true } } } });
    return ok(comment, 201);
  } catch (error) { return handleError(error); }
}
