import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const model = await prisma.model.findUnique({ where: { id: params.id }, select: { title: true, description: true, coverUrl: true, status: true } });
  if (!model || model.status !== 'APPROVED') return fail('模型不可分享', 404);
  return ok({ title: model.title, text: model.description.slice(0, 100), url: `/models/${params.id}`, image: model.coverUrl });
}
