"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

interface TelegramOidcResponse {
  id_token: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
}

const TELEGRAM_CLIENT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_ID;

declare global {
  interface Window {
    Telegram: {
      Login: {
        init: (options: {
          client_id: number;
          request_access?: string | string[];
          scope?: string[];
          nonce?: string;
          lang?: string;
        }, callback: (data: TelegramOidcResponse | null) => void) => void;
        auth: (options: {
          client_id: number;
          request_access?: string | string[];
          scope?: string[];
          nonce?: string;
          lang?: string;
        }, callback: (data: TelegramOidcResponse | null) => void) => void;
        open?: (callback?: (data: TelegramOidcResponse | null) => void) => void;
        close?: () => void;
      };
    };
  }
}

export function TelegramLoginButton({ mode, linked = false, onAuth }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const disabled =
    !TELEGRAM_CLIENT_ID ||
    linked ||
    (mode === "link" && !accessToken) ||
    !scriptLoaded;

  const buttonText = useMemo(() => {
    if (linked) {
      return "Telegram привязан";
    }

    return mode === "login" ? "Войти через Telegram" : "Привязать Telegram";
  }, [linked, mode]);

  const handleTelegramAuth = useCallback(
    async (data: TelegramOidcResponse | null) => {
      if (!data) {
        setError("Авторизация через Telegram отменена");
        return;
      }

      const body: TelegramAuthPayload = {
        id_token: data.id_token,
      };

      setError(null);
      setIsLoading(true);

      try {
        if (mode === "register") {
          onAuth?.(body);
          return;
        }

        if (mode === "login") {
          console.info('[Telegram Login] Sending id_token to backend...', { endpoint: 'telegramLogin' });
          const response = await telegramLogin(body);
          console.info('[Telegram Login] Backend response', { status: response?.status, data: response?.data });
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

        console.info('[Telegram Login] Sending id_token to backend...', { endpoint: 'linkTelegram' });
        const response = await linkTelegram(body, accessToken);
        console.info('[Telegram Login] Backend response', { status: response?.status, data: response?.data });
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
    if (!TELEGRAM_CLIENT_ID) {
      return;
    }

    const script = document.createElement("script");
    const scriptUrl = "https://oauth.telegram.org/js/telegram-login.js?5";
    console.info('[Telegram Login] Script loading...', { scriptUrl });
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      console.info('[Telegram Login] Script loaded', { scriptUrl });
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('[Telegram Login] Library not loaded', { scriptUrl });
      setError("Не удалось загрузить Telegram Widget");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [TELEGRAM_CLIENT_ID]);

  const handleClick = useCallback(() => {
    console.info('[Telegram Login] handleClick start', { TELEGRAM_CLIENT_ID });

    const scriptUrlLoaded = document.currentScript?.src || Array.from(document.getElementsByTagName('script')).slice(-1)[0]?.src;
    console.info('[Telegram Login] script URL loaded', { scriptUrlLoaded });

    console.info('[Telegram Login] window.Telegram', Boolean(window.Telegram));
    console.info('[Telegram Login] window.Telegram.Login', Boolean(window.Telegram?.Login));
    console.info('[Telegram Login] exists methods', {
      auth: Boolean(window.Telegram?.Login?.auth),
      init: Boolean(window.Telegram?.Login?.init),
      open: Boolean(window.Telegram?.Login?.open),
    });

    if (!TELEGRAM_CLIENT_ID || !window.Telegram?.Login || !window.Telegram?.Login?.auth) {
      console.error('[Telegram Login] Library not loaded or method missing');
      return;
    }

    const options = {
      client_id: Number(TELEGRAM_CLIENT_ID),
      request_access: 'write',
      scope: ['profile'],
    } as const;

    console.info('[Telegram Login] Calling Telegram.Login.auth()', { options });

    try {
      window.Telegram.Login.auth(options, handleTelegramAuth);
    } catch (e) {
      console.error('[Telegram Login] Error calling auth', e);
    }
  }, [TELEGRAM_CLIENT_ID, handleTelegramAuth]);

  return (
    <div className={styles.root}>
      {!disabled && !linked ? (
        <button
          type="button"
          className={styles.button}
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? "Обработка..." : buttonText}
        </button>
      ) : (
        <button type="button" className={styles.disabledButton} disabled>
          {buttonText}
        </button>
      )}

      {linked && (
        <p className={styles.status}>Telegram будет привязан после регистрации</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
