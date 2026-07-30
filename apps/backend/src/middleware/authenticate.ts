import type { RequestHandler } from "express";

import { findUserById } from "../modules/auth/auth.repository";
import { verifyAccessToken } from "../modules/auth/token.service";
import { AppError } from "../shared/errors/app-error";

function extractBearerToken(header: string | undefined): string {
  if (!header) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHORIZATION_REQUIRED",
      message: "Authorization header is required",
    });
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_AUTHORIZATION_HEADER",
      message: "Authorization header must use Bearer token",
    });
  }

  return token;
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const token = extractBearerToken(request.headers.authorization);
    const verifiedToken = verifyAccessToken(token);
    const user = await findUserById(verifiedToken.userId);

    if (user?.status !== "ACTIVE") {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    request.auth = {
      id: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};
