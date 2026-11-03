import { prisma } from '@/lib/prisma';
import { MODEL_SELECT } from '@/lib/utils';
import { databaseSearchWhere, searchModelIds } from '@/lib/search';
import { getSession } from '@/lib/auth';
import { ok, handleError } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url); const q = (searchParams.get('q') || '').trim().slice(0, 100);
    const tag = searchParams.get('tag') || undefined, category = searchParams.get('category') || undefined;
    const sort = searchParams.get('sort') || 'hot', page = Math.max(1, Number(searchParams.get('page')) || 1), take = 20;
    const meili = await searchModelIds(q, { tag, category, sort, skip: (page - 1) * take, take });
    let models, total;
    if (meili) {
      const found = await prisma.model.findMany({ where: { id: { in: meili.ids } }, select: MODEL_SELECT });
      models = meili.ids.map((id) => found.find((item) => item.id === id)).filter(Boolean); total = meili.total;
    } else {
      const where = databaseSearchWhere(q, tag, category);
      const orderBy = sort === 'latest' ? { publishedAt: 'desc' as const } : sort === 'views' ? { views: 'desc' as const } : sort === 'likes' ? { likesCount: 'desc' as const } : sort === 'favorites' ? { favoritesCount: 'desc' as const } : { hotScore: 'desc' as const };
      [models, total] = await Promise.all([prisma.model.findMany({ where, select: MODEL_SELECT, orderBy, skip: (page - 1) * take, take }), prisma.model.count({ where })]);
    }
    const session = await getSession();
    if (session?.user.id && q) await prisma.searchHistory.create({ data: { userId: session.user.id, query: q } });
    return ok({ models, total, page, engine: meili ? 'meilisearch' : 'database' });
  } catch (error) { return handleError(error); }
}
