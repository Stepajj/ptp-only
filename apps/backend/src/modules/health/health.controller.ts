import type { RequestHandler } from "express";

import { getHealth } from "./health.service";

export const healthController: RequestHandler = async (_request, response, next) => {
  try {
    const health = await getHealth();
    response.status(health.status === "ok" ? 200 : 503).json(health);
  } catch (error) {
    next(error);
  }
};
