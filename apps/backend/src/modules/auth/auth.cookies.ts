import type { CookieOptions, Request, Response } from "express";

import { config } from "../../config";

function buildRefreshCookieOptions(maxAge?: number): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    maxAge,
    path: "/auth",
    sameSite: config.auth.refreshCookie.sameSite,
    secure: config.auth.refreshCookie.secure,
  };

  if (config.auth.refreshCookie.domain) {
    options.domain = config.auth.refreshCookie.domain;
  }

  return options;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, rawCookie) => {
    const separatorIndex = rawCookie.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = rawCookie.slice(0, separatorIndex).trim();
    const value = rawCookie.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
    return cookies;
  }, {});
}

export function getRefreshTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies[config.auth.refreshCookie.name];
}

export function setRefreshTokenCookie(response: Response, token: string): void {
  response.cookie(
    config.auth.refreshCookie.name,
    token,
    buildRefreshCookieOptions(config.auth.refreshTokenTtlSeconds * 1000),
  );
}

export function clearRefreshTokenCookie(response: Response): void {
  response.clearCookie(config.auth.refreshCookie.name, buildRefreshCookieOptions());
}
