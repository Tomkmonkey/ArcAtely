import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError, ADMINS } from '@/lib/api';
import { indexModel, removeModelFromIndex } from '@/lib/search';
import { audit } from '@/lib/audit';
export async function PATCH(request: Request, { params }: { params: { id: string } }) { const { session, error } = await requireUser(ADMINS); if (error) return error; try { const data = z.object({ featured: z.boolean().optional(), pinned: z.boolean().optional(), status: z.enum(['APPROVED', 'REMOVED']).optional() }).parse(await request.json()); const model = await prisma.model.update({ where: { id: params.id }, data }); if (data.status === 'REMOVED') await removeModelFromIndex(params.id); else await indexModel(params.id); await audit({ actorId: session!.user.id, action: 'MODEL_ADMIN_UPDATE', targetType: 'MODEL', targetId: params.id, metadata: data }); return ok(model); } catch (e) { return handleError(e); } }
