import { Router } from "express";

import { authenticate } from "../middleware/authenticate";

import { authRouter } from "../modules/auth/auth.routes";
import { currentUserController } from "../modules/auth/auth.controller";
import { banksRouter } from "../modules/banks/banks.routes";
import { healthRouter } from "../modules/health/health.routes";
import { requisitesRouter } from "../modules/requisites/requisites.routes";
import { requestsRouter } from "../modules/requests/requests.routes";
import { topupRouter } from "../modules/topup/topup.routes";
import { supportRouter } from "../modules/support/support.routes";

export const routes = Router();

routes.use("/auth", authRouter);

routes.use("/banks", banksRouter);

routes.use("/requisites", requisitesRouter);

routes.use("/requests", requestsRouter);

routes.use("/topup", topupRouter);
routes.use("/support", supportRouter);

routes.get("/me", authenticate, currentUserController);

routes.use("/health", healthRouter);
