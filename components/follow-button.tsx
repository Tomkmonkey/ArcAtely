'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function FollowButton({ userId, initial = false, size = 'default' }: { userId: string; initial?: boolean; size?: 'default' | 'sm' }) { const [active, setActive] = useState(initial); const [loading, setLoading] = useState(false); const router = useRouter(); async function toggle() { setLoading(true); const response = await fetch(`/api/users/${userId}/follow`, { method: 'POST' }); if (response.status === 401) router.push('/login'); else if (response.ok) setActive(!active); setLoading(false); } return <Button variant={active ? 'secondary' : 'outline'} size={size} onClick={toggle} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{active ? '已关注' : '关注作者'}</Button>; }
