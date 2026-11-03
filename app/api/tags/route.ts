import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { cleanText, checkSensitive } from '@/lib/content';
import { slugify } from '@/lib/utils';
import { getSiteSettings } from '@/lib/settings';
export async function GET() { return ok(await prisma.tag.findMany({ where: { approved: true }, include: { _count: { select: { models: true } } }, orderBy: { models: { _count: 'desc' } } })); }
export async function POST(request: Request) {
  const { error } = await requireUser(); if (error) return error;
  try {
    const name = cleanText(z.string().trim().min(1).max(20).parse((await request.json()).name));
    const settings = await getSiteSettings();
    if (name.length < settings.tagMinLength || name.length > settings.tagMaxLength) return fail(`标签长度需为 ${settings.tagMinLength}–${settings.tagMaxLength} 字`, 422);
    const sensitive = await checkSensitive(name); if (sensitive.hits.length) return fail('标签包含敏感词', 422);
    const tag = await prisma.tag.create({ data: { name, slug: slugify(name) } }); return ok(tag, 201);
  } catch (error) { return handleError(error); }
}
