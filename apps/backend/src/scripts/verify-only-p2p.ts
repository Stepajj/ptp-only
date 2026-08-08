import {
  createOnlyP2PClient,
  getOnlyP2PBalance,
  getOnlyP2PBanks,
  topupOnlyP2P,
  type OnlyP2PTopupMethod,
} from "../integrations/only-p2p/only-p2p.client";

interface CapturedRequest {
  url: string;
  method: string;
  body: unknown;
}

const validMethods = new Set<OnlyP2PTopupMethod>([
  "btc",
  "ltc",
  "usdt",
  "cb",
  "xr",
]);

function fail(message: string): never {
  console.error(`Only P2P verification failed: ${message}`);
  process.exit(1);
}

function getTestUserId(): string {
  const userId = process.env.ONLY_P2P_TEST_USER_ID;

  if (!userId) {
    fail("set ONLY_P2P_TEST_USER_ID to an existing Only P2P client ID");
  }

  return userId;
}

function redactRequest(
  input: unknown,
  init?: { method?: string; body?: unknown },
): CapturedRequest {
  const parsedBody: unknown = typeof init?.body === "string"
    ? JSON.parse(init.body) as unknown
    : init?.body;
  const body = parsedBody && typeof parsedBody === "object"
    ? { ...(parsedBody as Record<string, unknown>), secret_key: "[REDACTED]" }
    : parsedBody;

  return {
    url: String(input),
    method: init?.method ?? "GET",
    body,
  };
}

async function main(): Promise<void> {
  const [command, methodArgument, amountArgument] = process.argv.slice(2);
  if (command !== "create" && command !== "balance" && command !== "banks" && command !== "topup") {
    fail("usage: npm run verify:only-p2p -- create | balance | banks | topup <btc|ltc|usdt|cb|xr> [amount]");
  }

  const originalFetch = globalThis.fetch;
  let request: CapturedRequest | undefined;
  let responseBody: string | undefined;

  globalThis.fetch = async (...args) => {
    const [input, init] = args;
    request = redactRequest(input, init);
    const response = await originalFetch(...args);
    responseBody = await response.clone().text();
    return response;
  };

  try {
    let applicationResult: unknown;

    if (command === "create") {
      applicationResult = await createOnlyP2PClient();
    } else if (command === "balance") {
      applicationResult = await getOnlyP2PBalance(getTestUserId());
    } else if (command === "banks") {
      applicationResult = await getOnlyP2PBanks();
    } else {
      applicationResult = await runTopup(
        getTestUserId(),
        methodArgument,
        amountArgument,
      );
    }

    console.log(JSON.stringify({ request, onlyP2PResponse: responseBody, applicationResult }, null, 2));
  } catch (error) {
    const appError = error instanceof Error
      ? { name: error.name, message: error.message, code: "code" in error ? error.code : undefined }
      : error;
    console.log(JSON.stringify({ request, onlyP2PResponse: responseBody, applicationError: appError }, null, 2));
    process.exitCode = 1;
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function runTopup(
  userId: string,
  methodArgument: string | undefined,
  amountArgument: string | undefined,
) {
  if (!methodArgument || !validMethods.has(methodArgument as OnlyP2PTopupMethod)) {
    fail("topup requires one of: btc, ltc, usdt, cb, xr");
  }

  const amount = amountArgument === undefined ? undefined : Number(amountArgument);
  if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) {
    fail("amount must be a finite positive number");
  }

  return topupOnlyP2P(userId, methodArgument as OnlyP2PTopupMethod, amount);
}

void main();
