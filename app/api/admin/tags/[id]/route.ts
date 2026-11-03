import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError, ADMINS } from '@/lib/api';
import { audit } from '@/lib/audit';
export async function PATCH(request: Request, { params }: { params: { id: string } }) { const { session, error } = await requireUser(ADMINS); if (error) return error; try { const data = z.object({ name: z.string().trim().min(1).max(20).optional(), description: z.string().max(300).optional(), approved: z.boolean().optional() }).parse(await request.json()); return ok(await prisma.$transaction(async (tx) => { const tag = await tx.tag.update({ where: { id: params.id }, data }); await audit({ actorId: session!.user.id, action: 'TAG_UPDATE', targetType: 'TAG', targetId: params.id, metadata: data }); return tag; })); } catch (e) { return handleError(e); } }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { const { session, error } = await requireUser(ADMINS); if (error) return error; await prisma.tag.delete({ where: { id: params.id } }); await audit({ actorId: session!.user.id, action: 'TAG_DELETE', targetType: 'TAG', targetId: params.id }); return ok({ deleted: true }); }
