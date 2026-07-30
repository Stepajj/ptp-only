import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/features/auth/providers/ProtectedRoute';

interface Props {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
