import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";
import { afterIdSchema, supportMessageSchema } from "./support.dto";
import { listSupportMessages, sendSupportMessage } from "./support.service";

function getUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth?.id) throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
  return request.auth.id;
}

export const listSupportMessagesController: RequestHandler = async (request, response, next) => {
  try {
    response.status(200).json(await listSupportMessages(getUserId(request), afterIdSchema.parse(request.query.after_id)));
  } catch (error) { next(error); }
};

export const sendSupportMessageController: RequestHandler = async (request, response, next) => {
  try {
    response.status(200).json(await sendSupportMessage(getUserId(request), parseBody(supportMessageSchema, request.body as unknown)));
  } catch (error) { next(error); }
};
