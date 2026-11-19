export type ApiBody<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type ApiResponse<T> = ApiBody<T> & {
  status: number;
  statusText: string;
  url: string;
  ok: boolean;
  headers: Headers;
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// المتصفح: same-origin /api/* (Next rewrite → gateway). السيرفر (RSC/SSR): عنوان الـ gateway كامل
const apiBase = (): string =>
  typeof window === "undefined" ? (process.env.GATEWAY_URL ?? "") : "";

async function request<T>(
  method: Method,
  url: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const response: Response = await fetch(`${apiBase()}/api${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json().catch(() => ({
    success: response.ok,
    message: response.statusText,
  }))) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
}

export const get = <T>(url: string, options?: RequestInit) =>
  request<T>("GET", url, undefined, options);
export const post = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>("POST", url, body, options);
export const put = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>("PUT", url, body, options);
export const patch = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>("PATCH", url, body, options);
export const del = <T>(url: string, options?: RequestInit) =>
  request<T>("DELETE", url, undefined, options);
