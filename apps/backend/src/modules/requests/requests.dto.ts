import { z } from "zod";

export const requestStatusSchema = z.enum(["waiting", "cancelled", "finished"]);

export const listRequestsQuerySchema = z
  .object({
    status: requestStatusSchema.optional(),
  })
  .strict();

export const requestIdSchema = z.string().trim().min(1);

export const confirmRequestSchema = z
  .object({
    amount: z.number().int().positive().optional(),
  })
  .strict();

export type RequestStatusDto = z.infer<typeof requestStatusSchema>;
export type ListRequestsQueryDto = z.infer<typeof listRequestsQuerySchema>;
export type ConfirmRequestDto = z.infer<typeof confirmRequestSchema>;
