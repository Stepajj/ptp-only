import type { Request } from "express";

export interface RequestMetadata {
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

export function getRequestMetadata(request: Request): RequestMetadata {
  const userAgentHeader: unknown = request.headers["user-agent"];
  const userAgent = Array.isArray(userAgentHeader) && typeof userAgentHeader[0] === "string"
    ? userAgentHeader[0]
    : typeof userAgentHeader === "string"
      ? userAgentHeader
      : undefined;

  return {
    ipAddress: request.ip ?? request.socket.remoteAddress,
    userAgent,
  };
}
