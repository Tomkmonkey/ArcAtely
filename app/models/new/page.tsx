import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ModelForm } from '@/components/model-form';
export const dynamic = 'force-dynamic'; export const metadata = { title: '分享模型' };
export default async function NewModelPage() { const session = await getSession(); if (!session) redirect('/login?next=/models/new'); const [categories, tags] = await Promise.all([prisma.category.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } }), prisma.tag.findMany({ where: { approved: true }, take: 30 })]); return <div className="container-site py-10"><div className="mb-8"><div className="eyebrow">SHARE YOUR CREATION</div><h1 className="section-title">分享一个模型</h1><p className="mt-2 text-muted-foreground">把创作背后的故事，也一起讲给大家听。</p></div><ModelForm categories={categories} suggestedTags={tags} /></div>; }
