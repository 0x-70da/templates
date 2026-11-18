const API_BASE_URL = process.env.API_URL ?? process.env.VITE_API_URL ?? "http://localhost:4000";

export async function request<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
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
    const errorData = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message ?? `HTTP error ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = request;

export const get = <T = unknown>(path: string, options?: RequestInit) =>
  request<T>(path, { ...options, method: "GET" });
