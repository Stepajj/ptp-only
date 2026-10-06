import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ContentPageView } from '@/features/content/ContentPageView';
import type { PublishedContent } from '@/features/content/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Предпросмотр материала', robots: { index: false, follow: false, noarchive: true } };

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiUrl = process.env.CMS_API_URL || 'http://127.0.0.1:4010/cms';
  const cookieHeader = (await cookies()).toString();
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/admin/preview/${encodeURIComponent(slug)}`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
  } catch { notFound(); }
  if (!response.ok) notFound();
  const page = await response.json() as PublishedContent;
  return <ContentPageView page={page} article={page.type === 'ARTICLE'} preview />;
}
