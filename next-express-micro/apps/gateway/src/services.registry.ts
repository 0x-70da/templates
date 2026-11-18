export type ServiceAccess = "public" | "optional" | "required" | "admin";

export const services = [
  { name: "auth", prefix: "/api/auth", urlEnv: "AUTH_SERVICE_URL", access: "public" },
  { name: "test", prefix: "/api/test", urlEnv: "TEST_SERVICE_URL", access: "required" },
  // <generator:services>
] as const satisfies readonly {
  name: string;
  prefix: string;
  urlEnv: string;
  access: ServiceAccess;
}[];
