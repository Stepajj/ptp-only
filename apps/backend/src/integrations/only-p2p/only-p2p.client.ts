import { config } from "../../config";
import { AppError } from "../../shared/errors/app-error";
import { logger } from "../../shared/logger/logger";
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

function onlyP2PError(message?: string): AppError {
  const normalizedMessage = message?.trim();

  return new AppError({
    statusCode: 400,
    code: "ONLY_P2P_ERROR",
    message: normalizedMessage && normalizedMessage.length > 0
      ? normalizedMessage
      : "External service rejected the request",
  });
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

export type OnlyP2PRequestStatus = "waiting" | "cancelled" | "finished";

export interface OnlyP2PRequest {
  id: string;
  amountRub: number;
  receivedRubAmount: number | null;
  requisiteId: number;
  requisite: string;
  fio: string;
  bank: string;
  method: "card" | "sbp";
  status: OnlyP2PRequestStatus;
  awaitingProof: boolean;
  deadline: string | null;
  created: string;
  dateFinished: string | null;
}

export interface OnlyP2PSupportMessage {
  id: number;
  externalUserId: string;
  fromOperator: boolean;
  text: string;
  created: string;
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
    throw onlyP2PError(typeof response.error === "string" ? response.error : undefined);
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
      throw onlyP2PError(baseResponse.error);
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
      throw onlyP2PError(baseResponse.error);
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

function describeResponseShape(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return { type: typeof raw };
  }

  const record = raw as Record<string, unknown>;
  const data = record.data;

  return {
    keys: Object.keys(record),
    dataType: Array.isArray(data) ? "array" : typeof data,
    dataLength: Array.isArray(data) ? data.length : undefined,
  };
}

function parseOnlyP2PRequisitesResponse(raw: unknown): OnlyP2PRequisite[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { data?: unknown }).data)) {
    logger.warn(
      { endpoint: "/op2p_api/requisites", responseShape: describeResponseShape(raw) },
      "OnlyP2P returned an invalid requisites list payload",
    );
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisites response" });
  }

  return (raw as { data: unknown[] }).data.map((item, itemIndex) => {
    if (!item || typeof item !== "object") {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requisite" });
    }
    const requisite = item as Record<string, unknown>;
    const method = requisite.method === undefined ? null : requisite.method;
    const status = requisite.status;
    const readInteger = (value: unknown): number | null => {
      if (typeof value === "number") {
        return Number.isSafeInteger(value) ? value : null;
      }

      if (typeof value === "string" && /^\d+$/.test(value)) {
        const parsed = Number(value);
        return Number.isSafeInteger(parsed) ? parsed : null;
      }

      return null;
    };
    const requisiteId = readInteger(requisite.requisite_id);
    const bankId = readInteger(requisite.bank_id);
    const minAmount = readInteger(requisite.min_amount);
    const maxAmount = readInteger(requisite.max_amount);
    const optionalLimit = (value: unknown): number | null =>
      value === undefined || value === null ? null : readInteger(value);
    const limitAmount = optionalLimit(requisite.limit_amount);
    const limitAmountMinutes = optionalLimit(requisite.limit_amount_minutes);

    if (
      requisiteId === null ||
      (requisite.card !== undefined && requisite.card !== null && typeof requisite.card !== "string") ||
      (requisite.phone !== undefined && requisite.phone !== null && typeof requisite.phone !== "string") ||
      typeof requisite.fio !== "string" || typeof requisite.bank !== "string" ||
      bankId === null ||
      typeof requisite.tier_1 !== "boolean" || (status !== "on" && status !== "off") ||
      (method !== "both" && method !== "card" && method !== "sbp" && method !== null) ||
      minAmount === null || maxAmount === null ||
      (requisite.exact_amount_only !== undefined && requisite.exact_amount_only !== null && typeof requisite.exact_amount_only !== "boolean") ||
      (requisite.limit_amount !== undefined && requisite.limit_amount !== null && limitAmount === null) ||
      (requisite.limit_amount_minutes !== undefined && requisite.limit_amount_minutes !== null && limitAmountMinutes === null)
    ) {
      const invalidFields = Object.entries({
        requisite_id: requisiteId === null,
        bank_id: bankId === null,
        min_amount: minAmount === null,
        max_amount: maxAmount === null,
        card: requisite.card !== undefined && requisite.card !== null && typeof requisite.card !== "string",
        phone: requisite.phone !== undefined && requisite.phone !== null && typeof requisite.phone !== "string",
        fio: typeof requisite.fio !== "string",
        bank: typeof requisite.bank !== "string",
        tier_1: typeof requisite.tier_1 !== "boolean",
        status: status !== "on" && status !== "off",
        method: method !== "both" && method !== "card" && method !== "sbp" && method !== null,
        exact_amount_only: requisite.exact_amount_only !== undefined && requisite.exact_amount_only !== null && typeof requisite.exact_amount_only !== "boolean",
        limit_amount: requisite.limit_amount !== undefined && requisite.limit_amount !== null && limitAmount === null,
        limit_amount_minutes: requisite.limit_amount_minutes !== undefined && requisite.limit_amount_minutes !== null && limitAmountMinutes === null,
      })
        .filter(([, invalid]) => invalid)
        .map(([field]) => field);

      logger.warn(
        { endpoint: "/op2p_api/requisites", itemIndex, invalidFields },
        "OnlyP2P returned an invalid requisite payload",
      );

      throw new AppError({
        statusCode: 502,
        code: "ONLY_P2P_INVALID_RESPONSE",
        message: "External service returned an invalid requisite",
        details: { invalidFields },
      });
    }

    return {
      requisiteId,
      card: typeof requisite.card === "string" ? requisite.card : "-",
      phone: typeof requisite.phone === "string" ? requisite.phone : "-",
      fio: requisite.fio,
      bank: requisite.bank,
      bankId,
      tier1: requisite.tier_1,
      status,
      method,
      minAmount,
      maxAmount,
      limitAmount,
      limitAmountMinutes,
      exactAmountOnly: requisite.exact_amount_only ?? false,
    };
  });
}

function parseOnlyP2PRequestsResponse(raw: unknown): OnlyP2PRequest[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { data?: unknown }).data)) {
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid requests response" });
  }

  return (raw as { data: unknown[] }).data.map((item) => {
    if (!item || typeof item !== "object") {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid request" });
    }

    const request = item as Record<string, unknown>;
    const method = request.method;
    const status = request.status;
    const receivedRubAmount = request.received_rub_amount;
    const deadline = request.deadline;
    const dateFinished = request.date_finished;

    if (
      typeof request.id !== "string" ||
      request.id.length === 0 ||
      typeof request.amount_rub !== "number" ||
      typeof receivedRubAmount !== "number" && receivedRubAmount !== null ||
      typeof request.requisite_id !== "number" ||
      !Number.isSafeInteger(request.requisite_id) ||
      typeof request.requisite !== "string" ||
      typeof request.fio !== "string" ||
      typeof request.bank !== "string" ||
      method !== "card" && method !== "sbp" ||
      status !== "waiting" && status !== "cancelled" && status !== "finished" ||
      typeof request.awaiting_proof !== "boolean" ||
      typeof deadline !== "string" && deadline !== null ||
      typeof request.created !== "string" ||
      typeof dateFinished !== "string" && dateFinished !== null
    ) {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid request" });
    }

    return {
      id: request.id,
      amountRub: request.amount_rub,
      receivedRubAmount,
      requisiteId: request.requisite_id,
      requisite: request.requisite,
      fio: request.fio,
      bank: request.bank,
      method,
      status,
      awaitingProof: request.awaiting_proof,
      deadline,
      created: request.created,
      dateFinished,
    };
  });
}

function parseOnlyP2PSupportMessagesResponse(raw: unknown): OnlyP2PSupportMessage[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { data?: unknown }).data)) {
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid support response" });
  }

  return (raw as { data: unknown[] }).data.map((item) => {
    if (!item || typeof item !== "object") {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid support message" });
    }

    const message = item as Record<string, unknown>;
    if (
      typeof message.id !== "number" || !Number.isSafeInteger(message.id) ||
      typeof message.user_id !== "number" && typeof message.user_id !== "string" ||
      typeof message.from_operator !== "boolean" ||
      typeof message.text !== "string" ||
      typeof message.created !== "string"
    ) {
      throw new AppError({ statusCode: 502, code: "ONLY_P2P_INVALID_RESPONSE", message: "External service returned an invalid support message" });
    }

    return {
      id: message.id,
      externalUserId: String(message.user_id),
      fromOperator: message.from_operator,
      text: message.text,
      created: message.created,
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
      error?: unknown;
      data?: unknown;
    };

    if (responseData.success !== true) {
      const externalError = responseData.error;
      throw onlyP2PError(typeof externalError === "string" ? externalError : undefined);
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

export async function getOnlyP2PRequests(
  externalUserId: string,
  status?: OnlyP2PRequestStatus,
): Promise<OnlyP2PRequest[]> {
  return parseOnlyP2PRequestsResponse(await postOnlyP2P("/op2p_api/requests", {
    user_id: externalUserId,
    ...(status ? { status } : {}),
  }));
}

export async function confirmOnlyP2PRequest(
  externalUserId: string,
  requestId: string,
  amount?: number,
): Promise<void> {
  await postOnlyP2P("/op2p_api/request_confirm", {
    user_id: externalUserId,
    request_id: requestId,
    ...(amount !== undefined ? { amount } : {}),
  });
}

export async function sendOnlyP2PRequestProof(
  externalUserId: string,
  requestId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string },
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.onlyP2P.timeoutMs);
  try {
    const form = new FormData();
    form.append("api_id", config.onlyP2P.apiId);
    form.append("secret_key", config.onlyP2P.secretKey);
    form.append("user_id", externalUserId);
    form.append("request_id", requestId);
    form.append("file", new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
    const response = await fetch(buildOnlyP2PUrl("/op2p_api/request_proof"), { method: "POST", body: form, signal: controller.signal });
    const rawBody = await response.text();
    if (!response.ok) throw new AppError({ statusCode: 502, code: "ONLY_P2P_REQUEST_FAILED", message: "External service request failed" });
    const baseResponse = parseOnlyP2PBaseResponse(rawBody);
    if (!baseResponse.success) throw onlyP2PError(baseResponse.error);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({ statusCode: 502, code: "ONLY_P2P_UNAVAILABLE", message: "External service is unavailable", isOperational: true });
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendOnlyP2PSupportMessage(externalUserId: string, text: string): Promise<void> {
  await postOnlyP2P("/op2p_api/support_send", {
    user_id: externalUserId,
    text,
  });
}

export async function getOnlyP2PSupportMessages(
  externalUserId: string,
  afterId?: number,
): Promise<OnlyP2PSupportMessage[]> {
  return parseOnlyP2PSupportMessagesResponse(await postOnlyP2P("/op2p_api/support_messages", {
    user_id: externalUserId,
    ...(afterId !== undefined ? { after_id: afterId } : {}),
  }));
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
      throw onlyP2PError(typeof responseData.error === "string" ? responseData.error : undefined);
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
