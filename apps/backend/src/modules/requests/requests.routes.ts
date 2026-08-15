import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";

import {
  confirmRequestController,
  listRequestsController,
} from "./requests.controller";

export const requestsRouter = Router();

requestsRouter.use(authenticate);
requestsRouter.get("/", listRequestsController);
requestsRouter.post("/:requestId/confirm", confirmRequestController);
