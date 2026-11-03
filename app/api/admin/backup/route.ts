import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError } from '@/lib/api';
import { createBackup } from '@/lib/backup';
import { audit } from '@/lib/audit';
export const runtime = 'nodejs'; export const maxDuration = 300;
export async function GET() { const { error } = await requireUser(['SUPER_ADMIN']); if (error) return error; return ok(await prisma.backupRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })); }
export async function POST() { const { session, error } = await requireUser(['SUPER_ADMIN']); if (error) return error; try { const backup = await createBackup(session!.user.id); await audit({ actorId: session!.user.id, action: 'BACKUP_CREATE', targetType: 'BACKUP', targetId: backup.id, metadata: { filename: backup.filename } }); return ok(backup, 201); } catch (e) { return handleError(e); } }
