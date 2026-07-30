import express from "express";

import { config } from "./config";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";
import { requestLogger } from "./middleware/request-logger";
import { corsMiddleware, helmetMiddleware } from "./middleware/security";
import { routes } from "./routes";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");

  if (config.server.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: config.server.requestBodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: config.server.requestBodyLimit }));
  app.use(requestLogger);

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
