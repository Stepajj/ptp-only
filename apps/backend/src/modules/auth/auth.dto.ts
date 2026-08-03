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
  id: z.string().regex(/^\d+$/).min(1).max(20),
  username: z.string().trim().min(1).max(32).regex(/^[a-zA-Z0-9_]+$/).optional(),
  first_name: z.string().trim().min(1).max(64).optional(),
  last_name: z.string().trim().min(1).max(64).optional(),
  photo_url: z.url().max(2048).refine((url) => new URL(url).protocol === "https").optional(),
  auth_date: z.string().regex(/^\d+$/).min(1).max(10),
  hash: z.string().regex(/^[a-f0-9]{64}$/i),
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
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type TelegramLoginDto = z.infer<typeof telegramLoginSchema>;

export interface PublicUserDto {
  id: string;
  status: string;
  language: string;
  createdAt: string;
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
