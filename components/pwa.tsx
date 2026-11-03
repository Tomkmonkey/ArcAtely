'use client';
import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
export function PWAStatus() {
  const [offline, setOffline] = useState(false);
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) setUpdate(true);
      registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdate(true); }); });
    });
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (offline) return <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-lg"><WifiOff className="h-4 w-4" />当前离线，可继续查看已缓存内容</div>;
  if (update) return <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full bg-primary px-4 py-2 text-sm text-white shadow-lg"><RefreshCw className="h-4 w-4" />发现新版本<button onClick={() => window.location.reload()} className="font-bold underline">刷新更新</button><button onClick={() => setUpdate(false)} aria-label="关闭"><X className="h-4 w-4" /></button></div>;
  return null;
}
