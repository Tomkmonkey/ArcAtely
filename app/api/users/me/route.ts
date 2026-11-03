import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, handleError } from '@/lib/api';
import { cleanText, checkSensitive } from '@/lib/content';
import { audit } from '@/lib/audit';
const schema = z.object({ name: z.string().trim().min(2).max(24), bio: z.string().max(300).optional(), image: z.string().max(2000).optional().or(z.literal('')) });
export async function PATCH(request: Request) { const { session, error } = await requireUser(); if (error) return error; try { const input = schema.parse(await request.json()); const sensitive = await checkSensitive(`${input.name} ${input.bio || ''}`); if (sensitive.hits.length) return handleError(new Error('资料包含敏感词')); const user = await prisma.user.update({ where: { id: session!.user.id }, data: { name: cleanText(input.name), bio: input.bio ? cleanText(input.bio) : null, image: input.image || null }, select: { id: true, name: true, bio: true, image: true } }); await audit({ actorId: session!.user.id, action: 'PROFILE_UPDATE', targetType: 'USER', targetId: user.id }); return ok(user); } catch (e) { return handleError(e); } }
