import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin) {
      const expected = process.env.NEXTAUTH_URL || request.nextUrl.origin;
      if (origin !== expected && origin !== request.nextUrl.origin) return NextResponse.json({ error: '跨站请求已被拒绝' }, { status: 403 });
    }
    if (request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: '跨站请求已被拒绝' }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/me') ? 'noindex,nofollow' : 'all');
  return response;
}
export const config = { matcher: ['/api/:path*', '/admin/:path*', '/me/:path*'] };
