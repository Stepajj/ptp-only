"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthInput } from "../AuthInput/AuthInput";
import { GradientButton } from "../GradientButton/GradientButton";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { TelegramLoginButton } from "../TelegramLoginButton/TelegramLoginButton";
import {
  register as registerRequest,
  type AuthSessionResponse,
  type TelegramAuthPayload,
} from "@/features/auth/api/auth.api";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/model/register.schema";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { ApiError } from "@/shared/api/http";
import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [telegramPayload, setTelegramPayload] = useState<TelegramAuthPayload>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      identifier: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response: AuthSessionResponse = await registerRequest({
        identifier: values.identifier,
        password: values.password,
        language: "ru",
        telegram: telegramPayload,
      });

      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", {
          type: "server",
          message: error.message,
        });
        return;
      }

      setError("root", {
        type: "server",
        message: "Не удалось создать аккаунт",
      });
    }
  };

  return (
    <>
      <h1 className={styles.title}>Добро пожаловать</h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label htmlFor="register-identifier">Email</label>
          <AuthInput id="register-identifier" type="email" autoComplete="email" {...register("identifier")} aria-describedby={errors.identifier ? "register-identifier-error" : undefined} error={errors.identifier?.message} />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password">Пароль</label>
          <PasswordInput id="register-password" autoComplete="new-password" {...register("password")} aria-describedby={errors.password ? "register-password-error" : undefined} error={errors.password?.message} />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-repeat-password">Повторите пароль</label>
          <PasswordInput id="register-repeat-password" autoComplete="new-password" {...register("repeatPassword")} aria-describedby={errors.repeatPassword ? "register-repeat-password-error" : undefined} error={errors.repeatPassword?.message} />
        </div>

        {errors.root?.message && (
          <p className={styles.serverError} role="alert">{errors.root.message}</p>
        )}

        <div className={styles.formBtnsDwn}>
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать аккаунт"}
          </GradientButton>

          <TelegramLoginButton
            mode="register"
            linked={Boolean(telegramPayload)}
            onAuth={setTelegramPayload}
          />
        </div>
      </form>
    </>
  );
}
