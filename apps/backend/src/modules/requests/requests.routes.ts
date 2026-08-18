import { Router } from "express";
import multer from "multer";

import { authenticate } from "../../middleware/authenticate";

import {
  confirmRequestController,
  listRequestsController,
  requestProofController,
} from "./requests.controller";

export const requestsRouter = Router();

requestsRouter.use(authenticate);
requestsRouter.get("/", listRequestsController);
requestsRouter.post("/:requestId/confirm", confirmRequestController);
requestsRouter.post("/:requestId/proof", multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }).single("file"), requestProofController);
