import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/authenticate";
import { listSupportMessagesController, sendSupportFileController, sendSupportMessageController } from "./support.controller";

export const supportRouter = Router();
supportRouter.use(authenticate);
supportRouter.get("/messages", listSupportMessagesController);
supportRouter.post("/messages", sendSupportMessageController);
supportRouter.post(
  "/files",
  multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }).single("file"),
  sendSupportFileController,
);
