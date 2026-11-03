import { z } from 'zod';

const safeUrl = z.string().max(2000).refine((value) => !value || /^https?:\/\//.test(value) || value.startsWith('/uploads/') || value.startsWith('/covers/'), '链接格式不正确');
export const modelSchema = z.object({
  title: z.string().trim().min(2, '标题至少 2 个字').max(80),
  description: z.string().trim().min(20, '请至少用 20 个字介绍模型').max(10000),
  coverUrl: safeUrl.optional().or(z.literal('')),
  externalUrl: z.string().url('外链需为完整 http(s) 地址').max(2000).optional().or(z.literal('')),
  fileUrl: safeUrl.optional().or(z.literal('')),
  fileName: z.string().max(255).optional().or(z.literal('')),
  fileSize: z.number().int().nonnegative().optional(),
  format: z.string().max(30).optional().or(z.literal('')),
  version: z.string().trim().min(1).max(30).default('1.0'),
  categoryId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(20)).max(8, '最多选择 8 个标签').default([]),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
}).refine((data) => data.fileUrl || data.externalUrl, { message: '请上传模型文件或填写下载外链', path: ['externalUrl'] });
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(24).regex(/^[\w\u4e00-\u9fa5-]+$/, '昵称仅支持中英文、数字、下划线和连字符'),
  email: z.string().email().max(255), password: z.string().min(8, '密码至少 8 位').max(72),
});
export const reportSchema = z.object({ reason: z.string().min(2).max(100), details: z.string().max(1000).optional() });
export const commentSchema = z.object({ content: z.string().trim().min(1).max(1000), parentId: z.string().optional() });
export const messageSchema = z.object({ recipientId: z.string().optional(), conversationId: z.string().optional(), content: z.string().trim().min(1).max(2000) });
