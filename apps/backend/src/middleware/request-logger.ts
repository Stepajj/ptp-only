import type { IncomingMessage } from "node:http";

import pinoHttp from "pino-http";

import { logger } from "../shared/logger/logger";

function formatRequestMessage(action: string, request: IncomingMessage): string {
  return `request ${action}: ${request.method ?? "UNKNOWN"} ${request.url ?? "/"}`;
}

export const requestLogger = pinoHttp({
  logger,
  customReceivedMessage: (request) => formatRequestMessage("received", request),
  customSuccessMessage: (request, response) =>
    `${formatRequestMessage("completed", request)} ${String(response.statusCode)}`,
  customErrorMessage: (request, response) =>
    `${formatRequestMessage("failed", request)} ${String(response.statusCode)}`,
});
