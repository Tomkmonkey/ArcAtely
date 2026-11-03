import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Sparkles, TrendingUp, Clock3, PenTool, Megaphone } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { MODEL_SELECT, formatNumber } from '@/lib/utils';
import { ModelCard } from '@/components/model-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
export const dynamic = 'force-dynamic';
async function getData() {
  const [featured, latest, hot, tags, authors, setting] = await Promise.all([
    prisma.model.findMany({ where: { status: 'APPROVED', visibility: 'PUBLIC', featured: true }, select: MODEL_SELECT, orderBy: [{ pinned: 'desc' }, { hotScore: 'desc' }], take: 3 }),
    prisma.model.findMany({ where: { status: 'APPROVED', visibility: 'PUBLIC' }, select: MODEL_SELECT, orderBy: { publishedAt: 'desc' }, take: 6 }),
    prisma.model.findMany({ where: { status: 'APPROVED', visibility: 'PUBLIC' }, select: MODEL_SELECT, orderBy: { hotScore: 'desc' }, take: 3 }),
    prisma.tag.findMany({ where: { approved: true }, include: { _count: { select: { models: true } } }, orderBy: { models: { _count: 'desc' } }, take: 10 }),
    prisma.user.findMany({ where: { status: 'ACTIVE', models: { some: { status: 'APPROVED' } } }, select: { id: true, name: true, image: true, bio: true, verified: true, _count: { select: { models: true, followers: true } } }, orderBy: { models: { _count: 'desc' } }, take: 4 }),
    prisma.setting.findUnique({ where: { key: 'site' } }),
  ]);
  return { featured: featured.length ? featured : hot, latest, hot, tags, authors, announcement: (setting?.value as { announcement?: string })?.announcement };
}
export default async function HomePage() {
  const { featured, latest, hot, tags, authors, announcement } = await getData();
  return <>
    <section className="relative overflow-hidden border-b bg-[#efeade]">
      <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#d8ddc3]/60 blur-3xl" /><div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#e8c5ae]/50 blur-3xl" />
      <div className="container-site relative grid min-h-[420px] items-center gap-10 py-14 lg:grid-cols-[1.2fr_.8fr] lg:py-20">
        <div className="animate-fade-up"><div className="eyebrow">OPEN · CREATE · SHARE</div><h1 className="max-w-3xl font-serif text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">好模型值得被看见，<br /><span className="text-primary">好灵感值得被分享。</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">为模型爱好者而生的创作社区。发现独特作品，连接同好作者，让每一次创造都有回响。</p>
          <form action="/search" className="mt-8 flex max-w-xl rounded-2xl border bg-card p-2 shadow-soft" role="search"><Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-muted-foreground" /><input name="q" placeholder="试试「眼镜」「呆萌」或作者名…" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" aria-label="搜索模型" /><button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90">探索模型</button></form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>热门：</span>{tags.slice(0, 4).map((tag) => <Link key={tag.id} href={`/tags/${tag.slug}`} className="hover:text-primary">#{tag.name}</Link>)}</div>
        </div>
        <div className="hidden lg:block"><div className="relative mx-auto max-w-sm rotate-2 rounded-[2rem] border-8 border-card bg-card p-3 shadow-2xl">{featured[0]?.coverUrl && <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl"><Image src={featured[0].coverUrl} alt={featured[0].title} fill className="object-cover" unoptimized /></span>}<div className="p-4"><Badge><Sparkles className="mr-1 h-3 w-3" />编辑精选</Badge><h2 className="mt-3 font-serif text-2xl font-bold">{featured[0]?.title || '等待你的第一个作品'}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{featured[0]?.description || '分享模型，与更多同好相遇。'}</p></div><div className="absolute -bottom-5 -left-8 -rotate-6 rounded-xl border bg-card px-4 py-3 shadow-lg"><span className="text-xs text-muted-foreground">社区创作者</span><div className="font-serif text-xl font-bold">{authors.length}+ <span className="text-sm font-normal">位正在分享</span></div></div></div></div>
      </div>
    </section>
    {announcement && <div className="container-site mt-6"><div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><Megaphone className="h-4 w-4 shrink-0" /><span>{announcement}</span></div></div>}
    <div className="container-site py-12 sm:py-16">
      <section aria-labelledby="featured-title"><div className="mb-6 flex items-end justify-between"><div><div className="eyebrow">CURATED FOR YOU</div><h2 id="featured-title" className="section-title">本周精选</h2></div><Link href="/search?sort=hot" className="flex items-center gap-1 text-sm font-semibold text-primary">查看全部<ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((model, i) => <ModelCard key={model.id} model={model} priority={i === 0} />)}</div></section>
      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_300px]">
        <section aria-labelledby="latest-title"><div className="mb-6 flex items-center justify-between"><h2 id="latest-title" className="section-title flex items-center gap-2"><Clock3 className="h-6 w-6 text-primary" />新鲜出炉</h2><Link href="/search?sort=latest" className="text-sm text-primary">更多新作</Link></div><div className="grid gap-5 sm:grid-cols-2">{latest.map((model) => <ModelCard key={model.id} model={model} />)}</div></section>
        <aside className="space-y-8"><section><div className="mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><h2 className="font-serif text-xl font-bold">正在流行</h2></div><div className="surface divide-y">{hot.map((model, i) => <Link href={`/models/${model.id}`} key={model.id} className="flex gap-3 p-4 hover:bg-secondary/50"><span className="font-serif text-2xl font-black text-primary/40">{String(i + 1).padStart(2, '0')}</span><div><h3 className="line-clamp-2 text-sm font-bold">{model.title}</h3><p className="mt-1 text-xs text-muted-foreground">{formatNumber(model.views)} 次浏览 · {formatNumber(model.likesCount)} 赞</p></div></Link>)}</div><Link href="/rankings" className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-primary">完整排行榜<ArrowRight className="h-3 w-3" /></Link></section>
          <section><h2 className="mb-4 font-serif text-xl font-bold">热门标签</h2><div className="flex flex-wrap gap-2">{tags.map((tag) => <Link key={tag.id} href={`/tags/${tag.slug}`}><Badge variant="outline" className="bg-card px-3 py-2 hover:border-primary hover:text-primary">#{tag.name}<span className="ml-1 text-muted-foreground">{tag._count.models}</span></Badge></Link>)}</div></section>
        </aside>
      </div>
      <section className="mt-16"><div className="mb-6"><div className="eyebrow">MEET THE MAKERS</div><h2 className="section-title">认识创作者</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{authors.map((author) => <Link key={author.id} href={`/u/${author.id}`} className="surface p-5 text-center transition hover:-translate-y-1"><Avatar name={author.name} src={author.image} className="mx-auto h-16 w-16 text-2xl" /><h3 className="mt-3 font-bold">{author.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{author.bio || '热爱创造，乐于分享。'}</p><div className="mt-3 text-xs text-muted-foreground">{author._count.models} 个作品 · {formatNumber(author._count.followers)} 位关注者</div></Link>)}</div></section>
      <section className="relative mt-16 overflow-hidden rounded-3xl bg-[#394132] px-6 py-10 text-[#f8f5e9] sm:px-12"><PenTool className="absolute -right-8 -top-8 h-48 w-48 rotate-12 opacity-5" /><div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><div className="mb-2 text-xs font-bold tracking-[.2em] text-[#c9d2b5]">SHARE YOUR CREATION</div><h2 className="font-serif text-2xl font-bold sm:text-3xl">下一个被发现的，就是你的作品。</h2><p className="mt-2 text-sm text-[#d7dccf]">上传模型、记录灵感，与同好一起让它变得更好。</p></div><Link href="/models/new" className="shrink-0 rounded-xl bg-[#f5eadd] px-6 py-3 text-sm font-bold text-[#394132]">开始分享<ArrowRight className="ml-2 inline h-4 w-4" /></Link></div></section>
    </div>
  </>;
}
