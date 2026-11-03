import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { reportSchema } from '@/lib/validators/model';
import { cleanText } from '@/lib/content';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { getSiteSettings } from '@/lib/settings';
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser(); if (error) return error;
  try {
    if (!(await rateLimit(`report:${session!.user.id}`, 10, 3600)).success) return fail('举报过于频繁', 429);
    const input = reportSchema.parse(await request.json());
    const settings = await getSiteSettings();
    if (!settings.reportReasons.includes(input.reason)) return fail('请选择有效的举报原因', 422);
    const model = await prisma.model.findUnique({ where: { id: params.id }, select: { id: true } }); if (!model) return fail('模型不存在', 404);
    const report = await prisma.report.create({ data: { reporterId: session!.user.id, targetType: 'MODEL', targetId: params.id, reason: cleanText(input.reason), details: input.details ? cleanText(input.details) : null } });
    await audit({ actorId: session!.user.id, action: 'REPORT_CREATE', targetType: 'MODEL', targetId: params.id });
    return ok(report, 201);
  } catch (error) { return handleError(error); }
}
