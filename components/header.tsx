'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Box, Search, Menu, X, Plus, UserRound, LogOut, Bell, MessageCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
const defaultNav = [{ href: '/search', label: '发现模型' }, { href: '/rankings', label: '排行榜' }, { href: '/tags', label: '标签' }, { href: '/collections', label: '合集' }, { href: '/subscriptions', label: '订阅' }];
export function Header({ user, config }: { user?: { id: string; name?: string | null; image?: string | null; role?: string } | null; config?: { siteName: string; logo?: string; navigation?: { label: string; href: string }[] } }) {
  const nav = config?.navigation?.length ? config.navigation : defaultNav;
  const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const router = useRouter();
  const staff = user?.role && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  function search(e: React.FormEvent) { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }
  return <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
    <div className="container-site flex h-16 items-center gap-5">
      <Link href="/" className="flex shrink-0 items-center gap-2 font-serif text-xl font-black tracking-tight" aria-label={`${config?.siteName || '模型岛'}首页`}><span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-white">{config?.logo ? <Image src={config.logo} alt="" fill className="object-cover" unoptimized /> : <Box className="h-5 w-5" />}</span><span>{config?.siteName || '模型岛'}<span className="text-primary">.</span></span></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">{nav.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">{item.label}</Link>)}</nav>
      <form onSubmit={search} className="relative ml-auto hidden w-full max-w-xs md:block" role="search"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索模型、作者或标签" className="h-9 rounded-full bg-secondary/70 pl-9" aria-label="全站搜索" /></form>
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        {user ? <>
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/models/new')}><Plus className="h-4 w-4" />分享模型</Button>
          <Link href="/notifications" className="hidden rounded-lg p-2 hover:bg-secondary sm:block" aria-label="通知"><Bell className="h-5 w-5" /></Link>
          <Link href="/messages" className="hidden rounded-lg p-2 hover:bg-secondary sm:block" aria-label="私信"><MessageCircle className="h-5 w-5" /></Link>
          <Link href="/me/profile" aria-label="个人中心"><Avatar name={user.name || '用户'} src={user.image} className="h-8 w-8" /></Link>
          {staff && <Link href="/admin/dashboard" className="hidden rounded-lg p-2 hover:bg-secondary xl:block" aria-label="管理后台"><LayoutDashboard className="h-5 w-5" /></Link>}
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => signOut({ callbackUrl: '/' })} aria-label="退出登录"><LogOut className="h-4 w-4" /></Button>
        </> : <><Link href="/login" className="hidden text-sm font-semibold sm:block">登录</Link><Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">加入社区</Link></>}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="展开菜单">{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <div className="border-t bg-card p-4 lg:hidden"><form onSubmit={search} className="relative mb-3 md:hidden"><Search className="absolute left-3 top-3 h-4 w-4" /><Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="搜索模型、作者或标签" /></form><nav className="grid gap-1">{nav.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="rounded-lg px-3 py-3 font-medium hover:bg-secondary">{item.label}</Link>)}{user ? <><Link href="/models/new" className="rounded-lg px-3 py-3 font-medium text-primary">＋ 分享模型</Link><Link href="/me/profile" className="rounded-lg px-3 py-3 font-medium">个人中心</Link><Link href="/notifications" className="rounded-lg px-3 py-3 font-medium">通知与私信</Link>{staff && <Link href="/admin/dashboard" className="rounded-lg px-3 py-3 font-medium">管理后台</Link>}<button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-muted-foreground"><UserRound className="h-4 w-4" />退出登录</button></> : <Link href="/login" className="rounded-lg px-3 py-3">登录</Link>}</nav></div>}
  </header>;
}
