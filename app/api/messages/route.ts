import { prisma } from '@/lib/prisma';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { messageSchema } from '@/lib/validators/model';
import { cleanText, checkSensitive } from '@/lib/content';
import { rateLimit } from '@/lib/rate-limit';
import { notify } from '@/lib/audit';
import { getSiteSettings } from '@/lib/settings';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const { session, error } = await requireUser(); if (error) return error; const userId = session!.user.id; const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (conversationId) {
    const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } }); if (!participant) return fail('会话不存在', 404);
    const messages = await prisma.message.findMany({ where: { conversationId, deletedAt: null }, include: { sender: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: 'asc' }, take: 200 });
    await prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() } });
    return ok(messages);
  }
  const conversations = await prisma.conversation.findMany({ where: { participants: { some: { userId } } }, include: { participants: { include: { user: { select: { id: true, name: true, image: true, status: true } } } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } });
  const unread = await prisma.message.count({ where: { conversation: { participants: { some: { userId } } }, senderId: { not: userId }, readAt: null } });
  return ok({ conversations, unread });
}
export async function POST(request: Request) {
  const { session, error } = await requireUser(); if (error) return error;
  try {
    const settings = await getSiteSettings();
    if (!settings.messagesEnabled) return fail('站点当前已关闭私信功能', 403);
    const userId = session!.user.id; if (session!.user.status === 'MUTED') return fail('禁言期间无法发送私信', 403);
    if (!(await rateLimit(`message:${userId}`, 30, 60)).success) return fail('发送过于频繁，请稍后再试', 429);
    const input = messageSchema.parse(await request.json()); const content = cleanText(input.content); const sensitive = await checkSensitive(content); if (sensitive.hits.length) return fail('消息包含敏感词', 422);
    let conversationId = input.conversationId, recipientId = input.recipientId;
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
      if (!conversation || !conversation.participants.some((p) => p.userId === userId)) return fail('会话不存在', 404);
      const recipient = conversation.participants.find((p) => p.userId !== userId); recipientId = recipient?.userId;
      if (recipient?.blocked) return fail('对方已将你拉黑，无法发送消息', 403);
    } else {
      if (!recipientId || recipientId === userId) return fail('接收者不正确', 422);
      const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true, status: true } }); if (!recipient || recipient.status === 'BANNED') return fail('用户不存在或不可接收私信', 404);
      const existing = await prisma.conversation.findFirst({ where: { AND: [{ participants: { some: { userId } } }, { participants: { some: { userId: recipientId } } }] }, include: { participants: true } });
      if (existing) { conversationId = existing.id; if (existing.participants.find((p) => p.userId === recipientId)?.blocked) return fail('对方已将你拉黑，无法发送消息', 403); }
      else conversationId = (await prisma.conversation.create({ data: { participants: { create: [{ userId }, { userId: recipientId }] } } })).id;
    }
    const message = await prisma.message.create({ data: { conversationId: conversationId!, senderId: userId, content }, include: { sender: { select: { id: true, name: true, image: true } } } });
    await prisma.conversation.update({ where: { id: conversationId! }, data: { updatedAt: new Date() } });
    if (recipientId) await notify(recipientId, 'MESSAGE', '你收到一条新私信', content.slice(0, 100), `/messages?conversation=${conversationId}`);
    return ok(message, 201);
  } catch (error) { return handleError(error); }
}
