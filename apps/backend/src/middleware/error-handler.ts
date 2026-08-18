import type { ErrorRequestHandler } from "express";

import { config } from "../config";
import { AppError } from "../shared/errors/app-error";
import { logger } from "../shared/logger/logger";
import { getRequestId } from "../utils/get-request-id";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

function normalizeError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error && error.code === "LIMIT_FILE_SIZE") {
    return new AppError({ statusCode: 413, code: "FILE_TOO_LARGE", message: "Uploaded file is too large" });
  }

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      details: error.message,
      isOperational: false,
    });
  }

  return new AppError({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    isOperational: false,
  });
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const appError = normalizeError(error);
  const requestId = getRequestId(request);

  if (!appError.isOperational || appError.statusCode >= 500) {
    logger.error({ err: error, requestId }, "request failed with server error");
  } else {
    logger.warn({ err: appError, requestId }, "request failed with client error");
  }

  const body: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(requestId ? { requestId } : {}),
      ...(!config.isProduction && appError.details ? { details: appError.details } : {}),
    },
  };

  response.status(appError.statusCode).json(body);
};
