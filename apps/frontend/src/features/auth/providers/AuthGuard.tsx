'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '../model/auth.store';

interface Props {
    children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
    const router = useRouter();

    const { user, status } = useAuthStore();

    useEffect(() => {
        if (status !== 'loading' && user) {
            router.replace('/dashboard');
        }
    }, [status, user, router]);

    if (status === 'loading') {
        return null;
    }

    if (user) {
        return null;
    }

    return children;
}