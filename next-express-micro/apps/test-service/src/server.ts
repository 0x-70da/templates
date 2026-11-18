import "dotenv/config";
import {
  baseEnvSchema,
  connectEvents,
  createLogger,
  loadEnv,
  redisEnvSchema,
  startServer,
} from "@workspace/service-kit";
import { z } from "zod";
import app from "./app.js";
import { createTestCreatedSubscriber } from "./subscribers/test/test.subscriber.js";

const env = loadEnv(
  baseEnvSchema.merge(redisEnvSchema).extend({
    DATABASE_URL: z.string().url(),
  }),
);
const events = connectEvents({ redisUrl: env.REDIS_URL, serviceName: "test" });
events.subscribe("test.created", createTestCreatedSubscriber(createLogger("test-service")));
await events.start();
startServer({
  app,
  name: "test-service",
  port: env.PORT || 4002,
  onShutdown: () => events.close(),
});
