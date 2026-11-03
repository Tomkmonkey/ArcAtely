'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { safeNext } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    const form = new FormData(event.currentTarget); const email = String(form.get('email')); const password = String(form.get('password'));
    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email, password }) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error || '注册失败');
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('邮箱或密码错误，或账号不可用');
      router.push(safeNext(new URLSearchParams(window.location.search).get('next'))); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : '操作失败'); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="space-y-5">
    {mode === 'register' && <div><label htmlFor="name" className="mb-2 block text-sm font-semibold">昵称</label><Input id="name" name="name" minLength={2} maxLength={24} required placeholder="其他用户看到的名字" autoComplete="nickname" /></div>}
    <div><label htmlFor="email" className="mb-2 block text-sm font-semibold">邮箱</label><Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></div>
    <div><label htmlFor="password" className="mb-2 block text-sm font-semibold">密码</label><Input id="password" name="password" type="password" required minLength={8} maxLength={72} placeholder="至少 8 位" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />{mode === 'register' && <p className="mt-2 text-xs text-muted-foreground">使用 8–72 位密码，建议混合字母、数字与符号。</p>}</div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? '请稍候…' : mode === 'login' ? '登录模型岛' : '创建账号'}</Button>
    <p className="text-center text-sm text-muted-foreground">{mode === 'login' ? <>还没有账号？<Link href="/register" className="font-semibold text-primary">立即注册</Link></> : <>已有账号？<Link href="/login" className="font-semibold text-primary">直接登录</Link></>}</p>
    {mode === 'register' && <p className="text-center text-xs leading-5 text-muted-foreground">注册即表示你同意<Link href="/terms" className="underline">《用户协议》</Link>和<Link href="/privacy" className="underline">《隐私政策》</Link></p>}
  </form>;
}
