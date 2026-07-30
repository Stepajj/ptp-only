'use client';

import { useAuthStore } from '@/features/auth/model/auth.store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <pre>
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}