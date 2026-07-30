import type { NextFunction, Request, Response } from "express";

import { AppError } from "../shared/errors/app-error";

export function notFoundHandler(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  next(
    new AppError({
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
      message: `Route ${request.method} ${request.originalUrl} was not found`,
    }),
  );
}
