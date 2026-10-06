import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublishedPage } from './content';
import { ContentPageView } from './ContentPageView';

export async function createContentMetadata(slug: string): Promise<Metadata> {
  const page = await getPublishedPage(slug);
  if (!page) return { title: 'Страница не найдена', robots: { index: false, follow: true } };
  const url = `/${slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: 'website', title: page.title, description: page.description, url, siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/og-image.jpg'] },
  };
}

export async function CmsSection({ slug }: { slug: string }) {
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  return <ContentPageView page={page} />;
}
