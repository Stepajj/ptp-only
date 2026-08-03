"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  linkTelegram,
  telegramLogin,
  type TelegramAuthPayload,
} from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { ApiError } from "@/shared/api/http";
import styles from "./TelegramLoginButton.module.css";

export type TelegramLoginMode = "login" | "link" | "register";

interface Props {
  mode: TelegramLoginMode;
  linked?: boolean;
  onAuth?: (payload: TelegramAuthPayload) => void;
}

interface TelegramWidgetPayload {
  id: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (payload: TelegramWidgetPayload) => void;
  }
}

const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? "";

export function TelegramLoginButton({ mode, linked = false, onAuth }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

console.log({
  env: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  TELEGRAM_BOT_USERNAME,
  linked,
  mode,
  accessToken,
});

  const disabled =
    !TELEGRAM_BOT_USERNAME ||
    linked ||
    (mode === "link" && !accessToken);

  const buttonText = useMemo(() => {
    if (linked) {
      return "Telegram привязан";
    }

    return mode === "login" ? "Войти через Telegram" : "Привязать Telegram";
  }, [linked, mode]);

  const handleTelegramAuth = useCallback(
    async (payload: TelegramWidgetPayload) => {
      const body: TelegramAuthPayload = {
        id: String(payload.id),
        username: payload.username,
        first_name: payload.first_name,
        last_name: payload.last_name,
        photo_url: payload.photo_url,
        auth_date: String(payload.auth_date),
        hash: payload.hash,
      };

      setError(null);
      setIsLoading(true);

      try {
        if (mode === "register") {
          onAuth?.(body);
          return;
        }

        if (mode === "login") {
          const response = await telegramLogin(body);
          useAuthStore.getState().setSession({
            user: response.data.user,
            accessToken: response.data.accessToken,
          });
          router.push("/dashboard");
          return;
        }

        if (!accessToken) {
          throw new Error("Требуется авторизация для привязки Telegram");
        }

        const response = await linkTelegram(body, accessToken);
        useAuthStore.getState().setUser(response.data.user);
      } catch (error) {
        if (error instanceof ApiError || error instanceof Error) {
          setError(error.message);
          return;
        }

        setError("Не удалось выполнить действие Telegram");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, mode, onAuth, router],
  );

  useEffect(() => {
    if (disabled) {
      return;
    }

    window.onTelegramAuth = handleTelegramAuth;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?7";
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-lang", "ru");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.async = true;

    const target = widgetRef.current;
    target?.appendChild(script);

    return () => {
      if (target) {
        target.replaceChildren();
      }
      delete window.onTelegramAuth;
    };
  }, [disabled, handleTelegramAuth]);

  return (
    <div className={styles.root}>
      {!disabled && !linked ? (
        <div className={styles.widget} ref={widgetRef} />
      ) : (
        <button type="button" className={styles.disabledButton} disabled>
          {buttonText}
        </button>
      )}

      {linked && (
        <p className={styles.status}>Telegram будет привязан после регистрации</p>
      )}
      {isLoading && <p className={styles.status}>Обработка...</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
