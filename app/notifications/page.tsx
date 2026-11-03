import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationsClient } from '@/components/notifications-client';
export const dynamic = 'force-dynamic'; export const metadata = { title: '通知', robots: { index: false } };
export default async function NotificationsPage() { const session = await getSession(); if (!session) redirect('/login?next=/notifications'); const items = await prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 100 }); return <div className="container-site max-w-4xl py-10"><h1 className="section-title">通知中心</h1><p className="mb-6 mt-2 text-sm text-muted-foreground">审核进度、社区互动和订阅更新都会在这里提醒你。</p><NotificationsClient initial={items} /></div>; }
