const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function request<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as ApiResponse;
    throw new Error(errorData.message ?? `HTTP error ${res.status}`);
  }

  return (await res.json()) as ApiResponse<T>;
}

export const get = <T = unknown>(path: string, options?: RequestInit) =>
  request<T>(path, { ...options, method: "GET" });

export const post = <T = unknown>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

export const put = <T = unknown>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

export const patch = <T = unknown>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

export const del = <T = unknown>(path: string, options?: RequestInit) =>
  request<T>(path, { ...options, method: "DELETE" });
