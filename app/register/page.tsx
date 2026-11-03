import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { getSession } from '@/lib/auth';
export const metadata = { title: '注册' };
export default async function RegisterPage() { if (await getSession()) redirect('/'); return <div className="container-site flex min-h-[75vh] items-center justify-center py-12"><div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-soft sm:p-9"><div className="eyebrow">JOIN THE COMMUNITY</div><h1 className="font-serif text-3xl font-bold">创建你的社区身份</h1><p className="mb-8 mt-2 text-sm text-muted-foreground">发现同好，分享作品，从这一刻开始。</p><AuthForm mode="register" /></div></div>; }
