// apps/test-service/src/server.ts
import { startServer } from "@workspace/service-kit";
import { app } from "./app";
import { env } from "./env";

startServer({ app, name: "test-service", port: env.PORT });
