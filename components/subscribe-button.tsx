'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellPlus, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function SubscribeButton({ type, targetId, label, initial = false }: { type: 'AUTHOR' | 'TAG' | 'COLLECTION'; targetId: string; label: string; initial?: boolean }) { const [active, setActive] = useState(initial); const [loading, setLoading] = useState(false); const router = useRouter(); async function toggle() { setLoading(true); const response = await fetch('/api/subscriptions', { method: active ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, targetId }) }); if (response.status === 401) router.push('/login'); else if (response.ok) setActive(!active); setLoading(false); } return <Button variant={active ? 'secondary' : 'outline'} onClick={toggle} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <BellRing className="h-4 w-4" /> : <BellPlus className="h-4 w-4" />}{active ? `已订阅 ${label}` : `订阅 ${label}`}</Button>; }
