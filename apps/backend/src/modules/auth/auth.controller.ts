import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";
import { getRequestMetadata } from "../../utils/request-metadata";
import { loginSchema, registerSchema } from "./auth.dto";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from "./auth.cookies";
import {
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
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
    clearRefreshTokenCookie(response);
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
