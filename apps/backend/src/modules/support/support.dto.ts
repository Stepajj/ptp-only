import { z } from "zod";

export const afterIdSchema = z.coerce.number().int().nonnegative().optional();
export const supportMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000),
}).strict();

export const supportFileCaptionSchema = z.object({
  caption: z.string().trim().max(800).optional().default(''),
}).strict();

export type SupportMessageDto = z.infer<typeof supportMessageSchema>;
export type SupportFileCaptionDto = z.infer<typeof supportFileCaptionSchema>;
