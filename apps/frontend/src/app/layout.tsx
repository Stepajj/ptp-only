import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import logo from '@/assets/images/P2PLOGOFAV.svg';

export const metadata: Metadata = {
  metadataBase: new URL('https://p2pru.com'),
  title: {
    default: 'ONLYp2p',
    template: '%s | ONLYp2p',
  },
  description: 'Сервис работы с криптовалютой через инфраструктуру OnlyP2P.',
  icons: {
    icon: [{ url: logo.src, type: 'image/svg+xml' }],
    shortcut: [{ url: logo.src, type: 'image/svg+xml' }],
    apple: [{ url: logo.src, type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'ONLYp2p',
    description: 'Сервис работы с криптовалютой через инфраструктуру OnlyP2P.',
    type: 'website',
    url: 'https://p2pru.com',
    locale: 'ru_RU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
