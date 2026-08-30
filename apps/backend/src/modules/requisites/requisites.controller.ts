import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { parseBody } from "../../shared/validation/parse-body";

import { createRequisiteSchema, editRequisiteSchema, requisiteIdSchema } from "./requisites.dto";
import { answerRequisiteMonitoring, listRequisiteMonitoringPrompts } from "./requisite-monitor.service";
import { createRequisite, deleteRequisite, editRequisite, getRequisites } from "./requisites.service";
import { requisiteMonitoringAnswerSchema } from "./requisites.dto";

function getUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth?.id) {
    throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return request.auth.id;
}

export const requisitesController: RequestHandler = async (request, response, next) => {
  try { response.status(200).json(await getRequisites(getUserId(request))); } catch (error) { next(error); }
};

export const createRequisiteController: RequestHandler = async (request, response, next) => {
  try { response.status(201).json(await createRequisite(getUserId(request), parseBody(createRequisiteSchema, request.body as unknown))); } catch (error) { next(error); }
};

export const editRequisiteController: RequestHandler = async (request, response, next) => {
  try {
    const requisiteId = requisiteIdSchema.parse(request.params.requisiteId);
    response.status(200).json(await editRequisite(getUserId(request), requisiteId, parseBody(editRequisiteSchema, request.body as unknown)));
  } catch (error) { next(error); }
};

export const deleteRequisiteController: RequestHandler = async (request, response, next) => {
  try {
    const requisiteId = requisiteIdSchema.parse(request.params.requisiteId);
    response.status(200).json(await deleteRequisite(getUserId(request), requisiteId));
  } catch (error) { next(error); }
};

export const requisiteMonitoringController: RequestHandler = async (request, response, next) => {
  try { response.status(200).json({ success: true, data: await listRequisiteMonitoringPrompts(getUserId(request)) }); } catch (error) { next(error); }
};

export const requisiteMonitoringAnswerController: RequestHandler = async (request, response, next) => {
  try {
    const requisiteId = requisiteIdSchema.parse(request.params.requisiteId);
    const body = parseBody(requisiteMonitoringAnswerSchema, request.body as unknown);
    await answerRequisiteMonitoring(getUserId(request), requisiteId, body.keepEnabled);
    response.status(200).json({ success: true });
  } catch (error) { next(error); }
};
