import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";
import { getRequestMetadata } from "../../utils/request-metadata";
import { changePasswordSchema, loginSchema, profileUpdateSchema, registerSchema, sessionIdSchema, setCredentialsSchema, telegramLoginSchema } from "./auth.dto";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from "./auth.cookies";
import { verifyRefreshToken } from "./token.service";
import {
  getBalance,
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
  telegramLogin,
  linkTelegram,
  changePassword,
  getSessions,
  revokeSession,
  updateCurrentUserProfile,
  setCredentials,
} from "./auth.service";

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const body = parseBody(registerSchema, request.body as unknown);
    const result = await register(body, getRequestMetadata(request));

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(201).json(result.response);
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const body = parseBody(loginSchema, request.body as unknown);
    const result = await login(body, getRequestMetadata(request));

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json(result.response);
  } catch (error) {
    next(error);
  }
};

export const refreshController: RequestHandler = async (request, response, next) => {
  try {
    const token = getRefreshTokenFromRequest(request);

    if (!token) {
      clearRefreshTokenCookie(response);
      throw new AppError({
        statusCode: 401,
        code: "REFRESH_TOKEN_REQUIRED",
        message: "Refresh token is required",
      });
    }

    const result = await refresh(token, getRequestMetadata(request));

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json(result.response);
  } catch (error) {
    // Do not destroy a still-valid session on a transient database/server error.
    // Clear the cookie only when the server has positively rejected the session.
    if (
      error instanceof AppError &&
      (error.statusCode === 401 || error.code === "USER_NOT_ACTIVE")
    ) {
      clearRefreshTokenCookie(response);
    }
    next(error);
  }
};

export const logoutController: RequestHandler = async (request, response, next) => {
  try {
    await logout(getRefreshTokenFromRequest(request));
    clearRefreshTokenCookie(response);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const telegramLoginController: RequestHandler = async (request, response, next) => {
  try {
    const body = parseBody(telegramLoginSchema, request.body as unknown);

    const result = await telegramLogin(body, getRequestMetadata(request));

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json(result.response);
  } catch (error) {
    next(error);
  }
};

export const sessionsController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    response.status(200).json(await getSessions(request.auth.id, getRefreshTokenFromRequest(request)));
  } catch (error) { next(error); }
};

export const revokeSessionController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    const sessionId = sessionIdSchema.parse(request.params.sessionId);
    await revokeSession(request.auth.id, sessionId);
    const refreshToken = getRefreshTokenFromRequest(request);
    if (refreshToken) {
      try {
        if (verifyRefreshToken(refreshToken).tokenId === sessionId) {
          clearRefreshTokenCookie(response);
        }
      } catch {
        clearRefreshTokenCookie(response);
      }
    }
    response.status(204).send();
  } catch (error) { next(error); }
};

export const changePasswordController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    await changePassword(request.auth.id, parseBody(changePasswordSchema, request.body as unknown));
    clearRefreshTokenCookie(response);
    response.status(204).send();
  } catch (error) { next(error); }
};

export const setCredentialsController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    response.status(200).json(await setCredentials(request.auth.id, parseBody(setCredentialsSchema, request.body as unknown)));
  } catch (error) { next(error); }
};

export const updateProfileController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    response.status(200).json(await updateCurrentUserProfile(request.auth.id, parseBody(profileUpdateSchema, request.body as unknown)));
  } catch (error) { next(error); }
};

export const linkTelegramController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.auth?.id;

    if (!userId) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const body = parseBody(telegramLoginSchema, request.body as unknown);
    const responseData = await linkTelegram(userId, body);

    response.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const currentUserController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.auth?.id;

    if (!userId) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    response.status(200).json(await getCurrentUser(userId));
  } catch (error) {
    next(error);
  }
};


export const balanceController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.auth?.id;

    if (!userId) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    response.status(200).json(await getBalance(userId));
  } catch (error) {
    next(error);
  }
};
