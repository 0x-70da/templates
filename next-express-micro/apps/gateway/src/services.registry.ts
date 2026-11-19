// src/services.registry.ts
export type Access = "public" | "optional" | "required" | "admin";

export const services = [
  { name: "auth", prefix: "/api/auth", urlEnv: "AUTH_SERVICE_URL", access: "public" },
  { name: "test", prefix: "/api/test", urlEnv: "TEST_SERVICE_URL", access: "required" },
  // <generator:services>
] as const satisfies ReadonlyArray<{
  name: string;
  prefix: string;
  urlEnv: string;
  access: Access;
}>;

export function serviceUrl(urlEnv: string): string {
  const value = process.env[urlEnv];
  if (!value) throw new Error(`${urlEnv} is not set`);
  return value;
}
