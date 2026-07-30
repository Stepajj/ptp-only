import cors, { type CorsOptions } from "cors";
import helmet from "helmet";

import { config } from "../config";

function createCorsOptions(): CorsOptions {
  return {
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
  };
}

export const helmetMiddleware = helmet();
export const corsMiddleware = cors(createCorsOptions());
