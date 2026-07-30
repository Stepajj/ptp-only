import type { ReactNode } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout/AuthLayout'
import { AuthGuard } from '@/features/auth/providers/AuthGuard';


interface Props {
  children: ReactNode;
}

export default function AuthGroupLayout({ children }: Props) {

  return <AuthGuard>
    <AuthLayout>{children}</AuthLayout>;
  </AuthGuard>
}