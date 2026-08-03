"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthInput } from "../AuthInput/AuthInput";
import { GradientButton } from "../GradientButton/GradientButton";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { TelegramLoginButton } from "../TelegramLoginButton/TelegramLoginButton";
import {
  login as loginRequest,
  type AuthSessionResponse,
} from "@/features/auth/api/auth.api";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/model/login.schema";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { ApiError } from "@/shared/api/http";
import styles from "../RegisterForm/RegisterForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response: AuthSessionResponse = await loginRequest({
        identifier: values.identifier,
        password: values.password,
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
        message: "Не удалось выполнить вход",
      });
    }
  };

  return (
    <>
      <h1 className={styles.title}>С возвращением</h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          placeholder="Email"
          type="email"
          autoComplete="email"
          {...register("identifier")}
          error={errors.identifier?.message}
        />

        <PasswordInput
          placeholder="Пароль"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />

        {errors.root?.message && (
          <p className={styles.serverError}>{errors.root.message}</p>
        )}

        <div className={styles.formBtnsDwn}>
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Вход..." : "Войти"}
          </GradientButton>

          <TelegramLoginButton mode="login" />
        </div>
      </form>
    </>
  );
}
