import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const backend = process.env.CMS_INTERNAL_API_URL || 'http://127.0.0.1:4010/cms';
export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-f0-9]{36}\.(png|jpg)$/.test(filename)) return new Response(null, { status: 404 });
  try {
    const cookie = request.headers.get('cookie');
    const headers = cookie ? { cookie } : undefined;
    const response = await fetch(`${backend}/media/${filename}`, { headers, cache: 'no-store' });
    if (!response.ok) return new Response(null, { status: 404 });
    return new NextResponse(response.body, { headers: { 'content-type': response.headers.get('content-type') || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'cache-control': response.headers.get('cache-control') || 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'MEDIA_UNAVAILABLE' }, { status: 503 }); }
}
