import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSession } from '@/lib/auth';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export function ok<T>(data: T, status = 200) { return NextResponse.json({ data }, { status }); }
export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}
export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session?.user?.id) return { error: fail('请先登录', 401), session: null };
  const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true } });
  if (!current || current.status === 'BANNED') return { error: fail('账号不存在或已被封禁', 403), session: null };
  session.user.role = current.role;
  session.user.status = current.status;
  if (roles && !roles.includes(current.role)) return { error: fail('没有执行此操作的权限', 403), session: null };
  return { session, error: null };
}
export function handleError(error: unknown) {
  if (error instanceof ZodError) return fail('提交内容不符合要求', 422, error.flatten());
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return fail('内容已存在，请勿重复提交', 409);
  console.error('[API_ERROR]', error);
  return fail('服务器暂时无法处理请求，请稍后重试', 500);
}
export const STAFF: Role[] = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
export const ADMINS: Role[] = ['ADMIN', 'SUPER_ADMIN'];
