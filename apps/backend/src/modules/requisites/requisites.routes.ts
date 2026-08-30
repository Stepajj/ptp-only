import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";

import { createRequisiteController, deleteRequisiteController, editRequisiteController, requisiteMonitoringAnswerController, requisiteMonitoringController, requisitesController } from "./requisites.controller";

export const requisitesRouter = Router();

requisitesRouter.use(authenticate);
requisitesRouter.get("/", requisitesController);
requisitesRouter.get("/monitoring", requisiteMonitoringController);
requisitesRouter.post("/:requisiteId/monitoring", requisiteMonitoringAnswerController);
requisitesRouter.post("/", createRequisiteController);
requisitesRouter.patch("/:requisiteId", editRequisiteController);
requisitesRouter.delete("/:requisiteId", deleteRequisiteController);
