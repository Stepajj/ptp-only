import type { User, UserSettings } from "@prisma/client";

import type { PublicUserDto } from "./auth.dto";

export type UserWithSettings = User & {
  settings: UserSettings | null;
};

export function toPublicUserDto(user: UserWithSettings): PublicUserDto {
  return {
    id: user.id,
    status: user.status,
    language: user.settings?.language ?? "ru",
    createdAt: user.createdAt.toISOString(),
  };
}
