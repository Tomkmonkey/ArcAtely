import type { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { cleanText, checkSensitive, isSafeExternalUrl } from '@/lib/content';
import { slugify } from '@/lib/utils';
import { indexModel, removeModelFromIndex } from '@/lib/search';
import { notify } from '@/lib/audit';
import { getSiteSettings } from '@/lib/settings';
import type { modelSchema } from '@/lib/validators/model';

type ModelInput = z.infer<typeof modelSchema>;
export async function saveModel(input: ModelInput, authorId: string, modelId?: string) {
  const title = cleanText(input.title), description = cleanText(input.description);
  const tagNames = [...new Set(input.tags.map((tag) => cleanText(tag)).filter(Boolean))];
  if (tagNames.length !== input.tags.length) throw new Error('DUPLICATE_TAGS');
  const settings = await getSiteSettings();
  if (tagNames.some((tag) => tag.length < settings.tagMinLength || tag.length > settings.tagMaxLength)) throw new Error('TAG_RULE');
  const sensitive = await checkSensitive([title, description, ...tagNames].join(' '));
  if (sensitive.hits.length) throw new Error(`SENSITIVE:${sensitive.hits.join(',')}`);
  if (input.externalUrl && !isSafeExternalUrl(input.externalUrl)) throw new Error('UNSAFE_URL');
  const model = await prisma.$transaction(async (tx) => {
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const slug = slugify(name);
      const tag = await tx.tag.upsert({ where: { name }, create: { name, slug }, update: {}, select: { id: true } });
      tagIds.push(tag.id);
    }
    const data = {
      title, description, coverUrl: input.coverUrl || null, externalUrl: input.externalUrl || null,
      fileUrl: input.fileUrl || null, fileName: input.fileName || null, fileSize: input.fileSize,
      format: input.format || null, version: input.version, categoryId: input.categoryId || null,
      visibility: input.visibility, status: settings.moderationEnabled ? 'PENDING' as const : 'APPROVED' as const,
      publishedAt: settings.moderationEnabled ? null : new Date(), rejectionReason: null,
    };
    const saved = modelId ? await tx.model.update({ where: { id: modelId }, data: { ...data, tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } } }) : await tx.model.create({ data: { ...data, slug: slugify(title), authorId, tags: { create: tagIds.map((tagId) => ({ tagId })) } } });
    await tx.moderationRecord.create({ data: { targetType: 'MODEL', targetId: saved.id, action: 'SUBMIT', snapshot: { title, version: input.version } } });
    if (!modelId) await tx.user.updateMany({ where: { id: authorId, role: 'USER' }, data: { role: 'AUTHOR' } });
    return saved;
  });
  await indexModel(model.id);
  return model;
}
export async function publishModel(modelId: string, reviewerId: string, approved: boolean, reason?: string) {
  const model = await prisma.model.update({ where: { id: modelId }, data: approved ? { status: 'APPROVED', publishedAt: new Date(), rejectionReason: null } : { status: 'REJECTED', rejectionReason: reason } });
  if (approved) {
    await indexModel(modelId);
    const modelTags = await prisma.modelTag.findMany({ where: { modelId }, select: { tagId: true } });
    const tagIds = modelTags.map((item) => item.tagId);
    const subscribers = await prisma.subscription.findMany({
      where: { OR: [{ type: 'AUTHOR', targetId: model.authorId }, { type: 'TAG', targetId: { in: tagIds } }] },
      select: { userId: true },
    });
    await Promise.all([...new Set(subscribers.map((item) => item.userId))].filter((id) => id !== model.authorId).map((userId) => notify(userId, 'SUBSCRIPTION', '你的订阅有新作品', model.title, `/models/${model.id}`)));
  } else await removeModelFromIndex(modelId);
  await notify(model.authorId, 'MODERATION', approved ? '你的模型已通过审核' : '你的模型未通过审核', approved ? model.title : reason, `/models/${model.id}`);
  return model;
}
