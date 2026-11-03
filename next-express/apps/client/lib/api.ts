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

export const get = async <T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api${url}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      credentials: "include",
    },
  );
  const responseBody: ApiBody<T> = await response.json();
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  } as ApiResponse<T>;
};

export const post = async <T, U>(
  url: string,
  body?: U,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api${url}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...options,
      credentials: "include",
    },
  );
  const responseBody: ApiBody<T> = await response.json();
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  } as ApiResponse<T>;
};

export const put = async <T, U>(
  url: string,
  body: U,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api${url}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      ...options,
      credentials: "include",
    },
  );
  const responseBody: ApiBody<T> = await response.json();
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  } as ApiResponse<T>;
};

export const patch = async <T, U>(
  url: string,
  body: U,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api${url}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      ...options,
      credentials: "include",
    },
  );
  const responseBody: ApiBody<T> = await response.json();
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  } as ApiResponse<T>;
};

export const del = async <T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api${url}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      credentials: "include",
    },
  );
  const responseBody: ApiBody<T> = await response.json();
  return {
    ...responseBody,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    headers: response.headers,
  } as ApiResponse<T>;
};
