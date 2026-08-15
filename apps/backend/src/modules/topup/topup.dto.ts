import { z } from "zod";

export const topupSchema = z
  .object({
    method: z.enum(["btc", "ltc", "usdt", "cb", "xr"]),
    amount: z.number().positive().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const requiresAmount =
      value.method === "cb" ||
      value.method === "xr";

    if (requiresAmount && value.amount === undefined) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount is required for this topup method",
      });
    }

    const doesNotRequireAmount =
      value.method === "btc" ||
      value.method === "ltc" ||
      value.method === "usdt";

    if (doesNotRequireAmount && value.amount !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must not be provided for this topup method",
      });
    }
  });

export type TopupDto = z.infer<typeof topupSchema>;

export interface TopupResponseDto {
  success: true;
  data: {
    method: "btc" | "ltc" | "usdt" | "cb" | "xr";
    address?: string;
    payUrl?: string;
  };
}
