// src/server.ts
import { startServer } from "@workspace/service-kit";
import { createGatewayApp } from "./app";
import { env } from "./env";

startServer({ app: createGatewayApp(), name: "gateway", port: env.PORT });
