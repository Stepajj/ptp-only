import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
const apiBase = process.env.CMS_INTERNAL_API_URL || 'http://127.0.0.1:4010/cms';
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path.length || path.some((part) => !/^[a-zA-Z0-9._-]+$/.test(part))) return NextResponse.json({ error: 'INVALID_PATH' }, { status: 400 });
  const target = `${apiBase}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  const origin = request.headers.get('origin');
  if (origin) headers.set('origin', origin);
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const upstream = await fetch(target, { method: request.method, headers, body, cache: 'no-store', redirect: 'manual' });
    const responseHeaders = new Headers({ 'cache-control': 'no-store' });
    const upstreamType = upstream.headers.get('content-type');
    if (upstreamType) responseHeaders.set('content-type', upstreamType);
    const location = upstream.headers.get('location');
    if (location) responseHeaders.set('location', location);
    const cookieHeaders = upstream.headers.getSetCookie();
    for (const setCookie of cookieHeaders) responseHeaders.append('set-cookie', setCookie.replace(/Path=\/cms(?=;|$)/i, 'Path=/'));
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: 'CONTENT_SERVICE_UNAVAILABLE' }, { status: 503 });
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
