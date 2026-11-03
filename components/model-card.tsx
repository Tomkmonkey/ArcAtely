import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, Bookmark, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, relativeTime } from '@/lib/utils';
export type ModelCardData = {
  id: string; title: string; description: string; coverUrl: string | null; views: number;
  likesCount: number; favoritesCount: number; publishedAt: Date | null; createdAt: Date;
  author: { id: string; name: string; image: string | null; verified?: boolean };
  category?: { name: string } | null; tags: { tag: { id: string; name: string; slug: string } }[];
};
export function ModelCard({ model, rank, priority = false }: { model: ModelCardData; rank?: number; priority?: boolean }) {
  return <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
    <Link href={`/models/${model.id}`} className="relative block aspect-[4/3] overflow-hidden bg-secondary" aria-label={`查看 ${model.title}`}>
      {model.coverUrl ? <Image src={model.coverUrl} alt={`${model.title} 封面`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" priority={priority} unoptimized /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-accent font-serif text-5xl text-muted-foreground/40">{model.title.slice(0, 1)}</div>}
      {rank && <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/85 font-serif text-sm font-bold text-white backdrop-blur">{rank}</span>}
      <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">{model.category?.name || '模型作品'}</span>
    </Link>
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex flex-wrap gap-1.5">{model.tags.slice(0, 3).map(({ tag }) => <Link key={tag.id} href={`/tags/${tag.slug}`}><Badge variant="secondary" className="font-normal">#{tag.name}</Badge></Link>)}</div>
      <h3 className="font-serif text-lg font-bold leading-snug"><Link href={`/models/${model.id}`} className="transition-colors group-hover:text-primary">{model.title}<ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition group-hover:opacity-100" /></Link></h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{model.description}</p>
      <div className="mt-auto flex items-center justify-between pt-4"><Link href={`/u/${model.author.id}`} className="flex min-w-0 items-center gap-2"><Avatar name={model.author.name} src={model.author.image} className="h-6 w-6 text-xs" /><span className="truncate text-xs font-medium">{model.author.name}</span>{model.author.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}</Link><span className="text-[11px] text-muted-foreground">{relativeTime(model.publishedAt || model.createdAt)}</span></div>
      <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(model.views)}</span><span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{formatNumber(model.likesCount)}</span><span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" />{formatNumber(model.favoritesCount)}</span></div>
    </div>
  </article>;
}
