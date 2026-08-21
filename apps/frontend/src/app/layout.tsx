import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/features/auth/providers/AuthProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://ptp-only.vercel.app'),
  title: {
    default: 'ONLYp2p',
    template: '%s | ONLYp2p',
  },
  description: 'Сервис работы с криптовалютой через инфраструктуру OnlyP2P.',
  openGraph: {
    title: 'ONLYp2p',
    description: 'Сервис работы с криптовалютой через инфраструктуру OnlyP2P.',
    type: 'website',
    url: 'https://ptp-only.vercel.app',
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
