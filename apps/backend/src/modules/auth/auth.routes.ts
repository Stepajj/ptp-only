import { Router } from "express";

import {
  balanceController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  telegramLoginController,
  linkTelegramController,
} from "./auth.controller";
import { authRateLimiter } from "./auth.rate-limit";
import { authenticate } from "../../middleware/authenticate";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerController);
authRouter.post("/login", authRateLimiter, loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/refresh", authRateLimiter, refreshController);
authRouter.post("/telegram", authRateLimiter, telegramLoginController);
authRouter.post("/link-telegram", authenticate, authRateLimiter, linkTelegramController);
authRouter.get("/balance", authenticate, balanceController);