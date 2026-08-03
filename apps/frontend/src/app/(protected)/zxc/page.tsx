'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/features/auth/model/auth.store';
import { logout as logoutRequest } from '@/features/auth/api/auth.api';

export default function zxc() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      router.replace('/login');
    }
  }, [clearSession, router]);

  return (
    <main style={{ padding: 40 }}>
      
    </main>
  );
}