import { createHash, randomUUID } from "node:crypto";

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { config } from "../../config";
import { AppError } from "../../shared/errors/app-error";

type TokenType = "access" | "refresh";

interface TokenPayload extends JwtPayload {
  type: TokenType;
}

export interface VerifiedToken {
  userId: string;
  tokenId: string;
}

function createToken(
  userId: string,
  type: TokenType,
  secret: string,
  ttlSeconds: number,
  tokenId = randomUUID(),
): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: ttlSeconds,
    jwtid: tokenId,
    subject: userId,
  };

  return jwt.sign({ type }, secret, options);
}

function verifyToken(token: string, expectedType: TokenType, secret: string): VerifiedToken {
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
  } catch {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }

  if (typeof decoded === "string") {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }

  const payload = decoded as TokenPayload;

  if (payload.type !== expectedType || !payload.sub || !payload.jti) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }

  return {
    userId: payload.sub,
    tokenId: payload.jti,
  };
}

export function createAccessToken(userId: string): string {
  return createToken(
    userId,
    "access",
    config.auth.accessTokenSecret,
    config.auth.accessTokenTtlSeconds,
  );
}

export function createRefreshToken(userId: string): { token: string; tokenId: string; expiresAt: Date } {
  const tokenId = randomUUID();
  const token = createToken(
    userId,
    "refresh",
    config.auth.refreshTokenSecret,
    config.auth.refreshTokenTtlSeconds,
    tokenId,
  );

  return {
    token,
    tokenId,
    expiresAt: new Date(Date.now() + config.auth.refreshTokenTtlSeconds * 1000),
  };
}

export function verifyAccessToken(token: string): VerifiedToken {
  return verifyToken(token, "access", config.auth.accessTokenSecret);
}

export function verifyRefreshToken(token: string): VerifiedToken {
  return verifyToken(token, "refresh", config.auth.refreshTokenSecret);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
