import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";

import {
  confirmRequestSchema,
  listRequestsQuerySchema,
  requestIdSchema,
} from "./requests.dto";
import { confirmRequest, listRequests, submitRequestProof } from "./requests.service";

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

export const requestProofController: RequestHandler = async (request, response, next) => {
  try {
    const file = request.file;
    if (!file) throw new AppError({ statusCode: 400, code: "FILE_REQUIRED", message: "Proof file is required" });
    const requestId = requestIdSchema.parse(request.params.requestId);
    const validExtension = /\.(mp4|mov|avi|mkv|webm|m4v|gif|pdf)$/i.test(file.originalname);
    const validMime = file.mimetype === "application/pdf" || file.mimetype === "image/gif" || file.mimetype.startsWith("video/");
    if (!validExtension || !validMime) {
      throw new AppError({ statusCode: 400, code: "FILE_TYPE_INVALID", message: "File must be a video or a PDF" });
    }
    response.status(200).json(await submitRequestProof(getUserId(request), requestId, file));
  } catch (error) { next(error); }
};
