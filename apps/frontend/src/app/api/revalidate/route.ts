import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const body = await request.json().catch(() => null) as { paths?: unknown } | null;
  const paths = Array.isArray(body?.paths) ? body.paths.filter((path): path is string => typeof path === 'string' && /^\/(?:|blog(?:\/[a-z0-9-]+)?|faq|how-it-works|methods|security|about|sitemap\.xml)$/.test(path)) : [];
  revalidateTag('cms-content', { expire: 0 });
  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ revalidated: paths });
}
