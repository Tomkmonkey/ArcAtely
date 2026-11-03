import { prisma } from '@/lib/prisma';
import { requireUser, ok } from '@/lib/api';
export async function DELETE() { const { session, error } = await requireUser(); if (error) return error; await prisma.viewHistory.deleteMany({ where: { userId: session!.user.id } }); return ok({ cleared: true }); }
