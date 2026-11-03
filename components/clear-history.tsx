'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
export function ClearHistory() { const router = useRouter(); return <Button variant="outline" size="sm" onClick={async () => { if (window.confirm('确定清空全部浏览历史吗？')) { await fetch('/api/me/history', { method: 'DELETE' }); router.refresh(); } }}>清空历史</Button>; }
