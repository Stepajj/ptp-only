import { getAuthAccessToken } from "@/features/auth/lib/getAuthAccessToken";
import { requestJson } from "@/shared/api/http";

import type { DepositApiMethod } from "../model/deposit.types";

export interface CreateTopupInput {
  method: DepositApiMethod;
  amount?: number;
}

export interface TopupResult {
  method: DepositApiMethod;
  address?: string;
  payUrl?: string;
}

export async function createTopup(input: CreateTopupInput): Promise<TopupResult> {
  const response = await requestJson<{ success: true; data: TopupResult }>("/topup", {
    method: "POST",
    body: { ...input } as Record<string, unknown>,
    accessToken: getAuthAccessToken(),
  });

  return response.data;
}
