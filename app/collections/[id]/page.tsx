import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { MODEL_SELECT } from '@/lib/utils';
import { ModelCard } from '@/components/model-card';
import { SubscribeButton } from '@/components/subscribe-button';
import { Empty } from '@/components/ui/empty';
export const dynamic = 'force-dynamic';
export default async function CollectionPage({ params }: { params: { id: string } }) {
  const [collection, session] = await Promise.all([prisma.collection.findUnique({ where: { id: params.id }, include: { owner: { select: { name: true } }, models: { include: { model: { select: MODEL_SELECT } }, orderBy: { sortOrder: 'asc' } } } }), getSession()]);
  if (!collection) notFound();
  const models = collection.models.map((item) => item.model).filter((model) => model.status === 'APPROVED' && model.visibility === 'PUBLIC');
  const subscribed = session ? await prisma.subscription.findUnique({ where: { userId_type_targetId: { userId: session.user.id, type: 'COLLECTION', targetId: collection.id } } }) : null;
  return <div className="container-site py-12"><div className="surface flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-end sm:p-8"><div><div className="eyebrow">CURATED COLLECTION</div><h1 className="section-title">{collection.title}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{collection.description || '社区编辑精选模型合集。'}</p><p className="mt-3 text-xs text-muted-foreground">{models.length} 个公开模型 · 策划：{collection.owner?.name || '社区编辑'}</p></div><SubscribeButton type="COLLECTION" targetId={collection.id} label="合集" initial={!!subscribed} /></div>{models.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{models.map((model) => <ModelCard key={model.id} model={model} />)}</div> : <div className="mt-8"><Empty title="合集暂无公开模型" /></div>}</div>;
}
