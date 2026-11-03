import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { audit } from '@/lib/audit';
const exec = promisify(execFile); export const runtime = 'nodejs'; export const maxDuration = 300;
export async function POST(request: Request, { params }: { params: { id: string } }) { const { session, error } = await requireUser(['SUPER_ADMIN']); if (error) return error; try { const { confirm } = z.object({ confirm: z.literal('RESTORE') }).parse(await request.json()); if (!confirm) return fail('确认文字不正确', 422); const backup = await prisma.backupRecord.findUnique({ where: { id: params.id } }); if (!backup || backup.status !== 'SUCCESS') return fail('备份不可用', 404); const filename = path.basename(backup.filename); await audit({ actorId: session!.user.id, action: 'BACKUP_RESTORE_START', targetType: 'BACKUP', targetId: params.id, metadata: { filename } }); await exec('psql', ['--dbname', process.env.DATABASE_URL!, '--file', path.join(process.cwd(), 'backups', filename), '--set', 'ON_ERROR_STOP=on']); await audit({ actorId: session!.user.id, action: 'BACKUP_RESTORE_SUCCESS', targetType: 'BACKUP', targetId: params.id }); return ok({ restored: true }); } catch (e) { return handleError(e); } }
