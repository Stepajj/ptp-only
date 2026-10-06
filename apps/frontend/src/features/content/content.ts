import { permanentRedirect } from 'next/navigation';

export type PublishedContent = {
  id: string;
  type: 'ARTICLE' | 'FAQ' | 'HOW_IT_WORKS' | 'METHODS' | 'SECURITY' | 'ABOUT';
  slug: string;
  status: 'PUBLISHED';
  title: string;
  h1: string;
  description: string;
  summary: string;
  body: string;
  author: string;
  authorType: 'Person' | 'Organization';
  checkedAt: string | null;
  sources: string[];
  relatedSlugs: string[];
  cta: 'register' | 'telegram' | 'none' | null;
  publishedAt: string | null;
  updatedAt: string;
};

const baseUrl = process.env.CMS_API_URL || 'http://127.0.0.1:4010/cms';

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 60, tags: ['cms-content'] } });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function getPublishedContent() {
  return readJson<PublishedContent[]>('/public');
}

export async function getPublishedPage(slug: string, followRedirect = false): Promise<PublishedContent | null> {
  const value = await readJson<PublishedContent | { redirectTo: string }>(`/public/${encodeURIComponent(slug)}`);
  if (value && 'redirectTo' in value) {
    if (!followRedirect) permanentRedirect(value.redirectTo);
    const destination = value.redirectTo.split('/').pop();
    if (destination) return getPublishedPage(destination);
  }
  return value && 'id' in value ? value : null;
}
