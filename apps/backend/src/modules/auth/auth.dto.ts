import { z } from "zod";

const identifierSchema = z.string().trim().min(3).max(320);

const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

export const telegramLoginSchema = z.object({
  id_token: z.string().min(1),
}).strict();

export const registerSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  language: z.string().trim().min(2).max(10).default("ru"),
  telegram: telegramLoginSchema.optional(),
});

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1).max(128),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
}).strict();

export const setCredentialsSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
}).strict();

export const sessionIdSchema = z.uuid();

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.url().max(2048).refine((value) => new URL(value).protocol === "https:", "Avatar URL must use HTTPS").nullable().optional(),
}).strict().refine((value) => value.displayName !== undefined || value.avatarUrl !== undefined, {
  message: "At least one profile field is required",
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type TelegramLoginDto = z.infer<typeof telegramLoginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type SetCredentialsDto = z.infer<typeof setCredentialsSchema>;
export type ProfileUpdateDto = z.infer<typeof profileUpdateSchema>;

export interface PublicUserDto {
  id: string;
  status: string;
  language: string;
  createdAt: string;
  displayName: string;
  identifier: string | null;
  telegramUsername: string | null;
  telegramLinked: boolean;
  telegramPhotoUrl: string | null;
  avatarUrl: string | null;
}

export interface AuthResponseDto {
  success: true;
  data: {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: number;
    user: PublicUserDto;
  };
}

export interface CurrentUserResponseDto {
  success: true;
  data: {
    user: PublicUserDto;
  };
}
