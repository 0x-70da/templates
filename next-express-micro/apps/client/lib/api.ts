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

export const get = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(`/api${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json()) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
};

export const post = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(`/api${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json()) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
};

export const put = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(`/api${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json()) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
};

export const patch = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(`/api${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json()) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
};

export const del = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(`/api${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
    credentials: "include",
  });
  const responseBody = (await response.json()) as ApiBody<T>;
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  };
};
