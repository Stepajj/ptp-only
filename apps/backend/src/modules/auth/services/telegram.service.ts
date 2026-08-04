import { jwtVerify, createRemoteJWKSet, type JWTVerifyResult, type KeyLike } from "jose";

import { config } from "../../../config";
import { AppError } from "../../../shared/errors/app-error";

export interface TelegramOidcPayload {
  id_token: string;
}

export interface TelegramUserClaims {
  sub: string; // Telegram user ID
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  username?: string;
  auth_date?: number;
}

const TELEGRAM_JWKS_URL = "https://core.telegram.org/.well-known/jwks.json";
const TELEGRAM_ISSUER = "https://telegram.org";

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwksCache() {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(TELEGRAM_JWKS_URL));
  }
  return jwksCache;
}

export async function verifyTelegramOidcToken(idToken: string): Promise<TelegramUserClaims> {
  if (!config.telegram.clientId) {
    throw new AppError({
      statusCode: 500,
      code: "TELEGRAM_CLIENT_ID_MISSING",
      message: "Telegram client ID is not configured",
    });
  }

  try {
    const jwks = getJwks();
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: TELEGRAM_ISSUER,
      audience: String(config.telegram.clientId),
      algorithms: ['RS256'],
    });

    return payload as TelegramUserClaims;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      statusCode: 401,
      code: "TELEGRAM_TOKEN_VERIFICATION_FAILED",
      message: "Failed to verify Telegram ID token",
    });
  }
}
