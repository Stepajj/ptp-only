import { rateLimit } from "express-rate-limit";

import { config } from "../../config";
import { AppError } from "../../shared/errors/app-error";

export const authRateLimiter = rateLimit({
  windowMs: config.auth.rateLimit.windowMs,
  limit: config.auth.rateLimit.maxRequests,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler(_request, _response, next) {
    next(new AppError({
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication requests",
    }));
  },
});
