import type { Metadata } from 'next';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';

export const metadata: Metadata = {
  title: { default: 'OnlyP2P', template: '%s | OnlyP2P' },
  openGraph: { siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
};

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <Header />
    {children}
    <Footer />
  </>;
}
