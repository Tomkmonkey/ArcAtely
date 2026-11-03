import { prisma } from '@/lib/prisma';

export const defaultSettings = {
  siteName: '模型岛',
  logo: '',
  announcement: '欢迎来到模型岛，尊重原创，友善交流。',
  navigation: [
    { label: '发现模型', href: '/search' }, { label: '排行榜', href: '/rankings' },
    { label: '标签', href: '/tags' }, { label: '合集', href: '/collections' }, { label: '订阅', href: '/subscriptions' },
  ],
  registrationEnabled: true,
  credentialsEnabled: true,
  maxImageMb: 5,
  maxModelMb: 100,
  tagMinLength: 1,
  tagMaxLength: 20,
  moderationEnabled: true,
  messagesEnabled: true,
  reportReasons: ['侵权或未经授权', '违法违规内容', '恶意文件或安全风险', '垃圾广告', '其他'],
};
export type SiteSettings = typeof defaultSettings;
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.DATABASE_URL) return defaultSettings;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'site' } });
    return { ...defaultSettings, ...((setting?.value || {}) as Partial<SiteSettings>) };
  } catch {
    // 静态构建与数据库短暂不可用时使用安全默认值；业务接口仍会独立报告数据库错误。
    return defaultSettings;
  }
}
