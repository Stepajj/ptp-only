import { loadEnvironment } from "./env";

const env = loadEnvironment();

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  server: {
    host: env.HOST,
    port: env.PORT,
    requestBodyLimit: env.REQUEST_BODY_LIMIT,
    shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    trustProxy: env.TRUST_PROXY,
  },
  cors: {
    allowedOrigins: parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS),
  },
  database: {
    url: env.DATABASE_URL,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  auth: {
    accessTokenSecret: env.JWT_ACCESS_SECRET,
    refreshTokenSecret: env.JWT_REFRESH_SECRET,
    accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    rateLimit: {
      windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
      maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    },
    refreshCookie: {
      name: env.REFRESH_COOKIE_NAME,
      domain: env.REFRESH_COOKIE_DOMAIN?.trim() === "" ? undefined : env.REFRESH_COOKIE_DOMAIN,
      secure: env.REFRESH_COOKIE_SECURE ?? env.NODE_ENV === "production",
      // Separate production frontend/backend origins require SameSite=None.
      sameSite: env.REFRESH_COOKIE_SAME_SITE ?? (env.NODE_ENV === "production" ? "none" : "lax"),
    },
  },
  onlyP2P: {
    baseUrl: env.ONLY_P2P_BASE_URL,
    apiId: env.ONLY_P2P_API_ID,
    secretKey: env.ONLY_P2P_SECRET_KEY,
    timeoutMs: env.ONLY_P2P_TIMEOUT_MS,
  },
  telegram: {
    botToken: env.TELEGRAM_BOT_TOKEN,
    botUsername: env.TELEGRAM_BOT_USERNAME,
    clientId: env.TELEGRAM_CLIENT_ID,
    clientSecret: env.TELEGRAM_CLIENT_SECRET,
  },
} as const;

if (config.isProduction && !config.auth.refreshCookie.secure) {
  throw new Error("REFRESH_COOKIE_SECURE must be true in production");
}

if (config.auth.refreshCookie.sameSite === "none" && !config.auth.refreshCookie.secure) {
  throw new Error("SameSite=None refresh cookies require REFRESH_COOKIE_SECURE=true");
}
