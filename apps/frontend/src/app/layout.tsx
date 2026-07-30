import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/features/auth/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'ONLYp2p White Label',
  description: 'White-label fintech service for Only P2P users',
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