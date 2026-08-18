import { z } from "zod";

export const afterIdSchema = z.coerce.number().int().nonnegative().optional();
export const supportMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000),
}).strict();

export type SupportMessageDto = z.infer<typeof supportMessageSchema>;
