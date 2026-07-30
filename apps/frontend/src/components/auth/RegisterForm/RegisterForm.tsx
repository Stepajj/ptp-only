'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation";
import { AuthInput } from '../AuthInput/AuthInput';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { GradientButton } from '../GradientButton/GradientButton';
import { TelegramButton } from '../TelegramButton/TelegramButton';
import styles from './RegisterForm.module.css';

import { registerSchema, type RegisterFormValues } from '@/features/auth/model/register.schema';
import { register as registerRequest, type AuthSessionResponse } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { ApiError } from '@/shared/api/http';

export function RegisterForm() {
    const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      identifier: '',
      password: '',
      repeatPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response: AuthSessionResponse = await registerRequest({
        identifier: values.identifier,
        password: values.password,
        language: 'ru',
      });
      
      

      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
    router.push("/dashboard");
      // Позже здесь добавим redirect на защищённый роут.
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', {
          type: 'server',
          message: error.message,
        });
        return;
      }

      setError('root', {
        type: 'server',
        message: 'Не удалось создать аккаунт',
      });
    }
  };

  return (
    <>
      <h1 className={styles.title}>Добро пожаловать</h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          placeholder="Email"
          type="email"
          autoComplete="email"
          {...register('identifier')}
          error={errors.identifier?.message}
        />

        <PasswordInput
          placeholder="Пароль"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />

        <PasswordInput
          placeholder="Повторите пароль"
          autoComplete="new-password"
          {...register('repeatPassword')}
          error={errors.repeatPassword?.message}
        />

        {errors.root?.message && (
          <p className={styles.serverError}>{errors.root.message}</p>
        )}

        <div className={styles.formBtnsDwn}>
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
          </GradientButton>

          <TelegramButton />
        </div>
      </form>
    </>
  );
}