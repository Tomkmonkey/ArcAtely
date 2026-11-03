import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Role, UserStatus } from '@prisma/client';
import { getSiteSettings } from '@/lib/settings';
import { rateLimit } from '@/lib/rate-limit';

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(72) });

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [CredentialsProvider({
    name: '邮箱登录',
    credentials: { email: { label: '邮箱', type: 'email' }, password: { label: '密码', type: 'password' } },
    async authorize(credentials) {
      const settings = await getSiteSettings();
      if (!settings.credentialsEnabled) return null;
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      if (!(await rateLimit(`login:${parsed.data.email.toLowerCase()}`, 10, 300)).success) return null;
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      if (!user || user.status === 'BANNED' || !(await compare(parsed.data.password, user.passwordHash))) return null;
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role, status: user.status };
    },
  })],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) { token.id = user.id; token.role = (user as { role: Role }).role; token.status = (user as { status: UserStatus }).status; }
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true, status: true, name: true } });
        if (dbUser) { token.role = dbUser.role; token.status = dbUser.status; token.name = dbUser.name; }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.role = token.role; session.user.status = token.status; }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() { return getServerSession(authOptions); }
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}
