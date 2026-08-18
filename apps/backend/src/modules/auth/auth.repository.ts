import { ExternalProvider, Prisma, UserStatus } from "@prisma/client";

import { prisma } from "../../db/prisma";

const userInclude = {
  settings: true,
  credential: {
    select: {
      identifier: true,
    },
  },
} satisfies Prisma.UserInclude;

const credentialWithUserInclude = {
  user: {
    include: userInclude,
  },
} satisfies Prisma.UserCredentialInclude;

const refreshTokenWithUserInclude = {
  user: {
    include: userInclude,
  },
} satisfies Prisma.RefreshTokenInclude;

export type AuthUserRecord = Prisma.UserGetPayload<{ include: typeof userInclude }>;
export type CredentialWithUser = Prisma.UserCredentialGetPayload<{
  include: typeof credentialWithUserInclude;
}>;
export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof refreshTokenWithUserInclude;
}>;

export interface CreateLocalUserInput {
  identifier: string;
  identifierNormalized: string;
  passwordHash: string;
  language: string;
  telegram?: TelegramAccountData;
}

export interface TelegramAccountData {
  id: string;
  username: string | null;
  firstName: string | null;
  photoUrl: string | null;
  linkedAt: Date;
}

export interface CreateTelegramUserInput {
  language: string;
  telegram: TelegramAccountData;
}

export interface CreateRefreshTokenInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

export interface RotateRefreshTokenInput extends CreateRefreshTokenInput {
  oldTokenHash: string;
  now: Date;
}

export interface RotationResult {
  previousToken: RefreshTokenWithUser;
  rotated: boolean;
}

export async function findCredentialByIdentifierNormalized(
  identifierNormalized: string,
): Promise<CredentialWithUser | null> {
  return prisma.userCredential.findUnique({
    where: { identifierNormalized },
    include: credentialWithUserInclude,
  });
}

export async function findCredentialByUserId(userId: string) {
  return prisma.userCredential.findUnique({
    where: { userId },
    select: { passwordHash: true },
  });
}

export async function updateProfile(userId: string, data: { displayName?: string | undefined; avatarUrl?: string | null | undefined }): Promise<AuthUserRecord> {
  const updateData: Prisma.UserUpdateInput = {};
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  return prisma.user.update({ where: { id: userId }, data: updateData, include: userInclude });
}

export async function findExternalClientByUserId(userId: string) {
  return prisma.externalClient.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: ExternalProvider.ONLY_P2P,
      },
    },
  });
}

export async function createLocalUser(input: CreateLocalUserInput): Promise<AuthUserRecord> {
  return prisma.$transaction(async (tx) => {
    const telegramData = input.telegram
      ? {
          telegramId: input.telegram.id,
          telegramUsername: input.telegram.username,
          telegramFirstName: input.telegram.firstName,
          telegramPhotoUrl: input.telegram.photoUrl,
          telegramLinkedAt: input.telegram.linkedAt,
        }
      : {};

    return tx.user.create({
      data: {
        credential: {
          create: {
            identifier: input.identifier,
            identifierNormalized: input.identifierNormalized,
            passwordHash: input.passwordHash,
          },
        },
        settings: {
          create: {
            language: input.language,
          },
        },
        ...telegramData,
      },
      include: userInclude,
    });
  });
}

export async function createTelegramUser(input: CreateTelegramUserInput): Promise<AuthUserRecord> {
  return prisma.user.create({
    data: {
      telegramId: input.telegram.id,
      telegramUsername: input.telegram.username,
      telegramFirstName: input.telegram.firstName,
      telegramPhotoUrl: input.telegram.photoUrl,
      telegramLinkedAt: input.telegram.linkedAt,
      settings: {
        create: {
          language: input.language,
        },
      },
    },
    include: userInclude,
  });
}

const ONLY_P2P_PROVISIONING_LOCK_MAX_WAIT_MS = 30_000;
const ONLY_P2P_PROVISIONING_LOCK_TIMEOUT_MS = 60_000;

export async function withOnlyP2pProvisioningLock<T>(
  userId: string,
  work: () => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transaction) => {
      // This transaction-scoped PostgreSQL lock serializes provisioning across app instances.
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${`only-p2p-provisioning:${userId}`}))
      `;

      return work();
    },
    {
      maxWait: ONLY_P2P_PROVISIONING_LOCK_MAX_WAIT_MS,
      timeout: ONLY_P2P_PROVISIONING_LOCK_TIMEOUT_MS,
    },
  );
}

export async function setPendingOnlyP2pExternalUserId(
  userId: string,
  externalUserId: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      pendingOnlyP2pExternalUserId: externalUserId,
    },
  });
}

export async function linkOnlyP2pExternalClient(
  userId: string,
  externalUserId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.externalClient.create({
      data: {
        userId,
        provider: ExternalProvider.ONLY_P2P,
        externalUserId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        pendingOnlyP2pExternalUserId: null,
      },
    });
  });
}

export async function findUserById(userId: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });
}

export async function findUserByTelegramId(telegramId: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: { telegramId },
    include: userInclude,
  });
}

export async function updateUserTelegramData(userId: string, data: {
  telegramId: string;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramPhotoUrl: string | null;
  telegramLinkedAt: Date;
}): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername,
      telegramFirstName: data.telegramFirstName,
      telegramPhotoUrl: data.telegramPhotoUrl,
      telegramLinkedAt: data.telegramLinkedAt,
    },
  });
}

export async function createRefreshToken(input: CreateRefreshTokenInput): Promise<void> {
  await prisma.refreshToken.create({
    data: {
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function findRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshTokenWithUser | null> {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: refreshTokenWithUserInclude,
  });
}

export async function rotateRefreshToken(input: RotateRefreshTokenInput): Promise<RotationResult | null> {
  return prisma.$transaction(async (tx) => {
    const previousToken = await tx.refreshToken.findUnique({
      where: { tokenHash: input.oldTokenHash },
      include: refreshTokenWithUserInclude,
    });

    if (!previousToken) {
      return null;
    }

    const isActive =
      previousToken.revokedAt === null &&
      previousToken.expiresAt > input.now &&
      previousToken.user.status === UserStatus.ACTIVE;

    if (!isActive) {
      return { previousToken, rotated: false };
    }

    const updateResult = await tx.refreshToken.updateMany({
      where: {
        id: previousToken.id,
        revokedAt: null,
      },
      data: {
        lastUsedAt: input.now,
        revokedAt: input.now,
        revokedReason: "rotated",
        rotatedToTokenHash: input.tokenHash,
      },
    });

    if (updateResult.count !== 1) {
      return null;
    }

    await tx.refreshToken.create({
      data: {
        id: input.id,
        userId: previousToken.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    return { previousToken, rotated: true };
  });
}

export async function revokeRefreshTokenByHash(
  tokenHash: string,
  reason: string,
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

export async function revokeAllUserRefreshTokens(userId: string, reason: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

export async function listActiveRefreshTokens(userId: string, now = new Date()) {
  return prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, ipAddress: true, expiresAt: true, lastUsedAt: true, createdAt: true, tokenHash: true },
  });
}

export async function revokeRefreshTokenById(userId: string, id: string, reason: string): Promise<boolean> {
  const result = await prisma.refreshToken.updateMany({ where: { id, userId, revokedAt: null }, data: { revokedAt: new Date(), revokedReason: reason } });
  return result.count === 1;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const result = await prisma.userCredential.updateMany({ where: { userId }, data: { passwordHash } });
  return result.count === 1;
}

export async function createUserCredential(
  userId: string,
  identifier: string,
  identifierNormalized: string,
  passwordHash: string,
): Promise<void> {
  await prisma.userCredential.create({
    data: { userId, identifier, identifierNormalized, passwordHash },
  });
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
