import { ExternalProvider, Prisma, UserStatus } from "@prisma/client";

import { prisma } from "../../db/prisma";

const userInclude = {
  settings: true,
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
      },
      include: userInclude,
    });
  });
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

export async function deleteUserById(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function findUserById(userId: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
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

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
