import { z } from "zod";

const digits = z.string().transform((value) => value.replace(/\D/g, ""));
const positiveInteger = z.number().int().positive();

export const requisiteIdSchema = z.coerce.number().int().positive();

export const createRequisiteSchema = z
  .object({
    bankId: positiveInteger,
    fio: z.string().trim().min(1).max(255),
    card: digits.pipe(z.string().regex(/^\d{16}$/)).optional(),
    phone: digits.pipe(z.string().regex(/^\d{10,12}$/)).optional(),
    minAmount: positiveInteger.optional(),
    maxAmount: positiveInteger.optional(),
    limitAmount: positiveInteger.optional(),
    limitAmountMinutes: z.number().int().min(1).max(1440).optional(),
    exactAmountOnly: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.card && !value.phone) {
      context.addIssue({ code: "custom", message: "Card or phone is required" });
    }
    if ((value.limitAmount === undefined) !== (value.limitAmountMinutes === undefined)) {
      context.addIssue({ code: "custom", message: "Daily limit and its period must be provided together" });
    }
    if (value.minAmount && value.maxAmount && value.minAmount > value.maxAmount) {
      context.addIssue({ code: "custom", message: "Minimum amount must not exceed maximum amount" });
    }
  });

export const editRequisiteSchema = z
  .object({
    status: z.enum(["on", "off"]).optional(),
    minAmount: positiveInteger.optional(),
    maxAmount: positiveInteger.optional(),
    limitAmount: positiveInteger.optional(),
    limitAmountMinutes: z.number().int().min(1).max(1440).optional(),
    exactAmountOnly: z.boolean().optional(),
    resetLimits: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({ code: "custom", message: "At least one setting is required" });
    }
    if ((value.limitAmount === undefined) !== (value.limitAmountMinutes === undefined)) {
      context.addIssue({ code: "custom", message: "Daily limit and its period must be provided together" });
    }
    if (value.minAmount && value.maxAmount && value.minAmount > value.maxAmount) {
      context.addIssue({ code: "custom", message: "Minimum amount must not exceed maximum amount" });
    }
  });

export type CreateRequisiteDto = z.infer<typeof createRequisiteSchema>;
export type EditRequisiteDto = z.infer<typeof editRequisiteSchema>;
