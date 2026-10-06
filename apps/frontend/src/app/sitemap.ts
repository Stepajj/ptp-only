import type { MetadataRoute } from 'next';
import { getPublishedContent } from '@/features/content/content';

// The list is CMS-controlled and must reflect a publish/unpublish as soon as it is requested.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: 'https://p2pru.com/', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://p2pru.com/terms', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://p2pru.com/privacy', changeFrequency: 'yearly', priority: 0.3 },
  ];
  const pages = await getPublishedContent() || [];
  for (const page of pages) {
    const url = page.type === 'ARTICLE' ? `https://p2pru.com/blog/${page.slug}` : `https://p2pru.com/${page.slug}`;
    entries.push({ url, lastModified: new Date(page.updatedAt), changeFrequency: 'monthly', priority: page.type === 'ARTICLE' ? 0.7 : 0.8 });
  }
  if (pages.some((page) => page.type === 'ARTICLE')) entries.push({ url: 'https://p2pru.com/blog', changeFrequency: 'weekly', priority: 0.7 });
  return entries;
}
