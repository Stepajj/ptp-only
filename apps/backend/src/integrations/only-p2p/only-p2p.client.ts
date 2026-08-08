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

    if (method === "cb" || method === "xr") {
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
    }

    throw new AppError({
      statusCode: 502,
      code: "ONLY_P2P_INVALID_RESPONSE",
      message: "External service returned an invalid topup response",
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