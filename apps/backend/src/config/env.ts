import "dotenv/config";

import { z } from "zod";

const logLevelSchema = z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);
const booleanStringSchema = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().min(1).default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    DATABASE_URL: z.url(),
    CORS_ALLOWED_ORIGINS: z.string().default(""),
    TRUST_PROXY: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    REQUEST_BODY_LIMIT: z.string().min(1).default("1mb"),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    LOG_LEVEL: logLevelSchema.default("info"),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().max(3600).default(900),
    REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(2592000),
    REFRESH_COOKIE_NAME: z.string().min(1).default("op2p_refresh_token"),
    REFRESH_COOKIE_DOMAIN: z.string().optional(),
    REFRESH_COOKIE_SECURE: booleanStringSchema.optional(),
    REFRESH_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
    ONLY_P2P_BASE_URL: z.url(),
    ONLY_P2P_API_ID: z.string().min(1),
    ONLY_P2P_SECRET_KEY: z.string().min(1),
    ONLY_P2P_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_BOT_USERNAME: z.string().min(1),
    TELEGRAM_CLIENT_ID: z.coerce.number().int().positive(),
    TELEGRAM_CLIENT_SECRET: z.string().min(1),
  })
  .refine((env) => env.JWT_ACCESS_SECRET !== env.JWT_REFRESH_SECRET, {
    message: "JWT access and refresh secrets must be different",
    path: ["JWT_REFRESH_SECRET"],
  })
  .refine((env) => env.REFRESH_TOKEN_TTL_SECONDS > env.ACCESS_TOKEN_TTL_SECONDS, {
    message: "Refresh token TTL must be greater than access token TTL",
    path: ["REFRESH_TOKEN_TTL_SECONDS"],
  })
  .refine(
    (env) =>
      env.REFRESH_COOKIE_SAME_SITE !== "none" ||
      env.REFRESH_COOKIE_SECURE === true ||
      env.NODE_ENV === "production",
    {
      message: "SameSite=None refresh cookies require REFRESH_COOKIE_SECURE=true",
      path: ["REFRESH_COOKIE_SECURE"],
    },
  );

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return result.data;
}
