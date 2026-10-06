import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPage } from '@/features/content/content';
import { ContentPageView } from '@/features/content/ContentPageView';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page || page.type !== 'ARTICLE') return { title: 'Статья не найдена', robots: { index: false, follow: true } };
  const url = `/blog/${page.slug}`;
  return { title: page.title, description: page.description, alternates: { canonical: url }, openGraph: { type: 'article', title: page.title, description: page.description, url, siteName: 'OnlyP2P', locale: 'ru_RU', publishedTime: page.publishedAt || undefined, modifiedTime: page.updatedAt, authors: [page.author], images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] }, twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/og-image.jpg'] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page || page.type !== 'ARTICLE') notFound();
  const url = `https://p2pru.com/blog/${page.slug}`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: page.h1, description: page.description, datePublished: page.publishedAt, dateModified: page.updatedAt, mainEntityOfPage: url, author: { '@type': page.authorType, name: page.author }, publisher: { '@type': 'Organization', name: 'OnlyP2P', url: 'https://p2pru.com' } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} /><ContentPageView page={page} article /></>;
}
