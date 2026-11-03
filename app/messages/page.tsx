import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { MessagesClient } from '@/components/messages-client';
export const dynamic = 'force-dynamic'; export const metadata = { title: '私信', robots: { index: false } };
export default async function MessagesPage() { const session = await getSession(); if (!session) redirect('/login?next=/messages'); return <div className="container-site py-10"><div className="mb-6"><h1 className="section-title">私信</h1><p className="mt-2 text-sm text-muted-foreground">只与同好分享公开创作信息，注意保护个人隐私。</p></div><Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl bg-secondary" />}><MessagesClient userId={session.user.id} /></Suspense></div>; }
