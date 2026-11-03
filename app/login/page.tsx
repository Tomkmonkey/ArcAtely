import { redirect } from 'next/navigation';
import { Box } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { getSession } from '@/lib/auth';
export const metadata = { title: '登录' };
export default async function LoginPage() { if (await getSession()) redirect('/'); return <div className="container-site grid min-h-[75vh] items-center gap-12 py-12 lg:grid-cols-2"><div className="hidden lg:block"><Box className="mb-6 h-12 w-12 text-primary" /><h1 className="max-w-lg font-serif text-5xl font-black leading-tight">回到灵感发生的地方。</h1><p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">收藏喜欢的作品，关注欣赏的创作者，也把属于你的奇思妙想分享给世界。</p></div><div className="mx-auto w-full max-w-md rounded-3xl border bg-card p-6 shadow-soft sm:p-9"><h2 className="font-serif text-3xl font-bold">欢迎回来</h2><p className="mb-8 mt-2 text-sm text-muted-foreground">登录后继续你的探索与创作</p><AuthForm mode="login" /></div></div>; }
