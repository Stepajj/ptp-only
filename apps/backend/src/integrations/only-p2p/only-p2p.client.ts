import { config } from "../../config";
import { AppError } from "../../shared/errors/app-error";
export type OnlyP2PTopupMethod =
  | "btc"
  | "ltc"
  | "usdt"
  | "cb"
  | "xr";

  export interface OnlyP2PTopupResult {
  method: OnlyP2PTopupMethod;
  address?: string;
  payUrl?: string;
}
interface OnlyP2PBaseResponse {
  success: boolean;
  error?: string;
}

export interface CreateOnlyP2PClientResult {
  externalUserId: string;
}

export interface OnlyP2PBalanceResult {
  balance: number;
  frozen: number;
  totalProfit: number;
}

export interface OnlyP2PBank {
  id: number;
  name: string;
  tier1: boolean;
}

export interface OnlyP2PRequisite {
  requisiteId: number;
  card: string;
  phone: string;
  fio: string;
  bank: string;
  bankId: number;
  tier1: boolean;
  status: "on" | "off";
  method: "both" | "card" | "sbp" | null;
  minAmount: number;
  maxAmount: number;
  limitAmount: number | null;
  limitAmountMinutes: number | null;
  exactAmountOnly: boolean;
}

export interface EditOnlyP2PRequisiteInput {
  status?: "on" | "off" | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  limitAmount?: number | undefined;
  limitAmountMinutes?: number | undefined;
  exactAmountOnly?: boolean | undefined;
  resetLimits?: boolean | undefined;
}

function buildOnlyP2PUrl(path: string): string {
  return new URL(path, config.onlyP2P.baseUrl).toString();
}

function parseOnlyP2PBaseResponse(rawBody: string): OnlyP2PBaseResponse {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid response",
    });
  }

  if (!parsed || typeof parsed !== "object" || !("success" in parsed)) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid response",
    });
  }

  const response = parsed as {
    success: unknown;
    error?: unknown;
  };

  return {
    success: response.success === true,
    ...(typeof response.error === "string"
      ? { error: response.error }
      : {}),
  };
}

function extractExternalUserId(rawBody: string): string {
  const match = /"user_id"\s*:\s*"?([0-9]+)"?/.exec(rawBody);

  if (!match?.[1]) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid client identifier",
    });
  }

  return match[1];
}

function parseOnlyP2PBalanceResponse(
  rawBody: string,
): OnlyP2PBalanceResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid response",
    });
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("success" in parsed)
  ) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid response",
    });
  }

  const response = parsed as {
    success: unknown;
    error?: unknown;
    data?: unknown;
  };

  if (response.success !== true) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_ERROR",
      message: "External service rejected the request",
    });
  }

  if (
    !response.data ||
    typeof response.data !== "object"
  ) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid balance response",
    });
  }

  const data = response.data as {
    balance?: unknown;
    frozen?: unknown;
    total_profit?: unknown;
  };

  if (
    typeof data.balance !== "number" ||
    typeof data.frozen !== "number" ||
    typeof data.total_profit !== "number"
  ) {
    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid balance response",
    });
  }

  return {
    balance: data.balance,
    frozen: data.frozen,
    totalProfit: data.total_profit,
  };
}

export async function createOnlyP2PClient(): Promise<CreateOnlyP2PClientResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.onlyP2P.timeoutMs,
  );

  try {
    const response = await fetch(
      buildOnlyP2PUrl("/op2p_api/create_client"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_id: config.onlyP2P.apiId,
          secret_key: config.onlyP2P.secretKey,
        }),
        signal: controller.signal,
      },
    );

    const rawBody = await response.text();

    if (!response.ok) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_REQUEST_FAILED",
        message: "External service request failed",
      });
    }

    const baseResponse = parseOnlyP2PBaseResponse(rawBody);

    if (!baseResponse.success) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_ERROR",
        message: "External service rejected the request",
      });
    }

    return {
      externalUserId: extractExternalUserId(rawBody),
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_UNAVAILABLE",
      message: "External service is unavailable",
      isOperational: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getOnlyP2PBalance(
  externalUserId: string,
): Promise<OnlyP2PBalanceResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.onlyP2P.timeoutMs,
  );

  try {
    const response = await fetch(
      buildOnlyP2PUrl("/op2p_api/balance"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_id: config.onlyP2P.apiId,
          secret_key: config.onlyP2P.secretKey,
          user_id: externalUserId,
        }),
        signal: controller.signal,
      },
    );

    const rawBody = await response.text();

    if (!response.ok) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_REQUEST_FAILED",
        message: "External service request failed",
      });
    }

    return parseOnlyP2PBalanceResponse(rawBody);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_UNAVAILABLE",
      message: "External service is unavailable",
      isOperational: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function postOnlyP2P(path: string, body: Record<string, unknown>): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.onlyP2P.timeoutMs);

  try {
    const response = await fetch(buildOnlyP2PUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_id: config.onlyP2P.apiId,
        secret_key: config.onlyP2P.secretKey,
        ...body,
      }),
      signal: controller.signal,
    });
    const rawBody = await response.text();

    if (!response.ok) {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_REQUEST_FAILED", message: "External service request failed" });
    }

    const baseResponse = parseOnlyP2PBaseResponse(rawBody);
    if (!baseResponse.success) {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_ERROR", message: "External service rejected the request" });
    }

    return JSON.parse(rawBody) as unknown;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_UNAVAILABLE", message: "External service is unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}

function parseOnlyP2PRequisitesResponse(raw: unknown): OnlyP2PRequisite[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { data?: unknown }).data)) {
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisites response" });
  }

  return (raw as { data: unknown[] }).data.map((item) => {
    if (!item || typeof item !== "object") {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisite" });
    }
    const requisite = item as Record<string, unknown>;
    const method = requisite.method;
    const status = requisite.status;
    const optionalLimit = (value: unknown): number | null => value === null ? null : typeof value === "number" ? value : Number.NaN;
    const limitAmount = optionalLimit(requisite.limit_amount);
    const limitAmountMinutes = optionalLimit(requisite.limit_amount_minutes);

    if (
      typeof requisite.requisite_id !== "number" || !Number.isSafeInteger(requisite.requisite_id) ||
      typeof requisite.card !== "string" || typeof requisite.phone !== "string" ||
      typeof requisite.fio !== "string" || typeof requisite.bank !== "string" ||
      typeof requisite.bank_id !== "number" || !Number.isSafeInteger(requisite.bank_id) ||
      typeof requisite.tier_1 !== "boolean" || (status !== "on" && status !== "off") ||
      (method !== "both" && method !== "card" && method !== "sbp" && method !== null) ||
      typeof requisite.min_amount !== "number" || typeof requisite.max_amount !== "number" ||
      typeof requisite.exact_amount_only !== "boolean" || Number.isNaN(limitAmount) || Number.isNaN(limitAmountMinutes)
    ) {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisite" });
    }

    return {
      requisiteId: requisite.requisite_id,
      card: requisite.card,
      phone: requisite.phone,
      fio: requisite.fio,
      bank: requisite.bank,
      bankId: requisite.bank_id,
      tier1: requisite.tier_1,
      status,
      method,
      minAmount: requisite.min_amount,
      maxAmount: requisite.max_amount,
      limitAmount,
      limitAmountMinutes,
      exactAmountOnly: requisite.exact_amount_only,
    };
  });
}

export async function getOnlyP2PBanks(): Promise<OnlyP2PBank[]> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.onlyP2P.timeoutMs,
  );

  try {
    const response = await fetch(
      buildOnlyP2PUrl("/op2p_api/banks"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_id: config.onlyP2P.apiId,
          secret_key: config.onlyP2P.secretKey,
        }),
        signal: controller.signal,
      },
    );

    const rawBody = await response.text();

    if (!response.ok) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_REQUEST_FAILED",
        message: "External service request failed",
      });
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid response",
      });
    }

    if (!parsed || typeof parsed !== "object" || !("success" in parsed)) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid response",
      });
    }

    const responseData = parsed as {
      success: unknown;
      data?: unknown;
    };

    if (responseData.success !== true) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_ERROR",
        message: "External service rejected the request",
      });
    }

    if (!Array.isArray(responseData.data)) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid banks response",
      });
    }

    return responseData.data.map((item) => {
      if (!item || typeof item !== "object") {
        throw new AppError({
          statusCode: 502,
          code: "ONLY_P2P_INVALID_RESPONSE",
          message: "External service returned an invalid bank",
        });
      }

      const bank = item as {
        id?: unknown;
        name?: unknown;
        tier_1?: unknown;
      };

      if (
        typeof bank.id !== "number" ||
        !Number.isSafeInteger(bank.id) ||
        typeof bank.name !== "string" ||
        bank.name.length === 0 ||
        typeof bank.tier_1 !== "boolean"
      ) {
        throw new AppError({
          statusCode: 502,
          code: "ONLY_P2P_INVALID_RESPONSE",
          message: "External service returned an invalid bank",
        });
      }

      return {
        id: bank.id,
        name: bank.name,
        tier1: bank.tier_1,
      };
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_UNAVAILABLE",
      message: "External service is unavailable",
      isOperational: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getOnlyP2PRequisites(externalUserId: string): Promise<OnlyP2PRequisite[]> {
  return parseOnlyP2PRequisitesResponse(await postOnlyP2P("/op2p_api/requisites", {
    user_id: externalUserId,
  }));
}

export async function createOnlyP2PRequisite(
  externalUserId: string,
  input: { bankId: number; fio: string; card?: string | undefined; phone?: string | undefined },
): Promise<number> {
  const raw = await postOnlyP2P("/op2p_api/requisite_create", {
    user_id: externalUserId,
    bank_id: input.bankId,
    fio: input.fio,
    ...(input.card ? { card: input.card } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
  });
  const data = raw && typeof raw === "object" ? (raw as { data?: unknown }).data : undefined;
  const requisiteId = data && typeof data === "object" ? (data as { requisite_id?: unknown }).requisite_id : undefined;

  if (typeof requisiteId !== "number" || !Number.isSafeInteger(requisiteId)) {
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisite identifier" });
  }

  return requisiteId;
}

export async function editOnlyP2PRequisite(
  externalUserId: string,
  requisiteId: number,
  input: EditOnlyP2PRequisiteInput,
): Promise<void> {
  await postOnlyP2P("/op2p_api/requisite_edit", {
    user_id: externalUserId,
    requisite_id: requisiteId,
    ...(input.status ? { status: input.status } : {}),
    ...(input.minAmount !== undefined ? { min_amount: input.minAmount } : {}),
    ...(input.maxAmount !== undefined ? { max_amount: input.maxAmount } : {}),
    ...(input.limitAmount !== undefined ? { limit_amount: input.limitAmount } : {}),
    ...(input.limitAmountMinutes !== undefined ? { limit_amount_minutes: input.limitAmountMinutes } : {}),
    ...(input.exactAmountOnly !== undefined ? { exact_amount_only: input.exactAmountOnly } : {}),
    ...(input.resetLimits !== undefined ? { reset_limits: input.resetLimits } : {}),
  });
}

export async function deleteOnlyP2PRequisite(externalUserId: string, requisiteId: number): Promise<void> {
  await postOnlyP2P("/op2p_api/requisite_delete", {
    user_id: externalUserId,
    requisite_id: requisiteId,
  });
}

export async function topupOnlyP2P(
  externalUserId: string,
  method: OnlyP2PTopupMethod,
  amount?: number,
): Promise<OnlyP2PTopupResult> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    config.onlyP2P.timeoutMs,
  );

  try {
    const body: {
      api_id: string;
      secret_key: string;
      user_id: string;
      method: OnlyP2PTopupMethod;
      amount?: number;
    } = {
      api_id: config.onlyP2P.apiId,
      secret_key: config.onlyP2P.secretKey,
      user_id: externalUserId,
      method,
    };

    if (amount !== undefined) {
      body.amount = amount;
    }

    const response = await fetch(
      buildOnlyP2PUrl("/op2p_api/topup"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    const rawBody = await response.text();

    if (!response.ok) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_REQUEST_FAILED",
        message: "External service request failed",
      });
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid response",
      });
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("success" in parsed)
    ) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid response",
      });
    }

    const responseData = parsed as {
      success: unknown;
      error?: unknown;
      data?: unknown;
    };

    if (responseData.success !== true) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_ERROR",
        message: "External service rejected the topup request",
      });
    }

    if (
      !responseData.data ||
      typeof responseData.data !== "object"
    ) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid topup response",
      });
    }

    const data = responseData.data as {
      method?: unknown;
      address?: unknown;
      pay_url?: unknown;
    };

    if (data.method !== method) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid topup method",
      });
    }

    if (
      method === "btc" ||
      method === "ltc" ||
      method === "usdt"
    ) {
      if (typeof data.address !== "string" || data.address.length === 0) {
        throw new AppError({
          statusCode: 502,
          code: "ONLY_P2P_INVALID_RESPONSE",
          message: "External service returned an invalid topup address",
        });
      }

      return {
        method,
        address: data.address,
      };
    }

    if (typeof data.pay_url !== "string" || data.pay_url.length === 0) {
      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid payment URL",
      });
    }

    return {
      method,
      payUrl: data.pay_url,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_UNAVAILABLE",
      message: "External service is unavailable",
      isOperational: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}
