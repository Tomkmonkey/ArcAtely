import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError } from '@/lib/api';
const schema = z.object({ type: z.enum(['AUTHOR', 'TAG', 'COLLECTION']), targetId: z.string().min(1) });
export async function GET() { const { session, error } = await requireUser(); if (error) return error; return ok(await prisma.subscription.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: 'desc' } })); }
export async function POST(request: Request) { const { session, error } = await requireUser(); if (error) return error; try { const input = schema.parse(await request.json()); return ok(await prisma.subscription.upsert({ where: { userId_type_targetId: { userId: session!.user.id, ...input } }, create: { userId: session!.user.id, ...input }, update: { notify: true } })); } catch (e) { return handleError(e); } }
export async function DELETE(request: Request) { const { session, error } = await requireUser(); if (error) return error; try { const input = schema.parse(await request.json()); await prisma.subscription.deleteMany({ where: { userId: session!.user.id, ...input } }); return ok({ removed: true }); } catch (e) { return handleError(e); } }
