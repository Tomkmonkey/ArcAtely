'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="container-site flex min-h-[60vh] flex-col items-center justify-center text-center"><span className="font-serif text-6xl text-primary">哎呀</span><h1 className="mt-4 font-serif text-2xl font-bold">页面暂时开了个小差</h1><p className="mt-2 text-muted-foreground">请稍后重试，你的数据不会受到影响。</p><Button onClick={reset} className="mt-6">重新加载</Button></div>; }
