import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";
import { topupSchema } from "./topup.dto";
import { topup } from "./topup.service";

export const topupController: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const userId = request.auth?.id;

    if (!userId) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const body = parseBody(
      topupSchema,
      request.body as unknown,
    );

    const result = await topup(userId, body);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};