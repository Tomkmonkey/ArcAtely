import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { reportSchema } from '@/lib/validators/model';
import { cleanText } from '@/lib/content';
import { audit } from '@/lib/audit';
import { getSiteSettings } from '@/lib/settings';
export async function POST(request: Request) { const { session, error } = await requireUser(); if (error) return error; try { const body = await request.json(); const input = reportSchema.parse(body); const targetType = String(body.targetType || 'USER'), targetId = String(body.targetId || ''); if (!targetId) return ok(null, 422); const settings = await getSiteSettings(); if (!settings.reportReasons.includes(input.reason) && input.reason !== '私信骚扰') return fail('请选择有效的举报原因', 422); const report = await prisma.report.create({ data: { reporterId: session!.user.id, targetType, targetId, reason: cleanText(input.reason), details: input.details ? cleanText(input.details) : null } }); await audit({ actorId: session!.user.id, action: 'REPORT_CREATE', targetType, targetId }); return ok(report, 201); } catch (e) { return handleError(e); } }
