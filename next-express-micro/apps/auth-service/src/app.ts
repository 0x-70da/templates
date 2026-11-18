import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { createApp, requireInternal } from "@workspace/service-kit";
import router from "./routes/index.js";

export default createApp({
  name: "auth-service",
  routes: router,
  beforeBody: (app) => {
    app.all("/api/auth/*splat", requireInternal(), toNodeHandler(auth));
  },
});
