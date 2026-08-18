import type { User, UserSettings } from "@prisma/client";

import type { PublicUserDto } from "./auth.dto";

export type UserWithSettings = User & {
  settings: UserSettings | null;
  credential: { identifier: string } | null;
};

export function toPublicUserDto(user: UserWithSettings): PublicUserDto {
  return {
    id: user.id,
    status: user.status,
    language: user.settings?.language ?? "ru",
    createdAt: user.createdAt.toISOString(),
    displayName: user.displayName ?? user.telegramFirstName ?? user.credential?.identifier ?? user.id,
    identifier: user.credential?.identifier ?? null,
    telegramUsername: user.telegramUsername,
    telegramPhotoUrl: user.telegramPhotoUrl,
    avatarUrl: user.avatarUrl,
  };
}
