import { LandingPage } from "@/features/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Криптовалютные операции через OnlyP2P",
  description: "Пополнение, реквизиты, входящие заявки и поддержка через инфраструктуру OnlyP2P.",
  alternates: { canonical: "/" },
  openGraph: { type: 'website', title: 'Криптовалютные операции через OnlyP2P', description: 'Пополнение, реквизиты, входящие заявки и поддержка через инфраструктуру OnlyP2P.', url: '/', siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
  twitter: { card: 'summary_large_image', title: 'Криптовалютные операции через OnlyP2P', description: 'Пополнение, реквизиты, входящие заявки и поддержка через инфраструктуру OnlyP2P.', images: ['/og-image.jpg'] },
};

export default function Home() {
  const data = [
    { '@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://p2pru.com/#organization', name: 'OnlyP2P', url: 'https://p2pru.com/' },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': 'https://p2pru.com/#website', url: 'https://p2pru.com/', name: 'OnlyP2P', inLanguage: 'ru-RU', publisher: { '@id': 'https://p2pru.com/#organization' } },
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} /><LandingPage /></>;
}
