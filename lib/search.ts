import { MeiliSearch } from 'meilisearch';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

let indexed = false;
function client() {
  if (!process.env.MEILISEARCH_HOST) return null;
  return new MeiliSearch({ host: process.env.MEILISEARCH_HOST, apiKey: process.env.MEILISEARCH_API_KEY });
}
export async function ensureSearchIndex() {
  const meili = client();
  if (!meili || indexed) return meili;
  const index = meili.index('models');
  await index.updateFilterableAttributes(['status', 'visibility', 'tagNames', 'categoryId', 'publishedAt']);
  await index.updateSortableAttributes(['publishedAt', 'views', 'likesCount', 'favoritesCount', 'hotScore']);
  indexed = true;
  return meili;
}
export async function indexModel(modelId: string) {
  const meili = client();
  if (!meili) return;
  const model = await prisma.model.findUnique({ where: { id: modelId }, include: { author: true, tags: { include: { tag: true } } } });
  if (!model) return;
  try {
    await (await ensureSearchIndex())!.index('models').addDocuments([{
      id: model.id, title: model.title, description: model.description, authorName: model.author.name,
      tagNames: model.tags.map((item) => item.tag.name), categoryId: model.categoryId,
      status: model.status, visibility: model.visibility, publishedAt: model.publishedAt?.getTime() || 0,
      views: model.views, likesCount: model.likesCount, favoritesCount: model.favoritesCount, hotScore: model.hotScore,
    }]);
  } catch (error) { console.warn('[SEARCH_FALLBACK]', error instanceof Error ? error.message : error); }
}
export async function removeModelFromIndex(modelId: string) {
  try { await client()?.index('models').deleteDocument(modelId); } catch { /* 数据库搜索仍可用 */ }
}
export async function searchModelIds(query: string, options: { tag?: string; category?: string; sort?: string; skip?: number; take?: number }) {
  const meili = client();
  if (!meili) return null;
  try {
    await ensureSearchIndex();
    const filters = ['status = APPROVED', 'visibility = PUBLIC'];
    if (options.tag) filters.push(`tagNames = ${JSON.stringify(options.tag)}`);
    if (options.category) filters.push(`categoryId = ${JSON.stringify(options.category)}`);
    const sortMap: Record<string, string> = { latest: 'publishedAt:desc', views: 'views:desc', likes: 'likesCount:desc', favorites: 'favoritesCount:desc', hot: 'hotScore:desc' };
    const result = await meili.index('models').search(query, {
      filter: filters.join(' AND '), sort: options.sort ? [sortMap[options.sort] || sortMap.hot] : undefined,
      offset: options.skip || 0, limit: options.take || 20,
    });
    return { ids: result.hits.map((hit) => hit.id as string), total: result.estimatedTotalHits || result.hits.length };
  } catch { return null; }
}
export function databaseSearchWhere(query: string, tag?: string, category?: string): Prisma.ModelWhereInput {
  return {
    status: 'APPROVED', visibility: 'PUBLIC',
    ...(query ? { OR: [
      { title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } },
      { author: { name: { contains: query, mode: 'insensitive' } } },
      { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } },
    ] } : {}),
    ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
    ...(category ? { categoryId: category } : {}),
  };
}
