import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";

import { banksController } from "./banks.controller";

export const banksRouter = Router();

banksRouter.get("/", authenticate, banksController);
