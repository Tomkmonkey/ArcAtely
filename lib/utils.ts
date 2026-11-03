import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}
export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
}
export function relativeTime(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
  return formatDate(date);
}
export function slugify(input: string) {
  const base = input.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 7)}`;
}
export function safeNext(value: string | null | undefined) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}
export function initials(name: string) { return name.trim().slice(0, 1).toUpperCase(); }
export const MODEL_SELECT = {
  id: true, title: true, slug: true, description: true, coverUrl: true, fileUrl: true,
  externalUrl: true, fileName: true, fileSize: true, format: true, version: true,
  status: true, visibility: true, featured: true, pinned: true, views: true,
  likesCount: true, favoritesCount: true, hotScore: true, publishedAt: true,
  createdAt: true, updatedAt: true, rejectionReason: true,
  author: { select: { id: true, name: true, image: true, bio: true, verified: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: true } },
} as const;
