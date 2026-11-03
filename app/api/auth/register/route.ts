import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators/model';
import { ok, fail, handleError } from '@/lib/api';
import { rateLimit, requestIp } from '@/lib/rate-limit';
import { checkSensitive } from '@/lib/content';
import { getSiteSettings } from '@/lib/settings';
export async function POST(request: Request) {
  try {
    const settings = await getSiteSettings();
    if (!settings.registrationEnabled) return fail('站点当前暂停注册', 403);
    if (!(await rateLimit(`register:${requestIp(request)}`, 5, 3600)).success) return fail('注册过于频繁，请稍后再试', 429);
    const input = registerSchema.parse(await request.json());
    const sensitive = await checkSensitive(input.name);
    if (sensitive.hits.length) return fail('昵称包含社区不允许的词语', 422);
    const user = await prisma.user.create({ data: { name: input.name, email: input.email.toLowerCase(), passwordHash: await hash(input.password, 12) }, select: { id: true, name: true, email: true } });
    return ok(user, 201);
  } catch (error) { return handleError(error); }
}
