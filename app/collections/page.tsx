import Link from 'next/link';
import Image from 'next/image';
import { Layers3, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Empty } from '@/components/ui/empty';
export const dynamic = 'force-dynamic';
export const metadata = { title: '合集与专题' };
export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({ include: { owner: { select: { name: true } }, _count: { select: { models: true } }, models: { include: { model: { select: { coverUrl: true } } }, take: 3 } }, orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }] });
  return <div className="container-site py-12"><div className="eyebrow">CURATED COLLECTIONS</div><h1 className="section-title">合集与专题</h1><p className="mt-3 text-muted-foreground">沿着一个主题，连续发现一组值得保存的作品。</p>{collections.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection) => <Link key={collection.id} href={`/collections/${collection.id}`} className="surface group overflow-hidden"><div className="grid h-40 grid-cols-3 gap-1 bg-secondary p-1">{collection.models.map((item) => <div key={item.modelId} className="relative overflow-hidden rounded-lg bg-muted">{item.model.coverUrl && <Image src={item.model.coverUrl} alt="" fill className="object-cover" unoptimized />}</div>)}{!collection.models.length && <div className="col-span-3 flex items-center justify-center"><Layers3 className="h-8 w-8 text-muted-foreground" /></div>}</div><div className="p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-xl font-bold group-hover:text-primary">{collection.title}</h2><ArrowRight className="h-4 w-4 text-primary" /></div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p><p className="mt-4 text-xs text-muted-foreground">{collection._count.models} 个模型 · {collection.owner?.name || '社区编辑'}{collection.featured && ' · 编辑推荐'}</p></div></Link>)}</div> : <div className="mt-8"><Empty title="暂无公开合集" /></div>}</div>;
}
