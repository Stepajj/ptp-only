import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { listSupportMessagesController, sendSupportMessageController } from "./support.controller";

export const supportRouter = Router();
supportRouter.use(authenticate);
supportRouter.get("/messages", listSupportMessagesController);
supportRouter.post("/messages", sendSupportMessageController);
