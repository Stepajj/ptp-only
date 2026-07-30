import pino from "pino";

import { config } from "../../config";

const baseLoggerOptions = {
  level: config.logging.level,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.tokenHash",
      "*.refreshToken",
      "*.secret",
      "*.secret_key",
      "*.api_id",
      "DATABASE_URL",
    ],
    censor: "[REDACTED]",
  },
} satisfies pino.LoggerOptions;

export const logger = pino(
  config.isProduction
    ? baseLoggerOptions
    : {
        ...baseLoggerOptions,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      },
);
