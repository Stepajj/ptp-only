import { Router } from "express";

import { authenticate } from "../middleware/authenticate";

import { authRouter } from "../modules/auth/auth.routes";
import { currentUserController } from "../modules/auth/auth.controller";
import { healthRouter } from "../modules/health/health.routes";
import { topupRouter } from "../modules/topup/topup.routes";

export const routes = Router();

routes.use("/auth", authRouter);

routes.use("/topup", topupRouter);

routes.get("/me", authenticate, currentUserController);

routes.use("/health", healthRouter);