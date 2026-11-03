import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError, STAFF } from '@/lib/api';
import { audit } from '@/lib/audit';
const schema = z.object({ action: z.enum(['create', 'toggle', 'delete']), id: z.string().optional(), word: z.string().trim().min(1).max(50).optional(), severity: z.number().int().min(1).max(2).default(1), enabled: z.boolean().optional() });
export async function POST(request: Request) { const { session, error } = await requireUser(STAFF); if (error) return error; try { const input = schema.parse(await request.json()); const result = input.action === 'create' ? await prisma.sensitiveWord.create({ data: { word: input.word!, severity: input.severity } }) : input.action === 'delete' ? await prisma.sensitiveWord.delete({ where: { id: input.id } }) : await prisma.sensitiveWord.update({ where: { id: input.id }, data: { enabled: input.enabled } }); await audit({ actorId: session!.user.id, action: `SENSITIVE_${input.action.toUpperCase()}`, targetType: 'SENSITIVE_WORD', targetId: input.id, metadata: { word: input.word } }); return ok(result); } catch (e) { return handleError(e); } }
