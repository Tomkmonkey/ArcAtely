'use client';
import { useState } from 'react';
import { BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
type Item = { id: string; type: 'AUTHOR' | 'TAG' | 'COLLECTION'; targetId: string; label: string };
export function SubscriptionList({ initial }: { initial: Item[] }) { const [items, setItems] = useState(initial); async function remove(item: Item) { const response = await fetch('/api/subscriptions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, targetId: item.targetId }) }); if (response.ok) setItems(items.filter((s) => s.id !== item.id)); } if (!items.length) return <p className="text-sm text-muted-foreground">尚未添加订阅。</p>; return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item.id} className="surface flex items-center justify-between p-4"><div><Badge variant="secondary">{item.type === 'AUTHOR' ? '作者' : item.type === 'TAG' ? '标签' : '合集'}</Badge><p className="mt-2 font-semibold">{item.label}</p></div><Button variant="ghost" size="sm" onClick={() => remove(item)}><BellOff className="h-4 w-4" />退订</Button></div>)}</div>; }
