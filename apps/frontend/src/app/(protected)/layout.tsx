import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { ProtectedRoute } from '@/features/auth/providers/ProtectedRoute';
import { CabinetLayout } from '@/components/cabinet/CabinetLayout/CabinetLayout';
import './mobile-pages.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true } };

interface Props {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  return <AuthProvider><ProtectedRoute><CabinetLayout>
      {children}
    </CabinetLayout></ProtectedRoute></AuthProvider>;
}
