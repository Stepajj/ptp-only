import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/features/auth/providers/ProtectedRoute';
import { CabinetLayout } from '@/components/cabinet/CabinetLayout/CabinetLayout';
import './mobile-pages.css';

interface Props {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  return <ProtectedRoute><CabinetLayout>
      {children}
    </CabinetLayout></ProtectedRoute>;
}
