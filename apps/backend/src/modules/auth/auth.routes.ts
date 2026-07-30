import { Router } from "express";

import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "./auth.controller";
import { authRateLimiter } from "./auth.rate-limit";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerController);
authRouter.post("/login", authRateLimiter, loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/refresh", authRateLimiter, refreshController);
