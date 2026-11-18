import { AppError, GatewayTimeoutError, ServiceUnavailableError } from "./errors.js";
import { getRequestContext } from "./context.js";

export async function callService<T>(options: {
  baseUrl: string;
  path: string;
  method?: string;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  forwardUser?: { id: string; role?: string };
}): Promise<T> {
  const method = options.method ?? "GET";
  const attempts = method === "GET" ? (options.retries ?? 0) + 1 : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const headers: Record<string, string> = {
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
        "x-request-id": getRequestContext()?.requestId ?? "",
      };
      if (options.body !== undefined) headers["content-type"] = "application/json";
      if (options.forwardUser) {
        headers["x-user-id"] = options.forwardUser.id;
        if (options.forwardUser.role) headers["x-user-role"] = options.forwardUser.role;
      }
      const response = await fetch(new URL(options.path, options.baseUrl), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(options.timeoutMs ?? 5000),
      });
      if (response.ok) return (await response.json()) as T;
      if (response.status >= 500 && attempt + 1 < attempts) continue;
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (response.status >= 500) throw new ServiceUnavailableError(body.message);
      throw new AppError(body.message ?? "Upstream request failed", response.status);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DOMException && error.name === "TimeoutError")
        throw new GatewayTimeoutError();
      if (attempt + 1 < attempts) continue;
      throw new ServiceUnavailableError("Upstream request failed", error);
    }
  }
  throw new ServiceUnavailableError();
}
