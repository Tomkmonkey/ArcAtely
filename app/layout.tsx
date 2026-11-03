import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PWAStatus } from '@/components/pwa';
import { getSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: '模型岛 · 模型爱好者分享社区', template: '%s · 模型岛' },
  description: '发现、分享和收藏优质模型，与创作者交流灵感。',
  applicationName: '模型岛', manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', locale: 'zh_CN', siteName: '模型岛', title: '模型岛 · 模型爱好者分享社区', description: '让每一份灵感都被看见。' },
  twitter: { card: 'summary_large_image' }, robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#b64d22' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSiteSettings()]);
  return <html lang="zh-CN"><body><Providers><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:p-3 focus:text-white">跳到主要内容</a><Header user={session?.user} config={settings} /><main id="main" className="min-h-[70vh]">{children}</main><Footer /><PWAStatus /></Providers></body></html>;
}
