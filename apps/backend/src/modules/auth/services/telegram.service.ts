import { createHmac, createHash, timingSafeEqual } from "crypto";

import { config } from "../../../config";
import { AppError } from "../../../shared/errors/app-error";

export interface TelegramLoginPayload {
  id: string;
  username?: string | undefined;
  first_name?: string | undefined;
  last_name?: string | undefined;
  photo_url?: string | undefined;
  auth_date: string;
  hash: string;
}

function buildDataCheckString(payload: TelegramLoginPayload): string {
  return Object.entries(payload)
    .filter(([key, value]) => key !== "hash" && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("\n");
}

export function verifyTelegramLogin(payload: TelegramLoginPayload): void {
  const { hash, auth_date } = payload;
  const botToken = config.telegram.botToken;

  if (!botToken) {
    throw new AppError({
      statusCode: 500,
      code: "TELEGRAM_BOT_TOKEN_MISSING",
      message: "Telegram bot token is not configured",
    });
  }

  const secretKey = createHash("sha256").update(botToken).digest();
  const dataCheckString = buildDataCheckString(payload);
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const calculatedHashBuffer = Buffer.from(calculatedHash, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (calculatedHashBuffer.length !== hashBuffer.length || !timingSafeEqual(calculatedHashBuffer, hashBuffer)) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_TELEGRAM_AUTH_DATA",
      message: "Invalid Telegram auth data",
    });
  }

  const authDateMillis = Number(auth_date) * 1000;
  const now = Date.now();

  if (Number.isNaN(authDateMillis) || authDateMillis <= 0) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_TELEGRAM_AUTH_DATE",
      message: "Invalid Telegram auth_date",
    });
  }

  if (authDateMillis > now + 5 * 60 * 1000) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_TELEGRAM_AUTH_DATE",
      message: "Invalid Telegram auth_date",
    });
  }

  const ageSeconds = (now - authDateMillis) / 1000;

  if (ageSeconds > 5 * 60) {
    throw new AppError({
      statusCode: 401,
      code: "TELEGRAM_AUTH_EXPIRED",
      message: "Telegram auth data is expired",
    });
  }
}
