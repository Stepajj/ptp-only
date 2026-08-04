import { UserStatus } from "@prisma/client";

import { config } from "../../config";
import { createOnlyP2PClient } from "../../integrations/only-p2p/only-p2p.client";
import { AppError } from "../../shared/errors/app-error";
import type { AuthResponseDto, CurrentUserResponseDto, LoginDto, RegisterDto, TelegramLoginDto } from "./auth.dto";
import { toPublicUserDto } from "./auth.mapper";
import { verifyTelegramOidcToken, type TelegramUserClaims } from "./services/telegram.service";
import {
  createLocalUser,
  createTelegramUser,
  createRefreshToken as createRefreshTokenRecord,
  findCredentialByIdentifierNormalized,
  findExternalClientByUserId,
  findRefreshTokenByHash,
  findUserById,
  isUniqueConstraintError,
  linkOnlyP2pExternalClient,
  revokeAllUserRefreshTokens,
  revokeRefreshTokenByHash,
  rotateRefreshToken,
  setPendingOnlyP2pExternalUserId,
  updateUserTelegramData,
  findUserByTelegramId,
  withOnlyP2pProvisioningLock,
  type AuthUserRecord,
  type TelegramAccountData,
} from "./auth.repository";
import type { IssuedSession, SessionMetadata } from "./auth.types";
import { hashPassword, verifyPassword } from "./password.service";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "./token.service";

export interface AuthResult {
  response: AuthResponseDto;
  refreshToken: string;
}

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

function throwIdentifierAlreadyExists(): never {
  throw new AppError({
    statusCode: 409,
    code: "IDENTIFIER_ALREADY_EXISTS",
    message: "User with this identifier already exists",
  });
}

function throwTelegramAlreadyInUse(): never {
  throw new AppError({
    statusCode: 409,
    code: "TELEGRAM_ID_ALREADY_IN_USE",
    message: "Telegram account is already linked to another user",
  });
}

function ensureActiveUser(status: UserStatus): void {
  if (status !== UserStatus.ACTIVE) {
    throw new AppError({
      statusCode: 403,
      code: "USER_NOT_ACTIVE",
      message: "User is not active",
    });
  }
}

function toTelegramAccountData(claims: TelegramUserClaims): TelegramAccountData {
  return {
    id: claims.sub,
    username: claims.username ?? null,
    firstName: claims.given_name ?? null,
    photoUrl: claims.picture ?? null,
    linkedAt: new Date(),
  };
}

async function issueSession(userId: string, metadata: SessionMetadata): Promise<IssuedSession> {
  const refreshToken = createRefreshToken(userId);
  const refreshTokenHash = hashToken(refreshToken.token);

  await createRefreshTokenRecord({
    id: refreshToken.tokenId,
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshToken.expiresAt,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });

  return {
    accessToken: createAccessToken(userId),
    refreshToken: refreshToken.token,
    refreshTokenHash,
    refreshTokenId: refreshToken.tokenId,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };
}

function createAuthResponse(user: Parameters<typeof toPublicUserDto>[0], session: IssuedSession): AuthResult {
  return {
    refreshToken: session.refreshToken,
    response: {
      success: true,
      data: {
        accessToken: session.accessToken,
        tokenType: "Bearer",
        expiresIn: config.auth.accessTokenTtlSeconds,
        user: toPublicUserDto(user),
      },
    },
  };
}

async function resolveOnlyP2pExternalUserId(user: AuthUserRecord): Promise<string> {
  if (user.pendingOnlyP2pExternalUserId) {
    return user.pendingOnlyP2pExternalUserId;
  }

  const { externalUserId } = await createOnlyP2PClient();
  await setPendingOnlyP2pExternalUserId(user.id, externalUserId);

  return externalUserId;
}

async function finalizeExternalClientLink(
  user: AuthUserRecord,
  metadata: SessionMetadata,
): Promise<AuthResult> {
  return withOnlyP2pProvisioningLock(user.id, async () => {
    const currentUser = await findUserById(user.id);

    if (!currentUser) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    ensureActiveUser(currentUser.status);

    const existingClient = await findExternalClientByUserId(currentUser.id);

    if (existingClient) {
      const session = await issueSession(currentUser.id, metadata);
      return createAuthResponse(currentUser, session);
    }

    const externalUserId = await resolveOnlyP2pExternalUserId(currentUser);

    try {
      await linkOnlyP2pExternalClient(currentUser.id, externalUserId);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const linkedClient = await findExternalClientByUserId(currentUser.id);

        if (linkedClient) {
          const session = await issueSession(currentUser.id, metadata);
          return createAuthResponse(currentUser, session);
        }
      }

      throw error;
    }

    const session = await issueSession(currentUser.id, metadata);
    return createAuthResponse(currentUser, session);
  });
}

async function completePendingRegistration(
  user: AuthUserRecord,
  metadata: SessionMetadata,
): Promise<AuthResult> {
  ensureActiveUser(user.status);
  return finalizeExternalClientLink(user, metadata);
}

export async function register(input: RegisterDto, metadata: SessionMetadata): Promise<AuthResult> {
  const identifierNormalized = normalizeIdentifier(input.identifier);
  const existingCredential = await findCredentialByIdentifierNormalized(identifierNormalized);
  const telegram = input.telegram;

  let telegramClaims: TelegramUserClaims | null = null;

  if (telegram) {
    telegramClaims = await verifyTelegramOidcToken(telegram.id_token);

    const existingTelegramOwner = await findUserByTelegramId(telegramClaims.sub);

    if (existingTelegramOwner) {
      throwTelegramAlreadyInUse();
    }
  }

  if (existingCredential) {
    const linkedClient = await findExternalClientByUserId(existingCredential.user.id);

    if (linkedClient) {
      throwIdentifierAlreadyExists();
    }

    const passwordIsValid = await verifyPassword(
      input.password,
      existingCredential.passwordHash,
    );

    if (!passwordIsValid) {
      throwIdentifierAlreadyExists();
    }

    return completePendingRegistration(existingCredential.user, metadata);
  }

  const passwordHash = await hashPassword(input.password);
  let user: AuthUserRecord;

  const createLocalUserInput = {
    identifier: input.identifier.trim(),
    identifierNormalized,
    passwordHash,
    language: input.language,
  };

  try {
    user = await createLocalUser(
      telegramClaims
        ? {
            ...createLocalUserInput,
            telegram: toTelegramAccountData(telegramClaims),
          }
        : createLocalUserInput,
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      if (telegramClaims && await findUserByTelegramId(telegramClaims.sub)) {
        throwTelegramAlreadyInUse();
      }

      throwIdentifierAlreadyExists();
    }

    throw error;
  }

  return finalizeExternalClientLink(user, metadata);
}

export async function login(input: LoginDto, metadata: SessionMetadata): Promise<AuthResult> {
  const credential = await findCredentialByIdentifierNormalized(
    normalizeIdentifier(input.identifier),
  );

  if (!credential) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials",
    });
  }

  const passwordIsValid = await verifyPassword(input.password, credential.passwordHash);

  if (!passwordIsValid) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials",
    });
  }

  ensureActiveUser(credential.user.status);

  const linkedClient = await findExternalClientByUserId(credential.user.id);

  if (!linkedClient) {
    return completePendingRegistration(credential.user, metadata);
  }

  const session = await issueSession(credential.user.id, metadata);
  return createAuthResponse(credential.user, session);
}

export async function telegramLogin(input: TelegramLoginDto, metadata: SessionMetadata): Promise<AuthResult> {
  const claims = await verifyTelegramOidcToken(input.id_token);

  let user = await findUserByTelegramId(claims.sub);

  if (!user) {
    try {
      user = await createTelegramUser({
        language: "ru",
        telegram: toTelegramAccountData(claims),
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      user = await findUserByTelegramId(claims.sub);

      if (!user) {
        throw error;
      }
    }
  }

  return finalizeExternalClientLink(user, metadata);
}

export async function linkTelegram(userId: string, input: TelegramLoginDto): Promise<CurrentUserResponseDto> {
  const claims = await verifyTelegramOidcToken(input.id_token);

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  ensureActiveUser(user.status);

  const existingOwner = await findUserByTelegramId(claims.sub);

  if (existingOwner && existingOwner.id !== userId) {
    throwTelegramAlreadyInUse();
  }

  try {
    const telegram = toTelegramAccountData(claims);

    await updateUserTelegramData(userId, {
      telegramId: telegram.id,
      telegramUsername: telegram.username,
      telegramFirstName: telegram.firstName,
      telegramPhotoUrl: telegram.photoUrl,
      telegramLinkedAt: telegram.linkedAt,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throwTelegramAlreadyInUse();
    }

    throw error;
  }

  const updatedUser = await findUserById(userId);

  if (!updatedUser) {
    throw new AppError({
      statusCode: 500,
      code: "USER_UPDATE_FAILED",
      message: "Failed to update Telegram link",
    });
  }

  return {
    success: true,
    data: {
      user: toPublicUserDto(updatedUser),
    },
  };
}

export async function refresh(refreshToken: string, metadata: SessionMetadata): Promise<AuthResult> {
  const verifiedToken = verifyRefreshToken(refreshToken);
  const oldTokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(oldTokenHash);

  if (storedToken?.id !== verifiedToken.tokenId || storedToken.userId !== verifiedToken.userId) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
  }

  if (storedToken.revokedAt) {
    await revokeAllUserRefreshTokens(storedToken.userId, "refresh_token_reuse");
    throw new AppError({
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
  }

  if (storedToken.expiresAt <= new Date()) {
    await revokeRefreshTokenByHash(oldTokenHash, "expired");
    throw new AppError({
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
  }

  ensureActiveUser(storedToken.user.status);

  const nextRefreshToken = createRefreshToken(storedToken.userId);
  const nextRefreshTokenHash = hashToken(nextRefreshToken.token);

  const rotation = await rotateRefreshToken({
    oldTokenHash,
    id: nextRefreshToken.tokenId,
    userId: storedToken.userId,
    tokenHash: nextRefreshTokenHash,
    expiresAt: nextRefreshToken.expiresAt,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    now: new Date(),
  });

  if (!rotation || !rotation.rotated || rotation.previousToken.revokedAt) {
    await revokeAllUserRefreshTokens(storedToken.userId, "refresh_token_reuse");
    throw new AppError({
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
  }

  return createAuthResponse(storedToken.user, {
    accessToken: createAccessToken(storedToken.userId),
    refreshToken: nextRefreshToken.token,
    refreshTokenHash: nextRefreshTokenHash,
    refreshTokenId: nextRefreshToken.tokenId,
    refreshTokenExpiresAt: nextRefreshToken.expiresAt,
  });
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  await revokeRefreshTokenByHash(hashToken(refreshToken), "logout");
}

export async function getCurrentUser(userId: string): Promise<CurrentUserResponseDto> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  ensureActiveUser(user.status);

  return {
    success: true,
    data: {
      user: toPublicUserDto(user),
    },
  };
}
