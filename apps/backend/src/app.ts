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
  app.disable("etag");

  // Authenticated API responses are user-specific and must never be served
  // through conditional browser/proxy caching (304 has no response body).
  app.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
    next();
  });

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
