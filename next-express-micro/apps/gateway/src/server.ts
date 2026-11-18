import "dotenv/config";
import { startServer } from "@workspace/service-kit";
import { app, env } from "./app.js";

startServer({
  app,
  name: "gateway",
  port: Number(env.PORT ?? 4000),
  onShutdown: async () => {
    await app.locals.redis.quit();
  },
});
