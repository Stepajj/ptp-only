import { refreshSession } from '@/features/auth/lib/refreshSession';
import { useAuthStore } from '@/features/auth/model/auth.store';

const DEFAULT_API_URL = 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type JsonObject = { [key: string]: unknown };

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: BodyInit | JsonObject | null;
  accessToken?: string;
  headers?: HeadersInit;
};

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !(value instanceof FormData);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed';
  }

  const error = (payload as { error?: unknown }).error;

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }

    const code = (error as { code?: unknown }).code;

    if (typeof code === 'string') {
      return code;
    }
  }

  return 'Request failed';
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const send = async (accessToken: string | undefined) => {
    const url = `${getApiUrl()}${path}`;
    const headers = new Headers(options.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let body: BodyInit | undefined;

    if (options.body instanceof FormData) {
      body = options.body;
    } else if (isJsonObject(options.body)) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    } else if (typeof options.body === 'string') {
      body = options.body;
    } else if (options.body instanceof Blob || options.body instanceof ArrayBuffer) {
      body = options.body;
    }

    const { accessToken: _ignoredAccessToken, body: _ignoredBody, ...fetchOptions } = options;
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body,
      credentials: 'include',
      cache: 'no-store',
    });

    return { response, payload: await parseResponseBody(response) };
  };

  const originalAccessToken = options.accessToken;
  let { response, payload } = await send(originalAccessToken);

  if (response.status === 401 && originalAccessToken && !path.startsWith('/auth/refresh')) {
    const currentAccessToken = useAuthStore.getState().accessToken;
    const replacementToken =
      currentAccessToken && currentAccessToken !== originalAccessToken
        ? currentAccessToken
        : await refreshSession();

    if (replacementToken) {
      ({ response, payload } = await send(replacementToken));
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(payload);
    const code =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error?: { code?: unknown } }).error?.code
        : undefined;

    throw new ApiError(
      message,
      response.status,
      typeof code === 'string' ? code : undefined,
    );
  }

  return payload as T;
}
