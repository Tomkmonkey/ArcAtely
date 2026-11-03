import { prisma } from '@/lib/prisma';

export async function checkSensitive(text: string) {
  const words = await prisma.sensitiveWord.findMany({ where: { enabled: true }, select: { word: true, severity: true } });
  const normalized = text.toLowerCase().replace(/\s/g, '');
  const hits = words.filter(({ word }) => normalized.includes(word.toLowerCase().replace(/\s/g, '')));
  return { blocked: hits.some((hit) => hit.severity >= 2), hits: hits.map((hit) => hit.word) };
}
export function cleanText(input: string) { return input.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim(); }
export function isSafeExternalUrl(value: string) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol); } catch { return false; }
}
