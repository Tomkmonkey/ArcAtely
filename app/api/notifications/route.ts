import { prisma } from '@/lib/prisma';
import { requireUser, ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET() { const { session, error } = await requireUser(); if (error) return error; const userId = session!.user.id; const [items, unread] = await Promise.all([prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }), prisma.notification.count({ where: { userId, readAt: null } })]); return ok({ items, unread }); }
export async function PATCH() { const { session, error } = await requireUser(); if (error) return error; await prisma.notification.updateMany({ where: { userId: session!.user.id, readAt: null }, data: { readAt: new Date() } }); return ok({ read: true }); }
