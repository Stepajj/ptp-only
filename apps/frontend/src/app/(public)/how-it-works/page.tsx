import type { Metadata } from 'next';
import { CmsSection, createContentMetadata } from '@/features/content/CmsSection';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> { return createContentMetadata('how-it-works'); }
export default function Page() { return <CmsSection slug="how-it-works" />; }
