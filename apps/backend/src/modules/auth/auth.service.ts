import { UserStatus } from "@prisma/client";

import { config } from "../../config";
import { createOnlyP2PClient } from "../../integrations/only-p2p/only-p2p.client";
import { AppError } from "../../shared/errors/app-error";
import { logger } from "../../shared/logger/logger";
import type { AuthResponseDto, CurrentUserResponseDto, LoginDto, RegisterDto, TelegramLoginDto } from "./auth.dto";
import { toPublicUserDto } from "./auth.mapper";
import { verifyTelegramLogin } from "./services/telegram.service";
import {
  createLocalUser,
  createRefreshToken as createRefreshTokenRecord,
  deleteUserById,
  findCredentialByIdentifierNormalized,
  findExternalClientByUserId,
  findRefreshTokenByHash,
  findUserById,
  isRecordNotFoundError,
  isUniqueConstraintError,
  linkOnlyP2pExternalClient,
  revokeAllUserRefreshTokens,
  revokeRefreshTokenByHash,
  rotateRefreshToken,
  setPendingOnlyP2pExternalUserId,
  updateUserTelegramData,
  findUserByTelegramId,
  type AuthUserRecord,
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

function ensureActiveUser(status: UserStatus): void {
  if (status !== UserStatus.ACTIVE) {
    throw new AppError({
      statusCode: 403,
      code: "USER_NOT_ACTIVE",
      message: "User is not active",
    });
  }
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

async function compensateFailedRegistration(userId: string, externalUserId?: string): Promise<void> {
  try {
    await deleteUserById(userId);
  } catch (error) {
    if (!isRecordNotFoundError(error)) {
      logger.error(
        {
          err: error,
          userId,
          externalUserId,
        },
        "Failed to compensate incomplete registration",
      );
    }

    throw error;
  }

  if (externalUserId) {
    logger.warn(
      {
        userId,
        externalUserId,
      },
      "OnlyP2P client created without local linkage after registration rollback",
    );
  }
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
  let externalUserId: string;

  try {
    externalUserId = await resolveOnlyP2pExternalUserId(user);
  } catch (error) {
    await compensateFailedRegistration(user.id);
    throw error;
  }

  try {
    await linkOnlyP2pExternalClient(user.id, externalUserId);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const linkedClient = await findExternalClientByUserId(user.id);

      if (linkedClient) {
        const session = await issueSession(user.id, metadata);
        return createAuthResponse(user, session);
      }
    }

    await compensateFailedRegistration(user.id, externalUserId);
    throw error;
  }

  const session = await issueSession(user.id, metadata);
  return createAuthResponse(user, session);
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

  if (telegram) {
    verifyTelegramLogin(telegram);

    const existingTelegramOwner = await findUserByTelegramId(telegram.id);

    if (existingTelegramOwner) {
      throw new AppError({
        statusCode: 409,
        code: "TELEGRAM_ID_ALREADY_IN_USE",
        message: "Telegram account is already linked to another user",
      });
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
      telegram
        ? {
            ...createLocalUserInput,
            telegram: {
              id: telegram.id,
              username: telegram.username ?? null,
              firstName: telegram.first_name ?? null,
              photoUrl: telegram.photo_url ?? null,
              linkedAt: new Date(),
            },
          }
        : createLocalUserInput,
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
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
  verifyTelegramLogin({
    ...input,
    username: input.username ?? undefined,
    first_name: input.first_name ?? undefined,
    photo_url: input.photo_url ?? undefined,
  });

  const user = await findUserByTelegramId(input.id);

  if (!user) {
    throw new AppError({
      statusCode: 404,
      code: "TELEGRAM_ACCOUNT_NOT_LINKED",
      message: "Telegram account is not linked",
    });
  }

  ensureActiveUser(user.status);

  const session = await issueSession(user.id, metadata);
  return createAuthResponse(user, session);
}

export async function linkTelegram(userId: string, input: TelegramLoginDto): Promise<CurrentUserResponseDto> {
  verifyTelegramLogin({
    ...input,
    username: input.username ?? undefined,
    first_name: input.first_name ?? undefined,
    photo_url: input.photo_url ?? undefined,
  });

  const existingOwner = await findUserByTelegramId(input.id);

  if (existingOwner && existingOwner.id !== userId) {
    throw new AppError({
      statusCode: 409,
      code: "TELEGRAM_ID_ALREADY_IN_USE",
      message: "Telegram account is already linked to another user",
    });
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  await updateUserTelegramData(userId, {
    telegramId: input.id,
    telegramUsername: input.username ?? null,
    telegramFirstName: input.first_name ?? null,
    telegramPhotoUrl: input.photo_url ?? null,
    telegramLinkedAt: new Date(),
  });

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
