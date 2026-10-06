import type { ReactNode } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout/AuthLayout';
import { AuthGuard } from '@/features/auth/providers/AuthGuard';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';

interface Props {
  children: ReactNode;
}

export default function AuthGroupLayout({ children }: Props) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AuthLayout>{children}</AuthLayout>
      </AuthGuard>
    </AuthProvider>
  );
}
