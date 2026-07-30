'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '../model/auth.store';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const { user, status } = useAuthStore();

  useEffect(() => {
    if (status !== 'loading' && !user) {
      router.replace('/login');
    }
  }, [status, user, router]);

  if (status === 'loading' || !user) {
    return null;
  }

  return <>{children}</>;
}
