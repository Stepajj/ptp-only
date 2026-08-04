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
