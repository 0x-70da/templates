// src/serviceClient.ts   (HTTP sync calls بين الـ services)
import { getRequestId } from "./context";
import { AppError } from "./errors";
import type { AuthUser } from "./middlewares/auth.middleware";

export type CallServiceOptions = {
  baseUrl: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
  retries?: number; // GET بس
  user?: AuthUser;
};

const isTimeout = (error: unknown) =>
  error instanceof DOMException && error.name === "TimeoutError";

async function readMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: unknown };
    return typeof data.message === "string" ? data.message : res.statusText;
  } catch {
    return res.statusText;
  }
}

export function createServiceClient(internalSecret: string) {
  return async function callService<T>(options: CallServiceOptions): Promise<T> {
    const { baseUrl, path, method = "GET", body, timeoutMs = 5000, retries = 0, user } = options;
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-internal-secret": internalSecret,
    };
    const requestId = getRequestId();
    if (requestId) headers["x-request-id"] = requestId;
    if (user) {
      headers["x-user-id"] = user.id;
      headers["x-user-role"] = user.role;
    }

    const attempts = method === "GET" ? retries + 1 : 1;
    let lastError = new AppError("Upstream unavailable", 503);

    for (let attempt = 1; attempt <= attempts; attempt++) {
      let res: Response;
      try {
        res = await fetch(new URL(path, baseUrl), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        lastError = isTimeout(error)
          ? new AppError("Upstream timeout", 504)
          : new AppError("Upstream unavailable", 503);
        continue;
      }
      if (res.status === 204) return undefined as T;
      if (res.ok) return (await res.json()) as T;
      const message = await readMessage(res);
      if (res.status < 500) throw new AppError(message, res.status);
      lastError = new AppError(message, 502);
    }
    throw lastError;
  };
}
