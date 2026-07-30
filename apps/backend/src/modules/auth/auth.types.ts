export interface AuthenticatedRequestUser {
  id: string;
}

export interface SessionMetadata {
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

export interface IssuedSession {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenId: string;
  refreshTokenExpiresAt: Date;
}
