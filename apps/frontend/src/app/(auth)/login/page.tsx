import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Вход в личный кабинет ONLYp2p.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <AuthCard>
      <LoginForm />
    </AuthCard>
  );
}
