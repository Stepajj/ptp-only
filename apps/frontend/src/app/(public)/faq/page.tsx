import type { Metadata } from 'next';
import { CmsSection, createContentMetadata } from '@/features/content/CmsSection';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> { return createContentMetadata('faq'); }
export default function Page() { return <CmsSection slug="faq" />; }
