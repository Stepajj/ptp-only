import type { Metadata } from 'next';
import { BlogCatalog, blogMetadata } from '@/features/content/BlogCatalog';
import { getPublishedContent } from '@/features/content/content';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const pages = (await getPublishedContent())?.filter((page) => page.type === 'ARTICLE') || [];
  return pages.length ? blogMetadata : { ...blogMetadata, robots: { index: false, follow: true } };
}
export default async function Page() {
  const pages = (await getPublishedContent())?.filter((page) => page.type === 'ARTICLE') || [];
  return <BlogCatalog pages={pages} />;
}
