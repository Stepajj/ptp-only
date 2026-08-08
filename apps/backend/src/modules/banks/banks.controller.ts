import type { RequestHandler } from "express";

import { getBanks } from "./banks.service";

export const banksController: RequestHandler = async (_request, response, next) => {
  try {
    response.status(200).json(await getBanks());
  } catch (error) {
    next(error);
  }
};
