import type { Request } from "express";

export function getRequestId(request: Request): string | undefined {
  const header = request.headers["x-request-id"];

  if (Array.isArray(header)) {
    return header[0];
  }

  return header;
}
