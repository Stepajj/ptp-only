import { LandingPage } from "@/features/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Продать криптовалюту за рубли с доплатой +7%",
  description: "Продайте USDT, BTC или LTC через OnlyP2P. Доплата +7% при конвертации, рублёвый баланс, получение переводов на карту или СБП.",
  alternates: { canonical: "/" },
  openGraph: { type: 'website', title: 'Продать криптовалюту за рубли с доплатой +7% | OnlyP2P', description: 'Продайте USDT, BTC или LTC через OnlyP2P. Доплата +7% при конвертации, рублёвый баланс, получение переводов на карту или СБП.', url: '/', siteName: 'OnlyP2P', locale: 'ru_RU', images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'OnlyP2P' }] },
  twitter: { card: 'summary_large_image', title: 'Продать криптовалюту за рубли с доплатой +7% | OnlyP2P', description: 'Продайте USDT, BTC или LTC через OnlyP2P. Доплата +7% при конвертации, рублёвый баланс, получение переводов на карту или СБП.', images: ['/og-image.jpg'] },
};

export default function Home() {
  const data = [
    { '@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://p2pru.com/#organization', name: 'OnlyP2P', url: 'https://p2pru.com/' },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': 'https://p2pru.com/#website', url: 'https://p2pru.com/', name: 'OnlyP2P', inLanguage: 'ru-RU', publisher: { '@id': 'https://p2pru.com/#organization' } },
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} /><LandingPage /></>;
}
