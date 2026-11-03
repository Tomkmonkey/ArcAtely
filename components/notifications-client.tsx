'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { relativeTime } from '@/lib/utils';
type Item = { id: string; title: string; content: string | null; link: string | null; readAt: Date | string | null; createdAt: Date | string };
export function NotificationsClient({ initial }: { initial: Item[] }) { const [items, setItems] = useState(initial); async function readAll() { await fetch('/api/notifications', { method: 'PATCH' }); setItems(items.map((item) => ({ ...item, readAt: new Date() }))); } return <><div className="mb-5 flex justify-end"><Button variant="outline" size="sm" onClick={readAll}><CheckCheck className="h-4 w-4" />全部标为已读</Button></div><div className="surface divide-y">{items.map((item) => <Link key={item.id} href={item.link || '#'} className={`flex gap-3 p-5 ${!item.readAt ? 'bg-primary/[.035]' : ''}`}><span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><Bell className="h-4 w-4 text-primary" /></span><div><h2 className="text-sm font-bold">{item.title}{!item.readAt && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />}</h2>{item.content && <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>}<time className="mt-2 block text-xs text-muted-foreground">{relativeTime(item.createdAt)}</time></div></Link>)}{!items.length && <p className="p-12 text-center text-sm text-muted-foreground">暂无通知</p>}</div></>; }
