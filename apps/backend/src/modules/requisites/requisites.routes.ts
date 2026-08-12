import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";

import { createRequisiteController, deleteRequisiteController, editRequisiteController, requisitesController } from "./requisites.controller";

export const requisitesRouter = Router();

requisitesRouter.use(authenticate);
requisitesRouter.get("/", requisitesController);
requisitesRouter.post("/", createRequisiteController);
requisitesRouter.patch("/:requisiteId", editRequisiteController);
requisitesRouter.delete("/:requisiteId", deleteRequisiteController);
