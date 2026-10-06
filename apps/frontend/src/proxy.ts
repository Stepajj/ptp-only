import { NextResponse, type NextRequest } from 'next/server';

const contentApi = process.env.CMS_API_URL || 'http://127.0.0.1:4010/cms';
const sectionSlugs = new Set(['faq', 'how-it-works', 'methods', 'security', 'about']);
function contentResponse(status: number, heading: string, message: string) {
  const body = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading} | OnlyP2P</title></head><body><main><h1>${heading}</h1><p>${message}</p><a href="/">На главную</a></main></body></html>`;
  return new NextResponse(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const articleMatch = pathname.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  const sectionMatch = /^\/(faq|how-it-works|methods|security|about)$/.exec(pathname);
  const slug = articleMatch?.[1] || (sectionMatch && sectionSlugs.has(sectionMatch[1]) ? sectionMatch[1] : null);
  if (!slug) return NextResponse.next();
  try {
    const response = await fetch(`${contentApi}/public/${encodeURIComponent(slug)}`, { cache: 'no-store', signal: AbortSignal.timeout(600) });
    if (response.status === 404) return contentResponse(404, 'Материал не найден', 'Эта публичная страница не опубликована или больше недоступна.');
    if (!response.ok) return contentResponse(503, 'Страница временно недоступна', 'Попробуйте открыть её позже.');
    const data = await response.json() as { redirectTo?: string };
    if (data.redirectTo && /^\/(?:blog\/[a-z0-9]+(?:-[a-z0-9]+)*|faq|how-it-works|methods|security|about)$/.test(data.redirectTo)) {
      return NextResponse.redirect(new URL(data.redirectTo, request.url), 301);
    }
  } catch { return contentResponse(503, 'Страница временно недоступна', 'Попробуйте открыть её позже.'); }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };
