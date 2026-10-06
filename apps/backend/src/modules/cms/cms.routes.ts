import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../db/prisma';

const router = Router();
const COOKIE = 'op2p_cms_session';
const SESSION_SECONDS = 8 * 60 * 60;
const mediaDirectory = path.resolve(process.cwd(), 'uploads/content');
const contentSchema = z.object({
  type: z.enum(['ARTICLE', 'FAQ', 'HOW_IT_WORKS', 'METHODS', 'SECURITY', 'ABOUT']),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  // Drafts may be incomplete. Publication applies the full editorial checks below.
  title: z.string().trim().max(80).default(''),
  h1: z.string().trim().max(120).default(''),
  description: z.string().trim().max(180).default(''),
  summary: z.string().trim().max(300).default(''),
  body: z.string().trim().max(100000).default(''),
  author: z.string().trim().max(100).default(''),
  authorType: z.enum(['Person', 'Organization']).default('Organization'),
  checkedAt: z.iso.datetime().nullable().default(null),
  sources: z.array(z.url().refine((value) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } })).max(20).default([]),
  relatedSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(12).default([]),
  cta: z.enum(['register', 'telegram', 'none']).nullable().default(null),
}).superRefine((content, context) => {
  const fixed = { FAQ: 'faq', HOW_IT_WORKS: 'how-it-works', METHODS: 'methods', SECURITY: 'security', ABOUT: 'about' } as const;
  if (content.type !== 'ARTICLE' && fixed[content.type] !== content.slug) context.addIssue({ code: 'custom', message: 'This content type requires its canonical route slug', path: ['slug'] });
  if (content.type === 'ARTICLE' && ['terms', 'privacy', 'login', 'register', 'admin', 'faq', 'how-it-works', 'methods', 'security', 'about', 'blog'].includes(content.slug)) context.addIssue({ code: 'custom', message: 'This slug is reserved', path: ['slug'] });
});

function secret() { return process.env.CMS_SESSION_SECRET ?? ''; }
function param(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? '' : value ?? ''; }
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function hasCompleteFaqItems(body: string) {
  const entries: { question: string; answer: string[] }[] = [];
  let current: { question: string; answer: string[] } | null = null;
  for (const line of body.split(/\r?\n/)) {
    const heading = /^##\s+(.+)$/.exec(line.trim());
    if (heading) { current = { question: heading[1]?.trim() ?? '', answer: [] }; entries.push(current); }
    else if (current) current.answer.push(line);
  }
  return entries.length > 0 && entries.every((entry) => Boolean(entry.question && entry.answer.join('\n').trim()));
}
function cookieValue(request: Request, name: string): string | undefined {
  const raw = request.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0 && part.slice(0, separator).trim() === name) return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}
function sessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS, nonce: randomBytes(8).toString('hex') })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function validSession(request: Request) {
  if (secret().length < 32) return false;
  const token = cookieValue(request, COOKIE);
  if (!token) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return false;
  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof decoded === 'object' && decoded !== null && 'exp' in decoded && typeof decoded.exp === 'number' && decoded.exp > Date.now() / 1000;
  } catch { return false; }
}
function requireEditor(request: Request, response: Response, next: NextFunction) {
  if (!validSession(request)) { response.status(401).json({ error: 'EDITOR_AUTH_REQUIRED' }); return; }
  next();
}
async function audit(pageId: string | null, action: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED' | 'RESTORED' | 'SLUG_CHANGED' | 'MEDIA_UPLOADED' | 'DELETED', slug: string) {
  await prisma.contentAuditLog.create({ data: { pageId, action, actor: process.env.CMS_EDITOR_USERNAME ?? 'editor', slug } });
}
function sameOrigin(request: Request, response: Response, next: NextFunction) {
  const origin = request.get('origin');
  try {
    const originHost = origin ? new URL(origin).host : '';
    const configuredOrigin = process.env.CMS_FRONTEND_ORIGIN ?? '';
    if (!origin || (originHost !== request.get('host') && origin !== configuredOrigin)) throw new Error('origin');
    next();
  } catch { response.status(403).json({ error: 'ORIGIN_REJECTED' }); }
}
async function notifyPublicChange(paths: string[], options: { indexNow?: boolean } = {}) {
  const changed = [...new Set(paths)].filter(Boolean);
  const revalidateUrl = process.env.CMS_REVALIDATE_URL;
  const revalidateSecret = process.env.CMS_REVALIDATE_SECRET;
  const indexNowKey = process.env.INDEXNOW_KEY;
  const indexNowKeyLocation = process.env.INDEXNOW_KEY_LOCATION;
  const tasks: Promise<unknown>[] = [];
  if (revalidateUrl && revalidateSecret) {
    tasks.push(fetch(revalidateUrl, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${revalidateSecret}` }, body: JSON.stringify({ paths: changed }), signal: AbortSignal.timeout(2500) }).then((result) => { if (!result.ok) console.error(`CMS revalidation failed with HTTP ${String(result.status)}`); }).catch(() => console.error('CMS revalidation request failed')));
  }
  if (options.indexNow && indexNowKey && indexNowKeyLocation) {
    const urls = changed.filter((route) => route !== '/' && route !== '/sitemap.xml').map((route) => `https://p2pru.com${route}`);
    tasks.push(fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'p2pru.com', key: indexNowKey, keyLocation: indexNowKeyLocation, urlList: urls }), signal: AbortSignal.timeout(2500) }).then((result) => { if (!result.ok) console.error(`IndexNow submission failed with HTTP ${String(result.status)}`); }).catch(() => console.error('IndexNow submission failed')));
  }
  await Promise.all(tasks);
}
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

router.post('/login', loginLimiter, sameOrigin, (request, response) => {
  const username = process.env.CMS_EDITOR_USERNAME ?? '';
  const password = process.env.CMS_EDITOR_PASSWORD ?? '';
  const body = z.object({ username: z.string().max(100), password: z.string().max(500) }).safeParse(request.body);
  if (secret().length < 32 || !username || !password || !body.success || !safeEqual(body.data.username, username) || !safeEqual(body.data.password, password)) {
    response.status(401).json({ error: 'INVALID_CREDENTIALS' }); return;
  }
  response.cookie(COOKIE, sessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict', path: '/cms', maxAge: SESSION_SECONDS * 1000 });
  response.json({ ok: true });
});
router.post('/logout', requireEditor, sameOrigin, (_request, response) => {
  response.clearCookie(COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict', path: '/cms' });
  response.json({ ok: true });
});
router.get('/session', requireEditor, (_request, response) => response.json({ ok: true }));

router.get('/public', async (_request, response, next) => {
  try {
    const pages = await prisma.contentPage.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }] });
    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.json(pages.filter((page) => page.type !== 'FAQ' || hasCompleteFaqItems(page.body)));
  } catch (error) { next(error); }
});
router.get('/public/:slug', async (request, response, next) => {
  try {
    const page = await prisma.contentPage.findUnique({ where: { slug: param(request.params.slug) } });
    if (page?.status === 'PUBLISHED' && (page.type !== 'FAQ' || hasCompleteFaqItems(page.body))) {
      response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300'); response.json(page); return;
    }
    const redirect = await prisma.contentSlugRedirect.findUnique({ where: { oldSlug: param(request.params.slug) } });
    if (redirect) { response.json({ redirectTo: `/blog/${redirect.newSlug}` }); return; }
    response.status(404).json({ error: 'CONTENT_NOT_FOUND' });
  } catch (error) { next(error); }
});

router.get('/admin/content', requireEditor, async (_request, response, next) => {
  try { response.json(await prisma.contentPage.findMany({ orderBy: { updatedAt: 'desc' }, include: { revisions: { orderBy: { version: 'desc' }, select: { id: true, version: true, createdAt: true } } } })); }
  catch (error) { next(error); }
});
router.get('/admin/preview/:slug', requireEditor, async (request, response, next) => {
  try { const page = await prisma.contentPage.findUnique({ where: { slug: param(request.params.slug) } }); if (!page) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; } response.setHeader('Cache-Control', 'private, no-store'); response.json(page); }
  catch (error) { next(error); }
});
router.post('/admin/content', requireEditor, sameOrigin, async (request, response, next) => {
  const data = contentSchema.safeParse(request.body);
  if (!data.success) { response.status(400).json({ error: 'INVALID_CONTENT', details: z.treeifyError(data.error) }); return; }
  try {
    if (await prisma.contentPage.count({ where: { slug: data.data.slug } }) || await prisma.contentSlugRedirect.count({ where: { oldSlug: data.data.slug } })) {
      response.status(409).json({ error: 'SLUG_TAKEN' }); return;
    }
    if (data.data.relatedSlugs.length && await prisma.contentPage.count({ where: { slug: { in: data.data.relatedSlugs }, status: 'PUBLISHED' } }) !== data.data.relatedSlugs.length) {
      response.status(400).json({ error: 'RELATED_CONTENT_MUST_BE_PUBLISHED' }); return;
    }
    const page = await prisma.contentPage.create({ data: { ...data.data, checkedAt: data.data.checkedAt ? new Date(data.data.checkedAt) : null } });
    await prisma.contentRevision.create({ data: { pageId: page.id, version: 1, snapshot: page } });
    await audit(page.id, 'CREATED', page.slug);
    response.status(201).json(page);
  } catch (error) { next(error); }
});
router.put('/admin/content/:id', requireEditor, sameOrigin, async (request, response, next) => {
  const data = contentSchema.safeParse(request.body);
  if (!data.success) { response.status(400).json({ error: 'INVALID_CONTENT', details: z.treeifyError(data.error) }); return; }
  try {
    const current = await prisma.contentPage.findUnique({ where: { id: param(request.params.id) } });
    if (!current) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; }
    const slugCollision = await prisma.contentPage.findFirst({ where: { slug: data.data.slug, id: { not: current.id } }, select: { id: true } });
    if (slugCollision || (data.data.slug !== current.slug && await prisma.contentSlugRedirect.count({ where: { oldSlug: data.data.slug } }))) {
      response.status(409).json({ error: 'SLUG_TAKEN' }); return;
    }
    const previous = await prisma.contentPage.update({ where: { id: current.id }, data: { ...data.data, checkedAt: data.data.checkedAt ? new Date(data.data.checkedAt) : null, status: current.status === 'PUBLISHED' ? 'DRAFT' : current.status, publishedAt: current.publishedAt } });
    const version = await prisma.contentRevision.count({ where: { pageId: current.id } }) + 1;
    await prisma.contentRevision.create({ data: { pageId: current.id, version, snapshot: previous } });
    await audit(previous.id, current.slug === previous.slug ? 'UPDATED' : 'SLUG_CHANGED', previous.slug);
    if (current.slug !== previous.slug && current.status === 'PUBLISHED') {
      await prisma.contentSlugRedirect.updateMany({ where: { newSlug: current.slug }, data: { newSlug: previous.slug } });
      await prisma.contentSlugRedirect.upsert({ where: { oldSlug: current.slug }, update: { newSlug: previous.slug }, create: { oldSlug: current.slug, newSlug: previous.slug } });
    }
    response.json(previous);
    if (current.status === 'PUBLISHED') await notifyPublicChange(current.type === 'ARTICLE' ? [`/blog/${current.slug}`, `/blog/${previous.slug}`, '/blog', '/', '/sitemap.xml'] : [`/${current.slug}`, `/${previous.slug}`, '/', '/sitemap.xml']);
  } catch (error) { next(error); }
});
router.post('/admin/content/:id/publish', requireEditor, sameOrigin, async (request, response, next) => {
  try {
    const page = await prisma.contentPage.findUnique({ where: { id: param(request.params.id) } });
    if (!page) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; }
    const missingFields = [
      !page.title.trim() && 'Title',
      !page.h1.trim() && 'H1',
      !page.description.trim() && 'Description',
      !page.summary.trim() && 'аннотацию',
      !page.body.trim() && 'текст',
      !page.author.trim() && 'автора',
      !page.checkedAt && 'дату проверки фактов',
    ].filter((field): field is string => Boolean(field));
    if (missingFields.length) {
      response.status(400).json({ error: 'EDITORIAL_CHECK_REQUIRED', message: `Для публикации заполните: ${missingFields.join(', ')}.` }); return;
    }
    if (page.type === 'FAQ' && !hasCompleteFaqItems(page.body)) {
      response.status(400).json({ error: 'FAQ_ITEMS_REQUIRED', message: 'Добавьте хотя бы один вопрос и заполните его ответ перед публикацией.' }); return;
    }
    if (page.relatedSlugs.length) {
      const publishedRelated = await prisma.contentPage.findMany({ where: { slug: { in: page.relatedSlugs }, status: 'PUBLISHED' }, select: { slug: true } });
      const publishedSlugs = new Set(publishedRelated.map(({ slug }) => slug));
      const unavailableSlugs = page.relatedSlugs.filter((slug) => !publishedSlugs.has(slug));
      if (unavailableSlugs.length) {
        response.status(400).json({ error: 'RELATED_CONTENT_MUST_BE_PUBLISHED', message: `Эти связанные материалы ещё не опубликованы: ${unavailableSlugs.join(', ')}. Опубликуйте их или удалите slug из поля связанных материалов.` }); return;
      }
    }
    const published = await prisma.contentPage.update({ where: { id: page.id }, data: { status: 'PUBLISHED', publishedAt: page.publishedAt ?? new Date() } });
    const redirects = page.type === 'ARTICLE' ? await prisma.contentSlugRedirect.findMany({ where: { newSlug: page.slug }, select: { oldSlug: true } }) : [];
    await audit(page.id, 'PUBLISHED', page.slug);
    response.json(published);
    await notifyPublicChange([page.type === 'ARTICLE' ? `/blog/${page.slug}` : `/${page.slug}`, ...redirects.map(({ oldSlug }) => `/blog/${oldSlug}`), ...(page.type === 'ARTICLE' ? ['/blog'] : []), '/', '/sitemap.xml'], { indexNow: true });
  } catch (error) { next(error); }
});
router.post('/admin/content/:id/unpublish', requireEditor, sameOrigin, async (request, response, next) => {
  try { const page = await prisma.contentPage.update({ where: { id: param(request.params.id) }, data: { status: 'DRAFT' } }); await audit(page.id, 'UNPUBLISHED', page.slug); response.json(page); await notifyPublicChange([page.type === 'ARTICLE' ? `/blog/${page.slug}` : `/${page.slug}`, ...(page.type === 'ARTICLE' ? ['/blog'] : []), '/', '/sitemap.xml'], { indexNow: true }); }
  catch (error) { next(error); }
});
router.post('/admin/content/:id/archive', requireEditor, sameOrigin, async (request, response, next) => {
  try { const page = await prisma.contentPage.update({ where: { id: param(request.params.id) }, data: { status: 'ARCHIVED' } }); await audit(page.id, 'ARCHIVED', page.slug); response.json(page); await notifyPublicChange([page.type === 'ARTICLE' ? `/blog/${page.slug}` : `/${page.slug}`, ...(page.type === 'ARTICLE' ? ['/blog'] : []), '/', '/sitemap.xml'], { indexNow: true }); }
  catch (error) { next(error); }
});
router.post('/admin/content/:id/restore', requireEditor, sameOrigin, async (request, response, next) => {
  try {
    const current = await prisma.contentPage.findUnique({ where: { id: param(request.params.id) } });
    if (!current) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; }
    if (current.status !== 'ARCHIVED') { response.status(409).json({ error: 'CONTENT_NOT_ARCHIVED' }); return; }
    const restored = await prisma.contentPage.update({ where: { id: current.id }, data: { status: 'DRAFT' } });
    await audit(restored.id, 'RESTORED', restored.slug);
    response.json(restored);
  } catch (error) { next(error); }
});
router.delete('/admin/content/:id', requireEditor, sameOrigin, async (request, response, next) => {
  try {
    const id = param(request.params.id);
    const page = await prisma.contentPage.findUnique({ where: { id } });
    if (!page) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; }
    if (page.status !== 'ARCHIVED') { response.status(409).json({ error: 'CONTENT_MUST_BE_ARCHIVED_FIRST' }); return; }

    const mediaFiles = [...new Set([...page.body.matchAll(/\/content-media\/([a-f0-9]{36}\.(?:png|jpg))/g)].map((match) => match[1]).filter((filename): filename is string => Boolean(filename)))];
    await prisma.$transaction([
      prisma.contentAuditLog.create({ data: { pageId: page.id, action: 'DELETED', actor: process.env.CMS_EDITOR_USERNAME ?? 'editor', slug: page.slug } }),
      prisma.contentSlugRedirect.deleteMany({ where: { OR: [{ oldSlug: page.slug }, { newSlug: page.slug }] } }),
      prisma.contentPage.delete({ where: { id: page.id } }),
    ]);

    for (const filename of mediaFiles) {
      const referenced = await prisma.contentPage.findFirst({ where: { body: { contains: `/content-media/${filename}` } }, select: { id: true } });
      if (!referenced) await unlink(path.join(mediaDirectory, filename)).catch(() => undefined);
    }
    response.json({ ok: true });
  } catch (error) { next(error); }
});
router.get('/admin/content/:id/revisions/:version', requireEditor, async (request, response, next) => {
  try { const revision = await prisma.contentRevision.findUnique({ where: { pageId_version: { pageId: param(request.params.id), version: Number(param(request.params.version)) } } }); if (!revision) { response.status(404).json({ error: 'REVISION_NOT_FOUND' }); return; } response.json(revision); }
  catch (error) { next(error); }
});
router.post('/admin/content/:id/revisions/:version/restore', requireEditor, sameOrigin, async (request, response, next) => {
  try {
    const revision = await prisma.contentRevision.findUnique({ where: { pageId_version: { pageId: param(request.params.id), version: Number(param(request.params.version)) } } });
    if (!revision) { response.status(404).json({ error: 'REVISION_NOT_FOUND' }); return; }
    const snapshot = contentSchema.safeParse(revision.snapshot);
    if (!snapshot.success) { response.status(400).json({ error: 'INVALID_REVISION' }); return; }
    const current = await prisma.contentPage.findUnique({ where: { id: param(request.params.id) } });
    if (!current) { response.status(404).json({ error: 'CONTENT_NOT_FOUND' }); return; }
    const restored = await prisma.contentPage.update({ where: { id: param(request.params.id) }, data: { ...snapshot.data, status: 'DRAFT', checkedAt: null, publishedAt: current.publishedAt } });
    if (current.status === 'PUBLISHED' && current.slug !== restored.slug) {
      await prisma.contentSlugRedirect.updateMany({ where: { newSlug: current.slug }, data: { newSlug: restored.slug } });
      await prisma.contentSlugRedirect.upsert({ where: { oldSlug: current.slug }, update: { newSlug: restored.slug }, create: { oldSlug: current.slug, newSlug: restored.slug } });
    }
    const version = await prisma.contentRevision.count({ where: { pageId: restored.id } }) + 1;
    await prisma.contentRevision.create({ data: { pageId: restored.id, version, snapshot: restored } });
    await audit(restored.id, 'RESTORED', restored.slug);
    response.json(restored);
    if (current.status === 'PUBLISHED') await notifyPublicChange(current.type === 'ARTICLE' ? [`/blog/${current.slug}`, `/blog/${restored.slug}`, '/blog', '/', '/sitemap.xml'] : [`/${current.slug}`, `/${restored.slug}`, '/', '/sitemap.xml']);
  } catch (error) { next(error); }
});

function normalizedUpload(file: Express.Multer.File): { data: Buffer; ext: string } | null {
  if (file.mimetype === 'image/png' && file.buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    const chunks: Buffer[] = [file.buffer.subarray(0, 8)]; let offset = 8; let sawHeader = false; let sawEnd = false;
    while (offset + 12 <= file.buffer.length) {
      const length = file.buffer.readUInt32BE(offset); const end = offset + 12 + length;
      if (end > file.buffer.length) return null;
      const type = file.buffer.toString('ascii', offset + 4, offset + 8);
      if (offset === 8) { if (type !== 'IHDR' || length !== 13) return null; sawHeader = true; }
      if (!['eXIf', 'tEXt', 'iTXt', 'zTXt'].includes(type)) chunks.push(file.buffer.subarray(offset, end));
      offset = end;
      if (type === 'IEND') { if (length !== 0) return null; sawEnd = true; break; }
    }
    return sawHeader && sawEnd && offset === file.buffer.length ? { data: Buffer.concat(chunks), ext: 'png' } : null;
  }
  if (file.mimetype === 'image/jpeg' && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer.at(-2) === 0xff && file.buffer.at(-1) === 0xd9) {
    const chunks: Buffer[] = [file.buffer.subarray(0, 2)]; let offset = 2;
    while (offset + 4 <= file.buffer.length && file.buffer[offset] === 0xff) {
      const marker = file.buffer[offset + 1];
      if (marker === 0xda) { chunks.push(file.buffer.subarray(offset)); offset = file.buffer.length; break; }
      const length = file.buffer.readUInt16BE(offset + 2); const end = offset + 2 + length;
      if (length < 2 || end > file.buffer.length) return null;
      if (marker !== 0xe1 && marker !== 0xed && marker !== 0xfe) chunks.push(file.buffer.subarray(offset, end));
      offset = end;
    }
    return offset === file.buffer.length ? { data: Buffer.concat(chunks), ext: 'jpg' } : null;
  }
  return null;
}
router.post('/admin/media', requireEditor, sameOrigin, upload.single('image'), async (request, response, next) => {
  try {
    if (!request.file) { response.status(400).json({ error: 'IMAGE_REQUIRED' }); return; }
    const normalized = normalizedUpload(request.file);
    if (!normalized) { response.status(415).json({ error: 'ONLY_VALID_PNG_OR_JPEG_WITHOUT_METADATA' }); return; }
    const filename = `${randomBytes(18).toString('hex')}.${normalized.ext}`;
    await mkdir(mediaDirectory, { recursive: true });
    await writeFile(path.join(mediaDirectory, filename), normalized.data, { flag: 'wx', mode: 0o600 });
    await audit(null, 'MEDIA_UPLOADED', filename);
    response.status(201).json({ url: `/content-media/${filename}`, alt: '' });
  } catch (error) { next(error); }
});
router.get('/media/:filename', async (request, response) => {
  const filename = param(request.params.filename);
  if (!/^[a-f0-9]{36}\.(png|jpg)$/.test(filename)) { response.status(404).end(); return; }
  try {
    const isPublished = await prisma.contentPage.findFirst({ where: { status: 'PUBLISHED', body: { contains: `/content-media/${filename}` } }, select: { id: true } });
    if (!isPublished && !validSession(request)) { response.status(404).end(); return; }
    const content = await readFile(path.join(mediaDirectory, filename));
    response.setHeader('Content-Type', filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
    response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Cache-Control', isPublished ? 'public, max-age=300, stale-while-revalidate=600' : 'private, no-store'); response.send(content);
  } catch { response.status(404).end(); }
});

export { router as cmsRouter };
