import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { cleanText } from '@/lib/content';
export async function POST(request: Request, { params }: { params: { id: string } }) { const { session, error } = await requireUser(); if (error) return error; try { const report = await prisma.report.findUnique({ where: { id: params.id } }); if (!report || report.reporterId !== session!.user.id) return fail('举报记录不存在', 404); const appeal = cleanText(z.string().trim().min(5).max(1000).parse((await request.json()).appeal)); return ok(await prisma.report.update({ where: { id: params.id }, data: { status: 'APPEALING', appeal } })); } catch (e) { return handleError(e); } }
