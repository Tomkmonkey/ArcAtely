'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function Dialog({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('button, input, textarea, select')?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={cn('max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl', className)}>
      <div className="mb-5 flex items-center justify-between"><h2 id="dialog-title" className="font-serif text-xl font-bold">{title}</h2><Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭"><X className="h-5 w-5" /></Button></div>{children}
    </div>
  </div>;
}
