import { prisma } from '@/lib/prisma';
import { requireUser, ok } from '@/lib/api';
export async function GET() { const { session, error } = await requireUser(); if (error) return error; return ok(await prisma.searchHistory.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: 'desc' }, take: 10, distinct: ['query'] })); }
export async function POST(request: Request) { const { session, error } = await requireUser(); if (error) return error; const { query } = await request.json(); if (typeof query !== 'string' || !query.trim()) return ok(null); return ok(await prisma.searchHistory.create({ data: { userId: session!.user.id, query: query.trim().slice(0, 100) } })); }
export async function DELETE() { const { session, error } = await requireUser(); if (error) return error; await prisma.searchHistory.deleteMany({ where: { userId: session!.user.id } }); return ok({ cleared: true }); }
