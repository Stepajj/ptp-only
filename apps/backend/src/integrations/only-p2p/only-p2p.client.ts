import { config } from "../../config";
import { AppError } from "../../shared/errors/app-error";

interface OnlyP2PBaseResponse {
  success: boolean;
  error?: string;
}

export interface CreateOnlyP2PClientResult {
  externalUserId: string;
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

  const response = parsed as { success: unknown; error?: unknown };

  return {
    success: response.success === true,
    ...(typeof response.error === "string" ? { error: response.error } : {}),
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

export async function createOnlyP2PClient(): Promise<CreateOnlyP2PClientResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.onlyP2P.timeoutMs);

  try {
    const response = await fetch(buildOnlyP2PUrl("/op2p_api/create_client"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_id: config.onlyP2P.apiId,
        secret_key: config.onlyP2P.secretKey,
      }),
      signal: controller.signal,
    });

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
