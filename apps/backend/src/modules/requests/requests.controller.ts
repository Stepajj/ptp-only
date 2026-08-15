import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";

import {
  confirmRequestSchema,
  listRequestsQuerySchema,
  requestIdSchema,
} from "./requests.dto";
import { confirmRequest, listRequests } from "./requests.service";

function getUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth?.id) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return request.auth.id;
}

export const listRequestsController: RequestHandler = async (request, response, next) => {
  try {
    const query = listRequestsQuerySchema.parse(request.query);
    response.status(200).json(await listRequests(getUserId(request), query.status));
  } catch (error) {
    next(error);
  }
};

export const confirmRequestController: RequestHandler = async (request, response, next) => {
  try {
    const requestId = requestIdSchema.parse(request.params.requestId);
    const body = parseBody(confirmRequestSchema, request.body as unknown);

    response.status(200).json(await confirmRequest(getUserId(request), requestId, body));
  } catch (error) {
    next(error);
  }
};
