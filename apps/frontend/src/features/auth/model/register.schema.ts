import { z } from 'zod';

export const registerSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, 'Введите email')
      .email('Введите корректный email'),

    password: z
      .string()
      .min(8, 'Пароль должен быть не короче 8 символов'),

    repeatPassword: z
      .string()
      .min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Пароли не совпадают',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;