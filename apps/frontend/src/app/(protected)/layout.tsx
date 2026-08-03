import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/features/auth/providers/ProtectedRoute';
import { CabinetLayout } from '@/components/cabinet/CabinetLayout/CabinetLayout';

interface Props {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  return <ProtectedRoute><CabinetLayout>
      {children}
    </CabinetLayout></ProtectedRoute>;
}
