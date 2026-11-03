import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError, ADMINS } from '@/lib/api';
import { removeModelFromIndex, indexModel } from '@/lib/search';
import { audit } from '@/lib/audit';
export async function POST(request: Request) { const { session, error } = await requireUser(ADMINS); if (error) return error; try { const { ids, action } = z.object({ ids: z.array(z.string()).min(1).max(100), action: z.enum(['feature', 'unfeature', 'remove', 'restore']) }).parse(await request.json()); const data = action === 'feature' ? { featured: true } : action === 'unfeature' ? { featured: false } : action === 'remove' ? { status: 'REMOVED' as const } : { status: 'APPROVED' as const }; await prisma.model.updateMany({ where: { id: { in: ids } }, data }); await Promise.all(ids.map((id) => action === 'remove' ? removeModelFromIndex(id) : indexModel(id))); await audit({ actorId: session!.user.id, action: `MODEL_BULK_${action.toUpperCase()}`, targetType: 'MODEL', metadata: { ids } }); return ok({ count: ids.length }); } catch (e) { return handleError(e); } }
