import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function audit(input: { actorId?: string | null; action: string; targetType: string; targetId?: string; metadata?: Prisma.InputJsonValue; ip?: string }) {
  await prisma.auditLog.create({ data: {
    actorId: input.actorId || null, action: input.action, targetType: input.targetType,
    targetId: input.targetId, metadata: input.metadata, ip: input.ip,
  } });
}
export async function notify(userId: string, type: 'SYSTEM' | 'MODERATION' | 'FOLLOW' | 'LIKE' | 'FAVORITE' | 'MESSAGE' | 'SUBSCRIPTION' | 'REPORT', title: string, content?: string, link?: string) {
  if (!userId) return;
  await prisma.notification.create({ data: { userId, type, title, content, link } });
}
