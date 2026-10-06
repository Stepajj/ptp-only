import type { Metadata } from 'next';
import { CmsSection, createContentMetadata } from '@/features/content/CmsSection';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> { return createContentMetadata('about'); }
export default function Page() { return <CmsSection slug="about" />; }
