import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";
import { topupController } from "./topup.controller";

export const topupRouter = Router();

topupRouter.post(
  "/",
  authenticate,
  topupController,
);