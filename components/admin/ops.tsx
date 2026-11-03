'use client';
import { useState } from 'react';
import { Download, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function ExportButtons() { return <div className="flex gap-2"><a href="/api/admin/export?type=models" className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-semibold"><Download className="h-4 w-4" />导出模型 CSV</a><a href="/api/admin/export?type=users" className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-semibold"><Download className="h-4 w-4" />导出用户 CSV</a></div>; }
export function CacheButton() { const [message, setMessage] = useState(''); return <div className="flex items-center gap-3"><Button variant="outline" onClick={async () => { const response = await fetch('/api/admin/cache', { method: 'POST' }); const result = await response.json(); setMessage(response.ok ? `已清理 ${result.data.cleared} 个限流缓存键` : result.error); }}><Eraser className="h-4 w-4" />清理限流缓存</Button><span className="text-xs text-muted-foreground">{message}</span></div>; }
