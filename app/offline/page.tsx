import Link from 'next/link';
export default function OfflinePage() { return <div className="container-site flex min-h-[60vh] flex-col items-center justify-center text-center"><h1 className="font-serif text-3xl font-bold">现在处于离线状态</h1><p className="mt-3 text-muted-foreground">已访问的页面仍可从缓存打开，联网后再试一次吧。</p><Link href="/" className="mt-6 text-primary underline">返回首页</Link></div>; }
